import { fireEvent, render, screen } from "@testing-library/react";
import { useNavigate, useParams } from "react-router-dom";
import DailyReport, { isReportDate, validateDiagram } from "./DailyReport";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
// CRA's Jest runner does not transform the ESM-only markdown dependencies.
jest.mock("react-markdown", () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
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

test("latest route reads newest available report and links the date archive", async () => {
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: ["2026-01-01", "2026-01-02"] }) : response("Verified report body"));
  render(<DailyReport />);
  expect(await screen.findByRole("article")).toHaveTextContent("Verified report body");
  expect(fetch).toHaveBeenCalledWith("/daily-reports/2026-01-02.md", expect.any(Object));
  expect(screen.getByText(/최근 리포트\(2026-01-02\)/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "2026-01-01" })).toHaveAttribute("href", "/daily/2026-01-01");
  fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-01-01" } });
  expect(navigate).toHaveBeenCalledWith("/daily/2026-01-01");
});

test("an explicit date remains readable when the index is unavailable", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response(null, 503) : response("Archived report"));
  render(<DailyReport />);
  expect(await screen.findByRole("article")).toHaveTextContent("Archived report");
});

test("missing reports have a useful empty state", async () => {
  useParams.mockReturnValue({ date: "2026-01-01" });
  fetch.mockImplementation((url) => url.endsWith("index.json") ? response({ dates: [] }) : response(null, 404));
  render(<DailyReport />);
  expect(await screen.findByText("선택한 날짜에 발행된 리포트가 없습니다.")).toBeInTheDocument();
});

test("invalid route dates are never fetched as file paths", async () => {
  useParams.mockReturnValue({ date: "2026-02-30" });
  fetch.mockReturnValue(response({ dates: [] }));
  render(<DailyReport />);
  expect(await screen.findByRole("alert")).toHaveTextContent("올바른 날짜가 아닙니다");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe("/daily-reports/index.json");
});
