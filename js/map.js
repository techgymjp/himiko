// 旧国（令制国68か国）の六角タイル配置
// 座標は「ダブル座標」: (c, r) で c と r の偶奇が一致。隣接は (±2,0) (±1,±1)
// 北が上。おおよその地理的位置に合わせて配置しています。
export const PROVINCES = [
  // 東北・北陸・関東
  { c: 19, r: 1, name: '佐渡', kana: 'さど', region: '北陸道' },
  { c: 21, r: 1, name: '出羽', kana: 'でわ', region: '東山道' },
  { c: 23, r: 1, name: '陸奥', kana: 'むつ', region: '東山道' },
  { c: 16, r: 2, name: '能登', kana: 'のと', region: '北陸道' },
  { c: 20, r: 2, name: '越後', kana: 'えちご', region: '北陸道' },
  { c: 22, r: 2, name: '下野', kana: 'しもつけ', region: '東山道' },
  { c: 24, r: 2, name: '常陸', kana: 'ひたち', region: '東海道' },
  { c: 15, r: 3, name: '加賀', kana: 'かが', region: '北陸道' },
  { c: 17, r: 3, name: '越中', kana: 'えっちゅう', region: '北陸道' },
  { c: 19, r: 3, name: '信濃', kana: 'しなの', region: '東山道' },
  { c: 21, r: 3, name: '上野', kana: 'こうずけ', region: '東山道' },
  { c: 23, r: 3, name: '下総', kana: 'しもうさ', region: '東海道' },
  { c: 14, r: 4, name: '越前', kana: 'えちぜん', region: '北陸道' },
  { c: 16, r: 4, name: '飛騨', kana: 'ひだ', region: '東山道' },
  { c: 18, r: 4, name: '甲斐', kana: 'かい', region: '東海道' },
  { c: 20, r: 4, name: '武蔵', kana: 'むさし', region: '東海道' },
  { c: 22, r: 4, name: '上総', kana: 'かずさ', region: '東海道' },
  { c: 24, r: 4, name: '安房', kana: 'あわ', region: '東海道' },
  // 近畿・東海
  { c: 9, r: 5, name: '丹後', kana: 'たんご', region: '山陰道' },
  { c: 11, r: 5, name: '若狭', kana: 'わかさ', region: '北陸道' },
  { c: 13, r: 5, name: '近江', kana: 'おうみ', region: '東山道' },
  { c: 15, r: 5, name: '美濃', kana: 'みの', region: '東山道' },
  { c: 17, r: 5, name: '尾張', kana: 'おわり', region: '東海道' },
  { c: 19, r: 5, name: '駿河', kana: 'するが', region: '東海道' },
  { c: 21, r: 5, name: '相模', kana: 'さがみ', region: '東海道' },
  { c: 4, r: 6, name: '隠岐', kana: 'おき', region: '山陰道' },
  { c: 6, r: 6, name: '因幡', kana: 'いなば', region: '山陰道' },
  { c: 8, r: 6, name: '但馬', kana: 'たじま', region: '山陰道' },
  { c: 10, r: 6, name: '丹波', kana: 'たんば', region: '山陰道' },
  { c: 12, r: 6, name: '山城', kana: 'やましろ', region: '畿内' },
  { c: 14, r: 6, name: '伊勢', kana: 'いせ', region: '東海道' },
  { c: 16, r: 6, name: '三河', kana: 'みかわ', region: '東海道' },
  { c: 18, r: 6, name: '遠江', kana: 'とおとうみ', region: '東海道' },
  { c: 20, r: 6, name: '伊豆', kana: 'いず', region: '東海道' },
  // 中国・近畿南部
  { c: 3, r: 7, name: '出雲', kana: 'いずも', region: '山陰道' },
  { c: 5, r: 7, name: '伯耆', kana: 'ほうき', region: '山陰道' },
  { c: 7, r: 7, name: '美作', kana: 'みまさか', region: '山陽道' },
  { c: 9, r: 7, name: '播磨', kana: 'はりま', region: '山陽道' },
  { c: 11, r: 7, name: '摂津', kana: 'せっつ', region: '畿内' },
  { c: 13, r: 7, name: '伊賀', kana: 'いが', region: '東海道' },
  { c: 15, r: 7, name: '志摩', kana: 'しま', region: '東海道' },
  { c: 0, r: 8, name: '長門', kana: 'ながと', region: '山陽道' },
  { c: 2, r: 8, name: '石見', kana: 'いわみ', region: '山陰道' },
  { c: 4, r: 8, name: '備後', kana: 'びんご', region: '山陽道' },
  { c: 6, r: 8, name: '備中', kana: 'びっちゅう', region: '山陽道' },
  { c: 8, r: 8, name: '備前', kana: 'びぜん', region: '山陽道' },
  { c: 10, r: 8, name: '淡路', kana: 'あわじ', region: '南海道' },
  { c: 12, r: 8, name: '河内', kana: 'かわち', region: '畿内' },
  { c: 14, r: 8, name: '大和', kana: 'やまと', region: '畿内' },
  // 九州・四国・紀伊
  { c: -5, r: 9, name: '対馬', kana: 'つしま', region: '西海道' },
  { c: -1, r: 9, name: '豊前', kana: 'ぶぜん', region: '西海道' },
  { c: 1, r: 9, name: '周防', kana: 'すおう', region: '山陽道' },
  { c: 3, r: 9, name: '安芸', kana: 'あき', region: '山陽道' },
  { c: 7, r: 9, name: '讃岐', kana: 'さぬき', region: '南海道' },
  { c: 9, r: 9, name: '阿波', kana: 'あわ', region: '南海道' },
  { c: 11, r: 9, name: '和泉', kana: 'いずみ', region: '畿内' },
  { c: 13, r: 9, name: '紀伊', kana: 'きい', region: '南海道' },
  { c: -4, r: 10, name: '壱岐', kana: 'いき', region: '西海道' },
  { c: -2, r: 10, name: '筑前', kana: 'ちくぜん', region: '西海道' },
  { c: 0, r: 10, name: '豊後', kana: 'ぶんご', region: '西海道' },
  { c: 6, r: 10, name: '伊予', kana: 'いよ', region: '南海道' },
  { c: 8, r: 10, name: '土佐', kana: 'とさ', region: '南海道' },
  { c: -3, r: 11, name: '肥前', kana: 'ひぜん', region: '西海道' },
  { c: -1, r: 11, name: '筑後', kana: 'ちくご', region: '西海道' },
  { c: 1, r: 11, name: '日向', kana: 'ひゅうが', region: '西海道' },
  { c: 0, r: 12, name: '肥後', kana: 'ひご', region: '西海道' },
  { c: 2, r: 12, name: '大隅', kana: 'おおすみ', region: '西海道' },
  { c: 1, r: 13, name: '薩摩', kana: 'さつま', region: '西海道' },
];

const DIRS = [[-2, 0], [2, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

export function buildNeighbors(list) {
  const index = new Map(list.map((p, i) => [`${p.c},${p.r}`, i]));
  return list.map(p =>
    DIRS.map(([dc, dr]) => index.get(`${p.c + dc},${p.r + dr}`)).filter(i => i !== undefined)
  );
}

// 英語表示用のローマ字（長音の記号は省く）
const EN = {
  佐渡: 'Sado', 出羽: 'Dewa', 陸奥: 'Mutsu', 能登: 'Noto', 越後: 'Echigo', 下野: 'Shimotsuke', 常陸: 'Hitachi',
  加賀: 'Kaga', 越中: 'Etchu', 信濃: 'Shinano', 上野: 'Kozuke', 下総: 'Shimosa', 越前: 'Echizen', 飛騨: 'Hida',
  甲斐: 'Kai', 武蔵: 'Musashi', 上総: 'Kazusa', 安房: 'Awa', 丹後: 'Tango', 若狭: 'Wakasa', 近江: 'Omi',
  美濃: 'Mino', 尾張: 'Owari', 駿河: 'Suruga', 相模: 'Sagami', 隠岐: 'Oki', 因幡: 'Inaba', 但馬: 'Tajima',
  丹波: 'Tamba', 山城: 'Yamashiro', 伊勢: 'Ise', 三河: 'Mikawa', 遠江: 'Totomi', 伊豆: 'Izu', 出雲: 'Izumo',
  伯耆: 'Hoki', 美作: 'Mimasaka', 播磨: 'Harima', 摂津: 'Settsu', 伊賀: 'Iga', 志摩: 'Shima', 長門: 'Nagato',
  石見: 'Iwami', 備後: 'Bingo', 備中: 'Bitchu', 備前: 'Bizen', 淡路: 'Awaji', 河内: 'Kawachi', 大和: 'Yamato',
  対馬: 'Tsushima', 豊前: 'Buzen', 周防: 'Suo', 安芸: 'Aki', 讃岐: 'Sanuki', 阿波: 'Awa', 和泉: 'Izumi',
  紀伊: 'Kii', 壱岐: 'Iki', 筑前: 'Chikuzen', 豊後: 'Bungo', 伊予: 'Iyo', 土佐: 'Tosa', 肥前: 'Hizen',
  筑後: 'Chikugo', 日向: 'Hyuga', 肥後: 'Higo', 大隅: 'Osumi', 薩摩: 'Satsuma',
};
const REGION_EN = {
  畿内: 'Kinai', 東海道: 'Tokaido', 東山道: 'Tosando', 北陸道: 'Hokurikudo',
  山陰道: 'San\'indo', 山陽道: 'San\'yodo', 南海道: 'Nankaido', 西海道: 'Saikaido',
};
PROVINCES.forEach((p) => {
  p.en = EN[p.name];
  p.regionEn = REGION_EN[p.region];
});
