
import React, { useState } from "react";
import ReactModal from "react-modal";
import * as common from "utils/common";
import { recreateTurnData, startTurn } from "./logic";
import * as logicInit from "./logicInit.js";
import { useStyleList } from "components/StyleListProvider";
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
            turnList[action.payload] = common.deepClone(action.turnData);
            return {
                ...state,
                turnList: turnList
            };
        default:
            return state;
    }
};

const SettingArea = ({ enemyClass, enemySelect, setEnemyClass, setEnemySelect }) => {
    const { styleList, setStyleList, saveStyle, loadMember } = useStyleList();

    const [hideMode, setHideMode] = React.useState(false);
    const [settingUpdate, setSettingUpdate] = React.useState(false);

    const [simProc, dispatch] = React.useReducer(reducer, {
        turnList: [],
        enemyInfo: {},
    });
    let enemyInfo = common.getEnemyInfo(enemyClass, enemySelect);

    // 戦闘開始前処理
    const startBattle = (update, setUpdate, setConstraintsAbility, setConstraintsPassive) => {
        if (!logicInit.checkStartBattle(styleList)) {
            return;
        }

        /** 戦闘開始処理 */
        // 初期データ作成
        let turnInit = logicInit.getInitBattleData(
            styleList.selectStyleList, enemyInfo, saveStyle, detailSetting, setConstraintsAbility, setConstraintsPassive);
        // 制約事項更新
        setUpdate(update + 1);
        // 初期処理
        startTurn(turnInit);
        let turnList = [turnInit];
        dispatch({ type: "INIT_TURN_LIST", turnList: turnList });
        setSettingUpdate(true);
        changeActiveTurn(turnInit);
    };

    // 戦闘開始前処理
    const restartBattle = (update, setUpdate, setConstraintsAbility, setConstraintsPassive) => {
        if (!logicInit.checkStartBattle(styleList)) {
            return;
        }

        /** 戦闘開始処理 */
        const userOperationList = simProc.turnList.map(turn => turn.userOperation);
        // 初期データ作成
        let turnInit = logicInit.getInitBattleData(
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
        let turnInit = logicInit.getInitBattleData(
            updatedStyleList, enemyInfo, saveStyle, detailSetting, setConstraintsAbility, setConstraintsPassive);
        // 制約事項更新
        setKey(key + 1);
        let turnList = [];
        recreateTurnData(turnList, turnInit, saveData.userOperationList, true);
        // 画面反映
        dispatch({ type: "INIT_TURN_LIST", turnList: turnList });
        setSettingUpdate(true);
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
        overDriveGaugeMultiplier: 100
    });

    const [activeTurn, setActiveTurn] = useState({});

    const changeActiveTurn = (turnData) => {
        const newActiveTurn =
        {
            turnNumber: turnData.turnNumber,
            finishAction: turnData.finishAction,
            endDriveTriggerCount: turnData.endDriveTriggerCount,
            overDriveNumber: turnData.overDriveNumber,
            additionalCount: turnData.additionalCount,
        }
        setActiveTurn(newActiveTurn);
    }

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
            <BattleArea hideMode={hideMode} setHideMode={setHideMode} turnList={simProc.turnList} dispatch={dispatch} loadData={loadData} update={update} setUpdate={setUpdate}
                activeTurn={activeTurn} changeActiveTurn={changeActiveTurn} />
        </>
    )
};

export default SettingArea;