export const CHARA_ID = {
    MEMBER_31A: [1, 2, 3, 4, 5, 6],
    MEMBER_31C: [13, 14, 15, 16, 17, 18],
    MEMBER_31E: [25, 26, 27, 28, 29, 30],
    MARUYAMA: [15, 16, 28, 32, 40, 47],
    RUKA_SHARO: [1, 42],
    SHADOW_CLONE: [17, 18],
    RISA: 22,
    MIYA: 45,
    STRENGTH_BUFF: 4,
    STRENGTH_DEBUFF: 11,
}

export const STYLE_ID = {
    ONLY_MOON_LIGHT: 145,   // 月光月歌
    WEDING_SHARO: 123,  // ウェディングシャロ
    UNISON_BUNGO: 161,  // ユニソン豊後
    SERVANT: [162, 163],    // 下僕天音、聖羅
    UNISON_KARENCHAN: 177,  // ユニソンカレンチャン
    KITCHEN_VRITIKA: 181,  // キッチンヴリティカ
    KITCHEN_SHARO: 182,  // キッチンシャロ
}

export const SKILL_ID = {
    DANCING_COOL_BREEZE: 390, // 爽籟に舞う仁慈
    PIRATES_CANON: 478, // 豪快！パイレーツキャノン
    WAKING_NIGHT: 495, // 夜醒
    MEDITATION: 501, // メディテーション
    SAIO_RENRI: 546, // 彩鳳連理
    MARUYAMA_MEMBER: 547, // 行くぞ！丸山部隊
    NOVA_ELIMINATION: 591, // ノヴァエリミネーション
    MEGA_DESTROYER: 623, // メガデストロイヤー
    CAT_JET_SHOOTING: 633, // ネコジェットシャテキ
    RUBY_PERFUME: 635, // ルビー・パヒューム
    BOUQUET_SHOOT: 640, // ファーマメントブーケショット
    SUMMER_FINE_WEATHER: 658, // 夏のひより
    CONSPIRACY: 669, // 謀略
    DOMINATION_GRAVITY: 670, //	ドミネーション・グラビティ
}

export const BUFF_ID = {
    MOON_LIGHT: 2607,   // 月光
    MEGA_DESTROYER5: 235,   // メガデストロイヤー5人
    MEGA_DESTROYER6: 236,   // メガデストロイヤー5人
}

export const ABILITY_ID = {
    MOROIUO: 506, // モロイウオ
    EVIL_ARMY: 511, // 悪の軍団は最強でゲス！
    KIREAJI: 602, // キレアジ
    QUIET_PRESSURE: 515, // 静かなプレッシャー
    ADMIRAL_COMMON: 299, // 指揮行動
    BLUE_SKY: 510, // 蒼天
    QUICK_RECAST: 1506, // クイックリキャスト
    DOUBLE_LIFT: 1516, // ダブルリフト
    AUTO_PURSUIT: 1530 // 自動追撃,
}

export const STATUS_KBN = ["", "str", "dex", "con", "mnd", "int", "luk"];

/** ロール */
export const ROLE = {
    ATTACKER: 1,
    BREAKER: 2,
    BLASTER: 3,
    HEALER: 4,
    BUFFER: 5,
    DEBUFFER: 6,
    DEFENDER: 7,
    ADMIRAL: 8,
}
/** フィールド */
export const ELEMENT = {
    NORMAL: 0, // 通常
    FIRE: 1, // 火
    ICE: 2, // 氷
    THUNDER: 3, // 雷
    LIGHT: 4, // 光
    DARK: 5, // 闇
}

/** バフ種別 */
export const BUFF = {
    ATTACKUP: 0, // 攻撃力アップ
    ELEMENT_ATTACKUP: 1, // 属性攻撃力アップ
    MINDEYE: 2, // 心眼
    DEFENSEDOWN: 3, // 防御ダウン
    ELEMENT_DEFENSEDOWN: 4, // 属性防御ダウン
    FRAGILE: 5, // 脆弱
    CRITICALRATEUP: 6, // クリ率
    CRITICALDAMAGEUP: 7, // クリダメ
    ELEMENT_CRITICALRATEUP: 8, // 属性クリ率
    ELEMENT_CRITICALDAMAGEUP: 9, // 属性クリダメ
    CHARGE: 10,// チャージ
    FIELD: 11, // フィールド
    DAMAGERATEUP: 12, // 破壊率アップ
    OVERDRIVEPOINTUP: 13, // OD増加
    FIGHTINGSPIRIT: 14, // 闘志
    MISFORTUNE: 15, // 厄
    FUNNEL: 16, // 連撃
    STRONG_BREAK: 18, // 強ブレイク
    DEFENSEDP: 19, // DP防御ダウン
    RESISTDOWN: 20, // 耐性ダウン
    ETERNAL_DEFENSEDOWN: 21, // 永続防御力ダウン
    ELEMENT_ETERNAL_DEFENSEDOWN: 22, // 永続属性防御ダウン
    HEALSP: 23, // SP増加
    RECOIL: 24, // 行動不能
    PROVOKE: 25, // 挑発
    ADDITIONALTURN: 26, // 追加ターン
    COVER: 27, // 注目
    GIVEATTACKBUFFUP: 28, // バフ強化
    GIVEDEBUFFUP: 29, // デバフ強化
    ARROWCHERRYBLOSSOMS: 30, // 桜花の矢
    ETERNAL_OARH: 31, // 永遠なる誓い
    EX_DOUBLE: 32, // EXスキル連続発動
    BABIED: 33, // オギャり
    MORALE: 34, // 士気
    HACKING: 35, // ハッキング
    DIVA_BLESS: 36, // 歌姫の加護
    SHREDDING: 37, // 速弾き
    NAGATIVE: 38, // ネガティブ
    YAMAWAKI_SERVANT: 39, // 山脇様のしもべ 
    HIGH_BOOST: 40, // ハイブースト状態
    SHADOW_CLONE: 41, // 影分身
    MAKEUP: 42, // メイクアップ
    FIRE_MARK: 43, // 火の印 
    CURRY: 44, // カリー
    SHCHI: 45, // シチー
    HEALEP: 52, // EP回復
    DISPEL: 90, // ディスペル
    ABILITY_FUNNEL: 116, // アビリティ連撃
}

/** アビリティ/パッシブ効果 */
export const EFFECT = {
    ATTACKUP: 1, // 攻撃力アップ
    DEFFENCEDOWN: 2, // 防御力ダウン
    CRITICALRATEUP: 3, // クリティカル率アップ
    CRITICAL_DAMAGE_UP: 4, // クリティカルダメージアップ
    DAMAGERATEUP: 5, // 破壊率上昇量アップ
    FUNNEL: 6, // 連撃数アップ
    FIELD_DEPLOYMENT: 7, // フィールド展開
    CHARGE: 8, // チャージ
    OVERDRIVE_SP: 9, // ODSPアップ
    FUNNEL_ALWAYS: 10, // 連撃数(永続)アップ
    DEFFENCEUP: 11, // 防御力アップ
    HEALSP: 12, // SP回復
    HEALDP: 13, // DP回復
    OVERDRIVEPOINTUP: 14, // ODアップ
    COST_SP_DOWN: 15, // 消費SPダウン
    MORALE: 16, // 士気
    GIVEATTACKBUFFUP: 17, // 攻撃力バフ強化
    GIVEDEFFENCEDEBUFFUP: 18, // 防御力デバフ強化
    BREAK_GUARD: 20, // ブレイクガード
    STUN: 21, // スタン
    MISFORTUNE: 22, // 厄
    ARROWCHERRYBLOSSOMS: 23, // 桜花の矢
    SHADOW_CLONE: 24, // 影分身
    STATUSUP_VALUE: 25, // 能力上昇(固定)
    STATUSUP_RATE: 26, // 能力上昇(%)
    FIELD_STRENGTHEN: 27, // フィールド強化
    ADDITIONALTURN: 29, // 追加ターン
    TOKEN_UP: 30, // トークンアップ
    TOKEN_ATTACKUP: 31, // トークン1つにつき攻撃力アップ
    TOKEN_DEFFENCEUP: 32, // トークン1つにつき防御力アップ
    TOKEN_DAMAGERATEUP: 33, // トークン1つにつき破壊率アップ
    YAMAWAKI_SERVANT: 39, // 山脇様のしもべ
    HIGH_BOOST: 40, // ハイブースト状態
    MAKEUP: 41, // メイクアップ
    FIRE_MARK: 43, // 火の印 
    NEGATIVE: 51, // ネガティブ
    HEALEP: 52, // EP回復
    ATTACKUP_AND_DAMAGERATEUP: 53, // 攻撃力＋破壊率アップ
}

/** フィールド */
export const FIELD = {
    NORMAL: 0, // 通常
    FIRE: 1, // 火
    ICE: 2, // 氷
    THUNDER: 3, // 雷
    LIGHT: 4, // 光
    DARK: 5, // 闇
    RICE: 6, // 稲穂
    SANDSTORM: 7, // 砂嵐
}

/** 対象 */
export const RANGE = {
    FIELD: 0, // 場
    ENEMY_UNIT: 1, // 敵単体
    ENEMY_ALL: 2, // 敵全体
    ALLY_UNIT: 3, // 味方単体
    ALLY_FRONT: 4, // 味方前衛
    ALLY_BACK: 5, // 味方後衛
    ALLY_ALL: 6, // 味方全員
    SELF: 7, // 自分
    SELF_OTHER: 8, // 自分以外
    SELF_AND_UNIT: 9, // 自分と味方単体
    FRONT_OTHER: 10, // 自分以外の前衛
    OTHER_UNIT: 11, // 自分以外の味方単体
    MEMBER_31C: 33, // 31Cメンバー
    MEMBER_31E: 35, // 31Eメンバー
    MARUYAMA_MEMBER: 41, // 丸山部隊
    RUKA_SHARO: 42, // 月歌とシャロ
    OTHER: 99, // その他
}

/** スキル属性 */
export const ATTRIBUTE = {
    NORMAL_ATTACK: 1, // 通常攻撃
    PURSUIT: 2, // 追撃
    COMMAND_ACTION: 3, // 指揮行動
    PURSUIT_ONLY: 5, // 追撃のみ発動可能
    SP_HALF: 11, // SP消費半減
    SP_ZERO: 12, // SP消費0
    NOT_ACTION: 99, // 行動無し
}

/** 条件 */
export const CONDITIONS = {
    FIRST_TURN: 1, // 1ターン目
    SKILL_INIT: 2, // 初回
    additionalTurn: 3, // 追加ターン
    OVER_DRIVE: 4, // オーバードライブ中
    DESTRUCTION_OVER_200: 5, // 破壊率200%以上
    BREAK: 6, // ブレイク時
    PERCENTAGE_30: 7, // 確率30%
    DOWN_TURN: 8, // ダウンターン
    BUFF_DISPEL: 9, // バフ解除
    SUPER_DOWN: 10, // 超ダウン
    DEFFENCE_DOWN: 11, // 防御ダウン中
    FRAGILE: 12, // 脆弱中
    TARGET_COVER: 13, // 集中・挑発状態
    FIELD_NONE: 14, // フィールドなし
    FIELD_ELEMENT: 15, // 属性フィールド
    HAS_ABILITY: 20, // アビリティ発動中
    HAS_CHARGE: 21, // チャージ中
    HAS_SHADOW: 22, // 影分身中
    HAS_DODGE: 23, // 回避状態
    TOKEN_OVER_4: 24, // トークン4つ以上
    DP_OVER_100: 25, // DP100％以上
    SP_UNDER_0_ALL: 26, // SP0以下の味方がいる
    SARVANT_OVER: 27, // 山脇様のしもべ
    FIRE_MARK: 28, // 火の印
    MORALE_OVER_LV: 30, // 士気Lv以上
    OVER_31A_3: 31, // 31A3人以上
    OVER_31C_3: 33, // 31C3人以上
    OVER_31D_3: 34, // 31D3人以上
    OVER_31E_3: 35, // 31E3人以上
    SELECT_31A: 37, // 31A選択
    SELECT_CHARA: 38, // 特定キャラを選択
    FIELD_NOT_FIRE: 41, // 火属性以外フィールド
    DIVA_BLESS: 42, // 歌姫の加護
    NOT_DIVA_BLESS: 43, // 歌姫の加護以外
    NOT_NEGATIVE: 44, // ネガティブ以外
    HAS_MAEKUP: 45, // メイクアップ状態
    ENEMY_COUNT: 51, // 敵数指定
    USE_COUNT: 52, // 回数以降
}

/** 敵リスト*/
export const ENEMY_CLASS = {
    HARD_LAYER: 1, // 異時層
    ORB_BOSS: 2, // オーブボス
    CLOCK_TOWER_NORMAL: 3, // 時計塔(N)
    CLOCK_TOWER_HARD: 4, // 時計塔(H)
    JEWEL_LABYRINTH: 5, // 宝珠の迷宮
    SCORE_ATTACK: 6, // スコアアタック
    PRISMATIC_BATTLE: 7, // プリズムバトル
    STELLAR_SWEEP_FRONT: 8, // 恒星掃戦線
    EVENT_HIDDEN_BOSS: 9, // イベント隠しボス
    TIME_TRAINING: 10, // 時の修練場
    CONTROL_BATTLE: 11, // 制圧戦
    SERAPH_ENCOUNTER: 12, // セラフ遭遇戦
    EVENT_PRISMATIC: 13, // イベントプリズム
    FREE_INPUT: 99, // 自由入力
}

/** スキル種類 */
export const KIND = {
    PURPOSE: 0, // 汎用
    EX_GENERATE: 1, // EX(ジェネライズ)
    EX_EXCLUSIVE: 2, // EX(専用)
    MASTER: 5, // マスター
    ORB: 7, // オーブ
    OTHER: 9, // その他
}

/** 汎用スキル */
export const SKILL = {
    NORMAL_ATTACK: 1, // 通常攻撃
    NONE: 2, // 無し
    PURSUIT: 3, // 追撃
    COMMAND_ACTION: 4, // 指揮行動
    AUTO_PURSUIT: 5, // 自動追撃
}

// 単独発動バフ
export const ALONE_ACTIVATION_BUFF_KIND = [
    BUFF.ATTACKUP,
    BUFF.ELEMENT_ATTACKUP,
    BUFF.MINDEYE,
    BUFF.CRITICALRATEUP,
    BUFF.CRITICALDAMAGEUP,
    BUFF.ELEMENT_CRITICALRATEUP,
    BUFF.ELEMENT_CRITICALDAMAGEUP,
    BUFF.FUNNEL,
    BUFF.BABIED,
    BUFF.DIVA_BLESS,
    BUFF.SHREDDING,
]
/** 単独発動アビリティ */
export const ALONE_ACTIVATION_ABILITY_LIST = [12, 407, 408];

export const JEWEL_TYPE = {
    ATTACK_UP: 1,
    HEAL_UP: 2,
    SKILL_ATTACKUP: 3,
    SKILL_DEBUFFUP: 4,
    CRITICALRATE_UP: 5,
    FOCUS_DAMAGE_DOWN: 6,
    DAMAGE_DOWN: 7,
}

export const JEWEL_EXPLAIN = {
    1: "スキルダメージの威力を上げる",
    2: "回復スキルの効果量を上げる",
    3: "スキル攻撃力アップの効果量を上げる",
    4: "デバフスキルの効果量を上げる",
    5: "クリティカル率上昇スキルの効果量を上げる",
    6: "挑発・注目状態：ダメージ軽減",
    7: "ダメージ軽減",
}


export const changeStyle = {
    176: 177,
    177: 176
}