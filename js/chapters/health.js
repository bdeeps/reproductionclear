// Chapter 6: keeping the reproductive system healthy. A ghost figure highlights the organs involved in
// each topic, and a board gives what it is, signs to notice, what a doctor may do, and a fact. Always
// "see a doctor": no diagnosis and no doses.
// Sources:
//  - Antenatal care: WHO recommends at least eight contacts (WHO recommendations on antenatal care for a
//    positive pregnancy experience, 2016); India's programme aims for at least four check-ups. Janani
//    Suraksha Yojana (JSY), launched 12 April 2005 under the National Rural Health Mission, gives cash
//    help to mothers who give birth in a health facility. Pradhan Mantri Surakshit Matritva Abhiyan
//    (PMSMA), launched in 2016, offers a free check-up by a doctor on the 9th of every month to women in
//    their second and third trimesters (Ministry of Health and Family Welfare, nhm.gov.in, pmsma.mohfw.gov.in).
//    88.6% of births in India were in a health facility in 2019–21 (NFHS-5).
//  - India's maternal mortality ratio fell from 398 per 100,000 live births in 1997–98 to 88 in
//    2020–22 (Sample Registration System special bulletins; see history.json).
//  - Anaemia: 57% of women aged 15–49 in India were anaemic in 2019–21 (NFHS-5).
//  - Periods: see a doctor for bleeding that soaks a pad every 1–2 hours, periods lasting more than
//    7 days, pain that stops daily life, bleeding between periods, or no period by about 15 (NHS
//    "Heavy periods", "Stopped or missed periods"; ACOG). PCOS affects an estimated 8–13% of women of
//    reproductive age, and up to 70% are undiagnosed (WHO fact sheet "Polycystic ovary syndrome", 2023).
//  - Infections: most reproductive tract and sexually transmitted infections can be treated or cured;
//    untreated, some cause infertility (WHO fact sheet "Sexually transmitted infections", 2024). The HPV
//    vaccine protects against the virus behind most cervical cancer; WHO recommends it for girls aged
//    9–14 (WHO "Cervical cancer" fact sheet, 2024). Testicular cancer is most common at 15–35 and is
//    very treatable when found early (NHS).
//  - Infertility: about 1 in 6 adults worldwide, 17.5% (WHO, 4 April 2023); causes can lie with either
//    partner. More than 12 million babies have been born by IVF and related treatments (ESHRE, 2023).
//  - Respect: in India the PCPNDT Act (1994) bans finding out or choosing a baby's sex before birth.
//    Childline India: 1098 (also reachable through 112).
import { THREE, clamp, lerp, canvasTexture } from '../kit.js';
import { makeOrgans, makeFigure, skinMaterial, blob, glowMat, board, panel, text, wrap, tint, fitNarrow, compactReadout, inReel, HEAD } from '../repro.js';

const TOPIC = {
  care: {
    label: 'Check-ups', title: 'Care in pregnancy', col: '#6ee7a8', sex: 'f', organs: ['uterus', 'cervix'],
    what: 'Regular check-ups (antenatal care) find problems early and keep mother and baby healthy. WHO advises at least 8 contacts.',
    signs: 'Go to a doctor at once for bleeding, a bad headache, blurred vision, sudden swelling, fever, or the baby moving less.',
    check: 'Blood pressure, weight, blood tests for anaemia, urine, scans, and iron and folic acid tablets and vaccines as the doctor advises.',
    fact: 'JSY (2005) helps mothers give birth in a hospital; PMSMA (2016) offers a free check-up on the 9th of every month.',
    stat: ['Births in a health facility, India', '88.6% (NFHS-5)'],
  },
  periods: {
    label: 'Periods', title: 'Menstrual health', col: '#ff9fc0', sex: 'f', organs: ['uterus', 'ovary'],
    what: 'Periods vary from person to person, and the first few years are often irregular. Pain relief, rest and warmth help mild cramps.',
    signs: 'See a doctor for very heavy bleeding, periods longer than 7 days, pain that stops you doing things, bleeding between periods, or no period by about 15.',
    check: 'A doctor may ask about your periods, check for anaemia with a blood test, and sometimes do an ultrasound scan.',
    fact: 'PCOS, a common hormone condition, affects about 8–13% of women and can cause irregular periods: a doctor can help.',
    stat: ['Women aged 15–49 with anaemia, India', '57% (NFHS-5)'],
  },
  infection: {
    label: 'Infections', title: 'Infections', col: '#ffd166', sex: null, organs: ['uterus', 'cervix', 'tube', 'canal', 'testis', 'urethra', 'prostate'],
    what: 'Germs can infect the reproductive organs. Some are passed between people during sexual contact (STIs). Most can be treated or cured.',
    signs: 'Itching, pain when passing urine, sores, an unusual discharge, pain low in the belly, or a lump or swelling in a testis.',
    check: 'A doctor examines, may take a simple test, and gives the right treatment. Early care prevents harm, including infertility.',
    fact: 'The HPV vaccine protects against the virus behind most cervical cancer. WHO recommends it for girls aged 9 to 14.',
    stat: ['First step', 'see a doctor, early and without shame'],
  },
  fertility: {
    label: 'Fertility', title: 'Infertility', col: '#8ef0ff', sex: null, organs: ['ovary', 'tube', 'uterus', 'testis', 'vas', 'epi'],
    what: 'Infertility means a pregnancy hasn’t happened after a year of trying. It is common, and it is nobody’s fault.',
    signs: 'Causes can be in either partner: eggs not being released, blocked tubes, few or slow sperm, or unknown.',
    check: 'Doctors test both partners. Treatments include medicines, surgery and IVF: joining egg and sperm in a lab dish and placing the embryo in the uterus.',
    fact: 'More than 12 million babies have been born by IVF since Louise Brown in 1978; India’s first, Durga, was born the same year.',
    stat: ['Adults affected worldwide', 'about 1 in 6 (WHO, 2023)'],
  },
  respect: {
    label: 'Respect', title: 'Respect and consent', col: '#c9a7ff', sex: null, organs: [],
    what: 'Your body is yours, and everyone else’s body is theirs: always ask, always respect a “no”, and tell a trusted adult (or call 1098) if anything feels wrong.',
    signs: 'Puberty comes at different times. Never tease anyone about their body, their periods or how they are growing.',
    check: 'Questions about your body are normal. Ask a parent, a teacher, a school nurse or a doctor.',
    fact: 'In India it is illegal to find out or choose a baby’s sex before birth (PCPNDT Act, 1994). Girls and boys are equally precious.',
    stat: ['Childline India', '1098'],
  },
};

function drawBoard(g, w, h, c) {
  panel(g, w, h);
  if (!c) return;
  text(g, c.title, 30, 58, 40, c.col, 600);
  let y = wrap(g, c.what, 30, 104, w - 60, 25, '#e9edf5', 1.28, 400) + 12;
  const rows = [[c === TOPIC.respect ? 'Kindness' : c === TOPIC.fertility ? 'Why it happens' : 'Signs to notice', c.signs, '#ff9fc0'], [c === TOPIC.respect ? 'Who to ask' : 'What a doctor may do', c.check, '#8ef0ff'], ['Did you know?', c.fact, '#6ee7a8']];
  rows.forEach(([k, v, col]) => { text(g, k, 30, y, 26, col, 600); y = wrap(g, v, 30, y + 32, w - 60, 23, '#cfd6e4', 1.26) + 12; });
  g.fillStyle = 'rgba(255,209,102,.12)'; g.fillRect(20, h - 70, w - 40, 50);
  text(g, c === TOPIC.respect ? 'Your body belongs to you.' : 'Worried? See a doctor.', 40, h - 36, 28, '#ffd166', 600);
}

export default {
  id: 'health',
  short: 'Staying healthy',
  title: 'Looking after it, and each other',
  subtitle: 'Check-ups, period health, infections and fertility, and the respect every body deserves.',
  view: { pos: [-1.3, 9.9, 11.5], target: [-2.6, 9.7, 0] },
  learn: `<p>Like every part of the body, the reproductive system can need care. This chapter explains common things; it cannot tell you what is happening in your own body. For that, <b>see a doctor</b>. Doctors see these questions every day, so there is nothing to be embarrassed about.</p>
    <p><b>Care in pregnancy</b> keeps mothers and babies safe. Regular check-ups catch problems such as high blood pressure and anaemia early. In India, <b>JSY</b> (Janani Suraksha Yojana, 2005) helps mothers give birth in a hospital, and <b>PMSMA</b> (2016) offers a free check-up by a doctor on the 9th of every month. Partly thanks to this, the share of mothers who die in childbirth has fallen by more than three-quarters since the late 1990s.</p>
    <p><b>Menstrual health:</b> periods that are very heavy, very painful, very irregular or missing are worth a doctor's visit. <b>PCOS</b>, a common hormone condition, is one reason periods can be irregular. Eating iron-rich food helps prevent anaemia.</p>
    <p><b>Infections</b> of the reproductive organs are common and most can be treated; signs like itching, pain, sores or unusual discharge mean: see a doctor early. The <b>HPV vaccine</b> prevents most cervical cancer. <b>Infertility</b> affects about 1 in 6 adults, can come from either partner, and is often treatable, including by <b>IVF</b>.</p>
    <p><b>Respect:</b> your body belongs to you, and everyone else's body belongs to them. Always ask, always respect a "no", and tell a trusted adult if anything ever feels wrong.</p>
    <p class="tip"><b>Try it:</b> pick each topic to see which organs are involved and what a doctor might do.</p>`,
  terms: [
    { t: 'Antenatal care', d: 'Regular check-ups during pregnancy to keep mother and baby healthy.' },
    { t: 'Anaemia', d: 'Too little haemoglobin in the blood, often from too little iron; it makes you tired.' },
    { t: 'PCOS', d: 'Polycystic ovary syndrome: a common hormone condition that can cause irregular periods.' },
    { t: 'STI', d: 'A sexually transmitted infection. Most can be treated; see a doctor early.' },
    { t: 'HPV vaccine', d: 'A vaccine that prevents most cases of cervical cancer.' },
    { t: 'IVF', d: 'In vitro fertilisation: joining egg and sperm in a lab dish, then placing the embryo in the uterus.' },
    { t: 'Consent', d: 'Freely saying yes. Everyone has the right to say no about their own body.' },
  ],
  defaults: { topic: 'care', sx: 'f', labels: true },
  controls: [
    { key: 'topic', type: 'seg', label: 'Topic', options: Object.entries(TOPIC).map(([v, c]) => ({ v, label: c.label })), fmt: (v) => TOPIC[v].title },
    { key: 'sx', type: 'seg', label: 'Organs shown', options: [{ v: 'f', label: 'Female' }, { v: 'm', label: 'Male' }], hint: 'Check-ups and periods always show the female organs.' },
    { key: 'labels', type: 'toggle', label: 'Labels' },
  ],
  quiz: [
    { q: 'What does India’s PMSMA offer pregnant women?', options: ['A free check-up by a doctor on the 9th of every month', 'Free phones', 'A holiday', 'Nothing'], answer: 0, why: 'Pradhan Mantri Surakshit Matritva Abhiyan (2016) offers free antenatal check-ups on the 9th of each month.' },
    { q: 'Someone notices a sore and pain when passing urine. What is the best first step?', options: ['Ignore it', 'Look it up and self-treat', 'See a doctor early', 'Wait a year'], answer: 2, why: 'Most infections are easily treated when found early. A doctor can test and treat without judgement.' },
    { q: 'About how many adults worldwide are affected by infertility?', options: ['1 in 1,000', '1 in 100', '1 in 6', 'Everyone'], answer: 2, why: 'WHO estimated in 2023 that about 1 in 6 adults experience infertility. It can come from either partner and is often treatable.' },
  ],
  reel: [
    { ms: 5400, caption: 'Regular check-ups keep mothers and babies safe; India’s maternal deaths have fallen by over three-quarters.', set: { topic: 'care', labels: false }, view: { pos: [-1.2, 9.6, 10.5], target: [-2.4, 9.5, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const skin = skinMaterial(); skin.opacity = 0.13;
    root.add(makeFigure(skin));
    const org = makeOrgans(stage, { labels: false, enlarge: 1.6 });
    root.add(org.root);
    org.bladder.visible = false;
    const heart = blob([0.3, 0.3, 0.3], [0, 12.2, 0.9], glowMat(0xc9a7ff, 0.8), 20); root.add(heart);
    const L = (h, p, c) => tint(stage.label(h, p, root), c);
    const lab = { main: L('', [2.0, 9.9, 0.4], 'green'), heart: L('Respect: every body', [1.8, 12.6, 0.8], 'purple') };
    const ct = canvasTexture(600, 760, drawBoard);
    const bd = board(ct, 4.8, 6.08); bd.position.set(-5.4, 8.35, 0.4); root.add(bd);
    let last = '', lastSex = '';
    const fit = fitNarrow(stage, { pos: [0, 9.6, 10], target: [0, 9.4, 0] });
    return compactReadout(stage, {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        const c = TOPIC[s.topic], sex = c.sex || s.sx;
        if (sex !== lastSex) { lastSex = sex; org.setSex(sex); }
        if (last !== s.topic) { last = s.topic; ct.redraw(c); }
        org.ids().forEach((id) => {
          const on = c.organs.includes(id);
          org.mats[id].transparent = !on; org.mats[id].opacity = on ? 1 : 0.25;
          org.glow(id, on ? 0.45 + 0.45 * Math.sin(time * 3) ** 2 : 0.05);
        });
        heart.visible = s.topic === 'respect';
        heart.scale.setScalar(0.3 * (1 + 0.08 * Math.sin(time * 3)));
        const narrow = fit(), on = s.labels && !inReel() && !narrow;
        lab.main.element.textContent = s.topic === 'respect' ? '' : c.title;
        tint(lab.main, c.col);
        lab.main.visible = on && s.topic !== 'respect'; lab.heart.visible = on && s.topic === 'respect';
        bd.visible = !narrow || inReel();
      },
      readout: (s) => {
        const c = TOPIC[s.topic];
        return `<div class="big">${c.title}</div>
          <div class="row"><span>${c.stat[0]}</span><b>${c.stat[1]}</b></div>
          <div class="row"><span>${s.topic === 'respect' ? 'Always' : 'First step'}</span><b>${s.topic === 'respect' ? 'ask, and respect a “no”' : 'see a doctor'}</b></div>`;
      },
    });
  },
};
