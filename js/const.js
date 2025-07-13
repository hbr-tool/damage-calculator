/** ロール */
const ROLE_ATTACKER = 1;
const ROLE_BREAKER = 2;
const ROLE_BLASTER = 3;
const ROLE_HEALER = 4;
const ROLE_BUFFER = 5;
const ROLE_DEBUFFER = 6;
const ROLE_DEFENDER = 7;
const ROLE_ADMIRAL = 8;
const ROLE = {
    ATTACKER: 1,
    BREAKER: 2,
    BLASTER: 3,
    HEALER: 4,
    BUFFER: 5,
    DEBUFFER: 6,
    DEFENDER: 7,
    ADMIRAL: 8,
}

/** バフ種別 */
const BUFF_ATTACKUP = 0; // 攻撃力アップ
const BUFF_ELEMENT_ATTACKUP = 1; // 属性アップ
const BUFF_MINDEYE = 2; // 心眼
const BUFF_DEFENSEDOWN = 3; // 防御ダウン
const BUFF_ELEMENT_DEFENSEDOWN = 4; // 属性防御ダウン
const BUFF_FRAGILE = 5; // 脆弱
const BUFF_CRITICALRATEUP = 6; // クリ率
const BUFF_CRITICALDAMAGEUP = 7; // クリダメ
const BUFF_ELEMENT_CRITICALRATEUP = 8; // 属性クリ率
const BUFF_ELEMENT_CRITICALDAMAGEUP = 9; // 属性クリダメ
const BUFF_CHARGE = 10;// チャージ
const BUFF_FIELD = 11; // フィールド
const BUFF_DAMAGERATEUP = 12; // 破壊率アップ
const BUFF_OVERDRIVEPOINTUP = 13; // OD増加
const BUFF_FIGHTINGSPIRIT = 14; // 闘志
const BUFF_MISFORTUNE = 15; // 厄
const BUFF_FUNNEL = 16; // 連撃
const BUFF_STRONG_BREAK = 18; // 強ブレイク
const BUFF_DEFENSEDP = 19; // DP防御ダウン
const BUFF_RESISTDOWN = 20; // 耐性ダウン
const BUFF_ETERNAL_DEFENSEDOWN = 21; // 永続防御力ダウン
const BUFF_ELEMENT_ETERNAL_DEFENSEDOWN = 22; // 永続属性防御ダウン
const BUFF_HEALSP = 23; // SP増加
const BUFF_RECOIL = 24; // 行動不能
const BUFF_PROVOKE = 25; // 挑発
const BUFF_ADDITIONALTURN = 26; // 追加ターン
const BUFF_COVER = 27; // 注目
const BUFF_GIVEATTACKBUFFUP = 28; // バフ強化
const BUFF_GIVEDEBUFFUP = 29; // デバフ強化
const BUFF_ARROWCHERRYBLOSSOMS = 30; // 桜花の矢
const BUFF_ETERNAL_OARH = 31; // 永遠なる誓い
const BUFF_EX_DOUBLE = 32; // EXスキル連続発動
const BUFF_BABIED = 33; // オギャり
const BUFF_MORALE = 34; // 士気
const BUFF_HACKING = 35; // ハッキング
const BUFF_DIVA_BLESS = 36; // 歌姫の加護
const BUFF_SHREDDING = 37; // 速弾き
const BUFF_NAGATIVE = 38; // ネガティブ
const BUFF_YAMAWAKI_SERVENT = 39; // 山脇様のしもべ 
const BUFF_DISPEL = 90; // ディスペル
const BUFF_ABILITY_FUNNEL = 116; // アビリティ連撃
const BUFF = {
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
    HIGH_BOOST: 40, // ハイブースト 
    SHADOW_CLONE : 41, // 影分身
    MAKEUP : 42, // メイクアップ
    DISPEL: 90, // ディスペル
    ABILITY_FUNNEL: 116, // アビリティ連撃
}

/** アビリティ/パッシブ効果 */
const EFFECT_ATTACKUP = 1; // 攻撃力アップ
const EFFECT_DEFFENCEDOWN = 2; // 防御力ダウン
const EFFECT_CRITICAL_UP = 3; // クリティカル率アップ
const EFFECT_CRITICAL_DAMAGE_UP = 4; // クリティカルダメージアップ
const EFFECT_DAMAGERATEUP = 5; // 破壊率上昇量アップ
const EFFECT_FUNNEL = 6; // 連撃数アップ
const EFFECT_FIELD_DEPLOYMENT = 7; // フィールド展開
const EFFECT_CHARGE = 8; // チャージ
const EFFECT_OVERDRIVE_SP = 9; // ODSPアップ
const EFFECT_DEFFENCEUP = 11; // 防御力アップ
const EFFECT_HEALSP = 12; // SP回復
const EFFECT_HEALDP = 13; // DP回復
const EFFECT_OVERDRIVEPOINTUP = 14; // ODアップ
const EFFECT_COST_SP_DOWN = 15; // 消費SPダウン
const EFFECT_MORALE = 16; // 士気
const EFFECT_BREAK_GUARD = 20; // ブレイクガード
const EFFECT_STUN = 21; // スタン
const EFFECT_MISFORTUNE = 22; // 厄
const EFFECT_ARROWCHERRYBLOSSOMS = 23; // 桜花の矢
const EFFECT_SHADOW_CLONE = 24; // 影分身
const EFFECT_STATUSUP_VALUE = 25; // 能力上昇(固定)
const EFFECT_STATUSUP_RATE = 26; // 能力上昇(%)
const EFFECT_FIELD_STRENGTHEN = 27; // フィールド強化
const EFFECT_BUFF_STRENGTHEN = 28; // バフ強化
const EFFECT_ADDITIONALTURN = 29; // 追加ターン
const EFFECT_TOKEN_UP = 30; // トークンアップ
const EFFECT_TOKEN_ATTACKUP = 31; // トークン1つにつき攻撃力アップ
const EFFECT_TOKEN_DEFFENCEUP = 32; // トークン1つにつき防御力アップ
const EFFECT_TOKEN_DAMAGERATEUP = 33; // トークン1つにつき破壊率アップ
const EFFECT_NEGATIVE = 51; // ネガティブ
const EFFECT_HEALEP = 52; // EP回復
const EFFECT = {
    ATTACKUP: 1, // 攻撃力アップ
    DEFFENCEDOWN: 2, // 防御力ダウン
    CRITICALRATEUP: 3, // クリティカル率アップ
    CRITICAL_DAMAGE_UP: 4, // クリティカルダメージアップ
    DAMAGERATEUP: 5, // 破壊率上昇量アップ
    FUNNEL: 6, // 連撃数アップ
    FIELD_DEPLOYMENT: 7, // フィールド展開
    CHARGE: 8, // チャージ
    OVERDRIVE_SP: 9, // ODSPアップ
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
    NEGATIVE: 51, // ネガティブ
    HEALEP: 52, // EP回復
}

/** フィールド */
const FIELD_NORMAL = 0; // 通常
const FIELD_FIRE = 1; // 火
const FIELD_ICE = 2; // 氷
const FIELD_THUNDER = 3; // 雷
const FIELD_LIGHT = 4; // 光
const FIELD_DARK = 5; // 闇
const FIELD_RICE = 6; // 稲穂
const FIELD_SANDSTORM = 7; // 砂嵐
const FIELD = {
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
const RANGE_FIELD = 0; // 場
const RANGE_ENEMY_UNIT = 1; // 敵単体
const RANGE_ENEMY_ALL = 2; // 敵全体
const RANGE_ALLY_UNIT = 3; // 味方単体
const RANGE_ALLY_FRONT = 4; // 味方前衛
const RANGE_ALLY_BACK = 5; // 味方後衛
const RANGE_ALLY_ALL = 6; // 味方全員
const RANGE_SELF = 7; // 自分
const RANGE_SELF_OTHER = 8; // 自分以外
const RANGE_SELF_AND_UNIT = 9; // 自分と味方単体
const RANGE_FRONT_OTHER = 10; // 自分以外の前衛
const RANGE_OTHER_UNIT = 11; // 自分以外の味方単体
const RANGE_31C_MEMBER = 33; // 31Cメンバー
const RANGE_31D_MEMBER = 34; // 31Cメンバー
const RANGE_31E_MEMBER = 35; // 31Eメンバー
const RANGE_MARUYAMA_MEMBER = 41; // 丸山部隊
const RANGE_RUKA_SHARO = 42; // 月歌とシャロ
const RANGE_OTHER = 99; // その他
const RANGE = {
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

const CHARA_ID_31C = [13, 14, 15, 16, 17, 18];
const CHARA_ID_31E = [25, 26, 27, 28, 29, 30];
const CHARA_ID_MARUYAMA = [15, 16, 28, 32, 40, 47];
const CHARA_ID_RUKA_SHARO = [1, 42];
const CHARA_ID = {
    MEMBER_31C: [13, 14, 15, 16, 17, 18],
    MEMBER_31E: [25, 26, 27, 28, 29, 30],
    MARUYAMA: [15, 16, 28, 32, 40, 47],
    RUKA_SHARO: [1, 42],
}

/** スキル属性 */
const ATTRIBUTE_NORMAL_ATTACK = 1; // 通常攻撃
const ATTRIBUTE_PURSUIT = 2; // 追撃
const ATTRIBUTE_COMMAND_ACTION = 3; // 指揮行動
const ATTRIBUTE_NOT_ACTION = 4; // 行動無し
const ATTRIBUTE_SP_HALF = 11; // SP消費半減
const ATTRIBUTE_SP_ZERO = 12; // SP消費0
const ATTRIBUTE = {
    NORMAL_ATTACK: 1, // 通常攻撃
    PURSUIT: 2, // 追撃
    COMMAND_ACTION: 3, // 指揮行動
    PURSUIT_ONLY: 5, // 追撃のみ発動可能
    SP_HALF: 11, // SP消費半減
    SP_ZERO: 12, // SP消費0
    NOT_ACTION: 99, // 行動無し
}

/** 条件 */
const CONDITIONS_FIRST_TURN = 1; // 1ターン目
const CONDITIONS_SKILL_INIT = 2; // 初回
const CONDITIONS_ADDITIONAL_TURN = 3; // 追加ターン
const CONDITIONS_OVER_DRIVE = 4; // オーバードライブ中
const CONDITIONS_DESTRUCTION_OVER_200 = 5; // 破壊率200%以上
const CONDITIONS_BREAK = 6; // ブレイク時
const CONDITIONS_PERCENTAGE_30 = 7; // 確率30%
const CONDITIONS_DOWN_TURN = 8; // ダウンターン
const CONDITIONS_BUFF_DISPEL = 9; // バフ解除
const CONDITIONS_DEFFENCE_DOWN = 11; // 防御ダウン中
const CONDITIONS_FRAGILE = 12; // 脆弱中
const CONDITIONS_TARGET_COVER = 13; // 集中・挑発状態
const CONDITIONS_FIELD_NONE = 14; // フィールドなし
const CONDITIONS_FIELD_FIRE = 15; // 火属性フィールド
const CONDITIONS_FIELD_ICE = 16; // 氷属性フィールド
const CONDITIONS_FIELD_THUNDER = 17; // 雷属性フィールド
const CONDITIONS_FIELD_LIGHT = 18; // 光属性フィールド
const CONDITIONS_FIELD_DARK = 19; // 闇属性フィールド
const CONDITIONS_HAS_CHARGE = 21; // チャージ中
const CONDITIONS_HAS_SHADOW = 22; // 影分身中
const CONDITIONS_HAS_DODGE = 23; // 回避状態
const CONDITIONS_TOKEN_OVER_4 = 24; // トークン4つ以上
const CONDITIONS_DP_OVER_100 = 25; // DP100％以上
const CONDITIONS_SP_UNDER_0_ALL = 26; // SP0以下の味方がいる
const CONDITIONS_31A_OVER_3 = 31; // 31A3人以上
const CONDITIONS_31E_OVER_3 = 35; // 31E3人以上
const CONDITIONS_FIELD_NOT_FIRE = 41; // 火属性以外フィールド
const CONDITIONS_DIVA_BLESS = 42; // 歌姫の加護
const CONDITIONS_NOT_DIVA_BLESS = 43; // 歌姫の加護以外
const CONDITIONS_NOT_NEGATIVE = 44; // ネガティブ以外

const CONDITIONS_ENEMY_COUNT_1 = 51; // 敵1体
const CONDITIONS_ENEMY_COUNT_2 = 52; // 敵2体
const CONDITIONS_ENEMY_COUNT_3 = 53; // 敵3体
const CONDITIONS = {
    FIRST_TURN: 1, // 1ターン目
    SKILL_INIT: 2, // 初回
    ADDITIONAL_TURN: 3, // 追加ターン
    OVER_DRIVE: 4, // オーバードライブ中
    DESTRUCTION_OVER_200: 5, // 破壊率200%以上
    BREAK: 6, // ブレイク時
    PERCENTAGE_30: 7, // 確率30%
    DOWN_TURN: 8, // ダウンターン
    BUFF_DISPEL: 9, // バフ解除
    DEFFENCE_DOWN: 11, // 防御ダウン中
    FRAGILE: 12, // 脆弱中
    TARGET_COVER: 13, // 集中・挑発状態
    FIELD_NONE: 14, // フィールドなし
    FIELD_FIRE: 15, // 火属性フィールド
    FIELD_ICE: 16, // 氷属性フィールド
    FIELD_THUNDER: 17, // 雷属性フィールド
    FIELD_LIGHT: 18, // 光属性フィールド
    FIELD_DARK: 19, // 闇属性フィールド
    HAS_CHARGE: 21, // チャージ中
    HAS_SHADOW: 22, // 影分身中
    HAS_DODGE: 23, // 回避状態
    TOKEN_OVER_4: 24, // トークン4つ以上
    DP_OVER_100: 25, // DP100％以上
    SP_UNDER_0_ALL: 26, // SP0以下の味方がいる
    SARVANT_OVER3: 27, // 山脇様のしもべ3人以上
    SARVANT_OVER5: 28, // 山脇様のしもべ5人以上
    SARVANT_OVER6: 29, // 山脇様のしもべ6人以上
    MORALE_OVER_6: 30, // 士気Lv6以上
    OVER_31A_3: 31, // 31A3人以上
    OVER_31C_3: 33, // 31C3人以上
    OVER_31D_3: 34, // 31D3人以上
    OVER_31E_3: 35, // 31E3人以上
    FIELD_NOT_FIRE: 41, // 火属性以外フィールド
    DIVA_BLESS: 42, // 歌姫の加護
    NOT_DIVA_BLESS: 43, // 歌姫の加護以外
    NOT_NEGATIVE: 44, // ネガティブ以外
    HAS_MAEKUP: 45, // メイクアップ状態
    ENEMY_COUNT_1: 51, // 敵1体
    ENEMY_COUNT_2: 52, // 敵2体
    ENEMY_COUNT_3: 53, // 敵3体
    USE_COUNT_2: 54, // 2回目以降
    USE_COUNT_3: 55, // 3回目以降
    USE_COUNT_4: 56, // 4回目以降
}

/** 敵リスト*/
const ENEMY_CLASS_HARD_LAYER = 1; // 異時層
const ENEMY_CLASS_ORB_BOSS = 2; // オーブボス
const ENEMY_CLASS_CLOCK_TOWER_NORMAL = 3; // 時計塔(N)
const ENEMY_CLASS_CLOCK_TOWER_HARD = 4; // 時計塔(H)
const ENEMY_CLASS_JEWEL_LABYRINTH = 5; // 宝珠の迷宮
const ENEMY_CLASS_SCORE_ATTACK = 6; // スコアアタック
const ENEMY_CLASS_PRISMATIC_BATTLE = 7; // プリズムバトル
const ENEMY_CLASS_STELLAR_SWEEP_FRONT = 8; // 恒星掃戦線
const ENEMY_CLASS_EVENT_HIDDEN_BOSS = 9; // イベント隠しボス
const ENEMY_CLASS_TIME_TRAINING = 10; // 時の修練場
const ENEMY_CLASS_CONTROL_BATTLE = 11; // 制圧戦
const ENEMY_CLASS_SERAPH_ENCOUNTER = 12; // セラフ遭遇戦
const ENEMY_CLASS_EVENT_PRISMATIC = 13; // イベントプリズム
const ENEMY_CLASS_FREE_INPUT = 99; // 自由入力
const ENEMY_CLASS = {
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
const KIND_PURPOSE = 0; // 汎用
const KIND_EX_GENERATE = 1; // EX(ジェネライズ)
const KIND_EX_EXCLUSIVE = 2; // EX(専用)
const KIND_MASTER = 5; // マスター
const KIND_ORB = 7; // オーブ
const KIND_OTHER = 9; // その他

/** 汎用スキル */
const SKILL_NORMAL_ATTACK = 1; // 通常攻撃
const SKILL_NONE = 2; // 無し
const SKILL_PURSUIT = 3; // 追撃
const SKILL_COMMAND_ACTION = 4; // 指揮行動
const SKILL = {
    NORMAL_ATTACK: 1, // 通常攻撃
    NONE: 2, // 無し
    PURSUIT: 3, // 追撃
    COMMAND_ACTION: 4, // 指揮行動
    AUTO_PURSUIT: 5, // 自動追撃
}
/** 貫通クリティカル */
const PENETRATION_ATTACK_LIST = [84, 135, 137, 156, 163, 95, 190, 2179];
const ALONE_ACTIVATION_BUFF_KIND = [
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
const ALONE_ACTIVATION_ABILITY_LIST = [12, 407, 408];

const JEWEL_EXPLAIN = {
    1 : "スキルダメージの威力を上げる",
    2 : "回復スキルの効果量を上げる",
    3 : "スキル攻撃力アップの効果量を上げる",
    4 : "デバフスキルの効果量を上げる",
    5 : "クリティカル率上昇スキルの効果量を上げる",
    6 : "挑発・注目状態：ダメージ軽減",
    7 : "ダメージ軽減",
}