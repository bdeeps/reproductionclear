// Chapter 3: the menstrual cycle as a clock. The female organs are shown alone, 2.4 times life
// size. Day 1 is the first day of a period. A follicle on the ovary ripens and bursts (ovulation) about
// 14 days before the next period; the egg drifts down the tube; the empty follicle becomes the corpus
// luteum, which makes progesterone; the lining of the uterus is shed, rebuilt and thickened.
// All numbers come from cycleAt() in repro.js (sources there). Other facts:
//  - cycle length usually 21–35 days in adults (up to about 45 in the first years after the first
//    period); bleeding usually 2–7 days; typical blood loss about 30–40 mL, heavy is over about 80 mL
//    (NHS "Periods"; ACOG FAQ "Your First Period" and "Heavy Menstrual Bleeding");
//  - an egg lives about 12–24 hours after release if it is not fertilised (Guyton & Hall ch. 83);
//  - basal body temperature rises about 0.3–0.5 °C after ovulation, because of progesterone;
//  - hygiene: change a pad every 4–6 hours or as needed, wash hands, wrap and bin used pads; cloth
//    pads should be washed with soap and dried in the sun (UNICEF "Guidance on Menstrual Health and
//    Hygiene", 2019; Ministry of Health and Family Welfare, Menstrual Hygiene Scheme);
//  - India: 77.3% of women aged 15–24 used a hygienic method in 2019–21, up from 57.6% in 2015–16
//    (NFHS-5 and NFHS-4, International Institute for Population Sciences).
import { THREE, clamp, lerp, smooth, canvasTexture } from '../kit.js';
import { makeOrgans, cycleAt, PHASE, stream, pathOf, smoothPts, blob, glowMat, board, panel, text, chart, tint, fitNarrow, compactReadout, inReel, rrect, COL, PELVIS } from '../repro.js';

const SC = 2.4;                                             // organs drawn 2.4 times life size
function drawBoard(g, w, h, st) {
  panel(g, w, h);
  if (!st) return;
  const { day, L, P } = st, c = cycleAt(day, L, P), O = c.O;
  // the clock
  const cx = w / 2, cy = 215, R = 160;
  const ang = (d) => -Math.PI / 2 + ((d - 1) / L) * Math.PI * 2;
  const phaseOf = (d) => cycleAt(d + 0.5, L, P).phase;
  for (let d = 1; d <= L; d++) {
    g.beginPath(); g.arc(cx, cy, R, ang(d) + 0.02, ang(d + 1) - 0.02); g.lineWidth = 34;
    g.strokeStyle = PHASE[phaseOf(d)].col; g.globalAlpha = d <= day && day < d + 1 ? 1 : 0.45; g.stroke(); g.globalAlpha = 1;
  }
  [1, Math.floor(O), L].forEach((d) => { const a = ang(d + 0.5); text(g, String(d), cx + Math.cos(a) * (R + 36), cy + Math.sin(a) * (R + 36) + 8, 22, '#aab3c5', 500, 'center'); });
  const a = ang(day);
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 26), cy + Math.sin(a) * (R - 26)); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 8, 0, 7); g.fill();
  text(g, `Day ${Math.floor(day)}`, cx, cy + 62, 34, '#fff', 600, 'center');
  text(g, `of ${L}`, cx, cy + 92, 22, '#aab3c5', 400, 'center');
  text(g, PHASE[c.phase].name, cx, cy - 42, 24, PHASE[c.phase].col, 600, 'center');
  // hormone curves
  const y0 = 440;
  text(g, 'Hormones through the cycle', 30, y0, 28, '#fff', 600);
  const leg = [['FSH', '#6ee7a8'], ['LH', '#8ef0ff'], ['oestrogen', '#ff9fc0'], ['progesterone', '#c9a7ff']];
  let lx = 30; leg.forEach(([k, col]) => { text(g, k, lx, y0 + 32, 21, col, 500); g.font = '500 21px Geist, system-ui'; lx += g.measureText(k).width + 22; });
  const days = []; for (let d = 1; d <= L + 0.999; d += 0.25) days.push(d);
  const S = (f, k) => days.map((d) => [d, f(cycleAt(d, L, P)) / k]);
  chart(g, [30, y0 + 50, w - 60, 200], [1, L + 1], [0, 1.1], [
    { pts: S((q) => q.FSH, 15), col: '#6ee7a8', w: 3 },
    { pts: S((q) => q.LH, 48), col: '#8ef0ff', w: 3 },
    { pts: S((q) => q.E2, 260), col: '#ff9fc0', w: 4 },
    { pts: S((q) => q.P4, 14), col: '#c9a7ff', w: 4 },
  ], { cursor: day, xticks: [[1, '1'], [Math.floor(O) + 0.5, 'ovulation'], [L, String(L)]], fs: 19, bands: [{ x0: 1, x1: P + 1, col: 'rgba(255,111,125,.12)' }] });
  text(g, 'each line scaled to its own peak', 30, h - 18, 18, '#8b93a7', 400);
}

export default {
  id: 'cycle',
  short: 'The monthly cycle',
  title: 'The menstrual cycle: a monthly clock',
  subtitle: 'About once a month, an egg ripens and the uterus gets ready. If no baby starts, the lining is shed and the clock restarts.',
  view: { pos: [1.0, 9.9, 9.4], target: [1.0, 9.7, 0] },
  learn: `<p>From puberty until about age 50, the ovaries and uterus follow a repeating <b>menstrual cycle</b>. We count it from <b>day 1</b>, the first day of a <b>period</b>. A cycle usually lasts <b>21 to 35 days</b>; 28 is only an average, and in the first few years cycles are often irregular.</p>
    <p><b>Days 1 to about 5:</b> the thick lining of the uterus, which was not needed, comes away with a little blood and leaves through the cervix and birth canal. That is the period. It usually lasts 2 to 7 days, and the total blood lost is only a few spoonfuls, about 30 to 40 mL.</p>
    <p><b>The follicular phase:</b> FSH from the pituitary makes a <b>follicle</b>, a tiny fluid-filled bubble around an egg, grow in the ovary to about 2 cm. It makes <b>oestrogen</b>, which rebuilds the lining.</p>
    <p><b>Ovulation, about 14 days before the next period</b> (day 14 of a 28-day cycle): a sudden surge of <b>LH</b> makes the follicle burst and release its <b>egg</b>. The fallopian tube catches it. The egg lives for only about a day.</p>
    <p><b>The luteal phase:</b> the empty follicle becomes the <b>corpus luteum</b> ("yellow body") and makes <b>progesterone</b>, which makes the lining thick, soft and full of blood vessels, ready for a baby. If no baby starts, the corpus luteum fades, progesterone falls, and the lining is shed: day 1 again.</p>
    <p><b>Periods are normal and healthy, and nothing to be ashamed of.</b> Use a clean pad, cloth pad, cup or tampon; change pads about every 4 to 6 hours; wash your hands; wrap used pads and put them in a bin; wash cloth pads with soap and dry them in the sun. In India, about 77% of young women used a hygienic method in 2019–21 (NFHS-5). You can go to school, play sport and do everything as usual.</p>
    <p class="tip"><b>Try it:</b> press play and watch the follicle grow, burst and turn yellow, and the lining thicken and shed. Then change the cycle length: only the days before ovulation change.</p>`,
  terms: [
    { t: 'Menstruation', d: 'The period: the monthly shedding of the uterus lining, with a little blood.' },
    { t: 'Follicle', d: 'A tiny fluid-filled bubble in the ovary that ripens one egg.' },
    { t: 'Ovulation', d: 'The release of an egg from the ovary, about 14 days before the next period.' },
    { t: 'Endometrium', d: 'The lining of the uterus, which thickens each month and is shed if not needed.' },
    { t: 'Corpus luteum', d: 'The “yellow body” left after ovulation, which makes progesterone.' },
    { t: 'Menarche', d: 'A person’s very first period, usually between 10 and 16.' },
  ],
  defaults: { day: 1, play: true, len: 28, speed: 1, labels: true },
  controls: [
    { key: 'day', type: 'range', label: 'Day of the cycle', min: 1, max: 35.9, step: 0.1, fmt: (v, s) => `day ${Math.floor(Math.min(v, s.len + 0.99))}` },
    { key: 'play', type: 'toggle', label: 'Play the clock' },
    { key: 'len', type: 'range', label: 'Cycle length', min: 21, max: 35, step: 1, ends: ['21 days', '35 days'], fmt: (v) => v + ' days', hint: 'Only the time before ovulation changes; the luteal phase stays about 14 days.' },
    { key: 'speed', type: 'range', label: 'Speed', min: 0.25, max: 3, step: 0.05, fmt: (v) => v.toFixed(2) + '×' },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'In a 28-day cycle, when does ovulation usually happen?', options: ['Day 1', 'About day 14', 'Day 28', 'Every day'], answer: 1, why: 'Ovulation comes about 14 days before the next period, so about day 14 of a 28-day cycle, and later in a longer cycle.' },
    { q: 'What makes the follicle burst and release its egg?', options: ['A surge of LH', 'A fall in oestrogen', 'Insulin', 'The period'], answer: 0, why: 'A sudden surge of LH from the pituitary, triggered by high oestrogen, makes the ripe follicle burst.' },
    { q: 'What is a period?', options: ['A sign of illness', 'The unneeded lining of the uterus leaving the body', 'The egg being released', 'Something to hide'], answer: 1, why: 'Each month the lining thickens in case a baby starts. If not, it is shed with a little blood. It is normal and healthy.' },
  ],
  reel: [
    { ms: 5600, caption: 'Each month a follicle ripens in the ovary, and an LH surge makes it release one egg.', set: { play: false, len: 28, labels: false }, anim: { day: [6, 15.2] }, view: { pos: [1.0, 9.5, 9.2], target: [1.0, 9.3, 0] }, spin: 0 },
    { ms: 5000, caption: 'Progesterone thickens the lining; if no baby starts, it is shed as a period, and the clock restarts.', set: { play: false, len: 28, labels: false }, anim: { day: [18, 28.9] }, view: { pos: [1.0, 9.5, 9.2], target: [1.0, 9.3, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const org = makeOrgans(stage, { labels: false, enlarge: SC });
    root.add(org.root);
    org.root.position.y = 9.0;
    org.bladder.visible = false;
    const fh = org.fh, side = 1;                             // this month: the ovary on the person's left
    org.mats.canal.opacity = 1;
    // the follicle, the corpus luteum and the egg (the egg is really 0.1 mm: drawn far bigger)
    const ovC = fh.ovary[side];
    const folPos = [ovC[0] + side * 0.4, ovC[1] + 0.85, ovC[2] + 0.35];
    const folMat = new THREE.MeshStandardMaterial({ color: 0xfff6d8, transparent: true, opacity: 0.75, emissive: 0xfff1a8, emissiveIntensity: 0.35, roughness: 0.2 });
    const follicle = blob([1, 1, 1], folPos, folMat, 24); org.f.add(follicle);
    const lutMat = glowMat(0xffc233, 0.5);
    const luteum = blob([1, 1, 1], folPos, lutMat, 24); org.f.add(luteum);
    const eggMat = glowMat(COL.egg, 1.2, 1);
    const egg = blob([0.32, 0.32, 0.32], folPos, eggMat, 18); org.f.add(egg);
    const halo = blob([0.5, 0.5, 0.5], folPos, new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.25, depthWrite: false }), 18); org.f.add(halo);
    const tubePath = pathOf([folPos, ...fh.tubePts[side]]);
    // the lining (period particles leave along the canal)
    const flowPath = pathOf(smoothPts(fh.flowPts, 80));
    const blood = stream(flowPath, 60, 0xd6344a, { size: 0.28, jitter: 0.35, seed: 4 });
    org.f.add(blood.mesh);
    const L = (h, p, c) => tint(stage.label(h, p, org.root), c);
    const lab = {
      fol: L('', [12.5, 3.5, 0.5], 'gold'), egg: L('Egg (really 0.1 mm)', [0, 0, 0], 'cream'), lining: L('', [-9.8, 3.8, 1], 'red'),
      tube: L('Fallopian tube', [11.2, 5.6, 0], 'cyan'), uterus: L('Uterus', [-7.5, 6.3, 0.5], 'pink'), cervix: L('Cervix', [-6.8, -4.2, 0.5], 'purple'),
    };
    const ct = canvasTexture(560, 720, drawBoard);
    const bd = board(ct, 2.7, 3.47); bd.position.set(3.95, 9.3, 0.2); root.add(bd);
    let lastKey = '';
    const fit = fitNarrow(stage, { pos: [0, 8.9, 8.6], target: [0, 8.8, 0] });
    const pos = new THREE.Vector3();
    let cur = cycleAt(1);
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        const Lc = s.len, P = 5;
        if (s.play && !inReel()) { s.day += dt * s.speed * 1.4; if (s.day >= Lc + 1) s.day = 1; }
        const day = clamp(s.day, 1, Lc + 0.99);
        const c = cycleAt(day, Lc, P); cur = c;
        const O = c.O;
        // follicle and corpus luteum (mm → cm, drawn at the organ scale)
        const fr = c.follicle / 20;
        follicle.visible = c.follicle > 0; follicle.scale.setScalar(Math.max(0.05, fr * 0.95));
        folMat.emissiveIntensity = 0.3 + 0.9 * bumpNear(day, O - 0.3, 0.8);
        luteum.visible = c.luteum > 0; luteum.scale.setScalar(Math.max(0.05, c.luteum / 20 * 0.85));
        lutMat.emissiveIntensity = 0.2 + 0.8 * clamp(c.P4 / 13, 0, 1);
        // egg: inside the follicle until ovulation, then along the tube for about 4 days, fading after 1
        const since = day - O;
        if (since < 0) { egg.visible = fr > 0.6; halo.visible = egg.visible; egg.position.set(...folPos); }
        else {
          const u = clamp(since / 4, 0, 1);
          tubePath.at(smooth(Math.min(1, u * 1.15)), pos);
          egg.position.copy(pos); halo.position.copy(pos);
          const life = since < 1 ? 1 : clamp(1 - (since - 1) / 1.2, 0, 1);
          egg.visible = since < 4.2 && life > 0.02; halo.visible = egg.visible;
          egg.scale.setScalar(0.32 * (0.4 + 0.6 * life)); eggMat.color.setScalar(0.5 + 0.5 * life);
        }
        halo.scale.setScalar(0.5 + 0.08 * Math.sin(time * 4));
        // lining thickness: 3–13 mm on ultrasound; our lining shape is 0.4 cm thick at scale 1
        const th = c.lining / 10;
        fh.lining.scale.set(0.75 + 0.3 * th, 1, 0.35 + 1.5 * th);
        fh.lining.material.emissiveIntensity = 0.25 + 0.4 * clamp(c.P4 / 13, 0, 1) + (c.phase === 'period' ? 0.35 : 0);
        blood.step(dt, c.phase === 'period' ? 0.75 * (1 - 0.6 * (day - 1) / P) : 0, 2.5, time);
        org.glow('ovary', 0.25 + 0.4 * clamp(c.E2 / 250, 0, 1));
        org.glow('tube', since >= 0 && since < 4 ? 0.6 : 0.25);
        org.glow('uterus', 0.25);
        // labels
        const narrow = fit(), on = s.labels && !inReel() && !narrow;
        lab.fol.element.textContent = c.follicle > 0 ? `Follicle: ${Math.round(c.follicle)} mm` : `Corpus luteum: progesterone`;
        tint(lab.fol, c.follicle > 0 ? 'cream' : 'gold');
        lab.egg.position.copy(egg.position).add(new THREE.Vector3(3.2, 1.6, 0));
        lab.lining.element.textContent = c.phase === 'period' ? 'Lining shed: the period' : `Lining: ${c.lining.toFixed(0)} mm thick`;
        Object.values(lab).forEach((l) => { l.visible = on; });
        lab.egg.visible = on && egg.visible && since >= 0;
        bd.visible = !narrow || inReel();
        const key = `${day.toFixed(1)}|${Lc}`;
        if (key !== lastKey && bd.visible) { lastKey = key; ct.redraw({ day, L: Lc, P }); }
      },
      readout: (s) => {
        const Lc = s.len, day = Math.floor(clamp(s.day, 1, Lc + 0.99)), c = cur, ph = PHASE[c.phase];
        return `<div class="big">Day ${day} of ${Lc}: ${ph.name.split(' (')[0].toLowerCase()}</div>
          <div class="row"><span>Ovulation</span><b>about day ${Math.floor(c.O)}</b></div>
          <div class="row"><span>Lining of the uterus</span><b>${c.lining.toFixed(0)} mm</b></div>
          <div class="row"><span>${c.follicle > 0 ? 'Follicle' : 'Corpus luteum'}</span><b>${c.follicle > 0 ? Math.round(c.follicle) + ' mm' : Math.round(c.luteum) + ' mm'}</b></div>
          <div class="row"><span>Oestrogen · progesterone</span><b>${Math.round(c.E2)} pg/mL · ${c.P4.toFixed(1)} ng/mL</b></div>
          <div class="row"><span>LH</span><b>${Math.round(c.LH)} IU/L${c.LH > 20 ? ': surge!' : ''}</b></div>
          <small>${ph.what} Typical values; every body varies.</small>`;
      },
    });
  },
};

function bumpNear(x, c, w) { return Math.exp(-(((x - c) / w) ** 2)); }
