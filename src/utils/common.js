import pako from 'pako';
import charaData from 'data/charaData';
import styleList from "data/styleList";
import skillList from "data/skillList";
import skillAttack from "data/skillAttack";
import enemyList from 'data/enemyList';
import abilityList from "data/abilityList";
import abilityEffect from "data/abilityEffect";
import passiveList from "data/passiveList";
import passiveEffect from "data/passiveEffect";
import resonanceList from "data/resonanceList";
import resonanceEffect from "data/resonanceEffect";
import buffKind from 'data/buffKind';
import buffEffect from 'data/buffEffect';
import * as constants from "utils/const";
import skillEffect from "data/skillEffect";
import {
    ELEMENT, RANGE, CONDITIONS, CAMP
} from "utils/const";

// キャラ名取得
export function getCharaData(charaId) {
    const filteredChara = charaData.filter((obj) => obj.chara_id === charaId);
    return filteredChara.length > 0 ? filteredChara[0] : undefined;
}

// スタイル取得
export function getStyleData(styleId) {
    const filteredStyle = styleList.filter((obj) => obj.style_id === styleId);
    return filteredStyle.length > 0 ? filteredStyle[0] : undefined;
}

// 敵情報取得
export function getEnemyInfo(enemyClass, enemySelect) {
    const filteredEnemy = enemyList.filter((obj) =>
        obj.enemy_class === Number(enemyClass) && obj.enemy_class_no === Number(enemySelect));
    return filteredEnemy.length > 0 ? filteredEnemy[0] : undefined;
}

// スキルデータ取得
export function getSkillData(skillId) {
    const filteredSkill = skillList.filter((obj) => obj.skill_id === Number(skillId));
    return filteredSkill.length > 0 ? filteredSkill[0] : undefined;
}

// EXスキル判定
export function isSkillEx(skillInfo, skillId) {
    if (!skillInfo) {
        skillInfo = getSkillData(skillId);
    }
    return skillInfo && (skillInfo.skill_kind === constants.KIND.EX_GENERATE || skillInfo.skill_kind === constants.KIND.EX_EXCLUSIVE);
}

// スキル攻撃情報取得
export function getAttackInfo(attackId) {
    const filteredAttack = skillAttack.filter((obj) => obj.attack_id === Number(attackId));
    return filteredAttack.length > 0 ? filteredAttack[0] : undefined;
}

// バフ一覧取得
export function getEffectList(skillId) {
    const filteredBuff = skillEffect.filter((obj) => obj.skill_id === Number(skillId));
    return filteredBuff;
}

// バフ情報取得
export function getBuffIdToEffect(effectId) {
    const filteredBuff = skillEffect.filter((obj) => obj.effect_id === Number(effectId));
    return filteredBuff.length > 0 ? filteredBuff[0] : undefined;
}

// バフ種別取得
export function getBuffKind(buffKbn) {
    const filteredBuffKind = buffKind.filter((obj) => obj.buff_kbn === Number(buffKbn));
    return filteredBuffKind.length > 0 ? filteredBuffKind[0] : undefined;
}

// バフ効果取得
export function getBuffEffect(buffKbn) {
    return buffEffect.filter((obj) => obj.buff_kbn === Number(buffKbn));
}

export function getBuffEffectType(buffKbn, effectType) {
    const filteredBuffEffect = getBuffEffect(buffKbn).filter((obj) => obj.effect_type === effectType);
    return filteredBuffEffect.length > 0 ? filteredBuffEffect[0] : undefined;
}

// アビリティ情報取得
export function getAbilityInfo(abilityId) {
    const filteredAbility = abilityList.filter((obj) => obj.ability_id === Number(abilityId));
    return filteredAbility.length > 0 ? filteredAbility[0] : undefined;
}

// アビリティリスト取得
export function getAbilityEffectList(abilityId) {
    return abilityEffect.filter((obj) => obj.ability_id === Number(abilityId));
}

// パッシブ情報取得
export function getPassiveInfo(skillId) {
    const filteredPassive = passiveList.filter((obj) => obj.skill_id === Number(skillId));
    return filteredPassive.length > 0 ? filteredPassive[0] : undefined;
}

// パッシブリスト取得
export function getPassiveEffectList(skillId) {
    return passiveEffect.filter((obj) => obj.skill_id === Number(skillId));
}

export function checkStyleElement(style, element) {
}

// レゾナンス情報取得
export function getResonanceInfo(resonanceId) {
    const filteredResonance = resonanceList.filter((obj) => obj.resonance_id === Number(resonanceId));
    return filteredResonance.length > 0 ? filteredResonance[0] : undefined;
}

// レゾナンスリスト取得
export function getResonanceEffectList(resonanceId) {
    return resonanceEffect.filter((obj) => obj.resonance_id === Number(resonanceId));
}

// 範囲の名称を取得
export const getRangeName = (rangeArea) => {
    switch (rangeArea) {
        case RANGE.FIELD:
            return "場";
        case RANGE.ENEMY_UNIT:
            return "敵単体";
        case RANGE.ENEMY_ALL:
            return "敵全体";
        case RANGE.ALLY_UNIT:
            return "単体";
        case RANGE.ALLY_FRONT:
            return "前衛";
        case RANGE.ALLY_BACK:
            return "後衛";
        case RANGE.ALLY_ALL:
            return "全員";
        case RANGE.SELF:
            return "自分";
        case RANGE.SELF_OTHER:
            return "自分以外";
        case RANGE.SELF_AND_UNIT:
            return "自分と味方単体";
        case RANGE.FRONT_OTHER:
            return "自分以外の前衛";
        case RANGE.OTHER_UNIT:
            return "自分以外の味方単体";
        case RANGE.MEMBER_31C:
            return "31Cメンバー";
        case RANGE.MEMBER_31E:
            return "31Eメンバー";
        case RANGE.MARUYAMA_MEMBER:
            return "丸山部隊";
        case RANGE.RUKA_SHARO:
            return "月歌とシャロ";
        default:
            return "";
    }
}

// 属性判定
export const checkElement = (element, targetElement) => {
    if (element === undefined || element === null) {
        return false;
    }

    switch (targetElement) {
        case ELEMENT.NORMAL:
        case ELEMENT.FIRE:
        case ELEMENT.ICE:
        case ELEMENT.THUNDER:
        case ELEMENT.LIGHT:
        case ELEMENT.DARK:
            if (element === ELEMENT.VOID) {
                return true;
            }
            return element === targetElement;

        case ELEMENT.NOT_NORMAL:
        case ELEMENT.NOT_FIRE:
        case ELEMENT.NOT_ICE:
        case ELEMENT.NOT_THUNDER:
        case ELEMENT.NOT_LIGHT:
        case ELEMENT.NOT_DARK:
            if (element === ELEMENT.VOID) {
                return false;
            }
            return element !== targetElement - 10;

        case ELEMENT.OTHER_FIRE:
        case ELEMENT.OTHER_ICE:
        case ELEMENT.OTHER_THUNDER:
        case ELEMENT.OTHER_LIGHT:
        case ELEMENT.OTHER_DARK:
            if (element === 0) {
                return false;
            }
            return element !== targetElement - 20;

        case undefined:
            return element > 0 && element <= 5;

        default:
            return false;
    }
};

export const checkActivationPlace = (activationPlace, targetPlace) => {
    // 前衛
    if (activationPlace === 1 && targetPlace >= 3) {
        return false;
    }
    // 後衛
    if (activationPlace === 2 && targetPlace < 3) {
        return false;
    }
    return true;
}

// 条件の名称を取得
export const getConditionName = (targetElement, conditions, conditionsId) => {
    switch (targetElement) {
        case ELEMENT.FIRE:
            return "火属性スタイルの";
        case ELEMENT.ICE:
            return "氷属性スタイルの";
        case ELEMENT.THUNDER:
            return "雷属性スタイルの";
        case ELEMENT.LIGHT:
            return "光属性スタイルの";
        case ELEMENT.DARK:
            return "闇属性スタイルの";
        default:
            break;
    }

    if (!conditions) return "";
    switch (Number(conditions)) {
        case CONDITIONS.FIRST_TURN:
            return `1ターン目のみ`;
        case CONDITIONS.SKILL_INIT:
            return `初回のみ`;
        case CONDITIONS.ADDITIONAL_TURN:
            return `追加ターン中`;
        case CONDITIONS.OVER_DRIVE:
            return `オーバードライブ中`;
        case CONDITIONS.DESTRUCTION_OVER_200:
            return `破壊率200%以上の時`;
        case CONDITIONS.BREAK:
            return `ブレイク時`;
        case CONDITIONS.PERCENTAGE_30:
            return `確率30%で`;
        case CONDITIONS.BUFF_DISPEL:
            return `バフ解除時`;
        case CONDITIONS.FIELD_NONE:
            return `フィールド無しの時`;
        case CONDITIONS.FIELD_ELEMENT:
            return `属性フィールド展開中の時`;
        case CONDITIONS.HAS_ABILITY:
            const ability = getAbilityInfo(conditionsId);
            return `${ability.ability_name}が発動している時`;
        case CONDITIONS.HAS_SHADOW:
            return `影分身の時`;
        case CONDITIONS.HAS_DODGE:
            return `回避状態の時`;
        case CONDITIONS.TOKEN_OVER:
            return `トークンが${conditionsId}個以上の時`;
        case CONDITIONS.TOKEN_COST_OVER:
            return `トークンが${conditionsId}個以上の時`;
        case CONDITIONS.SARVANT_OVER:
            return `山脇様のしもべ${conditionsId}人以上の時`;
        case CONDITIONS.NOT_ADDITIONAL_TURN:
            return `追加ターン中でない時`;
        case CONDITIONS.MORALE_OVER_LV:
            return `士気Lv${conditionsId}以上の時`;
        case CONDITIONS.LNFANTILIZED_OVER_LV:
            return `幼児退行Lv${conditionsId}以上の時`;
        case CONDITIONS.OVER_31C_3:
            return `31Cが3人以上の時`;
        case CONDITIONS.SELECT_31A:
            return `31Aを選択した時`;
        case CONDITIONS.SELECT_CHARA:
            const chara = getCharaData(conditionsId);
            return `${chara.chara_short_name}を選択した時`;
        case CONDITIONS.NOT_DIVA_BLESS:
            return `歌姫の加護でない時`;
        case CONDITIONS.MOTIVATION:
            const motivation = ["絶不調", "不調", "普通", "好調", "絶好調"][conditionsId];
            return `やる気が${motivation}以上の時`;
        case CONDITIONS.ICE_STYLE:
            return `氷属性スタイルの味方${conditionsId}人以上の時`;
        case CONDITIONS.THUNDER_STYLE:
            return `雷属性スタイルの味方${conditionsId}人以上の時`;
        case CONDITIONS.FIRE_STYLE:
            return `火属性スタイルの味方${conditionsId}人以上の時`;
        case CONDITIONS.LIGHT_STYLE:
            return `光属性スタイルの味方${conditionsId}人以上の時`;
        case CONDITIONS.DARK_STYLE:
            return `闇属性スタイルの味方${conditionsId}人以上の時`;
        case CONDITIONS.HAS_BUFF_TARGET:
            return `${getBuffKind(conditionsId).buff_name}発動中の`;
        case CONDITIONS.HAS_BUFF:
            return `${getBuffKind(conditionsId).buff_name}状態の時`;
        case CONDITIONS.SP_UNDER:
            return `SPが${conditionsId}以下の時`;
        case CONDITIONS.SP_OVER:
            return `SPが${conditionsId}以上の時`;
        case CONDITIONS.ENEMY_COUNT:
            return `敵の数が${conditionsId}の時`;
        case CONDITIONS.USE_COUNT:
            return `使用回数が${conditionsId}回以上の時`;
        case CONDITIONS.IS_WEAK:
            return `弱点をついた時`;
        case CONDITIONS.OD_UNDER:
            return `OverDriveゲージが${conditionsId}%以下の時`;
        case CONDITIONS.OD_OVER:
            return `OverDriveゲージが${conditionsId}%以上の時`;
        case CONDITIONS.CAMP_DEPLOYMENT:
            if (conditionsId === 0) {
                return `陣が展開されていない時`;
            } else {
                return `${CAMP[conditionsId]}展開中のとき`;
            }
        default:
            return conditions;
    }
}

export function formatStr(number) {
    if (number >= 0) {
        return `+${number}`;
    } else {
        return `${number}`;
    }
}

// 文字列を圧縮
export function compressString(inputString) {
    const compressedData = pako.deflate(inputString);
    const compressedString = btoa(String.fromCharCode.apply(null, compressedData));
    return compressedString;
}

// 圧縮された文字列を解凍
export function decompressString(compressedString) {
    const compressedDataBuffer = new Uint8Array(atob(compressedString).split('').map(function (c) { return c.charCodeAt(0); }));
    const decompressedData = pako.inflate(compressedDataBuffer);
    const decompressedString = new TextDecoder().decode(decompressedData);
    return decompressedString;
}

// ディープコピー
export function deepClone(instance) {
    // インスタンスがnullまたはundefinedの場合、そのまま返す
    if (instance === null || instance === undefined) return instance;

    // プリミティブ型の場合、そのまま返す
    if (typeof instance !== 'object') return instance;

    // 特殊なオブジェクト型の場合
    if (instance instanceof Date) return new Date(instance);
    if (instance instanceof RegExp) return new RegExp(instance);
    if (instance instanceof Map) return new Map(instance);
    if (instance instanceof Set) return new Set(instance);

    // インスタンスがArrayの場合の処理
    if (Array.isArray(instance)) {
        return instance.map(item => deepClone(item));
    }

    // インスタンスのクラスを取得
    const ClonedClass = instance.constructor;
    // 新しいインスタンスを作成
    const clone = new ClonedClass();

    // プロパティを再帰的にコピー
    for (let key of Object.keys(instance)) {
        clone[key] = deepClone(instance[key]);
    }

    return clone;
}