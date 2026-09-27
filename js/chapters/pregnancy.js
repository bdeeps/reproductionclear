// Chapter 5: pregnancy. A cut-open diagram of the uterus with the growing baby, the amniotic sac, the
// placenta and the umbilical cord, from week 5 to week 40 (counted from the first day of the last
// period, so fertilisation is about week 2). The view zooms so the uterus always fills the frame; a
// ruler and a fruit of the same size, drawn at the same scale, show how big everything really is.
// Sources:
//  - length and weight by week: GROWTH in repro.js (Hadlock et al.; ACOG; Moore);
//  - uterus size: about 7.5 cm before pregnancy; at 12 weeks it rises out of the pelvis; at 20 weeks it
//    reaches the navel; after that the fundal height in cm roughly equals the week (Williams
//    Obstetrics 26th ed., ch. 4 and 9; WHO antenatal care guidance). Our uterus length follows that;
//  - placenta at term: about 22 cm across, 2–2.5 cm thick, about 500 g; umbilical cord about 50–60 cm
//    with two arteries and one vein; mother's and baby's blood do not mix, they exchange across a
//    thin barrier; blood flow to the placenta at term about 500–700 mL a minute (Williams ch. 5;
//    Guyton & Hall ch. 83);
//  - heart: the embryo's heart starts beating about day 22 after fertilisation (week 5–6); fetal heart
//    rate rises to about 170 a minute at 9–10 weeks and settles to about 110–160 (ACOG; NICE);
//  - embryo until the end of week 10 (8 weeks after fertilisation), fetus after; first movements
//    felt at about 16–22 weeks; eyes open about week 26–28; full term 39–40 weeks, term 37–42
//    (ACOG Committee Opinion 579, 2013);
//  - birth: the uterus contracts in waves, the cervix opens to about 10 cm, the baby is born through
//    the birth canal, usually head first, and the placenta follows; some babies are born by caesarean
//    section. CirculationClear shows the baby's own circulation and how it changes at birth.
import { THREE, clamp, lerp, smooth, canvasTexture } from '../kit.js';
import { growthAt, GROWTH, latheY, blob, capsule, glowMat, ghost, board, panel, text, wrap, tint, fitNarrow, compactReadout, inReel, interp, rnd, COL } from '../repro.js';
import { toast } from '../ui.js';

const MONTHS = [
  { m: 1, w: [1, 4], t: 'Fertilisation, then implantation. Smaller than a grain of rice.' },
  { m: 2, w: [5, 8], t: 'The heart starts beating (about week 6). All the main organs begin.' },
  { m: 3, w: [9, 13], t: 'Now a fetus. Fingers, toes and tiny nails form.' },
  { m: 4, w: [14, 17], t: 'Moves, swallows and makes faces. Bones harden.' },
  { m: 5, w: [18, 22], t: 'The mother feels the first kicks. A scan checks growth.' },
  { m: 6, w: [23, 27], t: 'Hears sounds. Lungs branch out. Eyes start to open.' },
  { m: 7, w: [28, 31], t: 'Opens and shuts its eyes. The brain grows fast.' },
  { m: 8, w: [32, 35], t: 'Puts on about 200 g a week, mostly fat to keep warm.' },
  { m: 9, w: [36, 40], t: 'Usually turns head-down. Lungs ready. Full term: 39–40 weeks.' },
];
const uterusLen = (w) => interp([[4, 8], [8, 10], [12, 12.5], [16, 16], [20, 21], [24, 25], [28, 29], [32, 32], [36, 35], [40, 35]], w);   // cm
const placentaD = (w) => interp([[5, 1.2], [8, 4], [12, 8], [20, 13], [30, 18], [40, 22]], w);
const headK = (w) => interp([[5, 0.55], [8, 0.5], [12, 0.45], [20, 0.36], [30, 0.31], [40, 0.28]], w);   // head width / crown-rump
const crl = (w) => { const g = growthAt(w); return w <= 20 ? g.len : g.len * lerp(0.64, 0.7, (w - 20) / 20); };
const heartRate = (w) => (w < 5.5 ? 0 : Math.round(interp([[5.5, 100], [7, 130], [9.5, 170], [14, 150], [20, 145], [40, 140]], w)));
const monthOf = (w) => MONTHS.find((m) => w <= m.w[1] + 0.99) || MONTHS[8];

function drawBoard(g, w, h, wk) {
  panel(g, w, h);
  if (wk === undefined) return;
  text(g, 'Month by month', 28, 50, 32, '#fff', 600);
  const cur = monthOf(wk).m;
  MONTHS.forEach((m, i) => {
    const y = 78 + i * 78, on = m.m === cur;
    if (on) { g.fillStyle = 'rgba(255,159,192,.16)'; g.fillRect(14, y - 4, w - 28, 74); }
    text(g, `${m.m}`, 40, y + 34, 30, on ? '#ff9fc0' : '#6b7285', 700, 'center');
    text(g, `weeks ${m.w[0]}–${m.w[1]}`, 70, y + 22, 18, on ? '#ffd166' : '#6b7285', 600);
    wrap(g, m.t, 70, y + 46, w - 96, 19, on ? '#ffffff' : '#8b93a7', 1.2, on ? 500 : 400);
  });
}

// a stylised, curled baby built along its crown-to-rump length (1 = CRL); arms and legs grow in
function makeBaby() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xf2b8a0, roughness: 0.55, emissive: 0xe08870, emissiveIntensity: 0.18 });
  const head = blob([1, 1, 1], [0, 0, 0], skin, 32); g.add(head);
  const body = blob([1, 1, 1], [0, 0, 0], skin, 28); g.add(body);
  const limbs = [];
  for (const sx of [1, -1]) {
    const arm = capsule([0, 0, 0], [0, -1, 0], 0.5, skin); limbs.push({ m: arm, kind: 'arm', sx }); g.add(arm);
    const thigh = capsule([0, 0, 0], [0, -1, 0], 0.5, skin); limbs.push({ m: thigh, kind: 'thigh', sx }); g.add(thigh);
    const shin = capsule([0, 0, 0], [0, -1, 0], 0.5, skin); limbs.push({ m: shin, kind: 'shin', sx }); g.add(shin);
  }
  const tail = capsule([0, 0, 0], [0, -1, 0], 0.5, skin); g.add(tail);
  const place = (m, a, b, r) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = Math.max(0.001, A.distanceTo(B));
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    m.scale.set(r / 0.5, (len + 2 * r) / 2, r / 0.5);
  };
  // lay out for week w, CRL = 1; baby faces +x, back towards −x, crown up
  g.set = (w) => {
    const hk = headK(w), hr = hk / 2, limb = smooth((w - 6) / 5), tailK = 1 - smooth((w - 7) / 2);
    head.scale.set(hr, hr * 1.08, hr * 0.95); head.position.set(0.05, 0.5 - hr, 0);
    const bodyLen = 1 - hk * 0.9;
    body.scale.set(0.2 + 0.08 * limb, bodyLen / 2, 0.19 + 0.06 * limb); body.position.set(-0.03, 0.5 - hk - bodyLen / 2 + 0.05, 0); body.rotation.z = -0.25;
    const sh = [0.12, 0.5 - hk - 0.05], hip = [0.02, -0.42];
    const ar = 0.045 + 0.02 * limb, lr = 0.06 + 0.03 * limb, al = 0.35 * limb, ll = 0.42 * limb;
    limbs.forEach(({ m, kind, sx }) => {
      const z = sx * 0.17;
      m.visible = limb > 0.02;
      if (kind === 'arm') place(m, [sh[0], sh[1], z], [sh[0] + al * 0.8, sh[1] + al * 0.25, z * 0.6], ar);
      if (kind === 'thigh') place(m, [hip[0], hip[1], z], [hip[0] + ll * 0.9, hip[1] + ll * 0.45, z], lr);
      if (kind === 'shin') place(m, [hip[0] + ll * 0.9, hip[1] + ll * 0.45, z], [hip[0] + ll * 0.35, hip[1] - ll * 0.35, z * 0.8], lr * 0.85);
    });
    tail.visible = tailK > 0.02;
    place(tail, [hip[0], hip[1], 0], [hip[0] + 0.2 * tailK, hip[1] - 0.25 * tailK, 0], 0.05 * tailK + 0.001);
  };
  g.belly = new THREE.Vector3(0.18, -0.2, 0);
  return g;
}

export default {
  id: 'pregnancy',
  short: 'Pregnancy',
  title: 'Nine months: from one cell to a baby',
  subtitle: 'About 40 weeks of growth, fed through the placenta and the umbilical cord.',
  view: { pos: [0.4, 8.6, 13.8], target: [0.4, 8.4, 0] },
  learn: `<p>Doctors count a <b>pregnancy</b> from the first day of the last period, so it lasts about <b>40 weeks</b>, or 280 days, even though fertilisation happens around week 2. For the first 10 weeks the growing baby is called an <b>embryo</b>; after that, a <b>fetus</b>.</p>
    <p>Everything starts tiny. At <b>week 6</b> the embryo is the size of a lentil, yet its <b>heart is already beating</b>. By <b>week 12</b> it is the size of a lemon and has fingers and toes. By <b>week 20</b> it is as long as a banana and the mother can feel it kick. At <b>week 40</b> a baby is usually about 50 cm long and weighs about 3 to 3.5 kg. The uterus grows with it, from pear-sized to reaching up near the ribs.</p>
    <p>The baby floats in <b>amniotic fluid</b> inside a sac, which cushions it and keeps it warm. It cannot eat or breathe air, so it gets everything through the <b>placenta</b>, a disc that grows on the wall of the uterus, and the <b>umbilical cord</b>. In the placenta, the mother's blood and the baby's blood flow very close together but <b>do not mix</b>: oxygen and food pass into the baby's blood, and carbon dioxide and waste pass back. The cord carries it all in one vein and two arteries. CirculationClear shows the baby's own circulation and how it changes with the first breath.</p>
    <p><b>Birth:</b> at about 40 weeks, the muscle of the uterus squeezes in waves (<b>labour</b>). The cervix opens to about 10 cm, and the baby is pushed out through the birth canal, usually head first; the placenta follows. Some babies are born by an operation called a <b>caesarean section</b>.</p>
    <p class="tip"><b>Try it:</b> drag the weeks. Watch the fruit beside the uterus, drawn at the same scale, and follow the red and blue particles in the cord.</p>`,
  terms: [
    { t: 'Embryo', d: 'The developing baby from fertilisation to about week 10, while its organs form.' },
    { t: 'Fetus', d: 'The developing baby from about week 10 until birth.' },
    { t: 'Placenta', d: 'A disc on the uterus wall where the baby’s blood takes oxygen and food from the mother’s.' },
    { t: 'Umbilical cord', d: 'The cord from the placenta to the baby’s belly, with one vein and two arteries.' },
    { t: 'Amniotic fluid', d: 'The warm water around the baby that cushions it and lets it move.' },
    { t: 'Trimester', d: 'One of the three parts of pregnancy, each about three months long.' },
    { t: 'Labour', d: 'The waves of squeezing by the uterus that open the cervix and push the baby out.' },
  ],
  defaults: { week: 12, play: false, labels: true },
  controls: [
    { key: 'week', type: 'range', label: 'Week of pregnancy', min: 5, max: 40, step: 0.1, ends: ['week 5', 'week 40'], fmt: (v) => 'week ' + Math.floor(v) },
    { key: 'play', type: 'toggle', label: 'Play the weeks' },
    { key: 'go', type: 'buttons', label: 'Jump to', items: [{ label: 'Week 8', act: (s) => { s.week = 8; } }, { label: 'Week 20', act: (s) => { s.week = 20; } }, { label: 'Birth (week 40)', act: (s) => { s.week = 40; } }] },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'How does a baby in the uterus get oxygen?', options: ['It breathes the amniotic fluid', 'From the mother’s blood, across the placenta', 'Through its skin from the air', 'It doesn’t need any'], answer: 1, why: 'Oxygen passes from the mother’s blood into the baby’s blood in the placenta and travels down the cord. The two bloods do not mix.' },
    { q: 'About how long does a pregnancy last, counted from the last period?', options: ['20 weeks', '40 weeks', '52 weeks', '9 weeks'], answer: 1, why: 'About 40 weeks, or 280 days. Full term is 39 to 40 weeks.' },
    { q: 'At about what week does the embryo’s heart start beating?', options: ['Week 6', 'Week 20', 'Week 30', 'At birth'], answer: 0, why: 'A simple heart starts beating about three weeks after fertilisation, around week 5 to 6 of pregnancy.' },
  ],
  reel: [
    { ms: 5600, caption: 'From a lentil at week 6, to a lemon at week 12, to about 3 kg at week 40.', set: { play: false, labels: false }, anim: { week: [6, 38] }, view: { pos: [0.4, 7.6, 12.5], target: [0.4, 7.4, 0] }, spin: 0 },
    { ms: 5000, caption: 'The placenta passes oxygen and food to the baby through the cord; the two bloods never mix.', set: { week: 30, play: false, labels: false }, view: { pos: [-1.5, 8.2, 8], target: [0, 8.0, 0] }, spin: 0.25 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const world = new THREE.Group(); world.position.set(0, 7.1, 0); root.add(world);       // cm, rescaled each frame
    // the uterus: a cut-open shell (the front quarter is removed so we can see in)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xff9fc0, roughness: 0.55, emissive: 0xc05070, emissiveIntensity: 0.15, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const prof = (() => { const p = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; p.push(new THREE.Vector2(Math.max(0.001, Math.sin(a) * (a > 2.5 ? 0.62 : 1)), -Math.cos(a))); } return p; })();
    const outerG = new THREE.LatheGeometry(prof, 48, Math.PI * 1.3, Math.PI * 1.4);
    const uterus = new THREE.Mesh(outerG, wallMat); uterus.rotation.x = Math.PI; world.add(uterus);
    const cervix = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.3, 24, 1, true), wallMat); world.add(cervix);
    const sacMat = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.14, roughness: 0.1, depthWrite: false });
    const sac = blob([1, 1, 1], [0, 0, 0], sacMat, 40); world.add(sac);
    const plMat = new THREE.MeshStandardMaterial({ color: 0xb8324a, roughness: 0.7, emissive: 0x801830, emissiveIntensity: 0.3 });
    const placenta = blob([1, 1, 1], [0, 0, 0], plMat, 30); world.add(placenta);
    const baby = makeBaby(); world.add(baby);
    // the cord: a coiled tube rebuilt as the baby grows; red (to the baby) and blue (from it) particles
    const cordMat = new THREE.MeshStandardMaterial({ color: 0xe8e0f0, roughness: 0.35, transparent: true, opacity: 0.8, emissive: 0x8090c0, emissiveIntensity: 0.15 });
    let cord = null, curve = null;
    const NP = 18, red = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), glowMat(COL.oxy, 1), NP), blue = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), glowMat(COL.waste, 1), NP);
    [red, blue].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; world.add(m); });
    // fruit of the same size, and a ruler
    const fruitMat = new THREE.MeshStandardMaterial({ color: 0xf2e14a, roughness: 0.5 });
    const fruit = blob([1, 1, 1], [0, 0, 0], fruitMat, 28); world.add(fruit);
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff })); world.add(ruler);
    const L = (h, p, c, parent = world) => tint(stage.label(h, p, parent), c);
    const lab = { baby: L('', [0, 0, 0], 'pink'), pl: L('Placenta', [0, 0, 0], 'red'), cord: L('Umbilical cord', [0, 0, 0], 'blue'), sac: L('Amniotic fluid', [0, 0, 0], 'cyan'), fruit: L('', [0, 0, 0], 'gold'), ruler: L('', [0, 0, 0], 'grey'), cervix: L('Cervix (closed)', [0, 0, 0], 'purple') };
    const ct = canvasTexture(520, 800, drawBoard);
    const bd = board(ct, 3.0, 4.62); bd.position.set(5.6, 7.5, 0); root.add(bd);
    let lastWk = -1, lastBoard = -1, toasted = false, S = 1, g = growthAt(12);
    const tmp = new THREE.Vector3(), O = new THREE.Object3D();
    const fit = fitNarrow(stage, { pos: [-0.8, 7.6, 12], target: [-0.8, 7.4, 0] });
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        if (s.play && !inReel()) { s.week += dt * 1.6; if (s.week > 40) s.week = 5; }
        const w = clamp(s.week, 5, 40);
        if (Math.abs(w - lastWk) > 0.02) {
          lastWk = w; g = growthAt(w);
          const U = uterusLen(w), R = U / 2, Rw = R * 0.9;
          S = 5.2 / U; world.scale.setScalar(S);                          // the uterus always ~5 units tall
          uterus.scale.set(Rw, R, Rw * 0.9); uterus.position.set(0, 0, 0);
          cervix.scale.set(R * 0.9, R * 0.5, R * 0.9); cervix.position.set(0, -R - R * 0.05, 0);
          const inner = R - 0.9;
          sac.scale.set(Rw - 1, inner, (Rw - 1) * 0.88);
          // the baby: crown-rump length; head up until about week 28, then turns head-down by 34–36
          const c = crl(w);
          baby.set(w); baby.scale.setScalar(c * 0.66);                  // curled up, it fits in less than its CRL
          const turn = smooth((w - 28) / 7);
          baby.rotation.z = lerp(-0.25, Math.PI + 0.25, turn);
          baby.position.set(0, lerp(-0.08, 0.06, turn) * inner, 0.1 * inner);
          // placenta on the upper back-left wall
          const pd = placentaD(w), pt = lerp(0.3, 2.3, smooth((w - 5) / 20));
          placenta.scale.set(pd / 2, pd / 2 * 0.95, pt / 2);
          const pa = 0.9;
          placenta.position.set(Math.sin(pa) * (Rw - pt / 2 - 0.6) * 0.35, Math.cos(pa) * (R - pt / 2) * 0.55, -(Rw * 0.9 - pt / 2 - 0.5));
          placenta.rotation.set(0.15, 0, 0);
          // cord from placenta face to the belly, coiling
          baby.updateMatrix();
          const belly = baby.belly.clone().applyMatrix4(baby.matrix);
          const P0 = placenta.position.clone().add(new THREE.Vector3(0, 0, pt / 2));
          const pts = [];
          for (let i = 0; i <= 40; i++) {
            const u = i / 40, p = P0.clone().lerp(belly, u);
            p.z += Math.sin(u * Math.PI) * inner * 0.25;
            const coil = Math.sin(u * Math.PI) * Math.max(0.15, c * 0.05);
            p.x += Math.cos(u * 18) * coil; p.y += Math.sin(u * 18) * coil;
            pts.push(p);
          }
          curve = new THREE.CatmullRomCurve3(pts);
          if (cord) { world.remove(cord); cord.geometry.dispose(); }
          cord = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, Math.max(0.05, c * 0.028 + 0.08), 8, false), cordMat); world.add(cord);
          // fruit and ruler, same scale, to the right of the uterus
          const fr = g.near;
          fruit.scale.set(...fr.fr); fruitMat.color.set(fr.fcol);
          fruit.position.set(-(Rw + Math.max(1.5, fr.fr[0]) + 1.2), -R + fr.fr[1], 0);
          const rl = [0.5, 1, 2, 5, 10].reduce((a, b) => (Math.abs(b - U * 0.3) < Math.abs(a - U * 0.3) ? b : a));
          ruler.scale.set(rl, U * 0.012, U * 0.012); ruler.position.set(0, -R - U * 0.12, 0);
          lab.ruler.element.textContent = rl < 1 ? `${rl * 10} mm` : `${rl} cm`;
          lab.ruler.position.set(0, -R - U * 0.19, 0);
          lab.fruit.element.textContent = `About the size of ${fr.fruit}`;
          lab.fruit.position.set(fruit.position.x, -R - U * 0.19, 0);
          lab.baby.element.textContent = w < 10.5 ? 'Embryo' : 'Fetus';
          lab.baby.position.set(Rw * 1.3, -R * 0.05, 0);
          lab.pl.position.set(Rw * 1.3, R * 0.6, 0);
          lab.cord.position.set(Rw * 1.3, R * 0.28, 0);
          lab.sac.position.set(Rw * 1.3, -R * 0.4, 0);
          lab.cervix.position.set(Rw * 1.1, -R * 0.95, 0);
        }
        // blood in the cord: red toward the baby, blue back to the placenta
        const beat = heartRate(w) / 60, c = crl(w), ps = Math.max(0.09, c * 0.03);
        for (let i = 0; i < NP; i++) {
          const u1 = ((i / NP) + time * 0.12 * (0.6 + beat * 0.2)) % 1, u2 = 1 - (((i + 0.5) / NP) + time * 0.12) % 1;
          curve.getPoint(u1, tmp); O.position.copy(tmp); O.scale.setScalar(ps); O.updateMatrix(); red.setMatrixAt(i, O.matrix);
          curve.getPoint(u2, tmp); O.position.copy(tmp).add(new THREE.Vector3(ps, ps, 0)); O.updateMatrix(); blue.setMatrixAt(i, O.matrix);
        }
        red.instanceMatrix.needsUpdate = blue.instanceMatrix.needsUpdate = true;
        plMat.emissiveIntensity = 0.25 + 0.15 * Math.sin(time * 2 * Math.PI * 0.2);
        const narrow = fit(), on = s.labels && !inReel() && !narrow;
        Object.values(lab).forEach((l) => { l.visible = on; });
        lab.fruit.visible = !narrow && !inReel();
        lab.ruler.visible = !inReel();
        bd.visible = !narrow || inReel();
        const mo = monthOf(w).m;
        if (mo !== lastBoard && bd.visible) { lastBoard = mo; ct.redraw(w); }
        if (!toasted && w > 16 && !inReel() && s.play === false) { toasted = true; toast('The placenta and cord are part of the baby’s circulation. <a href="/circulationclear/">CirculationClear</a> shows how it changes at birth.'); }
      },
      readout: (s) => {
        const w = clamp(s.week, 5, 40), gg = growthAt(w), hr = heartRate(w);
        const len = gg.len < 1 ? `${(gg.len * 10).toFixed(0)} mm` : `${gg.len.toFixed(gg.len < 10 ? 1 : 0)} cm`;
        const wt = gg.g < 1 ? 'under 1 g' : gg.g < 1000 ? `${Math.round(gg.g)} g` : `${(gg.g / 1000).toFixed(1)} kg`;
        const tri = w < 14 ? 'first trimester' : w < 28 ? 'second trimester' : 'third trimester';
        return `<div class="big">Week ${Math.floor(w)}: ${w < 10.5 ? 'embryo' : 'fetus'}</div>
          <div class="row"><span>Length ${w <= 20 ? '(crown to rump)' : '(head to heel)'}</span><b>${len}</b></div>
          <div class="row"><span>Weight</span><b>${wt}</b></div>
          <div class="row"><span>About the size of</span><b>${gg.near.fruit}</b></div>
          <div class="row"><span>Heart rate</span><b>${hr ? 'about ' + hr + ' a minute' : 'heart still forming'}</b></div>
          <small>${w >= 37 ? 'Full term is 39 to 40 weeks. Labour: the uterus squeezes, the cervix opens to about 10 cm, and the baby is born, usually head first.' : `The ${tri}. Typical sizes; every baby grows at its own pace.`}</small>`;
      },
    });
  },
};
