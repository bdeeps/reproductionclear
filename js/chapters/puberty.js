// Chapter 2: puberty. A neutral ghost figure grows from 6 to 18 on the WHO median height curves
// (HEIGHT in repro.js). The chain of messages: the hypothalamus starts pulsing GnRH, the pituitary
// answers with LH and FSH, and those reach the ovaries or testes, which make oestrogen and
// progesterone, or testosterone. The body changes are listed in words only.
// Sources:
//  - Usual start of puberty 8–13 in girls and 9–14 in boys; first period usually 10–16, commonly
//    about 12 (NHS "Stages of puberty"; Marshall & Tanner, Arch Dis Child 44:291, 1969 and 45:13,
//    1970). Indian studies put the average first period at about 12.5–13 years (e.g. Pathak et al.,
//    Ann Hum Biol 41:1, 2014, from NFHS data). Peak height growth about 11.5–12 in girls and 13.5–14
//    in boys.
//  - GnRH is released in pulses about every 60–120 minutes, first at night in early puberty
//    (Guyton & Hall 14th ed., ch. 81–82; Boyar et al., N Engl J Med 287:582, 1972).
//  - Hormone curves on the board are illustrative (normalised 0–1), not lab values; the timing of the
//    rise follows the ages above. Growth plates close at about 14–16 in girls, 16–18 in boys (see
//    SkeletonClear), so the spurt ends there. EndocrineClear shows the glands and feedback in depth.
import { THREE, clamp, lerp, smooth, canvasTexture } from '../kit.js';
import { makeOrgans, makeFigure, skinMaterial, HEAD, PELVIS, HEIGHT, interp, stream, pathOf, smoothPts, blob, glowMat, ghost, board, panel, text, chart, tint, fitNarrow, compactReadout, inReel, COL } from '../repro.js';
import { toast } from '../ui.js';

const ONSET = { f: 10, m: 11.5 };                          // average start of puberty, years
const lhOf = (sx, a) => 0.06 + 0.94 * smooth((a - ONSET[sx] + 1.8) / 4.5);
const sexHOf = (sx, a) => 0.04 + 0.96 * smooth((a - ONSET[sx] + 1.2) / 5);
// Usual age windows (years) for each change; the board draws them as bars.
const CHANGES = {
  f: [
    { k: 'Breasts start to develop', a: 8, b: 13, col: '#ff9fc0' },
    { k: 'Body hair (underarms and more)', a: 9, b: 14, col: '#ffd166' },
    { k: 'Growth spurt', a: 9, b: 14.5, col: '#6ee7a8' },
    { k: 'Oily skin, spots', a: 10, b: 16, col: '#c9a7ff' },
    { k: 'First period', a: 10, b: 16, col: '#ff6f7d' },
  ],
  m: [
    { k: 'Testes grow (first sign)', a: 9, b: 14, col: '#8ef0ff' },
    { k: 'Body hair (underarms and more)', a: 10, b: 15, col: '#ffd166' },
    { k: 'Growth spurt', a: 11, b: 16, col: '#6ee7a8' },
    { k: 'Voice breaks, deepens', a: 12, b: 16, col: '#c9a7ff' },
    { k: 'Facial hair', a: 13, b: 18, col: '#ff8a5c' },
  ],
};
const heightAt = (sx, a) => interp(HEIGHT[sx], a);

function drawBoard(g, w, h, st) {
  panel(g, w, h);
  if (!st) return;
  const { sx, age } = st;
  text(g, 'Hormones from the brain', 30, 52, 34, '#fff', 600);
  text(g, 'LH and FSH', 30, 88, 24, '#8ef0ff', 500); text(g, sx === 'f' ? 'oestrogen' : 'testosterone', 190, 88, 24, sx === 'f' ? '#ff9fc0' : '#6ee7a8', 500);
  text(g, '(illustrative)', 410, 88, 20, '#8b93a7', 400);
  const ages = []; for (let a = 6; a <= 18.001; a += 0.25) ages.push(a);
  chart(g, [40, 110, w - 70, 170], [6, 18], [0, 1.08], [
    { pts: ages.map((a) => [a, lhOf(sx, a)]), col: '#8ef0ff', w: 4 },
    { pts: ages.map((a) => [a, sexHOf(sx, a)]), col: sx === 'f' ? '#ff9fc0' : '#6ee7a8', w: 4, dash: [10, 6] },
  ], { xticks: [[6, '6'], [8, '8'], [10, '10'], [12, '12'], [14, '14'], [16, '16'], [18, '18 yrs']], cursor: age, fs: 20 });
  text(g, 'Usual ages for each change', 30, 356, 30, '#fff', 600);
  text(g, 'Anywhere in the bar is normal', 30, 390, 22, '#8b93a7', 400);
  const x0 = 40, x1 = w - 30, X = (a) => x0 + ((a - 6) / 12) * (x1 - x0);
  CHANGES[sx].forEach((c, i) => {
    const y = 420 + i * 58, on = age >= c.a && age <= c.b;
    text(g, c.k, x0, y + 18, 21, on ? '#ffffff' : '#aab3c5', on ? 600 : 400);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x0, y + 26, x1 - x0, 16);
    g.fillStyle = c.col; g.globalAlpha = on ? 1 : 0.55; g.fillRect(X(c.a), y + 26, X(c.b) - X(c.a), 16); g.globalAlpha = 1;
  });
  const xa = X(age); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(xa, 404); g.lineTo(xa, 420 + 5 * 58); g.stroke();
  text(g, `age ${age.toFixed(1)}`, clamp(xa, 70, w - 70), 420 + 5 * 58 + 26, 20, '#fff', 600, 'center');
}

export default {
  id: 'puberty',
  short: 'Puberty',
  title: 'Puberty: when the brain says "start"',
  subtitle: 'A tiny signal from the brain sets off years of change, at a different time for everyone.',
  view: { pos: [-2.6, 9.2, 22], target: [-3.4, 9.0, 0] },
  learn: `<p><b>Puberty</b> is the time when a child's body becomes an adult body that could one day have children. It does not start in the reproductive organs. It starts in the <b>brain</b>.</p>
    <p>Deep in the brain, the <b>hypothalamus</b> begins to release a hormone called <b>GnRH</b> in little pulses, about every one to two hours, at first mostly at night. GnRH tells the pea-sized <b>pituitary</b> gland just below it to send two hormones into the blood: <b>LH</b> and <b>FSH</b>. They reach the <b>ovaries</b>, which begin to make <b>oestrogen</b> and <b>progesterone</b>, or the <b>testes</b>, which begin to make <b>testosterone</b> and sperm. EndocrineClear shows this chain of glands in depth.</p>
    <p>These hormones change the whole body, step by step. Everyone has a <b>growth spurt</b>, grows hair under the arms and elsewhere, sweats more and may get oily skin and spots. In girls, breasts develop, hips widen and <b>periods</b> begin. In boys, the testes grow, the voice deepens and facial hair appears. Feelings can change quickly too, and that is part of it.</p>
    <p>The timing varies a lot. Puberty usually starts somewhere between about <b>8 and 13 for girls</b> and <b>9 and 14 for boys</b>. Starting early or late within those ranges is <b>normal</b>, and bodies of every shape are normal. If it starts before 8 (girls) or 9 (boys), or hasn't started by about 13 or 14, a doctor can check. Growth stops when the growth plates in the bones close (see SkeletonClear).</p>
    <p class="tip"><b>Try it:</b> drag the age and watch the brain's signal switch on. Compare the bars for girls and boys: the ranges are wide, and they overlap.</p>`,
  terms: [
    { t: 'Puberty', d: 'The years when a child’s body matures into an adult body able to reproduce.' },
    { t: 'Adolescence', d: 'The wider teenage years of growing up, in body and mind, roughly 10 to 19.' },
    { t: 'GnRH', d: 'Gonadotropin-releasing hormone: the brain’s “start” signal, sent in pulses.' },
    { t: 'LH and FSH', d: 'Pituitary hormones that tell the ovaries and testes to make hormones and gametes.' },
    { t: 'Oestrogen', d: 'The main hormone from the ovaries; it drives most changes of puberty in girls.' },
    { t: 'Testosterone', d: 'The main hormone from the testes; it drives most changes of puberty in boys.' },
  ],
  defaults: { sx: 'f', age: 7, play: true, labels: true },
  controls: [
    { key: 'sx', type: 'seg', label: 'Body', options: [{ v: 'f', label: 'Girl' }, { v: 'm', label: 'Boy' }] },
    { key: 'age', type: 'range', label: 'Age', min: 6, max: 18, step: 0.1, ends: ['6', '18'], fmt: (v) => v.toFixed(1) + ' years' },
    { key: 'play', type: 'toggle', label: 'Grow up automatically' },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'Where does puberty begin?', options: ['In the ovaries or testes', 'In the brain', 'In the stomach', 'In the bones'], answer: 1, why: 'The hypothalamus starts pulsing GnRH, which tells the pituitary to release LH and FSH. Only then do the ovaries or testes respond.' },
    { q: 'Asha is 9 and has started puberty. Her friend Meera is 12 and has not. What does this mean?', options: ['Something is wrong with Asha', 'Something is wrong with Meera', 'Both are within the normal range', 'Puberty should start at exactly 11'], answer: 2, why: 'Puberty usually starts between about 8 and 13 for girls. Early or late within that range is normal.' },
    { q: 'Which hormone from the testes drives most of the changes of puberty in boys?', options: ['Insulin', 'Oestrogen', 'Testosterone', 'Adrenaline'], answer: 2, why: 'Testosterone from the testes deepens the voice, grows facial hair and builds muscle, and helps sperm to form.' },
  ],
  reel: [
    { ms: 5600, caption: 'Puberty starts in the brain: GnRH wakes the pituitary, which sends LH and FSH to the ovaries or testes.', set: { sx: 'f', play: false, labels: false }, anim: { age: [8, 15] }, view: { pos: [0.3, 9.3, 21], target: [-1.2, 8.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const person = new THREE.Group(); root.add(person);
    const skin = skinMaterial(); skin.opacity = 0.14;
    person.add(makeFigure(skin));
    // brain (ghost), hypothalamus and pituitary
    const brainMat = ghost(0xf0b9c8, 0.14);
    [1, -1].forEach((sx) => person.add(blob([0.36, 0.5, 0.74], [sx * 0.33, 16.74, 0.03], brainMat, 24)));
    const hypoMat = glowMat(COL.hypo, 0.6), pitMat = glowMat(COL.pit, 0.6);
    person.add(blob([0.15, 0.1, 0.16], HEAD.hypo, hypoMat, 20), blob([0.1, 0.08, 0.1], HEAD.pit, pitMat, 20));
    const org = makeOrgans(stage, { labels: false, enlarge: 1.4 });
    person.add(org.root);
    ['canal', 'urethra', 'cervix'].forEach((id) => { org.mats[id].transparent = true; org.mats[id].opacity = 0.3; });
    // hormone routes
    const P = (v) => [PELVIS[0] + v[0] * 0.14, PELVIS[1] + v[1] * 0.14, PELVIS[2] + v[2] * 0.14];
    const gnrh = stream(pathOf(smoothPts([HEAD.hypo, [0, 16.16, 0.17], HEAD.pit], 20)), 10, COL.gnrh, { size: 0.03, jitter: 0.01, seed: 3 });
    const down = (end, seed) => stream(pathOf(smoothPts([HEAD.pit, [0.05, 15.4, 0.2], [0.12, 13.4, 0.3], [0.18, 11.4, 0.3], [end[0] * 0.5, 10.1, 0.3], end], 90)), 34, COL.lh, { size: 0.055, shape: 'box', jitter: 0.06, seed });
    const lh = { f: [down(P([6.3, -1.8, -0.2]), 5), down(P([-6.3, -1.8, -0.2]), 6)], m: [down(P([2.2, -12.4, 4.6]), 7), down(P([-2.2, -12.4, 4.6]), 8)] };
    const loopPts = [[0, 9.1, 0.6], [0.9, 10.3, 0.7], [1.2, 12.6, 0.6], [1.9, 13.9, 0.3], [2.2, 11.6, 0.3], [2.4, 9.6, 0.3], [1.3, 10.8, 0.6], [0.9, 7.5, 0.5], [0.95, 2.5, 0.4], [0.3, 6.5, 0.6], [-0.3, 6.5, 0.6], [-0.95, 2.5, 0.4], [-0.9, 7.5, 0.5], [-1.3, 10.8, 0.6], [-2.4, 9.6, 0.3], [-2.2, 11.6, 0.3], [-1.9, 13.9, 0.3], [-1.2, 12.6, 0.6], [-0.9, 10.3, 0.7]];
    const sexLoop = pathOf(smoothPts(loopPts, 260, true));
    const sexH = { f: stream(sexLoop, 90, COL.oest, { size: 0.06, shape: 'octa', jitter: 0.08, seed: 9 }), m: stream(sexLoop, 90, 0x6ee7a8, { size: 0.06, shape: 'tetra', jitter: 0.08, seed: 10 }) };
    [gnrh, ...lh.f, ...lh.m, sexH.f, sexH.m].forEach((f) => person.add(f.mesh));
    const L = (h, p, c) => tint(stage.label(h, p, person), c);
    const lab = { hypo: L('Hypothalamus: GnRH', [2.2, 17.2, 0.1], 'pink'), pit: L('Pituitary: LH and FSH', [2.3, 16.0, 0.2], 'gold'), gon: L('', [2.4, 8.6, 0.3], 'cyan'), body: L('', [2.6, 12.4, 0.3], 'pink') };
    const ct = canvasTexture(560, 760, drawBoard);
    const bd = board(ct, 6.2, 8.41); bd.position.set(-6.9, 6.4, 0.4); root.add(bd);
    let lastKey = '', lastSx = '', toasted = false;
    const fit = fitNarrow(stage, { pos: [0, 9.2, 21], target: [0, 9.0, 0] });
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        if (s.play && !inReel()) { s.age += dt * 0.7; if (s.age > 18) s.age = 6; }
        const sx = s.sx, a = s.age;
        if (sx !== lastSx) { lastSx = sx; org.setSex(sx); }
        const hgt = heightAt(sx, a);
        person.scale.setScalar(hgt / 175.5);
        const L1 = lhOf(sx, a), S1 = sexHOf(sx, a);
        // GnRH comes in pulses once puberty is under way (shown speeded up)
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
        gnrh.step(dt, L1 > 0.15 ? 0.3 + 0.7 * pulse : 0.1, 0.25, time);
        hypoMat.emissiveIntensity = 0.2 + 1.0 * L1 * pulse; pitMat.emissiveIntensity = 0.2 + 1.0 * L1;
        ['f', 'm'].forEach((k) => {
          lh[k].forEach((f) => f.step(dt, k === sx ? L1 : 0, 2.2, time));
          sexH[k].step(dt, k === sx ? S1 : 0, 2.4, time);
        });
        org.ids().forEach((id) => org.glow(id, 0.1 + 0.8 * S1 * (id === 'ovary' || id === 'testis' ? 1 : 0.4)));
        const narrow = fit(), on = s.labels && !inReel() && !narrow;
        lab.gon.element.textContent = sx === 'f' ? 'Ovaries: oestrogen' : 'Testes: testosterone';
        lab.body.element.textContent = S1 > 0.3 ? (sx === 'f' ? 'Oestrogen reaches the whole body' : 'Testosterone reaches the whole body') : 'Sex hormones: still low';
        tint(lab.gon, sx === 'f' ? 'gold' : 'cyan'); tint(lab.body, sx === 'f' ? 'pink' : 'green');
        Object.values(lab).forEach((l) => { l.visible = on; });
        bd.visible = !narrow || inReel();
        const key = sx + a.toFixed(1);
        if (key !== lastKey && bd.visible) { lastKey = key; ct.redraw({ sx, age: a }); }
        if (!toasted && L1 > 0.5 && !inReel()) { toasted = true; toast('GnRH, LH and FSH are hormones. <a href="/endocrineclear/">EndocrineClear</a> shows the glands that make them.'); }
      },
      readout: (s) => {
        const sx = s.sx, a = s.age, L1 = lhOf(sx, a), S1 = sexHOf(sx, a);
        const now = CHANGES[sx].filter((c) => a >= c.a && a <= c.b).map((c) => c.k.split(' (')[0].toLowerCase());
        const stage = L1 < 0.15 ? 'Before puberty' : S1 < 0.85 ? 'Puberty under way' : 'Mostly grown';
        return `<div class="big">${stage}: age ${a.toFixed(1)}</div>
          <div class="row"><span>Height (WHO median)</span><b>${Math.round(heightAt(sx, a))} cm</b></div>
          <div class="row"><span>Brain signal (GnRH)</span><b>${L1 < 0.15 ? 'quiet' : 'pulses every 1–2 hours'}</b></div>
          <div class="row"><span>${sx === 'f' ? 'Oestrogen' : 'Testosterone'}</span><b>${S1 < 0.15 ? 'low' : S1 < 0.7 ? 'rising' : 'adult level'}</b></div>
          <small>${now.length ? 'Could be happening now: ' + now.slice(0, 3).join(', ') + '.' : 'No changes yet: that is normal too.'} Every body has its own timetable.</small>`;
      },
    });
  },
};
