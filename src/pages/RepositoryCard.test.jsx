import { fireEvent, render, screen } from "@testing-library/react";
import RepositoryCard, { remarkRepositoryCards } from "./RepositoryCard";

const entry = { repository: "owner/tool", summary: "에이전트 작업을 연결하는 도구.", description: "Original repository description", language: "Python", topics: ["agents", "framework"] };
test("repository cards foreground Korean purpose, preserve original copy and expose metadata", () => {
  render(<RepositoryCard entry={JSON.stringify(entry)} />);
  expect(screen.getByRole("article", { name: "owner/tool" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "owner/tool" })).toHaveAttribute("href", "https://github.com/owner/tool");
  expect(screen.getByText(entry.summary)).toBeInTheDocument();
  expect(screen.getByText("Python")).toBeInTheDocument();
  expect(screen.getByText(entry.description)).not.toBeVisible();
  fireEvent.click(screen.getByText("원문 설명"));
  expect(screen.getByText(entry.description)).toBeVisible();
});
test("malformed repository identities cannot create external or executable links", () => {
  const { container } = render(<RepositoryCard entry={JSON.stringify({ ...entry, repository: "https://evil.example" })} />);
  expect(container).toBeEmptyDOMElement();
});
/* eslint-disable testing-library/no-node-access -- Markdown AST nodes, not DOM nodes. */
test("only repository entries in the open-source section become cards, retaining Markdown summaries", () => {
  const link = (url) => ({ type: "listItem", children: [{ type: "paragraph", children: [{ type: "link", url, children: [{ type: "text", value: "tool" }] }] }] });
  const citation = link("https://github.com/owner/citation");
  const repository = link("https://github.com/owner/tool");
  repository.children.push({ type: "list", children: [{ type: "listItem", children: [{ type: "paragraph", children: [{ type: "text", value: "한국어 요약: 실제 용도" }] }] }] });
  const tree = { type: "root", children: [{ type: "list", children: [citation] }, { type: "heading", depth: 2, children: [{ type: "text", value: "오늘 살펴볼 인기 오픈소스" }] }, { type: "list", children: [repository, link("https://github.com/owner/tool/issues")] }] };
  remarkRepositoryCards({ repositories: { "owner/tool": { description: entry.description, summaryKo: "이전 요약", language: "Python" } } })(tree);
  expect(citation.children[0].type).toBe("paragraph");
  expect(tree.children[2].data.hProperties.className).toBe("daily-repository-grid");
  const card = JSON.parse(repository.children[0].data.hProperties.entry);
  expect(card.summary).toBe("실제 용도");
  expect(card.description).toBe(entry.description);
  expect(card.language).toBe("Python");
  expect(tree.children[2].children[1].children[0].type).toBe("paragraph");
});
/* eslint-enable testing-library/no-node-access */
