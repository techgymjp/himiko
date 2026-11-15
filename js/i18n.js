// 日本語・英語の切り替え
// 端末の言語が日本語なら日本語、それ以外は英語。タイトル画面のボタンで切り替えられる（保存する）

const DICT = {
  ja: {
    'doc.title': '邪馬台国マインスイーパー',
    'head.sub': '卑弥呼の同盟国さがし',
    'head.main': '邪馬台国',
    'head.main2': 'マインスイーパー',
    'stat.left': '残りの同盟国',
    'stat.try': '挑戦',
    'stat.time': '時',
    'stat.tryN': '{n}回目',
    'tool.zoom': '拡大・縮小',
    'tool.bgm': 'BGM',
    'tool.sfx': '効果音',
    'tool.help': '遊び方',
    'tool.menu': 'トップに戻る',
    'mode.dig': '<svg class="ico" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-shovel" width="40" height="40"/></svg> 掘る',
    'mode.mark': '<svg class="ico" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-mark" width="40" height="40"/></svg> 旗を立てる',
    'hint': 'タップで掘る ・ 長押し{pc2}で旗を立てる ・ 数字はとなりにある同盟国の数',
    'hint.pc': '／右クリック',
    'help.pc': '（パソコンは右クリック）',
    'title.h': '邪馬台国<br>マインスイーパー',
    'title.lead': '女王・卑弥呼は、同盟を結んだ国々にお宝を贈った。<br>倭の国々を調べ、<strong>どの国が同盟国か</strong>を見つけ出せ。',
    'title.warn': 'ただし、同盟国の地を掘り荒らしてしまえば…<br>同盟は結び直され、お宝は散らばり、<strong>振り出し</strong>に戻る。',
    'title.help': 'あそびかた',
    'title.catch': '卑弥呼の同盟国を探し出せ！',
    'level.6': '易', 'level.9': '中', 'level.12': '難',
    'level.count': '同盟国 {n}',
    'best': '最高記録　{list}',
    'best.item': '{lv}：{n}回目・{t}',
    'legal.privacy': 'プライバシーポリシー',
    'legal.ads': '広告の設定',
    'url.privacy': 'https://techgym.jp/privacy-policy/',
    'help.h': '遊び方',
    'help.rules': `<li>地図のマスは<strong>旧国（令制国）68か国</strong>。となり合う六角形が「となりの国」です。</li>
<li>国を<strong>タップ</strong>すると掘って調べます。同盟国でなければ、<strong>となりにある同盟国の数</strong>が漢数字で現れます。</li>
<li>同盟国だと思う国には、<strong>長押し</strong>{pc}か「旗を立てる」モードで<span class="flag-ico"><svg class="ico" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-mark" width="40" height="40"/></svg></span><strong>旗</strong>を立てます。</li>
<li>数字の国をタップすると、立てた旗の数が合っていれば、まわりを一気に掘れます。</li>
<li>同盟国を掘ってしまうと、贈られたお宝を掘り荒らしたことになり<strong>振り出し</strong>。卑弥呼は同盟を結び直し、お宝は別の国へ散らばります。</li>
<li>同盟国でない国をすべて掘りきれば、卑弥呼の同盟国がすべて明らかになります。</li>`,
    'help.small': '最初のひと掘りでは、同盟国を掘ってしまうことはありません。',
    'help.ok': 'わかった',
    'pause.h': 'ひと休み',
    'pause.p': '時は止まっています。',
    'pause.resume': '再開する',
    'pause.top': 'トップに戻る',
    'res.top': 'トップに戻る',
    'res.share': '📤 結果をシェア',
    'res.lose.title': '同盟国を掘り荒らしてしまった！',
    'res.lose.text': '同盟国・{p}に贈られた「{t}」を掘り起こしてしまった。<br>卑弥呼は同盟を結び直し、お宝はふたたび倭の国々へ散らばった……',
    'res.lose.next': '振り出しから',
    'res.win.title': '卑弥呼の同盟国を<br>すべて見つけた！',
    'res.win.text': '難易度「{lv}」 ／ 挑戦 {n}回 ／ {t}{redo}',
    'res.win.redo': ' ／ やり直し {n}回',
    'res.win.best': '<br><strong>✦ 自己最高の記録 ✦</strong>',
    'res.win.next': 'もう一度',
    'redo.title': '同盟国を掘ってしまった…',
    'redo.watch': '広告を見て、掘る前に戻る',
    'redo.note': 'あと {n} 回使えます',
    'redo.skip': '振り出しに戻る（{s}）',
    'redo.loading': '広告を読み込んでいます…',
    'redo.fail': '広告を読み込めませんでした',
    'toast.redo': '掘る前に戻った（やり直し {n}回）',
    'toast.start': '難易度「{lv}」 ― 最初のひと掘りは安全です',
    'toast.retry': '第{n}回 ― 同盟は結び直され、お宝は別の国へ',
    'toast.zoom': '🔍で全体表示 ／ 地図は指で左右にスクロールできます',
    'toast.bgmOn': 'BGM オン', 'toast.bgmOff': 'BGM オフ',
    'toast.sfxOn': '効果音 オン', 'toast.sfxOff': '効果音 オフ',
    'toast.copied': '結果をコピーしました',
    'toast.copyFail': 'コピーできませんでした',
    'share.title': '邪馬台国マインスイーパー',
    'share.dialog': '結果をシェア',
    'share.text': '🏺邪馬台国マインスイーパーで、卑弥呼の同盟国{m}か国をすべて見つけた！\n難易度「{lv}」挑戦{n}回・{t}{redo}\n#邪馬台国マインスイーパー #卑弥呼',
    'share.redo': '（やり直し{n}回）',
    'share.lose': '🏺邪馬台国マインスイーパーで卑弥呼の同盟国を探索中…\n同盟国・{p}を掘り荒らしてしまった！ 難易度「{lv}」{n}回目の挑戦\n#邪馬台国マインスイーパー #卑弥呼',
    'share.x': '𝕏 ポスト',
    'board.sea': '倭 の 海',
    'board.north': '北',
    'board.cart': '邪馬台国',
    'board.legend': '同盟国に贈られたお宝 {n}',
    'tile.aria': '{p}（{k}）',
    'tile.title': '{p}（{k}）・{r}',
    'tile.near': '{p} となりの同盟国 {n}',
    'tile.none': '{p} となりに同盟国なし',
    't.magatama': '勾玉', 't.kinin': '金印', 't.kagami': '銅鏡', 't.nishiki': '錦',
    't.katana': '刀', 't.shinju': '真珠', 't.dotaku': '銅鐸', 't.kudatama': '管玉',
  },
  en: {
    'doc.title': 'Yamatai Minesweeper',
    'head.sub': 'Find Queen Himiko\'s Allies',
    'head.main': 'Yamatai',
    'head.main2': 'Minesweeper',
    'stat.left': 'Allies',
    'stat.try': 'Try',
    'stat.time': 'Time',
    'stat.tryN': '#{n}',
    'tool.zoom': 'Zoom',
    'tool.bgm': 'Music',
    'tool.sfx': 'Sound effects',
    'tool.help': 'How to play',
    'tool.menu': 'Back to top',
    'mode.dig': '<svg class="ico" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-shovel" width="40" height="40"/></svg> Dig',
    'mode.mark': '<svg class="ico" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-mark" width="40" height="40"/></svg> Flag',
    'hint': 'Tap to dig · Long-press{pc2} to plant a flag · Numbers show allies in neighboring provinces',
    'hint.pc': ' / right-click',
    'help.pc': ' (right-click on a computer)',
    'title.h': 'Yamatai<br>Minesweeper',
    'title.lead': 'Queen Himiko sent treasures to the provinces allied with her.<br>Search the old provinces of Japan and <strong>find out which ones are her allies</strong>.',
    'title.warn': 'But dig up an ally\'s land, and she forms new alliances —<br>the treasures scatter and you go <strong>back to square one</strong>.',
    'title.help': 'How to play',
    'title.catch': "Find Queen Himiko's allies!",
    'level.6': 'Easy', 'level.9': 'Normal', 'level.12': 'Hard',
    'level.count': '{n} allies',
    'best': 'Best: {list}',
    'best.item': '{lv} try #{n} {t}',
    'legal.privacy': 'Privacy Policy',
    'legal.ads': 'Ad settings',
    'url.privacy': 'https://techgym.jp/privacy-policy-en/',
    'help.h': 'How to play',
    'help.rules': `<li>The map shows the <strong>68 old provinces of Japan</strong>. Hexagons that touch are neighbors.</li>
<li><strong>Tap</strong> a province to dig. If it is not an ally, a number shows <strong>how many allies</strong> are in the neighboring provinces.</li>
<li><strong>Long-press</strong>{pc} or use "Flag" mode to plant a <span class="flag-ico"><svg class="ico" viewBox="0 0 40 40" aria-hidden="true"><use href="#i-mark" width="40" height="40"/></svg></span><strong>flag</strong> on a province you think is an ally.</li>
<li>Tap a number when the right number of flags is around it to dig all the other neighbors at once.</li>
<li>Dig up an ally and you have plundered Himiko's gift: <strong>back to square one</strong>. She forms new alliances, and the treasures scatter to new provinces.</li>
<li>Dig every province that is not an ally, and all of Himiko's allies are revealed.</li>`,
    'help.small': 'Your first dig never hits an ally.',
    'help.ok': 'Got it',
    'pause.h': 'Paused',
    'pause.p': 'The clock is stopped.',
    'pause.resume': 'Resume',
    'pause.top': 'Back to top',
    'res.top': 'Back to top',
    'res.share': '📤 Share result',
    'res.lose.title': 'You dug up an ally!',
    'res.lose.text': 'You unearthed the {t} that Himiko sent to her ally, {p}.<br>She forms new alliances, and the treasures scatter across the land again…',
    'res.lose.next': 'Start over',
    'res.win.title': 'You found all of<br>Himiko\'s allies!',
    'res.win.text': '{lv} / tries: {n} / {t}{redo}',
    'res.win.redo': ' / rewinds: {n}',
    'res.win.best': '<br><strong>✦ New personal best ✦</strong>',
    'res.win.next': 'Play again',
    'redo.title': 'You dug up an ally…',
    'redo.watch': 'Watch an ad to undo the dig',
    'redo.note': '{n} left',
    'redo.skip': 'Start over ({s})',
    'redo.loading': 'Loading ad…',
    'redo.fail': 'Could not load an ad',
    'toast.redo': 'Dig undone (rewinds: {n})',
    'toast.start': '{lv} — your first dig is always safe',
    'toast.retry': 'Try #{n} — new alliances, new treasure spots',
    'toast.zoom': 'Tap 🔍 to see the whole map, or swipe to scroll',
    'toast.bgmOn': 'Music on', 'toast.bgmOff': 'Music off',
    'toast.sfxOn': 'Sound effects on', 'toast.sfxOff': 'Sound effects off',
    'toast.copied': 'Result copied',
    'toast.copyFail': 'Could not copy',
    'share.title': 'Yamatai Minesweeper',
    'share.dialog': 'Share result',
    'share.text': '🏺I found all {m} of Queen Himiko\'s allies in Yamatai Minesweeper!\n{lv}, tries: {n}, {t}{redo}\n#YamataiMinesweeper #Himiko',
    'share.redo': ' (rewinds: {n})',
    'share.lose': "🏺Searching for Queen Himiko's allies in Yamatai Minesweeper…\nand I dug up her ally {p}! {lv}, try #{n}\n#YamataiMinesweeper #Himiko",
    'share.x': '𝕏 Post',
    'board.sea': 'Sea of Wa',
    'board.north': 'N',
    'board.cart': 'YAMATAI',
    'board.legend': 'Treasures sent to allies: {n}',
    'tile.aria': '{p}',
    'tile.title': '{p} ({r})',
    'tile.near': '{p}: {n} allies nearby',
    'tile.none': '{p}: no allies nearby',
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

// どの文にも使える値（Web 版とアプリで変わる操作の説明など）。関数ならそのつど呼ぶ
const globals = {};
export const setGlobals = (g) => Object.assign(globals, g);

export function t(key, vars = {}) {
  const s = DICT[lang][key] ?? DICT.ja[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k] ?? globals[k];
    return v === undefined ? '' : typeof v === 'function' ? v() : v;
  });
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
