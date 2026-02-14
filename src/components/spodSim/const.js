import { BUFF, FIELD } from "utils/const";

export const ABILIRY_TIMING = {
    BATTLE_START: 0,
    SELF_START: 1,
    ACTION_START: 2,
    ENEMY_START: 3,
    ADDITIONALTURN: 4,
    OD_START: 5,
    BREAK: 6,
    RECEIVE_DAMAGE: 7,
    EX_SKILL_USE: 8,
    PURSUIT: 9,
    FIELD_DEPLOY: 10,
    SKILL_USE: 11,
    HEAL_SP: 12,
    OTHER: 99,
}

// 使用不可スタイル
export const NOT_USE_STYLE = [36, 197];
// 制限アビリティ
export const CONSTRAINTS_ABILITY = [
    25, // 超越ゲージ
    26, // 超越ゲージ
    27, // 超越ゲージ
    1136, // 勝勢
    1138, // ラストリゾート
    1210, // アルゴリズム
    1505, // 激動
    1509, // 怪盗乱麻
    1523, // アンコール
    1525, // ポジショニング
    1531, // 鋒矢
    1533, // 貴様に託した
    1534, // 破竹の勢い
    1213, // 絶好調女
    1028, // 魔界騎兵起動！
];
// 制限パッシブ
export const CONSTRAINTS_PASSIVE = [
    664, // BeatDown();
    668, // 名探偵は明るく照らす
];
// 謎の処理順序
export const ACTION_ORDER = [1, 0, 2, 3, 4, 5];

export const PHYSICAL_NAME = ["", "斬", "突", "打"];
export const ELEMENT_NAME = ["無", "火", "氷", "雷", "光", "闇"];

export const KB_NEXT = {
    ACTION: 1,
    ACTION_OD_OLD: 2,
    ADDITIONALTURN: 3,
    ACTION_OD_1: 4,
    ACTION_OD_2: 5,
    ACTION_OD_3: 6,
};

export const BUFF_FUNNEL_LIST = [
    BUFF.FUNNEL,
    BUFF.ABILITY_FUNNEL
];
export const SINGLE_BUFF_LIST = [
    BUFF.CHARGE,
    BUFF.RECOIL,
    BUFF.ARROWCHERRYBLOSSOMS,
    BUFF.ETERNAL_OARH,
    BUFF.EX_DOUBLE,
    BUFF.BABIED,
    BUFF.DIVA_BLESS,
    BUFF.YAMAWAKI_SERVANT
];
export const FIELD_LIST = {
    [FIELD.NORMAL]: "無し",
    [FIELD.FIRE]: "火",
    [FIELD.ICE]: "氷",
    [FIELD.THUNDER]: "雷",
    [FIELD.LIGHT]: "光",
    [FIELD.DARK]: "闇",
    [FIELD.RICE]: "稲穂",
    [FIELD.SANDSTORM]: "砂嵐"
}
