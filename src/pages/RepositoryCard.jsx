import React from "react";

const nodeText = (node) => node.value || (node.children || []).map(nodeText).join("");
const identity = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/?$/i;

// Only the dedicated open-source section becomes cards; article citations stay links.
export function remarkRepositoryCards({ repositories = {} } = {}) {
  return (tree) => {
    let active = false;
    tree.children.forEach((node) => {
      if (node.type === "heading" && node.depth <= 2) active = /^(오늘 살펴볼 인기 오픈소스|GitHub Trending \/ 수집 시점 스냅샷)$/.test(nodeText(node).trim());
      if (!active || node.type !== "list") return;
      let cards = 0;
      node.children.forEach((item) => {
        const paragraph = item.children?.[0];
        const link = paragraph?.type === "paragraph" && paragraph.children?.length === 1 && paragraph.children[0].type === "link" ? paragraph.children[0] : null;
        const match = link?.url?.match(identity);
        if (!match) return;
        const repository = match[1];
        const stored = repositories[repository.toLowerCase()] || {};
        const details = item.children.filter((child) => child.type === "list").flatMap((child) => child.children.map(nodeText));
        const field = (label) => details.find((line) => line.startsWith(`${label}:`))?.slice(label.length + 1).trim();
        const information = field("확인할 점") || "";
        const language = information.match(/주 언어\s+([^/]+)/)?.[1]?.trim() || stored.language || "";
        const topics = information.match(/주제\s+(.+?)(?:\s*\/\s*주 언어|$)/)?.[1]?.split(/,\s*/) || stored.topics || [];
        const entry = { repository, description: field("원문 설명") || stored.description || "", summary: field("한국어 요약") || stored.summaryKo || field("용도") || "공개된 한국어 요약이 없습니다. 원문에서 용도를 확인하세요.", language, topics: topics.slice(0, 4) };
        item.children = [{ type: "repositoryCard", data: { hName: "repository-card", hProperties: { entry: JSON.stringify(entry) } } }];
        item.data = { hProperties: { className: "daily-repository-item" } };
        cards += 1;
      });
      if (cards) node.data = { hProperties: { className: "daily-repository-grid" } };
    });
  };
}

export default function RepositoryCard({ entry }) {
  let data;
  try { data = JSON.parse(entry); } catch { return null; }
  if (!data || typeof data.repository !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(data.repository)) return null;
  const [owner, name] = data.repository.split("/");
  const value = (text, max = 600) => typeof text === "string" ? text.slice(0, max) : "";
  const topics = Array.isArray(data.topics) ? data.topics.filter((topic) => typeof topic === "string").slice(0, 4) : [];
  return <article className="daily-repository-card" aria-label={data.repository}>
    <header><a href={`https://github.com/${data.repository}`} aria-label={data.repository} target="_blank" rel="noopener noreferrer"><span className="daily-repository-owner">{owner}</span><strong>{name}</strong><span className="daily-repository-arrow" aria-hidden="true">↗</span></a></header>
    <p className="daily-repository-summary">{value(data.summary, 200)}</p>
    {(data.language || topics.length > 0) && <div className="daily-repository-tags" aria-label="언어와 주제">{data.language && <span className="daily-repository-language">{value(data.language, 40)}</span>}{topics.map((topic) => <span key={topic}>{topic.slice(0, 50)}</span>)}</div>}
    <details className="daily-repository-original"><summary>원문 설명</summary><p>{value(data.description) || "저장소에 공개된 원문 설명이 없습니다."}</p></details>
  </article>;
}
