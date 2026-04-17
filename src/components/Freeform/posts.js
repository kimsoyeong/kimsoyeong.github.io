import TurboQuantPost from "./posts/turboquant/TurboQuantPost";
import TriAttentionPost from "./posts/triattention/TriAttentionPost";
import AgentCustomizePost from "./posts/agentcustomize/AgentCustomizePost";

const posts = [
  {
    slug: "agent-customize",
    title: "AI 코딩 에이전트 커스터마이징",
    subtitle: "Instructions · Skills · Hooks 완전 정리",
    tag: "공식문서 정리 · 2026",
    date: "2026-04-17",
    category: "docs",
    thumbnail: "/assets/img/freeform/agent-customize.svg",
    desc: "Instructions, Skills, Hooks 그리고 CLAUDE.md / AGENTS.md의 차이와 관계를 공식 문서 기반으로 정리한 가이드.",
    tags: ["AI", "Claude Code", "GitHub Copilot", "Hooks"],
    component: AgentCustomizePost,
    toc: [
      { id: "overview", label: "전체 개념 개요" },
      { id: "instruction-files", label: "지시 파일 비교" },
      { id: "instructions", label: "Instructions 상세" },
      { id: "skills", label: "Skills 상세" },
      { id: "hooks", label: "Hooks 상세" },
      { id: "comparison", label: "한눈에 보는 비교표" },
      { id: "relationship", label: "세 개념의 관계" },
      { id: "skills-not-mcp", label: "Skills와 MCP/도구" },
      { id: "references", label: "참고 링크" },
    ],
  },
  {
    slug: "triattention",
    title: "TriAttention",
    subtitle: "삼각함수 KV 압축으로 효율적 장문 추론",
    tag: "논문 리뷰 · 2026 · arXiv:2604.04921",
    date: "2026-04-13",
    category: "paper",
    thumbnail: "/assets/img/freeform/triattention.svg",
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
    thumbnail: "/assets/img/freeform/turboquant.svg",
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
