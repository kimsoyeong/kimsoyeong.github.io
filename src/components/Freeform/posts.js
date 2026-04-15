import TurboQuantPost from "./posts/turboquant/TurboQuantPost";
import TriAttentionPost from "./posts/triattention/TriAttentionPost";

const posts = [
  {
    slug: "triattention",
    title: "TriAttention",
    subtitle: "삼각함수 KV 압축으로 효율적 장문 추론",
    tag: "논문 리뷰 · 2026 · arXiv:2604.04921",
    date: "2026-04-13",
    category: "paper",
    thumbnail: null,
    desc: "KV Cache의 Q/K 집중 현상을 삼각함수 급수로 포착해, 장문 추론에서도 정확도와 처리량을 동시에 잡는 새로운 어텐션 메커니즘을 분석합니다.",
    tags: ["AI", "KV Cache", "Attention"],
    source: "https://arxiv.org/abs/2604.04921",
    component: TriAttentionPost,
    toc: [
      { id: "overview", label: "개요" },
      { id: "problem", label: "문제 정의" },
      { id: "concentration", label: "Q/K Concentration" },
      { id: "method", label: "설계" },
      { id: "results", label: "실험 결과" },
      { id: "appendix", label: "부록 핵심" },
      { id: "conclusion", label: "결론" },
      { id: "explainer", label: "개념 해설" },
      { id: "glossary", label: "용어 사전" },
    ],
  },
  {
    slug: "turboquant",
    title: "TurboQuant",
    subtitle: "벡터 양자화의 새 기준",
    tag: "논문 리뷰 · 2025 · arXiv:2504.19874",
    date: "2026-04-10",
    category: "paper",
    thumbnail: null,
    desc: "KV Cache 압축부터 최근접 이웃 탐색까지 — 이론적 하한선에 근접한 온라인 벡터 양자화의 동작 원리를 풀어냅니다.",
    tags: ["AI", "Quantization", "KV Cache"],
    source: "https://arxiv.org/abs/2504.19874",
    component: TurboQuantPost,
    toc: [
      { id: "problem", label: "문제 정의" },
      { id: "math-foundations", label: "수학적 기초" },
      { id: "overview", label: "전체 동작 파이프라인" },
      { id: "random-rotation", label: "랜덤 회전과 Beta 분포" },
      { id: "lloyd-max", label: "Lloyd-Max 스칼라 양자화" },
      { id: "qjl", label: "QJL 내적 편향 제거" },
      { id: "lower-bounds", label: "이론적 하한선" },
      { id: "experiments", label: "기존 방법론 비교" },
      { id: "summary", label: "핵심 요약 및 의의" },
      { id: "glossary", label: "용어 사전" },
    ],
  },
];

export const categories = [
  { key: "all", label: "All" },
  { key: "paper", label: "논문 리뷰" },
  { key: "docs", label: "공식문서" },
  { key: "article", label: "아티클" },
];

export default posts;
