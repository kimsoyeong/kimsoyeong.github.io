import { act } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useNavigate, useParams } from "react-router-dom";
import DailyReport, { isReportDate, reportHeadings, validateDiagram } from "./DailyReport";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
// CRA's Jest runner does not transform the ESM-only markdown dependencies.
jest.mock("react-markdown", () => ({ __esModule: true, default: ({ children, components }) => <div>{children.split("\n").map((line, index) => {
  const heading = line.match(/^(#{2,3}) +(.+)$/);
  if (!heading) return <div key={index}>{line}</div>;
  const Heading = components[`h${heading[1].length}`];
  return <Heading key={index} node={{ position: { start: { line: index + 1 } } }}>{heading[2]}</Heading>;
})}</div> }));
jest.mock("remark-gfm", () => ({ __esModule: true, default: () => {} }));

const navigate = jest.fn();
const response = (body, status = 200) => Promise.resolve({ ok: status === 200, status, json: async () => body, text: async () => body });

beforeEach(() => {
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
  fetch.mockReturnValue(response({ dates: ["2026-01-01", "2026-01-03", "2026-01-02"] }));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  const archive = await screen.findByRole("region", { name: "날짜별 데일리 리포트" });
  await screen.findByRole("heading", { name: "날짜별 리포트 3" });
  const links = within(archive).getAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual(["/daily/2026-01-03", "/daily/2026-01-02", "/daily/2026-01-01"]);
  expect(within(links[0]).getByText("최신")).toBeInTheDocument();
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe("/daily-reports/index.json");
  fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-01-01" } });
  expect(navigate).toHaveBeenCalledWith("/daily/2026-01-01");
});

test("a dated report includes same-page TOC links, unique heading IDs, and a return to archive", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  const markdown = "# Daily Report\n## Agents\n### Pattern\n## Agents";
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: ["2026-01-01"] }) : response(markdown));
  render(<DailyReport />);
  await act(async () => { await Promise.resolve(); });
  const article = await screen.findByRole("article");
  const toc = screen.getByRole("navigation", { name: "리포트 목차" });
  expect(within(toc).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["#section-2", "#section-3", "#section-4"]);
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
  expect(await screen.findByText("선택한 날짜에 발행된 리포트가 없습니다.")).toBeInTheDocument();
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
