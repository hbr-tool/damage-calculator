/** ロール */
const ROLE_ATTACKER = 1;
const ROLE_BREAKER = 2;
const ROLE_BLASTER = 3;
const ROLE_HEALER = 4;
const ROLE_BUFFER = 5;
const ROLE_DEBUFFER = 6;
const ROLE_DEFENDER = 7;
const ROLE_ADMIRAL = 8;

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
const BUFF_ADDITIONALTURN = 26 // 追加ターン
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
const BUFF_DISPEL = 90; // ディスペル

const BUFF_ABILITY_FUNNEL = 116; // アビリティ連撃

/** アビリティ/パッシブ効果 */
const EFFECT_ATTACKUP = 1; // 攻撃力アップ
const EFFECT_DEFFENCEDOWN = 2; // 防御力ダウン
const EFFECT_CRITICAL_UP = 3; // クリティカル率アップ
const EFFECT_CRITICAL_DAMAGE_UP = 4; // クリティカルダメージアップ
const EFFECT_DAMAGERATEUP = 5; // 破壊率上昇量アップ
const EFFECT_FUNNEL = 6; // 連撃数アップ
const EFFECT_FIELD_DEPLOYMENT = 7; // フィールド展開
const EFFECT_CHARGE = 8; // チャージ
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
const EFFECT_TOKEN_UP = 30; // トークンアップ
const EFFECT_TOKEN_ATTACKUP = 31; // トークン1つにつき攻撃力アップ
const EFFECT_TOKEN_DEFFENCEUP = 32; // トークン1つにつき 防御力アップ
const EFFECT_NEGATIVE = 51; // ネガティブ

/** フィールド */
const FIELD_NORMAL = 0; // 通常
const FIELD_FIRE = 1; // 火
const FIELD_ICE = 2; // 氷
const FIELD_THUNDER = 3; // 雷
const FIELD_LIGHT = 4; // 光
const FIELD_DARK = 5; // 闇
const FIELD_RICE = 6; // 稲穂
const FIELD_SANDSTORM = 7; // 砂嵐

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
const RANGE_31C_MEMBER = 33; // 31Cメンバー
const RANGE_31E_MEMBER = 35; // 31Eメンバー
const RANGE_MARUYAMA_MEMBER = 41; // 丸山部隊
const RANGE_OTHER = 99; // その他

const CHARA_ID_31C = [13, 14, 15, 16, 17, 18];
const CHARA_ID_31E = [25, 26, 27, 28, 29, 30];
const CHARA_ID_MARUYAMA = [15, 16, 28, 32, 40, 47];

/** スキル属性 */
const ATTRIBUTE_NORMAL_ATTACK = 1; // 通常攻撃
const ATTRIBUTE_PURSUIT = 2; // 追撃
const ATTRIBUTE_COMMAND_ACTION = 3; // 指揮行動
const ATTRIBUTE_NOT_ACTION = 4; // 行動無し
const ATTRIBUTE_SP_HALF = 11; // SP消費半減
const ATTRIBUTE_SP_ZERO = 12; // SP消費0

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
const CONDITIONS_HAS_CHARGE = 21; // チャージ中
const CONDITIONS_HAS_SHADOW = 22; // 影分身中
const CONDITIONS_31A_OVER_3 = 31; // 31A3人以上
const CONDITIONS_31E_OVER_3 = 35; // 31E3人以上
const CONDITIONS_FIELD_NOT_FIRE = 41; // 火属性以外フィールド
const CONDITIONS_DIVA_BLESS = 42; // 歌姫の加護
const CONDITIONS_NOT_DIVA_BLESS = 43; // 歌姫の加護以外
const CONDITIONS_NOT_NEGATIVE = 44; // ネガティブ以外

const CONDITIONS_ENEMY_COUNT_1 = 51; // 敵1体
const CONDITIONS_ENEMY_COUNT_2 = 52; // 敵2体
const CONDITIONS_ENEMY_COUNT_3 = 53; // 敵3体

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

/** 貫通クリティカル */ 
const PENETRATION_ATTACK_LIST = [84, 135, 137, 156, 163];
/** 単独発動バフ */
const ALONE_ACTIVATION_BUFF_LIST = [4, 133, 134, 201, 202, 2606, 2607, 1033, 1113];
/** 単独発動アビリティ */
const ALONE_ACTIVATION_ABILITY_LIST = [12, 407, 408];
