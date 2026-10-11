import {
    ABILIRY_TIMING, KB_NEXT
} from "./const";
import {
    CHARA_ID, SKILL_ID, ABILITY_ID, ELEMENT, BUFF, EFFECT, RANGE, FIELD, CONDITIONS, ATTRIBUTE, KIND,
    ALONE_ACTIVATION_BUFF_NO, COST_TYPE, changeStyle
} from "utils/const";
import * as constants from "utils/const";
import * as common from "utils/common";
import {
    getCharaData, getSkillData, getAttackInfo, getEffectList, deepClone, getStyleData
} from "utils/common";
import skillAttack from "data/skillAttack";
import skillList from "data/skillList";
import * as logicBuff from "./logicBuff.js";
import * as logicAbility from "./logicAbility.js";

// アビリティ存在チェック
export function checkAbilityExist(abilityList, abilityId) {
    let existList = abilityList.filter(function (abilityInfo) {
        return abilityInfo.ability_id === abilityId;
    });
    return existList.length > 0;
}

// パッシブ存在チェック
export function checkPassiveExist(passiveList, skillId) {
    let existList = passiveList.filter(function (passive) {
        return passive.skill_id === skillId;
    });
    return existList.length > 0;
}

// バフ存在チェック
export function checkBuffExist(buffList, buffNo, lv) {
    let existList = buffList.filter(function (buffInfo) {
        return buffInfo.buff_no === buffNo;
    });
    if (lv) {
        return existList.length > 0 && existList[0].lv >= lv;
    } else {
        return existList.length > 0;
    }
}

// バフから性能を取得
export function sumBuffEffect(buffList, effectType) {
    let effectSum = 0;
    buffList.forEach(function (buffInfo) {
        const effect = common.getBuffEffectType(buffInfo, effectType)
        if (effect) {
            effectSum = effect.effect_size
        }
    })
    return effectSum;
}

// 効果存在チェック
export function checkEffectTypeExist(turnData, unitData, effectType) {
    const abilityList = unitData[`ability_${ABILIRY_TIMING.OTHER}`]
    const passiveList = unitData.passiveSkillList
    let existAbilityList = abilityList.filter(function (ability) {
        if (!judgmentCondition(ability, turnData, unitData, null)) {
            return false;
        }
        return ability.effect_type === effectType;
    });
    let existPassiveList = passiveList.filter(function (passive) {
        if (!judgmentCondition(passive, turnData, unitData, null)) {
            return false;
        }
        return passive.effect_type === effectType;
    });
    return existAbilityList.length > 0 || existPassiveList.length > 0;
}

// メンバー存在チェック
export function checkMember(unitList, troops) {
    let member_list = unitList.filter(function (unit_info) {
        if (unit_info.style) {
            let chara_info = getCharaData(unit_info.style.styleInfo.chara_id);
            return chara_info.troops === troops;
        }
        return false;
    });
    return member_list.length;
}

// 単独発動判定
export function isAloneActivation(buffInfo) {
    if (ALONE_ACTIVATION_BUFF_NO.includes(buffInfo.buff_no)) {
        return buffInfo.effect_turn > 0;
    }
    return false;
}
// SPチェック
export function checkUnderSp(turnData, rangeArea, sp, uniData) {
    let targetList = getTargetList(turnData, rangeArea, null, uniData);
    let existList = targetList.filter(function (targetMo) {
        let unitData = getUnitData(turnData, targetMo);
        return unitData.sp < sp;
    })
    return existList.length > 0;
}

// 属性チェック
export const checkTargetElement = (unit, targetElement) => {
    return targetElement === 0 ||
        unit.style?.styleInfo?.element === targetElement ||
        unit.style?.styleInfo?.element2 === targetElement ||
        unit.style?.styleInfo?.element === ELEMENT.VOID;
}

// スキルデータ更新
export const skillUpdate = (turnData, skillId, placeNo) => {
    const unit = turnData.unitList.filter(unit => unit.placeNo === placeNo)[0];
    unit.selectSkillId = skillId;
    if (skillId !== 0) {
        const skillInfo = getSkillData(skillId);
        if (skillInfo.cost_type === COST_TYPE.TOKEN) {
            if (skillInfo.use_cost === 99) {
                unit.tokenCost = unit.token;
            }
        }
        unit.spCost = getSpCost(turnData, skillInfo, unit);
    } else {
        unit.spCost = 0;
    }
}

// ユーザ操作の取得
const updateUserOperation = (userOperationList, turnData) => {
    let filtered = userOperationList.filter((item) =>
        compareUserOperation(item, turnData) === 0
    );
    let userOperation = turnData.userOperation;
    if (filtered.length === 0) {
        turnData.userOperation.kbAction = KB_NEXT.ACTION;
        userOperationList.push(turnData.userOperation);
        // 表示確認用
        userOperationList.sort((a, b) => compareUserOperation(a, b));
    } else {
        userOperation = filtered[0];
        turnData.userOperation = userOperation;
    }
    userOperation.used = true;
}

export const changeStyleInfo = (unit, styleId) => {
    let styleInfo = getStyleData(styleId);
    unit.style.styleInfo = styleInfo;
    let member = unit.style;
    unit.skillList = skillList.filter(obj =>
        (obj.chara_id === member.styleInfo.chara_id || obj.chara_id === 0) &&
        (obj.style_id === member.styleInfo.style_id || obj.style_id === 0) &&
        obj.skill_active === 0 &&
        !member.exclusionSkillList.includes(obj.skill_id)
    ).map(obj => {
        const copiedObj = deepClone(obj);
        if (copiedObj.chara_id === 0) {
            copiedObj.chara_id = member.styleInfo.chara_id;
        }
        return copiedObj;
    });
    // アビリティ設定
    Object.values(ABILIRY_TIMING).forEach(timing => {
        unit[`ability_${timing}`] = [];
    });
    let abilitylimitList = ["_orgn", "0", "00", "1", "3", "4", "5", "10"];
    if (member.limitCount === 2) {
        abilitylimitList = ["_orgn", "0", "00", "1", "2"];
    }
    abilitylimitList.forEach(numStr => {
        const num = parseInt(numStr, 10);
        if (styleInfo[`ability${numStr}`] && num <= member.limitCount) {
            let abilityInfo = common.getAbilityInfo(styleInfo[`ability${numStr}`]);
            if (!abilityInfo) {
                return;
            }
            let abilityList = common.getAbilityEffectList(styleInfo[`ability${numStr}`]);
            abilityList.forEach(abilityEffect => {
                abilityEffect = {
                    ...abilityEffect,
                    ...abilityInfo
                };
                unit[`ability_${abilityEffect.activation_timing}`].push(abilityEffect);
            });
        }
    });
}

// ユーザ操作をターンに反映
const reflectUserOperation = (turnData, isLoadMode) => {
    // 配置変更
    turnData.unitList.forEach((unit) => {
        if (unit.blank) return;
        let operationPlaceNo = turnData.userOperation.placeStyle.findIndex((item) =>
            item === unit.style.styleInfo.style_id || item === changeStyle[unit.style.styleInfo.style_id]);
        let styleId = unit.style.styleInfo.style_id;
        let operationStyleId = turnData.userOperation.placeStyle[operationPlaceNo];
        // スタイル変更
        if (styleId !== operationStyleId) {
            changeStyleInfo(unit, operationStyleId);
        }
        // 配置変更
        if (operationPlaceNo >= 0) {
            if (turnData.additionalTurn) {
                if (!isLoadMode) {
                    if (operationPlaceNo !== unit.placeNo) {
                        setInitSkill(unit);
                        turnData.userOperation.placeStyle[operationPlaceNo] = turnData.userOperation.placeStyle[unit.placeNo];
                        turnData.userOperation.placeStyle[unit.placeNo] = unit.style.styleInfo.style_id;
                    }
                    return;
                }
            }
            unit.placeNo = operationPlaceNo;
        }
    })
    // オーバードライブ発動
    if (turnData.userOperation.triggerOverDrive && turnData.overDriveGauge > 100) {
        startOverDrive(turnData, turnData.userOperation.overDriveLevel);
    }
    // スキル設定
    turnData.unitList.forEach((unit) => {
        if (unit.blank) return;
        const skill = turnData.userOperation.selectSkill[unit.placeNo];
        const hasSkill = unit.skillList.some(obj => obj.skill_id === skill.skill_id);
        if (hasSkill && skill) {
            unit.buffTargetCharaId = skill.buffTargetCharaId;
            unit.buffEffectSelectType = skill.buffEffectSelectType;
        } else {
            turnData.userOperation.selectSkill[unit.placeNo].skill_id = unit.initSkillId;
        }
        skillUpdate(turnData, turnData.userOperation.selectSkill[unit.placeNo].skill_id, unit.placeNo);
    })
    // OD再計算
    turnData.calcOverDriveGauge = getOverDrive(turnData);
    // 行動反映
    if (turnData.calcOverDriveGauge < 100) {
        turnData.userOperation.kbAction = KB_NEXT.ACTION;
    }
    // OD発動反映
    turnData.triggerOverDrive = turnData.userOperation.triggerOverDrive;
}

// ユーザ操作の比較
export const compareUserOperation = (comp1, comp2) => {
    if (comp1.turnNumber !== comp2.turnNumber) {
        return comp1.turnNumber - comp2.turnNumber;
    }
    if (comp1.finishAction !== comp2.finishAction) {
        return comp1.finishAction - comp2.finishAction;
    }
    if (comp1.endDriveTriggerCount !== comp2.endDriveTriggerCount) {
        return comp1.endDriveTriggerCount - comp2.endDriveTriggerCount;
    }
    if (comp1.overDriveNumber !== comp2.overDriveNumber) {
        return comp1.overDriveNumber - comp2.overDriveNumber;
    }
    if (comp1.additionalCount !== comp2.additionalCount) {
        return comp1.additionalCount - comp2.additionalCount;
    }
    return 0;
}

// ユニットデータ取得
export function getUnitData(turnData, index) {
    let unitList = turnData.unitList;
    const filteredUnit = unitList.filter((obj) => obj.placeNo === index);
    return filteredUnit.length > 0 ? filteredUnit[0] : undefined;
}

// スキルIDから攻撃情報を取得
export function getSkillIdToAttackInfo(turnData, unitData, skillId) {
    let filteredAttack = skillAttack
        .filter((obj) => obj.skill_id === skillId)
        .filter((obj) => judgmentCondition(obj, turnData, unitData, skillId));
    // switch (skillId) {
    //     case SKILL_ID.BOUQUET_SHOOT:
    //         //ファーマメントブーケショット
    //         let field = turnData.field < 6 ? turnData.field : FIELD.NORMAL;
    //         filteredAttack = filteredAttack.filter((obj) => obj.attack_element === field);
    //         break;
    //     default:
    //         break;
    // }
    return filteredAttack.length > 0 ? filteredAttack[0] : undefined;
}

// 行動開始
export function startAction(turnData) {
    // フィールド判定
    let oldField = turnData.oldField;
    let selectField = turnData.userOperation.field;
    if (oldField !== selectField && selectField) {
        // 変更があった場合はフィールドターンをリセット
        turnData.fieldTurn = 0;
        turnData.oldField = selectField;
    }

    // 行動部分
    actionProc(turnData, true);

    if (turnData.overDriveGauge > turnData.maxOverDriveGauge) {
        turnData.overDriveGauge = turnData.maxOverDriveGauge;
    }
    // 残りフィールドターン
    if (turnData.fieldTurn > 1 && !turnData.additionalTurn) {
        turnData.fieldTurn--;
    } else if (turnData.fieldTurn === 1) {
        turnData.field = 0;
    }
}

// 行動処理
const actionProc = (turnData) => {
    turnData.setLog(`＝＝＝＝＝＝＝＝＝＝行動開始＝＝＝＝＝＝＝＝＝＝`);
    // 追加ターンフラグ削除
    if (turnData.additionalTurn) {
        turnData.additionalTurn = false;
        unitLoop(function (unit) {
            if (unit.additionalTurn) {
                unit.additionalTurn = false;
            } else {
                unit.noAction = true;
            }
        }, turnData.unitList);
    }
    const seq = sortActionSeq(turnData);

    // 自動追撃を事前検知
    const autoPursuitUnit = getAutoPursuitUnit(turnData);

    for (const skillData of seq) {
        const skillInfo = skillData.skillInfo;
        const unitData = getUnitData(turnData, skillData.placeNo);
        const spCost = unitData.spCost;
        const attackInfo = getSkillIdToAttackInfo(turnData, unitData, skillInfo.skill_id);

        skillActivation(skillInfo, unitData, turnData, autoPursuitUnit, spCost);

        // スキル連続使用
        if (attackInfo) {
            let doubleAttack = false;
            if (checkBuffExist(unitData.buffList, BUFF.EX_DOUBLE) && (skillInfo.skill_kind === KIND.EX_GENERATE || skillInfo.skill_kind === KIND.EX_EXCLUSIVE)) {
                doubleAttack = true;
                unitData.buffList = unitData.buffList.filter(obj => obj.buff_no !== BUFF.EX_DOUBLE);
            }
            if (checkBuffExist(unitData.buffList, BUFF.RUSH) && skillInfo.skill_attribute !== ATTRIBUTE.NORMAL_ATTACK) {
                doubleAttack = true;
            }
            if (doubleAttack) {
                skillActivation(skillInfo, unitData, turnData, autoPursuitUnit, spCost);
            }
        }
        origin(turnData, skillInfo, unitData);
    }

    // 後衛の選択取得
    [3, 4, 5].forEach(function (placeNo) {
        const unitData = getUnitData(turnData, placeNo);
        if (unitData.blank) {
            return;
        }
        let skillId = unitData.selectSkillId;
        // 無し
        if (skillId === SKILL_ID.NONE) {
            return true;
        }
        // 追撃
        if (skillId === SKILL_ID.PURSUIT) {
            // 追撃行動
            actionPursuit(turnData, unitData);
            return true;
        }
    });

}

// 自動追撃取得
const getAutoPursuitUnit = (turnData) => {
    return [3, 4, 5].map(function (placeNo) {
        const unitData = getUnitData(turnData, placeNo);
        if (unitData.blank) {
            return undefined;
        }
        // 自動追撃
        if (unitData.selectSkillId === constants.SKILL_ID.AUTO_PURSUIT) {
            const catJetInfo = getSkillData(constants.SKILL_ID.CAT_JET_SHOOTING);
            const catJetSp = getSpCost(turnData, catJetInfo, unitData);
            if (catJetSp <= unitData.sp + unitData.overDriveSp) {
                unitData.spCost = catJetSp;
                unitData.selectSkillId = constants.SKILL_ID.CAT_JET_SHOOTING;
            }
            return unitData;
        }
        return undefined;
    }).filter(unit => unit !== undefined)[0];
}

// スキル処理
const skillActivation = (skillInfo, unitData, turnData, autoPursuitUnit, spCost) => {
    // 攻撃後に付与されるバフ種
    const ATTACK_AFTER_LIST = [BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP, BUFF.CRITICALRATEUP, BUFF.CRITICALDAMAGEUP, BUFF.ELEMENT_CRITICALRATEUP,
    BUFF.ELEMENT_CRITICALDAMAGEUP, BUFF.CHARGE, BUFF.DAMAGERATEUP];
    const charaName = getCharaData(unitData.style.styleInfo.chara_id).chara_short_name;
    turnData.setLog(`${charaName}の${skillInfo.skill_name}`);

    const skillId = skillInfo.skill_id;

    // 効果取得
    const effectList = getSkillEffectList(skillId, turnData, unitData);

    let isSkill = false;
    let attackInfo;

    switch (skillInfo.skill_attribute) {
        case ATTRIBUTE.NORMAL_ATTACK:
            attackInfo = { "attack_id": 0, "attack_element": unitData.normalAttackElement };
            break;
        case ATTRIBUTE.IMMERSION:
            unitData.immersion = skillInfo.skill_element;
            break;
        case ATTRIBUTE.COMMAND_ACTION:
        case ATTRIBUTE.NOT_ACTION:
            break;
        default:
            attackInfo = getSkillIdToAttackInfo(turnData, unitData, skillInfo.skill_id);
            break;
    }

    // SP消費してから行動
    payCost(unitData, skillInfo);

    const overDriveRateUp = getOverDriveRateUp(unitData, attackInfo)
    // 攻撃前効果
    effectList.forEach(function (effectInfo) {
        if (!(effectInfo.skill_attack1 === 999 && ATTACK_AFTER_LIST.includes(effectInfo.buff_no))) {
            logicBuff.procEffectUnit(turnData, effectInfo, unitData, overDriveRateUp);
        }
    })

    // 攻撃スキルの処理
    if (attackInfo) {
        const unitOdPlus = getUnitOverDrive(turnData, unitData, skillInfo, attackInfo, overDriveRateUp)
        turnData.setLog(`　${unitOdPlus.before} OverDriveゲージ+${unitOdPlus.unitOdPlus.toFixed(2)}%`);
        turnData.overDriveGauge += unitOdPlus.unitOdPlus;

        // アビリティ(与ダメージ時)
        let effectSize = 1;
        if (attackInfo.range_area === constants.RANGE.ENEMY_ALL || checkPassiveExist(unitData.passiveSkillList, constants.SKILL_ID.DAWN)) {
            // 戦勲
            effectSize = turnData.enemyCount;
        }
        let params = { effectSize };
        logicAbility.abilityActionUnit(turnData, ABILIRY_TIMING.DEAL_DAMAGE, unitData, params);
        // バフ消費
        logicBuff.consumeBuffUnit(turnData, unitData, attackInfo, skillInfo);

        // アビリティ(スキル使用)
        logicAbility.abilityActionUnit(turnData, ABILIRY_TIMING.SKILL_USE, unitData);

        if (attackInfo.attack_id !== 0) {
            // フレッダメンテ特殊処理
            if (skillId !== SKILL_ID.FREDDAMENTE || turnData.camp === 2) {
                // アビリティ(アクティブスキル使用)
                logicAbility.abilityActionUnit(turnData, ABILIRY_TIMING.ACTIVE_SKILL_USE, unitData);
            }
            isSkill = true;
        }
        if (skillInfo.skill_kind === KIND.EX_GENERATE || skillInfo.skill_kind === KIND.EX_EXCLUSIVE) {
            // アビリティ（EXスキル使用）
            logicAbility.abilityActionUnit(turnData, ABILIRY_TIMING.EX_SKILL_USE, unitData);
            // EXスキル使用時は、没入状態解除
            unitData.immersion = 0;
        }
    }

    // 攻撃後効果
    effectList.forEach(function (effectInfo) {
        if (effectInfo.skill_attack1 === 999 && ATTACK_AFTER_LIST.includes(effectInfo.buff_no)) {
            logicBuff.procEffectUnit(turnData, effectInfo, unitData, overDriveRateUp);
        }
    })

    // 超越ゲージを加算
    addTranscendGauge(turnData, unitData);

    // 自動追撃
    if (isSkill && spCost <= 8 && autoPursuitUnit) {
        const skillId = autoPursuitUnit.selectSkillId;
        if (skillId === constants.SKILL_ID.CAT_JET_SHOOTING) {
            const catJetInfo = getSkillData(constants.SKILL_ID.CAT_JET_SHOOTING);
            skillActivation(catJetInfo, autoPursuitUnit, turnData, null, 0);
            // 追撃アビリティ発動
            logicAbility.abilityActionUnit(turnData, ABILIRY_TIMING.PURSUIT, autoPursuitUnit);
            // 以降は自動追撃
            autoPursuitUnit.selectSkillId = constants.SKILL_ID.AUTO_PURSUIT;
        }
        if (skillId === constants.SKILL_ID.AUTO_PURSUIT) {
            // 追撃行動
            actionPursuit(turnData, autoPursuitUnit)
        }
    }
}

// スキル効果リスト取得
const getSkillEffectList = (skillId, turnData, unitData) => {
    return getEffectList(skillId).filter(function (effectInfo) {
        // 条件判定
        if (effectInfo.conditions) {
            if (!judgmentCondition(effectInfo, turnData, unitData, effectInfo.skill_id)) {
                return false;
            }
        }
        // 個別判定
        // switch (effectInfo.SKILL_EFFECT_ID) {
        //     // 選択されなかった
        //     case constants.SKILL_EFFECT_ID.TRICK_CANNON: // トリック・カノン(攻撃力低下)
        //         if (unitData.buffEffectSelectType === 0) {
        //             return false;
        //         }
        //         break;
        //     default:
        //         break;
        // }

        return true;
    });
}

// 追撃行動
const actionPursuit = (turnData, unitData) => {
    const skillName = common.getSkillData(SKILL_ID.PURSUIT).skill_name;
    const charaData = getCharaData(unitData.style.styleInfo.chara_id);
    const charaName = charaData.chara_short_name;
    const overDriveGaugeMultiplier = turnData.overDriveGaugeMultiplier / 100;
    const unitOdPlus = calcODGain(charaData.pursuit, 1, overDriveGaugeMultiplier);
    turnData.setLog(`${charaName}の${skillName}`);
    turnData.setLog(`　OverDriveゲージ+${unitOdPlus}%`);
    turnData.overDriveGauge += unitOdPlus;
    logicAbility.abilityActionUnit(turnData, ABILIRY_TIMING.PURSUIT, unitData);

    // 超越ゲージを加算
    addTranscendGauge(turnData, unitData);
}

// 超越ゲージを加算
const addTranscendGauge = (turnData, unitData) => {
    if (turnData.transcendElement !== 0 && checkTargetElement(unitData, turnData.transcendElement) && turnData.transcendGauge < 100) {
        turnData.transcendGauge += 4;
        turnData.setLog(`　超越ゲージ+4%`);
        if (turnData.transcendGauge >= 100) {
            turnData.transcendGauge = 100;
            turnData.overDriveGauge += 100;
            turnData.setLog(`　超越バースト OverDriveゲージ+100%`);
        }
    }
}

// OD増加量を計算
const getOverDriveRateUp = (unitData, attackInfo) => {
    let odRateUp = unitData.overDriveRateUp;
    odRateUp += sumBuffEffect(unitData.buffList, EFFECT.OVERDRIVE_RATE_UP);
    const earring = getearringEffectSize(attackInfo ? attackInfo.hit_count : 1, unitData);

    return {
        "odRateUp": odRateUp,
        "earring": earring
    }
}

// 攻撃スキルのOD獲得量
const getUnitOverDrive = (turnData, unitData, skillInfo, attackInfo, overDriveRateUp) => {
    const enemyCount = turnData.enemyCount;
    const overDriveGaugeMultiplier = turnData.overDriveGaugeMultiplier / 100;
    let unitOdPlus = 0;
    const odRateUp = overDriveRateUp.odRateUp;
    const earring = overDriveRateUp.earring;
    let before;

    let physical = getCharaData(unitData.style.styleInfo.chara_id).physical;
    if (skillInfo.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
        // 通常攻撃
        if (!isResist(turnData.enemyInfo, physical, unitData.normalAttackElement, null)) {
            unitOdPlus += calcODGain(3, 1, overDriveGaugeMultiplier, odRateUp);
        }
        before = "通常攻撃";
    } else if (attackInfo) {
        // 攻撃IDの変換(暫定)
        let attackId = attackInfo.attack_id
        let enemyTarget = enemyCount;
        if (attackInfo.range_area === constants.RANGE.ENEMY_UNIT) {
            enemyTarget = 1;
        }
        before = `スキル${attackInfo.hit_count}HIT`;
        if (!isResist(turnData.enemyInfo, physical, attackInfo.attack_element, attackId)) {
            let funnelList = getFunnelList(unitData);
            unitOdPlus += calcODGain(attackInfo.hit_count, enemyTarget, overDriveGaugeMultiplier, odRateUp, earring, funnelList.length);
            if (funnelList.length > 0) {
                before += `+連撃${funnelList.length}HIT`;
            }
        }
    }
    return { before, unitOdPlus };
}

// 耐性判定
function isResist(enemyInfo, physical, element, attackId) {
    let physicalRate = enemyInfo[`physical_${physical}`];
    let elementRate = enemyInfo[`element_${element}`];
    if (attackId) {
        let attackInfo = getAttackInfo(attackId);
        if (attackInfo.penetration) {
            physicalRate = 400;
            elementRate = 100;
        }
    }
    return physicalRate / 100 * elementRate / 100 < 1;
}

// 弱点判定
export const isWeak = (enemyInfo, physical, element, attackId) => {
    let attackInfo = getAttackInfo(attackId);
    if (attackInfo.penetration) {
        return true;
    }
    let physicalRate = enemyInfo[`physical_${physical}`];
    let elementRate = enemyInfo[`element_${element}`];
    return physicalRate / 100 * elementRate / 100 > 1;
}

// 独自仕様
function origin(turnData, skillInfo, unitData) {
    // 初回判定
    unitData.useSkillList.push(skillInfo.skill_id);
    switch (skillInfo.skill_id) {
        case 177: // エリミネイト・ポッシブル
            let targetUnitData = turnData.unitList.filter(unit => unit?.style?.styleInfo?.chara_id === unitData.buffTargetCharaId);
            if (targetUnitData.length > 0) {
                targetUnitData[0].nextTurnMinSp = 3;
            }
            break;
        case 617: // ドリーミー・ガーデン
            let targetUnitList = turnData.unitList.filter(unit => unit?.style?.styleInfo?.chara_id !== unitData.style.styleInfo.chara_id);
            targetUnitList.forEach(unit => unit.nextTurnMinSp = 10);
            break;
        default:
            break;
    }
    return;
}

// OD上昇量取得
export const getOverDrive = (turn) => {
    const tempTurn = deepClone(turn);
    // 行動処理
    actionProc(tempTurn, false);
    return tempTurn.overDriveGauge;
}

// OD計算
const calcODGain = (hitCount, enemyTarget, overDriveGaugeMultiplier, odRateUp = 0, earring = 0, funnelCount = 0) => {
    const correction = 1 + (odRateUp + earring) / 100;
    const hitOd = Math.floor(2.5 * correction * overDriveGaugeMultiplier * 100) / 100;
    return (hitCount * hitOd * enemyTarget) + (funnelCount * hitOd * enemyTarget);
};

// 消費SP取得
export const getSpCost = (turnData, skillInfo, unit) => {
    if (!skillInfo) {
        return 0;
    }
    // 通常攻撃、追撃、指揮行動、行動無し
    const NON_ACTION_ATTRIBUTE = [1, 2, 3, 99];
    if (NON_ACTION_ATTRIBUTE.includes(skillInfo.skill_attribute)) {
        return 0;
    }

    if (skillInfo.cost_type !== COST_TYPE.SP) {
        return 0;
    }
    let spCost = skillInfo.use_cost;
    if (spCost === 0) {
        return spCost;
    }

    if (spCost === 99) {
        return unit.sp + unit.overDriveSp;
    }

    // 没入状態はSP消費なし
    if (unit.immersion > 0) {
        return 0;
    }

    // SP軽減スキル/消費0のスキル/SP全消費に軽減は適用されない
    if (skillInfo.skill_id !== SKILL_ID.CAFE_TIME) {
        if (checkBuffExist(unit.buffList, BUFF.SPRIGHTLY)) {
            // 軽快
            spCost = Math.ceil(spCost * 0.5);
        } else if (checkBuffExist(unit.buffList, BUFF.SPRIGHTLY_LIGHT)) {
            // 軽快(小)
            spCost = Math.ceil(spCost * 0.7);
        }
    }

    let spCostDown = unit.spCostDown;
    let spCostUp = unit.spCostUp;
    if (zeroSpSkill(turnData, skillInfo, unit)) {
        return 0;
    }
    if (harfSpSkill(turnData, skillInfo, unit)) {
        spCost = Math.ceil(spCost / 2);
    }
    spCostDown += minusSpSkill(turnData, skillInfo, unit);

    // オーバードライブ中
    if (turnData.overDriveMaxTurn > 0) {
        // 獅子に鰭
        if (checkAbilityExist(unit[`ability_${ABILIRY_TIMING.EVERY_TURN}`], ABILITY_ID.WINGS_TO_TIGER)) {
            spCostDown = 2;
        }
        // 飛躍
        if (checkAbilityExist(unit[`ability_${ABILIRY_TIMING.EVERY_TURN}`], ABILITY_ID.LEAP_FORWARD)) {
            spCostDown = 2;
        }
    }

    // カラスの鳴き声で
    if (skillInfo.skill_id === SKILL_ID.SOUND_OF_CROWS) {
        const count = unit.useSkillList.filter(value => value === SKILL_ID.SOUND_OF_CROWS).length;
        spCost = 8 + 4 * count;
        spCost = spCost > 20 ? 20 : spCost;
    }

    spCost += spCostUp - spCostDown;
    return spCost < 0 ? 0 : spCost;
}

// 消費SP半減
function harfSpSkill(turnData, skillInfo, unitData) {
    // SP消費半減
    if (skillInfo.skill_attribute === ATTRIBUTE.SP_HALF) {
        if (judgmentCondition(skillInfo, turnData, unitData, skillInfo.skill_id)) {
            return true;
        }
    }
    return false;
}

// 消費SP0
function zeroSpSkill(turnData, skillInfo, unitData) {
    // SP消費0
    if (skillInfo.skill_attribute === ATTRIBUTE.SP_ZERO) {
        if (judgmentCondition(skillInfo, turnData, unitData, skillInfo.skill_id)) {
            return true;
        }
    }
    return false;
}

// 消費SP軽減
function minusSpSkill(turnData, skillInfo, unitData) {
    let minusSp = 0;
    // SP消費半減
    switch (skillInfo.skill_attribute) {
        case ATTRIBUTE.SP_MITIGATION_3:
            minusSp = 3;
            break;
        case ATTRIBUTE.SP_MITIGATION_4:
            minusSp = 4;
            break;
        case ATTRIBUTE.SP_MITIGATION_5:
            minusSp = 5;
            break;
        default:
            return 0;
    }
    if (judgmentCondition(skillInfo, turnData, unitData, skillInfo.skill_id)) {
        return minusSp;
    }
    return 0;
}


// 条件判定
export const judgmentCondition = (info, turnData, unitData, skillId) => {
    const conditions = Number(info.conditions);
    const conditionsId = info.conditions_id;
    switch (conditions) {
        case CONDITIONS.FIRST_TURN: // 1ターン目
            return turnData.turnNumber === 1;
        case CONDITIONS.SKILL_INIT: // 初回
            return !unitData.useSkillList.includes(skillId);
        case CONDITIONS.ADDITIONAL_TURN: // 追加ターン
            return turnData.additionalCount > 0;
        case CONDITIONS.NOT_ADDITIONAL_TURN: // 追加ターン以外
            return turnData.additionalCount === 0;
        case CONDITIONS.BREAK: // ブレイク時
            const ret = unitData.buffEffectSelectType === 1;
            unitData.buffEffectSelectType = 0;
            return ret;
        case CONDITIONS.DESTRUCTION_OVER_200: // 破壊率200%以上
        case CONDITIONS.HAS_SHADOW: // 影分身
        case CONDITIONS.PERCENTAGE_30: // 確率30%
        case CONDITIONS.DOWN_TURN: // ダウンターン
        case CONDITIONS.BUFF_DISPEL: // バフ解除
        case CONDITIONS.DP_OVER_100: // DP100%以上
        case CONDITIONS.SUPER_DOWN: // 超ダウン
        case CONDITIONS.INVINCIBLE: // インビジブル
            return unitData.buffEffectSelectType === 1;
        case CONDITIONS.OVER_DRIVE: // オーバードライブ中
            return turnData.overDriveMaxTurn > 0;
        case CONDITIONS.DEFFENCE_DOWN: // 防御ダウン
            return checkBuffExist(turnData.enemyDebuffList, BUFF.DEFENSEDOWN) || checkBuffExist(turnData.enemyDebuffList, BUFF.ETERNAL_DEFENSEDOWN);
        case CONDITIONS.FRAGILE: // 脆弱
            return checkBuffExist(turnData.enemyDebuffList, BUFF.FRAGILE) || checkBuffExist(turnData.enemyDebuffList, BUFF.ETERNAL_FRAGILE);
        case CONDITIONS.TARGET_COVER: // 集中・挑発状態
            return checkBuffExist(turnData.enemyDebuffList, BUFF.PROVOKE) || checkBuffExist(turnData.enemyDebuffList, BUFF.COVER);
        case CONDITIONS.FIELD_NONE: // フィールド無し
            return [FIELD.NORMAL, FIELD.RICE, FIELD.SANDSTORM].includes(turnData.field);
        case CONDITIONS.FIELD_ELEMENT: // 属性フィールド
            return common.checkElement(turnData.field, conditionsId);
        case CONDITIONS.HAS_ABILITY: // アビリティ
            return checkAbilityExist(unitData[`ability_${ABILIRY_TIMING.OTHER}`], conditionsId);
        case CONDITIONS.USE_SKILL: // スキル使用
            return conditionsId === skillId;
        case CONDITIONS.HAS_BUFF: // バフ発動中
            return checkBuffExist(unitData.buffList, conditionsId);
        case CONDITIONS.NOT_HAS_BUFF: // バフ発動中以外
            return !checkBuffExist(unitData.buffList, conditionsId);
        case CONDITIONS.HAS_DEBUFF: // デバフ発動中
            return checkBuffExist(turnData.enemyDebuffList, conditionsId);
        case CONDITIONS.MORALE_OVER_LV: // 士気Lv以上
            return checkBuffExist(unitData.buffList, BUFF.MORALE, conditionsId);
        case CONDITIONS.LNFANTILIZED_OVER_LV: // 幼児退行Lv以上
            return checkBuffExist(turnData.enemyDebuffList, BUFF.LNFANTILIZED, conditionsId);
        case CONDITIONS.ENEMY_COUNT: // 敵数指定
            return turnData.enemyCount === conditionsId;
        case CONDITIONS.SELECT_31A: // 31A選択
            return CHARA_ID.MEMBER_31A.includes(unitData.buffTargetCharaId);
        case CONDITIONS.OVER_31A_3: // 31A3人以上
            return checkMember(turnData.unitList, "31A") >= 3;
        case CONDITIONS.OVER_31C_3: // 31C3人以上
            return checkMember(turnData.unitList, "31C") >= 3;
        case CONDITIONS.OVER_31D_3: // 31D3人以上
            return checkMember(turnData.unitList, "31D") >= 3;
        case CONDITIONS.OVER_31E_3: // 31E3人以上
            return checkMember(turnData.unitList, "31E") >= 3;
        case CONDITIONS.SELECT_CHARA: // 特定キャラを選択
            return unitData.buffTargetCharaId === conditionsId;
        case CONDITIONS.NOT_DIVA_BLESS: // 歌姫の加護以外
            return !checkBuffExist(unitData.buffList, BUFF.DIVA_BLESS);
        case CONDITIONS.NOT_NEGATIVE: // ネガティブ以外
            return !checkBuffExist(unitData.buffList, BUFF.NAGATIVE);
        case CONDITIONS.SP_UNDER_0_ALL: // SP0以下の味方がいる
            return checkUnderSp(turnData, RANGE.ALLY_ALL, 0, unitData);
        case CONDITIONS.SP_UNDER: // SP指定値以下
            return checkUnderSp(turnData, RANGE.SELF, conditionsId, unitData);
        case CONDITIONS.SP_OVER: // SP指定値以上
            return unitData.sp >= conditionsId;
        case CONDITIONS.OD_UNDER: // OD指定値未満
            return turnData.overDriveGauge < conditionsId;
        case CONDITIONS.SARVANT_OVER: // 山脇様のしもべN人以上
            return turnData.unitList.filter((unit) =>
                checkBuffExist(unit.buffList, BUFF.YAMAWAKI_SERVANT)
            ).length >= conditionsId;
        case CONDITIONS.FIRE_STYLE: // 火属性スタイルN人以上
            let fireCount = targetCountInclude(turnData, ELEMENT.FIRE);
            return fireCount >= conditionsId;
        case CONDITIONS.ICE_STYLE: // 氷属性スタイルN人以上
            let iceCount = targetCountInclude(turnData, ELEMENT.ICE);
            return iceCount >= conditionsId;
        case CONDITIONS.THUNDER_STYLE: // 雷属性スタイルN人以上
            let thunderCount = targetCountInclude(turnData, ELEMENT.THUNDER);
            return thunderCount >= conditionsId;
        case CONDITIONS.LIGHT_STYLE: // 光属性スタイルN人以上
            let lightCount = targetCountInclude(turnData, ELEMENT.LIGHT);
            return lightCount >= conditionsId;
        case CONDITIONS.DARK_STYLE: // 闇属性スタイルN人以上
            let darkCount = targetCountInclude(turnData, ELEMENT.DARK);
            return darkCount >= conditionsId;
        case CONDITIONS.USE_COUNT: // 回数以降
            return (conditionsId - 1) <= unitData.useSkillList.filter(id => id === skillId).length;
        case CONDITIONS.TOKEN_OVER: // トークン
            return unitData.token >= conditionsId;
        case CONDITIONS.TOKEN_COST_OVER: // トークンコスト
            return unitData.tokenCost >= conditionsId;
        case CONDITIONS.MOTIVATION: // やる気
            return unitData.buffEffectSelectType >= conditionsId;
        case CONDITIONS.RANDOM_MEAL: // ランダム料理
            return unitData.buffEffectSelectType === conditionsId;
        case CONDITIONS.HAS_PASSIVE: // パッシブ所持
            if (conditionsId === SKILL_ID.FAST_SHOT && turnData.turnNumber > 2) {
                return false
            }
            return checkPassiveExist(unitData.passiveSkillList, conditionsId);
        case CONDITIONS.IS_WEAK: // 弱点を突いている
            // 弱点のみ消費
            let physical = getCharaData(unitData.style.styleInfo.chara_id).physical;
            let attackInfo = getSkillIdToAttackInfo(turnData, unitData, unitData.selectSkillId);
            return isWeak(turnData.enemyInfo, physical, attackInfo.attack_element, attackInfo.attack_id)
        case CONDITIONS.CAMP_DEPLOYMENT: // 陣展開
            return turnData.camp === conditionsId;
        case CONDITIONS.IMMERSION_STATE: // 没入状態
            return common.checkElement(unitData.immersion, conditionsId);
        default:
            break;
    }
    return true;
}

export const getFieldElement = (turnData) => {
    let field_element = Number(turnData.field);
    if (field_element === FIELD.RICE || field_element === FIELD.SANDSTORM) {
        field_element = 0;
    }
    return field_element;
}

// ターゲットリスト追加
export const getTargetList = (turnData, rangeArea, targetElement, unitData) => {
    const placeNo = unitData.placeNo;
    const buffTargetCharaId = unitData.buffTargetCharaId;

    let targetList = [];
    let targetUnitData;
    switch (rangeArea) {
        case RANGE.FIELD: // 場
            break;
        case RANGE.ENEMY_UNIT: // 敵単体
            break;
        case RANGE.ENEMY_ALL: // 敵全体
            break;
        case RANGE.ALLY_UNIT: // 味方単体
        case RANGE.OTHER_UNIT: // 自分以外の味方単体
            targetUnitData = turnData.unitList.filter(unit => unit?.style?.styleInfo?.chara_id === buffTargetCharaId);
            if (targetUnitData.length > 0) {
                targetList.push(targetUnitData[0].placeNo);
            }
            break;
        case RANGE.ALLY_FRONT: // 味方前衛
            targetList = [0, 1, 2];
            break;
        case RANGE.ALLY_BACK: // 味方後衛
            targetList = [3, 4, 5];
            break;
        case RANGE.ALLY_ALL: // 味方全員
            targetList = [...Array(6).keys()];
            break;
        case RANGE.SELF: // 自分
            targetList.push(placeNo);
            break;
        case RANGE.SELF_OTHER: // 自分以外
            targetList = [...Array(6).keys()].filter(num => num !== placeNo);
            break;
        case RANGE.SELF_AND_UNIT: // 自分と味方単体
            targetUnitData = turnData.unitList.filter(unit => unit?.style?.styleInfo?.chara_id === buffTargetCharaId);
            targetList.push(placeNo);
            if (targetUnitData.length > 0) {
                targetList.push(targetUnitData[0].placeNo);
            }
            break;
        case RANGE.FRONT_OTHER: // 自分以外の前衛
            targetList = [...Array(3).keys()].filter(num => num !== placeNo);
            break;
        case RANGE.MEMBER_31C: // 31Cメンバー
            targetList = getTargetPlaceList(turnData.unitList, CHARA_ID.MEMBER_31C);
            break;
        case RANGE.MEMBER_31E: // 31Eメンバー
            targetList = getTargetPlaceList(turnData.unitList, CHARA_ID.MEMBER_31E);
            break;
        case RANGE.MARUYAMA_MEMBER: // 丸山部隊メンバー
            targetList = getTargetPlaceList(turnData.unitList, CHARA_ID.MARUYAMA);
            break;
        case RANGE.RUKA_SHARO: // 月歌とシャロ
            targetList = getTargetPlaceList(turnData.unitList, CHARA_ID.RUKA_SHARO);
            break;
        default:
            break;
    }

    for (let i = targetList.length - 1; i >= 0; i--) {
        let unit = getUnitData(turnData, targetList[i]);
        // ブランクユニットは対象外
        if (unit.blank) {
            targetList.splice(i, 1);
            continue;
        }
        // 属性条件
        if (targetElement && targetElement !== ELEMENT.NORMAL) {
            if (
                !common.checkElement(unit.style.styleInfo.element, targetElement) &&
                !common.checkElement(unit.style.styleInfo.element2, targetElement)
            ) {
                targetList.splice(i, 1);
            }
        }
    }
    return targetList;
}

// メンバーリスト作成
function getTargetPlaceList(unitList, member_id_list) {
    return member_id_list.reduce((acc, member_id) => {
        const placeNo = charaIdToPlaceNo(unitList, member_id);
        if (placeNo !== null) { // nullを除外
            acc.push(placeNo);
        }
        return acc;
    }, []);
}
// キャラIDから場所番号を取得
function charaIdToPlaceNo(unitList, member_id) {
    for (let unit of unitList) {
        if (unit.style?.styleInfo?.chara_id === member_id) {
            return unit.placeNo;
        }
    }
    return null;
}

// 行動順を取得
const sortActionSeq = (turnData) => {
    let buff_seq = [];
    let attack_seq = [];

    // 前衛のスキルを取得
    turnData.unitList.forEach((unit, index) => {
        let skill_id = unit.selectSkillId;
        let placeNo = unit.placeNo;
        // 前衛以外
        if (skill_id === 0 || 3 <= placeNo) {
            return true;
        }
        // 追加ターン以外
        if (turnData.additionalTurn && !unit.additionalTurn) {
            return true;
        }
        // 行動不能
        if (checkBuffExist(unit.buffList, BUFF.RECOIL)) {
            return true;
        }
        let skillInfo = getSkillData(skill_id);
        let skillData = {
            skillInfo: skillInfo,
            placeNo: placeNo
        };
        let attackInfo = getSkillIdToAttackInfo(turnData, unit, skill_id);
        if (attackInfo || skillInfo.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
            attack_seq.push(skillData);
        } else {
            buff_seq.push(skillData);
        }
    });
    attack_seq.sort((a, b) => a.placeNo - b.placeNo);
    buff_seq.sort((a, b) => a.placeNo - b.placeNo);
    // バフとアタックの順序を結合
    return buff_seq.concat(attack_seq);
}


// ターンデータ再生成
export const recreateTurnData = (turnList, turnData, userOperationList, isLoadMode) => {
    // ユーザ操作リストのチェック
    userOperationList.forEach((item) => {
        item.used = compareUserOperation(item, turnData) <= 0;
    })

    while (compareUserOperation(turnData.userOperation, userOperationList[userOperationList.length - 1]) < 0) {
        // 現ターン処理
        turnData = deepClone(turnData);
        if (!isLoadMode || turnList.length > 0) {
            // ロード時の最初ターンは処理しない)
            startAction(turnData);
        }
        startTurn(turnData);
        turnList.push(turnData);
        // ユーザ操作の更新
        updateUserOperation(userOperationList, turnData);
        // ユーザ操作をターンに反映
        reflectUserOperation(turnData, isLoadMode);
    }
}

// ターン初期処理
export const startTurn = (turnData) => {
    unitSort(turnData);
    if (turnData.additionalTurn) {
        turnProceed(KB_NEXT.ADDITIONALTURN, turnData);
        turnInit(turnData);
        // 追加ターン開始
        logicAbility.abilityAction(ABILIRY_TIMING.ADDITIONALTURN, turnData);
    } else {
        let kbAction = turnData.userOperation.kbAction;
        if (kbAction === KB_NEXT.ACTION) {
            // 行動開始時
            logicAbility.abilityAction(ABILIRY_TIMING.ACTION_START, turnData);
        }
        // 最初のターンはターン移行無し
        let turnProgress = true;
        if (turnData.seqTurn >= 0) {
            turnProgress = turnProceed(kbAction, turnData);
            if (turnProgress) {
                // 敵のターン
                // abilityAction(ABILIRY_TIMING.RECEIVE_DAMAGE, turnData);
            }
        }
        if (turnProgress) {
            // ターン進行
            nextTurn(turnData);
        }
        turnInit(turnData, turnProgress);
        if (turnProgress) {
            // ターン開始時
            logicAbility.abilityAction(ABILIRY_TIMING.SELF_START, turnData);
        }
        // ターン跨ぎ時
        logicAbility.abilityAction(ABILIRY_TIMING.STEP_TURN, turnData);
    }
    // 毎ターン処理
    logicAbility.abilityAction(ABILIRY_TIMING.EVERY_TURN, turnData);

    // 初期OD値はアビリティ終了後を反映
    turnData.startOverDriveGauge = turnData.overDriveGauge;
    setUserOperation(turnData);
}

// ターンごとに初期化
const turnInit = (turnData, turnProgress) => {
    turnData.triggerOverDrive = false;
    turnData.oldField = turnData.field;
    turnData.seqTurn++;
    turnData.setLog(`■${getTurnNumber(turnData)}`);

    // ユニット単位の初期化
    unitLoop(function (unit) {
        if (unit.noAction) {
            unit.noAction = false;
            return;
        }
        buffConsumption(turnProgress, unit);
        unitTurnInit(turnData, turnProgress, turnData.additionalTurn, unit);
    }, turnData.unitList);
}


//** ターンデータ部 */
const unitLoop = (func, unitList, arg1) => {
    unitList.forEach(function (unit) {
        if (!unit.blank) {
            func(unit, arg1);
        }
    });
}

// 1:通常戦闘,2:後打ちOD,3:追加ターン
const turnProceed = (kbNext, turn) => {
    let turnProgress = false;
    turn.enemyDebuffList.sort((a, b) => a.buff_no - b.buff_no);
    if (kbNext === KB_NEXT.ACTION) {
        // オーバードライブ
        if (turn.overDriveMaxTurn > 0) {
            turn.overDriveNumber++;
            unitLoop(unitOverDriveTurnProceed, turn.unitList)
            if (turn.overDriveMaxTurn < turn.overDriveNumber) {
                // オーバードライブ終了
                turn.overDriveMaxTurn = 0;
                turn.overDriveNumber = 0;
                turn.endDriveTriggerCount++;
                if (turn.finishAction) {
                    turnProgress = true;
                }
            }
        } else {
            turnProgress = true;
        }
        turn.additionalCount = 0;
    } else if (kbNext === KB_NEXT.ADDITIONALTURN) {
        // 追加ターン
        turn.additionalCount++;
    } else {
        // 行動開始＋OD発動
        if (kbNext === KB_NEXT.ACTION_OD_1) {
            startOverDrive(turn, 1);
        } else if (kbNext === KB_NEXT.ACTION_OD_2) {
            startOverDrive(turn, 2);
        } else if (kbNext === KB_NEXT.ACTION_OD_3) {
            startOverDrive(turn, 3);
        } else if (kbNext === KB_NEXT.ACTION_OD_4) {
            startOverDrive(turn, 4);
        } else if (kbNext === KB_NEXT.ACTION_OD_5) {
            startOverDrive(turn, 5);
        }
        turn.finishAction = true;
        turn.endDriveTriggerCount = 0;
        turn.additionalCount = 0;
        unitLoop(unitOverDriveTurnProceed, turn.unitList);
    }
    return turnProgress
}

export const setUserOperation = (turn) => {
    // 初期値を設定
    turn.userOperation = {
        field: null,
        enemyCount: null,
        selectSkill: turn.unitList.map(function (unit) {
            if (unit.blank) {
                return null;
            }
            setInitSkill(unit)
            return { skill_id: unit.selectSkillId };
        }),
        placeStyle: turn.unitList.map(function (unit) {
            return unit.blank ? 0 : unit.style.styleInfo.style_id;
        }),
        triggerOverDrive: false,
        selectedPlaceNo: -1,
        kbAction: KB_NEXT.ACTION,
        finishAction: turn.finishAction,
        endDriveTriggerCount: turn.endDriveTriggerCount,
        turnNumber: turn.turnNumber,
        additionalCount: turn.additionalCount,
        overDriveNumber: turn.overDriveNumber,
        remark: "",
    }
}

const nextTurn = (turnData) => {
    // 通常進行
    unitLoop(unitTurnProceed, turnData.unitList, turnData);

    turnData.turnNumber++;
    turnData.finishAction = false;
    turnData.endDriveTriggerCount = 0;
    if (turnData.turnNumber % turnData.stepTurnOverDrive === 0) {
        turnData.overDriveGauge += turnData.stepOverDriveGauge;
    }
    if (turnData.turnNumber === turnData.ordinalTurnOverDrive) {
        turnData.overDriveGauge += turnData.ordinalOverDriveGauge;
    }
    if (turnData.overDriveGauge < -300) {
        turnData.overDriveGauge = -300;
    }
    if (turnData.overDriveGauge > turnData.maxOverDriveGauge) {
        turnData.overDriveGauge = turnData.maxOverDriveGauge;
    }
    // 敵のデバフ消費
    debuffConsumption(turnData);
}

const unitSort = (turn) => {
    turn.unitList.sort((a, b) => a.placeNo - b.placeNo);
}

export const getTurnNumber = (turn) => {
    const defaultTurn = "ターン" + turn.turnNumber;
    // 追加ターン
    if (turn.additionalTurn) {
        return `${defaultTurn} 追加ターン`;
    }
    // オーバードライブ中
    if (turn.overDriveNumber > 0) {
        return `${defaultTurn} OverDrive${turn.overDriveNumber}/${turn.overDriveMaxTurn}`;
    }
    return defaultTurn;
}

export const addOverDrive = (addOdGauge, turnData) => {
    turnData.overDriveGauge += addOdGauge;
    if (turnData.overDriveGauge > turnData.maxOverDriveGauge) {
        turnData.overDriveGauge = turnData.maxOverDriveGauge;
    }
}

export const startOverDrive = (turnData, overDriveLevel) => {
    let spList = [0, 5, 12, 20, 20, 20];
    let overDriveCostDown = 0;

    unitLoop(function (unit) {
        unit.overDriveSp = spList[overDriveLevel];
        unit.overDriveEp = 0;
        unit.spCost = getSpCost(turnData, getSkillData(unit.selectSkillId), unit);
        unit[`ability_${ABILIRY_TIMING.OD_START}`].filter(ability => ability.effect_type === EFFECT.OVERDRIVE_COST_DOWN).forEach(ability => {
            overDriveCostDown += ability.effect_size;
        });
    }, turnData.unitList);

    let odTurnList = [0, 1, 2, 3, 3, 3];
    turnData.overDriveNumber = 1;
    turnData.overDriveMaxTurn = odTurnList[overDriveLevel];
    turnData.overDriveGauge = turnData.overDriveGauge - overDriveLevel * (100 - overDriveCostDown);
    turnData.calcOverDriveGauge = turnData.overDriveGauge;

    logicAbility.abilityAction(ABILIRY_TIMING.OD_START, turnData);
    turnData.triggerOverDrive = true;
}

export const removeOverDrive = (turnData) => {
    turnData.overDriveNumber = 0;
    turnData.overDriveMaxTurn = 0;
    turnData.overDriveGauge = turnData.startOverDriveGauge;
    turnData.calcOverDriveGauge = turnData.overDriveGauge;

    unitLoop(function (unit) {
        unit.overDriveSp = 0;
        unit.overDriveEp = 0;
        unit.spCost = getSpCost(turnData, getSkillData(unit.selectSkillId), unit);
    }, turnData.unitList);
    turnData.triggerOverDrive = false;
}

const debuffConsumption = (turnData) => {
    for (let i = turnData.enemyDebuffList.length - 1; i >= 0; i--) {
        let debuff = turnData.enemyDebuffList[i];
        if (debuff.effect_turn > 0) {
            if (debuff.rest_turn === 1) {
                turnData.enemyDebuffList.splice(i, 1);
            } else {
                debuff.rest_turn -= 1;
            }
        }
    }
}

/** TurnDataここまで */

/** UnitDataここから */
const unitTurnInit = (turnData, turnProgress, additionalTurn, unit) => {
    unit.spCostDown = 0;
    unit.spCostUp = 0;
    unit.buffEffectSelectType = 0;
    if (!additionalTurn || unit.additionalTurn) {
        setInitSkill(unit);
    } else {
        unit.selectSkillId = SKILL_ID.NONE;
    }
    if (turnProgress) {
        const name = common.getCharaData(unit.style.styleInfo.chara_id).chara_short_name;
        // バフによる効果
        unit.buffList.forEach((buff) => {
            const buffEffectList = common.getBuffEffect(buff.buff_no)
                .filter(buffEffect => common.checkActivationPlace(buffEffect.activation_place, unit.placeNo));
            for (const buffEffect of buffEffectList) {
                let effectFunc = null;
                let effectText = null;
                if (buffEffect.effect_type === EFFECT.HEALSP) {
                    if (unit.sp + buffEffect.effect_size < unit.limitSp) {
                        effectFunc = () => {
                            unit.sp += buffEffect.effect_size;
                        }
                        effectText = `SP+${buffEffect.effect_size}`;
                    }
                }
                if (buffEffect.effect_type === EFFECT.COST_SP_UP) {
                    effectFunc = () => {
                        unit.spCostUp += buffEffect.effect_size;
                    }
                    effectText = `消費SP上昇${buffEffect.effect_size}`;
                }
                if (!effectFunc) {
                    continue;
                }
                if (judgmentCondition(buffEffect, turnData, unit, null)) {
                    effectFunc();
                    const buffName = common.getBuffKind(buff.buff_no).buff_name;
                    const log = `${name}:${buffName}の効果 ${effectText}`;
                    turnData.setLog(log);
                }
            };
        });
    }
}

const unitTurnProceed = (unit, turnData) => {
    buffSort(unit);
    if (unit.nextTurnMinSp > 0) {
        if (unit.nextTurnMinSp > unit.sp) {
            unit.sp = unit.nextTurnMinSp;
            unit.nextTurnMinSp = -1
        }
    }
    if (unit.sp < unit.limitSp) {
        unit.sp += 2;
        if ((turnData.turnNumber + 1) % turnData.stepTurnSp === 0) {
            unit.sp += turnData.stepSpAllAdd;
            if (unit.placeNo < 3) {
                unit.sp += turnData.stepSpFrontAdd;
            } else {
                unit.sp += turnData.stepSpBackAdd;
            }
        }
        if ((turnData.turnNumber + 1) === turnData.ordinalTurnSp) {
            unit.sp += turnData.ordinalSpAllAdd;
            if (unit.placeNo < 3) {
                unit.sp += turnData.ordinalSpFrontAdd;
            } else {
                unit.sp += turnData.ordinalSpBackAdd;
            }
        }
        if (unit.sp > unit.limitSp) {
            unit.sp = unit.limitSp
        }
    }
}

// 対象数判定
const targetCountInclude = (turnData, targetElement) => {
    let count = 0;
    unitLoop(function (unit) {
        if (checkTargetElement(unit, targetElement)) {
            count++;
        }
    }, turnData.unitList);
    return count;
}

export const setInitSkill = (unit) => {
    if (unit.placeNo < 3) {
        unit.selectSkillId = unit.initSkillId;
        unit.spCost = 0;
    } else {
        if (checkAbilityExist(unit[`ability_${ABILIRY_TIMING.OTHER}`], 1530)) {
            // 湯めぐり
            unit.selectSkillId = constants.SKILL_ID.AUTO_PURSUIT;
        } else {
            unit.selectSkillId = constants.SKILL_ID.NONE;
        }
        unit.spCost = 0;
    }
    unit.buffEffectSelectType = null;
    unit.buffTargetCharaId = null;
}

const unitOverDriveTurnProceed = (unit) => {
    buffSort(unit);
    // OverDriveゲージをSPに加算
    unit.sp += unit.overDriveSp;
    if (unit.sp > 99) unit.sp = 99;
    unit.overDriveSp = 0;

    unit.ep += unit.overDriveEp;
    if (unit.ep > 20) unit.ep = 20;
    unit.overDriveEp = 0;
}

const buffConsumption = (turnProgress, unit) => {
    for (let i = unit.buffList.length - 1; i >= 0; i--) {
        let buffInfo = unit.buffList[i];
        if (buffInfo.effect_turn > 0) {
            if (!turnProgress) {
                // 単独発動と行動不能
                if (isAloneActivation(buffInfo) || buffInfo.buff_no === BUFF.RECOIL) {
                    if (buffInfo.rest_turn === 1) {
                        unit.buffList.splice(i, 1);
                    } else {
                        buffInfo.rest_turn -= 1;
                    }
                }
            } else {
                // 全バフターン消費
                if (buffInfo.rest_turn === 1) {
                    unit.buffList.splice(i, 1);
                } else {
                    buffInfo.rest_turn -= 1;
                }
            }
        }
    }
}

const buffSort = (unit) => {
    unit.buffList.sort((a, b) => {
        if (a.buff_no === b.buff_no) {
            return a.effect_size - b.effect_size;
        }
        return a.buff_no - b.buff_no;
    });
}

const payCost = (unit, skill) => {
    // OD上限突破
    if (unit.sp + unit.overDriveSp > 99) {
        unit.sp = 99 - unit.overDriveSp;
    }

    // 軽減バフを削除
    removeSprightlyBuff(unit, skill);

    switch (skill.cost_type) {
        case COST_TYPE.SP:
            // SPは可変なので計算済みの値を使用
            unit.sp -= unit.spCost;
            unit.spCost = 0;
            break;
        case COST_TYPE.EP:
            unit.ep -= skill.use_cost;
            break;
        case COST_TYPE.TOKEN:
            if (skill.use_cost === 99) {
                unit.token -= unit.tokenCost;
            } else {
                unit.token -= skill.use_cost;
            }
            break;
        default:
            break;
    }
}
// 軽減バフを削除
const removeSprightlyBuff = (unit, skill) => {
    if (skill.skill_id === SKILL_ID.CAFE_TIME) {
        return;
    }
    // 消費SPが0または、全消費の場合は軽減バフを削除しない
    if (unit.spCost === 0 || (skill.cost_type === COST_TYPE.SP && skill.use_cost === 99)) {
        return;
    }
    if (checkBuffExist(unit.buffList, BUFF.SPRIGHTLY)) {
        // 軽快
        unit.buffList = unit.buffList.filter(function (buffInfo) {
            return buffInfo.buff_no !== BUFF.SPRIGHTLY;
        });
    } else if (checkBuffExist(unit.buffList, BUFF.SPRIGHTLY_LIGHT)) {
        // 軽快(小)
        unit.buffList = unit.buffList.filter(function (buffInfo) {
            return buffInfo.buff_no !== BUFF.SPRIGHTLY_LIGHT;
        });
    }
}

const getearringEffectSize = (hitCount, unit) => {
    // ドライブ
    if (unit.earringEffectSize !== 0) {
        hitCount = hitCount < 1 ? 1 : hitCount;
        hitCount = hitCount > 10 ? 10 : hitCount;
        return (unit.earringEffectSize - ((unit.earringEffectSize - 5) / 9 * (10 - hitCount)));
    }
    return 0;
}

// 連撃消費
export const getFunnelList = (unit) => {
    let ret = [];
    let buffFunnelList = unit.buffList.filter(function (buffInfo) {
        return BUFF.FUNNEL === buffInfo.buff_no && !isAloneActivation(buffInfo);
    });
    const buffUnitFunnelList = unit.buffList.filter(function (buffInfo) {
        return BUFF.FUNNEL === buffInfo.buff_no && isAloneActivation(buffInfo);
    });
    let abilityList = unit.buffList.filter(function (buffInfo) {
        return BUFF.ABILITY_FUNNEL === buffInfo.buff_no;
    });

    // effectSumで降順にソート
    buffFunnelList.sort(function (a, b) {
        return b.effectSum - a.effectSum;
    });
    buffUnitFunnelList.sort(function (a, b) {
        return b.effectSum - a.effectSum;
    });
    abilityList.sort(function (a, b) {
        return b.effectSum - a.effectSum;
    });
    // 単独発動の効果値判定
    let buffTotal = buffFunnelList.slice(0, 2).reduce(function (sum, element) {
        return sum + element["effectSum"];
    }, 0);
    let buffUnitTotal = buffUnitFunnelList.slice(0, 1).reduce(function (sum, element) {
        return sum + element["effectSum"];
    }, 0);

    // 最大値判定
    if (buffTotal <= buffUnitTotal) {
        ret = buffUnitFunnelList.slice(0, 1)
    } else {
        ret = buffFunnelList.slice(0, 2)
        buffFunnelList = buffFunnelList.slice(2);
    }
    // アビリティを追加
    if (abilityList.length > 0) {
        ret.push(abilityList[0]);
    }

    // 新しいリストを作成
    let resultList = [];

    // 各要素のeffect_count分effect_unitを追加
    ret.forEach(function (item) {
        for (let i = 0; i < item.effect_count; i++) {
            resultList.push(item.effect_size);
        }
        item.useFunnel = true;
    });
    // 使用後にリストから削除
    unit.buffList = unit.buffList.filter(function (item) {
        return !item.useFunnel || isAloneActivation(item) || (item.activation_place && item.first_only !== 1);
    })
    return resultList;
}
