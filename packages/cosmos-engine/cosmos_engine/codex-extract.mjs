#!/usr/bin/env node
// Extraction uses the CLI's own signed-in account; credentials are never read or copied.
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let workspace;
try {
  const { Codex } = await import('@openai/codex-sdk').catch(() => import(join(process.env.COSMOS_PROJECT_ROOT || process.cwd(), 'node_modules/@openai/codex-sdk/dist/index.js')));
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 2_000_000) throw new Error('oversized input');
  }
  const request = JSON.parse(input);
  if (typeof request.prompt !== 'string') throw new Error('missing prompt');
  workspace = await mkdtemp(join(tmpdir(), 'cosmos-extract-'));
  const env = { ...process.env };
  for (const key of ['OPENAI_API_KEY', 'CODEX_API_KEY', 'COSMOS_LLM_API_KEY', 'OPENAI_BASE_URL']) delete env[key];
  const codex = new Codex({
    env,
    configOverrides: [
      'forced_login_method="chatgpt"', 'model_provider="openai"', 'suppress_unstable_features_warning=true',
      'mcp_servers={}', 'plugins={}',
      'features.shell_tool=false', 'features.unified_exec=false',
      'features.code_mode=false', 'features.apps=false', 'features.view_image=false', 'features.search_tool=false',
      'features.multi_agent=false', 'features.apply_patch_freeform=false', 'features.hooks=false',
      'features.skip_host_skill_discovery=true',
    ],
  });
  const options = {
    workingDirectory: workspace, skipGitRepoCheck: true,
    sandboxMode: 'read-only', approvalPolicy: 'never',
    networkAccessEnabled: false, webSearchMode: 'disabled',
  };
  if (process.env.COSMOS_CODEX_MODEL) options.model = process.env.COSMOS_CODEX_MODEL;
  const thread = codex.startThread(options);
  const content = [{ type: 'text', text: request.prompt }];
  if (request.imagePath) content.push({ type: 'local_image', path: request.imagePath });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 110_000);
  try {
    const run = await thread.runStreamed(content, { signal: controller.signal });
    let final = '';
    for await (const event of run.events) {
      if (event.type === 'error' || event.type === 'turn.failed') throw new Error(event.error?.message || event.message || 'provider failed');
      if (event.type === 'item.started' || event.type === 'item.completed') {
        if (event.item.type === 'error') continue; // CLI warnings also use error items; fatal failures have turn.failed.
        if (!['agent_message', 'reasoning'].includes(event.item.type)) {
          controller.abort();
          throw new Error(event.item.type === 'error' ? event.item.message : 'unsupported item during extraction: ' + event.item.type);
        }
        if (event.type === 'item.completed' && event.item.type === 'agent_message') final = event.item.text;
      }
    }
    const result = JSON.parse(final);
    process.stdout.write(JSON.stringify(result));
  } finally {
    clearTimeout(timer);
  }
} catch (error) {
  const detail = String(error?.message || '');
  let code = 'provider-failed';
  if (['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND', 'ERR_PACKAGE_PATH_NOT_EXPORTED'].includes(error?.code)) code = 'runtime-unavailable';
  else if (/auth|login|sign.?in|401|403|chatgpt.*account/i.test(detail)) code = 'authentication';
  else if (/model.*(not|unknown|unsupported|available)|unsupported.*model/i.test(detail)) code = 'model-unavailable';
  else if (/config|toml|unknown feature|invalid.*argument/i.test(detail)) code = 'configuration';
  else if (/quota|limit|429|usage/i.test(detail)) code = 'usage-limit';
  else if (/abort|timeout|timed out/i.test(detail)) code = 'timeout';
  else if (/JSON|Unexpected token|Unexpected end/i.test(detail)) code = 'invalid-json';
  else if (/unsupported item|tool use/i.test(detail)) code = 'forbidden-tool-use';
  else if (/ENOENT|executable|spawn|Cannot find module/i.test(detail)) code = 'runtime-unavailable';
  process.stderr.write(JSON.stringify({ error: { code } }) + '\n');
  process.exitCode = 1;
} finally {
  if (workspace) await rm(workspace, { recursive: true, force: true });
}
