import {
    BUFF, EFFECT, RANGE, ROLE
    , CHARA_ID, STYLE_ID, EFFECT_ID, ABILITY_ID
} from "utils/const";
import * as constants from "utils/const";
import * as common from "utils/common";
import * as logic from "./logic";
import skillList from "data/skillList";
import skillEffect from "data/skillEffect";

const TARGET_KIND = [
    EFFECT.ATTACKUP, // 攻撃力アップ
    EFFECT.DEFFENCEDOWN, // 防御力ダウン
    EFFECT.DAMAGERATEUP, // 破壊率上昇
    EFFECT.CRITICALRATEUP, // クリティカル率アップ
    EFFECT.CRITICAL_DAMAGE_UP, // クリティカルダメージアップ
    EFFECT.FIELD_DEPLOYMENT, // フィールド展開
    EFFECT.GRANT_BUFF, // バフ付与
    EFFECT.STATUSUP_ALL_VALUE, // 能力固定上昇
    EFFECT.STATUSUP_RATE, // 能力%上昇
    EFFECT.FIELD_STRENGTHEN, // フィールド強化
    EFFECT.GIVEATTACKBUFFUP, // 攻撃力バフ強化
    EFFECT.GIVEDEFFENCEDEBUFFUP, // 防御力デバフ強化
    EFFECT.STATUSUP_VALUE_STR, // 能力上昇(STR)
    EFFECT.STATUSUP_VALUE_DEX, // 能力上昇(DEX)
    EFFECT.STATUSUP_VALUE_CON, // 能力上昇(CON)
    EFFECT.STATUSUP_VALUE_MND, // 能力上昇(MND)
    EFFECT.STATUSUP_VALUE_INT, // 能力上昇(INT)
    EFFECT.STATUSUP_VALUE_LUK, // 能力上昇(LUK)
    EFFECT.FUNNEL, // 連撃
    EFFECT.FUNNEL_ALWAYS, // 連撃(永続)
];
const SUB_TARGET_KIND = [
    EFFECT.FIELD_DEPLOYMENT, // フィールド展開
    EFFECT.STATUSUP_ALL_VALUE, // 能力固定上昇
    EFFECT.STATUSUP_RATE, // 能力%上昇
    EFFECT.FIELD_STRENGTHEN, // フィールド強化
    EFFECT.GIVEDEFFENCEDEBUFFUP, // 防御力デバフ強化
    EFFECT.HIGH_BOOST, // ハイブースト状態
];

export const getAttackUpBuffs = function (isElement, isWeak, isDamageRate, attackInfo, selectStyleList) {
    const isShadowClone = CHARA_ID.SHADOW_CLONE.includes(attackInfo?.chara_id);
    const isWedingSharo = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.WEDING_SHARO
    );
    const isKitchenVritika = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_VRITIKA
            || memberInfo?.styleInfo.chara_id === CHARA_ID.MINORI
    );
    const isKitchenSharo = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_SHARO
            || memberInfo?.styleInfo.chara_id === CHARA_ID.MINORI
    );
    const isKitchenCarole = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_CAROLE
            || memberInfo?.styleInfo.chara_id === CHARA_ID.MINORI
    );
    const isKitchenMaria = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_MARIA
            || memberInfo?.styleInfo.chara_id === CHARA_ID.MINORI
    );
    const isKitchenShanhua = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_SHANHUA
            || memberInfo?.styleInfo.chara_id === CHARA_ID.MINORI
    );
    const isKitchenIrene = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_IRENE
    );
    const isYukataShiki = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.YUKATA_SHIKI
    );
    const isSwimMua = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.SWIM_MUA
    );
    const isRisa = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.chara_id === CHARA_ID.RISA
    );
    const isMiya = attackInfo?.chara_id === CHARA_ID.MIYA;
    const isServant = selectStyleList.some(
        (memberInfo) => {
            if (!memberInfo) return false;
            if (STYLE_ID.SERVANT_DANCE.includes(memberInfo.styleInfo.style_id)) {
                return true;
            }
            if (attackInfo?.chara_id !== memberInfo.styleInfo.chara_id) {
                return false;
            }
            if (STYLE_ID.SERVANT.includes(memberInfo.styleInfo.style_id)) {
                return true;
            }
            if (memberInfo.styleInfo.resonance === 1 && memberInfo.supportStyleId) {
                const support = memberInfo.support;
                if (support.styleInfo.ability_resonance) {
                    for (const resonanceEffect of common.getResonanceEffectList(support.styleInfo.ability_resonance)) {
                        if (resonanceEffect.effect_type === constants.EFFECT.GRANT_BUFF &&
                            resonanceEffect.effect_no === constants.BUFF.YAMAWAKI_SERVANT) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    );
    return [
        { name: "攻撃力UP", effect: EFFECT.GRANT_BUFF, kind: BUFF.ATTACKUP, overlap: true },
        ...(isSwimMua ? [{ name: "攻撃UP(永続)", effect: EFFECT.GRANT_BUFF, kind: BUFF.ETERNAL_ATTACKUP, overlap: false },] : []),
        ...(isElement ? [{ name: "属性攻撃力UP", effect: EFFECT.GRANT_BUFF, kind: BUFF.ELEMENT_ATTACKUP, overlap: true },] : []),
        { name: "フィールド", effect: EFFECT.FIELD_DEPLOYMENT, kind: "", overlap: false },
        { name: "チャージ", effect: EFFECT.GRANT_BUFF, kind: BUFF.CHARGE, overlap: false },
        ...(isShadowClone ? [{ name: "影分身", effect: EFFECT.GRANT_BUFF, kind: BUFF.SHADOW_CLONE, overlap: false },] : []),
        ...(isMiya ? [{ name: "桜花の矢", effect: EFFECT.GRANT_BUFF, kind: BUFF.ARROWCHERRYBLOSSOMS, overlap: false },] : []),
        ...(isWedingSharo ? [{ name: "永遠なる誓い", effect: EFFECT.GRANT_BUFF, kind: BUFF.ETERNAL_OARH, overlap: false },] : []),
        ...(isRisa ? [{ name: "オギャり", effect: EFFECT.GRANT_BUFF, kind: BUFF.BABIED, overlap: false },] : []),
        ...(isKitchenVritika ? [{ name: "カリー", effect: EFFECT.GRANT_BUFF, kind: BUFF.CURRY, overlap: false },] : []),
        ...(isKitchenSharo ? [{ name: "シチー", effect: EFFECT.GRANT_BUFF, kind: BUFF.SHCHI, overlap: false },] : []),
        ...(isKitchenCarole ? [{ name: "ステーキ", effect: EFFECT.GRANT_BUFF, kind: BUFF.STEAK, overlap: false },] : []),
        ...(isKitchenMaria ? [{ name: "ジェラート", effect: EFFECT.GRANT_BUFF, kind: BUFF.GELATO, overlap: false },] : []),
        ...(isKitchenShanhua ? [{ name: "点心", effect: EFFECT.GRANT_BUFF, kind: BUFF.DIM_SUM, overlap: false },] : []),
        ...(isKitchenIrene ? [{ name: "ティー", effect: EFFECT.GRANT_BUFF, kind: BUFF.TEA, overlap: false },] : []),
        ...(isYukataShiki ? [{ name: "晩夏の陣", effect: EFFECT.GRANT_BUFF, kind: BUFF.CAMP_DEPLOYMENT, overlap: false },] : []),
        ...(isWeak ? [{ name: "心眼", effect: EFFECT.GRANT_BUFF, kind: BUFF.MINDEYE, overlap: true },] : []),
        ...(isWeak && isServant ? [{ name: "山脇様のしもべ ", effect: EFFECT.GRANT_BUFF, kind: BUFF.YAMAWAKI_SERVANT, overlap: false },] : []),
        { name: "連撃", effect: EFFECT.GRANT_BUFF, kind: BUFF.FUNNEL, overlap: true },
        ...(isDamageRate ? [{ name: "破壊率UP", effect: EFFECT.GRANT_BUFF, kind: BUFF.DAMAGERATEUP, overlap: true },] : []),
    ];
}

export const getDefenseDownBuffs = function (isElement, isWeak, isDp, selectStyleList) {
    const isRisa = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.chara_id === CHARA_ID.RISA
    );
    return [
        { name: "防御力DOWN", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.DEFENSEDOWN, overlap: true },
        ...(isDp ? [{ name: "DP防御力DOWN", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.DEFENSEDP, overlap: true },] : []),
        ...(isElement ? [{ name: "属性防御力DOWN", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.ELEMENT_DEFENSEDOWN, overlap: true },] : []),
        { name: "防御力DOWN(永)", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.ETERNAL_DEFENSEDOWN, overlap: true },
        ...(isElement ? [{ name: "属性防御力DOWN(永)", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.ELEMENT_ETERNAL_DEFENSEDOWN, overlap: true },] : []),
        ...(isRisa ? [{ name: "幼児退行", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.LNFANTILIZED, overlap: false },] : []),
        ...(isWeak ? [{ name: "脆弱", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.FRAGILE, overlap: true },] : []),
        ...(isWeak ? [{ name: "永続脆弱", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.ETERNAL_FRAGILE, overlap: true },] : []),
        ...(isElement ? [{ name: "耐性ダウン", effect: EFFECT.GRANT_DEBUFF, kind: BUFF.RESISTDOWN, overlap: true },] : []),
    ];

}
export const getCriticalBuffs = function (isElement) {
    return [
        { name: "CRT率UP", effect: EFFECT.GRANT_BUFF, kind: BUFF.CRITICALRATEUP, overlap: true },
        { name: "CRTダメUP", effect: EFFECT.GRANT_BUFF, kind: BUFF.CRITICALDAMAGEUP, overlap: true },
        ...(isElement ? [
            { name: "属性CRT率UP", effect: EFFECT.GRANT_BUFF, kind: BUFF.ELEMENT_CRITICALRATEUP, overlap: true },
            { name: "属性CRTダメUP", effect: EFFECT.GRANT_BUFF, kind: BUFF.ELEMENT_CRITICALDAMAGEUP, overlap: true },
        ] : []),
    ]
}


// バフ、アビリティ、パッシブ作成
export function generateBuffAbilityPassiveLists(styleList, attackInfo, attackUpBuffs, defDownBuffs, criticalBuffs) {
    const buffList = [];
    const abilityList = [];
    const passiveList = [];
    addBuffAbilityPassiveLists(
        styleList, styleList.selectStyleList, attackInfo, buffList, abilityList, passiveList, logic.TROOP_KBN.MAIN
    )

    addBuffAbilityPassiveLists(
        styleList, styleList.subStyleList, attackInfo, buffList, abilityList, passiveList, logic.TROOP_KBN.SUB
    )

    let filteredBuff = logic.filteredBuffList(buffList, attackInfo)

    // グループ化
    const buffGroup = filteredBuff.reduce((acc, buff) => {
        const key = logic.getBuffKey(buff.effect_type, buff.effect_no);
        if (!acc[key]) {
            acc[key] = [[], []];
        }
        acc[key][0].push(common.deepClone(buff));
        if (isOverlap(attackUpBuffs, defDownBuffs, criticalBuffs, key)) {
            acc[key][1].push(common.deepClone(buff));
        }
        return acc;
    }, {});
    return { buffList, buffGroup, abilityList, passiveList };
}

// レゾナンスリスト作成
export function generateResonanceList(styleList) {
    const resonanceList = [];
    styleList.selectStyleList
        .filter(memberInfo => memberInfo)
        .forEach(memberInfo => {
            const charaId = memberInfo.styleInfo.chara_id;
            const charaName = common.getCharaData(charaId).chara_short_name;

            // レゾナンス判定
            if ((memberInfo.styleInfo.resonance === 1) && memberInfo.supportStyleId) {
                const support = memberInfo.support;
                if (support.styleInfo.ability_resonance) {
                    const resonance = common.deepClone(common.getResonanceInfo(support.styleInfo.ability_resonance));
                    resonance.charaId = charaId;
                    resonance.charaName = charaName;
                    resonance.limitCount = support.limitCount;
                    resonance.targetElement = support.styleInfo.element;
                    resonanceList.push(resonance);
                }
            }
        });
    return resonanceList;
}

// バフ、アビリティ、パッシブ追加
export function addBuffAbilityPassiveLists(styleList, targetStyleList, attackInfo, buffList, abilityList, passiveList, troopKbn) {
    let attackCharaId = attackInfo?.chara_id;
    let attackMemberInfo = logic.getCharaIdToMember(styleList, attackCharaId);

    targetStyleList
        .filter(memberInfo => memberInfo)
        .filter(memberInfo => !(troopKbn === logic.TROOP_KBN.SUB && logic.checkDuplicationChara(styleList.selectStyleList, memberInfo?.styleInfo.chara_id)))
        .forEach(memberInfo => {
            const charaId = memberInfo.styleInfo.chara_id;
            const styleId = memberInfo.styleInfo.style_id;
            const charaName = common.getCharaData(charaId).chara_short_name;

            const filterBuff = [constants.EFFECT.FIELD_DEPLOYMENT, constants.EFFECT.GRANT_BUFF, constants.EFFECT.GRANT_DEBUFF]
            const styleBuffList = skillEffect.filter(buff =>
                (buff.chara_id === charaId || buff.chara_id === 0) &&
                (buff.style_id === styleId || buff.style_id === 0) &&
                filterBuff.includes(buff.effect_type)
            ).filter(buff => {
                switch (buff.effect_id) {
                    case EFFECT_ID.MOON_LIGHT: // 月光(歌姫の加護)
                        return styleId === STYLE_ID.ONLY_MOON_LIGHT;
                    case EFFECT_ID.MEGA_DESTROYER5: // メガデストロイヤー(5人以上)
                        return attackInfo?.servantCount >= 5;
                    case EFFECT_ID.MEGA_DESTROYER6: // メガデストロイヤー(6人以上)
                        return attackInfo?.servantCount === 6;
                    default:
                        break;
                }
                // サブ部隊
                if (troopKbn === logic.TROOP_KBN.SUB) {
                    return buff.effect_type === constants.EFFECT.GRANT_DEBUFF
                }
                if (attackMemberInfo) {
                    if (!logic.isElementInclude(attackMemberInfo.styleInfo, buff.target_element)) return false;
                }
                // 除外スキル
                if (memberInfo.exclusionSkillList.includes(buff.skill_id)) return false;
                return true;
            });

            const newStyleBuffList = JSON.parse(JSON.stringify(styleBuffList));
            newStyleBuffList.forEach(buff => {
                buff.key = `buff_${buff.effect_id}_${charaId}`;
                buff.chara_name = charaName;
                buff.use_chara_id = charaId;
                buff.kbn = "buff";
                buff.troopKbn = troopKbn;
            });
            buffList.push(...newStyleBuffList);

            const addBuffAbility = (kbn, skillId, skillName, effectType, buffNo, effect) => {
                buffList.push({
                    ...effect,
                    key: `${kbn}_${skillId}_${charaId}`,
                    chara_name: charaName,
                    use_chara_id: charaId,
                    kbn: kbn,
                    effect_type: effectType,
                    skill_id: skillId,
                    effect_no: buffNo,
                    buff_name: skillName,
                    max_lv: 1,
                });
            };

            let styleAbility = {
                "orgn": memberInfo.styleInfo.ability_orgn,
                "0": memberInfo.styleInfo.ability0,
                "00": memberInfo.styleInfo.ability00,
                "000": memberInfo.styleInfo.ability000,
                "1": memberInfo.styleInfo.ability1,
                "3": memberInfo.styleInfo.ability3,
                "5": memberInfo.styleInfo.ability5,
                "10": memberInfo.styleInfo.ability10
            };
            if (memberInfo.limitCount === 2) {
                styleAbility = {
                    "orgn": memberInfo.styleInfo.ability_orgn,
                    "0": memberInfo.styleInfo.ability0,
                    "00": memberInfo.styleInfo.ability00,
                    "000": memberInfo.styleInfo.ability000,
                    "1": memberInfo.styleInfo.ability1,
                    "2": memberInfo.styleInfo.ability2,
                    "5": memberInfo.styleInfo.ability5,
                    "10": memberInfo.styleInfo.ability10
                };
            }
            if (memberInfo.styleInfo.role === ROLE.ADMIRAL) {
                styleAbility["ADMIRAL"] = ABILITY_ID.ADMIRAL_COMMON;
            }

            if (!attackInfo) return;
            Object.keys(styleAbility).forEach(key => {
                const abilityId = styleAbility[key];
                const abilityInfo = common.getAbilityInfo(abilityId);
                if (!abilityInfo) return;

                if (abilityInfo.element !== 0 && abilityInfo.element !== attackInfo.attack_element) return;
                if (abilityInfo.physical !== 0 && abilityInfo.physical !== attackInfo.attack_physical) return;
                if (attackMemberInfo && !logic.isElementInclude(attackMemberInfo.styleInfo, abilityInfo.target_element)) return;

                let isAddAbility = false;
                const abilityEffectList = common.getAbilityEffectList(abilityId);
                for (const abilityEffect of abilityEffectList) {
                    if (!TARGET_KIND.includes(abilityEffect.effect_type)) continue;

                    if (troopKbn === logic.TROOP_KBN.SUB) {
                        // 他部隊のアビリティは一部のみ許可
                        if (!SUB_TARGET_KIND.includes(abilityEffect.effect_type)) {
                            continue;
                        }
                    }

                    if (!constants.RANGE_ALL_ABILITY.includes(abilityEffect.effect_type)) {
                        if (abilityEffect.range_area === RANGE.SELF && charaId !== attackCharaId) continue;
                    }

                    switch (abilityEffect.effect_type) {
                        case EFFECT.FIELD_DEPLOYMENT: // フィールド展開
                            addBuffAbility("ability", abilityId, abilityInfo.ability_name, EFFECT.FIELD_DEPLOYMENT, "", abilityEffect);
                            continue;
                        case EFFECT.GRANT_BUFF:
                            switch (abilityEffect.effect_no) {
                                case BUFF.EX_DOUBLE: // EXスキル連続発動
                                    // 対象外
                                    continue;
                                default:
                                    addBuffAbility("ability", abilityId, abilityInfo.ability_name, EFFECT.GRANT_BUFF, abilityEffect.effect_no, abilityEffect);
                                    break;
                            }
                            continue;
                        default:
                            break;
                    }
                    isAddAbility = true;
                }
                if (isAddAbility) {
                    const newAbility = JSON.parse(JSON.stringify(abilityInfo));
                    newAbility.key = `${abilityId}_${charaId}`;
                    newAbility.limit_border = Number(key);
                    newAbility.chara_id = charaId;
                    newAbility.chara_name = charaName;
                    abilityList.push(newAbility);
                }
            });

            const stylePassiveList = skillList.filter(obj =>
                obj.chara_id === charaId &&
                (obj.style_id === styleId || obj.style_id === 0) &&
                obj.skill_active === 1
            );

            stylePassiveList.forEach(skill => {
                if (!attackInfo) return;
                const passiveInfo = common.getPassiveInfo(skill.skill_id);
                if (!passiveInfo) return;

                if (passiveInfo.element !== 0 && passiveInfo.element !== attackInfo.attack_element) return;
                if (attackMemberInfo) {
                    if (!logic.isElementInclude(attackMemberInfo.styleInfo, passiveInfo.target_element)) return;
                }

                const passiveEffectList = common.getPassiveEffectList(skill.skill_id);
                let isAddPassive = false;
                for (const passiveEffect of passiveEffectList) {
                    if (!passiveInfo || !TARGET_KIND.includes(passiveEffect.effect_type)) continue;
                    if (!constants.RANGE_ALL_ABILITY.includes(passiveEffect.effect_type)) {
                        if (passiveInfo.passiveEffect === RANGE.SELF && charaId !== attackCharaId) continue;
                    }
                    if (troopKbn === logic.TROOP_KBN.SUB) {
                        // 他部隊のアビリティは一部のみ許可
                        if (!SUB_TARGET_KIND.includes(passiveEffect.effect_type)) {
                            continue;
                        }
                    }

                    switch (passiveEffect.effect_type) {
                        case EFFECT.FIELD_DEPLOYMENT:// フィールド展開
                            addBuffAbility("passive", skill.skill_id, passiveInfo.passive_name, EFFECT.FIELD_DEPLOYMENT, '', passiveEffect);
                            continue;
                        case EFFECT.GRANT_BUFF: // バフ付与
                            switch (passiveEffect.effect_no) {
                                case BUFF.EX_DOUBLE: // EXスキル連続発動
                                    // 対象外
                                    continue;
                                default:
                                    addBuffAbility("passive", skill.skill_id, passiveInfo.passive_name, EFFECT.GRANT_BUFF, passiveEffect.effect_no, passiveEffect);
                                    break;
                            }
                            continue;
                        default:
                            break;
                    }
                    isAddPassive = true;
                }
                if (isAddPassive) {
                    const passive = JSON.parse(JSON.stringify(passiveInfo));
                    passive.key = `${skill.skill_id}_${charaId}`;
                    passive.memberInfo = memberInfo;
                    passive.chara_id = charaId;
                    passive.chara_name = charaName;
                    passive.troopKbn = troopKbn;
                    passiveList.push(passive);
                }
            });
            // レゾナンス判定
            if (memberInfo.styleInfo.resonance === 1 && memberInfo.supportStyleId) {
                const support = memberInfo.support;
                if (support.styleInfo.ability_resonance) {
                    const resonanceInfo = common.getResonanceInfo(support.styleInfo.ability_resonance);
                    const resonanceEffectList = common.getResonanceEffectList(resonanceInfo.resonance_id);
                    for (const resonanceEffect of resonanceEffectList) {
                        switch (resonanceEffect.effect_type) {
                            case EFFECT.GRANT_BUFF: // バフ付与
                                addBuffAbility("ability", 0, resonanceInfo.resonance_name, EFFECT.GRANT_BUFF, resonanceEffect.effect_no, resonanceEffect);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        });
}

export const isOverlap = (attackUpBuffs, defDownBuffs, criticalBuffs, key) => {
    const match1 = attackUpBuffs.find(item => logic.getBuffKey(item.effect, item.kind) === key);
    const match2 = defDownBuffs.find(item => logic.getBuffKey(item.effect, item.kind) === key);
    const match3 = criticalBuffs.find(item => logic.getBuffKey(item.effect, item.kind) === key);
    return match1?.overlap || match2?.overlap || match3?.overlap;
}

export const isExistBuff = (attackUpBuffs, defDownBuffs, criticalBuffs, key) => {
    return (
        attackUpBuffs.some(item => logic.getBuffKey(item.effect, item.kind) === key) ||
        defDownBuffs.some(item => logic.getBuffKey(item.effect, item.kind) === key) ||
        criticalBuffs.some(item => logic.getBuffKey(item.effect, item.kind) === key)
    );
};