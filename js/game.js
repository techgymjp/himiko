import { PROVINCES, buildNeighbors } from './map.js';
import { sound } from './audio.js';

// ---------- 定数 ----------
const TREASURES = [
  { id: 'magatama', name: '勾玉' },
  { id: 'kinin', name: '金印' },
  { id: 'kagami', name: '銅鏡' },
  { id: 'nishiki', name: '錦' },
  { id: 'katana', name: '刀' },
  { id: 'shinju', name: '真珠' },
  { id: 'dotaku', name: '銅鐸' },
  { id: 'kudatama', name: '管玉' },
];
const KANJI = ['', '一', '二', '三', '四', '五', '六'];
const LEVEL_NAME = { 6: '易', 9: '中', 12: '難' };
const S = 30; // 六角形の半径
const W = Math.sqrt(3) * S;
const NEIGHBORS = buildNeighbors(PROVINCES);
const SVGNS = 'http://www.w3.org/2000/svg';

const $ = (id) => document.getElementById(id);
const board = $('board');
const wrap = $('board-wrap');

// ---------- 状態 ----------
const st = {
  mines: 9,
  tries: 1,
  state: 'ready', // ready | play | busy | over | won
  cells: [], // {treasure: null|treasureObj, open, flag, n}
  mode: 'dig',
  startTime: 0,
  elapsed: 0,
  timer: null,
  treasureSet: [],
};
let tileEls = [];

// ---------- 保存（使えない環境でも動くように） ----------
const store = {
  get(k, d) {
    try { const v = localStorage.getItem('yamatai:' + k); return v === null ? d : JSON.parse(v); } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('yamatai:' + k, JSON.stringify(v)); } catch { /* noop */ }
  },
};

// ---------- 盤面の描画 ----------
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
const px = (p) => [(p.c * W) / 2, p.r * 1.5 * S];

function hexPoints(r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

let layers = {};
function buildBoard() {
  board.innerHTML = '';
  const xs = PROVINCES.map((p) => px(p)[0]);
  const ys = PROVINCES.map((p) => px(p)[1]);
  const pad = 14;
  const minX = Math.min(...xs) - W / 2 - pad;
  const maxX = Math.max(...xs) + W / 2 + pad;
  const minY = Math.min(...ys) - S - pad;
  const maxY = Math.max(...ys) + S + pad;
  board.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
  board.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // 海（青海波）
  const defs = el('defs', {}, board);
  const pat = el('pattern', { id: 'seigaiha', width: 40, height: 20, patternUnits: 'userSpaceOnUse' }, defs);
  for (const [cx, cy] of [[0, 20], [40, 20], [20, 10], [0, 0], [40, 0]]) {
    for (const r of [19, 14, 9]) {
      el('circle', { cx, cy, r, fill: 'none', stroke: '#9fc3d6', 'stroke-width': 1, opacity: 0.13 }, pat);
    }
  }
  // 画面の余白まで海が続くように大きめに敷く
  const big = { x: minX - 2000, y: minY - 2000, width: maxX - minX + 4000, height: maxY - minY + 4000 };
  el('rect', { ...big, fill: '#1d3b4f' }, board);
  el('rect', { ...big, fill: 'url(#seigaiha)' }, board);

  // 装飾：海の名と方位
  const t1 = el('text', { x: (7 * W) / 2, y: 13 * 1.5 * S, class: 'sea-label', 'text-anchor': 'middle' }, board);
  t1.textContent = '倭 の 海';
  const comp = el('g', { transform: `translate(${(22 * W) / 2}, ${11 * 1.5 * S})`, opacity: 0.75 }, board);
  el('circle', { r: 26, fill: 'none', stroke: '#d4a437', 'stroke-width': 1.5 }, comp);
  el('path', { d: 'M0-24L6 0 0 24-6 0z', fill: '#d4a437' }, comp);
  el('path', { d: 'M0-24L6 0H-6z', fill: '#c0392b' }, comp);
  const nT = el('text', { y: -32, 'text-anchor': 'middle', fill: '#f3e6c8', 'font-size': 13, 'font-weight': 700 }, comp);
  nT.textContent = '北';
  const cart = el('g', { transform: `translate(${(18 * W) / 2}, ${10.4 * 1.5 * S})` }, board);
  el('rect', { x: -40, y: -16, width: 80, height: 32, rx: 4, fill: '#2a1d14cc', stroke: '#d4a437' }, cart);
  const ct = el('text', { y: 6, 'text-anchor': 'middle', fill: '#f3e6c8', 'font-size': 15, 'font-weight': 800, 'letter-spacing': 3 }, cart);
  ct.textContent = '邪馬台国';

  // 眠るお宝（凡例）
  layers.legend = el('g', { transform: `translate(${(-4.5 * W) / 2}, ${1.0 * 1.5 * S})` }, board);

  layers.tiles = el('g', {}, board);
  layers.fx = el('g', { class: 'fly' }, board);

  tileEls = PROVINCES.map((p, i) => {
    const [x, y] = px(p);
    const g = el('g', { class: 'tile', transform: `translate(${x.toFixed(2)},${y.toFixed(2)})`, tabindex: 0, role: 'gridcell', 'data-i': i, 'aria-label': `${p.name}（${p.kana}）` }, layers.tiles);
    const body = el('g', { class: 'body' }, g);
    el('polygon', { class: 'hex', points: hexPoints(S - 1.2) }, body);
    const name = el('text', { class: 'name', y: 4 }, body);
    name.textContent = p.name;
    const num = el('text', { class: 'num', y: 13 }, body);
    el('use', { class: 'icon', href: '#i-magatama', x: -17, y: -17, width: 34, height: 34 }, body);
    el('use', { class: 'flag', href: '#i-mark', x: -15, y: -15, width: 30, height: 30 }, body);
    const title = el('title', {}, g);
    title.textContent = `${p.name}（${p.kana}）・${p.region}`;
    return { g, body, name, num, icon: body.querySelector('.icon') };
  });
}

function drawLegend() {
  const g = layers.legend;
  g.innerHTML = '';
  const t = el('text', { class: 'legend-title', x: 0, y: 0 }, g);
  t.textContent = `眠るお宝 ${st.mines}`;
  const counts = new Map();
  st.cells.forEach((c) => c.treasure && counts.set(c.treasure.id, (counts.get(c.treasure.id) || 0) + 1));
  const list = TREASURES.filter((tr) => counts.has(tr.id));
  list.forEach((tr, k) => {
    const col = k % 4;
    const row = Math.floor(k / 4);
    const item = el('g', { class: 'legend-item', 'data-id': tr.id, transform: `translate(${col * 68}, ${18 + row * 58})` }, g);
    el('use', { class: 'legend-icon', href: `#i-${tr.id}`, x: 0, y: 0, width: 34, height: 34 }, item);
    const n = el('text', { class: 'legend-name', x: 17, y: 48, 'text-anchor': 'middle' }, item);
    n.textContent = tr.name + (counts.get(tr.id) > 1 ? `×${counts.get(tr.id)}` : '');
  });
}

// ---------- ゲーム進行 ----------
function newBoard() {
  st.cells = PROVINCES.map(() => ({ treasure: null, open: false, flag: false, n: 0 }));
  st.state = 'ready';
  tileEls.forEach((t) => {
    t.g.setAttribute('class', 'tile');
    t.num.textContent = '';
    t.name.setAttribute('y', 4);
  });
  // 埋めるお宝の種類だけ先に決める（場所は最初のひと掘りで決定）
  st.treasureSet = [];
  for (let i = 0; i < st.mines; i++) st.treasureSet.push(TREASURES[i % TREASURES.length]);
  // 凡例用の仮の配置
  st.treasureSet.forEach((tr, i) => (st.cells[i].treasure = tr));
  drawLegend();
  st.cells.forEach((c) => (c.treasure = null));
  updateStats();
}

function bury(safeIndex) {
  // 最初に掘った国とそのとなりにはお宝を置かない
  const forbid = new Set([safeIndex, ...NEIGHBORS[safeIndex]]);
  let candidates = PROVINCES.map((_, i) => i).filter((i) => !forbid.has(i));
  if (candidates.length < st.mines) candidates = PROVINCES.map((_, i) => i).filter((i) => i !== safeIndex);
  shuffle(candidates);
  const items = shuffle([...st.treasureSet]);
  candidates.slice(0, st.mines).forEach((ci, k) => (st.cells[ci].treasure = items[k]));
  st.cells.forEach((c, i) => (c.n = NEIGHBORS[i].filter((j) => st.cells[j].treasure).length));
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startTimer() {
  if (st.timer) return;
  st.startTime = performance.now() - st.elapsed;
  st.timer = setInterval(() => {
    st.elapsed = performance.now() - st.startTime;
    updateStats();
  }, 250);
}
function stopTimer() {
  clearInterval(st.timer);
  st.timer = null;
}
const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function updateStats() {
  const flags = st.cells.filter((c) => c.flag).length;
  $('st-left').textContent = Math.max(0, st.mines - flags);
  $('st-try').textContent = `${st.tries}回目`;
  $('st-time').textContent = fmt(st.elapsed);
}

function dig(i) {
  const c = st.cells[i];
  if (st.state === 'ready') {
    bury(i);
    st.state = 'play';
    startTimer();
  }
  if (st.state !== 'play' || c.flag) return;
  if (c.open) return chord(i);
  if (c.treasure) return mistake(i);

  const opened = floodOpen(i);
  if (opened.length > 1) sound.play('cascade', opened.length);
  else sound.play('open', c.n);
  checkWin();
}

// 数字の国を押したとき：印の数が合えばまわりを一気に掘る
function chord(i) {
  const c = st.cells[i];
  if (c.n === 0) return;
  const nb = NEIGHBORS[i];
  const flags = nb.filter((j) => st.cells[j].flag).length;
  const closed = nb.filter((j) => !st.cells[j].open && !st.cells[j].flag);
  if (flags !== c.n || closed.length === 0) {
    sound.play('deny');
    return;
  }
  const hit = closed.find((j) => st.cells[j].treasure);
  if (hit !== undefined) return mistake(hit);
  let total = 0;
  closed.forEach((j) => (total += floodOpen(j).length));
  sound.play(total > 1 ? 'cascade' : 'open', total > 1 ? total : st.cells[closed[0]].n);
  checkWin();
}

function floodOpen(start) {
  const opened = [];
  const queue = [[start, 0]];
  const seen = new Set([start]);
  while (queue.length) {
    const [i, depth] = queue.shift();
    const c = st.cells[i];
    if (c.open || c.flag || c.treasure) continue;
    c.open = true;
    opened.push(i);
    renderOpen(i, depth);
    if (c.n === 0) {
      for (const j of NEIGHBORS[i]) {
        if (!seen.has(j)) {
          seen.add(j);
          queue.push([j, depth + 1]);
        }
      }
    }
  }
  return opened;
}

function renderOpen(i, depth = 0) {
  const t = tileEls[i];
  const c = st.cells[i];
  setTimeout(() => {
    t.g.setAttribute('class', `tile open pop n${c.n}`);
    t.num.textContent = KANJI[c.n];
    t.name.setAttribute('y', c.n ? -9 : 4);
    t.g.setAttribute('aria-label', `${PROVINCES[i].name} ${c.n ? 'となりのお宝 ' + c.n : 'お宝なし'}`);
  }, depth * 45);
}

function toggleFlag(i) {
  if (st.state !== 'play' && st.state !== 'ready') return;
  const c = st.cells[i];
  if (c.open) return;
  c.flag = !c.flag;
  tileEls[i].g.classList.toggle('flagged', c.flag);
  sound.play(c.flag ? 'flag' : 'unflag');
  if (navigator.vibrate) navigator.vibrate(c.flag ? 18 : 8);
  updateStats();
}

function checkWin() {
  const safe = st.cells.filter((c) => !c.treasure).length;
  const opened = st.cells.filter((c) => c.open).length;
  if (opened === safe) win();
}

// ---------- 演出：まちがい → 振り出し ----------
function mistake(i) {
  st.state = 'busy';
  const c = st.cells[i];
  const t = tileEls[i];
  t.icon.setAttribute('href', `#i-${c.treasure.id}`);
  t.g.setAttribute('class', 'tile treasure boom');
  sound.play('mistake');
  if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
  wrap.classList.remove('shake');
  void wrap.offsetWidth;
  wrap.classList.add('shake');

  // ほかのお宝も姿を現す
  const others = st.cells.map((x, k) => k).filter((k) => k !== i && st.cells[k].treasure);
  setTimeout(() => {
    others.forEach((k, n) => {
      setTimeout(() => {
        const tt = tileEls[k];
        tt.icon.setAttribute('href', `#i-${st.cells[k].treasure.id}`);
        tt.g.setAttribute('class', 'tile treasure');
        sound.play('reveal', n);
      }, n * 90);
    });
    st.cells.forEach((x, k) => x.flag && !x.treasure && tileEls[k].g.classList.add('wrongflag'));
  }, 800);

  // お宝が散らばる
  setTimeout(() => scatter(i), 900 + others.length * 90 + 900);
}

function scatter(hitIndex) {
  sound.play('scatter');
  const vb = board.viewBox.baseVal;
  st.cells.forEach((c, k) => {
    if (!c.treasure) return;
    const [x, y] = px(PROVINCES[k]);
    const g = el('g', { transform: `translate(${x},${y})` }, layers.fx);
    const inner = el('g', {}, g);
    el('use', { href: `#i-${c.treasure.id}`, x: -17, y: -17, width: 34, height: 34 }, inner);
    const tx = vb.x + Math.random() * vb.width - x;
    const ty = vb.y + Math.random() * vb.height - y;
    const anim = inner.animate(
      [
        { transform: 'translate(0px,0px) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${tx * 0.4}px,${ty * 0.4 - 60}px) scale(1.4) rotate(${(Math.random() - 0.5) * 360}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${tx}px,${ty}px) scale(.3) rotate(${(Math.random() - 0.5) * 720}deg)`, opacity: 0 },
      ],
      { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' }
    );
    anim.onfinish = () => g.remove();
  });
  // 盤面を元の姿に
  tileEls.forEach((t, k) => {
    setTimeout(() => t.g.setAttribute('class', 'tile pop'), 150 + Math.random() * 500);
    t.num.textContent = '';
    t.name.setAttribute('y', 4);
  });

  const hit = st.cells[hitIndex];
  setTimeout(() => {
    st.state = 'over';
    showResult({
      seal: '失',
      win: false,
      title: 'お宝を掘り当ててしまった！',
      text: `${PROVINCES[hitIndex].name}の地に眠る「${hit.treasure.name}」を掘り起こしてしまった。<br>卑弥呼のお宝は、ふたたび倭の国々へ散らばった……`,
      next: '振り出しから',
      treasures: [],
    });
  }, 1700);
}

// ---------- 演出：勝利 ----------
function win() {
  st.state = 'won';
  stopTimer();
  updateStats();
  const idx = st.cells.map((c, k) => k).filter((k) => st.cells[k].treasure);
  setTimeout(() => sound.play('win'), 250);
  idx.forEach((k, n) => {
    setTimeout(() => {
      const t = tileEls[k];
      st.cells[k].flag = true;
      t.icon.setAttribute('href', `#i-${st.cells[k].treasure.id}`);
      t.g.setAttribute('class', 'tile treasure won pop');
      layers.legend.querySelector(`[data-id="${st.cells[k].treasure.id}"]`)?.classList.add('found');
      sound.play('reveal', n + 2);
      updateStats();
    }, 1600 + n * 160);
  });

  const key = `best-${st.mines}`;
  const best = store.get(key, null);
  const rec = { tries: st.tries, time: Math.round(st.elapsed) };
  const isBest = !best || rec.tries < best.tries || (rec.tries === best.tries && rec.time < best.time);
  if (isBest) store.set(key, rec);

  setTimeout(() => {
    showResult({
      seal: '宝',
      win: true,
      title: '卑弥呼のお宝を<br>すべて見つけた！',
      text: `難易度「${LEVEL_NAME[st.mines] || st.mines}」 ／ 挑戦 ${st.tries}回 ／ ${fmt(st.elapsed)}${isBest ? '<br><strong>✦ 自己最高の記録 ✦</strong>' : ''}`,
      next: 'もう一度',
      treasures: idx.map((k) => st.cells[k].treasure),
    });
  }, 1600 + idx.length * 160 + 1200);
}

function showResult({ seal, win, title, text, next, treasures }) {
  $('res-seal').textContent = seal;
  $('res-seal').classList.toggle('win', win);
  $('res-title').innerHTML = title;
  $('res-text').innerHTML = text;
  const row = $('res-treasures');
  row.innerHTML = '';
  treasures.forEach((tr, n) => {
    const d = document.createElement('div');
    d.className = 'tr pop';
    d.style.animationDelay = `${n * 0.08}s`;
    d.innerHTML = `<svg viewBox="0 0 34 34"><use href="#i-${tr.id}" width="34" height="34"/></svg>${tr.name}`;
    row.appendChild(d);
  });
  $('res-next').textContent = next;
  $('result').dataset.win = win ? '1' : '0';
  open('result');
}

// ---------- 画面 ----------
function open(id) {
  $(id).classList.add('show');
}
function close(id) {
  $(id).classList.remove('show');
}

let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function startLevel(mines) {
  st.mines = mines;
  st.tries = 1;
  st.elapsed = 0;
  stopTimer();
  newBoard();
  close('title');
  sound.play('start');
  toast(`難易度「${LEVEL_NAME[mines]}」 ― 最初のひと掘りは安全です`);
}

function restartFromScratch() {
  // 振り出し：お宝は散らばり、新しい場所に眠る。時間は止まらない。
  st.tries += 1;
  newBoard();
  if (st.elapsed > 0) startTimer();
  sound.play('start');
  toast(`第${st.tries}回 ― お宝は別の国へ散らばった`);
}

function renderTitle() {
  const row = $('title-treasures');
  row.innerHTML = TREASURES.slice(0, 6)
    .map((tr) => `<div class="tr"><svg viewBox="0 0 34 34"><use href="#i-${tr.id}" width="34" height="34"/></svg>${tr.name}</div>`)
    .join('');
  const lines = [6, 9, 12]
    .map((m) => {
      const b = store.get(`best-${m}`, null);
      return b ? `${LEVEL_NAME[m]}：${b.tries}回目・${fmt(b.time)}` : null;
    })
    .filter(Boolean);
  $('best').textContent = lines.length ? `最高記録　${lines.join('　')}` : '';
}

function setMode(m) {
  st.mode = m;
  $('btn-dig').classList.toggle('on', m === 'dig');
  $('btn-mark').classList.toggle('on', m === 'mark');
  $('btn-dig').setAttribute('aria-pressed', m === 'dig');
  $('btn-mark').setAttribute('aria-pressed', m === 'mark');
}

// ---------- 入力 ----------
function tileIndex(target) {
  const g = target.closest?.('.tile');
  return g ? Number(g.dataset.i) : -1;
}

let press = null;
board.addEventListener('pointerdown', (e) => {
  sound.unlock();
  const i = tileIndex(e.target);
  if (i < 0) return;
  if (e.pointerType === 'mouse' && e.button === 2) {
    toggleFlag(i);
    return;
  }
  if (e.button !== 0) return;
  press = { i, x: e.clientX, y: e.clientY, long: false, id: e.pointerId };
  press.timer = setTimeout(() => {
    if (!press) return;
    press.long = true;
    toggleFlag(press.i);
  }, 420);
});
board.addEventListener('pointermove', (e) => {
  if (press && press.id === e.pointerId && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancelPress();
});
function cancelPress() {
  if (press) clearTimeout(press.timer);
  press = null;
}
board.addEventListener('pointercancel', cancelPress);
board.addEventListener('pointerup', (e) => {
  if (!press || press.id !== e.pointerId) return;
  clearTimeout(press.timer);
  const { i, long } = press;
  press = null;
  if (long || tileIndex(e.target) !== i) return;
  act(i);
});
board.addEventListener('contextmenu', (e) => e.preventDefault());
board.addEventListener('keydown', (e) => {
  const i = tileIndex(e.target);
  if (i < 0) return;
  sound.unlock();
  if (e.key === 'Enter') { e.preventDefault(); act(i); }
  if (e.key === ' ' || e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFlag(i); }
});

function act(i) {
  if (st.state !== 'play' && st.state !== 'ready') return;
  if (st.mode === 'mark' && !st.cells[i].open) toggleFlag(i);
  else {
    if (!st.cells[i].open && !st.cells[i].flag) sound.play('tap');
    dig(i);
  }
}

document.addEventListener('pointerdown', () => sound.unlock(), { capture: true });

document.querySelectorAll('.level').forEach((b) =>
  b.addEventListener('click', () => {
    sound.unlock();
    sound.play('button');
    startLevel(Number(b.dataset.mines));
  })
);
$('btn-dig').addEventListener('click', () => { sound.play('button'); setMode('dig'); });
$('btn-mark').addEventListener('click', () => { sound.play('button'); setMode('mark'); });
function setZoom(on) {
  wrap.classList.toggle('zoom', on);
  if (on) {
    // 近畿〜中部あたりが中央に来るように
    wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) * 0.62;
    wrap.scrollTop = (wrap.scrollHeight - wrap.clientHeight) / 2;
  }
}
$('btn-zoom').addEventListener('click', () => {
  sound.play('button');
  setZoom(!wrap.classList.contains('zoom'));
});
$('btn-bgm').addEventListener('click', () => {
  const on = !sound.bgmOn;
  sound.setBgm(on);
  store.set('bgm', on);
  $('btn-bgm').classList.toggle('on', on);
  sound.play('button');
  toast(on ? 'BGM オン' : 'BGM オフ');
});
$('btn-sfx').addEventListener('click', () => {
  const on = !sound.sfxOn;
  sound.setSfx(on);
  store.set('sfx', on);
  $('btn-sfx').classList.toggle('on', on);
  sound.play('button');
  toast(on ? '効果音 オン' : '効果音 オフ');
});
$('btn-help').addEventListener('click', () => { sound.play('button'); open('help'); });
$('btn-menu').addEventListener('click', () => { sound.play('button'); stopTimer(); renderTitle(); open('title'); });
document.querySelector('#help [data-close]').addEventListener('click', () => { sound.play('button'); close('help'); });
$('res-next').addEventListener('click', () => {
  sound.play('button');
  close('result');
  if ($('result').dataset.win === '1') startLevel(st.mines);
  else restartFromScratch();
});
$('res-menu').addEventListener('click', () => {
  sound.play('button');
  close('result');
  renderTitle();
  open('title');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') close('help');
});

// ---------- 起動 ----------
sound.bgmOn = store.get('bgm', true);
sound.sfxOn = store.get('sfx', true);
$('btn-bgm').classList.toggle('on', sound.bgmOn);
$('btn-sfx').classList.toggle('on', sound.sfxOn);
buildBoard();
newBoard();
renderTitle();
// 縦長の小さな画面では最初から拡大表示
if (window.innerWidth < 700 && window.innerHeight > window.innerWidth) requestAnimationFrame(() => setZoom(true));
