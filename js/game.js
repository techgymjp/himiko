import { PROVINCES, buildNeighbors } from './map.js';
import { sound } from './audio.js';
import { t, getLang, applyI18n, setLang, onLangChange } from './i18n.js';

// ---------- 定数 ----------
const TREASURES = ['magatama', 'kinin', 'kagami', 'nishiki', 'katana', 'shinju', 'dotaku', 'kudatama'].map((id) => ({ id }));
const KANJI = ['', '一', '二', '三', '四', '五', '六'];
// 表示用の名前（日本語・英語）
const trName = (tr) => t(`t.${tr.id}`);
const lvName = (m) => t(`level.${m}`);
const pName = (p) => (getLang() === 'ja' ? p.name : p.en);
const numText = (n) => (getLang() === 'ja' ? KANJI[n] : n ? String(n) : '');
const S = 30; // 六角形の半径
const W = Math.sqrt(3) * S;
const NEIGHBORS = buildNeighbors(PROVINCES);
const SVGNS = 'http://www.w3.org/2000/svg';

const $ = (id) => document.getElementById(id);

// Android アプリ（Capacitor）で動いているか。Web 版では Capacitor がないので何もしない
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const plugin = (name) => (NATIVE && window.Capacitor.Plugins ? window.Capacitor.Plugins[name] : null);
if (NATIVE) document.documentElement.classList.add('native');
const Ads = window.Ads || { available: false, canReward: false, showing: false, initDone: Promise.resolve(), showInterstitial: async () => {}, showRewarded: async () => 'unavailable', setBanner: () => {}, showPrivacyOptions: async () => {} };
// 広告（js/ads.js）から音を止めたり戻したりできるようにする
window.Sound = { suspend: () => sound.suspend(), resume: () => sound.resume() };
const SHARE_URL = 'https://techgymjp.github.io/himiko/';
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
  redoUsed: 0, // リワード広告で「掘る前に戻る」を使った回数（1 ゲームごと）
  paused: false,
};
const REDO_MAX = 3;
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
  layers.sea = el('text', { x: (7 * W) / 2, y: 13 * 1.5 * S, class: 'sea-label', 'text-anchor': 'middle' }, board);
  const comp = el('g', { transform: `translate(${(22 * W) / 2}, ${11 * 1.5 * S})`, opacity: 0.75 }, board);
  el('circle', { r: 26, fill: 'none', stroke: '#d4a437', 'stroke-width': 1.5 }, comp);
  el('path', { d: 'M0-24L6 0 0 24-6 0z', fill: '#d4a437' }, comp);
  el('path', { d: 'M0-24L6 0H-6z', fill: '#c0392b' }, comp);
  layers.north = el('text', { y: -32, 'text-anchor': 'middle', fill: '#f3e6c8', 'font-size': 13, 'font-weight': 700 }, comp);
  const cart = el('g', { transform: `translate(${(18 * W) / 2}, ${10.4 * 1.5 * S})` }, board);
  el('rect', { x: -40, y: -16, width: 80, height: 32, rx: 4, fill: '#2a1d14cc', stroke: '#d4a437' }, cart);
  layers.cart = el('text', { y: 6, 'text-anchor': 'middle', fill: '#f3e6c8', 'font-size': 15, 'font-weight': 800, 'letter-spacing': 3 }, cart);

  // 眠るお宝（凡例）
  layers.legend = el('g', { transform: `translate(${(-4.5 * W) / 2}, ${1.0 * 1.5 * S})` }, board);

  layers.tiles = el('g', {}, board);
  layers.fx = el('g', { class: 'fly' }, board);

  tileEls = PROVINCES.map((p, i) => {
    const [x, y] = px(p);
    const g = el('g', { class: 'tile', transform: `translate(${x.toFixed(2)},${y.toFixed(2)})`, tabindex: 0, role: 'gridcell', 'data-i': i }, layers.tiles);
    const body = el('g', { class: 'body' }, g);
    el('polygon', { class: 'hex', points: hexPoints(S - 1.2) }, body);
    const name = el('text', { class: 'name', y: 4 }, body);
    const num = el('text', { class: 'num', y: 13 }, body);
    el('use', { class: 'icon', href: '#i-magatama', x: -17, y: -17, width: 34, height: 34 }, body);
    el('use', { class: 'flag', href: '#i-mark', x: -15, y: -15, width: 30, height: 30 }, body);
    const title = el('title', {}, g);
    return { g, body, name, num, title, icon: body.querySelector('.icon') };
  });
  applyBoardText();
}

// 盤面の文字を今の言語で書き直す
function applyBoardText() {
  const ja = getLang() === 'ja';
  layers.sea.textContent = t('board.sea');
  layers.north.textContent = t('board.north');
  layers.cart.textContent = t('board.cart');
  layers.cart.setAttribute('font-size', ja ? 15 : 12);
  layers.cart.setAttribute('letter-spacing', ja ? 3 : 1.5);
  tileEls.forEach((te, i) => {
    const p = PROVINCES[i];
    const name = pName(p);
    te.name.textContent = name;
    // 英語の長い国名はマスに収まるよう文字を小さくする
    te.name.style.setProperty('--fs', ja ? '' : `${Math.min(11.5, 42 / (name.length * 0.62)).toFixed(2)}px`);
    te.title.textContent = t('tile.title', { p: name, k: p.kana, r: ja ? p.region : p.regionEn });
    const c = st.cells[i];
    if (c && c.open) {
      te.num.textContent = numText(c.n);
      te.g.setAttribute('aria-label', t(c.n ? 'tile.near' : 'tile.none', { p: name, n: c.n }));
    } else {
      te.g.setAttribute('aria-label', t('tile.aria', { p: name, k: p.kana }));
    }
  });
}

function drawLegend() {
  const g = layers.legend;
  g.innerHTML = '';
  const head = el('text', { class: 'legend-title', x: 0, y: 0 }, g);
  head.textContent = t('board.legend', { n: st.mines });
  const counts = new Map();
  st.cells.forEach((c) => c.treasure && counts.set(c.treasure.id, (counts.get(c.treasure.id) || 0) + 1));
  const list = TREASURES.filter((tr) => counts.has(tr.id));
  list.forEach((tr, k) => {
    const col = k % 4;
    const row = Math.floor(k / 4);
    const item = el('g', { class: 'legend-item', 'data-id': tr.id, transform: `translate(${col * 68}, ${18 + row * 58})` }, g);
    el('use', { class: 'legend-icon', href: `#i-${tr.id}`, x: 0, y: 0, width: 34, height: 34 }, item);
    const n = el('text', { class: 'legend-name', x: 17, y: 48, 'text-anchor': 'middle' }, item);
    n.textContent = trName(tr) + (counts.get(tr.id) > 1 ? `×${counts.get(tr.id)}` : '');
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
  $('st-try').textContent = t('stat.tryN', { n: st.tries });
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
  const te = tileEls[i];
  const c = st.cells[i];
  setTimeout(() => {
    te.g.setAttribute('class', `tile open pop n${c.n}`);
    te.num.textContent = numText(c.n);
    te.name.setAttribute('y', c.n ? -9 : 4);
    te.g.setAttribute('aria-label', t(c.n ? 'tile.near' : 'tile.none', { p: pName(PROVINCES[i]), n: c.n }));
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

  // 失敗の様子を見届けてから、リワード広告で「掘る前に戻る」を選べるようにする（アプリのみ）
  const wait = 900 + others.length * 90 + 900;
  st.mistakeIndex = i;
  if (Ads.canReward && st.redoUsed < REDO_MAX) setTimeout(() => offerRedo(i), Math.max(wait, 2600));
  else setTimeout(() => scatter(i), wait);
}

// ---------- リワード広告のチート：掘り当てる前に戻る（アプリのみ・1 ゲーム 3 回まで） ----------
const REDO_WAIT = 6; // 何もしなければこの秒数で振り出しへ進む
const redo = { active: false, busy: false, timer: null, left: 0, index: -1 };
function offerRedo(i) {
  Object.assign(redo, { active: true, busy: false, left: REDO_WAIT, index: i });
  $('redo-watch').disabled = false;
  $('redo-watch').textContent = t('redo.watch');
  $('redo-note').textContent = t('redo.note', { n: REDO_MAX - st.redoUsed });
  $('redo').hidden = false;
  tickRedo();
}
function tickRedo() {
  clearTimeout(redo.timer);
  if (!redo.active || redo.busy) return;
  $('redo-skip').textContent = t('redo.skip', { s: redo.left });
  if (redo.left <= 0) return skipRedo();
  redo.left--;
  redo.timer = setTimeout(tickRedo, 1000);
}
function closeRedo() {
  clearTimeout(redo.timer);
  redo.active = false;
  redo.busy = false;
  $('redo').hidden = true;
}
function skipRedo() {
  if (!redo.active) return;
  const i = redo.index;
  closeRedo();
  scatter(i);
}
$('redo-skip').addEventListener('click', () => { sound.play('button'); skipRedo(); });
$('redo-watch').addEventListener('click', async () => {
  if (!redo.active || redo.busy) return;
  sound.play('button');
  redo.busy = true;
  clearTimeout(redo.timer);
  $('redo-watch').disabled = true;
  $('redo-watch').textContent = t('redo.loading');
  const result = await Ads.showRewarded();
  if (result === 'unavailable') {
    $('redo-note').textContent = t('redo.fail');
    setTimeout(skipRedo, 1800);
    return;
  }
  if (result !== 'rewarded') return skipRedo();
  // 最後まで見たら、掘り当てる前の盤面に戻す（同じ配置のまま）
  closeRedo();
  st.redoUsed++;
  renderAll();
  st.state = 'play';
  sound.play('start');
  toast(t('toast.redo', { n: st.redoUsed }));
});

// 盤面の見た目を st.cells の状態どおりに描き直す
function renderAll() {
  tileEls.forEach((t, i) => {
    const c = st.cells[i];
    if (c.open) {
      t.g.setAttribute('class', `tile open n${c.n}`);
      t.num.textContent = numText(c.n);
      t.name.setAttribute('y', c.n ? -9 : 4);
    } else {
      t.g.setAttribute('class', `tile pop${c.flag ? ' flagged' : ''}`);
      t.num.textContent = '';
      t.name.setAttribute('y', 4);
    }
  });
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
      title: t('res.lose.title'),
      text: t('res.lose.text', { p: pName(PROVINCES[hitIndex]), t: trName(hit.treasure) }),
      next: t('res.lose.next'),
      treasures: [],
      share: false,
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
      title: t('res.win.title'),
      text: t('res.win.text', { lv: lvName(st.mines), n: st.tries, t: fmt(st.elapsed), redo: st.redoUsed ? t('res.win.redo', { n: st.redoUsed }) : '' }) + (isBest ? t('res.win.best') : ''),
      next: t('res.win.next'),
      treasures: idx.map((k) => st.cells[k].treasure),
      share: true,
    });
  }, 1600 + idx.length * 160 + 1200);
}

function showResult({ seal, win, title, text, next, treasures, share }) {
  $('res-share').hidden = !share;
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
    d.innerHTML = `<svg viewBox="0 0 34 34"><use href="#i-${tr.id}" width="34" height="34"/></svg>${trName(tr)}`;
    row.appendChild(d);
  });
  $('res-next').textContent = next;
  $('result').dataset.win = win ? '1' : '0';
  open('result');
}

// ---------- 画面 ----------
function open(id) {
  $(id).classList.add('show');
  updateBanner();
}
function close(id) {
  $(id).classList.remove('show');
  updateBanner();
}
const isOpen = (id) => $(id).classList.contains('show');

// バナー広告：トップ・あそびかた・ポーズ・結果画面だけ（プレイ中は盤面と重なるので出さない）
function updateBanner() {
  Ads.setBanner(['title', 'help', 'pause', 'result'].some(isOpen));
}

// 全画面広告：プレイ開始・トップに戻る・ポーズからの再開・もう一度（振り出し）のたびに出す
let adBusy = false;
async function withInterstitial(next) {
  if (adBusy) return;
  if (Ads.available) {
    adBusy = true;
    await Ads.showInterstitial(3000);
    adBusy = false;
  }
  next();
}

// ---------- ポーズ ----------
function pauseGame() {
  if (st.state !== 'play' || st.paused) return;
  st.paused = true;
  stopTimer();
  open('pause');
}
function resumeGame() {
  if (!st.paused) return;
  st.paused = false;
  close('pause');
  startTimer();
}
function goTop() {
  closeRedo();
  st.paused = false;
  stopTimer();
  ['pause', 'result', 'help'].forEach(close);
  renderTitle();
  open('title');
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
  st.redoUsed = 0;
  st.paused = false;
  st.elapsed = 0;
  stopTimer();
  newBoard();
  close('title');
  sound.play('start');
  toast(t('toast.start', { lv: lvName(mines) }));
}

function restartFromScratch() {
  // 振り出し：お宝は散らばり、新しい場所に眠る。時間は止まらない。
  st.tries += 1;
  newBoard();
  if (st.elapsed > 0) startTimer();
  sound.play('start');
  toast(t('toast.retry', { n: st.tries }));
}

function renderTitle() {
  const row = $('title-treasures');
  row.innerHTML = TREASURES.slice(0, 6)
    .map((tr) => `<div class="tr"><svg viewBox="0 0 34 34"><use href="#i-${tr.id}" width="34" height="34"/></svg>${trName(tr)}</div>`)
    .join('');
  document.querySelectorAll('.level').forEach((b) => {
    const m = Number(b.dataset.mines);
    b.innerHTML = `<b>${lvName(m)}</b><small>${t('level.count', { n: m })}</small>`;
  });
  const lines = [6, 9, 12]
    .map((m) => {
      const b = store.get(`best-${m}`, null);
      return b ? t('best.item', { lv: lvName(m), n: b.tries, t: fmt(b.time) }) : null;
    })
    .filter(Boolean);
  $('best').textContent = lines.length ? t('best', { list: lines.join('　') }) : '';
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
    withInterstitial(() => startLevel(Number(b.dataset.mines)));
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
  toast(t(on ? 'toast.bgmOn' : 'toast.bgmOff'));
});
$('btn-sfx').addEventListener('click', () => {
  const on = !sound.sfxOn;
  sound.setSfx(on);
  store.set('sfx', on);
  $('btn-sfx').classList.toggle('on', on);
  sound.play('button');
  toast(t(on ? 'toast.sfxOn' : 'toast.sfxOff'));
});
$('btn-help').addEventListener('click', () => { sound.play('button'); open('help'); });
$('btn-menu').addEventListener('click', () => { sound.play('button'); if (st.state === 'busy') return; goTop(); });
$('title-help').addEventListener('click', () => { sound.play('button'); open('help'); });
$('pause-resume').addEventListener('click', () => { sound.play('button'); withInterstitial(resumeGame); });
$('pause-top').addEventListener('click', () => { sound.play('button'); withInterstitial(goTop); });
$('res-share').addEventListener('click', () => { sound.play('button'); shareResult(); });
document.querySelector('#help [data-close]').addEventListener('click', () => { sound.play('button'); close('help'); });
$('res-next').addEventListener('click', () => {
  sound.play('button');
  withInterstitial(() => {
    close('result');
    if ($('result').dataset.win === '1') startLevel(st.mines);
    else restartFromScratch();
  });
});
$('res-menu').addEventListener('click', () => {
  sound.play('button');
  withInterstitial(goTop);
});

// ---------- シェア ----------
async function shareResult() {
  const text = t('share.text', { m: st.mines, lv: lvName(st.mines), n: st.tries, t: fmt(st.elapsed), redo: st.redoUsed ? t('share.redo', { n: st.redoUsed }) : '' });
  const nativeShare = plugin('Share');
  if (nativeShare) {
    try { await nativeShare.share({ title: t('share.title'), text, url: SHARE_URL, dialogTitle: t('share.dialog') }); } catch { /* キャンセル */ }
    return;
  }
  if (navigator.share) {
    try { await navigator.share({ title: t('share.title'), text, url: SHARE_URL }); } catch { /* キャンセル */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${SHARE_URL}`);
    toast(t('toast.copied'));
  } catch {
    toast(t('toast.copyFail'));
  }
}

// ---------- アプリの動き ----------
// 裏に回ったら一時停止して音を止める（広告の表示中は広告側が音を止めている）
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!Ads.showing) pauseGame();
    sound.suspend();
  } else if (!Ads.showing) {
    sound.resume();
  }
});

// Android の戻るボタン：あそびかたは閉じる、プレイ中はポーズ（ポーズ中なら再開）、トップ・結果画面ではアプリを閉じる
if (plugin('App')) {
  plugin('App').addListener('backButton', () => {
    if (adBusy || redo.busy) return;
    if (isOpen('help')) close('help');
    else if (isOpen('title') || isOpen('result')) plugin('App').exitApp();
    else if (st.paused) withInterstitial(resumeGame);
    else if (st.state === 'play') pauseGame();
  });
}

// トップ画面の下に、バージョン（アプリ版）・プライバシーポリシー・広告の設定（EU など）を出す
if (NATIVE) $('legal').hidden = false;
if (window.APP_VERSION && window.APP_VERSION !== 'dev') $('buildInfo').textContent = window.APP_VERSION;
Ads.initDone.then(() => {
  if (Ads.privacyOptionsRequired) $('adPrivacy').hidden = false;
  updateBanner();
});
$('adPrivacyLink').addEventListener('click', (e) => { e.preventDefault(); Ads.showPrivacyOptions(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen('help')) close('help');
});

// ---------- 起動 ----------
sound.bgmOn = store.get('bgm', true);
sound.sfxOn = store.get('sfx', true);
$('btn-bgm').classList.toggle('on', sound.bgmOn);
$('btn-sfx').classList.toggle('on', sound.sfxOn);
applyI18n();
buildBoard();
newBoard();
renderTitle();
// 言語の切り替え（タイトル画面）
document.querySelectorAll('[data-lang]').forEach((b) =>
  b.addEventListener('click', () => { sound.play('button'); setLang(b.dataset.lang); })
);
onLangChange(() => {
  renderTitle();
  applyBoardText();
  drawLegend();
  updateStats();
});
// 縦長の小さな画面では最初から拡大表示
if (window.innerWidth < 700 && window.innerHeight > window.innerWidth) {
  setZoom(true);
  // 文字や地図の大きさが決まってから、近畿〜中部が見える位置へスクロールし直す
  window.addEventListener('load', () => setTimeout(() => setZoom(true), 50));
  document.fonts?.ready.then(() => setZoom(true));
}
