/* ==========================================================================
   Graper Labs — Interactive Grape Ontology
   The eleven-grape logo, drawn as a living knowledge graph.
   Plain JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------- data ---------------------------------- */
  const LAYER_LABEL = {
    flagship: 'Flagship',
    ai: 'AI & Intelligence',
    commerce: 'Commerce & Content',
    platform: 'Platform & Data'
  };

  const NODES = [
    { key:'cindiel', id:'01', name:'CINDIEL', color:'#d637d9', layer:'flagship',
      role:'Flagship AI Fashion Story-Commerce',
      desc:'The flagship platform where the eleven nodes become one shopping flow.',
      row:1, col:-0.5, scale:0.89,
      links:['lens','fitting','story','trend','catalog','ontology'] },

    { key:'lens', id:'02', name:'AI Visual Lens', color:'#972be7', layer:'ai',
      role:'Outfit & Garment Matching',
      desc:'Reads a look and matches it to garments in the catalog.',
      row:0, col:-1, scale:0.76,
      links:['catalog','fitting','cindiel'] },

    { key:'fitting', id:'03', name:'Virtual Fitting', color:'#721bee', layer:'ai',
      role:'Digital Silhouette Try-On',
      desc:'Projects a garment onto a digital silhouette before purchase.',
      row:1, col:-1.5, scale:0.76,
      links:['catalog','lens','cindiel'] },

    { key:'story', id:'04', name:'Story Commerce', color:'#ea517d', layer:'commerce',
      role:'Content-to-Purchase Routing',
      desc:'Turns reels and lookbooks into a buying path.',
      row:1, col:0.5, scale:0.76,
      links:['cindiel','studio','creators'] },

    { key:'creators', id:'05', name:'Global Creators', color:'#ec6845', layer:'commerce',
      role:'KR · JP · TH Style Network',
      desc:'A creator network that feeds the cluster with looks and stories.',
      row:1, col:1.5, scale:0.76,
      links:['story','studio','trend'] },

    { key:'trend', id:'06', name:'Trend Curation', color:'#f4bf55', layer:'ai',
      role:'Real-time Style Signals',
      desc:'Collects live style signals and decides what to show next.',
      row:0, col:1, scale:0.76,
      links:['creators','cindiel','ontology'] },

    { key:'catalog', id:'07', name:'Product Catalog', color:'#b32fe0', layer:'platform',
      role:'Structured Apparel Data',
      desc:'Shared apparel records every node reads and writes.',
      row:2, col:-1, scale:0.76,
      links:['lens','fitting','ontology','cindiel'] },

    { key:'agents', id:'08', name:'AI Agents', color:'#e7439b', layer:'ai',
      role:'Autonomous Ops & Orchestration',
      desc:'Agents that run recurring content and publishing work.',
      row:2, col:0, scale:0.76,
      links:['core','studio','ontology'] },

    { key:'studio', id:'09', name:'Content Studio', color:'#ea514c', layer:'commerce',
      role:'AI Lookbook & Reels Pipeline',
      desc:'Produces lookbooks and short-form video from one brief.',
      row:2, col:1, scale:0.76,
      links:['agents','story','creators'] },

    { key:'core', id:'10', name:'Platform Core', color:'#e8458f', layer:'platform',
      role:'Web & Mobile Architecture',
      desc:'The web and mobile layer that serves every node.',
      row:3, col:0, scale:0.78,
      links:['cindiel','agents','lens'] },

    { key:'ontology', id:'11', name:'Data Ontology', color:'#e85096', layer:'platform',
      role:'Unified Fashion Knowledge Graph',
      desc:'The graph itself: shared entities, relations, and rules.',
      row:0, col:0, scale:0.80,
      links:['catalog','trend','agents','cindiel'] }
  ];

  const byKey = {};
  NODES.forEach(n => { byKey[n.key] = n; });

  // Typed relations: every edge says *why* the two berries are connected.
  const RELATIONS = [
    { from:'cindiel', to:'lens',      fwd:'calls',     back:'serves',       why:'reads every uploaded look' },
    { from:'cindiel', to:'fitting',   fwd:'calls',     back:'serves',       why:'projects the try-on' },
    { from:'cindiel', to:'story',     fwd:'runs',      back:'run by',       why:'turns content into checkout' },
    { from:'cindiel', to:'trend',     fwd:'reads',     back:'curates for',  why:'decides what to show next' },
    { from:'cindiel', to:'catalog',   fwd:'reads',     back:'supplies',     why:'stock, sizes, attributes' },
    { from:'cindiel', to:'ontology',  fwd:'writes to', back:'describes',    why:'logs every match as an edge' },
    { from:'lens',    to:'fitting',   fwd:'feeds',     back:'refines',      why:'hands over the match' },
    { from:'lens',    to:'catalog',   fwd:'queries',   back:'answers',      why:'embeddings against garments' },
    { from:'fitting', to:'catalog',   fwd:'queries',   back:'answers',      why:'sizes and silhouettes' },
    { from:'studio',  to:'story',     fwd:'routes to', back:'sources from', why:'a reel becomes the storefront' },
    { from:'story',   to:'creators',  fwd:'draws from',back:'earns via',    why:'creator looks and stories' },
    { from:'trend',   to:'creators',  fwd:'signals',   back:'informs',      why:'what the network should make' },
    { from:'trend',   to:'ontology',  fwd:'records',   back:'aggregates',   why:'live signals stored as data' },
    { from:'catalog', to:'ontology',  fwd:'maps into', back:'structures',   why:'structured apparel entities' },
    { from:'agents',  to:'core',      fwd:'deploys on',back:'hosts',        why:'runs scheduled jobs' },
    { from:'agents',  to:'studio',    fwd:'automates', back:'operated by',  why:'lookbooks and reels' },
    { from:'agents',  to:'ontology',  fwd:'queries',   back:'serves',       why:'reads state before acting' },
    { from:'core',    to:'lens',      fwd:'hosts',     back:'runs on',      why:'serves the model to users' },
    { from:'core',    to:'cindiel',   fwd:'hosts',     back:'runs on',      why:'web and mobile surface' }
  ];

  const EDGES = RELATIONS.map((r, i) => Object.assign({}, r, {
    id: 'e' + i,
    dir: (r.from.charCodeAt(0) + r.to.charCodeAt(1)) % 2 ? 1 : -1
  }));

  // key -> [{key, verb, why}]  (symmetric view of every relation)
  const CONN = {};
  NODES.forEach(n => { CONN[n.key] = []; });
  EDGES.forEach(e => {
    CONN[e.from].push({ key: e.to, verb: e.fwd, why: e.why });
    CONN[e.to].push({ key: e.from, verb: e.back, why: e.why });
  });

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------ elements ------------------------------- */
  const canvas = document.getElementById('ontologyCanvas');
  const wrap = document.getElementById('canvasWrap');
  const ctx = canvas.getContext('2d');
  const inspector = document.getElementById('inspector');
  const insDot = document.getElementById('insDot');
  const insName = document.getElementById('insName');
  const insLayer = document.getElementById('insLayer');
  const insRole = document.getElementById('insRole');
  const insChips = document.getElementById('insChips');
  const insMode = document.getElementById('inspectorMode');
  const stageMode = document.getElementById('stageMode');
  const nodeButtons = document.getElementById('nodeButtons');
  const nodeGrid = document.getElementById('nodeGrid');

  /* -------------------------------- state -------------------------------- */
  let W = 0, H = 0, DPR = 1, S = 100, OX = 0, OY = 0;
  let NARROW = false;
  let t0 = performance.now();
  let last = t0;
  let hoverKey = null;
  let pinnedKey = null;
  let autoIdx = 0;
  let autoTimer = null;
  let idleTimer = null;
  let lastActive = null;
  let intro = REDUCED ? 1 : 0;
  const particles = new Map();   // edgeId -> [{p, speed, size}]
  const btns = new Map();        // key -> button (a11y layer)

  /* ------------------------------ geometry ------------------------------- */
  function layout() {
    const rect = wrap.getBoundingClientRect();
    W = Math.max(280, rect.width);
    H = Math.max(260, rect.height);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);

    NARROW = W < 560;
    S = Math.min((W - 44) / 4.15, (H - 12) / 5.12);
    S = Math.max(52, S);
    OX = W / 2;
    OY = H / 2 - 1.62 * S;

    NODES.forEach(n => {
      n.size = S * (n.scale || 0.80);
      n.x = OX + n.col * (S * 1.10);
      n.y = OY + n.row * (S * 1.20);
      if (n.fx === undefined) { n.fx = 0; n.fy = 0; }
      const b = btns.get(n.key);
      if (b) {
        b.style.left = n.x + 'px';
        b.style.top = n.y + 'px';
      }
    });
  }

  window.addEventListener('resize', layout);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(wrap);

  /* ------------------------------ inspector ------------------------------ */
  function updateInspector(node, mode) {
    if (!node) return;
    inspector.classList.add('is-swapping');
    window.setTimeout(() => {
      insDot.style.background = node.color;
      insDot.style.color = node.color;
      insName.textContent = node.name;
      insLayer.textContent = LAYER_LABEL[node.layer];
      insRole.textContent = node.role;

      const list = CONN[node.key] || [];
      insCount.textContent = String(list.length);
      insChips.textContent = '';
      list.forEach(c => {
        const t = byKey[c.key];
        if (!t) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'rel-item';
        b.style.setProperty('--c', t.color);
        b.title = node.name + ' ' + c.verb + ' ' + t.name + ' — ' + c.why;

        const top = document.createElement('span');
        top.className = 'rel-item__top';
        const verb = document.createElement('span');
        verb.className = 'rel-item__verb';
        verb.textContent = c.verb;
        const arrow = document.createElement('span');
        arrow.className = 'rel-item__arrow';
        arrow.textContent = '→';
        const name = document.createElement('span');
        name.className = 'rel-item__name';
        name.textContent = t.name;
        top.append(verb, arrow, name);

        const why = document.createElement('span');
        why.className = 'rel-item__why';
        why.textContent = c.why;

        b.append(top, why);
        b.addEventListener('click', () => { pin(c.key); });
        insChips.appendChild(b);
      });
      inspector.classList.remove('is-swapping');
    }, 90);

    insMode.textContent = mode;
    insMode.classList.toggle('is-manual', mode !== 'AUTO CYCLE');
    stageMode.textContent = mode;
  }

  function activeNode() {
    if (pinnedKey) return byKey[pinnedKey];
    if (hoverKey) return byKey[hoverKey];
    return byKey[NODES[autoIdx % NODES.length].key];
  }

  function activeMode() {
    if (pinnedKey) return 'PINNED';
    if (hoverKey) return 'MANUAL';
    return 'AUTO CYCLE';
  }

  /* ------------------------------- control ------------------------------- */
  function pin(key) {
    pinnedKey = (pinnedKey === key) ? null : key;
    hoverKey = key;
    stopAuto();
    scheduleIdle();
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }
  function startAuto() {
    if (autoTimer || pinnedKey || hoverKey) return;
    autoTimer = setInterval(() => {
      if (pinnedKey || hoverKey) return;
      autoIdx = (autoIdx + 1) % NODES.length;
    }, 2800);
  }
  function scheduleIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (pinnedKey) return;
      hoverKey = null;
      startAuto();
    }, 7000);
  }

  /* -------------------------------- draw --------------------------------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function bezier(ax, ay, bx, by, dir) {
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const bend = len * 0.13 * dir;
    return [mx + nx * bend, my + ny * bend];
  }

  function qPoint(ax, ay, cx, cy, bx, by, t) {
    const mt = 1 - t;
    return [
      mt * mt * ax + 2 * mt * t * cx + t * t * bx,
      mt * mt * ay + 2 * mt * t * cy + t * t * by
    ];
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function hexToRgb(hex) {
    const v = hex.replace('#', '');
    return [parseInt(v.slice(0,2),16), parseInt(v.slice(2,4),16), parseInt(v.slice(4,6),16)];
  }
  function rgba(hex, a) {
    const c = hexToRgb(hex);
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }
  function mix(hex, target, amt) {
    const a = hexToRgb(hex), b = hexToRgb(target);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * amt));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  // stem + leaf decoration above the cluster
  function drawStem(now) {
    const x = OX, y = OY;
    const w = S * 0.14, hh = S * 0.42;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#407f30';
    ctx.shadowColor = 'rgba(64,127,48,.6)';
    ctx.shadowBlur = 12;
    roundRect(x - w / 2, y - S * 0.78, w, hh, w * 0.30);
    ctx.fill();

    const sway = REDUCED ? 0 : Math.sin(now / 2400) * 0.05;
    ctx.translate(x - S * 0.02, y - S * 0.60);
    ctx.rotate(-0.38 + sway);
    const g = ctx.createLinearGradient(0, 0, S * 0.36, S * 0.22);
    g.addColorStop(0, '#c8f078');
    g.addColorStop(1, '#7cc037');
    ctx.fillStyle = g;
    ctx.shadowColor = 'rgba(164,218,78,.6)';
    ctx.shadowBlur = 24;
    roundRect(S * 0.02, -S * 0.17, S * 0.34, S * 0.21, S * 0.08);
    ctx.fill();
    ctx.restore();
  }

  // faint orbital rings that give the cluster a sense of space
  function drawRings(now) {
    const cx = OX, cy = OY + 1.55 * S;
    ctx.save();
    ctx.setLineDash([2, 9]);
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const r = S * (1.55 + i * 0.62);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.085 - i * 0.02) + ')';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    if (!REDUCED) {
      const a = (now / 9000) % (Math.PI * 2);
      const r = S * 2.17;
      ctx.strokeStyle = 'rgba(214,55,217,0.35)';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = 'rgba(214,55,217,0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a, a + 0.14);
      ctx.stroke();
    }
    ctx.restore();
  }

  function particleSet(id) {
    if (!particles.has(id)) {
      const arr = [];
      const count = 2;
      for (let i = 0; i < count; i++) {
        arr.push({ p: Math.random(), speed: 0.10 + Math.random() * 0.12, size: 1.1 + Math.random() * 1.5 });
      }
      particles.set(id, arr);
    }
    return particles.get(id);
  }

  function draw(now) {
    const dt = Math.min(60, now - last) / 1000;
    last = now;

    if (intro < 1) {
      intro = Math.min(1, (now - t0) / (REDUCED ? 1 : 1500));
    }
    const ip = easeOut(intro);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const active = activeNode();
    const activeKey = active ? active.key : null;
    const neighbours = new Set(active ? active.links : []);
    if (activeKey) neighbours.add(activeKey);

    const VERB = {};
    if (activeKey && CONN[activeKey]) CONN[activeKey].forEach(c => { VERB[c.key] = c; });

    // ambient halo behind the cluster
    const halo = ctx.createRadialGradient(OX, OY + 1.4 * S, S * 0.2, OX, OY + 1.4 * S, S * 3.3);
    halo.addColorStop(0, active ? rgba(active.color, 0.16) : 'rgba(150,43,231,0.14)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    // float offsets
    const tsec = now / 1000;
    NODES.forEach((n, i) => {
      if (REDUCED) { n.fx = 0; n.fy = 0; return; }
      n.fx = Math.sin(tsec * 0.55 + i * 1.7) * S * 0.016;
      n.fy = Math.cos(tsec * 0.48 + i * 1.1) * S * 0.014;
    });

    drawRings(now);
    drawStem(now);

    // ---------------- edges ----------------
    EDGES.forEach(e => {
      const A = byKey[e.from], B = byKey[e.to];
      if (!A || !B) return;
      const ax = A.x + A.fx, ay = A.y + A.fy;
      const bx = B.x + B.fx, by = B.y + B.fy;
      const [cx, cy] = bezier(ax, ay, bx, by, e.dir);

      const lit = activeKey && (e.from === activeKey || e.to === activeKey);
      const warm = !lit && activeKey && neighbours.has(e.from) && neighbours.has(e.to);

      ctx.save();
      ctx.lineCap = 'round';
      if (lit) {
        const g = ctx.createLinearGradient(ax, ay, bx, by);
        g.addColorStop(0, rgba(A.color, 0.98));
        g.addColorStop(1, rgba(B.color, 0.98));
        ctx.strokeStyle = g;
        ctx.lineWidth = Math.max(1.8, S * 0.022);
        ctx.shadowColor = rgba(A.key === activeKey ? A.color : B.color, 0.8);
        ctx.shadowBlur = S * 0.18;
        ctx.globalAlpha = ip;
      } else if (warm) {
        ctx.strokeStyle = 'rgba(255,255,255,0.42)';
        ctx.lineWidth = 1.6;
      } else {
        const g = ctx.createLinearGradient(ax, ay, bx, by);
        g.addColorStop(0, rgba(A.color, 0.34));
        g.addColorStop(1, rgba(B.color, 0.34));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.45;
      }
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cx, cy, bx, by);
      ctx.stroke();

      // direction of the relation, drawn from the active berry outward
      if (lit && ip > 0.6) {
        const fromA = e.from === activeKey;
        const sx0 = fromA ? ax : bx, sy0 = fromA ? ay : by;
        const tx0 = fromA ? bx : ax, ty0 = fromA ? by : ay;
        const [ccx, ccy] = fromA ? [cx, cy] : [cx, cy];
        const [hx, hy] = qPoint(sx0, sy0, ccx, ccy, tx0, ty0, 0.93);
        const [px2, py2] = qPoint(sx0, sy0, ccx, ccy, tx0, ty0, 0.86);
        const ang = Math.atan2(hy - py2, hx - px2);
        const sz = Math.max(4.2, S * 0.055);
        ctx.save();
        ctx.globalAlpha = ip;
        ctx.translate(hx, hy);
        ctx.rotate(ang);
        ctx.fillStyle = fromA ? mix(B.color, '#ffffff', 0.35) : mix(A.color, '#ffffff', 0.35);
        ctx.shadowColor = fromA ? B.color : A.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-sz * 1.7, -sz * 0.72);
        ctx.lineTo(-sz * 1.7, sz * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // data packets travelling along the edge
      if (ip > 0.55) {
        const ps = particleSet(e.id);
        const rate = lit ? 2.0 : 1;
        ps.forEach(pt => {
          pt.p += dt * pt.speed * rate;
          if (pt.p > 1) pt.p -= 1;
          const [px, py] = qPoint(ax, ay, cx, cy, bx, by, pt.p);
          const alpha = (lit ? 1 : 0.34) * Math.sin(Math.PI * pt.p);
          ctx.save();
          ctx.globalAlpha = Math.max(0, alpha) * ip;
          ctx.fillStyle = lit ? mix(A.color, '#ffffff', 0.6) : '#a893c9';
          ctx.shadowColor = lit ? A.color : '#6f5aa8';
          ctx.shadowBlur = lit ? 14 : 5;
          ctx.beginPath();
          ctx.arc(px, py, lit ? pt.size + 0.6 : pt.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    });

    // ---------------- nodes ----------------
    ctx.letterSpacing = NARROW ? '0px' : '0.6px';
    NODES.forEach((n, i) => {
      const isActive = activeKey === n.key;
      const isNeighbour = neighbours.has(n.key) && !isActive;
      const dim = activeKey && !isActive && !isNeighbour;

      // intro: fly in from a scatter
      const ang = (i * 2.399) % (Math.PI * 2);
      const spread = (1 - ip) * S * (1.6 + (i % 3) * 0.5);
      const x = n.x + n.fx + Math.cos(ang) * spread;
      const y = n.y + n.fy + Math.sin(ang) * spread;
      n.sx = x; n.sy = y;

      const size = n.size;
      const half = size / 2;
      const alpha = (dim ? 0.82 : 1) * ip;

      ctx.save();
      ctx.globalAlpha = alpha;

      // glow
      ctx.shadowColor = rgba(n.color, isActive ? 0.95 : isNeighbour ? 0.65 : 0.45);
      ctx.shadowBlur = isActive ? S * 0.40 : isNeighbour ? S * 0.22 : S * 0.13;

      const g = ctx.createLinearGradient(x - half, y - half, x + half, y + half);
      g.addColorStop(0, mix(n.color, '#ffffff', isActive ? 0.42 : 0.24));
      g.addColorStop(0.55, n.color);
      g.addColorStop(1, mix(n.color, '#3a0a4a', 0.28));
      ctx.fillStyle = g;
      roundRect(x - half, y - half, size, size, size * 0.30);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,' + (isActive ? 0.55 : 0.20) + ')';
      ctx.lineWidth = 1;
      roundRect(x - half + 0.5, y - half + 0.5, size - 1, size - 1, size * 0.30);
      ctx.stroke();

      // inner gloss
      const gl = ctx.createLinearGradient(x - half, y - half, x, y);
      gl.addColorStop(0, 'rgba(255,255,255,0.22)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl;
      roundRect(x - half + size * 0.12, y - half + size * 0.12, size * 0.7, size * 0.45, size * 0.2);
      ctx.fill();

      // node index (matches the capability cards below)
      ctx.font = '500 ' + Math.max(6, S * 0.084) + 'px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(255,255,255,' + (isActive ? 0.85 : 0.5) + ')';
      ctx.fillText(n.id, x - half + size * 0.17, y - half + size * 0.15);

      // selection brackets (sit outside the grape, clear of the label)
      if (isActive && !REDUCED) {
        const g = S * 0.05, len = size * 0.22;
        const x0 = x - half - g, y0 = y - half - g, x1 = x + half + g, y1 = y + half + g;
        ctx.strokeStyle = mix(n.color, '#ffffff', 0.35);
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.shadowColor = rgba(n.color, 0.9);
        ctx.shadowBlur = 8;
        [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([cx0, cy0, dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(cx0 + dx * len, cy0);
          ctx.lineTo(cx0, cy0);
          ctx.lineTo(cx0, cy0 + dy * len);
          ctx.stroke();
        });
      }
      ctx.restore();

      // label (+ relation verb when this berry is connected to the active one)
      if (ip > 0.35) {
        const la = Math.min(1, (ip - 0.35) / 0.45);
        const conn = activeKey && n.key !== activeKey ? VERB[n.key] : null;
        const vFont = '600 ' + Math.max(5.8, S * 0.072 * (NARROW ? 0.9 : 1)) + 'px "JetBrains Mono", ui-monospace, monospace';
        const nFont = '500 ' + Math.max(6.0, S * 0.080 * (NARROW ? 0.88 : 1)) + 'px "JetBrains Mono", ui-monospace, monospace';
        const vt = conn ? conn.verb.toUpperCase() : '';
        const label = n.name.toUpperCase();
        const vy = y + half + S * 0.045;
        const ly = y + half + (conn ? S * 0.155 : S * 0.13);

        ctx.save();
        ctx.globalAlpha = la * (dim ? 0.62 : 1);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // knockout plate so edges passing behind a label never cut through the type
        ctx.font = vFont;
        const vw = conn ? ctx.measureText(vt).width : 0;
        ctx.font = nFont;
        const nw = ctx.measureText(label).width;
        const bw = Math.max(vw, nw) + 13;
        const top = (conn ? vy : ly) - 4;
        const bottom = ly + Math.round(S * 0.085) + 4;
        ctx.globalAlpha = la;
        ctx.fillStyle = 'rgba(9,6,16,0.97)';
        roundRect(x - bw / 2, top, bw, bottom - top, 5);
        ctx.fill();
        ctx.globalAlpha = la * (dim ? 0.62 : 1);

        if (conn) {
          ctx.font = vFont;
          ctx.fillStyle = mix(n.color, '#ffffff', 0.5);
          ctx.fillText(vt, x, vy);
        }
        ctx.font = nFont;
        ctx.fillStyle = isActive ? '#ffffff' : isNeighbour ? '#e9e0fa' : 'rgba(206,197,226,0.86)';
        ctx.fillText(label, x, ly);
        ctx.restore();
      }
    });
    ctx.letterSpacing = '0px';

    // inspector sync
    if (activeKey !== lastActive) {
      lastActive = activeKey;
      if (active) updateInspector(active, activeMode());
    } else {
      const m = activeMode();
      if (insMode.textContent !== m) {
        insMode.textContent = m;
        insMode.classList.toggle('is-manual', m !== 'AUTO CYCLE');
        stageMode.textContent = m;
      }
    }

    requestAnimationFrame(draw);
  }

  /* ------------------------------- pointer -------------------------------- */
  function hitTest(ev) {
    const r = canvas.getBoundingClientRect();
    const mx = ev.clientX - r.left, my = ev.clientY - r.top;
    let best = null, bestD = Infinity;
    NODES.forEach(n => {
      const d = Math.hypot(mx - n.sx, my - n.sy);
      if (d < n.size * 0.62 && d < bestD) { best = n; bestD = d; }
    });
    return best;
  }

  canvas.addEventListener('pointermove', ev => {
    if (ev.pointerType === 'touch') return;
    const n = hitTest(ev);
    const k = n ? n.key : null;
    if (k !== hoverKey) {
      hoverKey = k;
      if (k) {
        stopAuto();
        wrap.classList.add('is-touched');
      } else if (!pinnedKey) {
        scheduleIdle();
      }
    }
    canvas.style.cursor = n ? 'pointer' : 'default';
  });

  canvas.addEventListener('pointerleave', () => {
    if (pinnedKey) return;
    hoverKey = null;
    scheduleIdle();
  });

  canvas.addEventListener('click', ev => {
    const n = hitTest(ev);
    wrap.classList.add('is-touched');
    if (!n) { pinnedKey = null; hoverKey = null; scheduleIdle(); return; }
    pin(n.key);
  });

  /* ------------------------------ a11y nodes ------------------------------ */
  NODES.forEach((n, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = n.name;
    b.setAttribute('aria-label', 'Inspect ' + n.name + ' — ' + n.role);
    b.addEventListener('focus', () => { hoverKey = n.key; stopAuto(); });
    b.addEventListener('blur', () => { scheduleIdle(); });
    b.addEventListener('click', e => { e.stopPropagation(); pin(n.key); });
    nodeButtons.appendChild(b);
    btns.set(n.key, b);
  });

  /* ------------------------------ card grid ------------------------------- */
  function buildCards() {
    NODES.forEach(n => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'node-card';
      card.dataset.layer = n.layer;
      card.dataset.key = n.key;
      card.style.setProperty('--c', n.color);
      card.setAttribute('aria-label', n.name + ' — ' + n.role + '. Show on the graph.');

      const top = document.createElement('div');
      top.className = 'node-card__top';
      const idEl = document.createElement('span');
      idEl.className = 'node-card__id';
      idEl.textContent = n.id + ' / ' + LAYER_LABEL[n.layer];
      const sw = document.createElement('span');
      sw.className = 'node-card__swatch';
      top.append(idEl, sw);

      const h = document.createElement('h3');
      h.textContent = n.name;

      const p = document.createElement('p');
      p.className = 'node-card__role';
      p.textContent = n.desc;

      const links = document.createElement('div');
      links.className = 'node-card__links';
      (CONN[n.key] || []).slice(0, 4).forEach(c => {
        const s = document.createElement('span');
        s.textContent = c.verb + ' · ' + byKey[c.key].name;
        links.appendChild(s);
      });

      const go = document.createElement('span');
      go.className = 'node-card__go';
      go.textContent = 'View on graph ↗';

      card.append(top, h, p, links, go);
      card.addEventListener('click', () => {
        pinnedKey = n.key;
        hoverKey = null;
        stopAuto();
        scheduleIdle();
        wrap.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
      });
      card.addEventListener('mouseenter', () => { hoverKey = n.key; stopAuto(); });
      card.addEventListener('mouseleave', () => { hoverKey = null; scheduleIdle(); });

      nodeGrid.appendChild(card);
    });
  }

  /* -------------------------------- filters ------------------------------- */
  function initFilters() {
    const chips = Array.from(document.querySelectorAll('.filters .chip'));
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.toggle('is-active', c === chip));
        const f = chip.dataset.filter;
        nodeGrid.querySelectorAll('.node-card').forEach(card => {
          const show = f === 'all' || card.dataset.layer === f;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* --------------------------------- nav ---------------------------------- */
  function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', e => {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -------------------------------- reveal -------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || REDUCED) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const d = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('is-in'), d);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* --------------------------------- boot --------------------------------- */
  buildCards();
  initFilters();
  initNav();
  initReveal();
  layout();
  startAuto();
  requestAnimationFrame(t => { t0 = performance.now(); last = performance.now(); draw(t); });

  // keep layout honest once webfonts settle
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { layout(); });
  }
})();
