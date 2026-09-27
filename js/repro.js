// ReproductionClear's shared models: a clearly stylised, neutral ghosted human figure (no external
// detail of any kind), a ghosted pelvis, and the internal reproductive organs drawn as clean textbook
// diagrams, plus canvas boards, particle streams and the physiology numbers the chapters share.
// The level is NCERT biology (class 8 "Reaching the Age of Adolescence", class 10 "How do Organisms
// Reproduce?", class 12 "Human Reproduction") or a school science museum.
//
// Orientation: we face the person (anterior view), as in an anatomy atlas, so their RIGHT is on YOUR
// LEFT. Axes: +x = the person's left, +y = up, +z = forwards (towards you). One model unit is 10 cm, so
// the adult figure is about 1.75 m tall with its feet on the floor (y = 0), the same proportions as the
// EndocrineClear and SkeletonClear figures. The pelvic organs are built in centimetres inside a group
// scaled by 0.1 and placed at PELVIS (about 93 cm up, the level of the hip joints).
//
// Organ sizes (Gray's Anatomy, 42nd ed.; Moore, Clinically Oriented Anatomy, 8th ed.; Guyton & Hall,
// Textbook of Medical Physiology, 14th ed., ch. 81–83; Williams Obstetrics, 26th ed.; Britannica):
//  - uterus: pear-shaped, about 7.5 × 5 × 2.5 cm and about 70 g, tipped forwards over the bladder;
//    it grows to about 1.1 kg by the end of pregnancy; cervix about 2.5–3 cm long;
//  - fallopian (uterine) tubes: about 10–12 cm, from the top corners of the uterus out to the ovaries,
//    ending in finger-like fimbriae; the wide outer part (the ampulla) is where fertilisation happens;
//  - ovaries: almond-sized, about 3 × 2 × 1 cm; about 1–2 million immature eggs at birth and about
//    300,000–400,000 at puberty, of which only about 400–500 are ever released (ACOG; Wallace &
//    Kelsey, PLoS ONE 5:e8772, 2010);
//  - vagina (the birth canal): a muscular passage about 7–10 cm long from the cervix;
//  - testes: about 4–5 cm long, about 15–25 mL, held outside the body in the scrotum, 2–3 °C cooler
//    than the core; about 100 million sperm a day, over 1,000 a second (Johnson et al., Biol Reprod
//    22:1162, 1980; Guyton & Hall ch. 81);
//  - epididymis: about 6 m of tightly coiled tube on the back of each testis; sperm take about 10–14
//    days to pass through and mature;
//  - vas deferens (ductus deferens): about 30–45 cm, up through the groin, over and behind the bladder;
//  - seminal vesicles: about 5 cm, behind the bladder, add about 60–70% of the fluid (rich in fructose);
//  - prostate: walnut-sized, about 20 g, below the bladder around the urethra, adds about 20–30%.
// Positions are to scale; in the anatomy chapter "Take the organs out" enlarges them to be seen.
import { THREE, M, clamp, lerp, smooth } from './kit.js';

// ---------------------------------------------------------------- colours and labels
export const COL = {
  ovary: 0xffd166, tube: 0x8ef0ff, uterus: 0xff9fc0, cervix: 0xc9a7ff, canal: 0xd9a6c0, lining: 0xe0506a,
  testis: 0x8ef0ff, epi: 0xc9a7ff, vas: 0xffd166, sv: 0x6ee7a8, prostate: 0xff8a5c, urethra: 0xaab3c5,
  bladder: 0xf2d27a, bone: 0xeadfc6, egg: 0xfff1a8, sperm: 0xe9f4ff, hypo: 0xff9fc0, pit: 0xffd166,
  gnrh: 0xff9fc0, lh: 0x8ef0ff, fsh: 0x6ee7a8, oest: 0xff9fc0, prog: 0xc9a7ff, testo: 0x8ef0ff,
  oxy: 0xff5a64, waste: 0x6fa8ff,
};
const TINT = { pink: '#ff9fc0', gold: '#ffd166', purple: '#c9a7ff', orange: '#ff8a5c', cream: '#fff1a8', blue: '#9db4ff', green: '#6ee7a8', cyan: '#8ef0ff', red: '#ff8a8a', grey: '#aab3c5', side: '#8ef0ff', bone: '#f3e6c8' };
export const CSS = (c) => '#' + c.toString(16).padStart(6, '0');
export function tint(l, cls) { const c = TINT[cls] || cls; if (c && l?.element) { l.element.style.borderColor = c; l.element.style.color = c; } return l; }
export const inReel = () => document.body.classList.contains('gb-reel');
export const isNarrow = (stage) => stage.host.clientWidth < 560;
// On a phone-width stage the readout covers the upper left: re-frame once, unless orbited.
export function fitNarrow(stage, view) {
  let done = false;
  return () => {
    const narrow = isNarrow(stage);
    if (narrow && !done && !stage.moved && !inReel()) { stage.setView(view.pos, view.target, 0.01); done = true; }
    return narrow;
  };
}
// On phones keep only the readout's headline and two rows.
export function compactReadout(stage, api) {
  const full = api.readout;
  if (!full) return api;
  api.readout = (s) => {
    const html = full(s);
    if (!isNarrow(stage) || !html) return html;
    let rows = 0;
    return html.replace(/<small>[\s\S]*?<\/small>/g, '').replace(/<div class="row">[\s\S]*?<\/div>/g, (m) => (++rows <= 2 ? m : ''));
  };
  return api;
}

// ---------------------------------------------------------------- canvas boards
export function board(ct, w, h) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ct.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
}
export function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export function panel(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.88)'; rrect(g, 0, 0, w, h, 22); g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.stroke(); }
export const FONT = (px, w = 500) => `${w} ${px}px Geist, system-ui, sans-serif`;
export function text(g, s, x, y, px, col = '#e9edf5', w = 500, align = 'left') { g.font = FONT(px, w); g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); }
export function wrap(g, s, x, y, maxW, px, col = '#cfd6e4', lh = 1.3, w = 400) {
  g.font = FONT(px, w); g.fillStyle = col; g.textAlign = 'left';
  let line = '';
  for (const word of s.split(' ')) {
    const t = line ? line + ' ' + word : word;
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += px * lh; line = word; } else line = t;
  }
  if (line) { g.fillText(line, x, y); y += px * lh; }
  return y;
}
// A line chart. series: [{ pts: [[x, y]], col, w, dash }]; box [x, y, w, h] on the canvas.
export function chart(g, box, xr, yr, series, o = {}) {
  const [bx, by, bw, bh] = box, fs = o.fs || 20;
  const X = (x) => bx + ((x - xr[0]) / (xr[1] - xr[0])) * bw;
  const Y = (y) => by + bh - ((y - yr[0]) / (yr[1] - yr[0])) * bh;
  (o.bands || []).forEach((b) => { g.fillStyle = b.col; g.fillRect(X(b.x0), by, X(b.x1) - X(b.x0), bh); });
  g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by + bh); g.lineTo(bx + bw, by + bh); g.stroke();
  (o.xticks || []).forEach(([v, lab]) => { const x = X(v); g.strokeStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(x, by); g.lineTo(x, by + bh); g.stroke(); text(g, lab, x, by + bh + fs + 6, fs, '#8b93a7', 400, 'center'); });
  g.save(); g.beginPath(); g.rect(bx, by - 6, bw + 2, bh + 10); g.clip();
  series.forEach((s) => {
    if (!s.pts.length) return;
    g.strokeStyle = s.col; g.lineWidth = s.w || 4; g.lineJoin = 'round'; g.setLineDash(s.dash || []);
    g.beginPath(); s.pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.stroke();
    g.setLineDash([]);
  });
  g.restore();
  if (o.cursor !== undefined) { const x = X(o.cursor); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x, by - 4); g.lineTo(x, by + bh); g.stroke(); g.setLineDash([]); }
  return { X, Y };
}

// ---------------------------------------------------------------- geometry helpers
export const V = (p) => (p.isVector3 ? p.clone() : new THREE.Vector3(...p));
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const smoothPts = (pts, n = 60, closed = false) => new THREE.CatmullRomCurve3(pts.map(V), closed, 'centripetal').getPoints(n);
export function pathOf(points) {
  const Pt = points.map(V), L = [0];
  for (let i = 1; i < Pt.length; i++) L.push(L[i - 1] + Pt[i].distanceTo(Pt[i - 1]));
  const total = Math.max(1e-6, L[L.length - 1]);
  return {
    points: Pt, total,
    at(u, out = new THREE.Vector3()) {
      const d = clamp(u, 0, 1) * total;
      let lo = 0, hi = L.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= d) lo = m; else hi = m; }
      return out.copy(Pt[lo]).lerp(Pt[hi], (d - L[lo]) / Math.max(1e-9, L[hi] - L[lo]));
    },
  };
}
export function capsule(a, b, r, mat, cap = 8, rad = 18) {
  const A = V(a), B = V(b), len = Math.max(0.001, A.distanceTo(B));
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, cap, rad), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}
export function blob(r, pos, mat, seg = 32) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), mat);
  m.scale.set(...r); m.position.set(...pos);
  return m;
}
export function pipe(pts, r, mat, n) {
  const p = pts.length > 2 ? smoothPts(pts, n ?? pts.length * 10) : pts.map(V);
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p, false, 'centripetal'), Math.max(8, p.length * 2), r, 10, false), mat);
  m.userData.pts = p;
  return m;
}
// A solid of revolution around Y from [y, r] pairs, flattened front-to-back by zs.
export function latheY(prof, mat, zs = 1, seg = 40) {
  const g = new THREE.LatheGeometry(prof.map(([y, r]) => new THREE.Vector2(Math.max(0.001, r), y)), seg);
  g.scale(1, 1, zs); g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}
export const glowMat = (c, ei = 0.5, op = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, emissive: c, emissiveIntensity: ei, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
export const ghost = (c, op = 0.2, ei = 0.12) => new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: op, roughness: 0.6, depthWrite: false, emissive: c, emissiveIntensity: ei, side: THREE.DoubleSide });

// ---------------------------------------------------------------- particle streams
// count small shapes ride along a path; density 0..1 sets how many show; speed in model units/s.
export function stream(path, count, color, { size = 0.06, shape = 'sphere', jitter = 0.04, seed = 1 } = {}) {
  const geo = shape === 'box' ? new THREE.BoxGeometry(size * 1.6, size * 1.6, size * 1.6)
    : shape === 'octa' ? new THREE.OctahedronGeometry(size * 1.4)
    : shape === 'tetra' ? new THREE.TetrahedronGeometry(size * 1.5)
    : new THREE.SphereGeometry(size, 10, 8);
  const mesh = new THREE.InstancedMesh(geo, M.glow(color), count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false;
  const ph = Array.from({ length: count }, (_, i) => (i + rnd(i * 7 + seed) * 0.6) / count);
  const off = Array.from({ length: count }, (_, i) => [0, 1, 2].map((k) => (rnd(i * (3 + k) + seed * (k + 1)) - 0.5) * 2 * jitter));
  const o = new THREE.Object3D(), p = new THREE.Vector3();
  let u = 0;
  const api = {
    mesh, path,
    step(dt, density = 1, speed = 1, time = 0) {
      u = (u + (Math.max(0, dt) * speed) / path.total) % 1;
      const show = clamp(density, 0, 1);
      for (let i = 0; i < count; i++) {
        const vis = show > 0 && rnd(i * 13 + seed) < show + 1e-6;
        const k = (ph[i] + u) % 1;
        path.at(k, p);
        o.position.set(p.x + off[i][0], p.y + off[i][1], p.z + off[i][2]);
        o.rotation.set(time * 1.3 + i, time * 0.9 + i * 2, 0);
        o.scale.setScalar(vis ? Math.max(0.001, Math.min(1, k * 10, (1 - k) * 10)) : 0.001);
        o.updateMatrix(); mesh.setMatrixAt(i, o.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
  api.step(0, 0);
  return api;
}

// ---------------------------------------------------------------- the neutral ghost figure
// Capsules and lathe shapes only: a respectful, sexless outline that frames the organs inside.
export const PELVIS = [0, 9.3, 0.05];
export const HEAD = { hypo: [0, 16.28, 0.12], pit: [0, 16.04, 0.2] };
export function makeFigure(mat) {
  const g = new THREE.Group();
  g.add(blob([0.78, 1.0, 0.88], [0, 16.45, 0.05], mat));
  g.add(capsule([0, 14.9, -0.02], [0, 15.55, 0], 0.38, mat));
  const prof = [[15.1, 0.02], [15.0, 0.55], [14.75, 1.45], [14.35, 1.8], [13.6, 1.72], [12.4, 1.55], [11.3, 1.35], [10.4, 1.38], [9.6, 1.55], [9.0, 1.5], [8.55, 1.05], [8.4, 0.02]];
  g.add(latheY(prof, mat, 0.6, 48));
  for (const sx of [1, -1]) {
    g.add(capsule([sx * 1.85, 14.35, 0], [sx * 2.2, 11.8, 0.05], 0.36, mat));
    g.add(capsule([sx * 2.2, 11.8, 0.05], [sx * 2.45, 9.45, 0.1], 0.29, mat));
    g.add(blob([0.24, 0.48, 0.13], [sx * 2.56, 8.72, 0.08], mat));
    g.add(capsule([sx * 0.8, 9.0, 0], [sx * 0.95, 4.8, 0], 0.6, mat));
    g.add(capsule([sx * 0.95, 4.8, 0], [sx * 0.97, 0.75, -0.05], 0.44, mat));
    g.add(blob([0.34, 0.2, 0.62], [sx * 1.0, 0.24, 0.35], mat));
  }
  return g;
}
export const skinMaterial = () => new THREE.MeshStandardMaterial({ color: 0xd9a47e, transparent: true, opacity: 0.12, roughness: 0.65, depthWrite: false, side: THREE.DoubleSide });

// A stylised, ghosted pelvis in centimetres (origin at PELVIS): two hip-bone wings, the pelvic ring,
// the sacrum at the back and the hip sockets. See SkeletonClear for the real bones.
export function makePelvisBones(op = 0.16) {
  const g = new THREE.Group(), mat = ghost(COL.bone, op, 0.08);
  const wingProf = [[-1, 6.2], [2, 8.5], [6, 11.5], [10, 13.2], [12, 13.4]];
  for (const [p0, pl] of [[0.28 * Math.PI, 0.5 * Math.PI], [1.22 * Math.PI, 0.5 * Math.PI]]) {
    const geo = new THREE.LatheGeometry(wingProf.map(([y, r]) => new THREE.Vector2(r, y)), 20, p0, pl);
    geo.scale(1, 1, 0.62); geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, mat));
  }
  const ring = [[0, 3, -7], [5.5, 0, -3.5], [6.8, -2.5, 0.5], [4.2, -5, 4.6], [0, -6.2, 5.8], [-4.2, -5, 4.6], [-6.8, -2.5, 0.5], [-5.5, 0, -3.5]];
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ring.map(V), true, 'centripetal'), 80, 0.9, 8, true), mat));
  g.add(capsule([0, 4, -7.6], [0, -7, -6.2], 1.7, mat));
  for (const sx of [1, -1]) {
    g.add(blob([2.2, 2.2, 2.2], [sx * 9.4, -3.2, 0.6], mat, 18));
    g.add(pipe([[sx * 3, -5.8, 5], [sx * 5.4, -9, 0.8], [sx * 7.2, -4.5, -1.5]], 0.9, mat));
  }
  g.traverse((o) => { if (o.isMesh) o.userData.bone = true; });
  return g;
}

// ---------------------------------------------------------------- the organs
export const ORGANS = {
  f: [
    { id: 'ovary', name: 'Ovaries', cls: 'gold', where: 'Either side of the uterus', job: 'Store immature eggs, release about one a month, and make oestrogen and progesterone', size: 'Almond-sized, about 3 × 2 × 1 cm', more: 'About 300,000–400,000 immature eggs at puberty; only about 400–500 are ever released.' },
    { id: 'tube', name: 'Fallopian tubes', cls: 'cyan', where: 'From the top of the uterus out to each ovary', job: 'Finger-like ends catch the egg; tiny hairs sweep it along. Fertilisation happens here', size: 'About 10–12 cm long, thinner than a pencil', more: 'The wide outer part, the ampulla, is where egg and sperm meet.' },
    { id: 'uterus', name: 'Uterus (womb)', cls: 'pink', where: 'Middle of the pelvis, behind the bladder', job: 'A strong muscle bag where a baby grows. Its lining thickens each month and is shed as a period', size: 'Pear-sized: about 7.5 cm long, 70 g', more: 'In pregnancy it grows to about 1.1 kg and reaches up to the ribs.' },
    { id: 'cervix', name: 'Cervix', cls: 'purple', where: 'The narrow lower end of the uterus', job: 'A doorway with a mucus plug. It stays shut in pregnancy and opens to about 10 cm for birth', size: 'About 2.5–3 cm long', more: 'A simple screening test checks its cells for early changes.' },
    { id: 'canal', name: 'Birth canal (vagina)', cls: 'grey', where: 'From the cervix to the outside of the body', job: 'The passage for period blood, and for a baby at birth', size: 'About 7–10 cm of stretchy muscle', more: 'Its muscle stretches a lot during birth, then returns.' },
  ],
  m: [
    { id: 'testis', name: 'Testes', cls: 'cyan', where: 'In the scrotum, a pouch outside the body that keeps them 2–3 °C cooler', job: 'Make sperm, about 100 million a day, and the hormone testosterone', size: 'About 4–5 cm long each', more: 'Sperm need to be a little cooler than the body to form properly.' },
    { id: 'epi', name: 'Epididymis', cls: 'purple', where: 'Coiled on the back of each testis', job: 'Stores sperm while they mature and learn to swim, over about 2 weeks', size: 'About 6 m of tube packed into 5 cm', more: 'Sperm made today are ready to swim in about 10–14 days.' },
    { id: 'vas', name: 'Vas deferens', cls: 'gold', where: 'From each epididymis up through the groin and behind the bladder', job: 'A muscular tube that carries mature sperm to the urethra', size: 'About 30–45 cm long', more: 'It loops over the tube from the kidney to the bladder.' },
    { id: 'sv', name: 'Seminal vesicles', cls: 'green', where: 'Behind the bladder', job: 'Add a sugary fluid that gives sperm energy: most of the fluid', size: 'About 5 cm long each', more: 'Their fluid is rich in fructose, a sugar.' },
    { id: 'prostate', name: 'Prostate gland', cls: 'orange', where: 'Just below the bladder, around the urethra', job: 'Adds a milky fluid that protects sperm', size: 'Walnut-sized, about 20 g', more: 'It often grows larger in older men; doctors can check it.' },
    { id: 'urethra', name: 'Urethra', cls: 'grey', where: 'From the bladder down through the prostate', job: 'Carries urine, or sperm, out of the body, never both at once', size: 'About 18–20 cm in adult men', more: 'A ring of muscle closes the bladder when sperm pass.' },
  ],
};
export const ORG = Object.fromEntries([...ORGANS.f, ...ORGANS.m].map((o) => [o.id, o]));

// Female organs in cm (origin at PELVIS). Returns handles the cycle chapter animates.
function buildFemale(add) {
  const h = {};
  // uterus body (flattened pear, tipped forwards) and cervix, as one tilted group
  const tilt = new THREE.Group(); tilt.rotation.x = 0.32; tilt.position.set(0, 0.6, 0.6);
  h.tilt = tilt;
  const body = latheY([[-2.6, 1.35], [-1.8, 1.9], [-0.6, 2.35], [0.9, 2.6], [2.2, 2.55], [3.0, 2.1], [3.45, 1.2], [3.6, 0.02]], null, 0.55);
  body.userData.ghostly = 0.42;
  const cervix = latheY([[-4.4, 0.02], [-4.35, 1.05], [-3.6, 1.2], [-2.7, 1.3], [-2.4, 0.9]], null, 0.62);
  // the lining of the cavity: a flat triangle-shaped slit whose thickness the cycle changes
  const lining = latheY([[-2.9, 0.12], [-1.8, 0.5], [-0.2, 1.0], [1.6, 1.55], [2.45, 1.45], [2.75, 0.02]], new THREE.MeshStandardMaterial({ color: COL.lining, emissive: COL.lining, emissiveIntensity: 0.45, roughness: 0.6 }), 0.22);
  lining.userData.keepMat = true;
  h.lining = lining; h.uterusBody = body;
  add('uterus', tilt, body, lining);
  add('cervix', tilt, cervix);
  // birth canal: a flattened, slightly forward-slanting passage below the cervix
  const canal = pipe([[0, -3.5, -0.65], [0, -7.2, 0.9], [0, -11.0, 2.6]], 1.0, null);
  canal.scale.z = 0.6; canal.userData.ghostly = 0.28;
  add('canal', null, canal);
  // tubes, from the top corners of the (tilted) uterus to the ovaries, with fimbriae at the end
  h.tubePts = {};
  for (const sx of [1, -1]) {
    const pts = [[sx * 2.3, 3.2, 1.3], [sx * 4.6, 4.2, 0.9], [sx * 7.0, 3.8, 0.2], [sx * 8.7, 1.8, -0.4], [sx * 8.5, -0.3, -0.2], [sx * 7.4, -0.7, 0.3]];
    const t1 = pipe(pts.slice(0, 3), 0.28, null, 24), t2 = pipe(pts.slice(2), 0.46, null, 30);
    const fim = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - 0.5) * 2.2, c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.1, 6), null);
      c.position.set(sx * (7.1 - 0.35 * Math.cos(a)), -1.1 + 0.4 * Math.sin(a), 0.3 + 0.55 * Math.sin(a * 1.3));
      c.rotation.set(0.4 * Math.sin(a), 0, sx * (2.6 + 0.35 * a));
      fim.push(c);
    }
    add('tube', null, t1, t2, ...fim);
    h.tubePts[sx] = smoothPts(pts, 80).reverse();              // from the ovary end in towards the uterus
  }
  // ovaries, hung beside the uterus by a thin ligament
  h.ovary = {};
  for (const sx of [1, -1]) {
    const ov = blob([1.55, 1.0, 0.8], [sx * 6.3, -1.8, -0.2], null, 28); ov.rotation.z = sx * 0.35;
    const lig = capsule([sx * 2.1, 1.4, 0.2], [sx * 5.0, -1.4, -0.2], 0.16, null);
    add('ovary', null, ov, lig);
    h.ovary[sx] = [sx * 6.3, -1.8, -0.2];
  }
  // the route period blood takes: from the cavity through the cervix and out along the birth canal
  h.flowPts = [[0, 0.8, 0.9], [0, -1.2, 0.2], [0, -2.7, -0.45], [0, -3.7, -0.6], [0, -7.2, 0.9], [0, -11.0, 2.6]];
  return h;
}

// Male organs in cm (origin at PELVIS).
function buildMale(add) {
  const h = {};
  for (const sx of [1, -1]) {
    const t = blob([1.25, 2.05, 1.2], [sx * 2.2, -12.4, 4.6], null, 28); t.rotation.z = sx * 0.12;
    add('testis', null, t);
    const e = pipe([[sx * 2.3, -10.1, 3.9], [sx * 2.9, -10.8, 3.3], [sx * 3.1, -12.4, 3.2], [sx * 2.8, -14.0, 3.5], [sx * 2.35, -14.6, 4.0]], 0.5, null, 40);
    add('epi', null, e);
    const vas = pipe([[sx * 2.35, -14.6, 4.0], [sx * 3.4, -13.4, 3.3], [sx * 3.6, -9.2, 4.6], [sx * 4.6, -4.5, 5.2], [sx * 5.6, -0.4, 3.6], [sx * 4.6, 0.8, 0.6], [sx * 2.6, -1.6, -0.6], [sx * 1.3, -5.2, 0.6], [sx * 0.35, -7.0, 2.4]], 0.22, null, 140);
    add('vas', null, vas);
    const sv = capsule([sx * 1.0, -5.6, 0.7], [sx * 3.4, -2.4, -0.6], 0.6, null); sv.scale.x = 1.2;
    add('sv', null, sv);
    h['vas' + sx] = vas.userData.pts;
  }
  add('prostate', null, blob([1.9, 1.5, 1.45], [0, -7.4, 2.6], null, 28));
  const ur = pipe([[0, -5.4, 3.3], [0, -7.4, 2.8], [0, -9.6, 3.6], [0, -11.0, 5.0]], 0.26, null, 30);
  add('urethra', null, ur);
  h.urethraPts = ur.userData.pts;
  return h;
}

// The pelvic organs (both sexes built; setSex shows one) in a cm group at PELVIS, scaled 0.1 × enlarge.
export function makeOrgans(stage, { labels = true, enlarge = 1 } = {}) {
  const root = new THREE.Group();
  root.position.set(...PELVIS); root.scale.setScalar(0.1 * enlarge);
  const G = {}, mats = {}, meshes = [], sexOf = {};
  const f = new THREE.Group(), m = new THREE.Group();
  root.add(f, m);
  const mkAdd = (sexGroup, sex) => (id, parent, ...objs) => {
    if (!G[id]) { G[id] = new THREE.Group(); sexGroup.add(G[id]); mats[id] = glowMat(COL[id], 0.4); sexOf[id] = sex; }
    const host = parent || G[id];
    if (parent && !parent.parent) G[id].add(parent);
    objs.forEach((o) => {
      if (!o.userData.keepMat) o.material = o.userData.ghostly ? ghost(COL[id], o.userData.ghostly, 0.25) : mats[id];
      o.userData.organ = id; host.add(o); meshes.push(o);
    });
    return G[id];
  };
  const fh = buildFemale(mkAdd(f, 'f'));
  const mh = buildMale(mkAdd(m, 'm'));
  // the bladder, shared context (ghost)
  const bladder = blob([2.9, 2.5, 2.4], [0, -2.6, 4.4], ghost(COL.bladder, 0.14, 0.05), 24);
  root.add(bladder);
  // labels
  const labelOf = {}, all = [];
  const LP = {
    ovary: [11.5, -4.2, 0.5], tube: [11.0, 5.2, 0.5], uterus: [-8.5, 5.8, 1.5], cervix: [-8.6, -4.6, 1.5], canal: [-7.0, -10.5, 3],
    testis: [9.0, -14.5, 4.5], epi: [-9.5, -12.2, 3], vas: [10.0, -1.5, 4], sv: [-9.5, -1.5, -0.5], prostate: [9.5, -7.8, 3], urethra: [-8.5, -9.5, 4],
  };
  if (labels) {
    for (const o of [...ORGANS.f, ...ORGANS.m]) {
      const l = tint(stage.label(o.name, LP[o.id], root), o.cls);
      labelOf[o.id] = l; all.push(l);
    }
    labelOf.bladder = tint(stage.label('Bladder (for context)', [-9.5, 1.0, 5.5], root), 'cream'); all.push(labelOf.bladder);
  }
  meshes.forEach((o) => { o.userData.home = o.position.clone(); o.userData.s0 = o.scale.clone(); });
  let sex = 'f';
  const api = {
    root, G, mats, meshes, f, m, fh, mh, bladder, labelOf, labels: all, sexOf,
    get sex() { return sex; },
    setSex(sx) { sex = sx; f.visible = sx === 'f'; m.visible = sx === 'm'; },
    ids() { return ORGANS[sex].map((o) => o.id); },
    // explode: each organ group slides forwards and a little apart
    setExplode(k) {
      const e = smooth(k);
      const off = { ovary: [2.5, 0], tube: [0, 2], uterus: [0, 1], cervix: [0, -1.5], canal: [0, -3], testis: [0, -3], epi: [2.5, -2], vas: [0, 2], sv: [0, 3], prostate: [0, 0], urethra: [0, -2] };
      for (const id in G) {
        const [dx, dy] = off[id] || [0, 0];
        G[id].position.set(0, dy * e, 4 * e);
        G[id].children.forEach((c) => {
          const h = c.userData.home; if (!h) return;
          c.position.set(h.x + Math.sign(h.x) * dx * e, h.y, h.z);
        });
      }
      bladder.visible = e < 0.4;
    },
    glow(id, v) { if (mats[id]) mats[id].emissiveIntensity = v; },
  };
  api.setSex('f');
  return api;
}

// ---------------------------------------------------------------- physiology numbers
// Median height (cm) by age, WHO Growth Reference 2007 (5–19 years); used by the puberty chapter.
export const HEIGHT = {
  m: [[6, 116.0], [7, 121.7], [8, 127.3], [9, 132.6], [10, 137.8], [11, 143.1], [12, 149.1], [13, 156.0], [14, 163.2], [15, 169.0], [16, 172.9], [17, 175.2], [18, 176.1]],
  f: [[6, 115.1], [7, 120.8], [8, 126.6], [9, 132.5], [10, 138.6], [11, 145.0], [12, 151.2], [13, 156.4], [14, 159.8], [15, 161.7], [16, 162.5], [17, 162.9], [18, 163.1]],
};
export function interp(tab, x) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) { const [x0, y0] = tab[i - 1], [x1, y1] = tab[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); }
  return tab[tab.length - 1][1];
}

// The menstrual cycle (day 1 = the first day of a period). Luteal phase about 14 days, so ovulation
// falls on about day L − 14 (Guyton & Hall ch. 82; ACOG "Your Menstrual Cycle"; NHS "Periods").
// Hormone shapes follow the classic daily curves (Stricker et al., Clin Chem Lab Med 44:883, 2006:
// medians about FSH 6 IU/L early, 12–15 at ovulation; LH about 5, surging to about 40–50 IU/L;
// oestradiol about 40 pg/mL early, peaking about 250 pg/mL just before ovulation, a second hump
// about 150 in the luteal phase; progesterone under 1 ng/mL before ovulation, about 12–15 at its
// peak a week later). The curves here are smooth sums of bumps tuned to those values: illustrative.
// Lining thickness on ultrasound: about 2–4 mm during a period, 5–7 early, up to about 11 before
// ovulation, 7–16 mm after it (Radiopaedia "Endometrial thickness"). Dominant follicle grows about
// 1.5–2 mm a day to about 18–25 mm before it bursts (Baerwald et al., Hum Reprod Update 18:73, 2012).
const bump = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
export function cycleAt(day, L = 28, P = 5) {
  const O = L - 14 + 0.5;                                     // ovulation, mid-day
  const fol = day < O ? day / O : 1, lut = day >= O ? (day - O) / (L - O) : 0;
  const FSH = 3 + 3.5 * bump(day, 2, 5) * (day < O ? 1 : 0.3) + 9 * bump(day, O - 0.5, 0.9) + 2.5 * bump(day, L + 1, 2);
  const LH = 4.5 + 42 * bump(day, O - 0.6, 0.8) + 0.8 * bump(day, O + 5, 4);
  const E2 = 40 + 215 * bump(day, O - 1.2, 2.3) * smooth(fol * 1.3) + 110 * bump(day, O + 7, 3.2);
  const P4 = 0.4 + 13 * bump(day, O + 7, 3.4) * (day > O ? 1 : 0);
  let lining;
  if (day <= P) lining = lerp(12, 3, smooth(day / P));
  else if (day <= O) lining = lerp(3, 11, smooth((day - P) / (O - P)));
  else lining = lerp(11, 13, smooth((day - O) / 5)) - (day > L - 2 ? 1.5 * (day - (L - 2)) : 0);
  const follicle = day < O ? 3 + 19 * Math.pow(smooth(clamp((day - 2) / (O - 2), 0, 1)), 1.4) : 0;
  const luteum = day >= O ? 16 * (1 - 0.6 * smooth((day - O - 8) / (L - O - 8 + 1e-6))) : 0;
  const phase = day <= P ? 'period' : day < O - 1 ? 'follicular' : day <= O + 1 ? 'ovulation' : 'luteal';
  return { O, FSH, LH, E2, P4, lining, follicle, luteum, phase, fol, lut };
}
export const PHASE = {
  period: { name: 'Period (menstruation)', col: '#ff6f7d', what: 'The old lining is shed with a little blood.' },
  follicular: { name: 'Follicular phase', col: '#6ee7a8', what: 'A follicle ripens an egg; oestrogen rebuilds the lining.' },
  ovulation: { name: 'Ovulation', col: '#ffd166', what: 'An LH surge makes the follicle burst and release its egg.' },
  luteal: { name: 'Luteal phase', col: '#c9a7ff', what: 'The empty follicle makes progesterone; the lining gets ready.' },
};

// Pregnancy size by week (counted from the first day of the last period). Weeks 8–20: crown to rump;
// from week 20: crown to heel. Median values as widely tabulated from Hadlock et al. (Radiology
// 152:497, 1984; 181:129, 1991) and ACOG "How Your Fetus Grows During Pregnancy". Early weeks from
// Moore, The Developing Human, 11th ed. (about 2 mm at week 5, 4–6 mm at week 6).
export const GROWTH = [
  { w: 5, len: 0.2, g: 0, fruit: 'a sesame seed (til)', fcol: 0xf3e2b3, fr: [0.1, 0.06, 0.05] },
  { w: 6, len: 0.5, g: 0, fruit: 'a lentil (masoor dal)', fcol: 0xe07b4c, fr: [0.25, 0.25, 0.1] },
  { w: 7, len: 1.0, g: 0.5, fruit: 'a blueberry', fcol: 0x5b6fd6, fr: [0.5, 0.5, 0.5] },
  { w: 8, len: 1.6, g: 1, fruit: 'a jamun', fcol: 0x5b2a86, fr: [0.8, 1.0, 0.8] },
  { w: 10, len: 3.1, g: 4, fruit: 'a strawberry', fcol: 0xe8394a, fr: [1.4, 1.7, 1.4] },
  { w: 12, len: 5.4, g: 14, fruit: 'a lemon (nimbu)', fcol: 0xf2e14a, fr: [2.6, 3.0, 2.6] },
  { w: 14, len: 8.7, g: 43, fruit: 'a peach', fcol: 0xf7a26b, fr: [3.6, 3.6, 3.6] },
  { w: 16, len: 11.6, g: 100, fruit: 'a guava', fcol: 0xa8d860, fr: [4.2, 5.0, 4.2] },
  { w: 18, len: 14.2, g: 190, fruit: 'a sweet potato', fcol: 0xb0603a, fr: [3.5, 7.0, 3.5] },
  { w: 20, len: 25.6, g: 300, fruit: 'a banana', fcol: 0xf6d743, fr: [2.0, 9.0, 2.0] },
  { w: 24, len: 30.0, g: 600, fruit: 'an ear of corn (bhutta)', fcol: 0xf0c541, fr: [2.6, 11, 2.6] },
  { w: 28, len: 37.6, g: 1005, fruit: 'a large brinjal', fcol: 0x5a2d7a, fr: [5, 12, 5] },
  { w: 32, len: 42.4, g: 1702, fruit: 'a papaya', fcol: 0xf29a3a, fr: [7, 12, 7] },
  { w: 36, len: 47.4, g: 2622, fruit: 'a muskmelon (kharbooja)', fcol: 0xe6c27a, fr: [8.5, 9, 8.5] },
  { w: 40, len: 51.2, g: 3462, fruit: 'a small watermelon', fcol: 0x3f8f45, fr: [10, 11, 10] },
];
export function growthAt(w) {
  const G = GROWTH;
  if (w <= G[0].w) return { ...G[0], len: G[0].len, g: G[0].g, near: G[0] };
  for (let i = 1; i < G.length; i++) if (w <= G[i].w) {
    const a = G[i - 1], b = G[i], k = (w - a.w) / (b.w - a.w);
    return { w, len: lerp(a.len, b.len, k), g: lerp(a.g, b.g, k), near: k < 0.5 ? a : b };
  }
  return { ...G[G.length - 1], near: G[G.length - 1] };
}
