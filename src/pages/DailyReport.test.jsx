import { act } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useNavigate, useParams } from "react-router-dom";
import mermaid from "mermaid";
import DailyReport, { isReportDate, monthCalendar, prepareReportMarkdown, reportCollectedAt, reportHeadings, reportSummary, remarkReportNotes, safeImageUrl, validateDiagram } from "./DailyReport";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
// CRA's Jest runner does not transform the ESM-only markdown dependencies.
jest.mock("react-markdown", () => ({ __esModule: true, default: ({ children, components }) => <div>{children.split("\n").map((line, index) => {
  const heading = line.match(/^(#{1,3}) +(.+)$/);
  if (heading) {
    const Heading = components[`h${heading[1].length}`];
    return <Heading key={index} node={{ position: { start: { line: index + 1 } } }}>{heading[2]}</Heading>;
  }
  const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (image) { const Image = components.img; return <p key={index}><Image src={image[2]} alt={image[1]} /></p>; }
  const link = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)$/);
  if (link) { const Anchor = components.a; return <p key={index}><Anchor href={link[2]}>{link[1]}</Anchor></p>; }
  return <div key={index}>{line}</div>;
})}{[...children.matchAll(/```mermaid\n([\s\S]*?)\n```/g)].map((match, index) => {
  const Pre = components.pre;
  return <Pre key={`diagram-${index}`}><code className="language-mermaid">{match[1]}</code></Pre>;
})}</div> }));
jest.mock("remark-gfm", () => ({ __esModule: true, default: () => {} }));
jest.mock("mermaid", () => ({ __esModule: true, default: {
  initialize: jest.fn(),
  render: jest.fn(async () => ({ svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><rect width="100" height="100"/><foreignObject><div>unsafe</div></foreignObject></svg>' })),
} }), { virtual: true });

const navigate = jest.fn();
const response = (body, status = 200) => Promise.resolve({ ok: status === 200, status, json: async () => body, text: async () => body });

beforeEach(() => {
  localStorage.clear();
  mermaid.render.mockResolvedValue({ svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"><rect width="100" height="100"/><foreignObject><div>unsafe</div></foreignObject></svg>' });
  useParams.mockReturnValue({});
  useNavigate.mockReturnValue(navigate);
  global.fetch = jest.fn();
});
afterEach(() => { jest.clearAllMocks(); delete global.fetch; });

test("dates reject malformed and impossible calendar days", () => {
  expect(isReportDate("2026-10-27")).toBe(true);
  for (const value of ["2026-02-30", "2026-13-01", "../secret", "2026-1-01", null]) expect(isReportDate(value)).toBe(false);
});

test("diagram guard permits vertical flows and rejects configuration, actions, styling, and HTML", () => {
  expect(validateDiagram('graph TD\n A[Input] --> B[Agent]\n B --> C[Result]')).toContain("graph TD");
  for (const source of ["graph LR\n A-->B", "graph TD\n click A call evil()", "%%{init: {}}%%\ngraph TD\n A-->B", "graph TD\n style A fill:red", 'graph TD\n A[<img src=x>]', "graph TD\n direction LR\n A-->B"]) expect(() => validateDiagram(source)).toThrow();
});

test("the landing page lists every date newest first without fetching any report body", async () => {
  fetch.mockReturnValue(response({ dates: ["2026-01-01", "2026-01-03", "2026-01-02"], reports: [{date: "2026-01-03", title: "Agent 실행 구조와 검증 패턴"}] }));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  const archive = await screen.findByRole("region", { name: "날짜별 데일리 리포트" });
  await screen.findByRole("heading", { name: "날짜별 리포트 3" });
  const links = within(archive).getAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual(["/daily/2026-01-03", "/daily/2026-01-02", "/daily/2026-01-01"]);
  expect(within(links[0]).getByText("최신")).toBeInTheDocument();
  expect(within(links[0]).getByText("Agent 실행 구조와 검증 패턴")).toBeInTheDocument();
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe("/daily-reports/index.json");
  fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-01-01" } });
  expect(navigate).toHaveBeenCalledWith("/daily/2026-01-01");
});

test("a dated report includes same-page TOC links, unique heading IDs, and a return to archive", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  const markdown = "# Daily Report\n## 1. Agents\n### Pattern\n## Agents";
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: ["2026-01-01"], reports: [{date: "2026-01-01", title: "도구 호출과 검증 구조의 변화"}] }) : response(markdown));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  const article = await screen.findByRole("article");
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("도구 호출과 검증 구조의 변화");
  expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent("Daily Report");
  expect(screen.getByText("2026-01-01", { selector: "time" })).toBeInTheDocument();
  const toc = screen.getByRole("navigation", { name: "리포트 목차" });
  expect(within(toc).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["#section-2", "#section-3", "#section-4"]);
  expect(within(toc).queryByRole("link", { name: "1. Agents" })).not.toBeInTheDocument();
  expect(within(toc).getAllByRole("link", { name: "Agents" })).toHaveLength(2);
  for (const link of within(toc).getAllByRole("link")) {
    expect(link).not.toHaveAttribute("target", "_blank");
  }
  within(article).getAllByRole("heading").forEach((heading, position) => expect(heading).toHaveAttribute("id", `section-${position + 2}`));
  expect(screen.getByRole("link", { name: "← 리포트 목록" })).toHaveAttribute("href", "/daily");
  expect(fetch).toHaveBeenCalledWith("/daily-reports/2026-01-01.md", expect.any(Object));
});

test("TOC extraction skips fenced code and gives duplicate titles unique anchors", () => {
  const markdown = "## Agents\n```mermaid\n## Ignored\n```\n### Details\n~~~text\n## Also ignored\n~~~\n## Agents";
  expect(reportHeadings(markdown)).toEqual([
    { id: "section-1", depth: 2, label: "Agents" },
    { id: "section-5", depth: 3, label: "Details" },
    { id: "section-9", depth: 2, label: "Agents" },
  ]);
});

test("an explicit date remains readable when the index is unavailable", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response(null, 503) : response("Archived report"));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  expect(await screen.findByRole("article")).toHaveTextContent("Archived report");
});

test("missing reports have a useful empty state", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [] }) : response(null, 404));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  expect(await screen.findByText("선택한 날짜에 발행된 리포트가 없습니다. 목록에서 다른 날짜를 선택하세요.")).toBeInTheDocument();
});

test("invalid route dates are never fetched as file paths", async () => {
  useParams.mockReturnValue({ date: "2026-02-30" });
  fetch.mockReturnValue(new Promise(() => {}));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  expect(screen.getByRole("alert")).toHaveTextContent("올바른 날짜가 아닙니다");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe("/daily-reports/index.json");
});


test("legacy metadata moves the collected timestamp out of the body without moving TOC line positions", () => {
  const original = "# Daily Report / 2026-10-28\n\n> AI Agent / Agentic AI / LLM / Architecture / Framework / Pattern\n\n- 수집: 2026-10-28 07:00 KST\n- 범위: 최근 24시간\n- 사실 요약과 해석은 출처 원문으로 재확인\n\n## Agent orchestration\n- 수집: this is normal article content";
  const prepared = prepareReportMarkdown(original);
  expect(reportCollectedAt(original)).toBe("2026-10-28 07:00 KST");
  expect(prepared).not.toContain("수집: 2026-10-28 07:00 KST");
  expect(prepared).not.toContain("AI Agent / Agentic AI / LLM / Architecture / Framework / Pattern");
  expect(prepared).not.toContain("범위: 최근 24시간");
  expect(prepared).not.toContain("사실 요약과 해석은 출처 원문으로 재확인");
  expect(prepared).toContain("## Agent orchestration\n- 수집: this is normal article content");
  expect(prepared.split("\n")).toHaveLength(original.split("\n").length);
  expect(reportHeadings(prepared)).toEqual(reportHeadings(original));
});

test("calendar navigation links only published days and preserves summary titles", async () => {
  const currentMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).slice(0, 7);
  const day = `${currentMonth}-05`;
  fetch.mockReturnValue(response({ dates: [day], reports: [{ date: day, title: "LLM 런타임과 에이전트 설계" }] }));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  const calendar = screen.getByRole("region", { name: "월별 데일리 리포트" });
  expect(within(calendar).getAllByRole("link")).toHaveLength(1);
  expect(within(calendar).getByRole("link", { name: `${day} / LLM 런타임과 에이전트 설계` })).toHaveAttribute("href", `/daily/${day}`);
  fireEvent.click(within(calendar).getByRole("button", { name: "이전 달" }));
  expect(within(calendar).queryByRole("link")).not.toBeInTheDocument();
  fireEvent.click(within(calendar).getByRole("button", { name: "다음 달" }));
  expect(within(calendar).getAllByRole("link")).toHaveLength(1);
});

test("month calendar handles leap days and weekday alignment", () => {
  const weeks = monthCalendar("2024-02");
  expect(weeks[0]).toEqual([null, null, null, null, "2024-02-01", "2024-02-02", "2024-02-03"]);
  expect(weeks.flat().filter(Boolean)).toHaveLength(29);
  expect(weeks.flat()).toContain("2024-02-29");
});

test("theme defaults to light and remembers the explicit dark-mode choice", async () => {
  fetch.mockReturnValue(response({ dates: [] }));
  const { unmount } = render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  const toggle = screen.getByRole("button", { name: "다크 모드" });
  expect(toggle).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(localStorage.getItem("daily-report-theme")).toBe("dark");
  unmount();
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  expect(screen.getByRole("button", { name: "다크 모드" })).toHaveAttribute("aria-pressed", "true");
});

test("Mermaid rerenders in the selected theme and removes foreignObject elements", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  const body = "# Daily Report\n## Flow\n```mermaid\ngraph TD\n A[Agent] --> B[Result]\n```";
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [] }) : response(body));
  render(<DailyReport />);
  await screen.findByRole("img", { name: "위에서 아래로 읽는 시스템 흐름도" });
  expect(mermaid.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ securityLevel: "strict", htmlLabels: false, themeVariables: expect.objectContaining({ darkMode: false }) }));
  expect(screen.queryByText("unsafe")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다크 모드" }));
  await waitFor(() => expect(mermaid.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ themeVariables: expect.objectContaining({ darkMode: true }) })));
  expect(mermaid.render).toHaveBeenCalledTimes(2);
});


test("historical reports show exactly three grounded meaning bullets above the TOC", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  const body = "# Daily Report\n## 1. Permissions\n- **의미:** 계정 권한을 제한한다.\n## 2. Verification\n- **의미:** 외부 검증이 필요하다.\n## 3. Costs\n- **의미:** 실제 실행 비용을 비교한다.";
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [] }) : response(body));
  render(<DailyReport />);
  const summary = await screen.findByRole("complementary", { name: "오늘의 요약" });
  expect(within(summary).getByRole("heading", { name: "오늘의 3줄 요약" })).toBeInTheDocument();
  expect(within(summary).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["계정 권한을 제한한다.", "외부 검증이 필요하다.", "실제 실행 비용을 비교한다."]);
});

test("new summary blocks render once and leave section line anchors unchanged", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  const body = "# Daily Report\n\n> 수집: 2026-01-01 07:12 KST\n\n> **오늘의 3줄 요약**\n> - 첫 번째 요약\n> - 두 번째 요약\n> - 세 번째 요약\n\n## 1. Agents\n- **의미:** fallback should not be used";
  const prepared = prepareReportMarkdown(body);
  expect(reportSummary(body)).toEqual(["첫 번째 요약", "두 번째 요약", "세 번째 요약"]);
  expect(prepared).not.toContain("오늘의 3줄 요약");
  expect(prepared).not.toContain("첫 번째 요약");
  expect(reportHeadings(prepared)).toEqual(reportHeadings(body));
  expect(reportSummary("## Agents\n- **의미:** 근거가 있는 한 줄")).toEqual(["근거가 있는 한 줄"]);
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [] }) : response(body));
  render(<DailyReport />);
  await screen.findByRole("complementary", { name: "오늘의 요약" });
  expect(screen.getAllByText("오늘의 3줄 요약")).toHaveLength(1);
  expect(screen.getAllByText("첫 번째 요약")).toHaveLength(1);
  expect(screen.getAllByText("수집: 2026-01-01 07:12 KST")).toHaveLength(1);
  expect(within(screen.getByRole("article")).queryByText(/수집:/)).not.toBeInTheDocument();
  expect(screen.queryByText("매일 07:00 KST / 최근 24시간")).not.toBeInTheDocument();
});

test("legacy GitHub section gets a clear heading and verified repository descriptions", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  const body = "# Daily Report\n## GitHub Trending / 수집 시점 스냅샷\n\n- 지난 24시간 내 신규 발표를 뜻하지 않는다. 순위는 수집 시점에 따라 달라진다.\n\n- [owner/repo](https://github.com/owner/repo)\n- [Issues](https://github.com/owner/repo/issues)";
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [], repositories: { "owner/repo": { description: "Verified repository purpose", language: "Python" } } }) : response(body));
  render(<DailyReport />);
  const article = await screen.findByRole("article");
  expect(within(article).getByRole("heading", { name: "오늘 살펴볼 인기 오픈소스" })).toHaveAttribute("id", "section-2");
  expect(within(screen.getByRole("navigation", { name: "리포트 목차" })).getByRole("link", { name: "오늘 살펴볼 인기 오픈소스" })).toHaveAttribute("href", "#section-2");
  expect(within(article).getByText(/GitHub의 일간 Trending에 오른 저장소 중 이전 리포트에서 소개하지 않은 항목입니다/)).toBeInTheDocument();
  expect(within(article).getAllByText("Verified repository purpose")).toHaveLength(1);
  expect(fetch).toHaveBeenCalledTimes(2);
});


test("today is explicitly marked in both calendar and mobile archive", async () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  fetch.mockReturnValue(response({ dates: [today], reports: [{ date: today, title: "오늘의 기술 변화" }] }));
  render(<DailyReport />);
  const archive = await screen.findByRole("region", { name: "날짜별 데일리 리포트" });
  expect(within(archive).getByText("오늘")).toHaveClass("daily-badge-today");
  const calendar = screen.getByRole("region", { name: "월별 데일리 리포트" });
  const badge = within(calendar).getByText("오늘");
  expect(badge).toHaveClass("daily-today-label");
  expect(within(calendar).getAllByRole("cell").filter((cell) => cell.getAttribute("aria-current") === "date")).toHaveLength(1);
});

test("verified summary overrides replace historical generic meaning bullets", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  const lines = ["Genie가 음성과 3D 장면을 함께 생성한다.", "긴 세션에서 사물이 유지되지 않는다.", "외부 검증 결과는 아직 공개되지 않았다."];
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [], summaries: { "2026-01-01": lines } }) : response("## World model\n- **의미:** 연구 방향과 한계를 보여준다."));
  render(<DailyReport />);
  const summary = await screen.findByRole("complementary", { name: "오늘의 요약" });
  expect(within(summary).getAllByRole("listitem").map((item) => item.textContent)).toEqual(lines);
});

test("source images retain original HTTPS URLs and expose a useful fallback", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [] }) : response("## Architecture\n![원문 아키텍처](https://example.com/architecture.png)\n![Unsafe](http://example.com/tracker.png)"));
  render(<DailyReport />);
  const image = await screen.findByRole("img", { name: "원문 아키텍처" });
  expect(image).toHaveAttribute("src", "https://example.com/architecture.png");
  expect(image).toHaveAttribute("loading", "lazy");
  expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
  expect(screen.queryByRole("img", { name: "Unsafe" })).not.toBeInTheDocument();
  fireEvent.error(image);
  expect(screen.queryByRole("img", { name: "원문 아키텍처" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "원본 이미지에서 확인 ↗" })).toHaveAttribute("href", "https://example.com/architecture.png");
});

test("source image URL guard rejects unsafe schemes and embedded credentials", () => {
  expect(safeImageUrl("https://example.com/diagram.svg")).toBe("https://example.com/diagram.svg");
  for (const value of [["javascript", "alert(1)"].join(":"), "data:image/png;base64,eA==", "http://example.com/a.png", "//example.com/a.png", "https://user:pass@example.com/a.png", undefined]) expect(safeImageUrl(value)).toBe("");
});

test("legacy collection IDs stay internal while citations and heading anchors survive", () => {
  const body = "## 1. 결제 권한\n- 발표: 업무협약을 맺었다. (S3)\n- 발표: 기업 통제와 에이전트 IAM을 다룬 보도가 수집됐다. (S6, S14)\n- [S3] [기사 제목](https://example.com/article)\n```text\n(S3)\n```";
  const rendered = prepareReportMarkdown(body);
  expect(rendered).toContain("- 업무협약을 맺었다.");
  expect(rendered).toContain("접근 권한 관리(IAM)");
  expect(rendered).not.toContain("보도가 수집됐다");
  expect(rendered).not.toContain("(S6, S14)");
  expect(rendered).toContain("- [기사 제목](https://example.com/article)");
  expect(rendered).toContain("```text\n(S3)\n```");
  expect(rendered.split("\n")).toHaveLength(body.split("\n").length);
});

/* eslint-disable testing-library/no-node-access -- These are Markdown AST nodes, not DOM nodes. */
test("report note tags handle legacy text and bold labels without altering prose or links", () => {
  const labels = ["해석", "의미", "실행", "기술/산업 영향", "검증 행동", "한계"];
  const items = labels.map((label, index) => ({ type: "listItem", children: [{ type: "paragraph", children: index === 0 ? [{ type: "text", value: `${label}: 실제 변화` }] : [{ type: "strong", children: [{ type: "text", value: `${label}:` }] }, { type: "text", value: " 실제 변화" }, { type: "link", url: "https://example.com", children: [{ type: "text", value: "근거" }] }] }] }));
  const plain = { type: "listItem", children: [{ type: "paragraph", children: [{ type: "text", value: "일반 본문" }] }] };
  const tree = { type: "root", children: [{ type: "list", children: [...items, plain] }] };
  remarkReportNotes()(tree);
  expect(items.map((item) => item.children[0].children[0].children[0].value)).toEqual(labels);
  items.forEach((item) => expect(item.data.hProperties.className).toBe("daily-note"));
  expect(items[1].children[0].children[2].url).toBe("https://example.com");
  expect(items[0].children[0].children[1].value).toBe(" 실제 변화");
  expect(plain.data).toBeUndefined();
});
/* eslint-enable testing-library/no-node-access */
