
import { ROLE, BUFF } from "utils/const";
import * as constants from "utils/const";
import * as common from "utils/common";
import { ABILIRY_TIMING, NOT_USE_STYLE, CONSTRAINTS_ABILITY, CONSTRAINTS_PASSIVE } from "./const";
import { checkPassiveExist, setUserOperation } from "./logic";
import skillList from "data/skillList";
import * as logicAbility from "./logicAbility.js";

// 戦闘初期データ作成
export const getInitBattleData = (selectStyleList, enemyInfo, saveStyle, detailSetting, setConstraintsAbility, setConstraintsPassive) => {
    // 初期データ作成
    let turnInit = {
        turnNumber: 0,
        seqTurn: -1,
        overDriveNumber: 0,
        endDriveTriggerCount: 0,
        overDriveMaxTurn: 0,
        triggerOverDrive: false,
        additionalTurn: false,
        additionalCount: 0,
        enemyDebuffList: [],
        unitList: [],
        startOverDriveGauge: 0,
        stepOverDriveGauge: 0,
        maxOverDriveGauge: 300,
        overDriveGauge: 0,
        calcOverDriveGauge: 0,
        overDriveGaugeMultiplier: 100,
        enemyCount: 1,
        finishAction: false,
        field: 0,
        fieldTurn: 0,
        transcendGauge: 0,
        transcendElement: 0,
        camp: 0,
        userOperation: {},
        log: [],
        setLog: function (msg) {
            this.log.push(msg);
        },
    }
    let unitList = [];
    let constraintsAbility = [];
    let constraintsPassive = [];

    let initSpAdd = Number(detailSetting.initSpAdd);
    // スタイル情報を作成
    selectStyleList.forEach((member, index) => {
        if (index >= 6) {
            return false;
        }
        let unit = {
            placeNo: 99,
            sp: 1,
            ep: 0,
            token: 0,
            overDriveSp: 0,
            overDriveEp: 0,
            addSp: 0,
            spCost: 0,
            buffList: [],
            additionalTurn: false,
            normalAttackElement: 0,
            earringEffectSize: 0,
            skillList: [],
            passiveSkillList: [],
            blank: false,
            useSkillList: [],
            buffTargetCharaId: null,
            buffEffectSelectType: 0,
            spCostDown: 0,
            spCostUp: 0,
            overDriveRateUp: 0,
            nextTurnMinSp: -1,
            selectSkillId: 0,
            initSkillId: 0,
            noAction: false,
            immersion: 0, // 没入
            limitSp: 20,
        };
        unit.placeNo = index;
        if (member) {
            saveStyle(member);

            unit.style = common.deepClone(member);
            unit.sp = member.initSp;
            unit.sp += member.chain + initSpAdd;
            unit.normalAttackElement = member.bracelet;
            unit.earringEffectSize = member.earring;
            unit.skillList = skillList.filter(obj =>
                (obj.chara_id === member.styleInfo.chara_id || obj.chara_id === 0) &&
                (obj.style_id === member.styleInfo.style_id || obj.style_id === 0) &&
                obj.skill_active === 0 &&
                !member.exclusionSkillList.includes(obj.skill_id)
            ).map(obj => {
                const copiedObj = common.deepClone(obj);
                if (copiedObj.chara_id === 0) {
                    copiedObj.chara_id = member.styleInfo.chara_id;
                }
                return copiedObj;
            });
            unit.passiveSkillList = skillList.filter(obj =>
                (obj.chara_id === member.styleInfo.chara_id || obj.chara_id === 0) &&
                (obj.style_id === member.styleInfo.style_id || obj.style_id === 0) &&
                obj.skill_active === 1 &&
                !member.exclusionSkillList.includes(obj.skill_id)
            )
            if (unit.style.styleInfo.role === ROLE.ADMIRAL) {
                unit.initSkillId = 4; // 指揮行動
            } else {
                unit.initSkillId = 1; // 通常攻撃
            }
            // 曙
            if (checkPassiveExist(unit.passiveSkillList, constants.SKILL_ID.DAWN)) {
                unit.normalAttackElement = 4;
            }
            // アビリティ設定
            Object.values(ABILIRY_TIMING).forEach(timing => {
                unit[`ability_${timing}`] = [];
            });

            // パッシブスキル設定(アビリティより優先)
            unit.passiveSkillList.forEach(skill => {
                if (CONSTRAINTS_PASSIVE.includes(skill.skill_id)) {
                    constraintsPassive.push(skill.skill_id);
                }
                let passiveInfo = common.getPassiveInfo(skill.skill_id);
                if (!passiveInfo) {
                    return;
                }
                let passiveList = common.getPassiveEffectList(skill.skill_id);
                passiveList.forEach(passiveEffect => {
                    passiveEffect = {
                        ...passiveEffect,
                        ...passiveInfo
                    };
                    unit[`ability_${passiveEffect.activation_timing}`].push(passiveEffect);
                });
            });

            let abilitylimitList = ["_orgn", "0", "00", "000", "1", "3", "4", "5", "10"];
            if (member.limitCount === 2) {
                abilitylimitList = ["_orgn", "0", "00", "000", "1", "2"];
            }
            abilitylimitList.forEach(numStr => {
                let num = parseInt(numStr, 10);
                if (!num) {
                    num = 0;
                }
                if (member.styleInfo[`ability${numStr}`] && num <= member.limitCount) {
                    let abilityId = member.styleInfo[`ability${numStr}`];
                    if (CONSTRAINTS_ABILITY.includes(abilityId)) {
                        constraintsAbility.push(abilityId);
                    }
                    let abilityInfo = common.getAbilityInfo(member.styleInfo[`ability${numStr}`]);
                    if (!abilityInfo) {
                        return;
                    }
                    if (numStr === "_orgn") {
                        // 超越ゲージ
                        const targetElement = member.styleInfo.element;
                        turnInit.transcendElement = targetElement;
                        const targetList = selectStyleList.filter((member) => {
                            return common.checkElement(member?.styleInfo.element, targetElement) || common.checkElement(member?.styleInfo.element2, targetElement);
                        });
                        turnInit.transcendGauge = targetList.length * 15;
                    }
                    let abilityList = common.getAbilityEffectList(abilityId);
                    abilityList.forEach(abilityEffect => {
                        abilityEffect = {
                            ...abilityEffect,
                            ...abilityInfo
                        };
                        unit[`ability_${abilityEffect.activation_timing}`].push(abilityEffect);
                    });
                }
            });

            // レゾナンス判定
            if (member.styleInfo.resonance === 1 && member.supportStyleId) {
                const support = member.support;
                if (support?.styleInfo.ability_resonance) {
                    let resonanceInfo = common.getResonanceInfo(support.styleInfo.ability_resonance);
                    let resonanceList = common.getResonanceEffectList(support.styleInfo.ability_resonance);
                    for (let resonanceEffect of resonanceList) {
                        if (resonanceEffect.activation_timing !== undefined) {
                            const resonance = common.deepClone(resonanceEffect);
                            resonance.ability_name = resonanceInfo.resonance_name;
                            resonance.element = constants.ELEMENT.NORMAL;
                            resonance.range_area = constants.RANGE.SELF;
                            resonance.effect_size = resonanceEffect[`effect_limit_${support.limitCount}`];
                            unit[`ability_${resonanceEffect.activation_timing}`].push(resonance);
                        }
                    }
                }
            }

            unit[`ability_${ABILIRY_TIMING.PASSIVE}`].forEach(abilityEffect => {
                if (abilityEffect.effect_type === constants.EFFECT.OVERDRIVE_RATE_UP) {
                    unit.overDriveRateUp += abilityEffect.effect_size;
                }
            });
            if (member.morale > 0) {
                let morale = {
                    buff_no: BUFF.MORALE,
                    element: 0,
                    rest_turn: 0,
                    lv: member.morale,
                    buff_name: "初期設定",
                }
                unit.buffList.push(morale);
            }
        } else {
            unit.blank = true;
        }
        unitList.push(unit);
    });

    // 初期設定を読み込み
    turnInit.field = Number(detailSetting.initField);
    if (turnInit.field > 0) {
        turnInit.fieldTurn = -1;
    }
    turnInit.overDriveGauge = Number(detailSetting.initOverDrive);
    assignNumberProperties(turnInit, detailSetting);
    turnInit.enemyCount = Number(enemyInfo.enemy_count);
    turnInit.unitList = unitList;
    const newEnemyInfo = { ...enemyInfo };
    for (let i = 0; i <= 5; i++) {
        newEnemyInfo[`element_${i}`] += Number(detailSetting[`changeElement${i}`]);
    }
    turnInit.enemyInfo = newEnemyInfo;
    // ODゲージの最大値を計算
    if (newEnemyInfo.enemy_class === constants.ENEMY_CLASS.SCORE_ATTACK_EX) {
        turnInit.maxOverDriveGauge = 500;
    }
    // 戦闘開始アビリティ
    turnInit.setLog("■戦闘開始");
    logicAbility.abilityAction(ABILIRY_TIMING.BATTLE_START, turnInit);
    setUserOperation(turnInit);

    setConstraintsAbility(constraintsAbility);
    setConstraintsPassive(constraintsPassive);
    return turnInit;
}

const assignNumberProperties = (turnInit, detailSetting) => {
    const TURN_INIT_KEYS = [
        'initOverDrive',
        'stepTurnOverDrive',
        'stepOverDriveGauge',
        'stepTurnSp',
        'stepSpFrontAdd',
        'stepSpBackAdd',
        'stepSpAllAdd',
        'ordinalTurnOverDrive',
        'ordinalOverDriveGauge',
        'ordinalTurnSp',
        'ordinalSpFrontAdd',
        'ordinalSpBackAdd',
        'ordinalSpAllAdd',
        'overDriveGaugeMultiplier'
    ];
    TURN_INIT_KEYS.forEach(key => {
        turnInit[key] = Number(detailSetting[key]);
    });
}

export const checkStartBattle = (styleList) => {
    for (let i = 0; i < styleList.selectStyleList.length; i++) {
        let style = styleList.selectStyleList[i]?.styleInfo;
        if (NOT_USE_STYLE.includes(style?.style_id)) {
            let chara_data = common.getCharaData(style.chara_id);
            alert(`[${style.style_name}]${chara_data.chara_name}は現在使用できません。`);
            return false;
        }
    };
    // 後衛が居る場合、前衛に空き不可
    const hasBlankFront = styleList.selectStyleList.some(function (style, index) {
        return style === undefined && index <= 2
    });
    const hasBack = styleList.selectStyleList.some(function (style, index) {
        return style !== undefined && index >= 3
    });
    if (hasBlankFront && hasBack) {
        alert("後衛がいるとき 前衛には3名必要です。");
        return false;
    }

    const countAdmiral = styleList.selectStyleList.filter(function (style, index) {
        return style?.styleInfo?.role === ROLE.ADMIRAL
    }).length;
    if (countAdmiral > 1) {
        alert("アドミラルは部隊に1人のみ設定可能です。");
        return false;
    }
    return true;
}
