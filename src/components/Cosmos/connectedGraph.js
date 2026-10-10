import { relationLabel } from './relations';
import { project, moveInView, clamp, categories, categoryFor } from './spatial';

export function connectedSubgraph(id, nodes, edges) {
  const ids = new Set([id]);
  edges.filter(e => e.source === id || e.target === id).forEach(e => {
    ids.add(e.source); ids.add(e.target);
  });
  return { nodes: nodes.filter(n => ids.has(n.id)), edges: edges.filter(e => ids.has(e.source) && ids.has(e.target)) };
}

const groupDefinitions = {
  Person: {label:'사람과 경험', x:-220, y:10},
  Writing: {label:'논문과 글', x:-245, y:-220},
  Review: {label:'외부 자료 리뷰', x:-445, y:-85},
  Project: {label:'프로젝트', x:30, y:-170},
  Concept: {label:'개념', x:285, y:-170},
  AgentSystem: {label:'에이전트 시스템', x:310, y:45},
  Technology: {label:'기술', x:210, y:235},
  Achievement: {label:'성과와 발표', x:-65, y:250}
};
const groupFor = type => type === 'Paper' ? 'Writing' : categoryFor(type);

export function connectedLayout(graph, selectedId) {
  const groups = Object.entries(groupDefinitions).map(([key, definition]) => ({
    ...definition, key, color:categories[key].color,
    members:graph.nodes.filter(n => groupFor(n.type) === key).sort((a,b) =>
      Number(b.id === selectedId) - Number(a.id === selectedId) || a.id.localeCompare(b.id))
  })).filter(g => g.members.length);
  const nodes = groups.flatMap(g => {
    g.radius = Math.max(36, Math.sqrt(g.members.length) * (g.key === 'Person' ? 23 : 32));
    return g.members.map((n,i) => {
      const angle = i * 2.399963, radius = i === 0 ? 0 : Math.sqrt(i / g.members.length) * g.radius;
      return {...n, x:g.x + Math.cos(angle)*radius, y:g.y + Math.sin(angle)*radius,
        z:i === 0 ? 0 : Math.sin(i*1.7)*24};
    });
  });
  // Normalize the occupied clusters so sparse details stay as readable as the profile.
  const minX = Math.min(...groups.map(g=>g.x-g.radius)), maxX = Math.max(...groups.map(g=>g.x+g.radius));
  const minY = Math.min(...groups.map(g=>g.y-g.radius-40)), maxY = Math.max(...groups.map(g=>g.y+g.radius+30));
  const cx=(minX+maxX)/2 || 0, cy=(minY+maxY)/2 || 0;
  nodes.forEach(n=>{n.x-=cx;n.y-=cy;});
  groups.forEach(g=>{g.x-=cx;g.y-=cy;});
  return {nodes, groups, width:maxX-minX || 200, height:maxY-minY || 200};
}

export function mountConnectedGraph(host, id, data, open) {
  const graph = connectedSubgraph(id, data.nodes, data.edges);
  const layout = connectedLayout(graph,id), {nodes,groups} = layout;
  let yaw = 0, pitch = 0, drag = null, positions = new Map();
  host.innerHTML = '<div class="connected-stage"><div class="connected-clusters" aria-hidden="true"></div><svg aria-hidden="true"></svg><div class="connected-nodes"></div></div><div class="connected-legend" role="group" aria-label="연결 그래프 범례"></div>';
  const stage = host.querySelector('.connected-stage'), svg = host.querySelector('svg'), layer = host.querySelector('.connected-nodes');
  const clusters = groups.map(g => {
    const fog = document.createElement('div'), label = document.createElement('span');
    fog.className='connected-cluster'; fog.style.setProperty('--cluster-color',g.color); label.textContent=g.label;
    fog.append(label); host.querySelector('.connected-clusters').append(fog);
    const entry = document.createElement('span'), dot = document.createElement('i');
    dot.style.background=g.color; entry.append(dot,document.createTextNode(`${g.label} ${g.members.length}`));
    host.querySelector('.connected-legend').append(entry);
    return {group:g,fog};
  });
  const lines = graph.edges.map(e => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${relationLabel(e.predicate)} (${e.predicate})`; line.append(title); svg.append(line);
    return {edge:e, line};
  });
  const buttons = nodes.map(n => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.connectedNode = n.id;
    button.setAttribute('aria-label', `${n.label} 상세 보기`); button.title = n.label;
    button.className = 'connected-node'; button.classList.toggle('is-center', n.id === id);
    button.style.setProperty('--node-color', categories[categoryFor(n.type)].color);
    const dot = document.createElement('i'), label = document.createElement('span');
    label.textContent = n.label; button.append(dot, label); layer.append(button);
    return {node:n, button, label};
  });
  function draw() {
    const width = stage.clientWidth || 650, height = stage.clientHeight || 480;
    const scale = Math.min((width-64) / layout.width, (height-60) / layout.height, 1.7);
    positions = new Map(nodes.map(n => [n.id, project(n, yaw, pitch, scale, width, height)]));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    for (const {edge, line} of lines) {
      const a = positions.get(edge.source), b = positions.get(edge.target);
      for (const [key, value] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y})) line.setAttribute(key, value);
      line.setAttribute('stroke-dasharray', edge.assertionStatus === 'sourced' ? '' : '3 5');
    }
    for (const {group,fog} of clusters) {
      const p=project({...group,z:0},yaw,pitch,scale,width,height);
      const size=(group.radius+45)*2*p.scale;
      fog.style.left=`${p.x}px`;fog.style.top=`${p.y}px`;fog.style.width=`${size}px`;fog.style.height=`${size}px`;
    }
    const boxes = [];
    const labelPriority = n => n.id === id ? 0 : n.type === 'Project' ? 1 : ['Capability','Experience','Paper','Writing','Media','Presentation'].includes(n.type) ? 2 : 3;
    for (const {node,button,label} of [...buttons].sort((a,b) => labelPriority(a.node)-labelPriority(b.node))) {
      const p = positions.get(node.id), labelWidth = Math.min(150, node.label.length * 6);
      const dotSize = node.id===id ? 18 : ['Project','Person'].includes(node.type) ? 10 : 7;
      button.style.left = `${p.x}px`; button.style.top = `${p.y}px`;
      button.style.zIndex = String(Math.round(1000-p.z));
      button.style.setProperty('--node-size', `${dotSize}px`);
      const box = {x:p.x-labelWidth/2-4,y:p.y+14,w:labelWidth+8,h:29};
      const overlap = boxes.some(b => box.x < b.x+b.w && box.x+box.w > b.x && box.y < b.y+b.h && box.y+box.h > b.y);
      const hidden = node.id!==id && (overlap || box.x<4 || box.x+box.w>width-4 || box.y+box.h>height-4);
      label.classList.toggle('label-hidden',hidden); if (!hidden) boxes.push(box);
    }
  }
  const listeners = [];
  function on(type, fn) { stage.addEventListener(type,fn); listeners.push(() => stage.removeEventListener(type,fn)); }
  function highlight(selected) {
    for (const {edge,line} of lines) line.style.opacity = selected ? (edge.source===selected || edge.target===selected ? '1' : '.15') : '';
  }
  on('pointerover',e=>highlight(e.target.closest('[data-connected-node]')?.dataset.connectedNode));
  on('pointerleave',()=>highlight(null));
  on('focusin',e=>highlight(e.target.closest('[data-connected-node]')?.dataset.connectedNode));
  on('focusout',()=>highlight(null));
  on('pointerdown', e => {
    if (e.button !== 0) return;
    const node = nodes.find(n => n.id === e.target.closest('button')?.dataset.connectedNode);
    drag = {x:e.clientX,y:e.clientY,total:0,node};
    stage.setPointerCapture(e.pointerId); host.classList.add('is-dragging');
  });
  on('pointermove', e => {
    if (!drag) return;
    const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
    drag.total+=Math.hypot(dx,dy); drag.x=e.clientX; drag.y=e.clientY;
    if(drag.node) moveInView(drag.node,dx,dy,yaw,pitch,positions.get(drag.node.id).scale);
    else {yaw+=dx*.008; pitch=clamp(pitch+dy*.008,-1.3,1.3);}
    draw();
  });
  on('pointerup', e => {
    const clicked = drag?.total < 5 ? drag.node : null;
    drag=null; host.classList.remove('is-dragging');
    if(stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    if(clicked) open(clicked.id);
  });
  on('pointercancel', () => {drag=null;host.classList.remove('is-dragging');});
  on('click', e => { if(e.detail===0 && e.target.closest('button')?.dataset.connectedNode) open(e.target.closest('button').dataset.connectedNode); });
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
  observer?.observe(host); draw();
  return () => { observer?.disconnect(); listeners.forEach(remove => remove()); };
}
