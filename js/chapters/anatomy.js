// Chapter 1: the internal reproductive organs as clean textbook diagrams inside a ghosted pelvis and a
// neutral ghost figure. A switch shows the female organs (ovaries, fallopian tubes, uterus, cervix,
// birth canal) or the male organs (testes, epididymis, vas deferens, seminal vesicles, prostate,
// urethra). Explode slides them out in front and enlarges them; X-ray fades the skin. Click an organ
// to see where it is, what it does and how big it is. Sizes and sources: the top of repro.js.
// Only internal organs are drawn, as in NCERT class 8 and class 12 diagrams: no external detail.
import { THREE, lerp } from '../kit.js';
import { makeOrgans, makeFigure, makePelvisBones, skinMaterial, ORGANS, ORG, PELVIS, tint, fitNarrow, compactReadout, inReel } from '../repro.js';
import { toast } from '../ui.js';

export default {
  id: 'anatomy',
  short: 'The organs',
  title: 'The organs that make new life',
  subtitle: 'Two sets of organs, deep in the pelvis, each with one job: to make and move the cells that start a baby.',
  view: { pos: [-0.6, 9.0, 5.4], target: [-1.0, 8.85, 0] },
  learn: `<p>Every living thing makes more of its own kind. In humans, the <b>reproductive system</b> makes special cells called <b>gametes</b>: <b>eggs</b> in a female body and <b>sperm</b> in a male body. When one egg and one sperm join, a new life can begin. We are facing the person, so their right is on your left.</p>
    <p>The <b>female</b> organs sit low in the belly, inside the bony ring of the <b>pelvis</b>. Two almond-sized <b>ovaries</b> store thousands of immature eggs and release about one a month. Each egg is caught by the finger-like end of a <b>fallopian tube</b> and swept towards the <b>uterus</b> (womb), a pear-sized bag of strong muscle where a baby can grow. Its narrow lower end is the <b>cervix</b>, which opens into the <b>birth canal</b>.</p>
    <p>The <b>male</b> organs start with two <b>testes</b>, which make millions of sperm every day. They hang in a pouch outside the body because sperm need to stay 2 to 3 °C cooler than the rest of you. Sperm mature in the coiled <b>epididymis</b>, then travel up the <b>vas deferens</b>. The <b>seminal vesicles</b> and the <b>prostate</b> add fluids that feed and protect them, and the <b>urethra</b> carries them out.</p>
    <p>Both sets of organs are also <b>glands</b>: the ovaries make <b>oestrogen</b> and <b>progesterone</b>, and the testes make <b>testosterone</b>. EndocrineClear shows how the brain controls them. The hip bones around them are drawn faintly; SkeletonClear has the real pelvis.</p>
    <p class="tip"><b>Try it:</b> switch between the two sets of organs, take them out to see them bigger, and click any organ to learn its job.</p>`,
  terms: [
    { t: 'Gamete', d: 'A sex cell: an egg or a sperm. Each carries half the instructions for a new person.' },
    { t: 'Ovary', d: 'One of two almond-sized organs that store eggs and make oestrogen and progesterone.' },
    { t: 'Fallopian tube', d: 'The tube from an ovary to the uterus, where egg and sperm meet.' },
    { t: 'Uterus', d: 'The womb: a hollow muscle where a baby grows during pregnancy.' },
    { t: 'Testis', d: 'One of two organs that make sperm and the hormone testosterone.' },
    { t: 'Vas deferens', d: 'The tube that carries sperm from the epididymis towards the urethra.' },
    { t: 'Pelvis', d: 'The ring of hip bones that holds and protects the organs low in the belly.' },
  ],
  defaults: { sex: 'f', explode: 0, xray: true, labels: true },
  controls: [
    { key: 'sex', type: 'seg', label: 'Show the organs', options: [{ v: 'f', label: 'Female' }, { v: 'm', label: 'Male' }] },
    { key: 'explode', type: 'range', label: 'Take the organs out', min: 0, max: 1, step: 0.01, ends: ['in the pelvis', 'out and enlarged'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'xray', type: 'toggle', label: 'X-ray: see through the skin' },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'Where does a baby grow during pregnancy?', options: ['In the ovary', 'In the uterus', 'In the fallopian tube', 'In the bladder'], answer: 1, why: 'The uterus, or womb, is a strong, stretchy muscle bag. It grows from pear-sized to reach up near the ribs.' },
    { q: 'Why do the testes hang outside the body?', options: ['To be protected by the hip bones', 'Sperm form best 2 to 3 °C cooler than the body', 'To be closer to the brain', 'There is no room inside'], answer: 1, why: 'Sperm need a slightly cooler place to form properly, so the testes sit in a pouch outside the body.' },
    { q: 'Which organs make eggs and sperm?', options: ['Uterus and prostate', 'Ovaries and testes', 'Cervix and urethra', 'Kidneys and bladder'], answer: 1, why: 'Ovaries and testes are the gonads. They make the gametes and also the sex hormones.' },
  ],
  reel: [
    { ms: 5200, caption: 'Deep in the pelvis, two almond-sized ovaries hold the eggs, and a pear-sized uterus waits.', set: { sex: 'f', explode: 0, xray: true, labels: false }, view: { pos: [0.3, 9.4, 7.8], target: [0, 9.1, 0] }, spin: 0.5 },
    { ms: 5000, caption: 'The testes make about 100 million sperm a day, stored in a coiled tube 6 metres long.', set: { sex: 'm', xray: true, labels: false }, anim: { explode: [0, 0.8] }, view: { pos: [0.3, 8.9, 8.6], target: [0, 8.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const skin = skinMaterial();
    root.add(makeFigure(skin));
    const bones = makePelvisBones(0.18);
    bones.position.set(...PELVIS); bones.scale.setScalar(0.1);
    root.add(bones);
    const org = makeOrgans(stage);
    root.add(org.root);
    const sides = [tint(stage.label('← Their right', [-0.95, 7.85, 1.0], root), 'side'), tint(stage.label('Their left →', [0.95, 7.85, 1.0], root), 'side')];
    const boneLbl = tint(stage.label('Hip bones (pelvis)', [0.95, 10.35, -0.4], root), 'bone');
    stage.pickables.push(...org.meshes, ...bones.children);
    let xr = 1, t = 0, sel = null, selT = -9, lastSex = '', lastToast = -9;
    const fit = fitNarrow(stage, { pos: [0, 9.1, 6.8], target: [0, 9.0, 0] });
    return compactReadout(stage, {
      pick(o) {
        if (o?.userData?.bone) {
          if (t - lastToast > 1) { lastToast = t; toast('These are the hip bones. <a href="/skeletonclear/">SkeletonClear</a> shows the real pelvis and why it is wider in women.'); }
          return;
        }
        const id = o?.userData?.organ;
        if (!id) return;
        sel = id; selT = t;
        if ((id === 'ovary' || id === 'testis') && t - lastToast > 1) { lastToast = t; toast('Ovaries and testes are glands too. <a href="/endocrineclear/">EndocrineClear</a> shows the hormones that control them.'); }
      },
      update(dt, s, time) {
        dt = Math.max(0, dt); t = time;
        if (s.sex !== lastSex) { lastSex = s.sex; org.setSex(s.sex); sel = null; }
        xr += ((s.xray ? 1 : 0) - xr) * Math.min(1, dt * 5);
        skin.opacity = lerp(0.6, 0.1, xr) * (1 - 0.7 * Math.min(1, s.explode * 1.4));
        bones.visible = s.explode < 0.6;
        org.setExplode(s.explode);
        const big = 0.1 * (1 + 0.6 * s.explode);
        org.root.scale.setScalar(big);
        const focus = t - selT < 6 ? sel : null;
        org.ids().forEach((id, i) => {
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 0.8);
          org.glow(id, !focus || focus === id ? 0.3 + (focus ? 0.6 : 0.2) * pulse : 0.06);
        });
        const narrow = fit();
        const on = s.labels && !inReel() && !narrow;
        for (const [id, l] of Object.entries(org.labelOf)) l.visible = on && (id === 'bladder' ? s.explode < 0.4 : org.sexOf[id] === s.sex) && (!focus || focus === id);
        sides.forEach((l) => { l.visible = on && s.explode < 0.3; });
        boneLbl.visible = on && s.explode < 0.3;
      },
      readout: (s) => {
        const id = t - selT < 6 ? sel : null;
        if (id) {
          const o = ORG[id];
          return `<div class="big">${o.name}</div>
            <div class="row"><span>Where</span><b>${o.where}</b></div>
            <div class="row"><span>Job</span><b>${o.job}</b></div>
            <div class="row"><span>Size</span><b>${o.size}</b></div>
            <small>${o.more}</small>`;
        }
        if (s.sex === 'f') return `<div class="big">Female: eggs and a place to grow</div>
          <div class="row"><span>Eggs at puberty</span><b>about 300,000–400,000</b></div>
          <div class="row"><span>Eggs ever released</span><b>about 400–500</b></div>
          <div class="row"><span>Uterus</span><b>7.5 cm, about 70 g</b></div>
          <div class="row"><span>Each tube</span><b>about 10–12 cm</b></div>
          <small>${s.explode > 0.4 ? 'Pulled out in front and shown bigger.' : 'Click any glowing organ to see its job.'}</small>`;
        return `<div class="big">Male: making and moving sperm</div>
          <div class="row"><span>Sperm made</span><b>about 100 million a day</b></div>
          <div class="row"><span>Testes</span><b>2–3 °C cooler than the body</b></div>
          <div class="row"><span>Epididymis</span><b>about 6 m of coiled tube</b></div>
          <div class="row"><span>Time to mature</span><b>about 2 weeks</b></div>
          <small>${s.explode > 0.4 ? 'Pulled out in front and shown bigger.' : 'Click any glowing organ to see its job.'}</small>`;
      },
    });
  },
};
