import {
    BUFF, CONDITIONS
    , ALONE_ACTIVATION_BUFF_NO
} from "utils/const";

export const ATTACK_BUFF_LIST = [
    BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP, BUFF.MINDEYE, BUFF.FUNNEL, BUFF.DAMAGERATEUP,
    BUFF.CRITICALRATEUP, BUFF.CRITICALDAMAGEUP, BUFF.ELEMENT_CRITICALRATEUP, BUFF.ELEMENT_CRITICALDAMAGEUP];

export function getBuffKey(effectType, effectNo) {
    return `${effectType}-${effectNo || '0'}`;
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
    if (ATTACK_BUFF_LIST.includes(buffInfo.effect_no) &&
        buffInfo.skill_attack1 &&
        buffInfo.chara_id === attackInfo.chara_id) {
        return true;
    }
    return false;
}

// 他スキルに使用出来ない攻撃バフ
export function isOnlyUse(attackInfo, buffInfo) {
    if (!buffInfo || !ATTACK_BUFF_LIST.includes(buffInfo.effect_no)) {
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
export function isAloneActivation(effect) {
    if (!effect) {
        return false;
    }
    if (ALONE_ACTIVATION_BUFF_NO.includes(effect.effect_no)) {
        return effect.kbn === "ability" || effect.effect_turn > 0;
    }
    return false;
}

// 選択式のバフ
export const isSelectBuff = (buffInfo) => {
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
export const getBestBuffKeys = (buffKey, kindBuffList, buffSettingMap, overlap) => {
    let combinedScore = 0;
    let combinedKeys = [];

    if (kindBuffList.length === 0) {
        return combinedKeys;
    }
    // if (!buffSettingMap[buffKey]) {
    //     return combinedKeys;
    // }
    // 単独発動の中で最大値のeffect_sizeの要素を取得
    const aloneBuffs = kindBuffList.filter(effect => isAloneActivation(effect));
    const maxAloneBuff = aloneBuffs.reduce((max, buff) =>
        !max || buffSettingMap[buffKey][0][buff.key]?.calcEffectSize > buffSettingMap[buffKey][0][max.key]?.calcEffectSize ? buff : max, null);

    // 単独発動以外の中から、effect_sizeでソートして上位2件を取得
    const normalBuffs = kindBuffList
        .filter(effect => !isAloneActivation(effect))
        .reduce((map, effect) => {
            if (isSelectBuff(effect)) {
                // 重複排除モード
                const current = map.get(effect.skill_id);
                if (!current || effect.effect_id < current.effect_id) {
                    map.set(effect.skill_id, effect);
                }
            } else {
                // 重複許容モード（skill_idを無視してユニークキーを作る）
                map.set(`${effect.skill_id}_${map.size}`, effect);
            }
            return map;
        }, new Map()).values()

    const sortedNormalBuffs = [...normalBuffs].sort(
        (a, b) => {
            if (buffSettingMap[buffKey][0][b.key]?.calcEffectSize === buffSettingMap[buffKey][0][a.key]?.calcEffectSize) {
                return b.use_cost - a.use_cost
            }
            return buffSettingMap[buffKey][0][b.key]?.calcEffectSize - buffSettingMap[buffKey][0][a.key]?.calcEffectSize
        });
    const top1 = sortedNormalBuffs[0];
    const top2 = sortedNormalBuffs[1];

    if (top1 && top2 && overlap) {
        combinedScore = buffSettingMap[buffKey][0][top1.key]?.calcEffectSize + buffSettingMap[buffKey][0][top2.key]?.calcEffectSize;
        combinedKeys = [top1.key, top2.key];
    } else if (top1) {
        combinedScore = top1.calcEffectSize;
        combinedKeys = [top1.key];
    }

    // 比較して大きい方を返す
    if (maxAloneBuff && buffSettingMap[buffKey][0][maxAloneBuff.key]?.calcEffectSize >= combinedScore) {
        return [maxAloneBuff.key];
    } else {
        return combinedKeys;
    }
}
