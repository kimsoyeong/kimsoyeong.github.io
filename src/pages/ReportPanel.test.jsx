import { render, screen, within } from "@testing-library/react";
import ReportPanel, { parseReportPanel } from "./ReportPanel";

const panel = () => ({
  title: "질문 표현에 따른 평가 차이",
  metrics: [{ label: "비교 모델", value: "6개", detail: "연구진이 비교한 범위" }],
  comparisons: [{ label: "평가 방식", before: "질문 A", after: "질문 B", detail: "같은 모델과 아이디어를 비교" }],
  findings: [{ label: "판정의 민감도", status: "reported", evidence: "연구진의 실험 결과" }, { label: "일반화 범위", status: "limited", evidence: "다른 분야는 미검증" }],
  chart: { title: "동일 모델의 질문 민감도", unit: "%", note: "같은 평가 자료에서 두 질문 설정 비교", rows: [{ label: "설정 A", value: 93.5 }, { label: "설정 B", value: 40.9 }] },
  conclusion: "질문에 따른 결과 변화를 함께 점검한다.",
  sources: [{ title: "공식 연구 원문", url: "https://example.com/research" }],
});

test("visual summary distinguishes metrics, comparisons, attributed findings and conclusion", () => {
  render(<ReportPanel source={JSON.stringify(panel())} />);
  const summary = screen.getByRole("region", { name: "질문 표현에 따른 평가 차이" });
  expect(within(summary).getByText("6개")).toBeInTheDocument();
  expect(within(summary).getByText("비교 기준")).toBeInTheDocument();
  expect(within(summary).getByText("발표자 주장")).toBeInTheDocument();
  expect(within(summary).getByText("적용 한계")).toBeInTheDocument();
  expect(within(summary).getByText("93.5")).toBeInTheDocument();
  expect(within(summary).getByText("40.9")).toBeInTheDocument();
  expect(within(summary).getByText(/막대 시작점: 0/)).toBeInTheDocument();
  expect(within(summary).getByRole("link", { name: "공식 연구 원문" })).toHaveAttribute("href", "https://example.com/research");
});

test("non-numeric research can use findings without fabricating a chart", () => {
  const data = panel(); data.metrics = []; data.comparisons = []; data.chart = null;
  render(<ReportPanel source={JSON.stringify(data)} />);
  expect(screen.getByText("판정의 민감도")).toBeInTheDocument();
  expect(screen.queryByText(/막대 시작점/)).not.toBeInTheDocument();
});

test("invalid charts, unknown statuses, oversized blocks and unsafe source links are rejected", () => {
  for (const mutate of [
    (data) => { data.chart.rows[0].value = -1; },
    (data) => { data.chart.rows[0].value = "93.5"; },
    (data) => { data.chart.note = ""; },
    (data) => { data.findings[0].status = "invented"; },
    (data) => { data.sources[0].url = ["javascript", "alert(1)"].join(":"); },
    (data) => { data.sources[0].url = "https://user:password@example.com"; },
    (data) => { data.metrics = Array(4).fill(data.metrics[0]); },
  ]) { const data = panel(); mutate(data); expect(() => parseReportPanel(JSON.stringify(data))).toThrow(); }
  expect(() => parseReportPanel("x".repeat(24001))).toThrow();
});

test("malformed visual data leaves an accessible fallback instead of crashing the report", () => {
  render(<ReportPanel source="{broken json" />);
  expect(screen.getByRole("status")).toHaveTextContent("아래 본문과 출처");
});
