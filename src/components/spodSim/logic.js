import {
    ABILIRY_TIMING, KB_NEXT, ACTION_ORDER,
    SINGLE_BUFF_LIST, ELEMENT_NAME, BUFF_FUNNEL_LIST
} from "./const";
import {
    CHARA_ID, SKILL_ID, ABILITY_ID, SKILL, ELEMENT, BUFF, RANGE, FIELD, EFFECT, CONDITIONS, ATTRIBUTE, KIND,
    ALONE_ACTIVATION_BUFF_KIND, COST_TYPE, changeStyle
} from "utils/const";
import * as constants from "utils/const";
import * as common from "utils/common";
import {
    getCharaData, getSkillData, getAttackInfo, getBuffList, deepClone, getStyleData
} from "utils/common";
import skillAttack from "data/skillAttack";
import skillList from "data/skillList";

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
export function checkBuffExist(buffList, buffKind, lv = 6) {
    let existList = buffList.filter(function (buffInfo) {
        return buffInfo.buff_kind === buffKind;
    });
    if (buffKind === BUFF.MORALE) {
        return existList.length > 0 && existList[0].lv >= lv;
    } else {
        return existList.length > 0;
    }
}

// バフ存在チェック
export function checkBuffIdExist(buffList, buff_id) {
    let existList = buffList.filter(function (buffInfo) {
        return buffInfo.buff_id === buff_id;
    });
    return existList.length > 0;
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

// SPチェック
export function checkSp(turnData, rangeArea, sp, placeNo) {
    let targetList = getTargetList(turnData, rangeArea, null, placeNo, null);
    let exist_list = targetList.filter(function (target_no) {
        let unitData = getUnitData(turnData, target_no);
        return unitData.sp < sp;
    })
    return exist_list.length > 0;
}


// スキルデータ更新
export const skillUpdate = (turnData, skillId, placeNo) => {
    const unit = turnData.unitList.filter(unit => unit.placeNo === placeNo)[0];
    unit.selectSkillId = skillId;
    if (skillId !== 0) {
        unit.spCost = getSpCost(turnData, getSkillData(skillId), unit);
    } else {
        unit.spCost = 0;
    }
}

// ユーザ操作の取得
const updateUserOperation = (userOperationList, turnData) => {
    let filtered = userOperationList.filter((item) =>
        compereUserOperation(item, turnData) === 0
    );
    let userOperation = turnData.userOperation;
    if (filtered.length === 0) {
        turnData.userOperation.kbAction = KB_NEXT.ACTION;
        userOperationList.push(turnData.userOperation);
        // 表示確認用
        userOperationList.sort((a, b) => compereUserOperation(a, b));
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
    ["0", "00", "1", "3", "4", "5", "10"].forEach(numStr => {
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
                        // turnData.userOperation.selectSkill[operationPlaceNo].skill_id = turnData.userOperation.selectSkill[unit.placeNo].skill_id;
                        // turnData.userOperation.selectSkill[operationPlaceNo].buffEffectSelectType = turnData.userOperation.selectSkill[unit.placeNo].buffEffectSelectType;
                        // turnData.userOperation.selectSkill[operationPlaceNo].buffTargetCharaId = turnData.userOperation.selectSkill[unit.placeNo].buffTargetCharaId;
                        turnData.userOperation.placeStyle[operationPlaceNo] = turnData.userOperation.placeStyle[unit.placeNo];

                        // turnData.userOperation.selectSkill[unit.placeNo].skill_id = unit.selectSkillId;
                        // turnData.userOperation.selectSkill[unit.placeNo].buffEffectSelectType = unit.buffEffectSelectType;
                        // turnData.userOperation.selectSkill[unit.placeNo].buffTargetCharaId = unit.buffTargetCharaId;
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
    turnData.addOverDriveGauge = getOverDrive(turnData);
    // 行動反映
    if (turnData.overDriveGauge + turnData.addOverDriveGauge < 100) {
        turnData.userOperation.kbAction = KB_NEXT.ACTION;
    }
    // OD発動反映
    turnData.triggerOverDrive = turnData.userOperation.triggerOverDrive;
}

// ユーザ操作の比較
const compereUserOperation = (comp1, comp2) => {
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

// バフアイコン取得
export function getBuffIconImg(buffInfo) {
    let src = "";
    let buffKindKbn = common.getBuffKind(buffInfo.buff_kind);
    if (buffKindKbn) {
        src = buffKindKbn.buff_icon;
    }
    if (buffInfo.buff_element && buffInfo.buff_element !== 0) {
        src += buffInfo.buff_element;
    }
    return src;
}

// ユニットデータ取得
export function getUnitData(turnData, index) {
    let unitList = turnData.unitList;
    const filteredUnit = unitList.filter((obj) => obj.placeNo === index);
    return filteredUnit.length > 0 ? filteredUnit[0] : undefined;
}

// スキルIDから攻撃情報を取得
export function getSkillIdToAttackInfo(turnData, skillId) {
    let filteredAttack = skillAttack.filter((obj) => obj.skill_id === skillId);
    switch (skillId) {
        case SKILL_ID.BOUQUET_SHOOT:
            //ファーマメントブーケショット
            let field = turnData.field < 6 ? turnData.field : FIELD.NORMAL;
            filteredAttack = filteredAttack.filter((obj) => obj.attack_element === field);
            break;
        default:
            break;
    }
    return filteredAttack.length > 0 ? filteredAttack[0] : undefined;
}

// 行動開始
export function startAction(turnData) {
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
    // フィールド判定
    let oldField = turnData.oldField;
    let selectField = turnData.userOperation.field;
    if (oldField !== selectField && selectField) {
        // 変更があった場合はフィールドターンをリセット
        turnData.fieldTurn = 0;
        turnData.oldField = selectField;
    }

    let seq = sortActionSeq(turnData);
    let turnOverDriveGauge = 0;
    // 攻撃後に付与されるバフ種
    const ATTACK_AFTER_LIST = [BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP, BUFF.CRITICALRATEUP, BUFF.CRITICALDAMAGEUP, BUFF.ELEMENT_CRITICALRATEUP,
    BUFF.ELEMENT_CRITICALDAMAGEUP, BUFF.CHARGE, BUFF.DAMAGERATEUP];
    const frontCostList = [];
    for (const skillData of seq) {
        let skillInfo = skillData.skillInfo;
        let unitData = getUnitData(turnData, skillData.placeNo);
        // SP消費してから行動
        payCost(unitData, skillInfo);

        let charaName = getCharaData(unitData.style.styleInfo.chara_id).chara_short_name;
        let log = `${charaName}の${skillInfo.skill_name}`;
        turnData.setLog(log);

        let buffList = getBuffList(skillInfo.skill_id);
        for (let i = 0; i < buffList.length; i++) {
            let buffInfo = buffList[i];
            if (!(buffInfo.skill_attack1 === 999 && ATTACK_AFTER_LIST.includes(buffInfo.buff_kind))) {
                addBuffUnit(turnData, buffInfo, skillData.placeNo, unitData);
            }
        }
        const unitOdPlus = getODPlus(skillData, turnData, frontCostList);
        if (unitOdPlus > 0) {
            log = `　OverDriveゲージ+${unitOdPlus}%`;
            turnData.setLog(log);
        } else if (unitOdPlus < 0) {
            log = `　OverDriveゲージ${unitOdPlus}%`;
            turnData.setLog(log);
        }
        turnOverDriveGauge += unitOdPlus;

        let attackInfo;
        if (skillInfo.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
            attackInfo = { "attack_id": 0, "attack_element": unitData.normalAttackElement };
        } else {
            attackInfo = getSkillIdToAttackInfo(turnData, skillInfo.skill_id);
            // アビリティ(スキル使用)
            abilityActionUnit(turnData, ABILIRY_TIMING.SKILL_USE, unitData);
        }

        if (attackInfo) {
            consumeBuffUnit(turnData, unitData, attackInfo, skillInfo);
        }

        // EXスキル使用
        if (skillInfo.skill_kind === KIND.EX_GENERATE || skillInfo.skill_kind === KIND.EX_EXCLUSIVE) {
            // EXスキル連続使用
            if (checkBuffExist(unitData.buffList, BUFF.EX_DOUBLE)) {
                for (let i = 0; i < buffList.length; i++) {
                    let buffInfo = buffList[i];
                    if (!(buffInfo.skill_attack1 === 999 && ATTACK_AFTER_LIST.includes(buffInfo.buff_kind))) {
                        addBuffUnit(turnData, buffInfo, skillData.placeNo, unitData);
                    }
                }
                if (attackInfo) {
                    consumeBuffUnit(turnData, unitData, attackInfo, skillInfo);
                }
                unitData.buffList = unitData.buffList.filter(obj => obj.buff_kind !== BUFF.EX_DOUBLE);
            }
            // アビリティ（EXスキル使用）
            abilityActionUnit(turnData, ABILIRY_TIMING.EX_SKILL_USE, unitData, false);
        }

        // 攻撃後にバフを付与
        for (let i = 0; i < buffList.length; i++) {
            let buffInfo = buffList[i];
            if (buffInfo.skill_attack1 === 999 && ATTACK_AFTER_LIST.includes(buffInfo.buff_kind)) {
                addBuffUnit(turnData, buffInfo, skillData.placeNo, unitData);
            }
        }
        origin(turnData, skillInfo, unitData);
    }

    // 後衛の選択取得
    [3, 4, 5].forEach(function (placeNo) {
        let unitData = getUnitData(turnData, placeNo);
        if (unitData.blank) {
            return;
        }
        let skillId = unitData.selectSkillId;
        // 無し
        if (skillId === SKILL.NONE) {
            return true;
        }
        // 追撃
        if (skillId === SKILL.PURSUIT) {
            abilityActionUnit(turnData, ABILIRY_TIMING.PURSUIT, unitData)
            return true;
        }

        // 自動追撃
        if (skillId === SKILL.AUTO_PURSUIT) {
            frontCostList.filter(cost => cost <= 8).forEach(cost => {
                abilityActionUnit(turnData, ABILIRY_TIMING.PURSUIT, unitData)
            });
            return true;
        }
        let skillInfo = getSkillData(skillId)
        if (skillInfo) {
            let attackInfo = getSkillIdToAttackInfo(turnData, skillId);
            if (attackInfo) {
                // SP消費してから行動
                payCost(unitData, skillInfo);

                let buffList = getBuffList(skillInfo.skill_id);
                for (let i = 0; i < buffList.length; i++) {
                    let buffInfo = buffList[i];
                    if (!(buffInfo.skill_attack1 === 999 && ATTACK_AFTER_LIST.includes(buffInfo.buff_kind))) {
                        addBuffUnit(turnData, buffInfo, placeNo, unitData);
                    }
                }
                consumeBuffUnit(turnData, unitData, attackInfo, skillInfo);
            }
            if (skillId === SKILL_ID.CAT_JET_SHOOTING) {
                // ネコジェット・シャテキ後自動追撃
                abilityActionUnit(turnData, ABILIRY_TIMING.PURSUIT, unitData)
                const validCosts = frontCostList.filter(cost => cost <= 8);
                validCosts.slice(0, Math.max(validCosts.length - 1, 0)).forEach(() => {
                    abilityActionUnit(turnData, ABILIRY_TIMING.PURSUIT, unitData)
                });
            }
        }
    });

    turnData.overDriveGauge += turnOverDriveGauge;
    if (turnData.overDriveGauge > 300) {
        turnData.overDriveGauge = 300;
    }
    // 残りフィールドターン
    if (turnData.fieldTurn > 1 && !turnData.additionalTurn) {
        turnData.fieldTurn--;
    } else if (turnData.fieldTurn === 1) {
        turnData.field = 0;
    }
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
function isWeak(enemyInfo, physical, element, attackId) {
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
            let target_unitData = turnData.unitList.filter(unit => unit?.style?.styleInfo?.chara_id === unitData.buffTargetCharaId);
            target_unitData[0].nextTurnMinSp = 3;
            break;
        case 617: // ドリーミー・ガーデン
            let target_unitList = turnData.unitList.filter(unit => unit?.style?.styleInfo?.chara_id !== unitData.style.styleInfo.chara_id);
            target_unitList.forEach(unit => unit.nextTurnMinSp = 10);
            break;
        default:
            break;
    }
    return;
}

// OD上昇量取得
export const getOverDrive = (turn) => {
    // OD上昇量取得
    const seq = sortActionSeq(turn);
    const enemyCount = turn.enemyCount;
    let odPlus = 0;
    const tempTurn = deepClone(turn);
    const frontCostList = [];

    for (const skillData of seq) {
        const unitOdPlus = getODPlus(skillData, tempTurn, frontCostList);
        odPlus += unitOdPlus;
        // EXスキル使用アビリティにOD増加がある場合は加算する
        if (common.isSkillEx(skillData.skillInfo, skillData.skillInfo.skill_id)) {
            const unitData = getUnitData(tempTurn, skillData.placeNo);
            const add = unitData[`ability_${ABILIRY_TIMING.EX_SKILL_USE}`]
                .filter(ability => ability.effect_type === constants.EFFECT.OVERDRIVEPOINTUP)
                .reduce((sum, ability) => {
                    if (ability.conditions &&
                        !judgmentCondition(ability.conditions, ability.conditions_id, tempTurn, unitData, ability.skill_id)) {
                        return sum;
                    }
                    return sum + ability.effect_size;
                }, 0);
            odPlus += add
        }
    }
    // // 後衛の選択取得
    [3, 4, 5].forEach(function (placeNo) {
        let unitData = getUnitData(tempTurn, placeNo);
        if (unitData.blank) {
            return;
        }
        let skill_id = unitData.selectSkillId;
        if (skill_id === SKILL.NONE) {
            return true;
        }
        // 追撃
        if (skill_id === SKILL.PURSUIT) {
            let chara_data = getCharaData(unitData.style.styleInfo.chara_id);
            if (!isResist(turn.enemyInfo, chara_data.physical, 0, 0)) {
                odPlus += chara_data.pursuit * 2.5;
            }
            return true;
        }
        let physical = getCharaData(unitData.style.styleInfo.chara_id).physical;
        // 自動追撃
        if (skill_id === SKILL.AUTO_PURSUIT) {
            if (!isResist(turn.enemyInfo, physical, 0, 0)) {
                let chara_data = getCharaData(unitData.style.styleInfo.chara_id)
                frontCostList.filter(cost => cost <= 8).forEach(cost => {
                    odPlus += chara_data.pursuit * 2.5;
                });
            }
            return true;
        }

        let skillInfo = getSkillData(skill_id)
        if (skillInfo) {
            const attackInfo = getSkillIdToAttackInfo(turn, skill_id);
            if (attackInfo) {
                let badies = checkBuffExist(unitData.buffList, BUFF.BABIED) ? 20 : 0;
                const earring = attackInfo.attack_id ? getearringEffectSize(attackInfo.hit_count, unitData) : 0;
                if (!isResist(turn.enemyInfo, physical, attackInfo.attack_element, attackInfo.attack_id)) {
                    let enemyTarget = enemyCount;
                    if (attackInfo.range_area === constants.RANGE.ENEMY_UNIT) {
                        enemyTarget = 1;
                    }
                    let funnelList = getFunnelList(unitData);
                    odPlus += calcODGain(attackInfo.hit_count, enemyTarget, badies, earring, funnelList.length);
                }
            }
            if (skill_id === SKILL_ID.CAT_JET_SHOOTING) {
                // ネコジェット・シャテキ後自動追撃
                if (!isResist(turn.enemyInfo, physical, 0, 0)) {
                    let chara_data = getCharaData(unitData.style.styleInfo.chara_id)
                    const validCosts = frontCostList.filter(cost => cost <= 8);
                    validCosts.slice(0, Math.max(validCosts.length - 1, 0)).forEach(() => {
                        odPlus += chara_data.pursuit * 2.5;
                    });
                }
            }
        }
    });
    return odPlus;
}

const getODPlus = (skillData, turnData, frontCostList) => {
    const enemyCount = turnData.enemyCount;
    const skillInfo = skillData.skillInfo;
    const unitData = getUnitData(turnData, skillData.placeNo);
    const buffList = getBuffList(skillInfo.skill_id);
    const attackInfo = getSkillIdToAttackInfo(turnData, skillInfo.skill_id);
    let unitOdPlus = 0;
    // オギャり状態
    let badies = checkBuffExist(unitData.buffList, BUFF.BABIED) ? 20 : 0;
    const earring = getearringEffectSize(attackInfo ? attackInfo.hit_count : 1, unitData);

    for (const buffInfo of buffList) {
        // OD増加
        if (buffInfo.buff_kind === BUFF.OVERDRIVEPOINTUP) {
            // 条件判定
            if (buffInfo.conditions && !judgmentCondition(buffInfo.conditions, buffInfo.conditions_id, turnData, unitData, buffInfo.skill_id)) {
                continue;
            }
            // 可変ODはいったん非対応

            let correction = 1;
            // 補正はのプラスの時のみ
            if (buffInfo.max_power > 0) {
                correction += (badies + earring) / 100;
            }
            unitOdPlus += Math.floor(buffInfo.max_power * correction * 100) / 100;
        }
        // 連撃、オギャり状態、チャージ処理
        const PROC_KIND = [BUFF.BABIED, BUFF.CHARGE];
        if (BUFF_FUNNEL_LIST.includes(buffInfo.buff_kind) || PROC_KIND.includes(buffInfo.buff_kind)) {
            addBuffUnit(turnData, buffInfo, skillData.placeNo, unitData, false);
        }
    }
    let physical = getCharaData(unitData.style.styleInfo.chara_id).physical;
    if (skillInfo.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
        // 通常攻撃
        if (!isResist(turnData.enemyInfo, physical, unitData.normalAttackElement, null)) {
            unitOdPlus += calcODGain(3, 1, badies);
        }
    } else if (attackInfo) {
        // 攻撃IDの変換(暫定)
        let attackId = attackInfo.attack_id
        switch (attackId) {
            case 83:
                // 唯雅粛正
                if (checkBuffExist(unitData.buffList, BUFF.CHARGE)) {
                    attackId = 84;
                }
                break;
            default:
                break;
        }
        frontCostList.push(unitData.spCost);
        if (!isResist(turnData.enemyInfo, physical, attackInfo.attack_element, attackId)) {
            let enemyTarget = enemyCount;
            if (attackInfo.range_area === constants.RANGE.ENEMY_UNIT) {
                enemyTarget = 1;
            }
            let funnelList = getFunnelList(unitData);
            unitOdPlus += calcODGain(attackInfo.hit_count, enemyTarget, badies, earring, funnelList.length);
            // EXスキル連続使用
            if (checkBuffExist(unitData.buffList, BUFF.EX_DOUBLE) && (skillInfo.skill_kind === KIND.EX_GENERATE || skillInfo.skill_kind === KIND.EX_EXCLUSIVE)) {
                buffList.forEach(function (buffInfo) {
                    // 連撃のみ処理
                    if (BUFF_FUNNEL_LIST.includes(buffInfo.buff_kind)) {
                        addBuffUnit(turnData, buffInfo, skillData.placeNo, unitData, false);
                    }
                });
                let funnelList = getFunnelList(unitData);
                unitOdPlus += calcODGain(attackInfo.hit_count, enemyTarget, badies, earring, funnelList.length);
            }
        }
    }
    return unitOdPlus;
}

// OD計算
const calcODGain = (hitCount, enemyTarget, badies = 0, earring = 0, funnelCount = 0) => {
    const correction = 1 + (badies + earring) / 100;
    const hitOd = Math.floor(2.5 * correction * 100) / 100;
    return (hitCount * hitOd * enemyTarget) + (funnelCount * hitOd * enemyTarget);
};

// 消費SP取得
export function getSpCost(turnData, skillInfo, unit) {
    if (!skillInfo) {
        return 0;
    }
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
    let spCostDown = unit.spCostDown;
    let spCostUp = unit.spCostUp;
    if (harfSpSkill(turnData, skillInfo, unit)) {
        spCost = Math.ceil(spCost / 2);
    }
    if (ZeroSpSkill(turnData, skillInfo, unit)) {
        return 0;
    }

    // オーバードライブ中
    if (turnData.overDriveMaxTurn > 0) {
        // 獅子に鰭
        if (checkAbilityExist(unit[`ability_${ABILIRY_TIMING.EVERY_TURN}`], 612)) {
            spCostDown = 2;
        }
        // 飛躍
        if (checkAbilityExist(unit[`ability_${ABILIRY_TIMING.EVERY_TURN}`], 613)) {
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
        if (judgmentCondition(skillInfo.conditions, skillInfo.conditions_id, turnData, unitData, skillInfo.skill_id)) {
            return true;
        }
    }
    return false;
}

// 消費SP0
function ZeroSpSkill(turnData, skillInfo, unitData) {
    // SP消費0
    if (skillInfo.skill_attribute === ATTRIBUTE.SP_ZERO) {
        if (judgmentCondition(skillInfo.conditions, skillInfo.conditions_id, turnData, unitData, skillInfo.skill_id)) {
            return true;
        }
    }
    return false;
}

// 条件判定
function judgmentCondition(conditions, conditionsId, turnData, unitData, skill_id) {
    switch (conditions) {
        case CONDITIONS.FIRST_TURN: // 1ターン目
            return turnData.turnNumber === 1;
        case CONDITIONS.SKILL_INIT: // 初回
            return !unitData.useSkillList.includes(skill_id)
        case CONDITIONS.ADDITIONAL_TURN: // 追加ターン
            return turnData.additionalCount > 0;
        case CONDITIONS.NOT_ADDITIONAL_TURN: // 追加ターン以外
            return turnData.additionalCount === 0;
        case CONDITIONS.DESTRUCTION_OVER_200: // 破壊率200%以上
        case CONDITIONS.BREAK: // ブレイク時
        case CONDITIONS.HAS_SHADOW: // 影分身
        case CONDITIONS.PERCENTAGE_30: // 確率30%
        case CONDITIONS.DOWN_TURN: // ダウンターン
        case CONDITIONS.BUFF_DISPEL: // バフ解除
        case CONDITIONS.DP_OVER_100: // DP100%以上
        case CONDITIONS.SUPER_DOWN: // 超ダウン
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
            return conditionsId ? turnData.field === conditionsId : getFieldElement(turnData) !== 0;
        case CONDITIONS.HAS_ABILITY: // アビリティ
            return checkAbilityExist(unitData[`ability_${ABILIRY_TIMING.OTHER}`], conditionsId);
        case CONDITIONS.HAS_BUFF: // バフ発動中
            return checkBuffExist(unitData.buffList, conditionsId);
        case CONDITIONS.MORALE_OVER_LV: // 士気Lv以上
            return checkBuffExist(unitData.buffList, BUFF.MORALE, conditionsId);
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
        case CONDITIONS.FIELD_NOT_FIRE: // 火属性フィールド以外
            return turnData.field !== FIELD.FIRE && turnData.field !== FIELD.NORMAL;
        case CONDITIONS.DIVA_BLESS: // 歌姫の加護
            return checkBuffExist(unitData.buffList, BUFF.DIVA_BLESS);
        case CONDITIONS.NOT_DIVA_BLESS: // 歌姫の加護以外
            return !checkBuffExist(unitData.buffList, BUFF.DIVA_BLESS);
        case CONDITIONS.NOT_NEGATIVE: // ネガティブ以外
            return !checkBuffExist(unitData.buffList, BUFF.NAGATIVE);
        case CONDITIONS.SP_UNDER_0_ALL: // SP0以下の味方がいる
            return checkSp(turnData, RANGE.ALLY_ALL, 0);
        case CONDITIONS.SP_UNDER: // SP指定値以下
            return checkSp(turnData, RANGE.SELF, conditionsId, unitData.placeNo);
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
            return (conditionsId - 1) <= unitData.useSkillList.filter(id => id === skill_id).length;
        case CONDITIONS.MOTIVATION: // やる気
        case CONDITIONS.TOKEN_OVER: // トークン
            return unitData.buffEffectSelectType >= conditionsId;
        case CONDITIONS.HAS_PASSIVE: // パッシブ所持
            if (conditionsId === SKILL_ID.FAST_SHOT && turnData.turnNumber > 2) {
                return false
            }
            return checkPassiveExist(unitData.passiveSkillList, conditionsId);
        default:
            break;
    }
    return true;
}

function getFieldElement(turnData) {
    let field_element = Number(turnData.field);
    if (field_element === FIELD.RICE || field_element === FIELD.SANDSTORM) {
        field_element = 0;
    }
    return field_element;
}

// バフを追加
function addBuffUnit(turnData, buffInfo, placeNo, useUnitData, isLogOutput = true) {
    // 条件判定
    if (buffInfo.conditions) {
        if (!judgmentCondition(buffInfo.conditions, buffInfo.conditions_id, turnData, useUnitData, buffInfo.skill_id)) {
            return;
        }
    }

    // 個別判定
    switch (buffInfo.buff_id) {
        // 選択されなかった
        case constants.BUFF_ID.TRICK_CANNON: // トリック・カノン(攻撃力低下)
            if (useUnitData.buffEffectSelectType === 0) {
                return;
            }
            break;
        default:
            break;
    }
    switch (buffInfo.skill_id) {
        case constants.BUFF_ID.PERFECT_COLOR: // 極彩色
            let field_element = getFieldElement(turnData);
            if (buffInfo.buff_element !== field_element) {
                return;
            }
            break;
        default:
            break;
    }

    let targetList = getTargetList(turnData, buffInfo.range_area, buffInfo.target_element, placeNo, useUnitData.buffTargetCharaId);
    // 対象策定
    switch (buffInfo.buff_kind) {
        case BUFF.ATTACKUP: // 攻撃力アップ
        case BUFF.ELEMENT_ATTACKUP: // 属性攻撃力アップ
        case BUFF.MINDEYE: // 心眼
        case BUFF.CRITICALRATEUP:	// クリティカル率アップ
        case BUFF.CRITICALDAMAGEUP:	// クリティカルダメージアップ
        case BUFF.ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
        case BUFF.ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
        case BUFF.CHARGE: // チャージ
        case BUFF.DAMAGERATEUP: // 破壊率アップ
        case BUFF.FUNNEL: // 連撃
        case BUFF.RECOIL: // 行動不能
        case BUFF.GIVEATTACKBUFFUP: // バフ強化
        case BUFF.GIVEDEBUFFUP: // デバフ強化
        case BUFF.ARROWCHERRYBLOSSOMS: // 桜花の矢
        case BUFF.ETERNAL_OARH: // 永遠なる誓い
        case BUFF.EX_DOUBLE: // EXスキル連続使用
        case BUFF.BABIED: // オギャり
        case BUFF.DIVA_BLESS: // 歌姫の加護
        case BUFF.SHREDDING: // 速弾き
        case BUFF.YAMAWAKI_SERVANT: // 山脇様のしもべ
        case BUFF.CURRY: // カリー
        case BUFF.SHCHI: // シチー
        case BUFF.STEAK: // ステーキ
        case BUFF.GELATO: // ジェラート
            // バフ追加
            if (buffInfo.buff_kind === BUFF.ATTACKUP || buffInfo.buff_kind === BUFF.ELEMENT_ATTACKUP) {
                // 先頭のバフ強化を消費する。
                let index = useUnitData.buffList.findIndex(function (buffInfo) {
                    return buffInfo.buff_kind === BUFF.GIVEATTACKBUFFUP;
                });
                if (index !== -1) {
                    useUnitData.buffList.splice(index, 1);
                }
            }
            targetList.forEach(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                if (unitData.blank) {
                    return;
                }
                // 単一バフ
                if (SINGLE_BUFF_LIST.includes(buffInfo.buff_kind)) {
                    if (checkBuffExist(unitData.buffList, buffInfo.buff_kind)) {
                        if (buffInfo.effect_count > 0) {
                            // 残ターン更新
                            let filter_list = unitData.buffList.filter(function (buff) {
                                return buff.buff_kind === buffInfo.buff_kind;
                            })
                            filter_list[0].rest_turn = buffInfo.effect_count;
                        }
                        return true;
                    }
                }
                if (isAloneActivation(buffInfo)) {
                    if (checkBuffIdExist(unitData.buffList, buffInfo.buff_id)) {
                        if (buffInfo.effect_count > 0) {
                            // 残ターン更新
                            let filter_list = unitData.buffList.filter(function (buff) {
                                return buff.buff_id === buffInfo.buff_id;
                            })
                            filter_list[0].rest_turn = buffInfo.effect_count;
                        }
                        return true;
                    }
                }
                let buff = createBuffData(buffInfo, useUnitData);
                // 茜色
                if (buffInfo.buff_id === constants.BUFF_ID.BRIGHT_RED && unitData.style.styleInfo.element === 1) {
                    buff.rest_turn = 5;
                }
                unitData.buffList.push(buff);
            });
            break;
        case BUFF.MORALE: // 士気
            // バフ追加
            targetList.forEach(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                if (unitData.blank) {
                    return;
                }
                addMoraleBuffUnit(unitData, buffInfo, useUnitData);
            });
            break;
        case BUFF.DEFENSEDOWN: // 防御力ダウン
        case BUFF.ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
        case BUFF.FRAGILE: // 脆弱
        case BUFF.ETERNAL_FRAGILE: // 永続脆弱
        case BUFF.DEFENSEDP: // DP防御力ダウン
        case BUFF.RESISTDOWN: // 耐性ダウン
        case BUFF.ETERNAL_DEFENSEDOWN: // 永続防御ダウン
        case BUFF.ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
        case BUFF.PROVOKE: // 挑発
        case BUFF.COVER: // 注目
            // デバフ追加
            let add_count = 1;
            if (buffInfo.range_area === RANGE.ENEMY_ALL) {
                add_count = turnData.enemyCount;
            }
            // デバフ強化を消費する。
            let index = useUnitData.buffList.findIndex(function (buffInfo) {
                return buffInfo.buff_kind === BUFF.GIVEDEBUFFUP || buffInfo.buff_kind === BUFF.ARROWCHERRYBLOSSOMS;
            });
            if (index !== -1) {
                useUnitData.buffList.splice(index, 1);
            }
            for (let i = 0; i < add_count; i++) {
                let debuff = createBuffData(buffInfo, useUnitData);
                turnData.enemyDebuffList.push(debuff);
            }
            break;
        case BUFF.HEALSP: // SP追加
            targetList.forEach(function (target_no) {
                skillHealSp(turnData, target_no, buffInfo.min_power, buffInfo.max_power, placeNo, false, buffInfo.buff_id);
            });
            break;
        case BUFF.HEALEP: // EP追加
            targetList.forEach(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                let maxEp = Math.max(10, unitData.ep + unitData.overDriveEp);
                if (checkAbilityExist(unitData[`ability_${ABILIRY_TIMING.OD_START}`], ABILITY_ID.OVER_GEAR) && turnData.overDriveNumber > 0) {
                    maxEp = 20;
                }
                if (unitData.ep < maxEp) {
                    unitData.ep += buffInfo.min_power;
                    if (unitData.ep > maxEp) {
                        unitData.ep = maxEp;
                    }
                }
            });
            break;
        case BUFF.ADDITIONALTURN: // 追加ターン
            targetList.forEach(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                unitData.additionalTurn = true;
            });
            turnData.additionalTurn = true;
            break;
        case BUFF.FIELD: // フィールド
            turnData.field = buffInfo.buff_element;
            let fieldTurn = buffInfo.effect_count;
            if (fieldTurn > 0) {
                // 天長地久
                if (checkAbilityExist(useUnitData[`ability_${ABILIRY_TIMING.OTHER}`], constants.BUFF_ID.HEAVEN_AND_EARTH)) {
                    fieldTurn = 0;
                }
                // 武運長久
                if (checkAbilityExist(useUnitData[`ability_${ABILIRY_TIMING.OTHER}`], constants.BUFF_ID.FORTUNES_OF_WAR) && checkBuffExist(useUnitData.buffList, constants.BUFF.MORALE, 6)) {
                    fieldTurn = 0;
                }
                // メディテーション
                if (checkPassiveExist(useUnitData.passiveSkillList, constants.SKILL_ID.MEDITATION)) {
                    fieldTurn = 0;
                }
            }
            // フィールド展開アビリティ
            abilityAction(ABILIRY_TIMING.FIELD_DEPLOY, turnData);
            turnData.fieldTurn = fieldTurn;
            break;
        case BUFF.DISPEL: // ディスペル
            targetList.forEach(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                unitData.buffList = unitData.buffList.filter(function (buffInfo) {
                    return buffInfo.buff_kind !== BUFF.RECOIL && buffInfo.buff_kind !== BUFF.NAGATIVE;
                });
            });
            break;
        default:
            break;
    }

    if (isLogOutput) {
        let effectDesc = common.getBuffKind(buffInfo.buff_kind).buff_name;
        let rangeName = getRangeName(buffInfo.range_area);
        let conditionName = getConditionName(buffInfo.target_element, buffInfo.conditions, Number(buffInfo.conditions_id));
        let log = `　${conditionName}${effectDesc}`;
        if (rangeName) {
            log = `　${conditionName}${rangeName}に${effectDesc}`;
        }
        if (targetList.length > 0) {
            let nameList = targetList.map(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                return getCharaData(unitData.style.styleInfo.chara_id).chara_short_name;
            });
            log += `(対象：${nameList.join(", ")})`;
        }
        turnData.setLog(log);
    }
}

function addMoraleBuffUnit(unitData, buffInfo, useUnitData) {
    let existList = unitData.buffList.filter(function (buffInfo) {
        return buffInfo.buff_kind === BUFF.MORALE;
    });
    let buff;
    if (existList.length > 0) {
        buff = existList[0];
    } else {
        buff = createBuffData(buffInfo, useUnitData);
        unitData.buffList.push(buff);
    }
    buff.lv = Math.min(buff.lv + buffInfo.effect_size, 10);
}

function skillHealSp(turnData, targetNo, addSp, limitSp, usePlaceNo, isRecursion, buffId) {
    let unitData = getUnitData(turnData, targetNo);
    if (unitData.blank) return;
    let unitSp = unitData.sp;
    let minusSp = 0;
    // クレール・ド・リュンヌ(＋)、収穫祭+は消費SPを加味する。
    if (buffId === 120 || buffId === 121 || buffId === 229) {
        minusSp = unitData.spCost;
    }
    unitSp += addSp;
    limitSp = unitData.limitSp > limitSp ? unitData.limitSp : limitSp;
    if (unitSp + unitData.overDriveSp - minusSp > limitSp) {
        unitSp = limitSp - unitData.overDriveSp + minusSp;
    }
    if (unitSp < unitData.sp) {
        unitSp = unitData.sp
    }
    unitData.sp = unitSp;

    if (!isRecursion) {
        // 愛嬌
        if (checkAbilityExist(unitData[`ability_${ABILIRY_TIMING.OTHER}`], 1605) && targetNo !== usePlaceNo) {
            skillHealSp(turnData, targetNo, 3, 30, null, true, 0)
        }
        // お裾分け/エネルギー補給
        if ((checkAbilityExist(unitData[`ability_${ABILIRY_TIMING.OTHER}`], 1606) ||
            checkAbilityExist(unitData[`ability_${ABILIRY_TIMING.OTHER}`], 1612))
            && targetNo !== usePlaceNo) {
            let targetList = getTargetList(turnData, RANGE.ALLY_ALL, 0, targetNo, null);
            targetList.forEach(function (targetNo) {
                skillHealSp(turnData, targetNo, 2, 30, null, true, 0)
            });
        }
        if (targetNo !== usePlaceNo) {
            abilityActionUnit(turnData, ABILIRY_TIMING.HEAL_SP, unitData);
        }
    }
}

function createBuffData(buffInfo, useUnitData) {
    let buff = {};
    buff.buff_kind = buffInfo.buff_kind;
    buff.buff_element = buffInfo.buff_element;
    buff.effect_size = buffInfo.effect_size;
    buff.effect_count = buffInfo.effect_count;
    buff.buff_name = buffInfo.buff_name
    buff.skill_id = buffInfo.skill_id;
    buff.buff_id = buffInfo.buff_id;
    buff.max_power = buffInfo.max_power;
    buff.rest_turn = buffInfo.effect_count === 0 ? -1 : buffInfo.effect_count;
    buff.lv = 0;
    switch (buffInfo.buff_kind) {
        case BUFF.DEFENSEDOWN: // 防御力ダウン
        case BUFF.ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
        case BUFF.FRAGILE: // 脆弱
        case BUFF.DEFENSEDP: // DP防御力ダウン 
            // ダブルリフト
            if (checkAbilityExist(useUnitData[`ability_${ABILIRY_TIMING.OTHER}`], ABILITY_ID.DOUBLE_LIFT)) {
                buff.rest_turn++;
            }
            // ドミネーション・グラビティ
            if (buffInfo.skill_id === SKILL_ID.DOMINATION_GRAVITY) {
                if (useUnitData.useSkillList.filter(value => value === SKILL_ID.DOMINATION_GRAVITY).length >= 3) {
                    buff.rest_turn++;
                }
            }
            break;
        case BUFF.FUNNEL: // 連撃
            buff.effectSum = buffInfo.effect_size * buffInfo.max_power;
            break;
        default:
            break;
    }
    return buff;
}

// 単独発動判定
function isAloneActivation(buffInfo) {
    if (ALONE_ACTIVATION_BUFF_KIND.includes(buffInfo.buff_kind)) {
        return buffInfo.effect_count > 0;
    }
    return false;
}

// 攻撃時にバフ消費
function consumeBuffUnit(turnData, unitData, attackInfo) {
    let consume_kind = [];
    let consume_count = 2
    if (attackInfo.attack_id !== 0) {
        // 連撃消費
        getFunnelList(unitData);
    }
    // バフ消費
    let buffList = unitData.buffList;
    for (let i = buffList.length - 1; i >= 0; i--) {
        let buffInfo = buffList[i];
        const countWithFilter = consume_kind.filter(buff_kind => buff_kind === buffInfo.buff_kind).length;
        if (buffInfo.rest_turn > 0) {
            // 残ターンバフは現状単独発動のみ
            for (let j = 0; j < consume_count; j++) {
                consume_kind.push(buffInfo.buff_kind);
            }
            continue;
        }
        // 同一バフは制限
        if (countWithFilter < consume_count) {
            switch (buffInfo.buff_kind) {
                case BUFF.ELEMENT_ATTACKUP: // 属性攻撃力アップ
                    if (attackInfo.attack_element !== buffInfo.buff_element) {
                        continue;
                    }
                // fallthrough
                case BUFF.ATTACKUP: // 攻撃力アップ
                case BUFF.MINDEYE: // 心眼
                case BUFF.CHARGE: // チャージ
                case BUFF.DAMAGERATEUP: // 破壊率アップ
                case BUFF.ARROWCHERRYBLOSSOMS: // 桜花の矢
                    // スキルでのみ消費
                    if (attackInfo.attack_id === 0) {
                        continue;
                    }
                    if (buffInfo.buff_kind === BUFF.MINDEYE) {
                        // 弱点のみ消費
                        let physical = getCharaData(unitData.style.styleInfo.chara_id).physical;
                        if (!isWeak(turnData.enemyInfo, physical, attackInfo.attack_element, attackInfo.attack_id)) {
                            continue;
                        }
                    }
                    buffList.splice(i, 1);
                    break;
                case BUFF.ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
                case BUFF.ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
                    if (attackInfo.attack_element !== buffInfo.buff_element) {
                        continue;
                    }
                // fallthrough
                case BUFF.CRITICALRATEUP:	// クリティカル率アップ
                case BUFF.CRITICALDAMAGEUP:	// クリティカルダメージアップ
                    // 通常攻撃でも消費
                    buffList.splice(i, 1);
                    break;
                default:
                    // 上記以外のバフ消費しない
                    break;
            }
            consume_kind.push(buffInfo.buff_kind);
        }
    };
}

// バフ名称取得
export function getBuffKindName(buffInfo) {
    let buff_kind_name = "";
    if (buffInfo.buff_element && buffInfo.buff_element !== 0) {
        buff_kind_name = ELEMENT_NAME[buffInfo.buff_element] + "属性";
    }
    let buffKindKbn = common.getBuffKind(buffInfo.buff_kind);
    if (buffKindKbn) {
        buff_kind_name += buffKindKbn.buff_name;
    }
    if (buffInfo.buff_kind === BUFF.FUNNEL || buffInfo.buff_kind === BUFF.ABILITY_FUNNEL) {
        switch (buffInfo.effect_size) {
            case 6:
                buff_kind_name += "(小)";
                break
            case 12:
                buff_kind_name += "(中)";
                break
            case 25:
                buff_kind_name += "(大)";
                break
            case 50:
                buff_kind_name += "(特大)";
                break
            default:
                break;
        }
    }
    return buff_kind_name;
}


// ターゲットリスト追加
function getTargetList(turnData, rangeArea, targetElement, placeNo, buffTargetCharaId) {
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
        case RANGE.SELF_AND_UNIT: // 味方単体
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
            switch (targetElement) {
                case ELEMENT.FIRE: // 火属性
                case ELEMENT.ICE: // 氷属性
                case ELEMENT.THUNDER: // 雷属性
                case ELEMENT.LIGHT: // 光属性
                case ELEMENT.DARK: // 闇属性
                    if (unit.style.styleInfo.element !== targetElement && unit.style.styleInfo.element2 !== targetElement) {
                        targetList.splice(i, 1);
                    }
                    break;
                case ELEMENT.NOT_FIRE: // 火以外
                case ELEMENT.NOT_ICE: // 氷以外
                case ELEMENT.NOT_THUNDER: // 雷以外
                case ELEMENT.NOT_LIGHT: // 光以外
                case ELEMENT.NOT_DARK: // 闇以外
                    let notElement = targetElement - 10;
                    if (unit.style.styleInfo.element === notElement || unit.style.styleInfo.element2 === notElement) {
                        targetList.splice(i, 1);
                    }
                    break;
                default:
                    break;
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
        let attackInfo = getSkillIdToAttackInfo(turnData, skill_id);
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
        item.used = compereUserOperation(item, turnData) <= 0;
    })

    while (compereUserOperation(turnData.userOperation, userOperationList[userOperationList.length - 1]) < 0) {
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
        abilityAction(ABILIRY_TIMING.ADDITIONALTURN, turnData);
    } else {
        let kbAction = turnData.userOperation.kbAction || turnData.userOperation.kb_action;
        if (kbAction === KB_NEXT.ACTION) {
            // 行動開始時
            abilityAction(ABILIRY_TIMING.ACTION_START, turnData);
        }
        let turnProgress = turnProceed(kbAction, turnData);
        turnInit(turnData, turnProgress);
        if (turnProgress) {
            // ターン開始時
            abilityAction(ABILIRY_TIMING.SELF_START, turnData);
        }
    }
    // 毎ターン処理
    abilityAction(ABILIRY_TIMING.EVERY_TURN, turnData);

    setUserOperation(turnData);
}

// ターンごとに初期化
const turnInit = (turnData, turnProgress) => {
    turnData.triggerOverDrive = false;
    turnData.startOverDriveGauge = turnData.overDriveGauge;
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
        unitTurnInit(turnData.additionalTurn, unit);
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

const unitOrderLoop = (func, unitList) => {
    ACTION_ORDER.forEach(function (index) {
        let unit = unitList[index];
        if (!unit.blank) {
            func(unit);
        }
    });
}

// 1:通常戦闘,2:後打ちOD,3:追加ターン
const turnProceed = (kbNext, turn) => {
    let turnProgress = false;
    turn.enemyDebuffList.sort((a, b) => a.buff_kind - b.buff_kind);
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
                    nextTurn(turn);
                }
            }
        } else {
            turnProgress = true;
            nextTurn(turn);
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

const nextTurn = (turn) => {
    // 通常進行
    unitLoop(unitTurnProceed, turn.unitList, turn);

    turn.turnNumber++;
    turn.finishAction = false;
    turn.endDriveTriggerCount = 0;
    abilityAction(ABILIRY_TIMING.RECEIVE_DAMAGE, turn);
    if (turn.turnNumber % turn.stepTurnOverDrive === 0) {
        turn.overDriveGauge += turn.stepOverDriveGauge;
    }
    if (turn.turnNumber === turn.ordinalTurnOverDrive) {
        turn.overDriveGauge += turn.ordinalOverDriveGauge;
    }
    if (turn.overDriveGauge < -300) {
        turn.overDriveGauge = -300;
    }
    if (turn.overDriveGauge > 300) {
        turn.overDriveGauge = 300;
    }
    // 敵のデバフ消費
    debuffConsumption(turn);
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

export const addOverDrive = (add_od_gauge, turn) => {
    turn.overDriveGauge += add_od_gauge;
    if (turn.overDriveGauge > 300) {
        turn.overDriveGauge = 300;
    }
}

export const startOverDrive = (turn, overDriveLevel) => {
    turn.overDriveNumber = 1;
    turn.overDriveMaxTurn = overDriveLevel;
    turn.overDriveGauge = turn.overDriveGauge - overDriveLevel * 100;
    turn.addOverDriveGauge = 0;

    let sp_list = [0, 5, 12, 20];
    unitLoop(function (unit) {
        unit.overDriveSp = sp_list[overDriveLevel];
        unit.overDriveEp = 0;
        unit.spCost = getSpCost(turn, getSkillData(unit.selectSkillId), unit);
    }, turn.unitList);
    abilityAction(ABILIRY_TIMING.OD_START, turn);
    turn.triggerOverDrive = true;
}

export const removeOverDrive = (turn) => {
    turn.overDriveNumber = 0;
    turn.overDriveMaxTurn = 0;
    turn.overDriveGauge = turn.startOverDriveGauge;
    turn.addOverDriveGauge = 0;

    unitLoop(function (unit) {
        unit.overDriveSp = 0;
        unit.overDriveEp = 0;
        unit.spCost = getSpCost(turn, getSkillData(unit.selectSkillId), unit);
    }, turn.unitList);
    turn.triggerOverDrive = false;
}

const debuffConsumption = (turn) => {
    for (let i = turn.enemyDebuffList.length - 1; i >= 0; i--) {
        let debuff = turn.enemyDebuffList[i];
        if (debuff.rest_turn === 1) {
            turn.enemyDebuffList.splice(i, 1);
        } else {
            debuff.rest_turn -= 1;
        }
    }
}

export const abilityAction = (actionKbn, turn) => {
    unitOrderLoop(function (unit) {
        if (actionKbn === ABILIRY_TIMING.ADDITIONALTURN && !unit.additionalTurn) {
            return;
        }
        abilityActionUnit(turn, actionKbn, unit);
    }, turn.unitList);
}

/** TurnDataここまで */

/** UnitDataここから */
const unitTurnInit = (additionalTurn, unit) => {
    unit.spCostDown = 0;
    unit.spCostUp = 0;
    unit.buffEffectSelectType = 0;
    if (!additionalTurn || unit.additionalTurn) {
        setInitSkill(unit);
    } else {
        unit.selectSkillId = SKILL.NONE;
    }
}

const unitTurnProceed = (unit, turn) => {
    buffSort(unit);
    if (unit.nextTurnMinSp > 0) {
        if (unit.nextTurnMinSp > unit.sp) {
            unit.sp = unit.nextTurnMinSp;
            unit.nextTurnMinSp = -1
        }
    }
    if (unit.sp < unit.limitSp) {
        unit.sp += 2;
        if ((turn.turnNumber + 1) % turn.stepTurnSp === 0) {
            unit.sp += turn.stepSpAllAdd;
            if (unit.placeNo < 3) {
                unit.sp += turn.stepSpFrontAdd;
            } else {
                unit.sp += turn.stepSpBackAdd;
            }
        }
        if ((turn.turnNumber + 1) === turn.ordinalTurnSp) {
            unit.sp += turn.ordinalSpAllAdd;
            if (unit.placeNo < 3) {
                unit.sp += turn.ordinalSpFrontAdd;
            } else {
                unit.sp += turn.ordinalSpBackAdd;
            }
        }
        if (unit.sp > unit.limitSp) {
            unit.sp = unit.limitSp
        }
    }
}

// 対象数判定
function targetCountInclude(turnData, targetElement) {
    let count = 0;
    unitLoop(function (unit) {
        if (unit.style.styleInfo.element === targetElement || unit.style.styleInfo.element2 === targetElement) {
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
            unit.selectSkillId = SKILL.AUTO_PURSUIT;
        } else {
            unit.selectSkillId = SKILL.NONE;
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
        if (!turnProgress) {
            // 単独発動と行動不能
            if (isAloneActivation(buffInfo) || buffInfo.buff_kind === BUFF.RECOIL) {
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

const buffSort = (unit) => {
    unit.buffList.sort((a, b) => {
        if (a.buff_kind === b.buff_kind) {
            return a.effect_size - b.effect_size;
        }
        return a.buff_kind - b.buff_kind;
    });
}

const payCost = (unit, skill) => {
    // OD上限突破
    if (unit.sp + unit.overDriveSp > 99) {
        unit.sp = 99 - unit.overDriveSp;
    }
    if (skill.cost_type === COST_TYPE.EP) {
        unit.ep -= skill.use_cost;
    } else {
        // SPは可変なので計算済みの値を使用
        unit.sp -= unit.spCost;
        unit.spCost = 0;
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

const getFunnelList = (unit) => {
    let ret = [];
    let buffFunnelList = unit.buffList.filter(function (buffInfo) {
        return BUFF.FUNNEL === buffInfo.buff_kind && !isAloneActivation(buffInfo);
    });
    let buffUnitFunnelList = unit.buffList.filter(function (buffInfo) {
        return BUFF.FUNNEL === buffInfo.buff_kind && isAloneActivation(buffInfo);
    });
    let abilityList = unit.buffList.filter(function (buffInfo) {
        return BUFF.ABILITY_FUNNEL === buffInfo.buff_kind;
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
    let buff_total = buffFunnelList.slice(0, 2).reduce(function (sum, element) {
        return sum + element["effectSum"];
    }, 0);
    let buff_unit_total = buffUnitFunnelList.slice(0, 1).reduce(function (sum, element) {
        return sum + element["effectSum"];
    }, 0);
    if (buff_total <= buff_unit_total) {
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
        for (let i = 0; i < item.max_power; i++) {
            resultList.push(item.effect_size);
        }
        item.useFunnel = true;
    });
    // 使用後にリストから削除
    unit.buffList = unit.buffList.filter(function (item) {
        return !item.useFunnel || isAloneActivation(item) || item.always;
    })
    return resultList;
}

const abilityActionUnit = (turnData, actionKbn, unit) => {
    let actionList = unit[`ability_${actionKbn}`];
    // 被ダメージ時
    if (actionKbn === ABILIRY_TIMING.RECEIVE_DAMAGE) {
        // 前衛のみ
        if (unit.placeNo >= 3) {
            actionList = [];
        }
    }
    actionList.forEach((ability, index) => {
        // 前衛
        if (ability.activation_place === 1 && unit.placeNo >= 3) {
            return true;
        }
        // 後衛
        if (ability.activation_place === 2 && unit.placeNo < 3) {
            return true;
        }
        let targetList = getTargetList(turnData, ability.range_area, ability.target_element, unit.placeNo, null);
        let buff;
        if (!judgmentCondition(Number(ability.conditions), ability.conditions_id, turnData, unit, null)) {
            return true;
        }
        // 対象がバフを所持
        if (Number(ability.conditions) === CONDITIONS.HAS_BUFF_TARGET) {
            targetList = targetList.filter(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                return checkBuffExist(unitData.buffList, ability.conditions_id);
            });
        }
        switch (ability.conditions) {
            case "火属性フィールド":
                if (turnData.field !== FIELD.FIRE) {
                    return;
                }
                break;
            case "SP0以下":
                if (unit.sp > 0) {
                    return;
                }
                break;
            case "OD100%未満":
                if (turnData.overDriveGauge >= 100) {
                    return;
                }
                break;
            case "OD0%未満":
                if (turnData.overDriveGauge >= 0) {
                    return;
                }
                break;
            case "ODゲージ使用":
                let list = getBuffList(unit.selectSkillId)
                    .filter(skill => skill.buff_kind === BUFF.OVERDRIVEPOINTUP)
                    .filter(skill => skill.min_power < 0);
                if (list.length === 0) {
                    return;
                }
                break;
            case "破壊率が200%以上":
            case "トークン4つ以上":
            case "敵のバフ解除":
            case "ブレイク中":
                return;
            case CONDITIONS.FIELD_ELEMENT: // フィールド属性
                if (!judgmentCondition(ability.conditions, ability.conditions_id, turnData, unit, null)) {
                    return true;
                }
                break;
            default:
                break;
        }
        let effectDesc = "";
        let name = ability.ability_name || ability.passive_name;
        switch (ability.effect_type) {
            case EFFECT.FUNNEL: // 連撃数アップ
            case EFFECT.FUNNEL_ALWAYS: // 連撃数(永続)アップ
                buff = {};
                buff.buff_kind = BUFF.ABILITY_FUNNEL;
                buff.buff_name = name;
                buff.buff_element = 0;
                buff.max_power = ability.effect_count;
                buff.effect_size = ability.effect_size;
                buff.effectSum = ability.effect_size * ability.effect_count;
                buff.rest_turn = -1;
                if (ability.effect_type === EFFECT.FUNNEL_ALWAYS) {
                    buff.always = true;
                }
                unit.buffList.push(buff);
                effectDesc = "連撃数アップ";
                break;
            case EFFECT.OVERDRIVE_SP: // ODSPアップ
                targetList.forEach(function (target_no) {
                    let unitData = getUnitData(turnData, target_no);
                    unitData.overDriveSp += ability.effect_size;
                });
                effectDesc = `OD時SPアップ${ability.effect_size}`;
                break;
            case EFFECT.OVERDRIVE_EP: // ODEPアップ
                targetList.forEach(function (target_no) {
                    let unitData = getUnitData(turnData, target_no);
                    if (unitData.ep + ability.effect_size > 20) {
                        unitData.overDriveEp = 20 - unitData.ep;
                    } else {
                        unitData.overDriveEp += ability.effect_size;
                    }
                });
                effectDesc = `OD時EPアップ${ability.effect_size}`;
                break;
            case EFFECT.HEALSP: // SP回復
                // 戦場の華,猛火の進撃,氷嵐の進撃
                const onlyUseSpList = [1528, 1023, 1031]
                if (ability.used && onlyUseSpList.includes(ability.ability_id)) {
                    return;
                }
                ability.used = true;
                targetList.forEach(function (target_no) {
                    let unitData = getUnitData(turnData, target_no);
                    if (unitData.sp + unitData.overDriveSp < unitData.limitSp) {
                        if (ability.ability_id) {
                            switch (ability.ability_id) {
                                case 1109: // 吉報
                                case 1119: // 旺盛
                                case 1213: // 絶好調女
                                case 1214: // 怪童
                                    unitData.addSp += ability.effect_size;
                                    break;
                                case 1112: // 好機
                                    if (unitData.sp <= 3) {
                                        unitData.sp += ability.effect_size;
                                    }
                                    break;
                                default:
                                    unitData.sp += ability.effect_size;
                                    break;
                            }
                        }
                        if (ability.skill_id) {
                            switch (ability.skill_id) {
                                case constants.SKILL_ID.GOOD_PAIN: // 痛気持ちいぃ～！
                                    unitData.addSp += ability.effect_size;
                                    break;
                                default:
                                    unitData.sp += ability.effect_size;
                                    break;
                            }
                        }
                        if (unitData.sp + unitData.overDriveSp > unitData.limitSp) {
                            unitData.sp = unitData.limitSp - unitData.overDriveSp;
                        }
                    }
                });
                effectDesc = `SP+${ability.effect_size}`;
                break;
            case EFFECT.HEALEP: // EP回復
                let maxEp = Math.max(10, unit.ep + unit.overDriveEp);
                if (checkAbilityExist(unit[`ability_${ABILIRY_TIMING.OD_START}`], ABILITY_ID.OVER_GEAR) && turnData.overDriveNumber > 0) {
                    maxEp = 20;
                }
                if (unit.ep < maxEp) {
                    unit.ep += ability.effect_size;
                    if (unit.ep > maxEp) {
                        unit.ep = maxEp;
                    }
                }
                effectDesc = `EP+${ability.effect_size}`;
                break;
            case EFFECT.MORALE: // 士気
                targetList.forEach(function (target_no) {
                    let unitData = getUnitData(turnData, target_no);
                    if (!unitData.style) {
                        return true;
                    }
                    let buffInfo = {
                        buff_kind: BUFF.MORALE,
                        buff_name: ability.ability_name,
                        effect_size: ability.effect_size,
                    };
                    addMoraleBuffUnit(unitData, buffInfo, null)
                });
                effectDesc = `士気+${ability.effect_size}`;
                break;
            case EFFECT.OVERDRIVEPOINTUP: // ODアップ
                const onlyUseList = [ABILITY_ID.V_RECOVERY, ABILITY_ID.CONQUER_WORLD, ABILITY_ID.GREAT_OFFENSIVE]
                if (ability.used && onlyUseList.includes(ability.ability_id)) {
                    return;
                }
                ability.used = true;
                turnData.overDriveGauge += ability.effect_size;
                if (turnData.overDriveGauge > 300) {
                    turnData.overDriveGauge = 300;
                }
                effectDesc = `OverDriveゲージ+${ability.effect_size}`;
                break;
            case EFFECT.GRANT_BUFF: // バフ付与
                addAbilityBuffUnit(ability.effect_no, name, ability.effect_count, targetList, turnData)
                let buffKind = common.getBuffKind(ability.effect_no);
                effectDesc = `${buffKind.buff_name}を付与`;
                break;
            // case EFFECT.YAMAWAKI_SERVANT: // 山脇様のしもべ
            //     // レゾナンス用
            //     addAbilityBuffUnit(BUFF.YAMAWAKI_SERVANT, ability.ability_name, -1, targetList, turnData)
            //     effectDesc = `山脇様のしもべを付与`;
            //     break;
            case EFFECT.SP_LIMIT_UP: // SP上限アップ
                targetList.forEach(function (target_no) {
                    let unit = getUnitData(turnData, target_no);
                    unit.limitSp = ability.effect_size;
                })
                effectDesc = `SP上限${ability.effect_size}にアップ`;
                break;
            case EFFECT.FIELD_DEPLOYMENT: // フィールド
                if (ability.element) {
                    turnData.field = ability.element;
                } else if (ability.skill_id === constants.SKILL_ID.RICE_FIELD) {
                    // いつの日かここで
                    turnData.field = FIELD.RICE;
                }
                effectDesc = `${ELEMENT_NAME[ability.element]}属性フィールド`;
                break;
            case EFFECT.ADDITIONALTURN: // 追加ターン
                if (turnData.additionalCount === 0) {
                    unit.additionalTurn = true;
                    turnData.additionalTurn = true;
                }
                effectDesc = `追加ターン`;
                break;
            case EFFECT.COST_SP_DOWN: // SPコストダウン
                targetList.forEach(function (target_no) {
                    let unitData = getUnitData(turnData, target_no);
                    if (checkTargetElment(unitData, ability.target_element)) {
                        unitData.spCostDown = Math.max(unitData.spCostDown, ability.effect_size);
                    }
                });
                effectDesc = `消費SP-${ability.effect_size}`;
                break;
            case EFFECT.COST_SP_UP: // SPコストアップ
                targetList.forEach(function (target_no) {
                    let unitData = getUnitData(turnData, target_no);
                    if (checkTargetElment(unitData, ability.target_element)) {
                        unitData.spCostUp = Math.max(unitData.spCostUp, ability.effect_size);
                    }
                });
                effectDesc = `消費SP+${ability.effect_size}`;
                break;
            default:
                break;
        }
        if (effectDesc) {
            let abilityName = ability.ability_name || ability.passive_name;
            let rangeName = getRangeName(ability.range_area);
            let charaName = getCharaData(unit.style.styleInfo.chara_id).chara_short_name;
            let conditionName = getConditionName(ability.target_element, ability.conditions, Number(ability.conditions_id));
            let log = `${charaName}：${abilityName}(${conditionName}${effectDesc})が発動`;
            if (rangeName) {
                log = `${charaName}：${abilityName}(${conditionName}${rangeName}に${effectDesc})が発動`;
            }
            turnData.setLog(log);
            let nameList = targetList.map(function (target_no) {
                let unitData = getUnitData(turnData, target_no);
                return getCharaData(unitData.style.styleInfo.chara_id).chara_short_name;
            });
            if (nameList.length > 0) {
                log = `　対象：${nameList.join(", ")}`;
                turnData.setLog(log);
            }
        }
    });
}

// 範囲の名称を取得
const getRangeName = (rangeArea) => {
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


// 条件の名称を取得
const getConditionName = (targetElement, conditions, conditionsId) => {
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
        case CONDITIONS.SARVANT_OVER:
            return `山脇様のしもべ${conditionsId}人以上の時`;
        case CONDITIONS.HAS_BUFF_TARGET:
            return `${common.getBuffKind(conditionsId).buff_name}発動中の`;
        case CONDITIONS.HAS_BUFF:
            return `${common.getBuffKind(conditionsId).buff_name}状態の時`;
        case CONDITIONS.FIELD_ELEMENT:
            return `属性フィールド展開中の時`;
        case CONDITIONS.SP_UNDER:
            return `SPが${conditionsId}以下の時`;
        default:
            return conditions;
    }
}

export const checkTargetElment = (unit, targetElement) => {
    if (targetElement === 0) {
        return true;
    }
    return unit.style?.styleInfo?.element === targetElement || unit.style?.styleInfo?.element2 === targetElement;
}

function addAbilityBuffUnit(buff_kind, ability_name, rest_turn, targetList, turnData) {
    targetList.forEach(function (target_no) {
        let unit = getUnitData(turnData, target_no);
        let buff = {};
        buff.buff_kind = buff_kind;
        buff.buff_element = 0;
        buff.rest_turn = rest_turn;
        buff.buff_name = ability_name;
        unit.buffList.push(buff);
    })
}
/** UnitDataここまで */
