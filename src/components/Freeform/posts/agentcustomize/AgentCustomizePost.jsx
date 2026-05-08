const css = {
  section: "pt-8 sm:pt-[52px]",
  secLabel:
    "font-mono text-[9px] tracking-[0.2em] uppercase text-[#656d76] dark:text-[#8b949e] mb-2.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-[#d0d7de] dark:after:bg-[#30363d]",
  h2: "text-[clamp(18px,2.5vw,26px)] font-bold mb-3 sm:mb-[18px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.22] tracking-[-0.01em]",
  h3: "text-[15px] sm:text-[17px] font-bold mb-3 text-[#1f2328] dark:text-[#e6edf3]",
  p: "text-[13.5px] sm:text-[14.5px] text-[#1f2328] dark:text-[#e6edf3] mb-4 leading-[1.82]",
  divider: "h-px bg-[#d0d7de] dark:bg-[#30363d] mt-6 sm:mt-9",
  code: "font-mono text-[11px] sm:text-[12px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[4px] px-[5px] py-px text-[#0969da] dark:text-[#58a6ff]",
  pre: "bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-[3px] border-l-[#0969da] dark:border-l-[#58a6ff] rounded-r-[6px] rounded-l-none px-5 py-4 my-3.5 text-[12px] font-mono text-[#1f2328] dark:text-[#e6edf3] overflow-x-auto whitespace-pre leading-[1.8]",
  th: "font-mono text-[9.5px] uppercase tracking-[0.1em] text-[#656d76] dark:text-[#8b949e] text-left px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]",
  td: "px-4 py-[11px] border-b border-[#d8dee4] dark:border-[#30363d] text-[13.5px] text-[#1f2328] dark:text-[#e6edf3]",
};

const SectionDivider = () => <div className={css.divider} />;

const Callout = ({ type = "info", title, children }) => {
  const bar = {
    info:    "border-l-[#0969da] dark:border-l-[#58a6ff]",
    tip:     "border-l-[#1a7f37] dark:border-l-[#3fb950]",
    warning: "border-l-[#bc4c00]",
  };
  return (
    <div className={`bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-l-4 ${bar[type]} rounded-r-[10px] rounded-l-none px-5 py-4 my-5`}>
      {title && <div className="font-bold text-[13.5px] text-[#1f2328] dark:text-[#e6edf3] mb-1.5">{title}</div>}
      <div className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.78]">{children}</div>
    </div>
  );
};

const ConceptCard = ({ icon, title, color, children }) => (
  <div
    className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-t-[3px] rounded-[10px] p-[22px] transition-[border-color] duration-200 cursor-default"
    style={{ borderTopColor: color }}
  >
    <span className="block text-[1.8em] mb-[10px]">{icon}</span>
    <h4 className="font-bold text-[1em] text-[#1f2328] dark:text-[#e6edf3] mb-[8px] mt-0">{title}</h4>
    <p className="text-[0.88em] text-[#656d76] dark:text-[#8b949e] m-0 leading-[1.72]">{children}</p>
  </div>
);

const FlowStep = ({ label, sub, color = "#0969da" }) => (
  <div
    className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg px-4 py-3 min-w-[110px] text-center shadow-[0_1px_3px_rgba(31,35,40,0.06)]"
    style={{ borderTopColor: color, borderTopWidth: "2px" }}
  >
    <div className="font-bold text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.3]">{label}</div>
    {sub && <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] mt-1 leading-[1.4] whitespace-pre-line">{sub}</div>}
  </div>
);

const Table = ({ headers, rows }) => (
  <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>{headers.map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
              {cells.map((cell, j) => (
                <td key={j} className={`${css.td} ${j === 0 ? "font-semibold" : ""} ${i === rows.length - 1 ? "border-b-0" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   AgentCustomizePost — AI 코딩 에이전트 커스터마이징 가이드
   Instructions · Skills · Spec · Hooks
   ═══════════════════════════════════════════════════════════════════ */

const AgentCustomizePost = () => (
  <div
    className="text-[#1f2328] dark:text-[#e6edf3] text-[15px] leading-[1.7]"
    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}
  >
    {/* ═══ 1. 개요 ═══ */}
    <div className={css.section}>
      <div className={css.secLabel}>§ 1 · 개요</div>
      <h2 id="overview" className={css.h2}>에이전트를 내 프로젝트에 맞추는 네 가지 방법</h2>
      <p className={css.p}>
        AI 코딩 에이전트(GitHub Copilot, Claude Code 등)는 기본 상태에서도 유용하지만,
        프로젝트에 맞게 <strong>커스터마이징</strong>하면 훨씬 정확하고 일관된 결과를 얻을 수 있습니다.
        커스터마이징은 크게 네 가지 레이어로 나뉩니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px] mt-5 mb-8">
        <ConceptCard icon="📋" title="Instructions" color="#0969da">
          에이전트의 <strong>행동 규칙</strong>을 정의합니다.
          코딩 표준, 컨벤션, 프로젝트 구조 등 항상 따라야 할 지침입니다.
        </ConceptCard>
        <ConceptCard icon="🧩" title="Skills" color="#8250df">
          <strong>어떻게 하는가(How)</strong>를 캡슐화한 재사용 가능한 워크플로우 패키지입니다.
        </ConceptCard>
        <ConceptCard icon="📐" title="Spec" color="#bc4c00">
          <strong>무엇을 만드는가(What)</strong>를 정의하는 설계 명세 문서입니다.
        </ConceptCard>
        <ConceptCard icon="⚡" title="Hooks" color="#1a7f37">
          에이전트 라이프사이클에 바인딩되는 <strong>자동 실행 스크립트</strong>입니다.
        </ConceptCard>
      </div>
    </div>

    {/* ═══ 2. Instructions ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 2 · Instructions</div>
      <h2 id="instructions" className={css.h2}>Instructions — 행동 규칙 정의</h2>
      <p className={css.p}>
        Instructions는 에이전트가 코드를 작성할 때 따라야 할{" "}
        <strong>코딩 표준과 가이드라인</strong>을 자연어로 정의한 것입니다.
        마크다운 텍스트로만 구성되며, 별도의 스크립트나 실행 가능한 리소스를 포함하지 않습니다.
      </p>

      <h3 className={css.h3}>에이전트별 지시 파일</h3>
      <p className={css.p}>
        다양한 에이전트 벤더들이 각자의 파일 형식을 사용합니다.
        본질은 동일 — "에이전트에게 프로젝트 규칙을 전달" — 하지만,
        <strong>어떤 에이전트가 읽느냐</strong>에 따라 파일명이 다릅니다.
      </p>
      <Table
        headers={["파일", "대상", "핵심 특징"]}
        rows={[
          [<span className="font-mono text-[11px] text-[#0969da] dark:text-[#58a6ff]">copilot-instructions.md</span>, "GitHub Copilot", "레포 전체 적용. applyTo glob으로 파일별 분기 가능"],
          [<span className="font-mono text-[11px] text-[#8250df] dark:text-[#bc8cff]">CLAUDE.md</span>, "Claude Code", "디렉터리 트리 따라 수집. @import 지원. Auto memory 연동"],
          [<span className="font-mono text-[11px] text-[#1a7f37] dark:text-[#3fb950]">AGENTS.md</span>, "공용 (오픈 포맷)", "에이전트 불문. Copilot이 읽고, Claude는 @import로 참조 가능"],
        ]}
      />

      <h3 className={css.h3}>파일 경로별 적용 예시 (Copilot)</h3>
      <pre className={css.pre}>{`# .github/instructions/react-components.instructions.md
---
applyTo: "src/components/**/*.tsx"
---

- 함수형 컴포넌트만 사용
- Props는 반드시 interface로 정의
- useEffect 의존성 배열을 명시적으로 작성`}</pre>

      <h3 className={css.h3}>CLAUDE.md 레벨별 스코프</h3>
      <Table
        headers={["스코프", "위치", "용도"]}
        rows={[
          ["조직 정책", "OS별 시스템 경로", "회사 전체 코딩 표준, 보안 정책"],
          ["프로젝트", "./CLAUDE.md", "팀 공유 프로젝트 규칙"],
          ["사용자", "~/.claude/CLAUDE.md", "개인 선호 설정"],
          ["로컬", "./CLAUDE.local.md", "개인 프로젝트별 설정 (.gitignore 권장)"],
        ]}
      />

      <Callout type="tip" title="💡 AGENTS.md 활용 팁">
        Claude Code는 <code className={css.code}>AGENTS.md</code>를 직접 읽지 않지만,{" "}
        <code className={css.code}>CLAUDE.md</code>에서{" "}
        <code className={css.code}>@AGENTS.md</code>로 import하면
        하나의 지시사항을 Copilot과 Claude Code가 공유할 수 있습니다.
      </Callout>
    </div>

    {/* ═══ 3. Skills ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 3 · Skills</div>
      <h2 id="skills" className={css.h2}>Skills — 재사용 가능한 워크플로우</h2>
      <p className={css.p}>
        Skills는 에이전트의 능력을 확장하는{" "}
        <strong>재사용 가능한 워크플로우 패키지</strong>입니다.
        "특정 작업을 어떻게 수행하는가(How)"를 캡슐화하며,{" "}
        <a href="https://agentskills.io/" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
          오픈 스탠다드(agentskills.io)
        </a>
        로 공개되어 GitHub Copilot, Claude Code 등 여러 에이전트에서 사용됩니다.
      </p>

      <h3 className={css.h3}>폴더 구조</h3>
      <pre className={css.pre}>{`my-skill/
├── SKILL.md          # 필수: YAML frontmatter + 지시사항
├── scripts/          # 선택: 실행 가능한 코드
├── references/       # 선택: 참고 문서
└── assets/           # 선택: 템플릿, 리소스`}</pre>

      <h3 className={css.h3}>SKILL.md 예시</h3>
      <pre className={css.pre}>{`---
name: webapp-testing
description: Playwright를 사용한 웹 앱 테스트 가이드.
---

# Web Application Testing with Playwright

## 이 스킬을 사용할 때
- 새로운 Playwright 테스트 작성 시
- 실패하는 브라우저 테스트 디버깅 시

## 테스트 작성 절차
1. [테스트 템플릿](./test-template.js) 참고
2. 테스트할 사용자 플로우 식별
3. tests/ 디렉터리에 새 테스트 파일 생성`}</pre>

      <h3 className={css.h3}>핵심: Progressive Disclosure (점진적 로딩)</h3>
      <p className={css.p}>Skills의 가장 중요한 특징은 <strong>필요할 때만 로드</strong>된다는 것입니다.</p>
      <div className="flex items-center justify-center gap-2 bg-[#eaeef2] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-5 py-5 mb-5 overflow-x-auto">
        {[
          { label: "1. Discovery",  sub: "이름+설명만 로드\n~100 토큰" },
          { label: "2. Activation", sub: "SKILL.md 본문 로드\n<5000 토큰 권장" },
          { label: "3. Execution",  sub: "참조된 리소스만\non-demand 로드" },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex items-center gap-2 shrink-0">
            <FlowStep label={s.label} sub={s.sub} color="#8250df" />
            {i < arr.length - 1 && <span className="text-[#8250df] dark:text-[#bc8cff] text-[18px]">→</span>}
          </div>
        ))}
      </div>
      <p className={css.p}>이 방식 덕분에 수백 개의 Skills를 설치해도 컨텍스트를 낭비하지 않습니다.</p>

      <h3 className={css.h3}>저장 위치</h3>
      <Table
        headers={["유형", "위치"]}
        rows={[
          ["프로젝트 스킬", <span className="font-mono text-[11px] text-[#0969da] dark:text-[#58a6ff]">.github/skills/ · .claude/skills/ · .agents/skills/</span>],
          ["개인 스킬", <span className="font-mono text-[11px] text-[#0969da] dark:text-[#58a6ff]">~/.copilot/skills/ · ~/.claude/skills/ · ~/.agents/skills/</span>],
        ]}
      />

      <h3 className={css.h3}>호출 제어 옵션</h3>
      <Table
        headers={["설정", "/ 커맨드", "자동 로드", "용도"]}
        rows={[
          [<span className="font-mono text-[11px]">기본값</span>, "✅", "✅", "범용 스킬"],
          [<span className="font-mono text-[11px]">user-invocable: false</span>, "❌", "✅", "백그라운드 지원 스킬"],
          [<span className="font-mono text-[11px]">disable-model-invocation: true</span>, "✅", "❌", "수동 호출 전용"],
        ]}
      />

      <Callout type="warning" title="⚠️ Skills ≠ MCP 도구">
        Skills는 MCP 서버나 새로운 도구를 만드는 것이 아닙니다.
        이미 에이전트에 설치된 도구들을 <strong>"언제, 어떤 순서로, 어떻게 조합할지"</strong>{" "}
        알려주는 <strong>레시피</strong>입니다. 도구가 "칼과 오븐"이라면, Skills는 그 도구들로 요리하는 "레시피 카드"입니다.
      </Callout>
    </div>

    {/* ═══ 4. Spec ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 4 · Spec</div>
      <h2 id="spec" className={css.h2}>Spec — 설계 명세</h2>
      <p className={css.p}>
        Spec은 에이전트에게 <strong>"무엇을 만들어야 하는가(What)"</strong>를 전달하는
        설계 문서입니다. 시스템 아키텍처, 인터페이스 정의, 요구사항 등{" "}
        <strong>구현 목표와 제약</strong>을 명세합니다.
      </p>

      <h3 className={css.h3}>Spec이 다루는 것</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: "🏗️", title: "아키텍처 정의", desc: "모듈 구조, 데이터 흐름, 시스템 경계를 설명합니다." },
          { icon: "📝", title: "인터페이스 명세", desc: "API 계약, 타입 정의, 입출력 스키마를 규정합니다." },
          { icon: "🎯", title: "요구사항·제약", desc: "기능 요건, 비기능 요건, 제약 조건을 정의합니다." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-[#fff1e5] dark:bg-[#2c1a0f] border border-[#ffa657] dark:border-[#b85c00] rounded-[10px] px-5 py-5">
            <div className="text-[20px] mb-2">{icon}</div>
            <div className="font-bold text-[14px] text-[#bc4c00] mb-1.5">{title}</div>
            <p className="text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.72] mb-0">{desc}</p>
          </div>
        ))}
      </div>

      <h3 className={css.h3}>Spec 예시</h3>
      <pre className={css.pre}>{`# RCAFlow 파이프라인 설계 명세

## 모듈 구성
- Collector: 로그/메트릭/트레이스 수집 (OpenTelemetry)
- Analyzer: 이상 탐지 및 근본 원인 분석 (causal graph)
- Reporter: Slack/PagerDuty 알림 + 대시보드 렌더링

## 인터페이스
Collector → Analyzer: RawEvent[] (JSON Lines, max 10MB/batch)
Analyzer → Reporter: RCAResult { root_cause, confidence, evidence[] }

## 제약 사항
- 분석 지연 시간: < 30초 (P95)
- Python 3.11+, FastAPI, 외부 DB 의존 금지`}</pre>

      <h3 className={css.h3}>Spec을 배치하는 방법</h3>
      <p className={css.p}>
        Spec은 아직 표준화된 파일 형식이 없습니다.
        프로젝트 상황에 맞게 유연하게 배치할 수 있습니다.
      </p>
      <Table
        headers={["방식", "위치", "장점"]}
        rows={[
          ["Instructions 내 포함", <span className="font-mono text-[11px] text-[#bc4c00]">CLAUDE.md / copilot-instructions.md</span>, "별도 파일 없이 바로 전달"],
          ["별도 문서로 분리", <span className="font-mono text-[11px] text-[#bc4c00]">docs/spec/ 또는 프로젝트 루트</span>, "버전 관리·리뷰 용이"],
          ["Skill에서 참조", <span className="font-mono text-[11px] text-[#bc4c00]">SKILL.md 내 references/</span>, "Skill 로드 시 함께 제공"],
        ]}
      />

      <h3 className={css.h3}>Skill과 Spec의 차이</h3>
      <p className={css.p}>
        둘 다 에이전트에게 맥락을 제공하지만, Skill은 <strong>"절차(How)"</strong>,
        Spec은 <strong>"목표(What)"</strong>에 초점을 맞춥니다.
      </p>
      <Table
        headers={["구분", "Skill", "Spec"]}
        rows={[
          ["성격", "재사용 가능한 레시피", "프로젝트별 설계 문서"],
          ["톤", '"~할 때 이 패턴을 따른다"', '"~를 구현해야 한다"'],
          ["활용 시점", "코딩 중 참조", "설계/계획 단계에서 참조"],
        ]}
      />

      <Callout type="tip" title="💡 실전 팁">
        Spec으로 "무엇을 만들지" 정의하고, Skill로 "어떻게 만들지" 안내하세요.
        Instructions로 전체 코딩 규칙을, Hooks로 자동화를 더하면 완전한 에이전트 환경이 됩니다.
      </Callout>
    </div>

    {/* ═══ 5. Hooks ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 5 · Hooks</div>
      <h2 id="hooks" className={css.h2}>Hooks — 라이프사이클 자동화</h2>
      <p className={css.p}>
        Hooks는 에이전트의 라이프사이클 이벤트에 바인딩되는{" "}
        <strong>셸 스크립트/명령어</strong>입니다. LLM을 거치지 않고{" "}
        <strong>결정론적으로 실행</strong>되므로, 포매팅·보안 차단·로깅 같은 작업에 적합합니다.
      </p>

      <h3 className={css.h3}>라이프사이클 이벤트</h3>
      <Table
        headers={["이벤트", "발생 시점", "대표 활용"]}
        rows={[
          [<span className="font-mono text-[11px] text-[#8250df] dark:text-[#bc8cff]">SessionStart</span>, "새 세션 시작 시", "리소스 초기화, 컨텍스트 주입"],
          [<span className="font-mono text-[11px] text-[#8250df] dark:text-[#bc8cff]">PreToolUse</span>, "도구 호출 전", "위험 명령 차단, 승인 요구"],
          [<span className="font-mono text-[11px] text-[#8250df] dark:text-[#bc8cff]">PostToolUse</span>, "도구 완료 후", "포매터 실행, 결과 로깅"],
          [<span className="font-mono text-[11px] text-[#8250df] dark:text-[#bc8cff]">PreCompact</span>, "컨텍스트 압축 전", "중요 컨텍스트 보존"],
          [<span className="font-mono text-[11px] text-[#8250df] dark:text-[#bc8cff]">Stop</span>, "세션 종료 시", "리포트 생성, 리소스 정리"],
        ]}
      />

      <h3 className={css.h3}>설정 파일 형식</h3>
      <pre className={css.pre}>{`// .github/hooks/security.json
{
  "hooks": {
    "PreToolUse": [{
      "type": "command",
      "command": "./scripts/block-dangerous.sh",
      "timeout": 15
    }],
    "PostToolUse": [{
      "type": "command",
      "command": "npx prettier --write \\"$TOOL_INPUT_FILE_PATH\\""
    }]
  }
}`}</pre>

      <h3 className={css.h3}>PreToolUse 권한 제어</h3>
      <div className="flex items-center justify-center gap-3 bg-[#eaeef2] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-5 py-5 mb-4 overflow-x-auto">
        {[
          { label: "allow", sub: "자동 승인", color: "#1a7f37", bg: "rgba(26,127,55,0.08)" },
          { label: "ask",   sub: "사용자 확인", color: "#bc4c00", bg: "rgba(188,76,0,0.08)" },
          { label: "deny",  sub: "실행 차단",  color: "#cf222e", bg: "rgba(207,34,46,0.08)" },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex items-center gap-3 shrink-0">
            <div className="border-[2px] rounded-lg px-4 py-2 text-center min-w-[80px]" style={{ borderColor: s.color, backgroundColor: s.bg }}>
              <div className="font-mono font-bold text-[13px]" style={{ color: s.color }}>{s.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: s.color, opacity: 0.75 }}>{s.sub}</div>
            </div>
            {i < arr.length - 1 && <span className="text-[#656d76] dark:text-[#8b949e] font-bold">&lt;</span>}
          </div>
        ))}
      </div>
      <p className={css.p}>
        여러 hook이 같은 도구에 대해 실행될 경우, <strong>가장 제한적인 결정이 우선</strong>합니다.
      </p>
    </div>

    {/* ═══ 6. 한눈에 보기 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 6 · 한눈에 보기</div>
      <h2 id="comparison" className={css.h2}>네 가지 레이어 비교</h2>

      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-7">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["", "Instructions", "Skills", "Spec", "Hooks"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["핵심 질문", "어떻게 행동할까", "어떻게 수행할까 (How)", "무엇을 만들까 (What)", "언제 자동 실행할까"],
                ["형태",     "마크다운 텍스트",  "폴더 (SKILL.md + 리소스)", "마크다운/문서 파일",  "JSON + 셸 스크립트"],
                ["로딩",     "Always-on / glob", "On-demand (점진적)",      "수동 참조 / Skill 내 포함", "이벤트 트리거"],
                ["실행",     "LLM이 참고",       "LLM이 호출·참고",         "LLM이 참고",         "OS가 직접 실행"],
                ["재사용성",  "프로젝트 전체",    "프로젝트 간 이식 가능",     "프로젝트별 일회성",   "프로젝트 간 이식 가능"],
              ].map(([item, a, b, c, d], i, arr) => (
                <tr key={item} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-semibold ${i === arr.length - 1 ? "border-b-0" : ""}`}>{item}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{a}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{b}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{c}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className={css.h3}>비유로 이해하기</h3>
      <p className={css.p}>
        에이전트를 <strong>요리사</strong>에 비유하면 네 개념이 명확해집니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { icon: "📋", title: "주방 규칙", desc: '"소금은 마지막에 넣어라" — 항상 지키는 기본 원칙', color: "#0969da" },
          { icon: "🧩", title: "레시피 카드", desc: '"파스타 만들기" — 필요할 때 꺼내 보는 작업 절차', color: "#8250df" },
          { icon: "📐", title: "주문서", desc: '"코스 A, 글루텐 프리" — 무엇을 만들지 정의한 요구사항', color: "#bc4c00" },
          { icon: "⚡", title: "자동화 장비", desc: '"오븐 문 열리면 타이머 시작" — 특정 시점에 기계적으로 작동', color: "#1a7f37" },
        ].map(({ icon, title, desc, color }) => (
          <div key={title} className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-t-[3px] rounded-[10px] px-5 py-5" style={{ borderTopColor: color }}>
            <div className="text-[22px] mb-2">{icon}</div>
            <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-1.5">{title}</div>
            <p className="text-[13px] text-[#656d76] dark:text-[#8b949e] leading-[1.72] mb-0">{desc}</p>
          </div>
        ))}
      </div>
      <Callout type="info" title="🔗 이 네 가지는 보완재입니다">
        Instructions로 규칙을 세우고, Spec으로 목표를 정의하고,
        Skills로 수행 절차를 안내하고, Hooks로 자동화를 거는 것이
        가장 효과적인 에이전트 커스터마이징 조합입니다.
      </Callout>
    </div>

    {/* ═══ 7. 참고 링크 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 7 · 참고 링크</div>
      <h2 id="references" className={css.h2}>참고 링크</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        {[
          {
            title: "공식 문서",
            links: [
              { href: "https://agentskills.io/", label: "Agent Skills 오픈 스탠다드" },
              { href: "https://code.visualstudio.com/docs/copilot/customization/agent-skills", label: "VS Code - Agent Skills" },
              { href: "https://code.visualstudio.com/docs/copilot/customization/hooks", label: "VS Code - Agent Hooks" },
              { href: "https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions", label: "GitHub Docs - Custom Instructions" },
              { href: "https://code.claude.com/docs/en/memory", label: "Claude Code - Memory (CLAUDE.md)" },
            ],
          },
          {
            title: "커뮤니티",
            links: [
              { href: "https://awesome-copilot.github.com/", label: "Awesome GitHub Copilot" },
              { href: "https://github.com/agentsmd/agents.md", label: "AGENTS.md 오픈 포맷" },
              { href: "https://github.com/agentskills/agentskills", label: "Agent Skills GitHub 저장소" },
            ],
          },
        ].map(({ title, links }) => (
          <div key={title} className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-6 py-5 transition-[border-color] duration-200"
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#0969da")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
          >
            <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-3">{title}</div>
            <ul className="list-none p-0 space-y-2">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#0969da] dark:text-[#58a6ff] hover:underline">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="text-center py-10 border-t border-[#d0d7de] dark:border-[#30363d] mt-8">
      <div className="font-mono text-[10px] text-[#656d76] dark:text-[#8b949e]">
        이 문서는 공식 문서 기반으로 정리한 비공식 가이드입니다.
      </div>
      <div className="font-mono text-[10px] text-[#656d76] dark:text-[#8b949e] mt-1">
        공식 문서:{" "}
        <a href="https://agentskills.io/" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">agentskills.io</a>
        {" · "}
        <a href="https://code.visualstudio.com/docs/copilot/customization/overview" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">VS Code Copilot Customization</a>
        {" · "}
        <a href="https://code.claude.com/docs/en/memory" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">Claude Code Memory</a>
      </div>
    </div>
  </div>
);

export default AgentCustomizePost;
