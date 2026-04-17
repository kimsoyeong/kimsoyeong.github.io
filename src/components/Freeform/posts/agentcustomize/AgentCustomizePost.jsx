// ─── 색상 팔레트 (GitHub Light 기반 — 다크 테마의 느낌을 라이트로)
// --bg:  #ffffff        배경
// --sf:  #f6f8fa        서피스 (테이블 헤더, 코드블록)
// --sf2: #eaeef2        딥 서피스 (hover)
// --bd:  #d0d7de        보더 (쿨 그레이)
// --tx:  #1f2328        주 텍스트
// --tx2: #656d76        뮤트 텍스트
// --ac:  #0969da        블루 액센트
// --ac2: #8250df        퍼플
// --ac3: #1a7f37        그린
// --ac4: #bc4c00        오렌지
// --ac5: #cf222e        레드

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

const Tag = ({ type, children }) => {
  const styles = {
    blue:   "bg-[#ddf4ff] dark:bg-[#1c2d3e] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]",
    purple: "bg-[#fbefff] dark:bg-[#271d37] text-[#8250df] dark:text-[#bc8cff] border-[#d2a8ff] dark:border-[#6e40c9]",
    green:  "bg-[#dafbe1] dark:bg-[#162619] text-[#1a7f37] dark:text-[#3fb950] border-[#4ac26b] dark:border-[#238636]",
    amber:  "bg-[#fff1e5] dark:bg-[#2c1a0f] text-[#bc4c00] border-[#ffa657] dark:border-[#b85c00]",
  };
  return (
    <span className={`font-mono text-[10px] border rounded-[4px] px-2 py-0.5 inline-block mr-1 mb-1 ${styles[type] ?? styles.blue}`}>
      {children}
    </span>
  );
};

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

// §7 관계 카드 — 상단 컬러 바
const Card = ({ icon, title, accentColor = "var(--pt-ac)", children }) => (
  <div
    className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] border-t-[3px] rounded-[10px] px-5 py-5"
    style={{ borderTopColor: accentColor }}
  >
    {icon && <div className="text-[22px] mb-2">{icon}</div>}
    <div className="font-bold text-[14px] text-[#1f2328] dark:text-[#e6edf3] mb-1.5">{title}</div>
    <p className="text-[13px] text-[#656d76] dark:text-[#8b949e] leading-[1.72] mb-0">{children}</p>
  </div>
);

// §1 개요 카드 — 원본 .cd 스타일 (균일 보더, hover 시 액센트 색)
const CDCard = ({ icon, title, children }) => (
  <div
    className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] p-[22px] transition-[border-color] duration-200 cursor-default"
    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--pt-ac)")}
    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--pt-bd)")}
  >
    <span className="block text-[1.8em] mb-[10px]">{icon}</span>
    <h4 className="font-bold text-[1em] text-[#1f2328] dark:text-[#e6edf3] mb-[8px] mt-0">{title}</h4>
    <p className="text-[0.88em] text-[#656d76] dark:text-[#8b949e] m-0 leading-[1.72]">{children}</p>
  </div>
);

const FlowStep = ({ label, sub, color = "var(--pt-ac)" }) => (
  <div
    className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg px-4 py-3 min-w-[110px] text-center shadow-[0_1px_3px_rgba(31,35,40,0.06)]"
    style={{ borderTopColor: color, borderTopWidth: "2px" }}
  >
    <div className="font-bold text-[13px] text-[#1f2328] dark:text-[#e6edf3] leading-[1.3]">{label}</div>
    {sub && <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] mt-1 leading-[1.4] whitespace-pre-line">{sub}</div>}
  </div>
);

const AgentCustomizePost = () => (
  <div
    className="text-[#1f2328] dark:text-[#e6edf3] text-[15px] leading-[1.7]"
    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}
  >
    {/* ═══ 1. 전체 개념 개요 ═══ */}
    <div className={css.section}>
      <div className={css.secLabel}>§ 1 · 전체 개념 개요</div>
      <h2 id="overview" className={css.h2}>세 가지 커스터마이징 레이어</h2>
      <p className={css.p}>
        AI 코딩 에이전트(GitHub Copilot, Claude Code 등)의 동작을 커스터마이징하는 방법은
        크게 세 가지 레이어로 나뉩니다. 각각은 서로 다른 목적과 실행 방식을 가지며,
        상호 보완적으로 작동합니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] mt-5 mb-8">
        <CDCard icon="📋" title="Instructions">
          에이전트가 <strong>어떻게 행동해야 하는지</strong>를 정의하는 자연어 규칙.
          코딩 표준, 프로젝트 구조, 컨벤션 등을 담습니다.
        </CDCard>
        <CDCard icon="🧩" title="Skills">
          에이전트가 <strong>무엇을 할 수 있는지</strong>를 확장하는 능력 패키지.
          워크플로우, 스크립트, 예제 파일을 묶어 필요할 때만 로드됩니다.
        </CDCard>
        <CDCard icon="⚡" title="Hooks">
          에이전트의 동작 <strong>전후에 자동 실행</strong>되는 셸 스크립트.
          LLM을 거치지 않고 결정론적으로 코드가 실행됩니다.
        </CDCard>
      </div>
    </div>

    {/* ═══ 2. 지시 파일 비교 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 2 · 지시 파일 비교</div>
      <h2 id="instruction-files" className={css.h2}>
        copilot-instructions.md vs CLAUDE.md vs AGENTS.md
      </h2>
      <p className={css.p}>
        다양한 에이전트 벤더들이 각자의 지시 파일 형식을 만들었습니다.
        본질적으로는 동일한 역할 — "에이전트에게 프로젝트 컨텍스트와 규칙을 전달" — 을
        하지만, <strong>어떤 에이전트가 읽느냐</strong>에 따라 파일명과 세부 기능이 다릅니다.
      </p>

      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(31,35,40,0.06)] mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["파일", "대상 에이전트", "위치", "특징"].map(h => (
                  <th key={h} className={css.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  file: ".github/copilot-instructions.md",
                  tag: <Tag type="blue">GitHub Copilot</Tag>,
                  loc: <>.github/</>,
                  desc: "레포지토리 전체 적용. Copilot Chat, code review, cloud agent에서 사용",
                },
                {
                  file: ".github/instructions/*.instructions.md",
                  tag: <Tag type="blue">GitHub Copilot</Tag>,
                  loc: <>.github/instructions/</>,
                  desc: <>YAML frontmatter의 <code className={css.code}>applyTo</code> glob 패턴으로 특정 파일 경로에만 적용</>,
                },
                {
                  file: "CLAUDE.md",
                  tag: <Tag type="purple">Claude Code</Tag>,
                  loc: <>프로젝트 루트, ~/.claude/, 조직 경로 등</>,
                  desc: <>디렉터리 트리를 따라 전부 수집. <code className={css.code}>@import</code> 지원. Auto memory 연동</>,
                },
                {
                  file: "AGENTS.md",
                  tag: <Tag type="green">공용</Tag>,
                  loc: <>레포지토리 어디든</>,
                  desc: <>에이전트 불문 오픈 포맷. GitHub Copilot이 읽음. Claude Code는 <code className={css.code}>@AGENTS.md</code>로 import 가능</>,
                },
                {
                  file: "GEMINI.md",
                  tag: <Tag type="amber">Google Gemini</Tag>,
                  loc: <>레포지토리 루트</>,
                  desc: "Gemini 기반 에이전트 전용 지시 파일",
                  last: true,
                },
              ].map(({ file, tag, loc, desc, last }) => (
                <tr key={file} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-mono text-[11px] text-[#0969da] dark:text-[#58a6ff] ${last ? "border-b-0" : ""}`}>{file}</td>
                  <td className={`${css.td} ${last ? "border-b-0" : ""}`}>{tag}</td>
                  <td className={`${css.td} font-mono text-[11px] ${last ? "border-b-0" : ""}`}>{loc}</td>
                  <td className={`${css.td} ${last ? "border-b-0" : ""}`}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Callout type="tip" title="💡 핵심 요점">
        copilot-instructions.md, CLAUDE.md, AGENTS.md는 모두 "에이전트에게 프로젝트 규칙을
        알려주는 지시 파일"이라는 동일한 역할을 합니다. 차이는{" "}
        <strong>어떤 에이전트가 읽느냐</strong>뿐입니다. AGENTS.md는 이런 파편화를
        통합하려는 오픈 포맷 시도입니다.
      </Callout>

      <h3 className={`${css.h3} mt-7`}>CLAUDE.md에서 AGENTS.md 활용하기</h3>
      <p className={css.p}>
        Claude Code는 <code className={css.code}>AGENTS.md</code>를 직접 읽지 않습니다.
        레포지토리에 <code className={css.code}>AGENTS.md</code>가 이미 있다면,{" "}
        <code className={css.code}>CLAUDE.md</code>에서 import하여 중복 없이 두 도구가
        같은 지시사항을 공유할 수 있습니다.
      </p>
      <pre className={css.pre}>{`# CLAUDE.md
@AGENTS.md

## Claude Code 전용 추가 지시
src/billing/ 변경 시 plan mode를 사용하세요.`}</pre>
    </div>

    {/* ═══ 3. Instructions 상세 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 3 · Instructions 상세</div>
      <h2 id="instructions" className={css.h2}>Instructions (지시사항)</h2>
      <p className={css.p}>
        Instructions는 에이전트가 코드를 작성할 때 따라야 할{" "}
        <strong>코딩 표준과 가이드라인</strong>을 자연어로 정의한 것입니다.
        순수 텍스트(마크다운)로만 구성되며, 별도의 스크립트나 실행 가능한 리소스를 포함하지 않습니다.
      </p>

      <h3 className={css.h3}>로딩 방식</h3>
      <ul className="list-none p-0 mb-5 space-y-2">
        {[
          { label: "Always-on",  desc: <><code className={css.code}>copilot-instructions.md</code>는 모든 요청에 자동으로 포함</> },
          { label: "Glob 매칭",  desc: <><code className={css.code}>*.instructions.md</code> 파일은 <code className={css.code}>applyTo</code> 패턴에 매칭되는 파일 작업 시에만 로드</> },
          { label: "CLAUDE.md", desc: "세션 시작 시 디렉터리 트리를 따라 전체 수집" },
        ].map(({ label, desc }) => (
          <li key={label} className="flex items-start gap-3 text-[13.5px] text-[#1f2328] dark:text-[#e6edf3]">
            <span className="font-mono text-[10px] bg-[#ddf4ff] dark:bg-[#1c2d3e] text-[#0969da] dark:text-[#58a6ff] border border-[#54aeff] dark:border-[#1f6feb] rounded px-2 py-0.5 mt-0.5 shrink-0">
              {label}
            </span>
            <span className="leading-[1.72]">{desc}</span>
          </li>
        ))}
      </ul>

      <h3 className={css.h3}>파일 경로별 적용 예시 (Copilot)</h3>
      <pre className={css.pre}>{`# .github/instructions/react-components.instructions.md
---
applyTo: "src/components/**/*.tsx"
---

- 함수형 컴포넌트만 사용
- Props는 반드시 interface로 정의
- useEffect 의존성 배열을 명시적으로 작성`}</pre>

      <h3 className={css.h3}>우선순위 (Copilot)</h3>
      <p className={css.p}>여러 레벨의 instructions가 존재할 때:</p>
      <div className="flex items-center justify-center gap-2 bg-[#eaeef2] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-5 py-4 mb-5 overflow-x-auto">
        {["Personal Instructions", "Repository Instructions", "Organization Instructions"].map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg px-3 py-2 text-[12px] font-medium text-[#1f2328] dark:text-[#e6edf3]">
              {s}
            </div>
            {i < arr.length - 1 && <span className="text-[#0969da] dark:text-[#58a6ff] font-bold">&gt;</span>}
          </div>
        ))}
      </div>

      <h3 className={css.h3}>CLAUDE.md 레벨별 스코프</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["스코프", "위치", "용도"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["조직 정책", "OS별 시스템 경로", "회사 전체 코딩 표준, 보안 정책"],
                ["프로젝트",  "./CLAUDE.md",       "팀 공유 프로젝트 규칙"],
                ["사용자",   "~/.claude/CLAUDE.md","개인 선호 설정"],
                ["로컬",     "./CLAUDE.local.md",  "개인 프로젝트별 설정 (.gitignore 권장)"],
              ].map(([scope, loc, use], i, arr) => (
                <tr key={scope} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-semibold ${i === arr.length - 1 ? "border-b-0" : ""}`}>{scope}</td>
                  <td className={`${css.td} font-mono text-[11px] text-[#0969da] dark:text-[#58a6ff] ${i === arr.length - 1 ? "border-b-0" : ""}`}>{loc}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* ═══ 4. Skills 상세 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 4 · Skills 상세</div>
      <h2 id="skills" className={css.h2}>Skills (스킬)</h2>
      <p className={css.p}>
        Agent Skills는 에이전트의 능력을 확장하는{" "}
        <strong>재사용 가능한 워크플로우 패키지</strong>입니다. Anthropic이 개발하고
        오픈 스탠다드(
        <a href="https://agentskills.io/" target="_blank" rel="noopener noreferrer" className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
          agentskills.io
        </a>
        )로 공개했으며, GitHub Copilot, Claude Code 등 여러 에이전트에서 사용됩니다.
      </p>

      <h3 className={css.h3}>Skills의 구조</h3>
      <pre className={css.pre}>{`my-skill/
├── SKILL.md          # 필수: YAML frontmatter + 지시사항
├── scripts/          # 선택: 실행 가능한 코드
├── references/       # 선택: 참고 문서
└── assets/           # 선택: 템플릿, 리소스`}</pre>

      <h3 className={css.h3}>SKILL.md 파일 형식</h3>
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
            <FlowStep label={s.label} sub={s.sub} color="var(--pt-pu)" />
            {i < arr.length - 1 && <span className="text-[#8250df] dark:text-[#bc8cff] text-[18px]">→</span>}
          </div>
        ))}
      </div>
      <p className={css.p}>이 방식 덕분에 수백 개의 Skills를 설치해도 컨텍스트를 낭비하지 않습니다.</p>

      <h3 className={css.h3}>Instructions와의 차이</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["비교 항목", "Instructions", "Skills"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["목적",  "코딩 표준/가이드라인 정의", "전문 능력과 워크플로우 확장"],
                ["이식성","VS Code, GitHub.com", "VS Code, Copilot CLI, cloud agent (오픈 스탠다드)"],
                ["콘텐츠","지시사항 텍스트만", "지시사항 + 스크립트 + 예제 + 리소스"],
                ["로딩",  "항상 적용 (또는 glob 패턴)", "작업에 관련될 때만 on-demand 로드"],
                ["호출",  "자동 적용", "자동 매칭 또는 /slash-command로 수동 호출"],
              ].map(([item, inst, skill], i, arr) => (
                <tr key={item} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-semibold ${i === arr.length - 1 ? "border-b-0" : ""}`}>{item}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{inst}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{skill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className={css.h3}>Skills 저장 위치</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["유형", "위치"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["프로젝트 스킬", ".github/skills/  .claude/skills/  .agents/skills/"],
                ["개인 스킬",    "~/.copilot/skills/  ~/.claude/skills/  ~/.agents/skills/"],
              ].map(([type, loc], i, arr) => (
                <tr key={type} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{type}</td>
                  <td className={`${css.td} font-mono text-[11px] text-[#0969da] dark:text-[#58a6ff] ${i === arr.length - 1 ? "border-b-0" : ""}`}>{loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className={css.h3}>호출 제어 옵션</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["설정", "/ 커맨드", "자동 로드", "용도"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["기본값",                          "✅","✅","범용 스킬"],
                ["user-invocable: false",           "❌","✅","백그라운드 지원 스킬"],
                ["disable-model-invocation: true",  "✅","❌","수동 호출 전용"],
                ["둘 다 설정",                      "❌","❌","비활성화"],
              ].map(([set, slash, auto, use], i, arr) => (
                <tr key={set} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-mono text-[11px] ${i === arr.length - 1 ? "border-b-0" : ""}`}>{set}</td>
                  <td className={`${css.td} text-center ${i === arr.length - 1 ? "border-b-0" : ""}`}>{slash}</td>
                  <td className={`${css.td} text-center ${i === arr.length - 1 ? "border-b-0" : ""}`}>{auto}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* ═══ 5. Hooks 상세 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 5 · Hooks 상세</div>
      <h2 id="hooks" className={css.h2}>Hooks (훅)</h2>
      <p className={css.p}>
        Hooks는 에이전트의 라이프사이클 이벤트에 바인딩되는{" "}
        <strong>셸 스크립트/명령어</strong>입니다. LLM을 거치지 않고{" "}
        <strong>결정론적으로 코드를 실행</strong>합니다.
      </p>

      <h3 className={css.h3}>라이프사이클 이벤트</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["이벤트", "발생 시점", "대표 활용"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["SessionStart",     "새 세션 시작 시",       "리소스 초기화, 프로젝트 컨텍스트 주입"],
                ["UserPromptSubmit", "사용자 프롬프트 제출 시","요청 감사, 시스템 컨텍스트 주입"],
                ["PreToolUse",       "도구 호출 전",          "위험 명령 차단, 승인 요구, 입력 수정"],
                ["PostToolUse",      "도구 완료 후",          "포매터 실행, 결과 로깅"],
                ["PreCompact",       "컨텍스트 압축 전",      "중요 컨텍스트 보존"],
                ["SubagentStart",    "서브에이전트 생성 시",  "중첩 에이전트 추적"],
                ["SubagentStop",     "서브에이전트 완료 시",  "결과 집계, 정리"],
                ["Stop",             "세션 종료 시",          "리포트 생성, 리소스 정리"],
              ].map(([ev, when, use], i, arr) => (
                <tr key={ev} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-mono text-[11px] text-[#8250df] dark:text-[#bc8cff] ${i === arr.length - 1 ? "border-b-0" : ""}`}>{ev}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{when}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      <h3 className={css.h3}>실전 예시: 위험한 명령어 차단</h3>
      <pre className={css.pre}>{`#!/bin/bash
# scripts/block-dangerous.sh
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input')

if [ "$TOOL_NAME" = "runTerminalCommand" ]; then
  COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // empty')
  if echo "$COMMAND" | grep -qE '(rm\\s+-rf|DROP\\s+TABLE)'; then
    echo '{"hookSpecificOutput":{
      "permissionDecision":"deny",
      "permissionDecisionReason":"보안 정책에 의해 차단"
    }}'
    exit 0
  fi
fi
echo '{"continue":true}'`}</pre>

      <h3 className={css.h3}>PreToolUse 권한 제어</h3>
      <div className="flex items-center justify-center gap-3 bg-[#eaeef2] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] px-5 py-5 mb-4 overflow-x-auto">
        {[
          { label: "allow", sub: "자동 승인", color: "var(--pt-gn)", bg: "var(--pt-gn-bg)" },
          { label: "ask",   sub: "사용자 확인", color: "#bc4c00", bg: "var(--pt-or-bg)" },
          { label: "deny",  sub: "실행 차단",  color: "var(--pt-rd)", bg: "var(--pt-rd-bg)" },
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

      <h3 className={css.h3}>Exit Code</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["Exit Code", "동작"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["0",  "성공: stdout을 JSON으로 파싱"],
                ["2",  "차단 에러: 처리 중단"],
                ["기타","비차단 경고: 경고 표시 후 계속"],
              ].map(([code, action], i, arr) => (
                <tr key={code} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-mono text-[#8250df] dark:text-[#bc8cff] ${i === arr.length - 1 ? "border-b-0" : ""}`}>{code}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* ═══ 6. 한눈에 보는 비교표 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 6 · 비교표</div>
      <h2 id="comparison" className={css.h2}>한눈에 보는 비교표</h2>

      <h3 className={css.h3}>세 가지 커스터마이징 메커니즘</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-7">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["", "Instructions", "Skills", "Hooks"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["본질",    "코딩 규칙/표준",             "재사용 가능한 능력 패키지",           "라이프사이클 자동화 스크립트"],
                ["형태",    "마크다운 텍스트",             "폴더 (SKILL.md + 리소스)",            "JSON 설정 + 셸 스크립트"],
                ["로딩",    "Always-on 또는 glob 매칭",   "On-demand (점진적 로드)",             "이벤트 트리거"],
                ["실행 주체","LLM이 참고",                 "LLM이 호출/참고",                     "OS가 직접 실행 (결정론적)"],
                ["대상",    "Copilot (VS Code, GitHub)",  "Copilot, CLI, cloud agent (오픈 스탠다드)", "Copilot, Claude Code 등"],
                ["콘텐츠",  "텍스트만",                   "텍스트 + 스크립트 + 예제",            "셸 명령어"],
                ["비유",    '"이렇게 행동해라"',           '"이 작업은 이렇게 해라"',             '"이 시점에 이걸 자동 실행해라"'],
              ].map(([item, inst, skill, hook], i, arr) => (
                <tr key={item} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-semibold ${i === arr.length - 1 ? "border-b-0" : ""}`}>{item}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{inst}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{skill}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{hook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className={css.h3}>지시 파일 비교</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["", "copilot-instructions.md", "CLAUDE.md", "AGENTS.md"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["대상",        "GitHub Copilot",  "Claude Code",    "공용"],
                ["역할",        "프로젝트 컨텍스트와 규칙을 에이전트에 전달", "프로젝트 컨텍스트와 규칙을 에이전트에 전달", "프로젝트 컨텍스트와 규칙을 에이전트에 전달"],
                ["경로별 적용", "applyTo glob",    ".claude/rules/ + paths", "디렉터리 계층"],
                ["import",      "❌",              "✅ (@path)",      "❌"],
                ["자동 메모리", "❌",              "✅",              "❌"],
                ["표준",        "GitHub 전용",     "Anthropic 전용", "오픈 포맷"],
              ].map(([item, copilot, claude, agents], i, arr) => (
                <tr key={item} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-semibold ${i === arr.length - 1 ? "border-b-0" : ""}`}>{item}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{copilot}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{claude}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{agents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* ═══ 7. 세 개념의 관계 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 7 · 관계</div>
      <h2 id="relationship" className={css.h2}>세 개념의 관계: 비유로 이해하기</h2>
      <p className={css.p}>세 개념을 <strong>요리사(에이전트)</strong>에 비유하면 명확해집니다.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        <Card icon="📋" title="Instructions = 주방 규칙" accentColor="var(--pt-ac)">
          "채소는 항상 오른쪽에 놓아라", "소금은 마지막에 넣어라" 같은{" "}
          <strong>항상 지켜야 할 기본 규칙</strong>. 요리사는 모든 요리에서 이 규칙을 참고합니다.
        </Card>
        <Card icon="🧩" title="Skills = 레시피 카드" accentColor="var(--pt-pu)">
          "파스타 만들기", "스시 말기" 같은 <strong>특정 작업의 상세 절차</strong>.
          필요할 때만 꺼내 보고, 조리법뿐 아니라 참고 사진이나 도구 사용법도 포함됩니다.
        </Card>
        <Card icon="⚡" title="Hooks = 자동화 장비" accentColor="var(--pt-gn)">
          "오븐 문이 열리면 타이머 시작", "조리 완료 시 자동 접시세척기 가동" 같은{" "}
          <strong>특정 시점에 자동 실행되는 장치</strong>. 요리사의 판단 없이 기계적으로 작동합니다.
        </Card>
      </div>

      <Callout type="info" title="🔗 상호 보완 관계">
        이 세 가지는 서로 대체재가 아니라 보완재입니다. Instructions가 "성격과 규칙"을,
        Skills가 "전문 능력"을, Hooks가 "직접 실행되는 자동화"를 담당합니다.
      </Callout>
    </div>

    {/* ═══ 8. Skills는 MCP/도구가 아니다 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 8 · 자주 혼동하는 개념</div>
      <h2 id="skills-not-mcp" className={css.h2}>Skills는 MCP/도구를 구현하는 것이 아니다</h2>
      <p className={css.p}>
        자주 혼동되는 부분이지만,{" "}
        <strong>Skills는 MCP 서버나 도구를 구현하거나 정의하는 것이 아닙니다.</strong>
      </p>

      <h3 className={css.h3}>Skills가 하는 것</h3>
      <p className={css.p}>
        "이 작업을 할 때는 이런 절차를 따르고, 이런 도구를 활용해라"라는{" "}
        <strong>작업 수행 절차와 가이드</strong>를 패키징한 것입니다.
      </p>
      <pre className={css.pre}>{`# GitHub Actions 디버깅 스킬 예시 (SKILL.md 일부)

## 절차
1. list_workflow_runs 도구로 PR의 워크플로우 실행 조회
2. summarize_job_log_failures 도구로 실패 작업 AI 요약 확인
3. 필요 시 get_job_logs 도구로 전체 실패 로그 확인
4. 로컬 환경에서 실패 재현 시도
5. 수정 후 커밋 전 검증`}</pre>
      <p className={css.p}>
        위 예시에서 <code className={css.code}>list_workflow_runs</code> 등의 도구는{" "}
        <strong>이미 에이전트에 설치되어 있는 것</strong>입니다. Skills는 그 도구들을
        "언제, 어떤 순서로, 어떻게 조합할지"를 알려주는 <strong>레시피</strong>입니다.
      </p>

      <h3 className={css.h3}>Skills가 하지 않는 것</h3>
      <ul className="list-none p-0 mb-5 space-y-2">
        {[
          "MCP 서버를 구현하거나 새로운 도구를 생성하지 않음",
          "도구의 API 엔드포인트나 스키마를 정의하지 않음",
          "에이전트에 새로운 도구를 등록하지 않음",
        ].map(item => (
          <li key={item} className="flex items-start gap-2 text-[13.5px] text-[#1f2328] dark:text-[#e6edf3]">
            <span className="text-[#cf222e] dark:text-[#ff7b72] mt-0.5 shrink-0">❌</span>
            {item}
          </li>
        ))}
      </ul>

      <h3 className={css.h3}>도구/MCP vs Skills</h3>
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-[10px] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{["", "MCP 서버 / 도구", "Skills"].map(h => <th key={h} className={css.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["역할",  "에이전트가 호출할 수 있는 능력 자체", "기존 능력들을 어떻게 조합할지 안내"],
                ["비유",  "주방의 도구 (칼, 오븐, 믹서기)",    "그 도구들로 요리하는 레시피"],
                ["없으면?","해당 작업 수행 불가",              "수행은 가능하나 비효율적"],
                ["형태",  "서버 프로세스, API 구현",           "마크다운 문서 + 참고 파일"],
              ].map(([item, mcp, skill], i, arr) => (
                <tr key={item} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className={`${css.td} font-semibold ${i === arr.length - 1 ? "border-b-0" : ""}`}>{item}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{mcp}</td>
                  <td className={`${css.td} ${i === arr.length - 1 ? "border-b-0" : ""}`}>{skill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Callout type="warning" title="⚠️ 정리">
        Skills는 도구를 <strong>만드는</strong> 것이 아니라, 이미 존재하는 도구들을{" "}
        <strong>잘 쓰는 방법</strong>을 에이전트에게 가르치는 것입니다.
        "특정 작업을 수행하는 워크플로우 자체를 캡슐화한 것"이며,
        그 워크플로우 안에서 기존 도구를 참조할 수 있는 것입니다.
      </Callout>
    </div>

    {/* ═══ 9. 참고 링크 ═══ */}
    <SectionDivider />
    <div className={css.section}>
      <div className={css.secLabel}>§ 9 · 참고 링크</div>
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
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--pt-ac)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--pt-bd)")}
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
