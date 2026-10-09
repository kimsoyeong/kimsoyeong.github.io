import { fireEvent, render, screen, within } from '@testing-library/react';
import { StrictMode } from 'react';
import CosmosPage from './components/Cosmos/CosmosPage';
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });



beforeEach(() => {
  window.history.replaceState(null, '', '/');
  window.matchMedia = jest.fn(() => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  const context = new Proxy({}, { get: (_, key) => key === 'createRadialGradient' ? () => ({ addColorStop: jest.fn() }) : key === 'measureText' ? () => ({ width: 50 }) : jest.fn() });
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
  jest.spyOn(window, 'cancelAnimationFrame');
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});

afterEach(() => jest.restoreAllMocks());

test('Cosmos toggles edges and preserves article routes across remounts', () => {
  const { unmount } = render(<StrictMode><CosmosPage /></StrictMode>);
  fireEvent.click(screen.getByRole('button', { name: 'Cosmos', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '연결선 켜짐' }));
  expect(screen.getByRole('button', { name: '연결선 꺼짐' })).toHaveAttribute('aria-pressed', 'false');
  expect(within(screen.getByRole('navigation',{name:'주 메뉴'})).queryByRole('button',{name:'Writing',exact:true})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'AI 코딩 에이전트 커스터마이징',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:'내용 살펴보기 ↗'}));
  fireEvent.click(screen.getByRole('button', { name: '글 본문 읽기 ↗' }));
  expect(mockNavigate).toHaveBeenCalledWith('/freeform/agent-customize');
  unmount();
  expect(window.cancelAnimationFrame).toHaveBeenCalled();
});

test('reader switches direct connections to graph and offers a profile section index', () => {
  render(<CosmosPage />);
  fireEvent.click(screen.getByRole('button', {name:'About',exact:true}));
  expect(screen.getByRole('navigation', {name:'소개 목차'})).toBeInTheDocument();
  expect(within(screen.getByRole('article')).getAllByRole('figure')).toHaveLength(11);
  expect(screen.getByRole('button', {name:'그래프',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByLabelText('직접 연결된 지식 목록')).not.toBeVisible();
  expect(screen.getByRole('group', {name:'직접 연결된 지식 그래프'})).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name:'AI 코딩 에이전트 커스터마이징 상세 보기',exact:true}));
  expect(screen.getByRole('heading',{name:'AI 코딩 에이전트 커스터마이징',level:1})).toBeInTheDocument();
  expect(screen.queryByRole('navigation', {name:'소개 목차'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'목록',exact:true}));
  expect(screen.getByLabelText('직접 연결된 지식 목록')).toBeVisible();
});

test('ontology guide opens real examples and the review keeps its original paper as reference data', () => {
  render(<CosmosPage />);
  fireEvent.click(screen.getByRole('button', {name:'Ontology',exact:true}));
  expect(screen.getByRole('heading', {name:'경험을 연결하는 방법'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'HANDBOOK.md 리뷰 상세 보기',exact:true}));
  expect(screen.getByRole('heading',{name:'HANDBOOK.md / 논문 리뷰',level:1})).toBeInTheDocument();
  expect(screen.getByRole('heading', {name:'리뷰한 원문'})).toBeInTheDocument();
  expect(screen.getByRole('link', {name:'논문 원문 읽기 ↗'})).toHaveAttribute('href','https://arxiv.org/abs/2607.25398');
  expect(screen.queryByRole('button',{name:/^HANDBOOK.md: A Benchmark/})).not.toBeInTheDocument();
});

test('both introduction and ontology indexes highlight the section in the article viewport', () => {
  render(<CosmosPage />);
  for (const [menu, label] of [['About','Career'],['Ontology','항목 종류']]) {
    fireEvent.click(screen.getByRole('button',{name:menu,exact:true}));
    const article = screen.getByRole('article');
    const buttons = within(screen.getByRole('navigation',{name:'콘텐츠 목록'})).getAllByRole('button').filter(b => b.dataset.section);
    const selected = buttons.find(b => b.textContent === label);
    const index = buttons.indexOf(selected);
    jest.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function () {
      if (this === article) return {top:100};
      const sectionIndex = buttons.findIndex(b => b.dataset.section === this.id);
      return {top:sectionIndex >= 0 && sectionIndex <= index ? 110 : 800};
    });
    fireEvent.scroll(article);
    expect(selected).toHaveAttribute('aria-current','location');
    expect(buttons.filter(b=>b.hasAttribute('aria-current'))).toHaveLength(1);
    fireEvent.click(screen.getByRole('button',{name:'콘텐츠 닫기'}));
  }
});

test('profile index lists top-level sections and keeps technology tags without leadership cards', () => {
  render(<CosmosPage />);
  fireEvent.click(screen.getByRole('button', {name:'About',exact:true}));
  const toc = within(screen.getByRole('navigation', {name:'소개 목차'}));
  expect(toc.getByRole('button',{name:'Capabilities',exact:true})).toBeInTheDocument();
  expect(toc.queryByRole('button',{name:'연구개발의 중심'})).not.toBeInTheDocument();
  expect(toc.queryByRole('button',{name:'연구에서 서비스까지'})).not.toBeInTheDocument();
  expect(toc.queryByRole('button',{name:'Roles & responsibilities'})).not.toBeInTheDocument();
  expect(toc.queryByRole('button',{name:'Technical writing'})).not.toBeInTheDocument();
  expect(screen.queryByRole('heading',{name:'Technical writing'})).not.toBeInTheDocument();
  const capabilities = within(screen.getByRole('group',{name:'Capabilities',exact:true}));
  expect(capabilities.queryByRole('button',{name:/에이전트 파트 리딩/})).not.toBeInTheDocument();
  const technologies = within(screen.getByRole('group',{name:'활용 기술'}));
  expect(technologies.getByRole('button',{name:'Python',exact:true})).toBeInTheDocument();
  expect(technologies.getByRole('button',{name:'LangGraph',exact:true})).toBeInTheDocument();
  fireEvent.click(technologies.getByRole('button',{name:'Python',exact:true}));
  expect(screen.getByRole('heading',{name:'Python',level:1})).toBeInTheDocument();
});

test('intro customization card opens architecture capability instead of a blog post', () => {
  render(<CosmosPage />);
  fireEvent.click(screen.getByRole('button',{name:'에이전트 설계 및 개발 역량 보기'}));
  expect(screen.getByRole('heading',{name:'Agent Design & Development',level:1})).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'글 본문 읽기 ↗'})).not.toBeInTheDocument();
});
