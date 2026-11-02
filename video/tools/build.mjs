// Generates index.html and compositions/*.html for the stage film
// "คัมภีร์ฉันทศาสตร์ แพทย์ศาสตร์สงเคราะห์".
// Run: node tools/build.mjs   (re-run after editing anything below)
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1920, H = 1080, FY = 845; // FY = stage floor (feet line)
const TOTAL = 191;
const r2 = (n) => Math.round(n * 1000) / 1000;
const hash = (n) => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

// ───────────────────────── voice track: lines and pauses ─────────────────────────
const NAMES = {
  narr: "ผู้เล่าเรื่อง", putt: "พุฒิภัทร", krong: "กรองแก้ว", wilai: "วิไลรัมภา", mantri: "มารตรี",
  thong: "หมอทองแท้", phothap: "พ่อทับ", rerai: "หมอหลวงเรไร", maeim: "แม่อิ่ม", tasi: "ตาสี",
};
const LINES = [
  ["narr", 0.0, 8.36, "คัมภีร์ฉันทศาสตร์ ไม่ได้สอนแค่วิธีรักษาโรค แต่สอนวิธีรักษาใจของหมอ..."],
  ["narr", 9.97, 13.68, "คืนนี้ คัมภีร์จะตื่นขึ้น เพื่อทดสอบผู้มาเยือน"],
  ["putt", 14.85, 21.05, "ตำรายาโบราณหรือครับคุณแก้ว สมัยนี้เรามีเพนิซิลลินแล้ว"],
  ["krong", 21.75, 26.59, "ยาของคุณหมอหลายตัวก็มาจากพืชนะคะ ความรู้ไม่จำเป็นต้องใหม่ถึงจะจริง"],
  ["wilai", 27.21, 30.14, "คุณภัทรขา! รัมภารอที่รถตั้งนานแล้วนะคะ"],
  ["mantri", 30.87, 36.37, "ใครได้คัมภีร์นี้ จะรู้ทุกตำรับยาในแผ่นดิน... ขอเปิดดูหน่อยนะ"],
  ["krong", 37.22, 38.38, "คุณมารตรี อย่าค่ะ!"],
  ["thong", 41.38, 47.11, "แขกมาเยือนทั้งที ทำไมมานอนกลิ้งหน้าหมู่บ้านล่ะขอรับ"],
  ["thong", 48.0, 53.37, "ที่นี่คือแผ่นดินในคัมภีร์ แต่ตอนนี้... โรคระบาดกำลังลามไปทั้งหมู่บ้าน"],
  ["maeim", 53.97, 55.16, "หมอ ช่วยลูกข้าด้วย"],
  ["putt", 55.86, 59.71, "ขาดน้ำรุนแรง แต่ยาของผมเหลือพอแค่คนเดียว"],
  ["phothap", 60.41, 68.32, "หมอคนหนึ่งมียาพอสำหรับคนเดียว แต่หมอสามคนมีปัญญาพอสำหรับคนทั้งหมู่บ้าน"],
  ["putt", 68.78, 73.73, "ครับอาจารย์ ต้มน้ำ ผสมเกลือกับน้ำตาล ให้ดื่มทีละน้อย"],
  ["phothap", 74.17, 78.09, "แล้วข้าจะให้ยาสมานลำไส้จากเปลือกมังคุดและขมิ้น"],
  ["rerai", 80.59, 87.47, "ทุกปากพูดแต่ชื่อพ่อทับ! ข้าจึงหย่อนเชื้อร้ายลงบ่อน้ำ ให้ทุกคนเห็นว่าเขาไร้น้ำยา"],
  ["mantri", 88.0, 92.61, "งั้นใส่ให้แรงกว่าเดิมสิคะ แม่หมอได้ชื่อเสียง ฉันได้คัมภีร์"],
  ["mantri", 93.14, 95.39, "เอาไปเทลงบ่อ อย่าถามมาก"],
  ["wilai", 96.09, 98.72, "มารตรี... นี่เธอจะฆ่าคนทั้งหมู่บ้านหรือ"],
  ["putt", 99.3, 105.28, "บ้านที่ป่วยทุกหลังใช้น้ำบ่อกลางหมู่บ้าน และเชื้อเพิ่มขึ้นทุกเช้า มีคนจงใจใส่ซ้ำ"],
  ["thong", 105.98, 113.41, "ผู้เป็นแพทย์พึงระวังใจ อย่าให้โลภโกรธหลงครอบงำได้"],
  ["wilai", 114.17, 120.36, "คุณกรองแก้ว มารตรีสั่งให้ฉันเทขวดนี้ลงบ่อ ฉันเคยดูถูกเธอ ฉันขอโทษนะ"],
  ["krong", 121.19, 123.93, "คุณรัมภาทำถูกแล้วค่ะ ที่กล้ายอมรับ"],
  ["thong", 124.46, 126.81, "ตราประจำเรือนของหมอหลวงเรไร!"],
  ["putt", 129.34, 134.33, "เชื้อในบ่อมาจากขวดนี้ และขวดนี้มาจากเรือนของแม่หมอเรไร"],
  ["tasi", 135.18, 138.32, "แม่หมอเรไร! ข้าเคยเชื่อท่าน"],
  ["rerai", 139.02, 142.91, "ใช่! ข้าทำเอง! ข้าเบื่อที่จะเป็นที่สองตลอดชีวิต!"],
  ["phothap", 143.54, 148.68, "เรไร... มือของหมอมีไว้รักษา ไม่ใช่มีไว้ทำร้าย"],
  ["thong", 149.38, 156.57, "แพทย์ใดลืมเมตตาธรรม คัมภีร์จะพิพากษาตามกรรม"],
  ["mantri", 157.05, 159.41, "คัมภีร์เป็นของฉัน! ไม่!"],
  ["phothap", 161.91, 170.31, "ตำรายานี้ เอาไปศึกษา ความรู้สองโลกรวมกันจะช่วยคนได้มากกว่าเดิม"],
  ["putt", 171.28, 175.89, "ผมมาในฐานะหมอที่คิดว่ารู้ทุกอย่าง แต่กลับไปในฐานะลูกศิษย์ครับ"],
  ["thong", 176.59, 180.88, "และอย่าปล่อยให้แม่นางคนนั้นต้มน้ำให้คนอื่นนะขอรับ"],
  ["narr", 182.41, 187.47, "ยาที่ดีที่สุด อยู่ในหัวใจของหมอที่ปราศจากอคติ... จบบริบูรณ์"],
];
// pauses inside the voice track (ffmpeg silencedetect -35 dB, ≥0.35 s): mouths close here
const SIL = [[1.51,2.04],[4.43,5.45],[8.36,9.97],[10.76,11.86],[13.68,14.85],[16.84,17.4],[19.06,19.44],[21.05,21.75],[24.16,24.55],[26.59,27.21],[28.03,28.41],[30.14,30.87],[34.73,35.44],[36.37,37.22],[38.38,41.38],[42.45,42.88],[44.96,45.43],[47.11,48.01],[48.63,49.25],[51.51,52.83],[53.37,53.97],[55.16,55.86],[57.08,57.49],[59.71,60.41],[63.64,64.25],[68.32,68.78],[69.56,70.13],[73.73,74.17],[78.09,80.59],[82.61,83.2],[85.23,85.64],[87.47,88.0],[89.62,90.16],[92.61,93.14],[94.15,94.6],[95.39,96.09],[96.71,97.13],[98.72,99.3],[101.76,102.18],[103.49,104.06],[105.28,105.99],[108.83,109.52],[113.41,114.17],[120.36,121.19],[123.93,124.46],[126.81,129.34],[131.41,131.89],[134.33,135.18],[136.44,137.08],[138.32,139.02],[142.91,143.54],[144.27,145.09],[147.02,147.48],[148.68,149.38],[152.35,153.0],[156.57,157.05],[159.41,161.91],[164.9,165.59],[167.67,168.14],[170.31,171.28],[173.64,174.17],[175.89,176.59],[180.88,182.41],[183.32,183.93],[186.3,187.47]];
const inSilence = (t) => SIL.some(([a, b]) => t > a + 0.05 && t < b - 0.05);

// ───────────────────────── characters ─────────────────────────
// body: pants | dress | robe | sarong | chong (โจงกระเบน) | coat
const CAST = {
  narr:    { skin: "#e2b48a", hair: "#2b1d14", style: "topknot", top: "#c9973a", bottom: "#8a2a22", body: "robe", trim: "#f3d27a" },
  putt:    { skin: "#e8bf98", hair: "#1b1b1b", style: "short", top: "#f4f1ea", bottom: "#2e3440", body: "coat", trim: "#3b5b8a" },
  krong:   { skin: "#e9c19c", hair: "#2a1a12", style: "bun", top: "#2f7f86", bottom: "#2f7f86", body: "dress", trim: "#e9e2cf" },
  wilai:   { skin: "#f0caa6", hair: "#5a3424", style: "wavy", top: "#e48fb0", bottom: "#e48fb0", body: "dress", trim: "#fff4f8" },
  mantri:  { skin: "#e6bc96", hair: "#121014", style: "long", top: "#23202a", bottom: "#23202a", body: "dress", trim: "#b3212b" },
  thong:   { skin: "#d9a273", hair: "#1e1611", style: "short", top: "#d9822b", bottom: "#6b3f2a", body: "chong", trim: "#f2c46b" },
  phothap: { skin: "#c99367", hair: "#ece6da", style: "white", top: "#7a5a3a", bottom: "#4a3a2a", body: "chong", trim: "#d8c39a", beard: true },
  rerai:   { skin: "#e0b08a", hair: "#1a1014", style: "highbun", top: "#5b2a7a", bottom: "#3c1a52", body: "robe", trim: "#e3b84a" },
  maeim:   { skin: "#cf9a6c", hair: "#2a1d16", style: "bun", top: "#9b8b74", bottom: "#5c4a6e", body: "sarong", trim: "#c7b79a" },
  tasi:    { skin: "#c48f63", hair: "#b9b2a6", style: "bald", top: "#6f7b4a", bottom: "#3d3a2e", body: "chong", trim: "#a7b07a" },
  juk:     { skin: "#d9a273", hair: "#1e1611", style: "juk", top: "#c9a26a", bottom: "#5a4a3a", body: "pants", trim: "#e6d2a8" },
  vil1:    { skin: "#cf9a6c", hair: "#2a1d16", style: "short", top: "#a07b52", bottom: "#4b3b2b", body: "chong", trim: "#c9ad85" },
  vil2:    { skin: "#d9a273", hair: "#2a1d16", style: "bun", top: "#7c8a99", bottom: "#4b4560", body: "sarong", trim: "#aab6c2" },
  vil3:    { skin: "#c48f63", hair: "#3a2a20", style: "short", top: "#b36a5e", bottom: "#3d3a2e", body: "chong", trim: "#d79a8f" },
  guard1:  { skin: "#c99367", hair: "#141010", style: "short", top: "#7a1e1e", bottom: "#2a1414", body: "chong", trim: "#d9a441" },
  guard2:  { skin: "#d9a273", hair: "#141010", style: "short", top: "#7a1e1e", bottom: "#2a1414", body: "chong", trim: "#d9a441" },
};

const ITEMS = {
  book: (op) => `<g opacity="${op}"><rect x="-26" y="-20" width="52" height="40" rx="3" fill="#7a2a1a" stroke="#e3b84a" stroke-width="3"/><rect x="-18" y="-12" width="36" height="24" fill="none" stroke="#e3b84a" stroke-width="2"/><circle cx="0" cy="0" r="5" fill="#f3d27a"/></g>`,
  bottle: (op) => `<g opacity="${op}"><rect x="-6" y="-38" width="12" height="12" fill="#3a3a3a"/><path d="M-14,-26 Q-16,-20 -14,-14 L-14,14 Q-14,20 -8,20 L8,20 Q14,20 14,14 L14,-14 Q16,-20 14,-26 Z" fill="#141216" stroke="#55505a" stroke-width="2"/><circle data-emblem cx="0" cy="12" r="6" fill="#8b4bb3" stroke="#e3b84a" stroke-width="2"/></g>`,
  bundle: (op) => `<g opacity="${op}"><path d="M-24,-10 Q0,-30 24,-10 L20,18 Q0,26 -20,18 Z" fill="#c9a26a" stroke="#7a5a3a" stroke-width="3"/><path d="M-6,-24 L0,-34 L6,-24" fill="#c9a26a" stroke="#7a5a3a" stroke-width="3"/></g>`,
  herbs: (op) => `<g opacity="${op}"><path d="M0,10 Q-14,-14 -6,-30 M0,10 Q2,-18 10,-32 M0,10 Q12,-8 20,-20" stroke="#4f7a2e" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="-6" cy="-30" r="6" fill="#e0a92a"/><circle cx="10" cy="-32" r="6" fill="#6b2d5c"/></g>`,
  spear: (op) => `<g opacity="${op}"><rect x="-3" y="-190" width="6" height="250" fill="#6b4a2a"/><path d="M-10,-188 L0,-224 L10,-188 Z" fill="#cfd4da"/></g>`,
};

function hairSVG(c, back) {
  const h = c.hair;
  const cap = `<path d="M66,66 Q60,24 102,24 Q140,24 138,60 Q122,42 96,44 Q78,48 74,74 Z" fill="${h}"/>`;
  switch (c.style) {
    case "short": case "white": return back ? "" : cap;
    case "bun": return back ? `<circle cx="70" cy="34" r="15" fill="${h}"/>` : cap;
    case "highbun": return back ? `<circle cx="96" cy="16" r="17" fill="${h}"/><rect x="74" y="12" width="46" height="5" rx="2" fill="#e3b84a" transform="rotate(-18 97 14)"/>` : cap;
    case "topknot": return back ? `<circle cx="100" cy="22" r="12" fill="${h}"/><circle cx="100" cy="22" r="5" fill="#e3b84a"/>` : cap;
    case "long": return back ? `<path d="M62,44 Q54,118 70,128 L112,120 L112,40 Z" fill="${h}"/>` : `<path d="M66,70 Q58,22 104,22 Q142,24 138,64 L134,58 Q110,36 92,46 Q78,52 76,80 Z" fill="${h}"/>`;
    case "wavy": return back ? `<path d="M60,50 Q50,100 66,108 Q62,92 74,98 Q70,84 84,92 L110,40 Z" fill="${h}"/>` : `<path d="M64,72 Q56,22 104,22 Q144,24 140,66 Q132,52 126,56 Q118,40 100,46 Q92,40 82,50 Q72,52 72,78 Z" fill="${h}"/>`;
    case "juk": return back ? `<circle cx="102" cy="22" r="10" fill="${h}"/><rect x="94" y="28" width="16" height="4" fill="#d24b4b"/>` : "";
    case "bald": return back ? "" : `<path d="M68,74 Q64,56 74,48 L80,52 Q72,60 76,80 Z" fill="${h}"/>`;
  }
  return "";
}

function actorSVG(key, id, itemsCfg) {
  const c = CAST[key];
  const s = c.skin, top = c.top, bot = c.bottom;
  const P = (n) => `${id}-${n}`;
  let legs = "", body = "";
  const shoe = (x) => `<ellipse cx="${x + 5}" cy="326" rx="13" ry="7" fill="#2a1d16"/>`;
  const leg = (n, x, col, kneeCol) =>
    `<g id="${P(n)}"><rect x="${x - 7}" y="212" width="15" height="${kneeCol ? 50 : 110}" rx="6" fill="${col}"/>${kneeCol ? `<rect x="${x - 6}" y="256" width="13" height="66" rx="6" fill="${kneeCol}"/>` : ""}${shoe(x)}</g>`;
  if (c.body === "pants" || c.body === "coat") { legs = leg("legL", 89, bot) + leg("legR", 111, bot); }
  else if (c.body === "chong") { legs = `<g id="${P("legL")}"><path d="M76,210 L102,210 L100,268 L80,268 Z" fill="${bot}"/><rect x="83" y="262" width="13" height="60" rx="6" fill="${s}"/>${shoe(89)}</g><g id="${P("legR")}"><path d="M98,210 L124,210 L120,268 L100,268 Z" fill="${bot}"/><rect x="104" y="262" width="13" height="60" rx="6" fill="${s}"/>${shoe(111)}</g>`; }
  else { legs = leg("legL", 89, s) + leg("legR", 111, s); }
  const torso = `<path d="M64,114 Q100,100 136,114 L130,224 L70,224 Z" fill="${top}"/>`;
  if (c.body === "dress") body = torso + `<path d="M72,196 L128,196 L150,296 L50,296 Z" fill="${bot}"/><path d="M70,206 L130,206" stroke="${c.trim}" stroke-width="5"/><path d="M90,106 Q100,120 110,106" stroke="${c.trim}" stroke-width="4" fill="none"/>`;
  else if (c.body === "robe") body = `<path d="M64,114 Q100,100 136,114 L152,318 L48,318 Z" fill="${top}"/><path d="M100,108 L100,318" stroke="${c.trim}" stroke-width="6"/><path d="M58,214 L142,214" stroke="${bot}" stroke-width="12"/><path d="M50,312 L150,312" stroke="${c.trim}" stroke-width="5"/>`;
  else if (c.body === "sarong") body = torso + `<path d="M70,200 L130,200 L136,318 L64,318 Z" fill="${bot}"/><path d="M68,212 L132,212" stroke="${c.trim}" stroke-width="5"/>`;
  else if (c.body === "coat") body = `<path d="M84,108 L116,108 L112,200 L88,200 Z" fill="#dfe6ee"/><path d="M96,112 L100,170 L104,112 Z" fill="${c.trim}"/><path d="M64,114 Q76,104 88,108 L100,180 L94,262 L66,262 Z" fill="${top}" stroke="#d6d1c4" stroke-width="2"/><path d="M136,114 Q124,104 112,108 L100,180 L106,262 L134,262 Z" fill="${top}" stroke="#d6d1c4" stroke-width="2"/><path d="M84,116 Q74,170 96,188" stroke="#555" stroke-width="3" fill="none"/><circle cx="96" cy="190" r="5" fill="#888"/>`;
  else body = torso + `<path d="M68,200 L132,200" stroke="${c.trim}" stroke-width="6"/>`;
  const sleeve = c.body === "coat" ? top : top;
  const arm = (n, x, item) => {
    const it = item ? Object.entries(item).map(([k, op]) => `<g id="${P("item-" + k)}" transform="translate(${x} 222)">${ITEMS[k](op)}</g>`).join("") : "";
    return `<g id="${P(n)}"><rect x="${x - 8}" y="114" width="16" height="96" rx="8" fill="${sleeve}" stroke="rgba(0,0,0,.12)" stroke-width="1.5"/><circle cx="${x}" cy="214" r="9.5" fill="${s}"/>${it}</g>`;
  };
  const beard = c.beard ? `<path d="M96,86 Q112,118 128,86 Q112,96 96,86 Z" fill="${c.hair}"/>` : "";
  const cheeks = ["krong", "wilai", "mantri", "maeim", "rerai"].includes(key) ? `<circle cx="96" cy="78" r="5" fill="#e48a8a" opacity=".35"/><circle cx="126" cy="76" r="4" fill="#e48a8a" opacity=".35"/>` : "";
  const glasses = key === "putt" ? `<g fill="none" stroke="#2a2a2a" stroke-width="2.5"><circle cx="99" cy="61" r="8"/><circle cx="121" cy="61" r="8"/><path d="M107,61 L113,61"/></g>` : "";
  const head = `<g id="${P("head")}">${hairSVG(c, true)}<rect x="92" y="88" width="16" height="22" fill="${s}"/><circle cx="104" cy="62" r="36" fill="${s}"/><ellipse cx="80" cy="66" rx="6" ry="9" fill="${s}" stroke="rgba(0,0,0,.15)"/>${hairSVG(c, false)}<g id="${P("eyes")}"><ellipse cx="99" cy="61" rx="3.6" ry="4.8" fill="#1d1612"/><ellipse cx="121" cy="61" rx="3.4" ry="4.6" fill="#1d1612"/></g><path d="M93,50 L104,49 M115,48 L126,50" stroke="${c.style === "white" || c.style === "bald" ? "#9a9286" : "#2a1d16"}" stroke-width="3" stroke-linecap="round"/><path d="M132,62 Q138,70 131,72" stroke="rgba(0,0,0,.3)" stroke-width="2.5" fill="none"/>${cheeks}${beard}${glasses}<ellipse id="${P("mouth")}" cx="116" cy="82" rx="7" ry="5" fill="#7a2626"/></g>`;
  const items = itemsCfg || {};
  return `<svg viewBox="0 0 200 340" width="100%" height="100%" overflow="visible"><g id="${P("rig")}">${arm("armL", 70, items.L)}${legs}${body}${head}${arm("armR", 130, items.R)}</g></svg>`;
}

// ───────────────────────── scene rig compiler ─────────────────────────
// Builds a flat tween list per scene from high-level actions:
//   walk {c,t,to,d}  face {c,t,dir}  fall {c,t,dir}  rise {c,t}  crouch {c,t}  stand {c,t}
//   arm {c,t,side,to,d,ease}  eyes {c,t,closed}  item {c,t,name,on}  head {c,t,to,d}
//   to {sel,t,vars} (raw tween)  set {sel,t,vars}
function compileScene(sc) {
  const sid = sc.id, T0 = sc.start, D = sc.end - sc.start;
  const T = []; // [kind, selector, vars, pos]
  const L = (t) => r2(t - T0);
  const sel = (c, part) => `#${sid}-${c}${part ? "-" + part : ""}`;
  const add = (kind, s, vars, t) => T.push([kind, s, vars, r2(Math.max(0, t))]);
  const actors = sc.actors;
  const st = {}; // runtime state per actor
  for (const a of actors) st[a.c] = { x: a.x, base: a.x, flip: a.flip ?? 1, walks: [], down: false };

  const acts = [...sc.actions].sort((a, b) => a.t - b.t);
  // walking intervals, for auto-facing
  for (const a of acts) if (a.type === "walk") st[a.c].walks.push([a.t, a.t + a.d]);
  const walking = (c, t) => st[c].walks.some(([a, b]) => t >= a - 0.05 && t <= b + 0.1);
  const busyArms = (c, t0, t1) => acts.some((a) => a.c === c && (a.type === "arm" || a.type === "crouch" || a.type === "wai") && a.t >= t0 - 0.6 && a.t <= t1);

  // initial state
  for (const a of actors) {
    add("set", sel(a.c), { x: 0, y: a.y0 || 0, rotation: a.rot0 || 0, scale: 1, opacity: a.op0 ?? 1, transformOrigin: "50% 97%" }, T0);
    add("set", sel(a.c, "flip"), { scaleX: st[a.c].flip, y: 0 }, T0);
    for (const p of ["armL", "armR"]) add("set", sel(a.c, p), { rotation: a[p] || 0, svgOrigin: p === "armL" ? "70 120" : "130 120" }, T0);
    add("set", sel(a.c, "legL"), { rotation: 0, svgOrigin: "89 214" }, T0);
    add("set", sel(a.c, "legR"), { rotation: 0, svgOrigin: "111 214" }, T0);
    add("set", sel(a.c, "head"), { rotation: 0, svgOrigin: "104 100" }, T0);
    add("set", sel(a.c, "mouth"), { scaleY: 0.3, svgOrigin: "116 82" }, T0);
    add("set", sel(a.c, "eyes"), { scaleY: a.eyes0 === "closed" ? 0.12 : 1, svgOrigin: "110 61" }, T0);
    add("set", sel(a.c, "rig"), { scaleY: 1, svgOrigin: "100 330" }, T0);
    // breathing: slow, offset per actor
    const per = 1.6 + hash(a.c.length * 7 + a.x) * 0.6;
    add("to", sel(a.c, "rig"), { scaleY: 1.014, duration: per, ease: "sine.inOut", repeat: Math.max(1, Math.floor(D / per) - 1), yoyo: true }, T0 + hash(a.x) * 0.8);
  }

  // auto facing: listeners turn to the speaker, the speaker turns to the listeners
  const lines = LINES.filter(([c, a]) => a >= T0 && a < sc.end && st[c]);
  const faceEvents = [];
  const xAt = (c, t) => {
    let x = st[c].base;
    for (const a of acts) if (a.c === c && a.type === "walk" && a.t + a.d <= t) x = a.to;
    return x;
  };
  for (const [sp, t0] of lines) {
    if (sc.noAutoFace) break;
    const present = actors.filter((a) => !a.extra && xAt(a.c, t0) > 150 && xAt(a.c, t0) < 1770 && a.c !== sp && !(sc.hidden || []).includes(a.c));
    const sx = xAt(sp, t0);
    for (const a of present) {
      if (walking(a.c, t0) || (sc.fixedFace || []).includes(a.c)) continue;
      const dx = sx - xAt(a.c, t0);
      if (Math.abs(dx) > 30) faceEvents.push({ type: "face", c: a.c, t: t0 - 0.25 + hash(a.x) * 0.3, dir: dx > 0 ? 1 : -1, auto: true });
    }
    if (present.length && !walking(sp, t0) && !(sc.fixedFace || []).includes(sp)) {
      const mx = present.reduce((s, a) => s + xAt(a.c, t0), 0) / present.length;
      if (Math.abs(mx - sx) > 30) faceEvents.push({ type: "face", c: sp, t: t0 - 0.15, dir: mx > sx ? 1 : -1, auto: true });
    }
  }
  const all = [...faceEvents, ...acts].sort((a, b) => a.t - b.t || (a.auto ? -1 : 1));

  for (const a of all) {
    const s = st[a.c];
    switch (a.type) {
      case "face": {
        if (s.flip === a.dir) break;
        s.flip = a.dir;
        add("to", sel(a.c, "flip"), { scaleX: a.dir, duration: 0.18, ease: "power2.inOut" }, a.t);
        break;
      }
      case "walk": {
        const dir = a.to > s.x ? 1 : -1;
        if (s.flip !== dir && !a.back) { s.flip = dir; add("to", sel(a.c, "flip"), { scaleX: dir, duration: 0.15, ease: "power2.out" }, a.t - 0.12); }
        add("to", sel(a.c), { x: a.to - s.base, duration: a.d, ease: a.ease || "none" }, a.t);
        const step = a.run ? 0.17 : 0.26, sw = a.run ? 26 : 17;
        const n = Math.max(2, Math.round(a.d / step));
        for (let i = 0; i < n; i++) {
          const t = a.t + i * (a.d / n), sg = i % 2 ? 1 : -1, dt = a.d / n;
          add("to", sel(a.c, "legL"), { rotation: sg * sw, duration: dt, ease: "sine.inOut" }, t);
          add("to", sel(a.c, "legR"), { rotation: -sg * sw, duration: dt, ease: "sine.inOut" }, t);
          if (!a.noArms) {
            add("to", sel(a.c, "armL"), { rotation: -sg * sw * 0.8, duration: dt, ease: "sine.inOut" }, t);
            add("to", sel(a.c, "armR"), { rotation: sg * sw * 0.8, duration: dt, ease: "sine.inOut" }, t);
          }
          add("to", sel(a.c, "flip"), { y: -6, duration: dt / 2, ease: "sine.out" }, t);
          add("to", sel(a.c, "flip"), { y: 0, duration: dt / 2, ease: "sine.in" }, t + dt / 2);
        }
        const te = a.t + a.d;
        add("to", sel(a.c, "legL"), { rotation: 0, duration: 0.18, ease: "power2.out" }, te);
        add("to", sel(a.c, "legR"), { rotation: 0, duration: 0.18, ease: "power2.out" }, te);
        if (!a.noArms) { add("to", sel(a.c, "armL"), { rotation: 0, duration: 0.25, ease: "power2.out" }, te); add("to", sel(a.c, "armR"), { rotation: 0, duration: 0.3, ease: "power2.out" }, te + 0.04); }
        s.x = a.to;
        break;
      }
      case "fall": {
        const dir = a.dir || 1;
        add("to", sel(a.c), { rotation: dir * 84, y: -26, duration: a.d || 0.5, ease: "power2.in" }, a.t);
        add("to", sel(a.c, "armL"), { rotation: -40 * dir, duration: 0.4, ease: "power2.out" }, a.t);
        add("to", sel(a.c, "armR"), { rotation: -70, duration: 0.4, ease: "power2.out" }, a.t + 0.05);
        add("to", sel(a.c, "eyes"), { scaleY: 0.12, duration: 0.1 }, a.t + 0.4);
        s.down = true;
        break;
      }
      case "rise": {
        add("to", sel(a.c, "eyes"), { scaleY: 1, duration: 0.12 }, a.t - 0.3);
        add("to", sel(a.c), { rotation: 0, y: 0, duration: a.d || 0.8, ease: "back.out(1.2)" }, a.t);
        add("to", sel(a.c, "armL"), { rotation: 0, duration: 0.6, ease: "power2.out" }, a.t + 0.2);
        add("to", sel(a.c, "armR"), { rotation: 0, duration: 0.6, ease: "power2.out" }, a.t + 0.3);
        s.down = false;
        break;
      }
      case "crouch": {
        add("to", sel(a.c), { rotation: 13 * s.flip, y: 26, duration: 0.45, ease: "power2.inOut" }, a.t);
        add("to", sel(a.c, "armR"), { rotation: a.reach ?? -30, duration: 0.45, ease: "power2.out" }, a.t + 0.1);
        add("to", sel(a.c, "head"), { rotation: 10, duration: 0.45, ease: "power2.out" }, a.t + 0.05);
        break;
      }
      case "stand": {
        add("to", sel(a.c), { rotation: 0, y: 0, duration: 0.5, ease: "power2.out" }, a.t);
        add("to", sel(a.c, "armR"), { rotation: 0, duration: 0.45, ease: "power2.out" }, a.t + 0.1);
        add("to", sel(a.c, "head"), { rotation: 0, duration: 0.4, ease: "power2.out" }, a.t);
        break;
      }
      case "wai": {
        add("to", sel(a.c, "armL"), { rotation: -38, duration: 0.4, ease: "power2.out" }, a.t);
        add("to", sel(a.c, "armR"), { rotation: -18, duration: 0.45, ease: "power2.out" }, a.t + 0.05);
        add("to", sel(a.c, "head"), { rotation: 14, duration: 0.5, ease: "power2.inOut" }, a.t + 0.25);
        add("to", sel(a.c), { rotation: 6 * s.flip, duration: 0.5, ease: "power2.inOut" }, a.t + 0.25);
        if (a.until) {
          add("to", sel(a.c, "head"), { rotation: 0, duration: 0.5, ease: "power2.inOut" }, a.until);
          add("to", sel(a.c), { rotation: 0, duration: 0.5, ease: "power2.inOut" }, a.until);
          add("to", sel(a.c, "armL"), { rotation: 0, duration: 0.5, ease: "power2.inOut" }, a.until + 0.1);
          add("to", sel(a.c, "armR"), { rotation: 0, duration: 0.5, ease: "power2.inOut" }, a.until + 0.15);
        }
        break;
      }
      case "arm":
        add("to", sel(a.c, a.side === "L" ? "armL" : "armR"), { rotation: a.to, duration: a.d ?? 0.35, ease: a.ease || "back.out(1.3)" }, a.t);
        break;
      case "head":
        add("to", sel(a.c, "head"), { rotation: a.to, duration: a.d ?? 0.4, ease: a.ease || "power2.inOut" }, a.t);
        break;
      case "eyes":
        add("to", sel(a.c, "eyes"), { scaleY: a.closed ? 0.12 : 1, duration: 0.15 }, a.t);
        break;
      case "item":
        add("to", sel(a.c, "item-" + a.name), { opacity: a.on ? 1 : 0, duration: 0.08 }, a.t);
        break;
      case "to": add("to", a.sel, a.vars, a.t); break;
      case "set": add("set", a.sel, a.vars, a.t); break;
    }
  }

  // talking: mouth flaps (closed during pauses), head nods, a default hand gesture
  let li = 0;
  for (const [sp, t0, t1] of lines) {
    li++;
    const step = 0.11;
    let i = 0;
    for (let t = t0; t < t1 - 0.05; t += step, i++) {
      const v = inSilence(t) ? 0.3 : (i % 2 ? 0.35 + hash(t * 31) * 0.25 : 0.75 + hash(t * 17) * 0.45);
      add("to", sel(sp, "mouth"), { scaleY: r2(v), duration: 0.07, ease: "power1.out" }, t);
    }
    add("to", sel(sp, "mouth"), { scaleY: 0.3, duration: 0.1 }, t1);
    if (!(sc.noNod || []).includes(sp)) {
      let k = 0;
      for (let t = t0 + 0.2; t < t1 - 0.4; t += 0.9 + hash(t) * 0.5, k++) {
        if (inSilence(t)) continue;
        add("to", sel(sp, "head"), { rotation: r2((k % 2 ? -1 : 1) * (2 + hash(t * 3) * 3)), duration: 0.45, ease: "sine.inOut" }, t);
      }
      add("to", sel(sp, "head"), { rotation: 0, duration: 0.4, ease: "sine.inOut" }, t1);
    }
    if (!busyArms(sp, t0, t1) && !st[sp].down && !walking(sp, t0 + 0.3)) {
      const side = hash(t0 * 7) > 0.35 ? "armR" : "armL";
      const ang = -(35 + hash(t0 * 13) * 35);
      add("to", sel(sp, side), { rotation: r2(ang), duration: 0.4, ease: "back.out(1.4)" }, t0 + 0.15);
      if (t1 - t0 > 3.5) {
        const mid = t0 + (t1 - t0) * 0.5;
        add("to", sel(sp, side), { rotation: r2(ang * 0.45), duration: 0.5, ease: "power2.inOut" }, mid - 0.3);
        add("to", sel(sp, side === "armR" ? "armL" : "armR"), { rotation: r2(-(25 + hash(t1) * 25)), duration: 0.45, ease: "back.out(1.3)" }, mid);
        add("to", sel(sp, side === "armR" ? "armL" : "armR"), { rotation: 0, duration: 0.45, ease: "power2.inOut" }, t1);
      }
      add("to", sel(sp, side), { rotation: 0, duration: 0.45, ease: "power2.inOut" }, t1 + 0.05);
    }
  }

  // blinks (skip while the eyes are closed on purpose or lying down)
  for (const a of actors) {
    if (a.extra === "static") continue;
    const closed = all.filter((e) => e.c === a.c && (e.type === "eyes" || e.type === "fall" || e.type === "rise"));
    const eyesShut = (t) => { let sh = a.eyes0 === "closed"; for (const e of closed) if (e.t <= t) sh = e.type === "eyes" ? e.closed : e.type === "fall"; return sh; };
    for (let t = T0 + 0.6 + hash(a.x + 1) * 2; t < sc.end - 0.3; t += 2.4 + hash(t) * 2.4) {
      if (eyesShut(t) || eyesShut(t + 0.2)) continue;
      add("to", sel(a.c, "eyes"), { scaleY: 0.1, duration: 0.06 }, t);
      add("to", sel(a.c, "eyes"), { scaleY: 1, duration: 0.08 }, t + 0.1);
    }
  }

  T.forEach((x) => (x[3] = Math.max(0, r2(x[3] - T0))));
  T.sort((a, b) => a[3] - b[3]);
  return T;
}

// ───────────────────────── HTML builders ─────────────────────────
function actorHTML(sid, a) {
  const s = a.scale || 1, w = 200 * s, h = 340 * s;
  const id = `${sid}-${a.c}`;
  const key = a.cast || a.c;
  const svg = actorSVG(key, id, a.items);
  return `<div id="${id}" class="actor" style="left:${a.x - w / 2}px;top:${FY - h + (a.dy || 0)}px;width:${w}px;height:${h}px;z-index:${a.z || 10}"><div id="${id}-flip" class="flip">${svg}</div></div>`;
}

const FONT_FACE = `
@font-face { font-family: "Kanit"; src: url("assets/fonts/Kanit-600.woff2") format("woff2"); font-weight: 600; unicode-range: U+0E01-0E5B, U+200C-200D, U+25CC; }
@font-face { font-family: "Kanit"; src: url("assets/fonts/Kanit-600-latin.woff2") format("woff2"); font-weight: 600; unicode-range: U+0000-00FF; }
@font-face { font-family: "Kanit"; src: url("assets/fonts/Kanit-400.woff2") format("woff2"); font-weight: 400; unicode-range: U+0E01-0E5B, U+200C-200D, U+25CC; }
@font-face { font-family: "Sarabun"; src: url("assets/fonts/Sarabun-500.woff2") format("woff2"); font-weight: 500; unicode-range: U+0E01-0E5B, U+200C-200D, U+25CC; }
@font-face { font-family: "Sarabun"; src: url("assets/fonts/Sarabun-500-latin.woff2") format("woff2"); font-weight: 500; unicode-range: U+0000-00FF; }`;

function sceneFile(sc) {
  const sid = sc.id;
  const tw = compileScene(sc);
  const actorsHTML = sc.actors.map((a) => actorHTML(sid, a)).join("\n    ");
  return `<template>
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: ${sc.ground || "#000"}; }
    #root .actor { position: absolute; }
    #root .flip { position: absolute; inset: 0; }
    #root .abs { position: absolute; }
    ${sc.css || ""}
  </style>
  <div id="root" data-composition-id="${sid}" data-width="${W}" data-height="${H}" data-layout-allow-overlap data-layout-allow-overflow>
    ${sc.back || ""}
    ${actorsHTML}
    ${sc.front || ""}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      const T = ${JSON.stringify(tw)};
      for (const [k, s, v, p] of T) { if (k === "set") tl.set(s, v, p); else tl.to(s, v, p); }
      ${sc.js ? sc.js.replace(/@(\d+(?:\.\d+)?)/g, (_, g) => String(r2(parseFloat(g) - sc.start))) : ""}
      tl.set({}, {}, ${r2(sc.end - sc.start)});
      window.__timelines["${sid}"] = tl;
    })();
  </script>
</template>
`;
}

// ───────────────────────── shared scenery ─────────────────────────
const floor = (col1, col2) => `<div class="abs" style="left:0;top:${FY - 150}px;width:${W}px;height:${H - FY + 150}px;background:linear-gradient(${col1},${col2});"></div>
    <div class="abs" style="left:0;top:${FY - 150}px;width:${W}px;height:${H}px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.07) 0 2px,transparent 2px 120px);"></div>`;
const shelf = (x) => `<svg class="abs" style="left:${x}px;top:200px" width="300" height="500" viewBox="0 0 300 500"><rect width="300" height="500" fill="#6b4226"/><rect x="12" y="12" width="276" height="476" fill="#4a2c18"/>${[0, 1, 2, 3, 4].map((r) => `<rect x="12" y="${100 + r * 95}" width="276" height="12" fill="#6b4226"/>` + Array.from({ length: 11 }, (_, i) => { const hh = 60 + hash(r * 11 + i + x) * 22, ww = 18 + hash(i * 3 + r + x) * 8; const cols = ["#8b2f2f", "#2f5b8b", "#3f7a3a", "#b3842f", "#5b3a7a", "#7a3a2a"]; return `<rect x="${20 + i * 24}" y="${100 + r * 95 - hh}" width="${ww}" height="${hh}" fill="${cols[(i + r) % 6]}"/>`; }).join("")).join("")}</svg>`;
const hut = (x) => `<svg class="abs" style="left:${x}px;top:250px" width="380" height="${FY - 230}" viewBox="0 0 380 ${FY - 230}"><path d="M-10,140 L190,10 L390,140 Z" fill="#8a5a2b"/><path d="M-10,140 L190,10 L390,140" stroke="#5a3a1a" stroke-width="8" fill="none"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${10 + i * 42},140 L190,14" stroke="rgba(0,0,0,.15)" stroke-width="3"/>`).join("")}<rect x="30" y="140" width="320" height="200" fill="#c99a5b"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${30 + i * 40}" y="140" width="4" height="200" fill="#9b7040"/>`).join("")}<rect x="150" y="190" width="80" height="150" fill="#5a3a1a"/><rect x="20" y="340" width="340" height="16" fill="#7a4a20"/>${[40, 170, 320].map((p) => `<rect x="${p}" y="356" width="18" height="${FY - 230 - 356}" fill="#6b4226"/>`).join("")}</svg>`;
const tree = (x, col = "#4f7a2e") => `<svg class="abs" style="left:${x}px;top:230px" width="320" height="${FY - 210}" viewBox="0 0 320 ${FY - 210}"><rect x="140" y="160" width="40" height="${FY - 370}" fill="#6b4226"/><circle cx="160" cy="130" r="120" fill="${col}"/><circle cx="90" cy="170" r="70" fill="${col}"/><circle cx="235" cy="165" r="75" fill="${col}"/><circle cx="130" cy="90" r="60" fill="rgba(255,255,255,.08)"/></svg>`;
const well = (x) => `<svg class="abs" style="left:${x - 110}px;top:${FY - 300}px" width="220" height="260" viewBox="0 0 220 260"><rect x="30" y="0" width="12" height="150" fill="#6b4226"/><rect x="178" y="0" width="12" height="150" fill="#6b4226"/><path d="M0,10 L110,-30 L220,10 Z" fill="#8a5a2b"/><rect x="40" y="60" width="140" height="6" fill="#5a3a1a"/><path d="M110,66 L110,110" stroke="#3a2a1a" stroke-width="3"/><rect x="98" y="108" width="24" height="22" fill="#7a5a3a"/><rect x="10" y="140" width="200" height="110" rx="10" fill="#8f8a80"/>${[0, 1, 2].map((r) => Array.from({ length: 5 }, (_, i) => `<rect x="${12 + i * 40 + (r % 2) * 20}" y="${145 + r * 35}" width="36" height="30" rx="4" fill="#a7a196" stroke="#7a756c"/>`).join("")).join("")}<ellipse cx="110" cy="142" rx="100" ry="14" fill="#2d3c4a"/></svg>`;
const childOnMat = (x, id) => `<svg id="${id}" class="abs" style="left:${x}px;top:${FY - 70}px;z-index:30" width="300" height="90" viewBox="0 0 300 90"><rect x="0" y="50" width="300" height="30" rx="6" fill="#d8b56a"/><g stroke="#b8933f" stroke-width="2">${Array.from({ length: 14 }, (_, i) => `<path d="M${10 + i * 21},52 L${10 + i * 21},78"/>`).join("")}</g><rect x="40" y="30" width="170" height="30" rx="14" fill="#c9a26a"/><path d="M60,26 L200,26 L210,48 L50,48 Z" fill="#8aa4b8"/><circle cx="234" cy="38" r="24" fill="#d9a273"/><path d="M226,36 L232,36 M242,35 L248,35" stroke="#2a1d16" stroke-width="2.5" stroke-linecap="round"/><path d="M233,48 Q238,45 243,48" stroke="#7a2626" stroke-width="2.5" fill="none"/><circle cx="246" cy="18" r="8" fill="#1e1611"/><path d="M252,22 Q262,18 258,32" stroke="#7fb3d9" stroke-width="3" fill="none" opacity=".7"/></svg>`;
const table = (x, w, top, id, extra = "") => `<svg ${id ? `id="${id}"` : ""} class="abs" style="left:${x}px;top:${top}px;z-index:20" width="${w}" height="${FY - top + 6}" viewBox="0 0 ${w} ${FY - top + 6}"><rect x="0" y="0" width="${w}" height="24" rx="4" fill="#7a4a24"/><rect x="0" y="22" width="${w}" height="10" fill="#5a3418"/><rect x="18" y="30" width="16" height="${FY - top - 24}" fill="#5a3418"/><rect x="${w - 34}" y="30" width="16" height="${FY - top - 24}" fill="#5a3418"/>${extra}</svg>`;
const sky = (a, b) => `<div class="abs" style="inset:0;background:linear-gradient(${a},${b});"></div>`;
const overlay = (id, bg, op = 0, z = 60, extra = "") => `<div id="${id}" class="abs" style="inset:0;background:${bg};opacity:${op};z-index:${z};pointer-events:none;${extra}"></div>`;
const spotlight = (id, x, op = 1, col = "rgba(255,236,190,.55)") => `<div id="${id}" class="abs" style="left:${x - 360}px;top:0;width:720px;height:${FY + 40}px;opacity:${op};z-index:5;background:radial-gradient(ellipse 260px 60px at 50% ${FY}px, ${col}, transparent 70%), linear-gradient(90deg, transparent 22%, ${col.replace(/[\d.]+\)$/, ".18)")} 45%, ${col.replace(/[\d.]+\)$/, ".18)")} 55%, transparent 78%);clip-path:polygon(43% 0,57% 0,82% 100%,18% 100%);"></div>`;

// ───────────────────────── the scenes ─────────────────────────
const S = [];

// 1 · prologue: the scripture's spirit opens the story
S.push({
  id: "prologue", start: 0, end: 14.3, ground: "#0b0910",
  back: `${floor("#1a1418", "#0e0b0d")}
    ${spotlight("prologue-spot", 960, 0)}
    <div id="prologue-glow" class="abs" style="left:860px;top:440px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle, rgba(255,214,120,.75), rgba(255,214,120,0) 70%);opacity:0;z-index:12"></div>`,
  front: overlay("prologue-dark", "#000", 0, 60),
  actors: [{ c: "narr", x: 960, items: { R: { book: 1 } }, armR: -30, z: 10 }],
  fixedFace: ["narr"],
  actions: [
    { type: "set", sel: "#prologue-narr", t: 0, vars: { opacity: 0 } },
    { type: "to", sel: "#prologue-spot", t: 0.4, vars: { opacity: 1, duration: 0.9, ease: "power2.inOut" } },
    { type: "to", sel: "#prologue-narr", t: 0.7, vars: { opacity: 1, duration: 1.0, ease: "power2.out" } },
    { type: "arm", c: "narr", t: 2.2, side: "L", to: -55, d: 0.6, ease: "power2.out" },
    { type: "arm", c: "narr", t: 7.6, side: "L", to: 0, d: 0.6, ease: "power2.inOut" },
    { type: "arm", c: "narr", t: 10.0, side: "R", to: -125, d: 0.8, ease: "power3.out" },
    { type: "to", sel: "#prologue-glow", t: 10.4, vars: { opacity: 1, scale: 1.25, duration: 1.2, ease: "power2.out" } },
    { type: "to", sel: "#prologue-dark", t: 13.6, vars: { opacity: 1, duration: 0.7, ease: "power2.in" } },
  ],
  js: `tl.set("#prologue-glow", { x: 120, y: -150, scale: .6 }, 0);`,
});

// 2 · hospital library, 2504 — and the storm
const ringSVG = `<svg id="lib-rings" class="abs" style="left:560px;top:250px;z-index:40;opacity:0" width="800" height="560" viewBox="-400 -280 800 560">${[60, 120, 180, 240, 300, 360].map((r, i) => `<ellipse cx="0" cy="0" rx="${r}" ry="${r * 0.55}" fill="none" stroke="${i % 2 ? "#8a6cff" : "#59c7ff"}" stroke-width="${8 - i}" stroke-dasharray="${40 + i * 12} ${18 + i * 6}"/>`).join("")}</svg>`;
S.push({
  id: "lib", start: 14.3, end: 41.5, ground: "#2a1c12",
  back: `${sky("#e9d6ad", "#d8be8c")}
    <div class="abs" style="left:0;top:560px;width:${W}px;height:200px;background:#8a5a32;"></div>
    ${shelf(260)}${shelf(1360)}
    <svg class="abs" style="left:880px;top:150px" width="160" height="200" viewBox="0 0 160 200"><path d="M80,0 L80,80" stroke="#3a2a1a" stroke-width="3"/><path d="M30,80 L130,80 L110,120 L50,120 Z" fill="#2f5b3a"/><ellipse cx="80" cy="128" rx="40" ry="10" fill="rgba(255,230,160,.8)"/></svg>
    ${floor("#9a6a3c", "#7a5030")}
    <div class="abs" style="left:1100px;top:250px;width:180px;height:130px;border:6px solid #4a2c18;background:linear-gradient(#cfe7f5,#a9d0e6);"></div>`,
  front: `${table(780, 380, 690, "lib-table", `<g id="lib-book" transform="translate(190 -14)"><rect x="-58" y="-6" width="116" height="20" rx="3" fill="#7a2a1a" stroke="#e3b84a" stroke-width="3"/><rect id="lib-cover" x="-58" y="-12" width="116" height="10" rx="2" fill="#9a3a22" stroke="#e3b84a" stroke-width="2"/></g>`)}
    <div id="lib-bookglow" class="abs" style="left:770px;top:480px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle, rgba(140,200,255,.9), rgba(120,110,255,0) 68%);opacity:0;z-index:35"></div>
    ${ringSVG}
    ${overlay("lib-storm", "radial-gradient(circle at 50% 60%, rgba(70,60,200,.25), rgba(20,10,60,.85))", 0, 34)}
    ${overlay("lib-dark", "#000", 1, 60)}
    ${overlay("lib-white", "#f4f1ff", 0, 61)}`,
  actors: [
    { c: "krong", x: 900, z: 9, flip: 1 },
    { c: "putt", x: 2050, z: 11, flip: -1 },
    { c: "wilai", x: -150, z: 12 },
    { c: "mantri", x: -300, z: 13 },
  ],
  actions: [
    { type: "to", sel: "#lib-dark", t: 14.3, vars: { opacity: 0, duration: 0.8, ease: "power2.out" } },
    { type: "walk", c: "putt", t: 14.4, to: 1290, d: 2.4, ease: "power1.out" },
    { type: "arm", c: "krong", t: 22.0, side: "R", to: -70, d: 0.4 },
    { type: "arm", c: "krong", t: 26.4, side: "R", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "walk", c: "wilai", t: 26.4, to: 400, d: 1.8, ease: "power1.out" },
    { type: "walk", c: "mantri", t: 26.9, to: 580, d: 2.1, ease: "power1.out" },
    { type: "arm", c: "wilai", t: 28.25, side: "R", to: -160, d: 0.3 },
    { type: "arm", c: "wilai", t: 28.6, side: "R", to: -135, d: 0.22, ease: "sine.inOut" },
    { type: "arm", c: "wilai", t: 28.85, side: "R", to: -165, d: 0.22, ease: "sine.inOut" },
    { type: "arm", c: "wilai", t: 29.1, side: "R", to: -135, d: 0.22, ease: "sine.inOut" },
    { type: "arm", c: "wilai", t: 29.35, side: "R", to: -165, d: 0.22, ease: "sine.inOut" },
    { type: "arm", c: "wilai", t: 29.9, side: "R", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "walk", c: "mantri", t: 31.4, to: 770, d: 1.5, ease: "power1.inOut" },
    { type: "arm", c: "mantri", t: 34.6, side: "R", to: -62, d: 0.5, ease: "power2.out" },
    { type: "to", sel: "#lib-cover", t: 35.2, vars: { rotation: -150, svgOrigin: "-58 -2", duration: 0.5, ease: "power2.out" } },
    { type: "to", sel: "#lib-bookglow", t: 35.3, vars: { opacity: 0.8, duration: 0.8, ease: "power2.out" } },
    { type: "arm", c: "krong", t: 37.05, side: "R", to: -95, d: 0.25, ease: "back.out(2)" },
    { type: "arm", c: "krong", t: 37.1, side: "L", to: -60, d: 0.3, ease: "back.out(2)" },
    { type: "to", sel: "#lib-storm", t: 38.4, vars: { opacity: 1, duration: 0.6, ease: "power2.inOut" } },
    { type: "to", sel: "#lib-bookglow", t: 38.4, vars: { opacity: 1, scale: 1.6, duration: 1.2, ease: "power2.out" } },
    { type: "to", sel: "#lib-rings", t: 38.5, vars: { opacity: 1, duration: 0.5 } },
    { type: "to", sel: "#lib-rings", t: 38.5, vars: { rotation: 260, scale: 1.25, duration: 2.8, ease: "power1.in" } },
    { type: "to", sel: "#lib-mantri", t: 38.7, vars: { rotation: -14, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 3 } },
    { type: "to", sel: "#lib-wilai", t: 38.8, vars: { rotation: 12, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3 } },
    { type: "to", sel: "#lib-krong", t: 38.75, vars: { rotation: 10, duration: 0.33, ease: "sine.inOut", yoyo: true, repeat: 3 } },
    { type: "to", sel: "#lib-putt", t: 38.9, vars: { rotation: -12, duration: 0.31, ease: "sine.inOut", yoyo: true, repeat: 3 } },
    { type: "fall", c: "mantri", t: 40.15, dir: -1 },
    { type: "fall", c: "wilai", t: 40.25, dir: -1 },
    { type: "fall", c: "krong", t: 40.35, dir: 1 },
    { type: "fall", c: "putt", t: 40.45, dir: 1 },
    { type: "to", sel: "#lib-white", t: 40.75, vars: { opacity: 1, duration: 0.6, ease: "power2.in" } },
  ],
});

// 3 · the village inside the scripture
const potSVG = (x, id) => `<svg class="abs" style="left:${x - 90}px;top:${FY - 150}px;z-index:28" width="180" height="170" viewBox="0 0 180 170"><g id="${id}-steam" opacity="0">${[0, 1, 2].map((i) => `<path d="M${60 + i * 30},40 Q${50 + i * 30},10 ${66 + i * 30},-20" stroke="rgba(255,255,255,.75)" stroke-width="8" fill="none" stroke-linecap="round"/>`).join("")}</g><ellipse cx="90" cy="150" rx="80" ry="14" fill="#5a3a1a"/><path d="M40,150 L70,110 M140,150 L110,110 M90,150 L90,108" stroke="#6b4226" stroke-width="10"/><path id="${id}-fire" d="M60,150 Q70,110 82,132 Q90,96 100,130 Q112,108 120,150 Z" fill="#ff8a2a" opacity=".9"/><path d="M30,60 Q30,120 90,120 Q150,120 150,60 Z" fill="#3a2a22"/><rect x="24" y="52" width="132" height="14" rx="6" fill="#4a3a30"/></svg>`;
S.push({
  id: "vil", start: 41.5, end: 79.0, ground: "#a8763f",
  back: `${sky("#f7dc9c", "#f0c06a")}
    <div class="abs" style="left:1260px;top:150px;width:150px;height:150px;border-radius:50%;background:#fff1c2;opacity:.9"></div>
    ${hut(170)}${tree(1460)}
    ${floor("#c99a5b", "#a8763f")}`,
  front: `${childOnMat(560, "vil-child")}${potSVG(1650, "vil-pot")}
    ${overlay("vil-white", "#f4f1ff", 1, 61)}
    ${overlay("vil-dark", "#000", 0, 60)}`,
  actors: [
    { c: "maeim", x: 500, z: 14, flip: 1 },
    { c: "putt", x: 1000, z: 12, rot0: 84, y0: -26, eyes0: "closed" },
    { c: "krong", x: 1110, z: 11, rot0: -84, y0: -26, eyes0: "closed", dy: -18 },
    { c: "wilai", x: 1300, z: 13, rot0: 84, y0: -26, eyes0: "closed", dy: 10 },
    { c: "mantri", x: 1560, z: 10, rot0: -84, y0: -26, eyes0: "closed", dy: -26 },
    { c: "thong", x: -150, z: 15 },
    { c: "phothap", x: 2050, z: 9, flip: -1, items: { L: { herbs: 0 } } },
    { c: "juk", x: 2180, z: 8, flip: -1, scale: 0.62 },
  ],
  hidden: ["phothap", "juk"],
  actions: [
    { type: "to", sel: "#vil-white", t: 41.5, vars: { opacity: 0, duration: 0.9, ease: "power2.out" } },
    { type: "crouch", c: "maeim", t: 41.5, reach: -20 },
    { type: "walk", c: "thong", t: 41.7, to: 640, d: 2.0, ease: "power1.out" },
    { type: "arm", c: "thong", t: 47.4, side: "R", to: -110, d: 0.5 },
    { type: "arm", c: "thong", t: 48.2, side: "R", to: -60, d: 0.6, ease: "power2.inOut" },
    { type: "rise", c: "putt", t: 44.3 },
    { type: "rise", c: "krong", t: 44.9 },
    { type: "rise", c: "wilai", t: 45.5 },
    { type: "rise", c: "mantri", t: 46.2 },
    { type: "walk", c: "mantri", t: 49.2, to: 2100, d: 2.4, ease: "power1.in" },
    { type: "arm", c: "thong", t: 53.3, side: "R", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "stand", c: "maeim", t: 53.4 },
    { type: "arm", c: "maeim", t: 53.9, side: "R", to: -80, d: 0.35 },
    { type: "arm", c: "maeim", t: 54.0, side: "L", to: -65, d: 0.35 },
    { type: "walk", c: "putt", t: 54.5, to: 880, d: 1.1, ease: "power1.inOut" },
    { type: "arm", c: "maeim", t: 55.4, side: "R", to: -15, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "maeim", t: 55.5, side: "L", to: -10, d: 0.5, ease: "power2.inOut" },
    { type: "face", c: "putt", t: 55.65, dir: -1 },
    { type: "crouch", c: "putt", t: 55.7, reach: -35 },
    { type: "to", sel: "#vil-child", t: 56.0, vars: { y: -2, duration: 0.8, ease: "sine.inOut", yoyo: true, repeat: 3 } },
    { type: "walk", c: "phothap", t: 59.5, to: 1460, d: 2.2, ease: "power1.out" },
    { type: "walk", c: "juk", t: 59.7, to: 1600, d: 2.3, ease: "power1.out" },
    { type: "arm", c: "phothap", t: 62.0, side: "R", to: -150, d: 0.5 },
    { type: "arm", c: "phothap", t: 64.5, side: "R", to: -70, d: 0.6, ease: "power2.inOut" },
    { type: "arm", c: "phothap", t: 66.0, side: "L", to: -55, d: 0.5 },
    { type: "arm", c: "phothap", t: 68.2, side: "R", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "phothap", t: 68.3, side: "L", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "stand", c: "putt", t: 68.5 },
    { type: "arm", c: "putt", t: 70.2, side: "R", to: -85, d: 0.4 },
    { type: "to", sel: "#vil-pot-steam", t: 70.4, vars: { opacity: 1, duration: 0.8 } },
    { type: "to", sel: "#vil-pot-steam", t: 70.4, vars: { y: -18, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 6 } },
    { type: "arm", c: "putt", t: 73.6, side: "R", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "item", c: "phothap", t: 74.4, name: "herbs", on: true },
    { type: "arm", c: "phothap", t: 74.3, side: "L", to: -95, d: 0.45 },
    { type: "arm", c: "phothap", t: 77.9, side: "L", to: -30, d: 0.5, ease: "power2.inOut" },
    { type: "to", sel: "#vil-dark", t: 78.2, vars: { opacity: 1, duration: 0.8, ease: "power2.in" } },
  ],
  js: `tl.to("#vil-pot-fire", { scaleY: 1.15, transformOrigin: "50% 100%", duration: .25, yoyo: true, repeat: 140, ease: "sine.inOut" }, 0);`,
});

// 4 · the plot in court physician Rerai's house
const bottles = `<g>${[[40, "#2a5a3a"], [80, "#5a2a6a"], [300, "#2a3a6a"], [330, "#6a2a2a"]].map(([bx, c]) => `<rect x="${bx}" y="-46" width="20" height="46" rx="5" fill="${c}"/><rect x="${bx + 6}" y="-56" width="8" height="12" fill="#3a3a3a"/>`).join("")}<ellipse cx="200" cy="-8" rx="46" ry="12" fill="#6b4a2a"/></g>`;
S.push({
  id: "plot", start: 79.0, end: 98.9, ground: "#1e0f1c",
  back: `${sky("#2a1230", "#3a1838")}
    ${[300, 1380].map((x) => `<div class="abs" style="left:${x}px;top:220px;width:220px;height:280px;background:linear-gradient(#3b2350,#24112e);border:10px solid #4a2a1e;"></div>`).join("")}
    <div class="abs" style="left:720px;top:180px;width:480px;height:90px;background:#4a2a1e;clip-path:polygon(0 100%,8% 0,92% 0,100% 100%);"></div>
    ${floor("#3a2030", "#24121c")}
    <div id="plot-spot" class="abs" style="inset:0;background:radial-gradient(ellipse 620px 520px at 50% 75%, rgba(220,60,120,.42), rgba(0,0,0,0) 70%);z-index:4"></div>`,
  front: `${table(800, 400, 700, "plot-table", `<g transform="translate(0 0)">${bottles}</g>`)}
    ${overlay("plot-dark", "#000", 1, 60)}
    ${overlay("plot-morning", "linear-gradient(#fff6d8,#ffe2a0)", 0, 61)}`,
  actors: [
    { c: "rerai", x: 700, z: 10, flip: 1 },
    { c: "mantri", x: 1260, z: 11, flip: -1, items: { R: { bottle: 1 } } },
    { c: "wilai", x: 2100, z: 12, flip: -1, items: { R: { bottle: 0 } } },
  ],
  hidden: ["wilai"],
  actions: [
    { type: "to", sel: "#plot-dark", t: 79.0, vars: { opacity: 0, duration: 1.0, ease: "power2.out" } },
    { type: "arm", c: "rerai", t: 80.9, side: "R", to: -150, d: 0.35, ease: "back.out(2)" },
    { type: "arm", c: "rerai", t: 82.7, side: "R", to: -40, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "rerai", t: 83.3, side: "L", to: -70, d: 0.4 },
    { type: "arm", c: "rerai", t: 85.7, side: "L", to: -150, d: 0.35, ease: "back.out(2)" },
    { type: "arm", c: "rerai", t: 87.4, side: "L", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "rerai", t: 87.5, side: "R", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "mantri", t: 88.2, side: "L", to: -60, d: 0.4 },
    { type: "arm", c: "mantri", t: 91.0, side: "L", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "walk", c: "wilai", t: 89.6, to: 1520, d: 1.8, ease: "power1.out" },
    { type: "face", c: "mantri", t: 92.0, dir: 1 },
    { type: "walk", c: "mantri", t: 92.2, to: 1340, d: 0.5, ease: "power1.inOut", noArms: true },
    { type: "arm", c: "mantri", t: 92.6, side: "R", to: -75, d: 0.3, ease: "power2.out" },
    { type: "arm", c: "wilai", t: 92.7, side: "R", to: -70, d: 0.3, ease: "power2.out" },
    { type: "item", c: "mantri", t: 93.05, name: "bottle", on: false },
    { type: "item", c: "wilai", t: 93.05, name: "bottle", on: true },
    { type: "arm", c: "mantri", t: 93.2, side: "R", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "arm", c: "mantri", t: 93.6, side: "L", to: -100, d: 0.35 },
    { type: "arm", c: "mantri", t: 95.0, side: "L", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "arm", c: "wilai", t: 93.5, side: "R", to: -30, d: 0.5, ease: "power2.inOut" },
    { type: "walk", c: "rerai", t: 95.3, to: -250, d: 2.4, ease: "power1.in" },
    { type: "walk", c: "mantri", t: 95.5, to: -250, d: 2.6, ease: "power1.in" },
    { type: "face", c: "wilai", t: 96.0, dir: -1 },
    { type: "arm", c: "wilai", t: 96.3, side: "L", to: -150, d: 0.4 },
    { type: "head", c: "wilai", t: 97.4, to: 12, d: 0.6 },
    { type: "to", sel: "#plot-spot", t: 96.0, vars: { opacity: 0.4, duration: 2 } },
    { type: "to", sel: "#plot-morning", t: 98.4, vars: { opacity: 1, duration: 0.5, ease: "power2.in" } },
  ],
  noNod: [],
});

// 5 · village yard, morning — the evidence
S.push({
  id: "evid", start: 98.9, end: 128.2, ground: "#a8763f",
  back: `${sky("#cfe7f3", "#f6e2a8")}
    ${hut(120)}${tree(1560, "#5c8a35")}
    ${floor("#c99a5b", "#a8763f")}
    ${well(980)}`,
  front: `${table(1150, 340, 720, "evid-table", `<g transform="translate(40 -8) rotate(-3)"><rect x="0" y="-6" width="250" height="14" fill="#efe1bb" stroke="#b39a62" stroke-width="2"/></g>`)}
    <svg id="evid-map" class="abs" style="left:1175px;top:610px;z-index:36;opacity:0" width="200" height="120" viewBox="0 0 300 180"><rect width="300" height="180" rx="8" fill="#efe1bb" stroke="#b39a62" stroke-width="4"/>${[[50, 50], [110, 120], [230, 60], [200, 140], [60, 130]].map(([x, y]) => `<rect x="${x - 12}" y="${y - 10}" width="24" height="20" fill="#8a5a2b"/><circle cx="${x}" cy="${y - 20}" r="8" fill="#c0392b"/>`).join("")}<circle cx="150" cy="90" r="18" fill="#2d6a9a" stroke="#1d3a5a" stroke-width="3"/>${[[50, 50], [110, 120], [230, 60], [200, 140], [60, 130]].map(([x, y]) => `<path d="M${x},${y} L150,90" stroke="#c0392b" stroke-width="3" stroke-dasharray="6 6"/>`).join("")}</svg>
    <div id="evid-inset" class="abs" style="left:1420px;top:140px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,#fff8e6,#f0d9a8);border:8px solid #e3b84a;z-index:45;opacity:0;box-shadow:0 10px 40px rgba(0,0,0,.35)">
      <svg viewBox="-60 -60 120 120" width="100%" height="100%"><path d="M-40,-10 Q-44,0 -40,10 L-40,40 Q-40,52 -28,52 L28,52 Q40,52 40,40 L40,10 Q44,0 40,-10 Z" fill="#141216"/><circle cx="0" cy="22" r="20" fill="#8b4bb3" stroke="#e3b84a" stroke-width="4"/><path d="M-9,22 L0,8 L9,22 L0,36 Z" fill="#e3b84a"/></svg>
    </div>
    ${overlay("evid-morning", "linear-gradient(#fff6d8,#ffe2a0)", 1, 61)}
    ${overlay("evid-dark", "#000", 0, 60)}`,
  actors: [
    { c: "krong", x: 560, z: 12, flip: 1 },
    { c: "putt", x: 1090, z: 10, flip: 1 },
    { c: "thong", x: 1440, z: 9, flip: -1, items: { R: { bottle: 0 } } },
    { c: "wilai", x: -200, z: 13, items: { R: { bottle: 1 } } },
  ],
  hidden: ["wilai"],
  actions: [
    { type: "to", sel: "#evid-morning", t: 98.9, vars: { opacity: 0, duration: 0.9, ease: "power2.out" } },
    { type: "face", c: "putt", t: 99.2, dir: 1 },
    { type: "to", sel: "#evid-map", t: 99.6, vars: { opacity: 1, duration: 0.4 } },
    { type: "arm", c: "putt", t: 99.6, side: "R", to: -40, d: 0.4 },
    { type: "face", c: "putt", t: 101.9, dir: -1 },
    { type: "arm", c: "putt", t: 102.0, side: "R", to: -95, d: 0.4 },
    { type: "arm", c: "putt", t: 104.4, side: "R", to: -50, d: 0.4, ease: "power2.inOut" },
    { type: "face", c: "putt", t: 104.3, dir: 1 },
    { type: "arm", c: "putt", t: 105.4, side: "R", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "to", sel: "#evid-map", t: 105.6, vars: { opacity: 0, duration: 0.4 } },
    { type: "eyes", c: "thong", t: 105.9, closed: true },
    { type: "wai", c: "thong", t: 105.9, until: 113.2 },
    { type: "eyes", c: "thong", t: 113.3, closed: false },
    { type: "walk", c: "wilai", t: 113.3, to: 360, d: 1.0, ease: "power2.out", run: true, noArms: true },
    { type: "arm", c: "wilai", t: 114.4, side: "R", to: -70, d: 0.4 },
    { type: "arm", c: "wilai", t: 117.2, side: "R", to: -20, d: 0.5, ease: "power2.inOut" },
    { type: "head", c: "wilai", t: 118.6, to: 14, d: 0.6 },
    { type: "head", c: "wilai", t: 120.4, to: 0, d: 0.5 },
    { type: "walk", c: "thong", t: 119.6, to: 760, d: 2.2, ease: "power1.inOut" },
    { type: "arm", c: "krong", t: 121.4, side: "L", to: -50, d: 0.4 },
    { type: "arm", c: "krong", t: 123.8, side: "L", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "face", c: "wilai", t: 122.0, dir: 1 },
    { type: "arm", c: "wilai", t: 122.3, side: "R", to: -75, d: 0.4 },
    { type: "face", c: "thong", t: 122.1, dir: -1 },
    { type: "arm", c: "thong", t: 122.4, side: "R", to: -70, d: 0.4 },
    { type: "item", c: "wilai", t: 123.0, name: "bottle", on: false },
    { type: "item", c: "thong", t: 123.0, name: "bottle", on: true },
    { type: "arm", c: "wilai", t: 123.2, side: "R", to: 0, d: 0.45, ease: "power2.inOut" },
    { type: "arm", c: "thong", t: 123.4, side: "R", to: -150, d: 0.4, ease: "power3.out" },
    { type: "to", sel: "#evid-thong-item-bottle", t: 123.85, vars: { rotation: 180, duration: 0.35, ease: "power2.inOut" } },
    { type: "to", sel: "#evid-inset", t: 124.4, vars: { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.6)" } },
    { type: "to", sel: "#evid-inset", t: 127.2, vars: { opacity: 0, scale: 0.85, duration: 0.25, ease: "power2.in" } },
    { type: "arm", c: "thong", t: 127.0, side: "R", to: -40, d: 0.4, ease: "power2.inOut" },
    { type: "to", sel: "#evid-dark", t: 127.6, vars: { opacity: 1, duration: 0.6, ease: "power2.in" } },
  ],
  js: `tl.set("#evid-inset", { scale: .6 }, 0);`,
});

// 6 · ceremony ground — judgement by the scripture
const letters = "กขคงจฉชซญฎฐณดตถทธนบปผพภมยรลวศษสหฬอฮ";
const letterRain = Array.from({ length: 34 }, (_, i) => {
  const x = 200 + hash(i * 5.3) * 1500, d = hash(i * 9.1);
  return `<div id="cer-l${i}" class="abs" style="left:${x.toFixed(0)}px;top:-80px;width:56px;height:68px;background:#f4ead2;border:2px solid #b39a62;border-radius:4px;font:600 40px/64px Kanit;color:#7a2a1a;text-align:center;z-index:42;opacity:0">${letters[i % letters.length]}</div>`;
}).join("");
S.push({
  id: "cer", start: 128.2, end: 160.8, ground: "#a8763f",
  back: `${sky("#f6e6b8", "#f0cf86")}
    <div id="cer-cloth" class="abs" style="left:520px;top:150px;width:880px;height:500px;background:#efe1bb;border:10px solid #8a5a2b;box-shadow:inset 0 0 40px rgba(120,80,30,.35);">
      ${Array.from({ length: 9 }, (_, i) => `<div style="position:absolute;left:60px;top:${40 + i * 50}px;width:${740 - (i % 3) * 60}px;height:10px;border-radius:5px;background:repeating-linear-gradient(90deg,#8a5a2b 0 26px,transparent 26px 38px);opacity:.55"></div>`).join("")}
    </div>
    <svg id="cer-sword" class="abs" style="left:780px;top:170px;z-index:3;opacity:0" width="360" height="460" viewBox="0 0 360 460"><g transform="rotate(28 180 230)" fill="rgba(20,10,10,.75)"><rect x="168" y="20" width="24" height="320" rx="6"/><path d="M160,20 L180,-20 L200,20 Z"/><rect x="120" y="336" width="120" height="20" rx="6"/><rect x="170" y="354" width="20" height="80" rx="6"/></g></svg>
    ${floor("#c99a5b", "#a8763f")}`,
  front: `<div id="cer-red" class="abs" style="inset:0;z-index:40;opacity:0;background:radial-gradient(circle at 50% 55%, rgba(255,40,40,.15), rgba(140,0,0,.65));"></div>
    <div id="cer-spin" class="abs" style="left:160px;top:-300px;width:1600px;height:1600px;z-index:41;opacity:0;background:conic-gradient(from 0deg, rgba(255,60,60,.0), rgba(255,60,60,.35) 10%, rgba(255,60,60,0) 20%, rgba(255,60,60,.35) 35%, rgba(255,60,60,0) 45%, rgba(255,60,60,.35) 60%, rgba(255,60,60,0) 70%, rgba(255,60,60,.35) 85%, rgba(255,60,60,0));border-radius:50%"></div>
    ${letterRain}
    ${overlay("cer-flash", "#000", 0, 59)}
    ${overlay("cer-dark", "#000", 1, 60)}`,
  actors: [
    { c: "vil1", x: 250, z: 3, dy: -40, scale: 0.86, flip: 1, extra: true },
    { c: "vil2", x: 1650, z: 3, dy: -40, scale: 0.86, flip: -1, extra: true },
    { c: "vil3", x: 1520, z: 2, dy: -55, scale: 0.8, flip: -1, extra: true },
    { c: "maeim", x: 1760, z: 4, dy: -30, scale: 0.9, flip: -1, extra: true },
    { c: "rerai", x: 360, z: 10, flip: 1 },
    { c: "mantri", x: 530, z: 11, flip: 1 },
    { c: "tasi", x: 720, z: 12, flip: -1 },
    { c: "putt", x: 930, z: 13, flip: -1, items: { R: { bottle: 1 } } },
    { c: "thong", x: 1110, z: 14, flip: -1, items: { R: { book: 1 } } },
    { c: "phothap", x: 1290, z: 13, flip: -1 },
    { c: "krong", x: 1440, z: 12, flip: -1 },
    { c: "wilai", x: 1580, z: 11, flip: -1 },
    { c: "guard1", x: -150, z: 15, flip: 1, items: { R: { spear: 1 } }, armR: -10 },
    { c: "guard2", x: -320, z: 15, flip: 1, items: { R: { spear: 1 } }, armR: -10 },
  ],
  fixedFace: ["thong", "phothap", "krong", "wilai"],
  hidden: ["guard1", "guard2"],
  actions: [
    { type: "to", sel: "#cer-dark", t: 128.2, vars: { opacity: 0, duration: 0.8, ease: "power2.out" } },
    { type: "arm", c: "putt", t: 129.5, side: "R", to: -155, d: 0.45, ease: "back.out(1.6)" },
    { type: "arm", c: "putt", t: 131.8, side: "R", to: -40, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "putt", t: 132.1, side: "L", to: -90, d: 0.35 },
    { type: "arm", c: "putt", t: 134.3, side: "L", to: 0, d: 0.45, ease: "power2.inOut" },
    { type: "arm", c: "putt", t: 134.4, side: "R", to: 0, d: 0.45, ease: "power2.inOut" },
    { type: "face", c: "tasi", t: 134.9, dir: -1 },
    { type: "arm", c: "tasi", t: 135.25, side: "R", to: -95, d: 0.25, ease: "back.out(2)" },
    { type: "arm", c: "tasi", t: 137.3, side: "L", to: -40, d: 0.4 },
    { type: "arm", c: "tasi", t: 138.4, side: "R", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "tasi", t: 138.5, side: "L", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "walk", c: "rerai", t: 138.9, to: 430, d: 0.4, ease: "power2.out" },
    { type: "face", c: "rerai", t: 139.3, dir: 1 },
    { type: "arm", c: "rerai", t: 139.1, side: "R", to: -165, d: 0.25, ease: "back.out(2)" },
    { type: "arm", c: "rerai", t: 140.1, side: "L", to: -160, d: 0.25, ease: "back.out(2)" },
    { type: "arm", c: "rerai", t: 140.6, side: "R", to: -130, d: 0.2 },
    { type: "arm", c: "rerai", t: 141.0, side: "R", to: -165, d: 0.2 },
    { type: "arm", c: "rerai", t: 142.9, side: "R", to: -20, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "rerai", t: 143.0, side: "L", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "head", c: "rerai", t: 144.0, to: 12, d: 0.8 },
    { type: "arm", c: "phothap", t: 145.2, side: "R", to: -70, d: 0.6, ease: "power2.out" },
    { type: "arm", c: "phothap", t: 148.6, side: "R", to: 0, d: 0.6, ease: "power2.inOut" },
    { type: "arm", c: "thong", t: 149.3, side: "R", to: -95, d: 0.6, ease: "power2.out" },
    { type: "to", sel: "#cer-thong-item-book", t: 149.7, vars: { scale: 1.35, duration: 0.4, ease: "back.out(2)" } },
    { type: "to", sel: "#cer-red", t: 151.2, vars: { opacity: 1, duration: 0.25 } },
    { type: "walk", c: "guard1", t: 151.4, to: 200, d: 1.4, ease: "power1.out", noArms: true },
    { type: "walk", c: "guard2", t: 151.6, to: 290, d: 1.5, ease: "power1.out", noArms: true },
    { type: "to", sel: "#cer-sword", t: 152.0, vars: { opacity: 1, duration: 0.4 } },
    { type: "walk", c: "rerai", t: 153.4, to: -260, d: 2.6, ease: "power1.in", back: false },
    { type: "walk", c: "guard1", t: 153.5, to: -400, d: 2.6, ease: "power1.in", noArms: true },
    { type: "walk", c: "guard2", t: 153.3, to: -150, d: 2.6, ease: "power1.in", noArms: true },
    { type: "to", sel: "#cer-flash", t: 156.3, vars: { opacity: 1, duration: 0.08 } },
    { type: "to", sel: "#cer-sword", t: 156.35, vars: { opacity: 0, duration: 0.05 } },
    { type: "to", sel: "#cer-flash", t: 156.75, vars: { opacity: 0, duration: 0.2 } },
    { type: "to", sel: "#cer-spin", t: 156.8, vars: { opacity: 1, duration: 0.3 } },
    { type: "walk", c: "mantri", t: 157.0, to: 900, d: 1.0, ease: "power2.out", run: true },
    { type: "arm", c: "mantri", t: 157.6, side: "R", to: -110, d: 0.3 },
    { type: "arm", c: "mantri", t: 157.65, side: "L", to: -95, d: 0.3 },
    { type: "to", sel: "#cer-mantri", t: 158.2, vars: { x: 1110 - 530, y: -280, scale: 0.05, rotation: 540, opacity: 0, duration: 1.3, ease: "power3.in" } },
    { type: "to", sel: "#cer-dark", t: 159.7, vars: { opacity: 1, duration: 0.8, ease: "power2.in" } },
  ],
  js: `tl.to("#cer-spin", { rotation: 360, duration: 3.4, ease: "none" }, @156.8);
      ${Array.from({ length: 34 }, (_, i) => `tl.fromTo("#cer-l${i}", { opacity: 0, y: 0, rotation: ${Math.round((hash(i) - 0.5) * 60)} }, { opacity: 1, y: ${Math.round(500 + hash(i * 3.7) * 600)}, rotation: ${Math.round((hash(i * 2.2) - 0.5) * 540)}, duration: ${(1.6 + hash(i * 1.3) * 1.2).toFixed(2)}, ease: "power1.in" }, ${r2(157.0 + hash(i * 7.7) * 1.2)} - 128.2);`).join("\n      ")}`,
});

// 7 · the portal home
S.push({
  id: "portal", start: 160.8, end: 182.3, ground: "#5a6e86",
  back: `${sky("#9fbcd6", "#d6e6f0")}
    <div id="portal-door" class="abs" style="left:660px;top:120px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle, #ffffff 0%, #eaf6ff 30%, rgba(160,210,255,.7) 55%, rgba(160,210,255,0) 72%);opacity:0;z-index:2"></div>
    <svg id="portal-rings" class="abs" style="left:660px;top:120px;z-index:3;opacity:0" width="600" height="600" viewBox="-300 -300 600 600">${[150, 200, 250].map((r, i) => `<circle r="${r}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="${6 - i * 1.5}" stroke-dasharray="${30 + i * 20} ${20 + i * 10}"/>`).join("")}</svg>
    ${floor("#8aa0b6", "#5a6e86")}`,
  front: `${overlay("portal-dark", "#000", 1, 60)}
    <div id="portal-wash" class="abs" style="inset:0;z-index:50;opacity:0;background:radial-gradient(circle at 50% 40%, rgba(255,255,255,.95), rgba(255,255,255,.4) 60%, rgba(255,255,255,0));"></div>`,
  actors: [
    { c: "thong", x: 360, z: 12, flip: 1 },
    { c: "phothap", x: 560, z: 13, flip: 1, items: { R: { bundle: 1 } }, armR: -20 },
    { c: "putt", x: 960, z: 14, flip: -1, items: { R: { bundle: 0 } } },
    { c: "krong", x: 1180, z: 13, flip: -1 },
    { c: "wilai", x: 1360, z: 12, flip: -1 },
    { c: "maeim", x: 1600, z: 10, flip: -1, dy: -20, scale: 0.92, extra: true },
    { c: "juk", x: 1720, z: 11, flip: -1, scale: 0.62, extra: true },
  ],
  fixedFace: ["krong", "wilai"],
  actions: [
    { type: "to", sel: "#portal-dark", t: 160.8, vars: { opacity: 0, duration: 1.0, ease: "power2.out" } },
    { type: "to", sel: "#portal-door", t: 161.0, vars: { opacity: 1, scale: 1, duration: 1.4, ease: "expo.out" } },
    { type: "to", sel: "#portal-rings", t: 161.2, vars: { opacity: 1, duration: 0.8 } },
    { type: "to", sel: "#portal-rings", t: 161.2, vars: { rotation: 200, duration: 21, ease: "none" } },
    { type: "walk", c: "phothap", t: 161.9, to: 760, d: 1.2, ease: "power1.out", noArms: true },
    { type: "arm", c: "phothap", t: 163.2, side: "R", to: -70, d: 0.5, ease: "power2.out" },
    { type: "arm", c: "putt", t: 163.5, side: "R", to: -65, d: 0.5, ease: "power2.out" },
    { type: "item", c: "phothap", t: 164.2, name: "bundle", on: false },
    { type: "item", c: "putt", t: 164.2, name: "bundle", on: true },
    { type: "arm", c: "phothap", t: 164.4, side: "R", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "putt", t: 164.5, side: "R", to: -25, d: 0.5, ease: "power2.inOut" },
    { type: "arm", c: "phothap", t: 166.0, side: "L", to: -60, d: 0.5 },
    { type: "arm", c: "phothap", t: 169.9, side: "L", to: 0, d: 0.5, ease: "power2.inOut" },
    { type: "item", c: "putt", t: 171.1, name: "bundle", on: false },
    { type: "wai", c: "putt", t: 171.2, until: 175.0 },
    { type: "arm", c: "thong", t: 177.3, side: "R", to: -80, d: 0.4 },
    { type: "arm", c: "thong", t: 180.6, side: "R", to: 0, d: 0.4, ease: "power2.inOut" },
    { type: "head", c: "krong", t: 178.6, to: 14, d: 0.5 },
    { type: "head", c: "krong", t: 180.6, to: 0, d: 0.5 },
    { type: "item", c: "putt", t: 175.3, name: "bundle", on: true },
    { type: "face", c: "putt", t: 180.9, dir: 1 },
    { type: "to", sel: "#portal-putt", t: 181.0, vars: { y: -70, scale: 0.6, opacity: 0, duration: 1.3, ease: "power2.in" } },
    { type: "to", sel: "#portal-krong", t: 181.1, vars: { x: -180, y: -70, scale: 0.6, opacity: 0, duration: 1.3, ease: "power2.in" } },
    { type: "to", sel: "#portal-wilai", t: 181.2, vars: { x: -360, y: -70, scale: 0.6, opacity: 0, duration: 1.3, ease: "power2.in" } },
    { type: "to", sel: "#portal-wash", t: 181.2, vars: { opacity: 1, duration: 0.6, ease: "power2.in" } },
    { type: "to", sel: "#portal-dark", t: 181.7, vars: { opacity: 1, duration: 0.6, ease: "power2.in" } },
  ],
  js: `tl.set("#portal-door", { scale: .15 }, 0);`,
});

// 8 · epilogue
S.push({
  id: "epi", start: 182.3, end: 191, ground: "#0b0910",
  back: `${floor("#1a1418", "#0e0b0d")}
    ${spotlight("epi-spot", 960, 0)}
    <div id="epi-glow" class="abs" style="left:900px;top:330px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle, rgba(255,214,120,.7), rgba(255,214,120,0) 70%);opacity:0;z-index:12"></div>`,
  actors: [{ c: "narr", x: 960, items: { R: { book: 1 } }, armR: -30 }],
  fixedFace: ["narr"],
  actions: [
    { type: "set", sel: "#epi-narr", t: 182.3, vars: { opacity: 0 } },
    { type: "to", sel: "#epi-spot", t: 182.3, vars: { opacity: 1, duration: 0.5 } },
    { type: "to", sel: "#epi-narr", t: 182.35, vars: { opacity: 1, duration: 0.5 } },
    { type: "arm", c: "narr", t: 182.6, side: "L", to: -40, d: 0.6, ease: "power2.out" },
    { type: "arm", c: "narr", t: 183.6, side: "R", to: -120, d: 0.8, ease: "power2.out" },
    { type: "to", sel: "#epi-glow", t: 184.0, vars: { opacity: 1, duration: 1 } },
    { type: "arm", c: "narr", t: 186.5, side: "L", to: 0, d: 0.6, ease: "power2.inOut" },
    { type: "arm", c: "narr", t: 186.6, side: "R", to: -30, d: 0.6, ease: "power2.inOut" },
    { type: "wai", c: "narr", t: 187.6 },
  ],
});

// ───────────────────────── frame (proscenium + curtains + end card) ─────────────────────────
const folds = (c1, c2) => `repeating-linear-gradient(90deg, ${c1} 0 30px, ${c2} 30px 60px, ${c1} 60px 90px)`;
const frameFile = `<template>
  <style>
    ${FONT_FACE}
    #root { position: absolute; inset: 0; pointer-events: none; }
    #root .abs { position: absolute; }
    #root .fold { background: ${folds("#8e1218", "#6a0c12")}; box-shadow: inset 0 -30px 60px rgba(0,0,0,.35); }
  </style>
  <div id="root" data-composition-id="frame" data-width="${W}" data-height="${H}" data-layout-allow-overlap data-layout-allow-overflow>
    <div id="fr-cl" class="abs fold" style="left:0;top:0;width:${W / 2 + 10}px;height:${FY + 50}px;z-index:1"></div>
    <div id="fr-cr" class="abs fold" style="left:${W / 2 - 10}px;top:0;width:${W / 2 + 10}px;height:${FY + 50}px;z-index:1"></div>
    <div class="abs fold" style="left:0;top:0;width:170px;height:${FY + 50}px;z-index:2;border-right:6px solid #4a070b"></div>
    <div class="abs fold" style="left:${W - 170}px;top:0;width:170px;height:${FY + 50}px;z-index:2;border-left:6px solid #4a070b"></div>
    <div class="abs" style="left:0;top:0;width:${W}px;height:96px;z-index:3;background:${folds("#9c151c", "#74101a")};border-bottom:10px solid #d9a441;"></div>
    <div class="abs" style="left:0;top:104px;width:${W}px;height:22px;z-index:3;background:radial-gradient(circle at 30px 0, #9c151c 28px, transparent 29px) 0 0/60px 22px repeat-x;"></div>
    <div class="abs" style="left:0;top:${FY + 14}px;width:${W}px;height:36px;z-index:3;background:linear-gradient(#6b4226,#3a2414);border-top:4px solid #d9a441;"></div>
    <div class="abs" style="left:0;top:${FY + 50}px;width:${W}px;height:${H - FY - 50}px;z-index:3;background:linear-gradient(#1a1010,#0a0606);"></div>
    <div id="fr-end" class="abs" style="left:360px;top:300px;width:1200px;height:360px;z-index:4;opacity:0;text-align:center;color:#f3d27a;">
      <div style="font:600 128px/1.2 Kanit;text-shadow:0 6px 24px rgba(0,0,0,.6)">จบบริบูรณ์</div>
      <div style="font:400 40px/1.6 Kanit;color:#f6ead0;margin-top:10px">ยาที่ดีที่สุด อยู่ในหัวใจของหมอที่ปราศจากอคติ</div>
      <div style="font:400 30px/1.6 Kanit;color:#d9c9a6;margin-top:6px">คัมภีร์ฉันทศาสตร์ แพทย์ศาสตร์สงเคราะห์</div>
    </div>
    <div id="fr-title" class="abs" style="left:360px;top:330px;width:1200px;height:260px;z-index:4;opacity:0;text-align:center;color:#f3d27a;">
      <div style="font:600 104px/1.2 Kanit;text-shadow:0 6px 24px rgba(0,0,0,.6)">คัมภีร์ฉันทศาสตร์</div>
      <div style="font:400 44px/1.6 Kanit;color:#f6ead0">แพทย์ศาสตร์สงเคราะห์</div>
    </div>
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      tl.set("#fr-cl", { x: 0, scaleX: 1, transformOrigin: "0% 50%" }, 0);
      tl.set("#fr-cr", { x: 0, scaleX: 1, transformOrigin: "100% 50%" }, 0);
      tl.set("#fr-title", { opacity: 1 }, 0);
      tl.to("#fr-title", { opacity: 0, filter: "blur(8px)", duration: 0.3, ease: "power2.in" }, 1.6);
      tl.to("#fr-cl", { scaleX: 0.16, duration: 1.8, ease: "power2.inOut" }, 1.7);
      tl.to("#fr-cr", { scaleX: 0.16, duration: 1.8, ease: "power2.inOut" }, 1.7);
      tl.to("#fr-cl", { scaleX: 1, duration: 1.8, ease: "power2.inOut" }, 187.5);
      tl.to("#fr-cr", { scaleX: 1, duration: 1.8, ease: "power2.inOut" }, 187.5);
      tl.fromTo("#fr-end", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }, 189.1);
      tl.set({}, {}, ${TOTAL});
      window.__timelines["frame"] = tl;
    })();
  </script>
</template>
`;

// ───────────────────────── captions ─────────────────────────
const NAME_COL = { narr: "#f3d27a", putt: "#9cc7ff", krong: "#7fd6cf", wilai: "#ffadc9", mantri: "#ff8a8a", thong: "#ffb766", phothap: "#d8c39a", rerai: "#c9a0ff", maeim: "#d6c6b0", tasi: "#c6d68a" };
const subsFile = `<template>
  <style>
    ${FONT_FACE}
    #root { position: absolute; inset: 0; pointer-events: none; }
    #root .cap { position: absolute; left: 192px; width: 1536px; top: ${FY + 58}px; height: 64px; text-align: center; }
    #root .cap span.in { display: inline-block; font: 500 38px/60px Sarabun; color: #fbf6ea; white-space: nowrap; }
    #root .cap b { font: 600 36px/60px Kanit; margin-right: 14px; }
  </style>
  <div id="root" data-composition-id="subs" data-width="${W}" data-height="${H}">
${LINES.map(([c, a, b, txt], i) => `    <div id="cap${i}" class="cap clip" data-start="${a}" data-duration="${r2(b - a + 0.35)}" data-track-index="0"><span id="cap${i}-in" class="in"><b style="color:${NAME_COL[c]}">${NAMES[c]}</b>${txt}</span></div>`).join("\n")}
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
${LINES.map(([c, a, b], i) => `      tl.fromTo("#cap${i}-in", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.15, ease: "power2.out" }, ${a});\n      tl.to("#cap${i}-in", { opacity: 0, duration: 0.15, ease: "power2.in" }, ${r2(b + 0.15)});`).join("\n")}
      tl.set({}, {}, ${TOTAL});
      window.__timelines["subs"] = tl;
    })();
  </script>
</template>
`;

// ───────────────────────── index ─────────────────────────
const host = (id, start, dur, z, kind = "graphics") =>
  `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${start}" data-duration="${r2(dur)}" data-track-index="${z}" data-track-kind="${kind}" data-width="${W}" data-height="${H}" style="z-index:${z}"></div>`;
const index = `<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>คัมภีร์ฉันทศาสตร์</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
${S.map((s) => host(s.id, s.start, s.end - s.start, 1)).join("\n")}
${host("frame", 0, TOTAL, 5)}
${host("subs", 0, TOTAL, 10, "captions")}
      <audio id="voice" class="clip" src="assets/audio/voice.mp3" data-start="0" data-track-index="20" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

mkdirSync(join(ROOT, "compositions"), { recursive: true });
writeFileSync(join(ROOT, "index.html"), index);
for (const s of S) writeFileSync(join(ROOT, "compositions", s.id + ".html"), sceneFile(s));
writeFileSync(join(ROOT, "compositions", "frame.html"), frameFile);
writeFileSync(join(ROOT, "compositions", "subs.html"), subsFile);
console.log("wrote", S.length + 2, "compositions");
