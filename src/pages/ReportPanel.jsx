import React from "react";

const STATES = { confirmed: "확인된 사실", reported: "발표자 주장", uncertain: "미확인", limited: "적용 한계" };
const text = (value, max = 600) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const safeSource = (source) => {
  try {
    const url = new URL(source.url);
    return text(source.title, 300) && url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
};

export function parseReportPanel(source) {
  if (typeof source !== "string" || source.length > 24000) throw new Error("Invalid visual summary");
  const panel = JSON.parse(source);
  if (!panel || !text(panel.title, 160) || !text(panel.conclusion) || !Array.isArray(panel.sources) || !panel.sources.length || panel.sources.length > 3 || !panel.sources.every(safeSource)) throw new Error("Missing visual evidence");
  const validRows = (rows, max, fields) => Array.isArray(rows) && rows.length <= max && rows.every((row) => row && fields.every((field) => text(row[field])));
  if (!validRows(panel.metrics, 3, ["label", "value", "detail"]) || !validRows(panel.comparisons, 3, ["label", "before", "after", "detail"]) || !validRows(panel.findings, 4, ["label", "evidence"]) || !panel.findings.every((row) => Object.hasOwn(STATES, row.status))) throw new Error("Invalid visual cards");
  if (panel.chart != null) {
    const chart = panel.chart;
    if (!text(chart.title, 160) || !text(chart.unit, 40) || !text(chart.note) || !Array.isArray(chart.rows) || chart.rows.length < 2 || chart.rows.length > 6 || !chart.rows.every((row) => row && text(row.label, 120) && Number.isFinite(row.value) && row.value >= 0 && row.value <= 1e12)) throw new Error("Invalid comparison scale");
  }
  return panel;
}

export default function ReportPanel({ source }) {
  let panel;
  try { panel = parseReportPanel(source); } catch { return <p className="daily-panel-error" role="status">시각 요약을 표시하지 못했습니다. 아래 본문과 출처를 확인하세요.</p>; }
  const maximum = panel.chart ? Math.max(...panel.chart.rows.map((row) => row.value), 1) : 1;
  return <section className="daily-panel" aria-label={panel.title}>
    <header className="daily-panel-heading"><span>핵심을 한눈에</span><h3>{panel.title}</h3></header>
    {panel.metrics.length > 0 && <dl className="daily-panel-metrics">{panel.metrics.map((row, index) => <div key={index}><dt>{row.label}</dt><dd><strong>{row.value}</strong><span>{row.detail}</span></dd></div>)}</dl>}
    {panel.chart && <figure className="daily-panel-chart"><figcaption>{panel.chart.title}<span>단위: {panel.chart.unit} / 막대 시작점: 0</span></figcaption><ol>{panel.chart.rows.map((row, index) => <li key={index}><span className="daily-chart-label">{row.label}</span><span className="daily-chart-track" aria-hidden="true"><span style={{ width: `${row.value / maximum * 100}%` }} /></span><strong>{row.value.toLocaleString("ko-KR")}</strong></li>)}</ol><p>{panel.chart.note}</p></figure>}
    {panel.comparisons.length > 0 && <div className="daily-panel-comparisons">{panel.comparisons.map((row, index) => <section key={index}><h4>{row.label}</h4><dl><div><dt>비교 기준</dt><dd>{row.before}</dd></div><div><dt>이번 변화</dt><dd>{row.after}</dd></div></dl><p>{row.detail}</p></section>)}</div>}
    {panel.findings.length > 0 && <div className="daily-panel-findings">{panel.findings.map((row, index) => <section key={index}><span className="daily-panel-status">{STATES[row.status]}</span><h4>{row.label}</h4><p>{row.evidence}</p></section>)}</div>}
    <div className="daily-panel-conclusion"><strong>판단의 핵심</strong><p>{panel.conclusion}</p></div>
    <footer className="daily-panel-sources">근거: {panel.sources.map((row, index) => <a key={index} href={row.url} target="_blank" rel="noopener noreferrer">{row.title}</a>)}</footer>
  </section>;
}
