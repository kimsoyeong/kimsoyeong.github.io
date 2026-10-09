export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function cursorView(yaw, pitch, pointer, enabled) {
  const x = enabled ? clamp(pointer.x, -1, 1) : 0,
    y = enabled ? clamp(pointer.y, -1, 1) : 0;
  return {
    yaw: yaw + x * .12,
    pitch: pitch - y * .08,
    offsetX: x * 20,
    offsetY: y * 14
  };
}
export function randomGenerator(seed = 29) {
  return () => {
    seed = Math.imul(1664525, seed) + 1013904223 >>> 0;
    return seed / 4294967296;
  };
}
export function project(p, yaw, pitch, zoom, width, height, centerX = width / 2, centerY = height / 2) {
  const cy = Math.cos(yaw),
    sy = Math.sin(yaw),
    cx = Math.cos(pitch),
    sx = Math.sin(pitch);
  const x = p.x * cy + p.z * sy,
    z = -p.x * sy + p.z * cy,
    y = p.y * cx - z * sx,
    depth = p.y * sx + z * cx;
  const scale = 900 / (900 + depth) * zoom;
  return {
    x: centerX + x * scale,
    y: centerY + y * scale,
    z: depth,
    scale
  };
}
// Invert camera rotation at fixed depth so a node follows the pointer at any viewpoint.
export function moveInView(node, dx, dy, yaw, pitch, scale) {
  const x = dx / scale,
    y = dy / scale;
  node.x += x * Math.cos(yaw) + y * Math.sin(pitch) * Math.sin(yaw);
  node.y += y * Math.cos(pitch);
  node.z += x * Math.sin(yaw) - y * Math.sin(pitch) * Math.cos(yaw);
}
const lavender = {
  color: '#BDA7F5',
  light: '#7352ad',
  shade: '#4b396c'
};
const sky = {
  color: '#8CCFE8',
  light: '#246d89',
  shade: '#294d62'
};
const yellow = {
  color: '#F3DFA0',
  light: '#82621f',
  shade: '#67582f'
};
export const categories = {
  Project: {
    label: 'Projects',
    ...sky
  },
  Paper: {
    label: 'My papers',
    ...lavender
  },
  Patent: {
    label: 'Patents / drafts',
    ...yellow
  },
  Writing: {
    label: 'Writing',
    ...lavender
  },
  Review: {
    label: 'External reading',
    ...sky
  },
  Achievement: {
    label: 'Awards & talks',
    ...yellow
  },
  Person: {
    label: 'About me',
    ...lavender
  },
  Concept: {
    label: 'Concepts',
    ...sky
  },
  Technology: {
    label: 'Technologies',
    ...yellow
  },
  AgentSystem: {
    label: 'Agents & tools',
    ...sky
  }
};
export function categoryFor(type) {
  if (type === 'Section') return 'Writing';
  if (['ExternalPublication', 'ExternalWriting'].includes(type)) return 'Review';
  if (['Award', 'Presentation', 'Media', 'Event', 'Participation'].includes(type)) return 'Achievement';
  if (['RoleAssignment', 'Program', 'PublicationChannel', 'Education', 'Organization', 'Capability', 'Contribution', 'Experience', 'Credential'].includes(type)) return 'Person';
  if (['Agent', 'Tool'].includes(type)) return 'AgentSystem';
  return type;
}
export function assignPositions(nodes, edges) {
  const rnd = randomGenerator(97),
    byId = new Map(nodes.map(n => [n.id, n]));
  const clusters = {
    agents: [-175, -85, 60],
    papers: [215, -105, -40],
    models: [160, 165, 85],
    person: [-195, 165, -100],
    web: [-20, 220, 130]
  };
  const roots = new Map([['article:customize', [-245, -185, 100]]]);
  for (const n of nodes) {
    const id = n.id;
    n.cluster = categoryFor(n.type) === 'Person' ? 'person' : ['Paper', 'Patent', 'Writing', 'Review', 'Section'].includes(n.type) ? 'papers' : /har|yoco|sia|timeseries|tensor|garmin|teacher/.test(id) ? 'models' : /prupru|blooming|sobok|firebase|mysql|nginx|gcp|aws|mongodb/.test(id) ? 'web' : 'agents';
    let center = clusters[n.cluster],
      spread = 100;
    if (categoryFor(n.type) === 'Achievement') {
      center = [220, -50, 100];
      spread = 125;
    }
    if (roots.has(id)) {
      center = roots.get(id);
      spread = 0;
    }
    if (n.type === 'Section') {
      center = roots.get(n.articleId);
      spread = 76;
    }
    const a = rnd() * Math.PI * 2,
      u = rnd() * 2 - 1,
      r = (.5 + rnd() * .5) * spread;
    n.x = center[0] + r * Math.sqrt(1 - u * u) * Math.cos(a);
    n.y = center[1] + r * u;
    n.z = center[2] + r * Math.sqrt(1 - u * u) * Math.sin(a);
    n.degree = edges.filter(e => e.source === id || e.target === id).length;
    n.radius = n.type === 'Section' ? 2 : n.type === 'Technology' ? 3 : ['Project', 'Concept', 'Paper', 'Patent', 'Writing', 'Award', 'Presentation', 'Media'].includes(n.type) ? 7 : n.type === 'Person' ? 11 : 4;
  }
  // Keep stable semantic clusters while separating real nodes in all three axes.
  for (let iter = 0; iter < 70; iter++) for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i],
      b = nodes[j],
      dx = a.x - b.x,
      dy = a.y - b.y,
      dz = a.z - b.z,
      d = Math.hypot(dx, dy, dz) || .01;
    if (d < 35) {
      const push = (35 - d) * .025;
      a.x += dx / d * push;
      a.y += dy / d * push;
      a.z += dz / d * push;
      b.x -= dx / d * push;
      b.y -= dy / d * push;
      b.z -= dz / d * push;
    }
  }
  return byId;
}
