import { Children, createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import ReportPanel from "./ReportPanel";
import "./DailyReport.css";

const REPORT_ROOT = `${process.env.PUBLIC_URL || ""}/daily-reports`;
const THEME_KEY = "daily-report-theme";
const ReportTheme = createContext("light");
let mermaidModule;
let renderQueue = Promise.resolve();

export function isReportDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function kstToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function plainHeading(text) {
  return text.replace(/!?\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim();
}

const LEGACY_GITHUB_TITLE = "GitHub Trending / 수집 시점 스냅샷";
const GITHUB_TITLE = "오늘 살펴볼 인기 오픈소스";
const LEGACY_GITHUB_NOTE = "지난 24시간 내 신규 발표를 뜻하지 않는다. 순위는 수집 시점에 따라 달라진다.";
const GITHUB_NOTE = "GitHub의 일간 Trending에 오른 저장소 중 이전 리포트에서 소개하지 않은 항목입니다. 새로 출시됐다는 뜻은 아닙니다.";

function summaryBlock(content) {
  const lines = content.split("\n");
  const hiddenLines = new Set();
  const summary = [];
  let inSummary = false;
  lines.forEach((line, position) => {
    if (/^\s*>\s*\*\*오늘의 3줄 요약\*\*\s*$/.test(line)) {
      inSummary = true;
      hiddenLines.add(position);
      return;
    }
    if (!inSummary) return;
    if (!line.trim()) return;
    if (!/^\s*>/.test(line)) { inSummary = false; return; }
    hiddenLines.add(position);
    const bullet = line.match(/^\s*>\s*[-*]\s+(.+)$/);
    if (bullet) summary.push(plainHeading(bullet[1]));
  });
  return { summary: summary.slice(0, 3), hiddenLines };
}

export function reportSummary(content) {
  const { summary } = summaryBlock(content);
  if (summary.length) return summary;
  return [...content.matchAll(/^\s*-\s+\*\*의미:\*\*\s+(.+)$/gm)]
    .slice(0, 3).map((match) => plainHeading(match[1]));
}

export function reportHeadings(content) {
  const headings = [];
  let fence = null;
  content.split("\n").forEach((line, index) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) fence = { character: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.character && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      return;
    }
    if (fence) return;
    const heading = line.match(/^ {0,3}(#{2,3})[ \t]+(.+?)\s*#*\s*$/);
    if (heading) headings.push({ id: `section-${index + 1}`, depth: heading[1].length, label: heading[2] === LEGACY_GITHUB_TITLE ? GITHUB_TITLE : plainHeading(heading[2]) });
  });
  return headings;
}

export function reportCollectedAt(content) {
  for (const line of content.split("\n")) {
    if (/^ {0,3}#{2,6}\s|^ {0,3}(?:`{3,}|~{3,})/.test(line)) break;
    const match = line.match(/^\s*(?:[-*]\s+|>\s*)?수집\s*:\s*(.+)$/);
    if (match) return match[1].trim();
  }
  return "";
}

// Change only the legacy introductory metadata lines. Keeping every newline
// preserves the original heading positions used by the table of contents.
export function prepareReportMarkdown(content) {
  const { hiddenLines } = summaryBlock(content);
  let introduction = true;
  let fence = null;
  return content.split("\n").map((line, position) => {
    if (hiddenLines.has(position)) return "";
    if (/^ {0,3}#{2,6}\s/.test(line) || /^ {0,3}(?:`{3,}|~{3,})/.test(line)) introduction = false;
    if (introduction && /^\s*>\s*AI Agent\s*\/\s*Agentic AI\s*\/\s*LLM\s*\/\s*Architecture\s*\/\s*Framework\s*\/\s*Pattern\s*$/.test(line)) return "";
    if (introduction && /^\s*(?:-\s+|>\s*)(?:범위\s*:|사실 요약과 해석)/.test(line)) return "";
    if (introduction && /^\s*(?:[-*]\s+|>\s*)?수집\s*:/.test(line)) return "";
    if (line === `## ${LEGACY_GITHUB_TITLE}`) return `## ${GITHUB_TITLE}`;
    if (line === `- ${LEGACY_GITHUB_NOTE}`) return `> ${GITHUB_NOTE}`;
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      return line;
    }
    if (fence) return line;
    // Source IDs belong to collection metadata, not reader-facing prose.
    return line.replace(/\s*\(S\d+(?:\s*,\s*S\d+)*\)/g, "")
      .replace(/^(\s*-\s+)\[S\d+\]\s+(?=\[)/, "$1")
      .replace("발표: 기업 통제와 에이전트 IAM을 다룬 보도가 수집됐다.", "기업이 AI 에이전트의 접근 권한을 관리하는 방법도 보도됐다. 접근 권한 관리(IAM)는 누가 어떤 시스템에서 무엇을 할 수 있는지 정하는 일이다.")
      .replace(/^(\s*-\s+)발표:\s*/, "$1");
  }).join("\n");
}

// Mark semantic report notes without changing Markdown line numbers or links.
export function remarkAuditDisclosure() {
  return (tree) => {
    const nodes = tree.children;
    for (let index = 0; index < nodes.length; index += 1) {
      const heading = nodes[index];
      if (heading.type !== "heading" || heading.depth !== 2 || heading.children.map((child) => child.value || "").join("").trim() !== "출처 점검") continue;
      let end = index + 1;
      while (end < nodes.length && !(nodes[end].type === "heading" && nodes[end].depth <= 2)) end += 1;
      const body = nodes.slice(index + 1, end);
      nodes.splice(index, end - index, { type: "auditDisclosure", data: { hName: "details", hProperties: { className: "daily-audit" } }, children: [
        { type: "auditSummary", data: { hName: "summary" }, children: [heading] }, ...body,
      ] });
    }
  };
}

export function remarkReportNotes() {
  const labels = /^(해석|의미|실행|기술\/산업 영향|검증 행동|한계):\s*/;
  return (tree) => {
    const walk = (node) => {
      if (node.type === "listItem") {
        const paragraph = node.children?.[0];
        const first = paragraph?.type === "paragraph" ? paragraph.children?.[0] : null;
        const text = first?.type === "text" ? first.value : first?.type === "strong" && first.children?.length === 1 && first.children[0].type === "text" ? first.children[0].value : "";
        const match = text.match(labels);
        if (match) {
          const tag = { type: "strong", data: { hProperties: { className: "daily-note-tag" } }, children: [{ type: "text", value: match[1] }] };
          const remainder = text.slice(match[0].length);
          paragraph.children.splice(0, 1, tag, ...(remainder ? [{ type: "text", value: ` ${remainder}` }] : []));
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, className: "daily-note" } };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export function validateDiagram(source) {
  const text = source.trim();
  if (text.length > 12000 || !/^graph\s+TD\s*(?:;|\n|$)/.test(text) ||
    /%%|---|<|>|\b(?:click|style|classDef|class|linkStyle|href|call|callback|image|icon)\b|\bdirection\s+(?!TD\b)|https?:|javascript:|data:/i.test(text.replace(/-->|==>|-\.->/g, ""))) {
    throw new Error("세로형 graph TD의 기본 노드와 연결선만 표시할 수 있습니다.");
  }
  return text;
}

function MermaidDiagram({ source }) {
  const theme = useContext(ReportTheme);
  const id = `daily-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const container = useRef(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setError("");
    container.current.replaceChildren();
    const task = renderQueue.catch(() => {}).then(async () => {
      const safeSource = validateDiagram(source);
      if (!mermaidModule) mermaidModule = import("mermaid").then(({ default: mermaid }) => mermaid);
      const mermaid = await mermaidModule;
      if (!active) return;
      const dark = theme === "dark";
      mermaid.initialize({ startOnLoad: false, htmlLabels: false, securityLevel: "strict", theme: "base", suppressErrorRendering: true,
        flowchart: { htmlLabels: false, useMaxWidth: true, nodeSpacing: 35, rankSpacing: 50 },
        themeVariables: { darkMode: dark, background: dark ? "#222221" : "#fafaf8", primaryColor: dark ? "#2d2d2b" : "#f2f2ef",
          primaryTextColor: dark ? "#eeeeea" : "#292927", primaryBorderColor: dark ? "#b0b0a8" : "#686862",
          lineColor: dark ? "#b0b0a8" : "#686862", secondaryColor: dark ? "#252523" : "#ffffff",
          tertiaryColor: dark ? "#252523" : "#ffffff", edgeLabelBackground: dark ? "#222221" : "#fafaf8", fontFamily: "system-ui, sans-serif" } });
      const { svg } = await mermaid.render(id, safeSource);
      if (!active) return;
      container.current.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true }, FORBID_TAGS: ["foreignObject", "a", "image", "script"] });
      const diagram = container.current.querySelector("svg");
      if (diagram) {
        const width = diagram.viewBox?.baseVal?.width || Number(diagram.getAttribute("viewBox")?.split(/\s+/)[2]);
        if (width > 0) diagram.style.width = `${width}px`;
        diagram.setAttribute("role", "img");
        diagram.setAttribute("aria-label", "위에서 아래로 읽는 시스템 흐름도");
      }
    });
    renderQueue = task;
    task.catch((reason) => { if (active) setError(reason.message || "흐름도를 표시하지 못했습니다."); });
    return () => { active = false; };
  }, [source, id, theme]);
  return <figure className="daily-diagram"><figcaption>시스템 흐름 / 위에서 아래로</figcaption><div ref={container} />{error && <><p role="status">{error}</p><pre><code>{source}</code></pre></>}</figure>;
}

function MarkdownPre({ children }) {
  const child = Children.toArray(children)[0];
  if (child?.props?.className === "language-report-panel") return <ReportPanel source={String(child.props.children)} />;
  if (child?.props?.className === "language-mermaid") return <MermaidDiagram source={String(child.props.children).replace(/\n$/, "")} />;
  return <pre>{children}</pre>;
}

export function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function SourceImage({ src, alt, title }) {
  const [failed, setFailed] = useState(false);
  const url = safeImageUrl(src);
  if (!url) return null;
  return <span className="daily-source-image">
    {!failed && <img src={url} alt={alt || "출처 원문의 이미지"} title={title} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />}
    <span className="daily-source-image-caption">{failed && <span>이미지를 불러오지 못했습니다. </span>}<a href={url} target="_blank" rel="noopener noreferrer">{failed ? "원본 이미지에서 확인 ↗" : "원본 이미지 보기 ↗"}</a></span>
  </span>;
}

export function monthCalendar(month) {
  const [year, number] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, number - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((firstWeekday + days) / 7) * 7 }, (_, position) => {
    const day = position - firstWeekday + 1;
    return day > 0 && day <= days ? `${month}-${String(day).padStart(2, "0")}` : null;
  });
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
}

function changeMonth(month, offset) {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7);
}

function ArchiveCalendar({ dates, titles, today }) {
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const available = useMemo(() => new Set(dates), [dates]);
  const [year, number] = month.split("-").map(Number);
  return <section className="daily-calendar" aria-label="월별 데일리 리포트">
    <div className="daily-calendar-toolbar"><div><h2>{year}년 {number}월</h2><p>리포트가 발행된 날짜를 선택하세요.</p></div><div className="daily-month-controls"><button type="button" aria-label="이전 달" onClick={() => setMonth(changeMonth(month, -1))}>←</button><button type="button" onClick={() => setMonth(today.slice(0, 7))}>이번 달</button><button type="button" aria-label="다음 달" onClick={() => setMonth(changeMonth(month, 1))}>→</button></div></div>
    <table><caption className="daily-sr-only">{year}년 {number}월 리포트 달력</caption><thead><tr>{["일", "월", "화", "수", "목", "금", "토"].map((day) => <th key={day} scope="col">{day}</th>)}</tr></thead><tbody>{monthCalendar(month).map((week, weekIndex) => <tr key={weekIndex}>{week.map((day, dayIndex) => <td key={day || `empty-${dayIndex}`} aria-current={day === today ? "date" : undefined} className={day === today ? "daily-calendar-today" : undefined}>{day ? available.has(day) ? <Link to={`/daily/${day}`} aria-label={`${day} / ${titles[day] || `${day} 리포트`}`}><time dateTime={day}>{Number(day.slice(-2))}{day === today && <span className="daily-today-label">오늘</span>}</time><span className="daily-calendar-title">{titles[day] || `${day} 리포트`}</span><span className="daily-calendar-open" aria-hidden="true">리포트 읽기 ↗</span></Link> : <div className="daily-calendar-empty"><time dateTime={day}>{Number(day.slice(-2))}{day === today && <span className="daily-today-label">오늘</span>}</time></div> : null}</td>)}</tr>)}</tbody></table>
    <p className="daily-calendar-legend">제목이 있는 날짜에 리포트가 발행됐습니다.</p>
  </section>;
}

export default function DailyReport() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState({ status: "loading", dates: [], titles: {}, repositories: {}, summaries: {} });
  const [report, setReport] = useState({ status: "loading", content: "" });
  const [retry, setRetry] = useState(0);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"; } catch { return "light"; } });
  const selectedDate = date;
  const headings = useMemo(() => reportHeadings(report.content), [report.content]);
  const markdown = useMemo(() => prepareReportMarkdown(report.content), [report.content]);
  const summary = useMemo(() => index.summaries[selectedDate] || reportSummary(report.content), [index.summaries, selectedDate, report.content]);
  const collectedAt = useMemo(() => reportCollectedAt(report.content), [report.content]);
  const invalidDate = date !== undefined && !isReportDate(date);
  const today = kstToday();
  const summaryTitle = selectedDate ? index.titles[selectedDate] || headings.find((heading) => heading.depth === 2)?.label.replace(/^\d+[.)]\s*/, "") : "";

  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch { /* Reading remains available when storage is disabled. */ } }, [theme]);

  useEffect(() => {
    const controller = new AbortController();
    setIndex({ status: "loading", dates: [], titles: {}, repositories: {}, summaries: {} });
    fetch(`${REPORT_ROOT}/index.json`, { signal: controller.signal, cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("index");
        const payload = await response.json();
        if (!Array.isArray(payload.dates) || !payload.dates.every(isReportDate)) throw new Error("index");
        const titles = {};
        if (Array.isArray(payload.reports)) payload.reports.forEach((item) => {
          if (item && isReportDate(item.date) && typeof item.title === "string" && item.title.trim()) titles[item.date] = item.title.trim().slice(0, 240);
        });
        const summaries = {};
        if (payload.summaries && typeof payload.summaries === "object" && !Array.isArray(payload.summaries)) Object.entries(payload.summaries).forEach(([key, lines]) => {
          if (isReportDate(key) && Array.isArray(lines) && lines.length === 3 && lines.every((line) => typeof line === "string" && line.trim() && line.length <= 600)) summaries[key] = lines.map((line) => line.trim());
        });
        const repositories = {};
        if (payload.repositories && typeof payload.repositories === "object" && !Array.isArray(payload.repositories)) Object.entries(payload.repositories).forEach(([key, repository]) => {
          if (/^[\w.-]+\/[\w.-]+$/.test(key) && repository) {
            const description = typeof repository.description === "string" ? repository.description.trim().slice(0, 600) : "";
            const summaryKo = typeof repository.summary_ko === "string" ? repository.summary_ko.trim().slice(0, 200) : "";
            if (description || summaryKo) repositories[key.toLowerCase()] = { description, summaryKo };
          }
        });
        if (!controller.signal.aborted) setIndex({ status: "ready", dates: [...new Set(payload.dates)].sort().reverse(), titles, repositories, summaries });
      }).catch(() => { if (!controller.signal.aborted) setIndex({ status: "error", dates: [], titles: {}, repositories: {}, summaries: {} }); });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    if (!selectedDate || invalidDate) return undefined;
    const controller = new AbortController();
    setReport({ status: "loading", content: "" });
    fetch(`${REPORT_ROOT}/${selectedDate}.md`, { signal: controller.signal, cache: "no-cache" })
      .then(async (response) => {
        if (response.status === 404) { if (!controller.signal.aborted) setReport({ status: "missing", content: "" }); return; }
        if (!response.ok) throw new Error("report");
        const content = await response.text();
        if (!content.trim() || /^\s*(?:<!doctype html|<html)/i.test(content)) throw new Error("report");
        if (!controller.signal.aborted) setReport({ status: "ready", content });
      }).catch(() => { if (!controller.signal.aborted) setReport({ status: "error", content: "" }); });
    return () => controller.abort();
  }, [selectedDate, invalidDate, retry]);

  useEffect(() => {
    const previous = document.title;
    document.title = `${selectedDate ? `${summaryTitle || "리포트"} / ${selectedDate}` : "Daily Report"} / Soyeong Kim`;
    return () => { document.title = previous; };
  }, [selectedDate, summaryTitle]);

  const reload = () => setRetry((value) => value + 1);
  return <ReportTheme.Provider value={theme}><div className={`daily-report${date ? " daily-detail" : " daily-index"}`} data-daily-theme={theme}>
    <a className="daily-skip-link" href="#daily-main">본문으로 이동</a>
    <header className="daily-topbar"><Link to="/">← SOYEONG KIM</Link><button className="daily-theme-toggle" type="button" aria-label="다크 모드" aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}><span aria-hidden="true">{theme === "dark" ? "◑" : "◐"}</span> 다크 모드 <span className="daily-theme-state">{theme === "dark" ? "켜짐" : "꺼짐"}</span></button></header>
    <main className="daily-page" id="daily-main" tabIndex={-1}>
      <div className="daily-kicker">AI / ENGINEERING / TECH</div>
      <h1 className="daily-page-title">{date ? summaryTitle || "리포트" : "Daily Report"}</h1>
      <p className="daily-subtitle">{date && !invalidDate ? <time dateTime={date}>{date}</time> : "출근길에 읽는 AI와 기술 동향"}</p>
      <div className="daily-properties">{date ? <span>{collectedAt ? `수집: ${collectedAt}` : report.status === "loading" ? "수집 시각 확인 중…" : report.status === "ready" ? "수집 시각 정보 없음" : ""}</span> : <span>매일 07:00 KST / 최근 24시간</span>}{!date && index.status === "ready" && <span>발행된 리포트 {index.dates.length}개</span>}</div>
      <nav className="daily-datebar" aria-label="리포트 날짜 선택"><Link to="/daily" aria-current={!date ? "page" : undefined}>{date ? "← 리포트 목록" : "리포트 목록"}</Link><label>날짜<input type="date" value={isReportDate(selectedDate) ? selectedDate : ""} max={today} onChange={(event) => { if (isReportDate(event.target.value)) navigate(`/daily/${event.target.value}`); }} /></label></nav>
      {invalidDate ? <div className="daily-message" role="alert">올바른 날짜가 아닙니다. YYYY-MM-DD 형식의 날짜를 선택하세요.</div>
        : !date ? <>
          {index.status !== "ready" || index.dates.length === 0 ? <div className="daily-message" role="status">{index.status === "loading" ? "리포트 목록을 불러오는 중…" : index.status === "error" ? "리포트 목록을 불러오지 못했습니다. 연결을 확인하고 다시 불러오세요." : "아직 발행된 리포트가 없습니다. 첫 자동 발행 후 여기에 표시됩니다."}{index.status === "error" && <button type="button" onClick={reload}>다시 불러오기</button>}</div>
            : <><section className="daily-archive-list" aria-label="날짜별 데일리 리포트"><h2>날짜별 리포트 <span>{index.dates.length}</span></h2><p className="daily-archive-description">최신순 / 읽을 리포트를 선택하세요.</p><ol>{index.dates.map((item, position) => <li key={item}><Link to={`/daily/${item}`}><div className="daily-archive-meta"><time dateTime={item}>{item}</time>{item === today ? <span className="daily-badge daily-badge-today">오늘</span> : position === 0 ? <span className="daily-badge">최신</span> : null}</div><div className="daily-archive-title"><strong>{index.titles[item] || `${item} 리포트`}</strong><span aria-hidden="true">↗</span></div></Link></li>)}</ol></section><ArchiveCalendar dates={index.dates} titles={index.titles} today={today} /></>}
        </>
        : report.status === "ready" ? <>
          {summary.length > 0 && <aside className="daily-summary" aria-label="오늘의 요약"><h2>{summary.length === 3 ? "오늘의 3줄 요약" : "오늘의 요약"}</h2><ul>{summary.map((item, position) => <li key={position}>{item}</li>)}</ul></aside>}
          {headings.length > 0 && <nav className="daily-toc" aria-label="리포트 목차"><div className="daily-toc-heading"><h2>목차</h2><span>{headings.length}개 섹션</span></div><ol>{headings.map((heading, position) => <li key={heading.id} className={heading.depth === 3 ? "daily-toc-subsection" : undefined}><a href={`#${heading.id}`}><span className="daily-toc-number" aria-hidden="true">{String(position + 1).padStart(2, "0")}</span><span>{heading.label.replace(/^\d+[.)]\s*/, "")}</span><span className="daily-toc-arrow" aria-hidden="true">↓</span></a></li>)}</ol></nav>}
          <article className="daily-content" aria-label={`${selectedDate} 데일리 리포트`}><ReactMarkdown remarkPlugins={[remarkGfm, remarkReportNotes, remarkAuditDisclosure]} skipHtml components={{ pre: MarkdownPre, h1: () => null,
            h2: ({ node, children }) => <h2 id={`section-${node.position.start.line}`}>{children}</h2>,
            h3: ({ node, children }) => <h3 id={`section-${node.position.start.line}`}>{children}</h3>,
            a: ({ node, children, href, ...props }) => {
              if (node?.children?.some((child) => child.tagName === "img")) return <span>{children}<a href={href} target="_blank" rel="noopener noreferrer">원문에서 보기 ↗</a></span>;
              const repository = href?.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/?$/i)?.[1].toLowerCase();
              const metadata = repository && !/^\s{2}- (?:용도|원문 설명|한국어 요약):/m.test(markdown) ? index.repositories[repository] : undefined;
              return <><a {...props} href={href} target={href?.startsWith("#") ? undefined : "_blank"} rel={href?.startsWith("#") ? undefined : "noopener noreferrer"}>{children}</a>{metadata && <><span className="daily-repo-description"><span className="daily-repo-label">원문</span>{metadata.description || "저장소에 공개된 설명 없음"}</span>{metadata.summaryKo && <span className="daily-repo-korean"><span className="daily-repo-label">한국어 요약</span>{metadata.summaryKo}</span>}</>}</>;
            }, img: ({ src, alt, title }) => <SourceImage key={src} src={src} alt={alt} title={title} /> }}>{markdown}</ReactMarkdown></article>
        </> : <div className="daily-message" role="status">{report.status === "loading" ? "리포트를 불러오는 중…" : report.status === "missing" ? "선택한 날짜에 발행된 리포트가 없습니다. 목록에서 다른 날짜를 선택하세요." : "리포트를 불러오지 못했습니다. 연결을 확인하고 다시 불러오세요."}{report.status !== "loading" && <button type="button" onClick={reload}>다시 불러오기</button>}</div>}
      <footer className="daily-footer">인터넷 공개 자료 기반 / 출처는 각 리포트에서 확인</footer>
    </main>
  </div></ReportTheme.Provider>;
}
