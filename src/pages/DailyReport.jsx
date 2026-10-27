import { Children, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import "./DailyReport.css";

const REPORT_ROOT = `${process.env.PUBLIC_URL || ""}/daily-reports`;
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

export function validateDiagram(source) {
  const text = source.trim();
  if (text.length > 12000 || !/^graph\s+TD\s*(?:;|\n|$)/.test(text) ||
    /%%|---|<|>|\b(?:click|style|classDef|class|linkStyle|href|call|callback|image|icon)\b|\bdirection\s+(?!TD\b)|https?:|javascript:|data:/i.test(text.replace(/-->|==>|-\.->/g, ""))) {
    throw new Error("세로형 graph TD의 기본 노드와 연결선만 표시할 수 있습니다.");
  }
  return text;
}

function MermaidDiagram({ source }) {
  const id = `daily-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const container = useRef(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setError("");
    container.current.replaceChildren();
    const task = renderQueue.catch(() => {}).then(async () => {
      const safeSource = validateDiagram(source);
      if (!mermaidModule) {
        mermaidModule = import("mermaid").then(({ default: mermaid }) => {
          mermaid.initialize({ startOnLoad: false, htmlLabels: false, securityLevel: "strict", theme: "base", suppressErrorRendering: true,
            flowchart: { htmlLabels: false, useMaxWidth: true, nodeSpacing: 35, rankSpacing: 50 },
            themeVariables: { primaryColor: "#f6f6f5", primaryTextColor: "#252525", primaryBorderColor: "#777777", lineColor: "#777777", secondaryColor: "#ffffff", tertiaryColor: "#ffffff", fontFamily: "system-ui, sans-serif" } });
          return mermaid;
        });
      }
      const mermaid = await mermaidModule;
      if (!active) return;
      const { svg } = await mermaid.render(id, safeSource);
      if (!active) return;
      container.current.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true }, FORBID_TAGS: ["foreignObject", "a", "image", "script"] });
      const diagram = container.current.querySelector("svg");
      if (diagram) {
        const width = diagram.viewBox.baseVal.width;
        if (width > 0) diagram.style.width = `${width}px`;
        diagram.setAttribute("role", "img"); diagram.setAttribute("aria-label", "위에서 아래로 읽는 시스템 흐름도"); }
    });
    renderQueue = task;
    task.catch((reason) => { if (active) setError(reason.message || "흐름도를 표시하지 못했습니다."); });
    return () => { active = false; };
  }, [source, id]);
  return <figure className="daily-diagram"><figcaption>시스템 흐름 / 위에서 아래로</figcaption><div ref={container} />{error && <><p role="status">{error}</p><pre><code>{source}</code></pre></>}</figure>;
}

function MarkdownPre({ children }) {
  const child = Children.toArray(children)[0];
  if (child?.props?.className === "language-mermaid") return <MermaidDiagram source={String(child.props.children).replace(/\n$/, "")} />;
  return <pre>{children}</pre>;
}

export default function DailyReport() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState({ status: "loading", dates: [] });
  const [report, setReport] = useState({ status: "loading", content: "" });
  const [retry, setRetry] = useState(0);
  const selectedDate = date || index.dates[0];
  const invalidDate = date !== undefined && !isReportDate(date);
  const today = kstToday();

  useEffect(() => {
    const controller = new AbortController();
    setIndex({ status: "loading", dates: [] });
    fetch(`${REPORT_ROOT}/index.json`, { signal: controller.signal, cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("index");
        const payload = await response.json();
        if (!Array.isArray(payload.dates) || !payload.dates.every(isReportDate)) throw new Error("index");
        if (!controller.signal.aborted) setIndex({ status: "ready", dates: [...new Set(payload.dates)].sort().reverse() });
      }).catch((error) => { if (!controller.signal.aborted) setIndex({ status: "error", dates: [] }); });
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
    document.title = `${selectedDate || "Daily Report"} / Soyeong Kim`;
    return () => { document.title = previous; };
  }, [selectedDate]);

  const reload = () => setRetry((value) => value + 1);
  return <div className="daily-report">
    <header className="daily-topbar"><Link to="/">← SOYEONG KIM</Link><span>Daily Report</span></header>
    <main className="daily-page">
      <div className="daily-kicker">AI / AGENTS / ARCHITECTURE</div>
      <h1>Daily Report</h1>
      <p className="daily-subtitle">출근길에 읽는 에이전트 기술 동향</p>
      <div className="daily-properties"><span>발행 기준</span><strong>매일 07:00 KST / 최근 24시간</strong><span>리포트 날짜</span><time dateTime={selectedDate}>{selectedDate || "발행 대기"}</time></div>
      <nav className="daily-datebar" aria-label="리포트 날짜 선택"><Link to="/daily" aria-current={!date ? "page" : undefined}>최신 리포트</Link><label>날짜<input type="date" value={isReportDate(selectedDate) ? selectedDate : ""} max={today} onChange={(event) => { if (isReportDate(event.target.value)) navigate(`/daily/${event.target.value}`); }} /></label></nav>
      {invalidDate ? <div className="daily-message" role="alert">올바른 날짜가 아닙니다. YYYY-MM-DD 형식의 날짜를 선택하세요.</div>
        : !selectedDate ? <div className="daily-message" role="status">{index.status === "loading" ? "리포트 목록을 불러오는 중…" : index.status === "error" ? "리포트 목록을 불러오지 못했습니다." : "아직 발행된 리포트가 없습니다. 첫 자동 발행 후 여기에 표시됩니다."}{index.status === "error" && <button onClick={reload}>다시 불러오기</button>}</div>
        : <>
          {!date && selectedDate < today && <aside className="daily-notice">오늘 리포트는 아직 발행되지 않았습니다. 최근 리포트({selectedDate})를 표시합니다.</aside>}
          {report.status === "ready" ? <article className="daily-content" aria-label={`${selectedDate} 데일리 리포트`}><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ pre: MarkdownPre, a: ({ node, children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>, img: () => null }}>{report.content}</ReactMarkdown></article>
            : <div className="daily-message" role="status">{report.status === "loading" ? "리포트를 불러오는 중…" : report.status === "missing" ? "선택한 날짜에 발행된 리포트가 없습니다." : "리포트를 불러오지 못했습니다."}{report.status !== "loading" && <button onClick={reload}>다시 불러오기</button>}</div>}
        </>}
      {index.dates.length > 0 && <details className="daily-archive"><summary>지난 리포트 ({index.dates.length})</summary><div>{index.dates.map((item) => <Link key={item} to={`/daily/${item}`} aria-current={item === selectedDate ? "page" : undefined}>{item}</Link>)}</div></details>}
      <footer className="daily-footer">인터넷 공개 자료 기반 / 출처는 각 리포트에서 확인</footer>
    </main>
  </div>;
}
