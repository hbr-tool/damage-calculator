import {
    ELEMENT, BUFF, RANGE, CHARA_ID, EFFECT, ENEMY_CLASS, CONDITIONS
    , ALONE_ACTIVATION_BUFF_KIND, ALONE_ACTIVATION_ABILITY_LIST
    , STYLE_ID, ABILITY_ID, JEWEL_TYPE, STATUS_KBN
    , COST_TYPE
} from 'utils/const';
import enemyList from "data/enemyList";
import scoreBonusList from "data/scoreBonus";
import * as common from "utils/common";
import * as constants from 'utils/const';

export const BUFF_KBN = {
    0: "power_up",
    1: "element_up",
    2: "mindeye",
    3: "defense_down",
    4: "element_down",
    5: "fragile",
    6: "critical_rate_up",
    7: "critical_damege",
    8: "critical_element",
    9: "critical_damege_element",
    10: "charge",
    11: "field",
    12: "destruction_rete_up",
    14: "fightingspirit",
    15: "misfortune",
    16: "funnel",
    18: "strong_break",
    19: "dp_defense_down",
    20: "resist_down",
    21: "permanent_defense_down",
    22: "permanent_element_down",
    30: "arrow_cherry_blossoms",
    31: "eternal_ourh",
    33: "babied",
    39: "servant",
    41: "shadow_clone",
    44: "curry",
    45: "shchi",
    48: "eternal_fragile",
    53: "steak",
    54: "gelato",
};

export const ATTACK_BUFF_LIST = [
    BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP, BUFF.MINDEYE, BUFF.FUNNEL, BUFF.DAMAGERATEUP,
    BUFF.CRITICALRATEUP, BUFF.CRITICALDAMAGEUP, BUFF.ELEMENT_CRITICALRATEUP, BUFF.ELEMENT_CRITICALDAMAGEUP];
export const DEBUFF_LIST = [
    BUFF.DEFENSEDOWN, BUFF.ELEMENT_DEFENSEDOWN,
    BUFF.DEFENSEDP, BUFF.ETERNAL_DEFENSEDOWN, BUFF.ELEMENT_ETERNAL_DEFENSEDOWN, BUFF.FRAGILE, BUFF.RESISTDOWN, BUFF.ETERNAL_FRAGILE];

export const KIND_ATTACKUP = [BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP]
export const KIND_DEFENSEDOWN = [BUFF.DEFENSEDOWN, BUFF.ELEMENT_DEFENSEDOWN, BUFF.DEFENSEDP, BUFF.ETERNAL_DEFENSEDOWN, BUFF.ELEMENT_ETERNAL_DEFENSEDOWN]
export const TROOP_KBN = {
    MAIN: "1",
    SUB: "2",
}

// 超越ゲージ
export const TRANSCEND_LIST = [ABILITY_ID.TRANSCEND_FIRE, ABILITY_ID.TRANSCEND_ICE, ABILITY_ID.TRANSCEND_THUNDER, ABILITY_ID.TRANSCEND_LIGHT, ABILITY_ID.TRANSCEND_DARK];

// 倍率表示
function convertToPercentage(value) {
    // 引数×100を計算し、小数点以下2桁目以降を四捨五入してパーセント記号を付ける
    const percentage = (Math.floor(value * 10000) / 100).toFixed(2) + "%";
    return percentage;
}

// ピアス効果量取得
function getEarringEffectSize(otherSetting, type, hitCount) {
    hitCount = hitCount < 1 ? 1 : hitCount;
    hitCount = hitCount > 10 ? 10 : hitCount;
    let earring = otherSetting.earring.split("_");
    if (earring.length === 2) {
        if (earring[0] === type) {
            let effectSize = Number(earring[1]);
            return (effectSize - ((effectSize - 5) / 9 * (hitCount - 1)));
        }
    }
    return 0;
}

// チェーン効果量取得
function getChainEffectSize(otherSetting, type) {
    switch (otherSetting.chain) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
            switch (type) {
                case "skill":
                    return 10;
                case "blast":
                    return 10;
                default:
                    break;
            }
            break;
        default:
            break;
    }
    return 0;
}

// パワプロ存在チェック
export function checkPawapuroExist(selectStyleList) {
    return checkStyleExist(selectStyleList, STYLE_ID.PAWAPURO);
}

// スタイル存在チェック
export function checkStyleExist(selectStyleList, searchStyleIds) {
    return selectStyleList.some(member =>
        searchStyleIds.includes(member?.styleInfo?.style_id)
    );
}

// キャラ重複チェック
export function checkDuplicationChara(selectStyleList, searchCharaId) {
    if (searchCharaId) {
        return selectStyleList.some((member, i) => member?.styleInfo.chara_id === searchCharaId);
    }
    return false;
}

// 耐性判定
export function getEnemyResist(attackInfo, state) {
    const enemyInfo = state.enemyInfo;
    const correction = state.correction;
    let physical_resist = enemyInfo[`physical_${attackInfo.attack_physical}`];
    let element_resist = enemyInfo[`element_${attackInfo.attack_element}`]
        - correction[`element_${attackInfo.attack_element}`] + state.resistDown[attackInfo.attack_element];
    if (attackInfo.penetration) {
        physical_resist = 100 + attackInfo.penetration;
        element_resist = 100;
    }
    return [physical_resist, element_resist];
}

// バフの絞り込み
export const filteredBuffList = (buffList, attackInfo) => {
    if (!attackInfo) return [];
    const ELEMENT_KIND = [
        BUFF.ELEMENT_ATTACKUP,
        BUFF.ELEMENT_DEFENSEDOWN,
        BUFF.ELEMENT_ETERNAL_DEFENSEDOWN,
        BUFF.ELEMENT_CRITICALRATEUP,
        BUFF.ELEMENT_CRITICALDAMAGEUP,
        BUFF.RESISTDOWN
    ]
    const OTHER_ONLY_AREA = [
        RANGE.ALLY_BACK,
        RANGE.SELF_OTHER,
        RANGE.FRONT_OTHER,
        RANGE.OTHER_UNIT,
    ]
    return buffList.filter(buff => {
        if (ELEMENT_KIND.includes(buff.buff_kind) && attackInfo.attack_element !== buff.buff_element) {
            return false;
        }
        if (buff.buff_kind === BUFF.FIELD && buff.buff_element !== 0 && buff.buff_element !== attackInfo.attack_element) {
            return false;
        }
        if (buff.range_area === RANGE.SELF && buff.use_chara_id !== attackInfo.chara_id) {
            return false;
        }
        // 自分に使用出来ない攻撃バフ
        if (OTHER_ONLY_AREA.includes(buff.range_area) && buff.use_chara_id === attackInfo.chara_id) {
            return false;
        }
        return true;
    });
}

// オーブ絞り込み
export const filteredOrb = (buffList, isOrb) => {
    return buffList.filter(buff => {
        if (!isOrb && buff.skill_id > 9000) {
            // オーブスキル
            return false;
        }
        return true;
    });
}

// 効果量取得
export function getEffectSize(styleList, buff, buffSetting, memberInfo, state, abilitySettingMap, passiveSettingMap, resonanceList) {
    const handlers = {
        collect: buffSetting.collect,
        skillInfo: common.getSkillData(buff.skill_id),
        memberInfo,
        styleList,
        abilitySettingMap, passiveSettingMap
    };
    // バフ強化
    let strengthen = getStrengthen(handlers, buff, resonanceList);
    let effectSize = 0;
    if (buff.kbn === "buff") {
        // バフ
        switch (buff.buff_kind) {
            case BUFF.ATTACKUP: // 攻撃力アップ
            case BUFF.ELEMENT_ATTACKUP: // 属性攻撃力アップ
                effectSize = getBuffEffectSize(styleList, buff, buffSetting, memberInfo, state, JEWEL_TYPE.SKILL_ATTACKUP, abilitySettingMap, passiveSettingMap);
                break;
            case BUFF.MINDEYE: // 心眼
            case BUFF.CRITICALDAMAGEUP:	// クリティカルダメージアップ
            case BUFF.ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
            case BUFF.CHARGE: // チャージ
            case BUFF.DAMAGERATEUP: // 破壊率アップ
            case BUFF.YAMAWAKI_SERVANT: // 山脇様のしもべ
                effectSize = getBuffEffectSize(styleList, buff, buffSetting, memberInfo, state, 0, abilitySettingMap, passiveSettingMap);
                break;
            case BUFF.CRITICALRATEUP:	// クリティカル率アップ
            case BUFF.ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
                effectSize = getBuffEffectSize(styleList, buff, buffSetting, memberInfo, state, JEWEL_TYPE.CRITICALRATE_UP, abilitySettingMap, passiveSettingMap);
                break;
            case BUFF.DEFENSEDOWN: // 防御力ダウン
            case BUFF.ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
            case BUFF.FRAGILE: // 脆弱
            case BUFF.DEFENSEDP: // DP防御力ダウン
            case BUFF.RESISTDOWN: // 耐性ダウン
            case BUFF.ETERNAL_DEFENSEDOWN: // 永続防御ダウン
            case BUFF.ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
            case BUFF.ETERNAL_FRAGILE: // 永続脆弱
                effectSize = getDebuffEffectSize(styleList, buff, buffSetting, memberInfo, state, abilitySettingMap, passiveSettingMap);
                break;
            case BUFF.FUNNEL: // 連撃
                effectSize = getFunnelEffectSize(buff, memberInfo);
                break;
            case BUFF.FIELD: // フィールド
                return buff.max_power + strengthen;
            case BUFF.BABIED: // オギャり
                return 30;
            case BUFF.ETERNAL_OARH: // 永遠なる誓い
                return 100;
            case BUFF.SHADOW_CLONE: // 影分身
                return 30;
            case BUFF.ARROWCHERRYBLOSSOMS: // 桜花の矢
                return 50;
            case BUFF.CURRY: // カリー
            case BUFF.SHCHI: // シチー
            case BUFF.STEAK: // ステーキ
            case BUFF.GELATO: // ジェラート
                return 50;
            default:
                break;
        }
    } else {
        let abilityId = Number(buff.key.split("_")[1]);
        return getAbilityEffectSize(abilityId, buff, strengthen);
    }
    return effectSize * (1 + strengthen / 100);
}

export function getAbilityEffectSize(abilityId, buffInfo, strengthen) {
    if (abilityId === ABILITY_ID.KISHIN) {
        // 鬼神
        switch (buffInfo.buff_kind) {
            case BUFF.MINDEYE: // 心眼
                return 120;
            case BUFF.FUNNEL: // 連撃
                return 75;
            default:
                break;
        }
    }
    // アビリティ
    switch (buffInfo.buff_kind) {
        case BUFF.CHARGE: // チャージ
            return 30;
        case BUFF.FIELD: // フィールド
            return buffInfo.max_power + strengthen;
        case BUFF.ARROWCHERRYBLOSSOMS: // 桜花の矢
            return 50;
        case BUFF.YAMAWAKI_SERVANT: // 山脇様のしもべ
            return 40;
        case BUFF.SHADOW_CLONE: // 影分身
            return 30;
        case BUFF.CRITICALRATEUP:
        case BUFF.CRITICALDAMAGEUP:
            // 超越ゲージ
            return 100;
        default:
            break;
    }
    return 0;
}

// コスト変更
export function getCostVariable(handlers) {
    let collect = handlers.collect;
    let skillInfo = handlers.skillInfo;
    let spCost = skillInfo.use_cost;
    let abilitySettingMap = handlers.abilitySettingMap;
    let passiveSettingMap = handlers.passiveSettingMap;

    if (collect?.sphalf) {
        spCost = Math.ceil(spCost / 2);
    } else if (collect?.spzero || spCost === 0) {
        return 0;
    }
    let costSpDown = 0;
    let costSpUp = 0;

    // COSTダウン
    abilityLoop((abilityEffect) => {
        costSpDown = Math.max(costSpDown, abilityEffect.effect_size);
    }, abilitySettingMap, EFFECT.COST_SP_DOWN, handlers);

    passiveLoop((passiveEffect) => {
        costSpDown = Math.max(costSpDown, passiveEffect.effect_size);
    }, passiveSettingMap, EFFECT.COST_SP_DOWN, handlers);

    passiveLoop((passiveEffect) => {
        costSpUp = Math.max(costSpUp, passiveEffect.effect_size);
    }, passiveSettingMap, EFFECT.COST_SP_UP, handlers);

    spCost += costSpUp - costSpDown;
    spCost = spCost < 0 ? 0 : spCost;
    return spCost;
}

const abilityLoop = (func, abilitySettingMap, effectType, handlers) => {
    Object.values(abilitySettingMap)
        .filter(ability => ability.checked)
        .forEach((ability) => {
            const abilityInfo = common.getAbilityInfo(ability.ability_id);
            for (const abilityEffect of common.getAbilityEffectList(ability.ability_id)) {
                if (judgeEffect(ability.chara_id, abilityInfo, abilityEffect, effectType, handlers)) {
                    func(abilityEffect, ability)
                }
            }
        })
}

const passiveLoop = (func, passiveSettingMap, effectType, handlers) => {
    Object.values(passiveSettingMap)
        .filter(passive => passive.checked)
        .forEach((passive) => {
            const passiveInfo = common.getPassiveInfo(passive.skill_id);
            for (const passiveEffect of common.getPassiveEffectList(passive.skill_id)) {
                if (judgeEffect(passive.chara_id, passiveInfo, passiveEffect, effectType, handlers)) {
                    func(passiveEffect, passive)
                }
            }
        })
}

const resonaceLoop = (func, resonanceList, effectType, handlers) => {
    resonanceList
        .forEach(resonance => {
            const resonanceInfo = common.getResonanceInfo(resonance.resonance_id);
            for (const resonanceEffect of common.getResonanceEffectList(resonance.resonance_id)) {
                resonanceInfo.target_element = resonance.targetElement;
                resonanceEffect.range_area = constants.RANGE.SELF;
                if (judgeEffect(resonance.charaId, resonanceInfo, resonanceEffect, effectType, handlers)) {
                    func(resonanceEffect, resonance)
                }
            }
        })
}

const judgeEffect = (charaId, info, effect, effectType, handlers) => {
    let styleInfo = handlers.memberInfo.styleInfo;
    if (Array.isArray(effectType)
        ? !effectType.includes(effect.effect_type)
        : effect.effect_type !== effectType) {
        return false;
    }
    if (!isRangeAreaInclude(charaId, effect.range_area, styleInfo.chara_id)) {
        return false;
    }
    if (!isElementInclude(styleInfo, info.target_element)) {
        return false;
    }
    if (!judgmentCondition(effect, handlers)) {
        return false;
    }
    return true;
}

function judgmentCondition(effect, handlers) {
    const skillInfo = handlers.skillInfo;
    const styleList = handlers.styleList;
    const memberInfo = handlers.memberInfo;

    let spCost = 0;
    switch (Number(effect.conditions)) {
        case CONDITIONS.FIRE_STYLE: // 火属性スタイル
            let fireCount = targetCountInclude(styleList, ELEMENT.FIRE);
            return fireCount >= effect.conditions_id;
        case CONDITIONS.ICE_STYLE: // 氷属性スタイル
            let iceCount = targetCountInclude(styleList, ELEMENT.ICE);
            return iceCount >= effect.conditions_id;
        case CONDITIONS.THUNDER_STYLE: // 雷属性スタイル
            let thunderCount = targetCountInclude(styleList, ELEMENT.THUNDER);
            return thunderCount >= effect.conditions_id;
        case CONDITIONS.LIGHT_STYLE: // 光属性スタイル
            let lightCount = targetCountInclude(styleList, ELEMENT.LIGHT);
            return lightCount >= effect.conditions_id;
        case CONDITIONS.DARK_STYLE: // 雷属性スタイル
            let darkCount = targetCountInclude(styleList, ELEMENT.DARK);
            return darkCount >= effect.conditions_id;
        case CONDITIONS.COST_SP_OVER: // 消費SP指定値以上
            if (skillInfo.cost_type === COST_TYPE.SP) {
                spCost = getCostVariable(handlers)
            }
            return spCost >= effect.conditions_id;
        case CONDITIONS.COST_SP_UNDER: // 消費SP指定値以下
            if (skillInfo.cost_type === COST_TYPE.SP) {
                spCost = getCostVariable(handlers)
            }
            return spCost <= effect.conditions_id;
        case CONDITIONS.TOKEN_OVER: // トークン指定値以上
            return memberInfo.token >= effect.conditions_id;
        default:
            break;
    }
    return true;
}

// バフ強化効果量取得
function getStrengthen(handlers, buff, resonanceList) {
    let strengthen = 0;
    let abilitySettingMap = handlers.abilitySettingMap;
    let passiveSettingMap = handlers.passiveSettingMap;

    // 攻撃力アップ/属性攻撃力アップ
    if (KIND_ATTACKUP.includes(buff.buff_kind)) {
        abilityLoop((abilityEffect) => {
            strengthen += abilityEffect.effect_size;
        }, abilitySettingMap, EFFECT.GIVEATTACKBUFFUP, handlers);

        passiveLoop((passiveEffect) => {
            strengthen += passiveEffect.effect_size;
        }, passiveSettingMap, EFFECT.GIVEATTACKBUFFUP, handlers);

        resonaceLoop((resonanceEffect, resonance) => {
            const limitCount = resonance.limitCount;
            const effectSize = resonanceEffect[`effect_limit_${limitCount}`];
            strengthen += effectSize;
        }, resonanceList, EFFECT.GIVEATTACKBUFFUP, handlers);
    }
    // 防御力ダウン/属性防御力ダウン/DP防御力ダウン/永続防御ダウン/永続属性防御ダウン
    if (KIND_DEFENSEDOWN.includes(buff.buff_kind)) {
        abilityLoop((abilityEffect) => {
            strengthen += abilityEffect.effect_size;
        }, abilitySettingMap, EFFECT.GIVEDEFFENCEDEBUFFUP, handlers);

        abilityLoop((abilityEffect) => {
            strengthen += abilityEffect.effect_size;
        }, abilitySettingMap, EFFECT.GIVEDEBUFFUP, handlers);

        passiveLoop((passiveEffect) => {
            strengthen += passiveEffect.effect_size;
        }, passiveSettingMap, EFFECT.GIVEDEFFENCEDEBUFFUP, handlers);

        passiveLoop((passiveEffect) => {
            strengthen += passiveEffect.effect_size;
        }, passiveSettingMap, EFFECT.GIVEDEBUFFUP, handlers);

        resonaceLoop((resonanceEffect, resonance) => {
            const limitCount = resonance.limitCount;
            const effectSize = resonanceEffect[`effect_limit_${limitCount}`];
            strengthen += effectSize;
        }, resonanceList, EFFECT.GIVEDEFFENCEDEBUFFUP, handlers);

    }
    // 防御ダウン以外のデバフスキル
    if ([BUFF.FRAGILE, BUFF.ETERNAL_FRAGILE, BUFF.RESISTDOWN].includes(buff.buff_kind)) {
        abilityLoop((abilityEffect) => {
            strengthen += abilityEffect.effect_size;
        }, abilitySettingMap, EFFECT.GIVEDEBUFFUP, handlers);

        passiveLoop((passiveEffect) => {
            strengthen += passiveEffect.effect_size;
        }, passiveSettingMap, EFFECT.GIVEDEBUFFUP, handlers);
    }

    // フィールド強化
    if (BUFF.FIELD === buff.buff_kind) {
        abilityLoop((abilityEffect) => {
            strengthen += abilityEffect.effect_size;
        }, abilitySettingMap, EFFECT.FIELD_STRENGTHEN, handlers);

        passiveLoop((passiveEffect) => {
            strengthen += passiveEffect.effect_size;
        }, passiveSettingMap, EFFECT.FIELD_STRENGTHEN, handlers);
    }
    if (handlers.collect?.strengthen) {
        strengthen += 20;
    }
    return strengthen;
}

export function getBuffKey(buffKind) {
    return `${BUFF_KBN[buffKind]}-${buffKind}`;
}

// 一度しか設定出来ないバフ
export function isOnlyBuff(attackInfo, buffInfo) {
    if (!buffInfo) {
        return false;
    }
    // 初回限定
    if (buffInfo.conditions === CONDITIONS.SKILL_INIT) {
        return true;
    }

    // 攻撃スキルに付与されているバフ
    if (ATTACK_BUFF_LIST.includes(buffInfo.buff_kind) &&
        buffInfo.skill_attack1 &&
        buffInfo.chara_id === attackInfo.chara_id) {
        return true;
    }
    return false;
}

// 他スキルに使用出来ない攻撃バフ
export function isOnlyUse(attackInfo, buffInfo) {
    if (!buffInfo || !ATTACK_BUFF_LIST.includes(buffInfo.buff_kind)) {
        return false;
    }
    if (isAloneActivation(buffInfo)) {
        return false;
    }
    if (!buffInfo.skill_attack1 || buffInfo.chara_id !== attackInfo.chara_id) {
        return false;
    }
    const attackId = attackInfo.attack_id;
    const match = [buffInfo.skill_attack1, buffInfo.skill_attack2].some(id => {
        const numId = Number(id);
        return (numId === 999 || attackId === numId);
    });
    return !match;
}

// 単独発動判定
export function isAloneActivation(buffInfo) {
    if (!buffInfo) {
        return false;
    }
    if (ALONE_ACTIVATION_BUFF_KIND.includes(buffInfo.buff_kind)) {
        return buffInfo.effect_count > 0;
    }
    return false;
}

// 選択式のバフ
export function isSelectBuff(buffInfo) {
    if (!buffInfo) {
        return false;
    }
    // 敵の数
    if (buffInfo.conditions === CONDITIONS.ENEMY_COUNT) {
        return true;
    }
    return false;
}

// バフの最良選択
export function getBestBuffKeys(buffKind, kindBuffList, buffSettingMap) {
    let combinedScore = 0;
    let combinedKeys = [];

    if (kindBuffList.length === 0) {
        return combinedKeys;
    }
    // 単独発動の中で最大値のeffect_sizeの要素を取得
    const aloneBuffs = kindBuffList.filter(buffInfo => isAloneActivation(buffInfo));
    const maxAloneBuff = aloneBuffs.reduce((max, buff) =>
        !max || buffSettingMap[buffKind][0][buff.key]?.effect_size > buffSettingMap[buffKind][0][max.key]?.effect_size ? buff : max, null);

    // 単独発動以外の中から、effect_sizeでソートして上位2件を取得
    const normalBuffs = kindBuffList
        .filter(buffInfo => !isAloneActivation(buffInfo))
        .reduce((map, buffInfo) => {
            if (isSelectBuff(buffInfo)) {
                // 重複排除モード
                const current = map.get(buffInfo.skill_id);
                if (!current || buffInfo.buff_id < current.buff_id) {
                    map.set(buffInfo.skill_id, buffInfo);
                }
            } else {
                // 重複許容モード（skill_idを無視してユニークキーを作る）
                map.set(`${buffInfo.skill_id}_${map.size}`, buffInfo);
            }
            return map;
        }, new Map()).values()

    const sortedNormalBuffs = [...normalBuffs].sort(
        (a, b) => {
            if (buffSettingMap[buffKind][0][b.key]?.effect_size === buffSettingMap[buffKind][0][a.key]?.effect_size) {
                return b.use_cost - a.use_cost
            }
            return buffSettingMap[buffKind][0][b.key]?.effect_size - buffSettingMap[buffKind][0][a.key]?.effect_size
        });
    const top1 = sortedNormalBuffs[0];
    const top2 = sortedNormalBuffs[1];

    if (top1 && top2 &&
        ![BUFF.CHARGE, BUFF.FIELD, BUFF.ETERNAL_OARH, BUFF.YAMAWAKI_SERVANT,
        BUFF.ARROWCHERRYBLOSSOMS, BUFF.BABIED, BUFF.SHADOW_CLONE].includes(buffKind)) {
        combinedScore = buffSettingMap[buffKind][0][top1.key]?.effect_size + buffSettingMap[buffKind][0][top2.key]?.effect_size;
        combinedKeys = [top1.key, top2.key];
    } else if (top1) {
        combinedScore = top1.effect_size;
        combinedKeys = [top1.key];
    }

    // 比較して大きい方を返す
    if (maxAloneBuff && buffSettingMap[buffKind][0][maxAloneBuff.key]?.effect_size >= combinedScore) {
        return [maxAloneBuff.key];
    } else {
        return combinedKeys;
    }
}

// ダメージ計算結果取得
export function getDamageResult(attackInfo, styleList, state, selectSkillLv,
    selectBuffKeyMap, buffSettingMap, abilitySettingMap, passiveSettingMap, resonanceList, otherSetting) {
    if (!attackInfo) {
        return null;
    }
    let attackMemberInfo = getCharaIdToMember(styleList, attackInfo.chara_id);
    if (!attackMemberInfo) {
        return null;
    }
    let enemyInfo = state.enemyInfo;

    // ステータスアップ
    let statUp = getStatUp(styleList, state, attackMemberInfo, attackInfo.collect, abilitySettingMap, passiveSettingMap);
    // ステータスダウン
    let enemyStatDown = 0;
    if (attackInfo.collect?.statDown) {
        enemyStatDown = Number(attackInfo.collect.statDown);
    }
    let criticalStatDown = Math.max(enemyStatDown, 50);

    let skillPower = getSkillPower(attackInfo, selectSkillLv, attackMemberInfo, statUp, enemyInfo, enemyStatDown);

    // 引数のfuntionをまとめる
    const memberInfo = attackMemberInfo;
    const handlers = {
        collect: attackInfo.collect,
        skillInfo: common.getSkillData(attackInfo.skill_id),
        attackInfo, memberInfo, styleList,
        selectBuffKeyMap, buffSettingMap, abilitySettingMap, passiveSettingMap, resonanceList, otherSetting, state
    };
    let [physical, element] = getEnemyResist(attackInfo, state);
    let isWeak = physical * element > 10000;

    let buff = getSumBuffEffectSize(handlers);
    let mindeye = isWeak ? getSumEffectSize(selectBuffKeyMap, buffSettingMap, [BUFF.MINDEYE, BUFF.YAMAWAKI_SERVANT]) / 100 : 0;
    let field = getSumEffectSize(selectBuffKeyMap, buffSettingMap, [BUFF.FIELD]) / 100;
    buff += mindeye + field;

    let debuff = getSumDebuffEffectSize(handlers);
    let debuffDp = getSumEffectSize(selectBuffKeyMap, buffSettingMap, [BUFF.DEFENSEDP]) / 100;
    let fragile = isWeak ? getSumEffectSize(selectBuffKeyMap, buffSettingMap, [BUFF.FRAGILE, BUFF.ETERNAL_FRAGILE]) / 100 : 0;
    debuff += fragile;

    let damageRateUp = getDamagerateEffectSize(handlers, attackInfo.hit_count);
    let funnelList = getSumFunnelEffectList(handlers);

    let token = getSumTokenEffectSize(attackInfo, attackMemberInfo);
    let enemyDefenceRate = getEnemyDefenceRate(state);
    let overdrive = 1 + Number(otherSetting.overdrive) / 10;

    // 表示用
    let funnel = 1 + funnelList.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 100;
    let special = 1 + Number(state.dpRate[0] === 0 ? attackInfo.hp_damege / 100 : attackInfo.dp_damege / 100);

    // 個別設定
    let skillUniqueRate = 1;
    if (attackInfo.rest_dp && attackInfo.dp_rate) {
        let dpRate = attackInfo.dp_rate;
        if (attackInfo.rest_dp === 1) {
            // 残DPが高いほど威力アップ
            dpRate = dpRate < 60 ? 60 : dpRate;
            skillUniqueRate += (dpRate - 100) / 200
        }
        if (attackInfo.rest_dp === 2) {
            // 残DPが低いほど威力アップ
            dpRate = dpRate > 100 ? 100 : dpRate;
            skillUniqueRate += (100 - dpRate) / 100 * 75 / 100;
        }
    }

    if (attackInfo.rest_sp === 1 && attackInfo.cost_sp) {
        // 消費DPが低いほど威力アップ
        let sp = attackInfo.cost_sp;
        skillUniqueRate = (sp > 30 ? 30 : sp) / 30;
    }

    let criticalPower = getSkillPower(attackInfo, selectSkillLv, attackMemberInfo, statUp, enemyInfo, criticalStatDown);
    let criticalRate = getCriticalRate(handlers);
    let criticalBuff = getCriticalBuff(handlers);

    let fixed = token * physical / 100 * element / 100 * enemyDefenceRate * skillUniqueRate * overdrive;
    const normalAvgResult =
        calculateDamage(state, skillPower, attackInfo, buff, debuff, debuffDp, fixed, damageRateUp, funnelList, otherSetting);
    const normalMinResult =
        calculateDamage(state, skillPower * 0.9, attackInfo, buff, debuff, debuffDp, fixed, damageRateUp, funnelList, otherSetting);
    const normalMaxResult =
        calculateDamage(state, skillPower * 1.1, attackInfo, buff, debuff, debuffDp, fixed, damageRateUp, funnelList, otherSetting);
    const criticalAvgResult =
        calculateDamage(state, criticalPower, attackInfo, buff, debuff, debuffDp, fixed * criticalBuff, damageRateUp, funnelList, otherSetting);
    const criticalMinResult =
        calculateDamage(state, criticalPower * 0.9, attackInfo, buff, debuff, debuffDp, fixed * criticalBuff, damageRateUp, funnelList, otherSetting);
    const criticalMaxResult =
        calculateDamage(state, criticalPower * 1.1, attackInfo, buff, debuff, debuffDp, fixed * criticalBuff, damageRateUp, funnelList, otherSetting);

    if (state.dpRate[0] > 0) {
        debuff += debuffDp;
    }

    return {
        normalResult: {
            avg: normalAvgResult,
            min: normalMinResult,
            max: normalMaxResult,
            skillPower: skillPower,
        },
        criticalResult: {
            avg: criticalAvgResult,
            min: criticalMinResult,
            max: criticalMaxResult,
            skillPower: criticalPower,
        },
        buff: convertToPercentage(buff),
        debuff: convertToPercentage(debuff),
        special: convertToPercentage(special),
        funnel: convertToPercentage(funnel),
        physical: convertToPercentage(physical / 100),
        element: convertToPercentage(element / 100),
        token: convertToPercentage(token),
        overdrive: convertToPercentage(overdrive),
        damageRate: state.damageRate + "%",
        enemyDefenceRate: convertToPercentage(enemyDefenceRate),
        skillUniqueRate: convertToPercentage(skillUniqueRate),
        criticalRate: convertToPercentage(criticalRate / 100),
        criticalBuff: convertToPercentage(criticalBuff),
    }
}

// ダメージの詳細計算
function calculateDamage(state, basePower, attackInfo, buff, debuff, debuffDp, fixed, damageRateUp, funnelList, otherSetting) {
    let enemyInfo = state.enemyInfo;
    let damageRate = state.damageRate;
    let maxDamageRate = state.maxDamageRate;
    let destruction = Number(enemyInfo.destruction);
    destruction *= (1 - state.correction.destruction_resist / 100);
    let dpPenetration = state.dpRate.length === 1 || state.dpRate[1] === 0;
    let restDp = Array(state.dpRate.length).fill(0);
    let dpNo = -1;  // 現在の使用DPゲージ番号を取得
    for (let i = 0; i < state.dpRate.length; i++) {
        restDp[i] = 0;
        if (state.dpRate[i] > 0) {
            restDp[i] = Number(enemyInfo.max_dp.split(",")[i]) * state.dpRate[i] / 100;
        }
        if (restDp[i] > 0) {
            dpNo = i;
        }
    }
    let restHp = enemyInfo.max_hp * state.hpRate / 100;
    let hitCount = attackInfo.hit_count;
    let destruction_size = destruction * attackInfo.destruction * damageRateUp;
    let damage = 0;
    let special;

    // ダメージ処理
    function procDamage(power, addDestruction) {
        let addBuff = 0;
        let addDebuff = 0;
        if (restDp[0] <= 0 && dpPenetration) {
            special = 1 + attackInfo.hp_damege / 100;
            addBuff = getEarringEffectSize(otherSetting, "attack", hitCount) / 100;
            addDebuff = 0;
        } else {
            special = 1 + attackInfo.dp_damege / 100;
            addBuff = getEarringEffectSize(otherSetting, "break", hitCount) / 100;
            addDebuff = debuffDp;
        }
        let hitDamage = Math.floor(power * (buff + addBuff) * (debuff + addDebuff) * fixed * special * damageRate / 100);

        if (restDp[dpNo] > 0) {
            restDp[dpNo] -= hitDamage;
        } else if (dpNo >= 1) {
            restDp[dpNo - 1] -= hitDamage;
        } else {
            restHp -= hitDamage;
        }
        if (restDp[0] <= 0 && dpPenetration) {
            damageRate += addDestruction;
            if (damageRate > maxDamageRate) damageRate = maxDamageRate;
        }
        hitDamage = hitDamage < 1 ? 1 : hitDamage;
        damage += hitDamage
    }
    // 通常分ダメージ処理
    let hitList = [];
    if (attackInfo.damege_distribution) {
        hitList = attackInfo.damege_distribution.split(",");
    } else {
        const value = 100 / hitCount;
        hitList = new Array(hitCount).fill(value);
    }
    hitList.forEach(value => {
        procDamage(basePower * value / 100, destruction_size / hitCount);
    });
    // 連撃分ダメージ処理
    funnelList.forEach(value => {
        procDamage(basePower * value / 100, destruction_size * value / 100);
    });

    const billion = 1_000_000_000;
    if (damage > billion) {
        damage = billion * (2 - Math.exp(0.7 - 0.7 * (damage / billion)));
    }
    if (damage > billion * 2) {
        damage = billion * 2;
    }

    return {
        damage: Math.floor(damage),
        restDp: restDp,
        restHp: restHp,
        damageRate: Math.round(damageRate * 10) / 10,
    };
}

// 基礎攻撃力取得
export function getSkillPower(attackInfo, selectSkillLv, memberInfo, statUp, enemyInfo, enemyStatDown) {
    let jewelLv = 0;
    if (memberInfo.styleInfo.jewel_type === JEWEL_TYPE.ATTACK_UP) {
        jewelLv = memberInfo.jewelLv;
    }
    let enemyStat = Math.max(enemyInfo.enemy_stat - enemyStatDown, 0);
    let status = getStatus(attackInfo, memberInfo, statUp);
    return calcAttackEffectSize(attackInfo, status, enemyStat, selectSkillLv, jewelLv)
}

// 基礎攻撃力計算
export function calcAttackEffectSize(attackInfo, status, enemyStat, skillLv, jewelLv) {
    let minPower = attackInfo.min_power * (1 + 0.05 * (skillLv - 1));
    let maxPower = attackInfo.max_power * (1 + 0.02 * (skillLv - 1));
    let skillStat = attackInfo.param_limit;
    let basePower;
    // 宝珠分以外
    if (enemyStat > status) {
        basePower = minPower / skillStat * (status - enemyStat + skillStat);
        basePower = basePower < 1 ? 1 : basePower;
    } else if (enemyStat + skillStat > status) {
        basePower = (maxPower - minPower) / skillStat * (status - enemyStat) + minPower;
    } else {
        basePower = maxPower;
        basePower += maxPower * (status - enemyStat - skillStat) * 0.0025;
    }

    // 宝珠分(SLvの恩恵を受けない)
    if (jewelLv > 0) {
        let jewelStat = skillStat + jewelLv * 20;
        let jewelPower = 0;
        if (enemyStat > status) {
            jewelPower += (attackInfo.min_power / jewelStat * (status - enemyStat + jewelStat)) * jewelLv * 0.02;
        } else if (enemyStat + jewelStat > status) {
            jewelPower += ((attackInfo.max_power - attackInfo.min_power) / jewelStat * (status - enemyStat) + attackInfo.min_power) * jewelLv * 0.02;
        } else {
            jewelPower += attackInfo.max_power * jewelLv * 0.02;
        }
        jewelPower = jewelPower < 0 ? 0 : jewelPower;
        basePower += jewelPower;
    }
    return Math.floor(basePower * 100) / 100;
}

// 効果量合計
export function getSumEffectSize(selectBuffKeyMap, buffSettingMap, BUFF_KIND_LIST) {
    let effectSize = 0;
    BUFF_KIND_LIST.forEach(buffKind => {
        const buffKey = getBuffKey(buffKind);
        const selectedKeys = selectBuffKeyMap[buffKey];
        if (selectedKeys) {
            selectedKeys.forEach((selectedKey, index) => {
                if (selectedKey) {
                    effectSize += buffSettingMap[buffKind][index][selectedKey]?.effect_size || 0;
                }
            })
        }
    });
    return effectSize;
}

// 合計バフ効果量取得
function getSumBuffEffectSize(handlers) {
    const state = handlers.state;
    const attackInfo = handlers.attackInfo;
    const otherSetting = handlers.otherSetting;
    const memberInfo = handlers.memberInfo;

    // スキルバフ合計
    let sumBuff = getSumEffectSize(handlers.selectBuffKeyMap, handlers.buffSettingMap,
        [BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP, BUFF.CHARGE, BUFF.ARROWCHERRYBLOSSOMS,
        BUFF.ETERNAL_OARH, BUFF.BABIED, BUFF.SHADOW_CLONE, BUFF.CURRY, BUFF.SHCHI, BUFF.STEAK, BUFF.GELATO]);
    // 攻撃力アップアビリティ
    sumBuff += getSumAbilityEffectSize(handlers, EFFECT.ATTACKUP);
    // 属性リング(0%-10%)
    sumBuff += Number(otherSetting.ring);
    sumBuff += getChainEffectSize(otherSetting, "skill");
    // トークン
    sumBuff += getSumTokenAbilirySize(handlers, EFFECT.TOKEN_ATTACKUP);
    // 士気
    sumBuff += memberInfo.morale ? memberInfo.morale * 5 : 0;
    // スコアタグレード
    if (state.correction.power_up) {
        sumBuff += state.correction.power_up;
    }
    if (state.correction[`element_power_up_${attackInfo.attack_element}`]) {
        sumBuff += state.correction[`element_power_up_${attackInfo.attack_element}`];
    }
    return 1 + sumBuff / 100;
}

// 合計デバフ効果量取得
function getSumDebuffEffectSize(handlers) {
    // スキルデバフ合計
    let sumBuff = getSumEffectSize(handlers.selectBuffKeyMap, handlers.buffSettingMap,
        [BUFF.DEFENSEDOWN, BUFF.ELEMENT_DEFENSEDOWN, BUFF.ETERNAL_DEFENSEDOWN, BUFF.ELEMENT_ETERNAL_DEFENSEDOWN]);
    // // 防御ダウンアビリティ
    sumBuff += getSumAbilityEffectSize(handlers, EFFECT.DEFFENCEDOWN);
    return 1 + sumBuff / 100;
}

// 合計連撃効果量取得
function getSumFunnelEffectList(handlers) {
    let funnel_list = [];
    let selectBuffKeyMap = handlers.selectBuffKeyMap;
    let abilitySettingMap = handlers.abilitySettingMap;
    let passiveSettingMap = handlers.passiveSettingMap;

    // スキルデバフ合計
    const funnelKey = getBuffKey(BUFF.FUNNEL);
    const selectedKey = selectBuffKeyMap[funnelKey];
    if (selectedKey) {
        selectedKey.forEach(selectedKey => {
            let key = selectedKey.split('_');
            if (key[0] === "buff") {
                let buffId = Number(key[1]);
                let buffInfo = common.getBuffIdToBuff(buffId);
                if (buffInfo) {
                    let loop = buffInfo.max_power;
                    let size = buffInfo.effect_size;
                    for (let i = 0; i < loop; i++) {
                        funnel_list.push(size);
                    }
                }
            } else {
                let abilityId = Number(key[1]);
                switch (abilityId) {
                    case ABILITY_ID.KISHIN:
                        let loop = 3;
                        let size = 25;
                        for (let i = 0; i < loop; i++) {
                            funnel_list.push(size);
                        }
                        break;
                    default:
                        break;
                }
            }

        })
    }

    const EFFECT_FUNNEL = [EFFECT.FUNNEL, EFFECT.FUNNEL_ALWAYS];
    passiveLoop((passiveEffect) => {
        if (EFFECT_FUNNEL.includes(passiveEffect.effect_type)) {
            let size = passiveEffect.effect_size;
            let loop = passiveEffect.effect_count;
            for (let i = 0; i < loop; i++) {
                funnel_list.push(size);
            }
        }
    }, passiveSettingMap, EFFECT_FUNNEL, handlers);

    abilityLoop((abilityEffect) => {
        let size = abilityEffect.effect_size;
        let loop = abilityEffect.effect_count;
        for (let i = 0; i < loop; i++) {
            funnel_list.push(size);
        }
    }, abilitySettingMap, EFFECT_FUNNEL, handlers);

    // 降順でソート
    funnel_list.sort(function (a, b) {
        return b - a;
    });
    return funnel_list;
}

// 破壊率上昇
function getDamagerateEffectSize(handlers, hitCount) {
    const otherSetting = handlers.otherSetting;
    const state = handlers.state;

    let destructionEffectSize = 100;
    destructionEffectSize += getSumEffectSize(handlers.selectBuffKeyMap, handlers.buffSettingMap, [BUFF.DAMAGERATEUP]);
    destructionEffectSize += getSumAbilityEffectSize(handlers, EFFECT.DAMAGERATEUP);
    destructionEffectSize += getSumTokenAbilirySize(handlers, EFFECT.TOKEN_DAMAGERATEUP)
    destructionEffectSize += getEarringEffectSize(otherSetting, "blast", 11 - hitCount);
    destructionEffectSize += getChainEffectSize(otherSetting, "skill");

    // スコアタグレード
    if (state.correction.destruction) {
        destructionEffectSize += state.correction.destruction;
    }
    return destructionEffectSize / 100;
}

// クリティカル率取得
function getCriticalRate(handlers) {
    const attackInfo = handlers.attackInfo;
    const memberInfo = handlers.memberInfo;
    const selectBuffKeyMap = handlers.selectBuffKeyMap;
    const enemyInfo = handlers.state.enemyInfo;

    let criticalRate = 1.5;
    if (attackInfo?.penetration) {
        criticalRate = 100;
    } else {
        let diff = (memberInfo.luk - enemyInfo.enemy_stat);
        criticalRate += diff > 0 ? diff * 0.04 : 0;
        criticalRate = criticalRate > 15 ? 15 : criticalRate;
        criticalRate += getSumEffectSize(handlers.selectBuffKeyMap, handlers.buffSettingMap, [BUFF.CRITICALRATEUP, BUFF.ELEMENT_CRITICALRATEUP]);
        criticalRate += getSumAbilityEffectSize(handlers, EFFECT.CRITICALRATEUP);
        // チャージ
        criticalRate += (selectBuffKeyMap[getBuffKey(BUFF.CHARGE)]?.[0] ?? 0) ? 20 : 0;
        // 永遠なる誓い
        criticalRate += (selectBuffKeyMap[getBuffKey(BUFF.ETERNAL_OARH)]?.[0] ?? 0) ? 100 : 0;
    }
    return criticalRate > 100 ? 100 : criticalRate;
}

// クリティカルバフ取得
function getCriticalBuff(handlers) {
    const memberInfo = handlers.memberInfo;
    let criticalBuff = 50;
    criticalBuff += getSumEffectSize(handlers.selectBuffKeyMap, handlers.buffSettingMap,
        [BUFF.CRITICALDAMAGEUP, BUFF.ELEMENT_CRITICALDAMAGEUP],
        memberInfo.styleInfo.charaId);
    criticalBuff += getSumAbilityEffectSize(handlers, EFFECT.CRITICAL_DAMAGE_UP);
    return 1 + criticalBuff / 100;
}
// トークン効果量
function getSumTokenEffectSize(attackInfo, attackMemberInfo) {
    // トークン
    let tokenCount = attackMemberInfo.token ? attackMemberInfo.token : 0;
    if (attackInfo.token_power_up === 1) {
        return 1 + tokenCount * 16 / 100;
    }
    return 1;
}

// トークンアビリティ取得
function getSumTokenAbilirySize(handlers, effectType) {
    const styleList = handlers.styleList;
    const abilitySettingMap = handlers.abilitySettingMap;
    let sum = 0;
    abilityLoop((abilityEffect, setting) => {
        let memberInfo = getCharaIdToMember(styleList, setting.chara_id);
        if (abilityEffect.effect_type === effectType && memberInfo) {
            sum = abilityEffect.effect_size * (memberInfo.token ? memberInfo.token : 0);
        }
    }, abilitySettingMap, effectType, handlers);
    return sum;
}

// アビリティ効果量合計取得
function getSumAbilityEffectSize(handlers, effectType) {
    const styleList = handlers.styleList;
    const abilitySettingMap = handlers.abilitySettingMap;
    const passiveSettingMap = handlers.passiveSettingMap;
    const resonanceList = handlers.resonanceList;

    let abilityEffectSize = 0;
    let sumNoneEffectSize = 0;
    let sumPhysicalEffectSize = 0;
    let sumElementEffectSize = 0;
    let activationNoneEffectSize = 0;
    let activationPhysicalEffectSize = 0;
    let activationElementEffectSize = 0;

    abilityLoop((abilityEffect) => {
        let abilityId = abilityEffect.ability_id;
        let effectSize = abilityEffect.effect_size;
        // スペシャルタッグ
        if (abilityId === ABILITY_ID.SPECIAL_TAG) {
            let goodCondition = targetCountMotivation(styleList, 1);
            effectSize = Math.min(goodCondition * 10, 30);
        }
        if (ALONE_ACTIVATION_ABILITY_LIST.includes(abilityId)) {
            if (abilityEffect.element !== 0) {
                activationElementEffectSize = Math.max(activationElementEffectSize, effectSize);
            } else if (abilityEffect.physical !== 0) {
                activationPhysicalEffectSize = Math.max(activationPhysicalEffectSize, effectSize);
            } else {
                activationNoneEffectSize = Math.max(activationNoneEffectSize, effectSize);
            }
        } else {
            if (abilityEffect.element !== 0) {
                sumElementEffectSize += effectSize;
            } else if (abilityEffect.physical !== 0) {
                sumPhysicalEffectSize += effectSize;
            } else {
                sumNoneEffectSize += effectSize;
            }
        }
    }, abilitySettingMap, effectType, handlers);

    abilityEffectSize += activationNoneEffectSize + sumNoneEffectSize
        + activationPhysicalEffectSize + sumPhysicalEffectSize
        + activationElementEffectSize + sumElementEffectSize;

    passiveLoop((passiveEffect) => {
        abilityEffectSize += passiveEffect.effect_size;
    }, passiveSettingMap, effectType, handlers);

    resonaceLoop((resonanceEffect, resonance) => {
        const limitCount = resonance.limitCount;
        const effectSize = resonanceEffect[`effect_limit_${limitCount}`];
        abilityEffectSize += effectSize;
    }, resonanceList, effectType, handlers);
    return abilityEffectSize;
}

// 対象範囲判定
function isRangeAreaInclude(charaId, rangeArea, targetCharaId) {
    switch (rangeArea) {
        case RANGE.SELF:
            return charaId === targetCharaId;
        case RANGE.ALLY_ALL:
            return true;
        case RANGE.MEMBER_31C:
            return CHARA_ID.MEMBER_31C.includes(targetCharaId);
        case RANGE.MEMBER_31E:
            return CHARA_ID.MEMBER_31E.includes(targetCharaId);
        case RANGE.MARUYAMA_MEMBER:
            return CHARA_ID.MARUYAMA.includes(targetCharaId);
        case RANGE.RUKA_SHARO:
            return CHARA_ID.RUKA_SHARO.includes(targetCharaId);
        default:
            break;
    }
    return true;
}

// 対象数判定
function targetCountInclude(styleList, targetElement) {
    let count = 0;
    styleList.selectStyleList.forEach((style) => {
        if (isElementInclude(style?.styleInfo, targetElement)) {
            count++;
        }
    })
    return count;
}

// 属性判定
export function isElementInclude(styleInfo, targetElement) {
    if (!styleInfo) {
        return false;
    }
    if (targetElement === 0) {
        return true;
    }
    return styleInfo.element === targetElement || styleInfo.element2 === targetElement;
}

// やるき対象数判定
function targetCountMotivation(styleList, motivation) {
    let count = 0;
    styleList.selectStyleList.forEach((style) => {
        let styleMotivation = 0;
        if (style) {
            styleMotivation = style.motivation ? style.motivation : 0;
        } else {
            styleMotivation = undefined;
        }
        if (styleMotivation <= motivation) {
            count++;
        }
    })
    return count;
}

// キャラIDからメンバー情報取得
export function getCharaIdToMember(styleList, charaId) {
    const filteredMember = (styleList) => {
        const filterList = styleList.filter((obj) => obj?.styleInfo?.chara_id === charaId);
        return filterList.length > 0 ? filterList[0] : undefined;
    }
    let member;
    member = filteredMember(styleList.selectStyleList);
    if (!member) {
        member = filteredMember(styleList.subStyleList)
    }
    return member;
}

// キャラIDがメインかサブか判定
export function getCharaIdToTroopKbn(styleList, charaId) {
    const filteredMember = (styleList) => {
        const filterList = styleList.filter((obj) => obj?.styleInfo?.chara_id === charaId);
        return filterList.length > 0 ? filterList[0] : undefined;
    }
    let member = filteredMember(styleList.selectStyleList);
    if (member) {
        return TROOP_KBN.MAIN;
    }
    member = filteredMember(styleList.subStyleList)
    if (member) {
        return TROOP_KBN.SUB;
    }
    return undefined;
}


// 敵ステータス更新
export function updateEnemyStatus(enemyClassNo, enemyInfo) {
    const enemyClass = 99;
    let filteredEnemy = enemyList.filter((obj) => obj.enemy_class === enemyClass && obj.enemy_class_no === enemyClassNo);
    let index = enemyList.findIndex((obj) => obj === filteredEnemy[0]);
    Object.assign(enemyList[index], enemyInfo);
}

// セラフ遭遇戦敵ステータス設定
// function updateSeraphEncounter(enemyInfo, selectedList) {
//     let new_enemyInfo = JSON.parse(JSON.stringify(enemyInfo));
//     selectedList.forEach((item) => {
//         switch (item.effect_kind) {
//             case "STAT_UP":
//                 new_enemyInfo.enemy_stat += item.effect_size;
//                 break;
//             case "ICE_DOWN":
//                 new_enemyInfo.element_2 += item.effect_size;
//                 break;
//             case "LIGHT_DOWN":
//                 new_enemyInfo.element_4 += item.effect_size;
//                 break;
//             case "HP_UP":
//                 new_enemyInfo.max_hp = Math.floor(new_enemyInfo.max_hp * (1 + (item.effect_size / 100)));
//                 break;
//             case "DP_UP":
//                 new_enemyInfo.max_dp = String(Math.floor(Number(new_enemyInfo.max_dp) * (1 + (item.effect_size / 100))));
//                 break;
//         }
//     })
//     // setEnemyStatus(new_enemyInfo)
// }

export const getStatus = (info, memberInfo, statUp) => {
    let molecule = 0;
    let denominator = 0;
    if (info.ref_status_1 !== 0) {
        molecule += (memberInfo[STATUS_KBN[info.ref_status_1]] + statUp) * 2;
        denominator += 2;
    }
    if (info.ref_status_2 && info.ref_status_2 !== 0) {
        molecule += memberInfo[STATUS_KBN[info.ref_status_2]] + statUp;
        denominator += 1;
    }
    if (info.ref_status_3 && info.ref_status_3 !== 0) {
        molecule += memberInfo[STATUS_KBN[info.ref_status_3]] + statUp;
        denominator += 1;
    }
    return molecule / denominator;
}

// バフ効果量取得
function getBuffEffectSize(styleList, buffInfo, buffSetting, memberInfo, state, targetJewelType, abilitySettingMap, passiveSettingMap) {
    let jewelLv = 0;
    if (memberInfo.styleInfo && memberInfo.styleInfo.jewel_type === targetJewelType) {
        jewelLv = memberInfo.jewelLv;
    }
    let skillLv = buffSetting.skill_lv;
    // 固定量のバフ
    if (buffInfo.ref_status_1 === 0) {
        return buffInfo.min_power;
    }
    // ステータス
    let statUp = getStatUp(styleList, state, memberInfo, buffSetting.collect, abilitySettingMap, passiveSettingMap);
    let status = getStatus(buffInfo, memberInfo, statUp);
    return calcBuffEffectSize(buffInfo, status, skillLv, jewelLv);
}

// バフ効果量計算
export function calcBuffEffectSize(buffInfo, status, skillLv, jewelLv) {
    let minPower = buffInfo.min_power * (1 + 0.03 * (skillLv - 1));
    let maxPower = buffInfo.max_power * (1 + 0.02 * (skillLv - 1));
    let skillStat = buffInfo.param_limit;
    let effectSize = 0;
    // 固定量のバフ
    if (buffInfo.min_power === buffInfo.max_power) {
        return buffInfo.min_power;
    }

    // 宝珠分以外
    if (status < skillStat) {
        effectSize = (maxPower - minPower) / skillStat * status + minPower;
    } else {
        effectSize = maxPower * (1 + (status - skillStat) * 0.0002);
    }
    // 宝珠分(SLvの恩恵を受けない)
    if (jewelLv > 0) {
        let jewelStat = skillStat + jewelLv * 60;
        if (status > jewelStat) {
            effectSize += buffInfo.max_power * jewelLv * 0.04;
        } else {
            effectSize += ((buffInfo.max_power - buffInfo.min_power) / jewelStat * status + buffInfo.min_power) * jewelLv * 0.04;
        }
    }
    return effectSize;
}

// デバフ効果量
function getDebuffEffectSize(styleList, buffInfo, buffSetting, memberInfo, state, abilitySettingMap, passiveSettingMap) {
    if (!state) {
        return 0;
    }
    let jewelLv = 0;
    if (memberInfo.styleInfo && memberInfo.styleInfo.jewel_type === JEWEL_TYPE.SKILL_DEBUFFUP) {
        jewelLv = memberInfo.jewelLv;
    }
    // ステータス
    let statUp = getStatUp(styleList, state, memberInfo, buffSetting.collect, abilitySettingMap, passiveSettingMap);
    let enemyInfo = state.enemyInfo;
    let enemyStat = Number(enemyInfo.enemy_stat);
    let enemyStatDown = 0;
    if (buffSetting.collect?.statDown) {
        enemyStatDown = Number(buffSetting.collect.statDown);
    }
    enemyStat = Math.max(enemyStat - enemyStatDown, 0);

    let skillLv = buffSetting.skill_lv;
    let status = getStatus(buffInfo, memberInfo, statUp);
    return calcDebuffEffectSize(buffInfo, status, enemyStat, skillLv, jewelLv);
}

// デバフ効果量
export function calcDebuffEffectSize(buffInfo, status, enemyStat, skillLv, jewelLv) {
    let minPower = buffInfo.min_power * (1 + 0.05 * (skillLv - 1));
    let maxPower = buffInfo.max_power * (1 + 0.02 * (skillLv - 1));
    let skillStat = buffInfo.param_limit;
    let effectSize = 0;
    // 宝珠分以外
    if (status - enemyStat < 0) {
        effectSize = minPower;
    } else if (status - enemyStat < skillStat) {
        effectSize = (maxPower - minPower) / skillStat * (status - enemyStat) + minPower;
    } else {
        effectSize = maxPower * (1 + (status - enemyStat - skillStat) * 0.001);
    }

    // 宝珠分(SLvの恩恵を受けない)
    if (jewelLv > 0) {
        let jewelStat = skillStat + jewelLv * 20;
        let jewelPower = 0;
        if (enemyStat > status) {
            jewelPower = buffInfo.min_power * jewelLv * 0.02;
        } else if (enemyStat + jewelStat > status) {
            jewelPower = ((buffInfo.max_power - buffInfo.min_power) / jewelStat * (status - enemyStat) + buffInfo.min_power) * jewelLv * 0.02;
        } else {
            jewelPower = buffInfo.max_power * jewelLv * 0.02;
        }
        jewelPower = jewelPower < 0 ? 0 : jewelPower;
        effectSize += jewelPower;
    }
    return effectSize;
}

// 連撃効果量
function getFunnelEffectSize(buffInfo, memberInfo) {
    let funnel_power = buffInfo.effect_size;
    let effectSize;
    let minPower = buffInfo.min_power;
    let maxPower = buffInfo.max_power;
    if (minPower === maxPower) {
        effectSize = funnel_power * minPower;
    } else {
        let status1 = memberInfo[STATUS_KBN[buffInfo.ref_status_1]];
        if (buffInfo.param_limit > status1) {
            effectSize = funnel_power * minPower;
        } else {
            effectSize = funnel_power * maxPower;
        }
    }

    return effectSize;
}

// 敵防御力取得
function getEnemyDefenceRate(state) {
    let enemyInfo = state.enemyInfo;
    let enemyDefenceRate = 1;
    if (state.correction.defense_rate) {
        let count = 1;
        if (state.correction.defense_rate.conditions?.includes("step_turn")) {
            let turn = Number(state.correction.defense_rate.conditions.replace("step_turn", ""));
            count = Math.floor(state.score.turnCount / turn);
        }
        enemyDefenceRate = (1 - state.correction.defense_rate.size / 100) ** count;
    }
    // スカルフェザー
    if (enemyInfo.enemy_class === ENEMY_CLASS.HARD_LAYER &&
        (enemyInfo.enemy_class_no === 12 || enemyInfo.enemy_class_no === 13)) {
        const defenceRate = 5 / 100;
        enemyDefenceRate = (1 - defenceRate) ** state.hard.skullFeatherDeffense;
    }
    // if ($("#enemy_class").val() === ENEMY_CLASS.SERAPH_ENCOUNTER) {
    //     enemy_defence_rate = getCardEffect("ATTACK_DOWN");
    // }
    return enemyDefenceRate;
}

// ステータスアップ取得
export function getStatUp(styleList, state, memberInfo, collect, abilitySettingMap, passiveSettingMap) {
    let enemyInfo = state.enemyInfo;

    let tearsOfDreams = 0;
    // 夢の泪
    if (enemyInfo.enemy_class === ENEMY_CLASS.HARD_LAYER) {
        const tearsOfDreamsList = [0, 12, 12, 12, 12, 15, 15, 15, 15, 15, 20, 20, 20, 20, 20]
        tearsOfDreams = tearsOfDreamsList[enemyInfo.enemy_class_no] * Number(state.hard.tearsOfDreams);
    }
    // 属性ボーナス
    let elemetalBonus = 0;
    if (enemyInfo.enemy_class === ENEMY_CLASS.HARD_LAYER_EX) {
        state.hardEx.bonusElement.forEach((bonus, index) => {
            if (bonus) {
                if (isElementInclude(memberInfo.styleInfo, index)) {
                    elemetalBonus = 30;
                }
            }
        });
    }
    // スコアタボーナス
    let scoreBonus = 0;
    if (enemyInfo.enemy_class === ENEMY_CLASS.SCORE_ATTACK) {
        const selectHalf = state.score.half
        let physical = common.getCharaData(memberInfo.styleInfo.chara_id).physical;
        const targetConditions = [`element_${memberInfo.styleInfo.element}`, `element_${memberInfo.styleInfo.element2}`, `physical_${physical}`];

        scoreBonusList
            .filter(obj =>
                obj.score_attack_no === enemyInfo.sub_no &&
                (obj.half === 0 || obj.half === selectHalf)
            )
            .forEach(obj => {
                if (targetConditions.includes(obj.conditions)) {
                    scoreBonus = Math.max(obj.effect_size, scoreBonus);
                }
            });
    }
    // 士気
    let morale = memberInfo.morale ? memberInfo.morale * 5 : null;
    // 闘志
    let fightingspirit = collect?.fightingspirit ? 20 : null;
    // やる気
    let motivation = null;
    if (checkPawapuroExist(styleList.selectStyleList)) {
        const MOTIVATION_LIST = [50, 25, 10, -5, -10];
        motivation = MOTIVATION_LIST[memberInfo.motivation ? memberInfo.motivation : 0];
    }
    const candidates = [morale, fightingspirit, motivation].filter(v => v != null);
    const statUp = candidates.length > 0 ? Math.max(...candidates) : 0;
    // パッシブ(能力固定上昇)
    const handlers = {
        memberInfo, styleList, abilitySettingMap, passiveSettingMap, state, resonanceList: []
    };
    let passiveStatusUp = getSumAbilityEffectSize(handlers, EFFECT.STATUSUP_VALUE);
    return tearsOfDreams + scoreBonus + elemetalBonus + statUp + passiveStatusUp;
}

// カンマ削除
export function removeComma(value) {
    var regex = /[^0-9]/g;
    var newValue = "0" + value.replace(regex, '');
    return Number(newValue).toString()
}

// グラデーションを取得するメソッド
export function getApplyGradient(baseColor, percent) {
    // generateGradientメソッドを呼び出してグラデーションカラーコードを取得
    let gradientColor = generateGradient(baseColor, "#FFFFFF", percent);
    // グラデーションのスタイルを組み立てる
    let gradientStyle = "linear-gradient(to right, " + baseColor + " 0%, " + gradientColor + " " + percent + "%, #FFFFFF " + percent + "%)";
    return gradientStyle;
}
// グラデーション生成メソッド
function generateGradient(color1, color2, percent) {
    // パーセントの範囲を0～100に制限
    percent = Math.min(100, Math.max(0, percent));
    // カラーコードを16進数から10進数に変換
    function hexToRgb(hex) {
        return parseInt(hex, 16);
    }
    // カラーコードの10進数表現
    let r1 = hexToRgb(color1.substring(1, 3));
    let g1 = hexToRgb(color1.substring(3, 5));
    let b1 = hexToRgb(color1.substring(5, 7));
    let r2 = hexToRgb(color2.substring(1, 3));
    let g2 = hexToRgb(color2.substring(3, 5));
    let b2 = hexToRgb(color2.substring(5, 7));
    // パーセント位置で補間
    let r = Math.round(r1 + (r2 - r1) * (percent / 100));
    let g = Math.round(g1 + (g2 - g1) * (percent / 100));
    let b = Math.round(b1 + (b2 - b1) * (percent / 100));
    // 10進数から16進数に変換
    function rgbToHex(value) {
        let hex = value.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
    let resultColor = "#" + rgbToHex(r) + rgbToHex(g) + rgbToHex(b);
    return resultColor;
}

// ダメージ詳細用グラデーション
export function generateGradientFromRange(range, colorCode) {
    // 最小値と最大値を取得する
    const [minPercentage, maxPercentage] = parseRange(range);

    // RGBA形式の色コードを生成する
    const rgba1 = convertToRGBA(colorCode, 1);
    const rgba2 = convertToRGBA(colorCode, 0.5);

    // グラデーションスタイルを生成する
    const gradientStyle = `linear-gradient(to right, ${rgba1} 0%, ${rgba1} ${minPercentage}%, ${rgba2} ${minPercentage}%, ${rgba2} ${maxPercentage}%, rgba(255, 255, 255, 1) ${maxPercentage}%, rgba(255, 255, 255, 1) 100%)`;
    return gradientStyle;
}

function parseRange(range) {
    // 「～」を含まない場合、最小値と最大値が同じとみなしてその値を返す
    if (!range.includes('～')) {
        range += '～' + range;
    }

    // rangeを'～'で分割して最小値と最大値を取得し、数値に変換する
    const rangeValues = range.split('～').map(parseFloat);
    // 最小値と最大値が0未満の場合は0に設定
    const minPercentage = Math.max(0, rangeValues[0]);
    const maxPercentage = Math.max(0, rangeValues[1]);

    return [minPercentage, maxPercentage];
}

function convertToRGBA(colorCode, opacity) {
    // カラーコードからRGB値を抽出する
    const color = colorCode.substring(1); // #を取り除く
    const red = parseInt(color.substring(0, 2), 16); // R値
    const green = parseInt(color.substring(2, 4), 16); // G値
    const blue = parseInt(color.substring(4, 6), 16); // B値

    // RGBA形式の色コードを生成して返す
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}