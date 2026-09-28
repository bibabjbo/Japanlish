import * as wanakana from 'wanakana';

export interface ReadingResult {
  hiragana: string;
  katakana: string;
  romaji: string;
  altAnswers?: string[];
  needsReview: boolean;
  confidence: 'high' | 'manual' | 'unresolved';
}

// Built-in high-confidence dictionary for common Japanese vocabulary (JLPT N5, N4, common nouns, verbs, adjectives, daily life)
export const COMMON_KANJI_READINGS: Record<string, { hiragana: string; romaji?: string; alt?: string[]; jlpt?: string; category?: string }> = {
  // Verbs
  '行く': { hiragana: 'いく', romaji: 'iku', alt: ['ゆく', 'いきます'], jlpt: 'N5', category: 'Động từ' },
  '来る': { hiragana: 'くる', romaji: 'kuru', alt: ['きます'], jlpt: 'N5', category: 'Động từ' },
  '帰る': { hiragana: 'かえる', romaji: 'kaeru', alt: ['かえります'], jlpt: 'N5', category: 'Động từ' },
  '食べる': { hiragana: 'たべる', romaji: 'taberu', alt: ['たべます'], jlpt: 'N5', category: 'Động từ' },
  '飲む': { hiragana: 'のむ', romaji: 'nomu', alt: ['のみます'], jlpt: 'N5', category: 'Động từ' },
  '見る': { hiragana: 'みる', romaji: 'miru', alt: ['みます'], jlpt: 'N5', category: 'Động từ' },
  '聞く': { hiragana: 'きく', romaji: 'kiku', alt: ['ききます'], jlpt: 'N5', category: 'Động từ' },
  '読む': { hiragana: 'よむ', romaji: 'yomu', alt: ['よみます'], jlpt: 'N5', category: 'Động từ' },
  '書く': { hiragana: 'かく', romaji: 'kaku', alt: ['かきます'], jlpt: 'N5', category: 'Động từ' },
  '話す': { hiragana: 'はなす', romaji: 'hanasu', alt: ['はなします'], jlpt: 'N5', category: 'Động từ' },
  '買う': { hiragana: 'かう', romaji: 'kau', alt: ['かいます'], jlpt: 'N5', category: 'Động từ' },
  '会う': { hiragana: 'あう', romaji: 'au', alt: ['あいます'], jlpt: 'N5', category: 'Động từ' },
  '待つ': { hiragana: 'まつ', romaji: 'matsu', alt: ['まちます'], jlpt: 'N5', category: 'Động từ' },
  '持つ': { hiragana: 'もつ', romaji: 'motsu', alt: ['もちます'], jlpt: 'N5', category: 'Động từ' },
  '借りる': { hiragana: 'かりる', romaji: 'kariru', alt: ['かります'], jlpt: 'N5', category: 'Động từ' },
  '貸す': { hiragana: 'かす', romaji: 'kasu', alt: ['かします'], jlpt: 'N5', category: 'Động từ' },
  '教える': { hiragana: 'おしえる', romaji: 'oshieru', alt: ['おしえます'], jlpt: 'N5', category: 'Động từ' },
  '習う': { hiragana: 'ならう', romaji: 'narau', alt: ['ならいます'], jlpt: 'N5', category: 'Động từ' },
  '勉強する': { hiragana: 'べんきょうする', romaji: 'benkyousuru', alt: ['べんきょうします'], jlpt: 'N5', category: 'Động từ' },
  '寝る': { hiragana: 'ねる', romaji: 'neru', alt: ['ねます'], jlpt: 'N5', category: 'Động từ' },
  '起きる': { hiragana: 'おきる', romaji: 'okiru', alt: ['おきます'], jlpt: 'N5', category: 'Động từ' },
  '歩く': { hiragana: 'あるく', romaji: 'aruku', alt: ['あるきます'], jlpt: 'N5', category: 'Động từ' },
  '走る': { hiragana: 'はしる', romaji: 'hashiru', alt: ['はしります'], jlpt: 'N5', category: 'Động từ' },
  '泳ぐ': { hiragana: 'およぐ', romaji: 'oyogu', alt: ['およぎます'], jlpt: 'N5', category: 'Động từ' },
  '働く': { hiragana: 'はたらく', romaji: 'hataraku', alt: ['はたらきます'], jlpt: 'N5', category: 'Động từ' },
  '休む': { hiragana: 'やすむ', romaji: 'yasumu', alt: ['やすみます'], jlpt: 'N5', category: 'Động từ' },
  '終わる': { hiragana: 'おわる', romaji: 'owaru', alt: ['おわります'], jlpt: 'N5', category: 'Động từ' },
  '始まる': { hiragana: 'はじまる', romaji: 'hajimaru', alt: ['はじまります'], jlpt: 'N5', category: 'Động từ' },
  '開ける': { hiragana: 'あける', romaji: 'akeru', alt: ['あけます'], jlpt: 'N5', category: 'Động từ' },
  '閉める': { hiragana: 'しめる', romaji: 'shimeru', alt: ['しめます'], jlpt: 'N5', category: 'Động từ' },
  '撮る': { hiragana: 'とる', romaji: 'toru', alt: ['とります'], jlpt: 'N5', category: 'Động từ' },

  // People & Family
  '学生': { hiragana: 'がくせい', romaji: 'gakusei', jlpt: 'N5', category: 'Con người' },
  '先生': { hiragana: 'せんせい', romaji: 'sensei', jlpt: 'N5', category: 'Con người' },
  '友達': { hiragana: 'ともだち', romaji: 'tomodachi', jlpt: 'N5', category: 'Con người' },
  '人': { hiragana: 'ひと', romaji: 'hito', alt: ['じん', 'にん'], jlpt: 'N5', category: 'Con người' },
  '男': { hiragana: 'おとこ', romaji: 'otoko', jlpt: 'N5', category: 'Con người' },
  '女': { hiragana: 'おんな', romaji: 'onna', jlpt: 'N5', category: 'Con người' },
  '子供': { hiragana: 'こども', romaji: 'kodomo', jlpt: 'N5', category: 'Con người' },
  '家族': { hiragana: 'かぞく', romaji: 'kazoku', jlpt: 'N5', category: 'Gia đình' },
  '父': { hiragana: 'ちち', romaji: 'chichi', alt: ['とうさん', 'おとうさん'], jlpt: 'N5', category: 'Gia đình' },
  '母': { hiragana: 'はは', romaji: 'haha', alt: ['かあさん', 'おかあさん'], jlpt: 'N5', category: 'Gia đình' },
  '兄': { hiragana: 'あに', romaji: 'ani', alt: ['おにいさん'], jlpt: 'N5', category: 'Gia đình' },
  '姉': { hiragana: 'あね', romaji: 'ane', alt: ['おねえさん'], jlpt: 'N5', category: 'Gia đình' },
  '弟': { hiragana: 'おとうと', romaji: 'otouto', jlpt: 'N5', category: 'Gia đình' },
  '妹': { hiragana: 'いもうと', romaji: 'imouto', jlpt: 'N5', category: 'Gia đình' },
  '私': { hiragana: 'わたし', romaji: 'watashi', alt: ['わたくし'], jlpt: 'N5', category: 'Đại từ' },
  '彼': { hiragana: 'かれ', romaji: 'kare', jlpt: 'N5', category: 'Đại từ' },
  '彼女': { hiragana: 'かのじょ', romaji: 'kanojo', jlpt: 'N5', category: 'Đại từ' },

  // Objects & Everyday items
  '写真': { hiragana: 'しゃしん', romaji: 'shashin', jlpt: 'N5', category: 'Đồ vật' },
  '本': { hiragana: 'ほん', romaji: 'hon', jlpt: 'N5', category: 'Đồ vật' },
  '辞書': { hiragana: 'じしょ', romaji: 'jisho', jlpt: 'N5', category: 'Đồ vật' },
  '雑誌': { hiragana: 'ざっし', romaji: 'zasshi', jlpt: 'N5', category: 'Đồ vật' },
  '新聞': { hiragana: 'しんぶん', romaji: 'shinbun', jlpt: 'N5', category: 'Đồ vật' },
  '手紙': { hiragana: 'てがみ', romaji: 'tegami', jlpt: 'N5', category: 'Đồ vật' },
  '切手': { hiragana: 'きって', romaji: 'kitte', jlpt: 'N5', category: 'Đồ vật' },
  '車': { hiragana: 'くるま', romaji: 'kuruma', alt: ['じどうしゃ'], jlpt: 'N5', category: 'Phương tiện' },
  '自動車': { hiragana: 'じどうしゃ', romaji: 'jidousha', jlpt: 'N5', category: 'Phương tiện' },
  '自転車': { hiragana: 'じてんしゃ', romaji: 'jitensha', jlpt: 'N5', category: 'Phương tiện' },
  '電車': { hiragana: 'でんしゃ', romaji: 'densha', jlpt: 'N5', category: 'Phương tiện' },
  '地下鉄': { hiragana: 'ちかてつ', romaji: 'chikatetsu', jlpt: 'N5', category: 'Phương tiện' },
  '飛行機': { hiragana: 'ひこうき', romaji: 'hikouki', jlpt: 'N5', category: 'Phương tiện' },
  '船': { hiragana: 'ふね', romaji: 'fune', jlpt: 'N5', category: 'Phương tiện' },
  '電話': { hiragana: 'でんわ', romaji: 'denwa', jlpt: 'N5', category: 'Đồ vật' },
  '時計': { hiragana: 'とけい', romaji: 'tokei', jlpt: 'N5', category: 'Đồ vật' },
  '傘': { hiragana: 'かさ', romaji: 'kasa', jlpt: 'N5', category: 'Đồ vật' },
  '靴': { hiragana: 'くつ', romaji: 'kutsu', jlpt: 'N5', category: 'Đồ vật' },
  '服': { hiragana: 'ふく', romaji: 'fuku', jlpt: 'N5', category: 'Đồ vật' },
  '財布': { hiragana: 'さいふ', romaji: 'saifu', jlpt: 'N5', category: 'Đồ vật' },
  'お金': { hiragana: 'おかね', romaji: 'okane', alt: ['かね'], jlpt: 'N5', category: 'Đồ vật' },
  '荷物': { hiragana: 'にもつ', romaji: 'nimotsu', jlpt: 'N5', category: 'Đồ vật' },
  '鍵': { hiragana: 'かぎ', romaji: 'kagi', jlpt: 'N5', category: 'Đồ vật' },
  '机': { hiragana: 'つくえ', romaji: 'tsukue', jlpt: 'N5', category: 'Đồ vật' },
  '椅子': { hiragana: 'いす', romaji: 'isu', jlpt: 'N5', category: 'Đồ vật' },

  // Food & Drinks
  '水': { hiragana: 'みず', romaji: 'mizu', alt: ['おみず'], jlpt: 'N5', category: 'Đồ uống' },
  'お茶': { hiragana: 'おちゃ', romaji: 'ocha', alt: ['ちゃ'], jlpt: 'N5', category: 'Đồ uống' },
  '牛乳': { hiragana: 'ぎゅうにゅう', romaji: 'gyuunyuu', jlpt: 'N5', category: 'Đồ uống' },
  'お酒': { hiragana: 'おさけ', romaji: 'osake', alt: ['さけ'], jlpt: 'N5', category: 'Đồ uống' },
  '食べ物': { hiragana: 'たべもの', romaji: 'tabemono', jlpt: 'N5', category: 'Đồ ăn' },
  '飲み物': { hiragana: 'のみもの', romaji: 'nomimono', jlpt: 'N5', category: 'Đồ uống' },
  '肉': { hiragana: 'にく', romaji: 'niku', jlpt: 'N5', category: 'Đồ ăn' },
  '魚': { hiragana: 'さかな', romaji: 'sakana', jlpt: 'N5', category: 'Đồ ăn' },
  '野菜': { hiragana: 'やさい', romaji: 'yasai', jlpt: 'N5', category: 'Đồ ăn' },
  '卵': { hiragana: 'たまご', romaji: 'tamago', jlpt: 'N5', category: 'Đồ ăn' },
  '果物': { hiragana: 'くだもの', romaji: 'kudamono', jlpt: 'N5', category: 'Đồ ăn' },
  '料理': { hiragana: 'りょうり', romaji: 'ryouri', jlpt: 'N5', category: 'Đồ ăn' },
  '朝ご飯': { hiragana: 'あさごはん', romaji: 'asagohan', jlpt: 'N5', category: 'Đồ ăn' },
  '昼ご飯': { hiragana: 'ひるごはん', romaji: 'hirugohan', jlpt: 'N5', category: 'Đồ ăn' },
  '晩ご飯': { hiragana: 'ばんごはん', romaji: 'bangohan', jlpt: 'N5', category: 'Đồ ăn' },
  'ご飯': { hiragana: 'ごはん', romaji: 'gohan', jlpt: 'N5', category: 'Đồ ăn' },

  // Places
  '学校': { hiragana: 'がっこう', romaji: 'gakkou', jlpt: 'N5', category: 'Địa điểm' },
  '大学': { hiragana: 'だいがく', romaji: 'daigaku', jlpt: 'N5', category: 'Địa điểm' },
  '高校': { hiragana: 'こうこう', romaji: 'koukou', jlpt: 'N5', category: 'Địa điểm' },
  '教室': { hiragana: 'きょうしつ', romaji: 'kyoushitsu', jlpt: 'N5', category: 'Địa điểm' },
  '部屋': { hiragana: 'へや', romaji: 'heya', jlpt: 'N5', category: 'Địa điểm' },
  '家': { hiragana: 'いえ', romaji: 'ie', alt: ['うち'], jlpt: 'N5', category: 'Địa điểm' },
  '病院': { hiragana: 'びょういん', romaji: 'byouin', jlpt: 'N5', category: 'Địa điểm' },
  '駅': { hiragana: 'えき', romaji: 'eki', jlpt: 'N5', category: 'Địa điểm' },
  '会社': { hiragana: 'かいしゃ', romaji: 'kaisha', jlpt: 'N5', category: 'Địa điểm' },
  '銀行': { hiragana: 'ぎんこう', romaji: 'ginkou', jlpt: 'N5', category: 'Địa điểm' },
  '郵便局': { hiragana: 'ゆうびんきょく', romaji: 'yuubinkyoku', jlpt: 'N5', category: 'Địa điểm' },
  '図書館': { hiragana: 'としょかん', romaji: 'toshokan', jlpt: 'N5', category: 'Địa điểm' },
  '映画館': { hiragana: 'えいがかん', romaji: 'eigakan', jlpt: 'N5', category: 'Địa điểm' },
  '公園': { hiragana: 'こうえん', romaji: 'kouen', jlpt: 'N5', category: 'Địa điểm' },
  '店': { hiragana: 'みせ', romaji: 'mise', alt: ['おみせ'], jlpt: 'N5', category: 'Địa điểm' },
  '食堂': { hiragana: 'しょくどう', romaji: 'shokudou', jlpt: 'N5', category: 'Địa điểm' },
  '空港': { hiragana: 'くうこう', romaji: 'kuukou', jlpt: 'N5', category: 'Địa điểm' },
  '国': { hiragana: 'くに', romaji: 'kuni', alt: ['おくに'], jlpt: 'N5', category: 'Địa điểm' },
  '日本': { hiragana: 'にほん', romaji: 'nihon', alt: ['にっぽん'], jlpt: 'N5', category: 'Địa điểm' },

  // Animals & Nature
  '猫': { hiragana: 'ねこ', romaji: 'neko', jlpt: 'N5', category: 'Động vật' },
  '犬': { hiragana: 'いぬ', romaji: 'inu', jlpt: 'N5', category: 'Động vật' },
  '鳥': { hiragana: 'とり', romaji: 'tori', jlpt: 'N5', category: 'Động vật' },
  '花': { hiragana: 'はな', romaji: 'hana', jlpt: 'N5', category: 'Tự nhiên' },
  '木': { hiragana: 'き', romaji: 'ki', jlpt: 'N5', category: 'Tự nhiên' },
  '山': { hiragana: 'やま', romaji: 'yama', jlpt: 'N5', category: 'Tự nhiên' },
  '川': { hiragana: 'かわ', romaji: 'kawa', jlpt: 'N5', category: 'Tự nhiên' },
  '海': { hiragana: 'うみ', romaji: 'umi', jlpt: 'N5', category: 'Tự nhiên' },
  '空': { hiragana: 'そら', romaji: 'sora', jlpt: 'N5', category: 'Tự nhiên' },
  '雨': { hiragana: 'あめ', romaji: 'ame', jlpt: 'N5', category: 'Thời tiết' },
  '雪': { hiragana: 'ゆき', romaji: 'yuki', jlpt: 'N5', category: 'Thời tiết' },
  '天気': { hiragana: 'てんき', romaji: 'tenki', jlpt: 'N5', category: 'Thời tiết' },

  // Time & Days
  '今度': { hiragana: 'こんど', romaji: 'kondo', jlpt: 'N5', category: 'Thời gian' },
  '今': { hiragana: 'いま', romaji: 'ima', jlpt: 'N5', category: 'Thời gian' },
  '今日': { hiragana: 'きょう', romaji: 'kyou', jlpt: 'N5', category: 'Thời gian' },
  '明日': { hiragana: 'あした', romaji: 'ashita', alt: ['あす', 'みょうにち'], jlpt: 'N5', category: 'Thời gian' },
  '昨日': { hiragana: 'きのう', romaji: 'kinou', alt: ['さくじつ'], jlpt: 'N5', category: 'Thời gian' },
  '毎日': { hiragana: 'まいにち', romaji: 'mainichi', jlpt: 'N5', category: 'Thời gian' },
  '朝': { hiragana: 'あさ', romaji: 'asa', jlpt: 'N5', category: 'Thời gian' },
  '昼': { hiragana: 'ひる', romaji: 'hiru', jlpt: 'N5', category: 'Thời gian' },
  '晩': { hiragana: 'ばん', romaji: 'ban', alt: ['よる'], jlpt: 'N5', category: 'Thời gian' },
  '夜': { hiragana: 'よる', romaji: 'yoru', jlpt: 'N5', category: 'Thời gian' },
  '時間': { hiragana: 'じかん', romaji: 'jikan', jlpt: 'N5', category: 'Thời gian' },
  '午前': { hiragana: 'ごぜん', romaji: 'gozen', jlpt: 'N5', category: 'Thời gian' },
  '午後': { hiragana: 'ごご', romaji: 'gogo', jlpt: 'N5', category: 'Thời gian' },
  '今週': { hiragana: 'こんしゅう', romaji: 'konshuu', jlpt: 'N5', category: 'Thời gian' },
  '来週': { hiragana: 'らいしゅう', romaji: 'raishuu', jlpt: 'N5', category: 'Thời gian' },
  '先週': { hiragana: 'せんしゅう', romaji: 'senshuu', jlpt: 'N5', category: 'Thời gian' },
  '今月': { hiragana: 'こんげつ', romaji: 'kongetsu', jlpt: 'N5', category: 'Thời gian' },
  '来月': { hiragana: 'らいげつ', romaji: 'raigetsu', jlpt: 'N5', category: 'Thời gian' },
  '先月': { hiragana: 'せんげつ', romaji: 'sengetsu', jlpt: 'N5', category: 'Thời gian' },
  '今年': { hiragana: 'ことし', romaji: 'kotoshi', jlpt: 'N5', category: 'Thời gian' },
  '来年': { hiragana: 'らいねん', romaji: 'rainen', jlpt: 'N5', category: 'Thời gian' },
  '去年': { hiragana: 'きょねん', romaji: 'kyonen', jlpt: 'N5', category: 'Thời gian' },
  '誕生日': { hiragana: 'たんじょうび', romaji: 'tanjoubi', jlpt: 'N5', category: 'Thời gian' },

  // Adjectives
  '大きい': { hiragana: 'おおきい', romaji: 'ookii', jlpt: 'N5', category: 'Tính từ' },
  '小さい': { hiragana: 'ちいさい', romaji: 'chiisai', jlpt: 'N5', category: 'Tính từ' },
  '新しい': { hiragana: 'あたらしい', romaji: 'atarashii', jlpt: 'N5', category: 'Tính từ' },
  '古い': { hiragana: 'ふるい', romaji: 'furui', jlpt: 'N5', category: 'Tính từ' },
  'いい': { hiragana: 'いい', romaji: 'ii', alt: ['よい'], jlpt: 'N5', category: 'Tính từ' },
  '悪い': { hiragana: 'わるい', romaji: 'warui', jlpt: 'N5', category: 'Tính từ' },
  '暑い': { hiragana: 'あつい', romaji: 'atsui', jlpt: 'N5', category: 'Tính từ' },
  '熱い': { hiragana: 'あつい', romaji: 'atsui', jlpt: 'N5', category: 'Tính từ' },
  '寒い': { hiragana: 'さむい', romaji: 'samui', jlpt: 'N5', category: 'Tính từ' },
  '冷たい': { hiragana: 'つめたい', romaji: 'tsumetai', jlpt: 'N5', category: 'Tính từ' },
  '難しい': { hiragana: 'むずかしい', romaji: 'muzukashii', jlpt: 'N5', category: 'Tính từ' },
  '易しい': { hiragana: 'やさしい', romaji: 'yasashii', jlpt: 'N5', category: 'Tính từ' },
  '高い': { hiragana: 'たかい', romaji: 'takai', jlpt: 'N5', category: 'Tính từ' },
  '安い': { hiragana: 'やすい', romaji: 'yasui', jlpt: 'N5', category: 'Tính từ' },
  '低い': { hiragana: 'ひくい', romaji: 'hikui', jlpt: 'N5', category: 'Tính từ' },
  '面白い': { hiragana: 'おもしろい', romaji: 'omoshiroi', jlpt: 'N5', category: 'Tính từ' },
  '美味しい': { hiragana: 'おいしい', romaji: 'oishii', jlpt: 'N5', category: 'Tính từ' },
  '忙しい': { hiragana: 'いそがしい', romaji: 'isogashii', jlpt: 'N5', category: 'Tính từ' },
  '楽しい': { hiragana: 'たのしい', romaji: 'tanoshii', jlpt: 'N5', category: 'Tính từ' },
  '静か': { hiragana: 'しずか', romaji: 'shizuka', jlpt: 'N5', category: 'Tính từ' },
  '有名': { hiragana: 'ゆうめい', romaji: 'yuumei', jlpt: 'N5', category: 'Tính từ' },
  '親切': { hiragana: 'しんせつ', romaji: 'shinsetsu', jlpt: 'N5', category: 'Tính từ' },
  '元気': { hiragana: 'げんき', romaji: 'genki', jlpt: 'N5', category: 'Tính từ' },
  '暇': { hiragana: 'ひま', romaji: 'hima', jlpt: 'N5', category: 'Tính từ' },
  '便利': { hiragana: 'べんり', romaji: 'benri', jlpt: 'N5', category: 'Tính từ' },
  '好き': { hiragana: 'すき', romaji: 'suki', jlpt: 'N5', category: 'Tính từ' },
  '嫌い': { hiragana: 'きらい', romaji: 'kirai', jlpt: 'N5', category: 'Tính từ' },
  '上手': { hiragana: 'じょうず', romaji: 'jouzu', jlpt: 'N5', category: 'Tính từ' },
  '下手': { hiragana: 'へた', romaji: 'heta', jlpt: 'N5', category: 'Tính từ' },

  // Activities & Concepts
  '旅行': { hiragana: 'りょこう', romaji: 'ryokou', jlpt: 'N5', category: 'Hoạt động' },
  '買い物': { hiragana: 'かいもの', romaji: 'kaimono', jlpt: 'N5', category: 'Hoạt động' },
  '散歩': { hiragana: 'さんぽ', romaji: 'sanpo', jlpt: 'N5', category: 'Hoạt động' },
  '仕事': { hiragana: 'しごと', romaji: 'shigoto', jlpt: 'N5', category: 'Công việc' },
  '質問': { hiragana: 'しつもん', romaji: 'shitsumon', jlpt: 'N5', category: 'Khái niệm' },
  '問題': { hiragana: 'もんだい', romaji: 'mondai', jlpt: 'N5', category: 'Khái niệm' },
  '答え': { hiragana: 'こたえ', romaji: 'kotae', jlpt: 'N5', category: 'Khái niệm' },
  '意味': { hiragana: 'いみ', romaji: 'imi', jlpt: 'N5', category: 'Khái niệm' },
  '映画': { hiragana: 'えいが', romaji: 'eiga', jlpt: 'N5', category: 'Giải trí' },
  '音楽': { hiragana: 'おんがく', romaji: 'ongaku', jlpt: 'N5', category: 'Giải trí' },
  '歌': { hiragana: 'うた', romaji: 'uta', jlpt: 'N5', category: 'Giải trí' },
};

/**
 * Automatically resolves readings (Hiragana, Katakana, Romaji) for a Japanese word.
 * Follows the strict rule:
 * - If already pure Kana (e.g. コーヒー, ありがとう): 100% confidence, returns exact Hiragana, Katakana, Romaji.
 * - If found in high-confidence dictionary: returns accurate readings.
 * - If containing Kanji and not found: DOES NOT guess falsely. Returns needsReview: true so the user can easily review and edit it.
 */
export function autoResolveJapaneseReadings(japaneseText: string, providedHiragana?: string): ReadingResult {
  const trimmed = japaneseText.trim();
  if (!trimmed) {
    return {
      hiragana: '',
      katakana: '',
      romaji: '',
      needsReview: true,
      confidence: 'unresolved',
    };
  }

  // Case 1: If user or CSV already provided a valid Hiragana reading
  if (providedHiragana && providedHiragana.trim()) {
    const cleanHiragana = providedHiragana.trim();
    const katakana = wanakana.toKatakana(cleanHiragana);
    const romaji = wanakana.toRomaji(cleanHiragana);
    return {
      hiragana: cleanHiragana,
      katakana,
      romaji,
      needsReview: false,
      confidence: 'manual',
    };
  }

  // Case 2: Pure Kana word (Hiragana or Katakana, e.g. コーヒー, ここ, りんご)
  // Check if string contains only kana, long vowel marks (ー), or spaces
  const isPureKana = /^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]+$/.test(trimmed);
  if (isPureKana) {
    const hiragana = wanakana.toHiragana(trimmed);
    const katakana = wanakana.toKatakana(trimmed);
    const romaji = wanakana.toRomaji(hiragana);
    return {
      hiragana,
      katakana,
      romaji,
      needsReview: false,
      confidence: 'high',
    };
  }

  // Case 3: High-confidence dictionary lookup
  const entry = COMMON_KANJI_READINGS[trimmed];
  if (entry) {
    const hiragana = entry.hiragana;
    const katakana = wanakana.toKatakana(hiragana);
    const romaji = entry.romaji || wanakana.toRomaji(hiragana);
    return {
      hiragana,
      katakana,
      romaji,
      altAnswers: entry.alt,
      needsReview: false,
      confidence: 'high',
    };
  }

  // Case 4: Word contains Kanji and is not found with high confidence
  // Do NOT silently guess or produce inaccurate furigana!
  // Mark as needsReview: true
  return {
    hiragana: '',
    katakana: '',
    romaji: '',
    needsReview: true,
    confidence: 'unresolved',
  };
}
