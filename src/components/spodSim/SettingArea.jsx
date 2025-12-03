
import React, { useState } from "react";
import ReactModal from "react-modal";
import { ROLE, BUFF, RANGE } from "utils/const";
import { ABILIRY_TIMING, NOT_USE_STYLE, CONSTRAINTS_ABILITY, CONSTRAINTS_PASSIVE } from "./const";
import { checkPassiveExist, recreateTurnData, initTurn, abilityAction, setUserOperation } from "./logic";
import { getCharaData, getEnemyInfo, getPassiveInfo, getAbilityInfo, getResonanceInfo, deepClone } from "utils/common";
import { useStyleList } from "components/StyleListProvider";
import skillList from "data/skillList";
import CharaSetting from "./CharaSetting";
import EnemyArea from "./EnemyArea";
import DetailSetting from "./DetailSetting";
import ConstraintsList from "./ConstraintsList";
import ModalExplanation from "./ModalExplanation";
import BattleArea from "./BattleArea";

// リスト更新用のReducer
const reducer = (state, action) => {
    switch (action.type) {
        case "INIT_TURN_LIST":
            return {
                ...state,
                turnList: action.turnList
            };

        case "ADD_TURN_LIST":
            return {
                ...state,
                turnList: [...state.turnList, action.payload]
            };

        case "DEL_TURN_LIST": {
            return {
                ...state,
                turnList: state.turnList.slice(0, action.payload + 1),
            };
        }
        case "UPD_TURN_LIST": {
            // 最終ターンの情報
            const userOperationList = state.turnList.map(turn => turn.userOperation);
            let turnData = state.turnList[action.payload];
            let turnLsit = state.turnList.slice(0, action.payload + 1)
            recreateTurnData(turnLsit, turnData, userOperationList, false);

            return {
                ...state,
                turnList: turnLsit,
            };
        }
        case "UPDATE_TURN":
            let turnList = [...state.turnList];
            turnList[action.payload] = deepClone(action.turnData);
            return {
                ...state,
                turnList: turnList
            };
        default:
            return state;
    }
};

// 戦闘初期データ作成
function getInitBattleData(selectStyleList, enemyInfo, saveStyle, detailSetting, setConstraintsAbility, setConstraintsPassive) {
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
        overDriveGauge: 0,
        addOverDriveGauge: 0,
        enemyCount: 1,
        finishAction: false,
        field: 0,
        fieldTurn: 0,
        userOperation: {}
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
            overDriveSp: 0,
            addSp: 0,
            sp_cost: 0,
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
            nextTurnMinSp: -1,
            selectSkillId: 0,
            initSkillId: 0,
            noAction: false,
            limitSp: 20,
        };
        unit.placeNo = index;
        if (member) {
            saveStyle(member);

            unit.style = deepClone(member);
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
                const copiedObj = deepClone(obj);
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
            if (checkPassiveExist(unit.passiveSkillList, 606)) {
                unit.normalAttackElement = 4;
            }
            // アビリティ設定
            Object.values(ABILIRY_TIMING).forEach(timing => {
                unit[`ability_${timing}`] = [];
            });
            ["0", "00", "1", "3", "4", "5", "10"].forEach(numStr => {
                const num = parseInt(numStr, 10);
                if (member.styleInfo[`ability${numStr}`] && num <= member.limitCount) {
                    let abilityInfo = getAbilityInfo(member.styleInfo[`ability${numStr}`]);
                    if (!abilityInfo) {
                        return;
                    }
                    if (CONSTRAINTS_ABILITY.includes(abilityInfo.ability_id)) {
                        constraintsAbility.push(abilityInfo.ability_id);
                    }
                    unit[`ability_${abilityInfo.activation_timing}`].push(abilityInfo);
                }
            });
            unit.passiveSkillList.forEach(skill => {
                let passiveInfo = getPassiveInfo(skill.skill_id);
                if (!passiveInfo) {
                    return;
                }
                if (CONSTRAINTS_PASSIVE.includes(skill.skill_id)) {
                    constraintsPassive.push(skill.skill_id);
                }
                unit[`ability_${passiveInfo.activation_timing}`].push(passiveInfo);
            });
            // レゾナンス判定
            if ((member.styleInfo.rarity === 0 || member.styleInfo.rarity === 9) && member.supportStyleId) {
                const support = member.support;
                if (support?.styleInfo.ability_resonance) {
                    const resonance = deepClone(getResonanceInfo(support.styleInfo.ability_resonance));
                    if (resonance.activation_timing !== null) {
                        resonance.ability_name = resonance.resonance_name;
                        resonance.range_area = RANGE.SELF;
                        resonance.effect_size = resonance[`effect_limit_${support.limitCount}`];
                        unit[`ability_${resonance.activation_timing}`].push(resonance);
                    }
                }
            }
            if (member.morale > 0) {
                let morale = {
                    buff_kind: BUFF.MORALE,
                    buff_element: 0,
                    rest_turn: -1,
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
    turnInit.stepTurnOverDrive = Number(detailSetting.stepTurnOverDrive);
    turnInit.stepOverDriveGauge = Number(detailSetting.stepOverDriveGauge);
    turnInit.stepTurnSp = Number(detailSetting.stepTurnSp);
    turnInit.stepSpFrontAdd = Number(detailSetting.stepSpFrontAdd);
    turnInit.stepSpBackAdd = Number(detailSetting.stepSpBackAdd);
    turnInit.stepSpAllAdd = Number(detailSetting.stepSpAllAdd);
    turnInit.ordinalTurnOverDrive = Number(detailSetting.ordinalTurnOverDrive);
    turnInit.ordinalOverDriveGauge = Number(detailSetting.ordinalOverDriveGauge);
    turnInit.ordinalTurnSp = Number(detailSetting.ordinalTurnSp);
    turnInit.ordinalSpFrontAdd = Number(detailSetting.ordinalSpFrontAdd);
    turnInit.ordinalSpBackAdd = Number(detailSetting.ordinalSpBackAdd);
    turnInit.ordinalSpAllAdd = Number(detailSetting.ordinalSpAllAdd);

    turnInit.enemyCount = Number(enemyInfo.enemy_count);
    turnInit.unitList = unitList;
    turnInit.enemyInfo = enemyInfo;
    // 戦闘開始アビリティ
    abilityAction(ABILIRY_TIMING.BATTLE_START, turnInit);
    setUserOperation(turnInit);

    setConstraintsAbility(constraintsAbility);
    setConstraintsPassive(constraintsPassive);
    return turnInit;
}

const checkStartBattle = (styleList) => {
    for (let i = 0; i < styleList.selectStyleList.length; i++) {
        let style = styleList.selectStyleList[i]?.styleInfo;
        if (NOT_USE_STYLE.includes(style?.style_id)) {
            let chara_data = getCharaData(style.chara_id);
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

const SettingArea = ({ enemyClass, enemySelect, setEnemyClass, setEnemySelect }) => {
    const { styleList, setStyleList, saveStyle, loadMember } = useStyleList();

    const [hideMode, setHideMode] = React.useState(false);
    const [settingUpdate, setSettingUpdate] = React.useState(false);

    const [simProc, dispatch] = React.useReducer(reducer, {
        turnList: [],
        enemyInfo: {}
    });
    let enemyInfo = getEnemyInfo(enemyClass, enemySelect);

    // 戦闘開始前処理
    const startBattle = (update, setUpdate, setConstraintsAbility, setConstraintsPassive) => {
        if (!checkStartBattle(styleList)) {
            return;
        }

        /** 戦闘開始処理 */
        // 初期データ作成
        let turnInit = getInitBattleData(
            styleList.selectStyleList, enemyInfo, saveStyle, detailSetting, setConstraintsAbility, setConstraintsPassive);
        // 制約事項更新
        setUpdate(update + 1);
        // 初期処理
        initTurn(turnInit, true);
        let turnList = [turnInit];
        dispatch({ type: "INIT_TURN_LIST", turnList: turnList });
        setSettingUpdate(true);
    };

    // 戦闘開始前処理
    const restartBattle = (update, setUpdate, setConstraintsAbility, setConstraintsPassive) => {
        if (!checkStartBattle(styleList)) {
            return;
        }

        /** 戦闘開始処理 */
        const userOperationList = simProc.turnList.map(turn => turn.userOperation);
        // 初期データ作成
        let turnInit = getInitBattleData(
            styleList.selectStyleList, enemyInfo, saveStyle, detailSetting, setConstraintsAbility, setConstraintsPassive);
        // 制約事項更新
        setUpdate(update + 1);
        let turnList = [];
        recreateTurnData(turnList, turnInit, userOperationList, true);
        // 画面反映
        dispatch({ type: "INIT_TURN_LIST", turnList: turnList });
    };

    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);
    const [update, setUpdate] = useState(0);
    const [constraintsAbility, setConstraintsAbility] = useState([]);
    const [constraintsPassive, setConstraintsPassive] = useState([]);

    const loadData = (saveData, key, setKey) => {
        // 部隊情報上書き
        const updatedStyleList = [...styleList.selectStyleList];
        saveData.unitDataList.forEach((unitData, index) => {
            if (unitData) {
                let memberInfo = loadMember(unitData.style_id);
                // メンバー情報作成
                memberInfo.limitCount = unitData.limitCount;
                memberInfo.earring = unitData.earring;
                memberInfo.bracelet = unitData.bracelet;
                memberInfo.chain = unitData.chain;
                memberInfo.initSp = unitData.initSp;
                memberInfo.morale = unitData.morale;
                memberInfo.supportStyleId = unitData.supportStyleId;
                memberInfo.exclusionSkillList = unitData.exclusionSkillList || unitData.exclusion_skill_list;
                updatedStyleList[index] = memberInfo;
            } else {
                updatedStyleList[index] = undefined;
            }
        })
        setStyleList({ ...styleList, selectStyleList: updatedStyleList });
        // 初期データ作成
        let turnInit = getInitBattleData(
            updatedStyleList, enemyInfo, saveStyle, detailSetting, setConstraintsAbility, setConstraintsPassive);
        // 制約事項更新
        setKey(key + 1);
        let turnList = [];
        recreateTurnData(turnList, turnInit, saveData.userOperationList, true);
        // 画面反映
        dispatch({ type: "INIT_TURN_LIST", turnList: turnList });
    }

    const [detailSetting, setDetailSetting] = React.useState({
        initField: 0,
        initOverDrive: 0,
        initSpAdd: 0,
        changeElement0: 0,
        changeElement1: 0,
        changeElement2: 0,
        changeElement3: 0,
        changeElement4: 0,
        changeElement5: 0,
        stepTurnOverDrive: 1,
        stepOverDriveGauge: 0,
        stepTurnSp: 1,
        stepSpAllAdd: 0,
        stepSpFrontAdd: 0,
        stepSpBackAdd: 0,
        ordinalTurnOverDrive: 1,
        ordinalOverDriveGauge: 0,
        ordinalTurnSp: 1,
        ordinalSpAllAdd: 0,
        ordinalSpFrontAdd: 0,
        ordinalSpBackAdd: 0,
    });

    return (
        <>
            {
                hideMode ?
                    null
                    :
                    <div className="setting_area">
                        <div className="unit_setting_area">
                            <input className="w-20" defaultValue="注意事項" type="button"
                                onClick={openModal} />
                            <CharaSetting setSettingUpdate={setSettingUpdate} />
                        </div>
                        <div>
                            <EnemyArea enemyInfo={enemyInfo} enemyClass={enemyClass}
                                enemySelect={enemySelect} setEnemyClass={setEnemyClass} setEnemySelect={setEnemySelect}
                                detailSetting={detailSetting} />
                            <DetailSetting detailSetting={detailSetting} setDetailSetting={setDetailSetting} />
                        </div>
                        <div className="flex justify-center mt-2 text-sm">
                            <input className="battle_start" defaultValue="戦闘開始" type="button" onClick={e =>
                                startBattle(update, setUpdate, setConstraintsAbility, setConstraintsPassive)} />
                            {settingUpdate &&
                                <input className="battle_setting ml-4" defaultValue="設定のみ反映" type="button" onClick={e =>
                                    restartBattle(update, setUpdate, setConstraintsAbility, setConstraintsPassive)} />
                            }
                        </div>
                        <div>
                            <ConstraintsList constraintsAbility={constraintsAbility} constraintsPassive={constraintsPassive} />
                        </div>
                        <div>
                            <ReactModal
                                isOpen={modalIsOpen}
                                onRequestClose={closeModal}
                                className={"modal-content modal-wide " + (modalIsOpen ? "modal-content-open" : "")}
                                overlayClassName={"modal-overlay " + (modalIsOpen ? "modal-overlay-open" : "")}
                            >
                                <ModalExplanation />
                            </ReactModal>
                        </div>
                    </div>
            }
            <BattleArea hideMode={hideMode} setHideMode={setHideMode} turnList={simProc.turnList} dispatch={dispatch} loadData={loadData} update={update} setUpdate={setUpdate} />
        </>
    )
};

export default SettingArea;