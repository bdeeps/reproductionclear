// Chapter 4: fertilisation at the level of cells. A short section of the wide part of a fallopian tube
// (the ampulla), drawn at 1 model unit = 10 µm. Sperm swim up to the egg; one gets through the
// zona pellucida and fuses; the zona hardens so no other can enter; the two sets of 23 chromosomes
// (pronuclei) meet; the zygote divides as it drifts down the tube; a hollow blastocyst hatches from
// the zona in the uterus and burrows into the lining.
// Sizes and timings (Moore, Persaud & Torchia, The Developing Human, 11th ed., ch. 2–3; Guyton &
// Hall 14th ed., ch. 83; Niakan et al., Development 139:829, 2012; Britannica "Fertilization"):
//  - the egg (secondary oocyte) is about 100–120 µm across, the largest cell in the body, inside a
//    zona pellucida about 15 µm thick and a crown (corona radiata) of follicle cells;
//  - a sperm is about 55–60 µm long: a head about 5 µm long and 3 µm wide, and a tail about 50 µm;
//    it swims a few millimetres a minute;
//  - of the many millions of sperm released, only a few hundred reach the egg; one fuses with it;
//  - the egg can be fertilised for only about 12–24 hours after ovulation;
//  - 2 cells at about 30 hours, 4 cells at about 40–48 hours, 8 cells at about day 3, a morula of
//    12–16 or more cells at about day 3–4, entering the uterus about day 4; a blastocyst (a hollow
//    ball of about 60–100 cells with an inner cell mass that becomes the baby) about day 4–5; it
//    hatches from the zona about day 5–6; implantation begins about day 6–7 and is complete by about
//    day 10; the embryo then starts making hCG, the hormone a pregnancy test detects;
//  - cleavage does not make the embryo bigger: the cells get smaller with each division.
// Chromosomes: 23 in each gamete (22 autosomes + an X or a Y), 46 in the zygote (Tjio & Levan,
// Hereditas 42:1, 1956). Every egg carries an X; about half of sperm carry X and half Y.
import { THREE, clamp, lerp, smooth, canvasTexture } from '../kit.js';
import { blob, glowMat, ghost, board, panel, text, tint, fitNarrow, compactReadout, inReel, rnd, COL } from '../repro.js';

const C = new THREE.Vector3(0, 6, 0);        // the egg's centre (units of 10 µm)
const R_EGG = 5, R_ZONA = 6.3;
const NS = 36, TAIL = 11;
const STEPS = [
  { t: 0, label: 'Meet' }, { t: 0.6, label: 'Zygote' }, { t: 1.6, label: '2 cells' }, { t: 3.0, label: '8 cells' }, { t: 4.9, label: 'Blastocyst' }, { t: 8.5, label: 'Implant' },
];
const DIV = [1.25, 2.0, 2.6, 3.2, 3.8];      // days when the cells become 2, 4, 8, 16, 32
function cellsAt(T) { let n = 1; DIV.forEach((d) => { if (T >= d) n *= 2; }); return n; }

// cell centres for each generation: split each parent along a turning axis, then relax so the cells
// pack inside the zona without overlapping much
function makeGenerations() {
  const gens = [[new THREE.Vector3()]], radii = [4.7];
  for (let g = 1; g <= 5; g++) {
    const n = 2 ** g, r = R_EGG * 0.9 * Math.pow(n, -1 / 3), prev = gens[g - 1], out = [];
    prev.forEach((p, c) => {
      const a = new THREE.Vector3(Math.cos(g * 1.9 + c * 2.3), Math.sin(g * 1.3 + c * 0.7), Math.sin(g * 2.7 + c * 1.1)).normalize();
      out.push(p.clone().addScaledVector(a, r * 0.9), p.clone().addScaledVector(a, -r * 0.9));
    });
    for (let it = 0; it < 60; it++) {
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const d = out[i].clone().sub(out[j]), L = d.length() || 1e-3, want = 1.8 * r;
        if (L < want) { d.multiplyScalar((want - L) / L / 2 * 0.5); out[i].add(d); out[j].sub(d); }
      }
      out.forEach((p) => { const m = R_ZONA - 0.35 - r; if (p.length() > m) p.setLength(m); });
    }
    gens.push(out); radii.push(r);
  }
  return { gens, radii };
}
const fib = (i, n) => { const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996; return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); };

function drawBoard(g, w, h, st) {
  panel(g, w, h);
  if (!st) return;
  const { T, y } = st, fused = T >= 0.3;
  text(g, 'Chromosomes: 23 + 23 = 46', 28, 52, 32, '#fff', 600);
  const bars = (x0, yy, n, col, last, lastCol, alpha = 1) => {
    g.globalAlpha = alpha;
    for (let i = 0; i < n; i++) {
      const L = i === n - 1 ? (last === 'Y' ? 12 : 30) : 44 - i * 1.4;
      g.fillStyle = i === n - 1 ? lastCol : col; rrectFill(g, x0 + i * 20, yy + (48 - L), 12, L, 5);
    }
    text(g, last, x0 + (n - 1) * 20 + 6, yy + 70, 18, lastCol, 700, 'center');
    g.globalAlpha = 1;
  };
  text(g, 'Egg: 23', 28, 102, 24, '#ff9fc0', 600); bars(130, 76, 23, '#ff9fc0', 'X', '#ffd166');
  text(g, 'Sperm: 23', 28, 186, 24, '#8ef0ff', 600); bars(130, 160, 23, '#8ef0ff', y, y === 'Y' ? '#6ee7a8' : '#ffd166');
  text(g, fused ? 'Zygote: 46, in 23 pairs' : 'Zygote: not yet', 28, 276, 24, fused ? '#ffffff' : '#6b7285', 600);
  g.globalAlpha = fused ? 1 : 0.2;
  for (let i = 0; i < 23; i++) {
    const L1 = i === 22 ? 30 : 44 - i * 1.4, L2 = i === 22 ? (y === 'Y' ? 12 : 30) : L1, x = 28 + i * 21;
    g.fillStyle = i === 22 ? '#ffd166' : '#ff9fc0'; rrectFill(g, x, 296 + 48 - L1, 8, L1, 4);
    g.fillStyle = i === 22 ? (y === 'Y' ? '#6ee7a8' : '#ffd166') : '#8ef0ff'; rrectFill(g, x + 9, 296 + 48 - L2, 8, L2, 4);
  }
  g.globalAlpha = 1;
  // who decides: the X/Y square
  text(g, 'Girl or boy? The sperm decides', 28, 400, 26, '#fff', 600);
  const gx = 150, gy = 420, cw = 150, chh = 62;
  text(g, 'sperm X', gx + cw / 2, gy + 20, 20, '#ffd166', 600, 'center'); text(g, 'sperm Y', gx + cw * 1.5 + 10, gy + 20, 20, '#6ee7a8', 600, 'center');
  text(g, 'egg X', 90, gy + 30 + chh / 2 + 8, 20, '#ff9fc0', 600, 'center');
  [['X', 'XX: girl', '#ffd166'], ['Y', 'XY: boy', '#6ee7a8']].forEach(([k, lab, col], i) => {
    const x = gx + i * (cw + 10), on = y === k;
    g.fillStyle = on ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.04)'; rrectFill(g, x, gy + 32, cw, chh, 12);
    if (on) { g.strokeStyle = col; g.lineWidth = 3; rrectPath(g, x, gy + 32, cw, chh, 12); g.stroke(); }
    text(g, lab, x + cw / 2, gy + 32 + chh / 2 + 9, 24, on ? '#fff' : '#8b93a7', 600, 'center');
  });
  const note = 'Every egg carries an X. About half of all sperm carry an X and half a Y, so a baby’s sex is set by chance, by the sperm.';
  wrapText(g, note, 28, gy + 132, w - 56, 20, '#aab3c5');
}
function rrectPath(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function rrectFill(g, x, y, w, h, r) { rrectPath(g, x, y, w, h, Math.min(r, w / 2, h / 2)); g.fill(); }
function wrapText(g, s, x, y, maxW, px, col) {
  g.font = `400 ${px}px Geist, system-ui, sans-serif`; g.fillStyle = col; g.textAlign = 'left';
  let line = '';
  for (const word of s.split(' ')) { const t = line ? line + ' ' + word : word; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += px * 1.35; line = word; } else line = t; }
  if (line) g.fillText(line, x, y);
}

function stageOf(T) {
  if (T < 0.25) return { name: 'Sperm reach the egg', where: 'the wide part of a fallopian tube' };
  if (T < 1.2) return { name: 'Fertilisation: a zygote', where: 'the fallopian tube' };
  if (T < 3.8) return { name: `Cleavage: ${cellsAt(T)} cells`, where: 'drifting down the tube' };
  if (T < 4.3) return { name: 'Morula: a ball of cells', where: 'entering the uterus' };
  if (T < 5.5) return { name: 'Blastocyst', where: 'floating in the uterus' };
  if (T < 6.2) return { name: 'Hatching from the zona', where: 'the uterus' };
  return { name: T < 9.5 ? 'Implantation' : 'Implanted', where: 'burrowing into the uterus lining' };
}
const clockOf = (T) => (T < 2 ? `hour ${Math.round(T * 24)}` : `day ${T.toFixed(1)}`);

export default {
  id: 'fertilisation',
  short: 'Egg meets sperm',
  title: 'Fertilisation: two cells become one',
  subtitle: 'In the fallopian tube, one sperm joins one egg. The new cell divides and divides, and settles into the uterus.',
  view: { pos: [4.5, 8, 40], target: [6.2, 6, 0] },
  learn: `<p>This happens at the scale of <b>cells</b>, far too small to see with your eyes. The <b>egg</b> is about <b>0.1 mm</b> across, the biggest cell in the human body, just about the size of the full stop at the end of this sentence. A <b>sperm</b> is much smaller: a head about 5 µm long and a long tail it whips to swim.</p>
    <p>After ovulation, the egg is swept into the wide part of the <b>fallopian tube</b>. It can be fertilised for only about 12 to 24 hours. Of the millions of sperm that set out, only a few hundred reach the egg. They push through the crown of cells around it, and <b>just one</b> gets through the clear coat, the <b>zona pellucida</b>, and joins the egg. At once the zona hardens so that no other sperm can get in.</p>
    <p>Now the egg is a <b>zygote</b>: a single new cell. The egg brought <b>23 chromosomes</b> and the sperm brought 23, so the zygote has <b>46</b>, in 23 pairs, the full set of instructions for a new person. Every egg carries an <b>X</b> chromosome. About half of sperm carry an X and half a <b>Y</b>. XX usually makes a girl and XY a boy, so the baby's sex is set by chance, by the sperm, never by the mother.</p>
    <p>As it drifts down the tube, the zygote <b>divides</b>: 2 cells at about 30 hours, then 4, 8 and 16, without growing any bigger. By about day 4 it is a ball of cells in the uterus. It becomes a hollow <b>blastocyst</b>, with an inner cluster that will become the baby. Around <b>days 6 to 10</b> it hatches out of its coat and <b>implants</b>, burrowing into the thick lining that the cycle prepared.</p>
    <p class="tip"><b>Try it:</b> press play, or jump between the stages. Flip the sperm between X and Y and see the chromosome board change.</p>`,
  terms: [
    { t: 'Fertilisation', d: 'The joining of an egg and a sperm to make a single new cell.' },
    { t: 'Zona pellucida', d: 'The clear protective coat around the egg. It hardens after one sperm enters.' },
    { t: 'Zygote', d: 'The first cell of a new individual, with 46 chromosomes.' },
    { t: 'Chromosome', d: 'A tightly packed thread of DNA. Humans have 46, in 23 pairs.' },
    { t: 'Blastocyst', d: 'A hollow ball of cells, about 5 days old, with an inner cell mass that becomes the baby.' },
    { t: 'Implantation', d: 'When the blastocyst burrows into the lining of the uterus, about days 6 to 10.' },
  ],
  defaults: { T: 0, play: true, y: 'X', labels: true },
  controls: [
    { key: 'T', type: 'range', label: 'Time since the sperm arrive', min: 0, max: 10, step: 0.01, ends: ['0', '10 days'], fmt: (v) => clockOf(v) },
    { key: 'jump', type: 'buttons', label: 'Jump to', items: STEPS.map((st) => ({ label: st.label, act: (s) => { s.T = st.t; } })) },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'y', type: 'seg', label: 'The winning sperm carries', options: [{ v: 'X', label: 'X' }, { v: 'Y', label: 'Y' }], fmt: (v) => (v === 'X' ? 'XX: a girl' : 'XY: a boy') },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'Where does fertilisation usually happen?', options: ['In the ovary', 'In the fallopian tube', 'In the cervix', 'In the uterus lining'], answer: 1, why: 'Egg and sperm usually meet in the wide outer part of a fallopian tube. The embryo reaches the uterus about 4 days later.' },
    { q: 'How many chromosomes does a zygote have?', options: ['23', '46', '92', '44'], answer: 1, why: '23 from the egg plus 23 from the sperm make 46, in 23 pairs.' },
    { q: 'What decides whether a baby is XX or XY?', options: ['The mother’s egg', 'Whether the sperm carries an X or a Y', 'The food the mother eats', 'The day of the week'], answer: 1, why: 'Every egg carries an X. The sperm carries either an X or a Y, by chance.' },
  ],
  reel: [
    { ms: 5400, caption: 'Of millions of sperm, a few hundred reach the egg in the fallopian tube, and just one gets in.', set: { play: false, y: 'X', labels: false }, anim: { T: [0, 0.5] }, view: { pos: [-2, 7, 26], target: [0, 6, 0] }, spin: 0.3 },
    { ms: 5600, caption: '23 chromosomes from each parent make 46; the new cell divides into a hollow ball that implants by day 10.', set: { play: false, labels: false }, anim: { T: [1.0, 8.5] }, view: { pos: [2, 6, 30], target: [0, 4, 0] }, spin: 0.3 },
  ],

  build({ stage }) {
    stage.setWorldMode(true);
    const root = new THREE.Group(); stage.root.add(root);
    const hemi = new THREE.HemisphereLight(0xfff0f4, 0x302030, 1.3), key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(10, 30, 25); root.add(hemi, key);
    const world = new THREE.Group(); world.position.copy(C); root.add(world);
    // the tube around us: a soft pink wall with folds and waving cilia
    const wallMat = ghost(0xf2a7b6, 0.14, 0.25); wallMat.side = THREE.BackSide;
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 160, 64, 1, true), wallMat); wall.rotation.z = Math.PI / 2; world.add(wall);
    const folds = new THREE.Group(); world.add(folds);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2, m = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 160, 12), ghost(0xf2a7b6, 0.1, 0.1));
      m.rotation.z = Math.PI / 2; m.position.set(0, Math.cos(a) * 57, Math.sin(a) * 57); folds.add(m);
    }
    const NC = 220, cilia = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.25, 6, 5), new THREE.MeshStandardMaterial({ color: 0xf6c1cc, transparent: true, opacity: 0.4, depthWrite: false }), NC);
    cilia.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(cilia);
    const cil = Array.from({ length: NC }, (_, i) => ({ x: -75 + rnd(i) * 150, a: rnd(i + 50) * Math.PI * 2 }));
    // the uterus lining for implantation (appears after about day 4)
    const linGeo = new THREE.PlaneGeometry(90, 50, 60, 30); linGeo.rotateX(-Math.PI / 2);
    const lp = linGeo.attributes.position;
    for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), z = lp.getZ(i); lp.setY(i, 0.9 * Math.sin(x * 0.35) * Math.cos(z * 0.4) + 0.5 * Math.sin(x * 0.9 + z * 0.7)); }
    linGeo.computeVertexNormals();
    const linMat = new THREE.MeshStandardMaterial({ color: 0xc84a60, roughness: 0.7, transparent: true, opacity: 0, emissive: 0x6a1020, emissiveIntensity: 0.3, side: THREE.DoubleSide, depthWrite: false });
    const lining = new THREE.Mesh(linGeo, linMat); lining.position.y = -10; world.add(lining);
    const linBody = new THREE.Mesh(new THREE.BoxGeometry(90, 14, 50), new THREE.MeshStandardMaterial({ color: 0xa83850, transparent: true, opacity: 0, depthWrite: false, roughness: 0.8 }));
    linBody.position.y = -17.2; world.add(linBody);
    // the embryo group (moves down into the lining at implantation)
    const emb = new THREE.Group(); world.add(emb);
    const cyto = new THREE.MeshStandardMaterial({ color: 0xfff1d6, transparent: true, opacity: 0.55, roughness: 0.35, emissive: 0xfff1a8, emissiveIntensity: 0.12, depthWrite: false });
    const egg = blob([R_EGG, R_EGG, R_EGG], [0, 0, 0], cyto, 40); emb.add(egg);
    const zonaMat = new THREE.MeshStandardMaterial({ color: 0xd8f3ff, transparent: true, opacity: 0.22, roughness: 0.1, emissive: 0x8ef0ff, emissiveIntensity: 0.05, depthWrite: false, side: THREE.DoubleSide });
    const zona = blob([R_ZONA, R_ZONA, R_ZONA], [0, 0, 0], zonaMat, 48); emb.add(zona);
    const NCOR = 48, corona = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf3d6a0, roughness: 0.6, transparent: true, opacity: 0.55, depthWrite: false }), NCOR);
    corona.instanceMatrix.setUsage(THREE.DynamicDrawUsage); emb.add(corona);
    const corDir = Array.from({ length: NCOR }, (_, i) => fib(i, NCOR).multiplyScalar(7.2 + rnd(i * 3) * 1.4));
    // pronuclei: 23 chromosomes from the egg (pink) and 23 from the sperm (blue)
    const pnF = blob([0.95, 0.95, 0.95], [-1.5, 0.6, 0.8], glowMat(0xff9fc0, 0.7), 20), pnM = blob([0.95, 0.95, 0.95], [3, 1, 1.5], glowMat(0x8ef0ff, 0.7), 20);
    emb.add(pnF, pnM);
    // cleavage cells
    const { gens, radii } = makeGenerations();
    const cellMat = new THREE.MeshStandardMaterial({ color: 0xffe9c6, roughness: 0.4, emissive: 0xffd9a0, emissiveIntensity: 0.12, transparent: true, opacity: 1 });
    const cells = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 26, 18), cellMat, 32);
    cells.instanceMatrix.setUsage(THREE.DynamicDrawUsage); emb.add(cells);
    // blastocyst: a shell of flattened trophoblast cells, a fluid cavity and the inner cell mass
    const NT = 90, troph = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffd9b0, roughness: 0.5, emissive: 0xff9f7a, emissiveIntensity: 0.15, transparent: true, opacity: 1 }), NT);
    troph.instanceMatrix.setUsage(THREE.DynamicDrawUsage); emb.add(troph);
    const trDir = Array.from({ length: NT }, (_, i) => fib(i, NT));
    const cavity = blob([1, 1, 1], [0, 0, 0], new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.18, depthWrite: false }), 30); emb.add(cavity);
    const icmMat = new THREE.MeshStandardMaterial({ color: 0xff9fc0, roughness: 0.4, emissive: 0xff7aa8, emissiveIntensity: 0.35, transparent: true, opacity: 1 });
    const icm = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), icmMat, 14); icm.instanceMatrix.setUsage(THREE.DynamicDrawUsage); emb.add(icm);
    const icmOff = Array.from({ length: 14 }, (_, i) => new THREE.Vector3((rnd(i) - 0.5) * 3.2, (rnd(i + 20) - 0.5) * 1.6, (rnd(i + 40) - 0.5) * 3.2));
    // sperm: heads (instanced) and tails (line segments)
    const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: COL.sperm, roughness: 0.3, emissive: 0x9fd8ff, emissiveIntensity: 0.4, transparent: true, opacity: 1 }), NS);
    heads.instanceMatrix.setUsage(THREE.DynamicDrawUsage); world.add(heads);
    const tailPos = new Float32Array(NS * (TAIL - 1) * 2 * 3);
    const tailGeo = new THREE.BufferGeometry(); tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPos, 3));
    const tailMat = new THREE.LineBasicMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.9 });
    const tails = new THREE.LineSegments(tailGeo, tailMat); tails.frustumCulled = false; world.add(tails);
    const SP = Array.from({ length: NS }, (_, i) => {
      // arrive from all round, mostly from the uterus end of the tube (−x)
      const dir = fib((i * 7) % NS, NS); if (i === 0) dir.set(-0.75, 0.35, 0.56).normalize();
      const start = dir.clone().multiplyScalar(26).add(new THREE.Vector3(-14 - rnd(i) * 10, 0, 0));
      start.y = clamp(start.y, -16, 16); start.z = clamp(start.z, -16, 16);
      return { dir, start, spd: i === 0 ? 1 : 0.55 + 0.7 * rnd(i + 9), ph: rnd(i + 3) * 6.28 };
    });
    const O = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3(), side = new THREE.Vector3(), q = new THREE.Quaternion();
    const L = (h, p, c, parent = world) => tint(stage.label(h, p, parent), c);
    const lab = { egg: L('Egg: 0.1 mm', [7.5, -8.5, 0], 'cream', emb), zona: L('Zona pellucida', [-8.5, -6.5, 0], 'cyan', emb), sperm: L('Sperm', [-17, 9, 0], 'blue'), pn: L('', [0, -7, 0], 'pink', emb), icm: L('Inner cell mass: becomes the baby', [9, -6, 0], 'pink', emb), lin: L('Uterus lining', [20, -12, 6], 'red'), tube: L('Inside the fallopian tube', [14, 16, -6], 'pink') };
    const ct = canvasTexture(560, 600, drawBoard);
    const bd = board(ct, 13.3, 14.25); bd.position.set(19.8, 6.2, 0); root.add(bd);
    let lastKey = '', cur = 0;
    const fit = fitNarrow(stage, { pos: [0, 5, 34], target: [0, 4, 0] });
    return compactReadout(stage, {
      dispose() { stage.setWorldMode(false); },
      update(dt, s, time) {
        dt = Math.max(0, dt);
        if (s.play && !inReel()) { s.T += dt * (s.T < 1.4 ? 0.07 : 0.35); if (s.T > 10) s.T = 0; }
        const T = clamp(s.T, 0, 10); cur = T;
        // setting: tube fades out, lining fades in
        const inU = smooth((T - 3.8) / 1.0);
        wallMat.opacity = 0.14 * (1 - inU); folds.visible = inU < 0.95; folds.children.forEach((m) => { m.material.opacity = 0.1 * (1 - inU); });
        cilia.visible = inU < 0.95;
        cil.forEach((c, i) => {
          const r = 57, w = Math.sin(time * 6 + c.x * 0.3) * 0.5;
          O.position.set(c.x, Math.cos(c.a) * r, Math.sin(c.a) * r);
          O.rotation.set(c.a + Math.PI / 2, 0, w); O.scale.setScalar(1); O.updateMatrix(); cilia.setMatrixAt(i, O.matrix);
        });
        cilia.instanceMatrix.needsUpdate = true;
        linMat.opacity = 0.85 * inU; linBody.material.opacity = 0.6 * inU;
        // embryo position: sinks into the lining from about day 5.5
        const Rb = T < 4.3 ? R_ZONA : T < 5.5 ? lerp(R_ZONA, 7.4, smooth((T - 4.3) / 1.2)) : lerp(7.4, 9, smooth((T - 5.5) / 1.5));
        emb.position.y = T < 5.5 ? 0 : lerp(0, -10 + Rb - 0.3, smooth((T - 5.5) / 0.7)) - 6.5 * smooth((T - 6.2) / 3.6);
        // fertilisation and zona
        const fuse = smooth((T - 0.25) / 0.06);
        zonaMat.emissiveIntensity = 0.05 + 0.55 * fuse * (1 - smooth((T - 1) / 1));
        const hatch = smooth((T - 5.2) / 0.8);
        zonaMat.opacity = 0.22 * (1 - hatch); zona.visible = hatch < 0.99;
        zona.scale.setScalar(Rb < R_ZONA + 0.01 ? R_ZONA : Rb + 0.2);
        // corona cells drift away after fertilisation
        const disp = smooth((T - 0.3) / 0.9);
        corona.visible = disp < 0.99;
        corDir.forEach((d, i) => { O.position.copy(d).multiplyScalar(1 + disp * (1.5 + rnd(i) * 2)); O.rotation.set(0, 0, 0); O.scale.setScalar(Math.max(0.001, 1 - disp)); O.updateMatrix(); corona.setMatrixAt(i, O.matrix); });
        corona.instanceMatrix.needsUpdate = true;
        // the egg cytoplasm is the one-cell stage; hide it once cells divide
        const n = cellsAt(T);
        const blast = smooth((T - 4.2) / 0.5);
        egg.visible = T < DIV[0] - 0.1;
        // pronuclei meet and merge
        const pnOn = T >= 0.3 && T < 1.15;
        pnF.visible = pnM.visible = pnOn;
        if (pnOn) { const k = smooth((T - 0.35) / 0.6); pnF.position.set(lerp(-1.5, -0.55, k), lerp(0.6, 0.2, k), lerp(0.8, 0.3, k)); pnM.position.set(lerp(3.3, 0.55, k), lerp(1.4, 0.2, k), lerp(2, 0.3, k)); const sc = 0.95 * (1 - 0.3 * smooth((T - 0.95) / 0.2)); pnF.scale.setScalar(sc); pnM.scale.setScalar(sc); }
        // cleavage cells (32 instances; several share a cell in early generations)
        let g = 0; while (g < 5 && T >= DIV[g] - 0.12) g++;
        const gPrev = Math.max(0, g - 1), k = g > 0 ? smooth((T - (DIV[g - 1] - 0.12)) / 0.12) : 1;
        cells.visible = T >= DIV[0] - 0.12 && blast < 0.99;
        cellMat.opacity = 1 - blast;
        for (let i = 0; i < 32; i++) {
          const cNow = i >> (5 - g), cPrev = i >> (5 - gPrev);
          const pNow = gens[g][cNow], pPrev = gens[gPrev][cPrev];
          O.position.copy(pPrev).lerp(pNow, g > 0 ? k : 1);
          O.scale.setScalar(Math.max(0.001, lerp(radii[gPrev], radii[g], g > 0 ? k : 1) * 0.98));
          O.rotation.set(0, 0, 0); O.updateMatrix(); cells.setMatrixAt(i, O.matrix);
        }
        cells.instanceMatrix.needsUpdate = true;
        // blastocyst
        troph.visible = cavity.visible = icm.visible = blast > 0.01;
        const tr = Rb - 0.9;
        trDir.forEach((d, i) => {
          O.position.copy(d).multiplyScalar(tr * lerp(0.6, 1, blast));
          O.quaternion.setFromUnitVectors(up, d); const cs = 2.3 * Math.sqrt(90 / NT) * (tr / 6);
          O.scale.set(cs * 0.55, 0.45, cs * 0.55); O.scale.multiplyScalar(blast); O.updateMatrix(); troph.setMatrixAt(i, O.matrix);
          O.quaternion.identity();
        });
        troph.instanceMatrix.needsUpdate = true;
        troph.material.emissiveIntensity = 0.15 + 0.5 * smooth((T - 6) / 2);
        cavity.scale.setScalar(Math.max(0.01, (tr - 0.4) * blast));
        icmOff.forEach((o, i) => { O.position.set(o.x, -tr + 2.0 + o.y, o.z); O.scale.setScalar(1.05 * blast); O.updateMatrix(); icm.setMatrixAt(i, O.matrix); });
        icm.instanceMatrix.needsUpdate = true;
        // sperm swim in, cluster on the zona, one enters; the rest drift off
        let idx = 0;
        const showSp = T < 1.1;
        heads.visible = tails.visible = showSp;
        heads.material.opacity = tailMat.opacity = 1 - smooth((T - 0.6) / 0.5);
        SP.forEach((sp, i) => {
          const arrive = clamp((T / 0.2) * sp.spd, 0, 1);
          const surf = sp.dir.clone().multiplyScalar(R_ZONA + 0.5 + (i ? 0.9 : 0));
          const head = sp.start.clone().lerp(surf, smooth(arrive));
          let fwd = surf.clone().sub(sp.start).normalize();
          if (arrive >= 1) fwd = sp.dir.clone().negate();
          if (i === 0) {
            const inK = smooth((T - 0.16) / 0.1);
            head.copy(sp.dir).multiplyScalar(lerp(R_ZONA + 0.5, R_EGG - 0.3, inK));
          } else if (T > 0.28) {
            head.addScaledVector(sp.dir, (T - 0.28) * 14 * (0.6 + rnd(i)));
          }
          const vis = i === 0 ? T < 0.32 : true;
          side.crossVectors(fwd, Math.abs(fwd.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : up).normalize();
          O.position.copy(head); q.setFromUnitVectors(up, fwd); O.quaternion.copy(q);
          O.scale.set(0.3, 0.5, 0.18).multiplyScalar(vis ? 1 : 0.001); O.updateMatrix(); heads.setMatrixAt(i, O.matrix); O.quaternion.identity();
          const beat = time * 14 + sp.ph, stop = i === 0 && T > 0.26 ? 0 : 1;
          for (let j = 0; j < TAIL - 1; j++) {
            for (const [jj, o] of [[j, 0], [j + 1, 3]]) {
              const u = jj / (TAIL - 1);
              tmp.copy(head).addScaledVector(fwd, -(0.45 + u * 5.2)).addScaledVector(side, stop * 0.55 * u * Math.sin(beat - jj * 0.9));
              if (!vis) tmp.copy(head);
              tailPos[idx + o] = tmp.x; tailPos[idx + o + 1] = tmp.y; tailPos[idx + o + 2] = tmp.z;
            }
            idx += 6;
          }
        });
        heads.instanceMatrix.needsUpdate = true; tailGeo.attributes.position.needsUpdate = true;
        // labels and board
        const narrow = fit(), on = s.labels && !inReel() && !narrow;
        lab.egg.element.textContent = T < 0.3 ? 'Egg: 0.1 mm' : T < DIV[0] ? 'Zygote: one new cell' : T < 4.3 ? `${n} cells, same total size` : 'Blastocyst: a hollow ball';
        lab.pn.element.textContent = '23 + 23 chromosomes meet';
        lab.egg.visible = on; lab.zona.visible = on && T < 5.3; lab.sperm.visible = on && T < 0.3;
        lab.pn.visible = on && pnOn; lab.icm.visible = on && blast > 0.5; lab.lin.visible = on && inU > 0.5; lab.tube.visible = on && inU < 0.3;
        bd.visible = !narrow || inReel();
        const key = `${T >= 0.3}|${s.y}`;
        if (key !== lastKey && bd.visible) { lastKey = key; ct.redraw({ T, y: s.y }); }
      },
      readout: (s) => {
        const T = cur, st = stageOf(T), n = cellsAt(T);
        const cellsTxt = T < DIV[0] ? (T < 0.3 ? 'egg and sperm' : '1') : T < 4.3 ? String(n) : T < 6.2 ? 'about 60–100' : 'hundreds';
        return `<div class="big">${st.name}</div>
          <div class="row"><span>Time</span><b>${clockOf(T)}</b></div>
          <div class="row"><span>Where</span><b>${st.where}</b></div>
          <div class="row"><span>Cells</span><b>${cellsTxt}</b></div>
          <div class="row"><span>Chromosomes per cell</span><b>${T < 0.3 ? '23 in each gamete' : '46'}</b></div>
          <div class="row"><span>Size</span><b>${T < 4.3 ? 'about 0.1 mm' : 'about 0.15–0.2 mm'}</b></div>
          <small>${T >= 6.2 ? 'It now starts making hCG, the hormone a pregnancy test detects.' : T >= 0.3 && T < 1.2 ? 'The zona has hardened: no other sperm can get in.' : 'Drawn at 1 unit = 10 µm. Sperm tails are really about 50 µm long.'}</small>`;
      },
    });
  },
};
