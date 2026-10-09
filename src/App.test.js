import { fireEvent, render, screen } from '@testing-library/react';
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
  expect(document.querySelector('header [data-collection=Writing]')).toBeNull();
  fireEvent.click(document.querySelector('[data-open="article:customize"]'));
  fireEvent.click(screen.getByRole('button', { name: '글 본문 읽기 ↗' }));
  expect(mockNavigate).toHaveBeenCalledWith('/freeform/agent-customize');
  unmount();
  expect(window.cancelAnimationFrame).toHaveBeenCalled();
});

test('reader switches direct connections to graph and offers a profile section index', () => {
  render(<CosmosPage />);
  fireEvent.click(screen.getByRole('button', {name:'About',exact:true}));
  expect(screen.getByRole('navigation', {name:'소개 목차'})).toBeInTheDocument();
  expect(document.querySelectorAll('.profile-media figure')).toHaveLength(11);
  expect(screen.getByRole('button', {name:'그래프',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(document.querySelector('#connected-list')).not.toBeVisible();
  expect(screen.getByRole('group', {name:'직접 연결된 지식 그래프'})).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name:'AI 코딩 에이전트 커스터마이징 상세 보기',exact:true}));
  expect(document.querySelector('#reader-title')).toHaveTextContent('AI 코딩 에이전트 커스터마이징');
  expect(screen.queryByRole('navigation', {name:'소개 목차'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'목록',exact:true}));
  expect(document.querySelector('#connected-list')).toBeVisible();
});

test('ontology guide opens real examples and the review keeps its original paper as reference data', () => {
  render(<CosmosPage />);
  fireEvent.click(screen.getByRole('button', {name:'Ontology',exact:true}));
  expect(screen.getByRole('heading', {name:'경험을 연결하는 방법'})).toBeInTheDocument();
  fireEvent.click(document.querySelector('.ontology-network [data-read="review:tistory-handbook"]'));
  expect(document.querySelector('#reader-title')).toHaveTextContent('HANDBOOK.md / 논문 리뷰');
  expect(screen.getByRole('heading', {name:'리뷰한 원문'})).toBeInTheDocument();
  expect(screen.getByRole('link', {name:'논문 원문 읽기 ↗'})).toHaveAttribute('href','https://arxiv.org/abs/2607.25398');
  expect(document.querySelector('[data-read="publication:handbook"]')).toBeNull();
});

test('both introduction and ontology indexes highlight the section in the article viewport', () => {
  render(<CosmosPage />);
  for (const [menu, label] of [['About','Career'],['Ontology','항목 종류']]) {
    fireEvent.click(screen.getByRole('button',{name:menu,exact:true}));
    const article = document.querySelector('#reader-content');
    const buttons = [...document.querySelectorAll('#reader-list [data-section]')];
    const selected = buttons.find(b => b.textContent === label);
    const index = buttons.indexOf(selected);
    jest.spyOn(article,'getBoundingClientRect').mockReturnValue({top:100});
    buttons.forEach((b,i) => jest.spyOn(document.getElementById(b.dataset.section),'getBoundingClientRect').mockReturnValue({top:i<=index ? 110 : 800}));
    fireEvent.scroll(article);
    expect(selected).toHaveAttribute('aria-current','location');
    expect(buttons.filter(b=>b.hasAttribute('aria-current'))).toHaveLength(1);
    fireEvent.click(screen.getByRole('button',{name:'콘텐츠 닫기'}));
  }
});
