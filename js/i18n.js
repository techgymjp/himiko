// 日本語・英語の切り替え
// 端末の言語が日本語なら日本語、それ以外は英語。タイトル画面のボタンで切り替えられる（保存する）

const DICT = {
  ja: {
    'doc.title': '邪馬台国マインスイーパー',
    'head.sub': '卑弥呼のお宝さがし',
    'head.main': '邪馬台国',
    'head.main2': 'マインスイーパー',
    'stat.left': '残りのお宝',
    'stat.try': '挑戦',
    'stat.time': '時',
    'stat.tryN': '{n}回目',
    'tool.zoom': '拡大・縮小',
    'tool.bgm': 'BGM',
    'tool.sfx': '効果音',
    'tool.help': '遊び方',
    'tool.menu': 'トップに戻る',
    'mode.dig': '⛏ 掘る',
    'mode.mark': '印 お宝',
    'hint': 'タップで掘る ・ 長押し／右クリックでお宝の印 ・ 数字はとなりの国に眠るお宝の数',
    'title.h': '邪馬台国<br>マインスイーパー',
    'title.lead': '倭の国々の地に、女王・卑弥呼のお宝が眠っている。<br>お宝を<strong>掘り当てずに</strong>、すべての国を調べ尽くせ。',
    'title.warn': 'ひとつでも掘り当ててしまえば…<br>お宝は再び散らばり、<strong>振り出し</strong>に戻る。',
    'title.help': 'あそびかた',
    'level.6': '易', 'level.9': '中', 'level.12': '難',
    'level.count': 'お宝 {n}',
    'best': '最高記録　{list}',
    'best.item': '{lv}：{n}回目・{t}',
    'legal.privacy': 'プライバシーポリシー',
    'legal.ads': '広告の設定',
    'url.privacy': 'https://techgym.jp/privacy-policy/',
    'help.h': '遊び方',
    'help.rules': `<li>地図のマスは<strong>旧国（令制国）68か国</strong>。となり合う六角形が「となりの国」です。</li>
<li>国を<strong>タップ</strong>すると掘ります。お宝がなければ、となりの国に眠るお宝の数が<strong>漢数字</strong>で現れます。</li>
<li>お宝がありそうな国は<strong>長押し</strong>（パソコンは右クリック）か「印」モードで<span class="mk">宝</span>の印をつけます。</li>
<li>数字の国をタップすると、印の数が合っていればまわりを一気に掘れます。</li>
<li>お宝を掘り当ててしまうと<strong>振り出し</strong>。お宝は別の国へ散らばります。</li>
<li>お宝のない国をすべて掘りきれば、卑弥呼のお宝はあなたのものです。</li>`,
    'help.small': '最初のひと掘りでは、お宝を掘り当てることはありません。',
    'help.ok': 'わかった',
    'pause.h': 'ひと休み',
    'pause.p': '時は止まっています。',
    'pause.resume': '再開する',
    'pause.top': 'トップに戻る',
    'res.top': 'トップに戻る',
    'res.share': '📤 結果をシェア',
    'res.lose.title': 'お宝を掘り当ててしまった！',
    'res.lose.text': '{p}の地に眠る「{t}」を掘り起こしてしまった。<br>卑弥呼のお宝は、ふたたび倭の国々へ散らばった……',
    'res.lose.next': '振り出しから',
    'res.win.title': '卑弥呼のお宝を<br>すべて見つけた！',
    'res.win.text': '難易度「{lv}」 ／ 挑戦 {n}回 ／ {t}{redo}',
    'res.win.redo': ' ／ やり直し {n}回',
    'res.win.best': '<br><strong>✦ 自己最高の記録 ✦</strong>',
    'res.win.next': 'もう一度',
    'redo.title': 'お宝を掘り当ててしまった…',
    'redo.watch': '広告を見て、掘る前に戻る',
    'redo.note': 'あと {n} 回使えます',
    'redo.skip': '振り出しに戻る（{s}）',
    'redo.loading': '広告を読み込んでいます…',
    'redo.fail': '広告を読み込めませんでした',
    'toast.redo': '掘る前に戻った（やり直し {n}回）',
    'toast.start': '難易度「{lv}」 ― 最初のひと掘りは安全です',
    'toast.retry': '第{n}回 ― お宝は別の国へ散らばった',
    'toast.bgmOn': 'BGM オン', 'toast.bgmOff': 'BGM オフ',
    'toast.sfxOn': '効果音 オン', 'toast.sfxOff': '効果音 オフ',
    'toast.copied': '結果をコピーしました',
    'toast.copyFail': 'コピーできませんでした',
    'share.title': '邪馬台国マインスイーパー',
    'share.dialog': '結果をシェア',
    'share.text': '🏺邪馬台国マインスイーパーで、卑弥呼のお宝{m}個をすべて見つけた！\n難易度「{lv}」挑戦{n}回・{t}{redo}\n#邪馬台国マインスイーパー #卑弥呼',
    'share.redo': '（やり直し{n}回）',
    'board.sea': '倭 の 海',
    'board.north': '北',
    'board.cart': '邪馬台国',
    'board.legend': '眠るお宝 {n}',
    'tile.aria': '{p}（{k}）',
    'tile.title': '{p}（{k}）・{r}',
    'tile.near': '{p} となりのお宝 {n}',
    'tile.none': '{p} お宝なし',
    't.magatama': '勾玉', 't.kinin': '金印', 't.kagami': '銅鏡', 't.nishiki': '錦',
    't.katana': '刀', 't.shinju': '真珠', 't.dotaku': '銅鐸', 't.kudatama': '管玉',
  },
  en: {
    'doc.title': 'Yamatai Minesweeper',
    'head.sub': "Queen Himiko's Treasure Hunt",
    'head.main': 'Yamatai',
    'head.main2': 'Minesweeper',
    'stat.left': 'Treasures',
    'stat.try': 'Try',
    'stat.time': 'Time',
    'stat.tryN': '#{n}',
    'tool.zoom': 'Zoom',
    'tool.bgm': 'Music',
    'tool.sfx': 'Sound effects',
    'tool.help': 'How to play',
    'tool.menu': 'Back to top',
    'mode.dig': '⛏ Dig',
    'mode.mark': '印 Mark',
    'hint': 'Tap to dig · Long-press / right-click to mark a treasure · Numbers show treasures in neighboring provinces',
    'title.h': 'Yamatai<br>Minesweeper',
    'title.lead': "Queen Himiko's treasures lie buried in the old provinces of Japan.<br>Search every province <strong>without digging one up</strong>.",
    'title.warn': 'Dig up even one, and the treasures scatter again —<br><strong>back to square one</strong>.',
    'title.help': 'How to play',
    'level.6': 'Easy', 'level.9': 'Normal', 'level.12': 'Hard',
    'level.count': '{n} treasures',
    'best': 'Best: {list}',
    'best.item': '{lv} try #{n} {t}',
    'legal.privacy': 'Privacy Policy',
    'legal.ads': 'Ad settings',
    'url.privacy': 'https://techgym.jp/privacy-policy-en/',
    'help.h': 'How to play',
    'help.rules': `<li>The map shows the <strong>68 old provinces of Japan</strong>. Hexagons that touch are neighbors.</li>
<li><strong>Tap</strong> a province to dig. If there is no treasure, a number shows how many treasures lie in the neighboring provinces.</li>
<li><strong>Long-press</strong> (right-click on a computer) or use "Mark" mode to put a <span class="mk">宝</span> mark where you think a treasure is.</li>
<li>Tap a number when the right number of marks is around it to dig all the other neighbors at once.</li>
<li>Dig up a treasure and you go <strong>back to square one</strong>: the treasures scatter to new provinces.</li>
<li>Dig every province without treasure, and Himiko's treasures are yours.</li>`,
    'help.small': 'Your first dig never hits a treasure.',
    'help.ok': 'Got it',
    'pause.h': 'Paused',
    'pause.p': 'The clock is stopped.',
    'pause.resume': 'Resume',
    'pause.top': 'Back to top',
    'res.top': 'Back to top',
    'res.share': '📤 Share result',
    'res.lose.title': 'You dug up a treasure!',
    'res.lose.text': 'You unearthed the {t} buried in {p}.<br>Himiko\'s treasures have scattered across the land again…',
    'res.lose.next': 'Start over',
    'res.win.title': "You found all of<br>Himiko's treasures!",
    'res.win.text': '{lv} / {n} tries / {t}{redo}',
    'res.win.redo': ' / rewinds: {n}',
    'res.win.best': '<br><strong>✦ New personal best ✦</strong>',
    'res.win.next': 'Play again',
    'redo.title': 'You dug up a treasure…',
    'redo.watch': 'Watch an ad to undo the dig',
    'redo.note': '{n} left',
    'redo.skip': 'Start over ({s})',
    'redo.loading': 'Loading ad…',
    'redo.fail': 'Could not load an ad',
    'toast.redo': 'Dig undone (rewinds: {n})',
    'toast.start': '{lv} — your first dig is always safe',
    'toast.retry': 'Try #{n} — the treasures have scattered',
    'toast.bgmOn': 'Music on', 'toast.bgmOff': 'Music off',
    'toast.sfxOn': 'Sound effects on', 'toast.sfxOff': 'Sound effects off',
    'toast.copied': 'Result copied',
    'toast.copyFail': 'Could not copy',
    'share.title': 'Yamatai Minesweeper',
    'share.dialog': 'Share result',
    'share.text': "🏺I found all {m} of Queen Himiko's treasures in Yamatai Minesweeper!\n{lv}, {n} tries, {t}{redo}\n#YamataiMinesweeper #Himiko",
    'share.redo': ' (rewinds: {n})',
    'board.sea': 'Sea of Wa',
    'board.north': 'N',
    'board.cart': 'YAMATAI',
    'board.legend': 'Buried treasures: {n}',
    'tile.aria': '{p}',
    'tile.title': '{p} ({r})',
    'tile.near': '{p}: {n} treasures nearby',
    'tile.none': '{p}: no treasure nearby',
    't.magatama': 'Magatama', 't.kinin': 'Gold Seal', 't.kagami': 'Mirror', 't.nishiki': 'Brocade',
    't.katana': 'Sword', 't.shinju': 'Pearl', 't.dotaku': 'Bell', 't.kudatama': 'Beads',
  },
};

function detect() {
  try {
    const saved = localStorage.getItem('yamatai:lang');
    if (saved === '"ja"' || saved === '"en"') return JSON.parse(saved);
  } catch { /* noop */ }
  const langs = navigator.languages || [navigator.language || 'ja'];
  return String(langs[0] || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

let lang = detect();
const listeners = [];

export const getLang = () => lang;

export function t(key, vars = {}) {
  const s = DICT[lang][key] ?? DICT.ja[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

// data-i18n（文字）・data-i18n-html（タグ入り）・data-i18n-title・data-i18n-href の付いた要素を書き換える
export function applyI18n(root = document) {
  document.documentElement.lang = lang;
  document.title = t('doc.title');
  root.querySelectorAll('[data-i18n]').forEach((e) => (e.textContent = t(e.dataset.i18n)));
  root.querySelectorAll('[data-i18n-html]').forEach((e) => (e.innerHTML = t(e.dataset.i18nHtml)));
  root.querySelectorAll('[data-i18n-title]').forEach((e) => {
    e.title = t(e.dataset.i18nTitle);
    e.setAttribute('aria-label', e.title);
  });
  root.querySelectorAll('[data-i18n-href]').forEach((e) => (e.href = t(e.dataset.i18nHref)));
  document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
}

export function setLang(l) {
  if (l === lang || !DICT[l]) return;
  lang = l;
  try { localStorage.setItem('yamatai:lang', JSON.stringify(l)); } catch { /* noop */ }
  applyI18n();
  listeners.forEach((f) => f(lang));
}

export const onLangChange = (f) => listeners.push(f);
