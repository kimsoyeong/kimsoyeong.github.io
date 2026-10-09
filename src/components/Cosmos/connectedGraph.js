import { relationLabel } from './relations';
import { project, moveInView, clamp, categories, categoryFor } from './spatial';

export function connectedSubgraph(id, nodes, edges) {
  const ids = new Set([id]);
  edges.filter(e => e.source === id || e.target === id).forEach(e => {
    ids.add(e.source); ids.add(e.target);
  });
  return { nodes: nodes.filter(n => ids.has(n.id)), edges: edges.filter(e => ids.has(e.source) && ids.has(e.target)) };
}

export function mountConnectedGraph(host, id, data, open) {
  const graph = connectedSubgraph(id, data.nodes, data.edges);
  let yaw = -.15, pitch = .1, zoom = 1, drag = null, positions = new Map();
  const others = graph.nodes.filter(n => n.id !== id);
  const nodes = graph.nodes.map(n => {
    const i = others.findIndex(o => o.id === n.id), angle = i * 2.399963;
    const y = i < 0 ? 0 : 1 - 2 * (i + .5) / others.length;
    const radius = Math.sqrt(1 - y * y);
    return { ...n, x: i < 0 ? 0 : Math.cos(angle) * radius * 210, y: y * 175, z: i < 0 ? 0 : Math.sin(angle) * radius * 150 };
  });
  host.innerHTML = '<svg aria-hidden="true"></svg><div class="connected-nodes"></div>';
  const svg = host.querySelector('svg'), layer = host.querySelector('.connected-nodes');
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
    const width = host.clientWidth || 650, height = host.clientHeight || 460;
    const scale = Math.min(width / 620, height / 460) * zoom;
    positions = new Map(nodes.map(n => [n.id, project(n, yaw, pitch, scale, width, height)]));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    for (const {edge, line} of lines) {
      const a = positions.get(edge.source), b = positions.get(edge.target);
      for (const [key, value] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y})) line.setAttribute(key, value);
      line.setAttribute('stroke-dasharray', edge.assertionStatus === 'sourced' ? '' : '3 5');
    }
    const boxes = [];
    for (const {node,button,label} of [...buttons].sort((a,b) => Number(b.node.id===id)-Number(a.node.id===id))) {
      const p = positions.get(node.id), labelWidth = Math.min(160, node.label.length * 7);
      button.style.left = `${p.x}px`; button.style.top = `${p.y}px`;
      button.style.zIndex = String(Math.round(1000-p.z));
      button.style.setProperty('--node-size', `${clamp(p.scale * (node.id===id ? 18 : 11),7,24)}px`);
      const box = {x:p.x-labelWidth/2,y:p.y+13,w:labelWidth,h:30};
      const overlap = boxes.some(b => box.x < b.x+b.w && box.x+box.w > b.x && box.y < b.y+b.h && box.y+box.h > b.y);
      label.classList.toggle('label-hidden',overlap); if (!overlap) boxes.push(box);
    }
  }
  const listeners = [];
  function on(type, fn) { host.addEventListener(type,fn); listeners.push(() => host.removeEventListener(type,fn)); }
  on('pointerdown', e => {
    if (e.button !== 0) return;
    const node = nodes.find(n => n.id === e.target.closest('button')?.dataset.connectedNode);
    drag = {x:e.clientX,y:e.clientY,total:0,node};
    host.setPointerCapture(e.pointerId); host.classList.add('is-dragging');
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
    if(host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
    if(clicked) open(clicked.id);
  });
  on('pointercancel', () => {drag=null;host.classList.remove('is-dragging');});
  on('click', e => { if(e.detail===0 && e.target.closest('button')?.dataset.connectedNode) open(e.target.closest('button').dataset.connectedNode); });
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(draw) : null;
  observer?.observe(host); draw();
  return () => { observer?.disconnect(); listeners.forEach(remove => remove()); };
}
