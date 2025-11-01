import React, { useState, useEffect, useRef } from "react";
import ReactModal from "react-modal";
import { RANGE, CONDITIONS } from "utils/const";
import { KB_NEXT, FIELD_LIST } from "./const";
import { getBuffList, getSkillData, deepClone } from "utils/common";
import UnitComponent from "./UnitComponent";
import ModalTargetSelection from "./ModalTargetSelection";
import ModalEffectSelection from "./ModalEffectSelection";
import ModalTriggerOverDrive from "./ModalTriggerOverDrive";
import BuffDetailListComponent from "./ModalBuffDetailLlist";
import BuffIconComponent from "./BuffIconComponent";
import OverDriveGauge from "./OverDriveGauge";
import {
    getOverDrive, startOverDrive, removeOverDrive, skillUpdate, getUnitData, getTurnNumber,
    startAction, setInitSkill, getSpCost, changeStyleInfo
} from "./logic";
import enemyIcon from 'assets/img/BtnEventBattleActive.webp';

const TurnData = React.memo(({ turn, index, isLastTurn, hideMode, isCapturing, handlers }) => {
    const isNextInfluence = useRef(false);

    // 再描画
    const reRender = (userOperation, render) => {
        isNextInfluence.current = render;
        // OD再計算
        turn.addOverDriveGauge = getOverDrive(turn);
        turn.userOperation = userOperation;
        if ([KB_NEXT.ACTION_OD_1, KB_NEXT.ACTION_OD_2, KB_NEXT.ACTION_OD_3].includes(userOperation.kbAction)) {
            if (turn.overDriveGauge + turn.addOverDriveGauge < 100) {
                userOperation.kbAction = KB_NEXT.ACTION;
            } else if (turn.overDriveGauge + turn.addOverDriveGauge < 200) {
                if ([KB_NEXT.ACTION_OD_2, KB_NEXT.ACTION_OD_3].includes(userOperation.kbAction)) {
                    userOperation.kbAction = KB_NEXT.ACTION_OD_1;
                }
            } else if (turn.overDriveGauge + turn.addOverDriveGauge < 300) {
                if ([KB_NEXT.ACTION_OD_3].includes(userOperation.kbAction)) {
                    userOperation.kbAction = KB_NEXT.ACTION_OD_2;
                }
            }
        }
        handlers.updateTurn(index, turn);
    }

    // 敵の数変更
    const chengeEnemyCount = (e) => {
        let userOperation = { ...turn.userOperation };
        userOperation.enemyCount = Number(e.target.value);
        turn.enemyCount = Number(e.target.value);
        reRender(userOperation, true);
    }

    // フィールド変更
    const chengeField = (e) => {
        let userOperation = { ...turn.userOperation };
        userOperation.field = Number(e.target.value);
        turn.field = Number(e.target.value);
        reRender(userOperation, true);
    }

    // 行動選択変更
    const chengeAction = (e) => {
        let userOperation = { ...turn.userOperation };
        userOperation.kbAction = Number(e.target.value);
        reRender(userOperation, true);
    }

    // スキル変更
    const chengeSkill = (skillId, placeNo) => {
        let userOperation = { ...turn.userOperation };
        let selectSkill = userOperation.selectSkill[placeNo];
        selectSkill.skill_id = skillId;
        skillUpdate(turn, skillId, placeNo);
        const unit = turn.unitList.filter(unit => unit.placeNo === placeNo)[0];

        const buffList = getBuffList(skillId);
        const SELECT_RANGE = [RANGE.ALLY_UNIT, RANGE.SELF_AND_UNIT, RANGE.OTHER_UNIT];
        if (buffList.some(buff => SELECT_RANGE.includes(buff.range_area))) {
            openModal("target", placeNo);
        } else {
            unit.buffTargetCharaId = null;
        }

        let effectType = 0;
        let skillInfo = getSkillData(skillId);
        const conditionsList = buffList.map(buff => buff.conditions).filter(condition => condition !== null);
        if (conditionsList.includes(CONDITIONS.DESTRUCTION_OVER_200) || skillInfo.conditions === CONDITIONS.DESTRUCTION_OVER_200) {
            effectType = 2;
        }
        if (conditionsList.includes(CONDITIONS.BREAK)) {
            effectType = 3;
        }
        if (conditionsList.includes(CONDITIONS.PERCENTAGE_30)) {
            effectType = 4;
        }
        if (conditionsList.includes(CONDITIONS.HAS_SHADOW) || skillInfo.conditions === CONDITIONS.HAS_SHADOW) {
            effectType = 5;
        }
        if (conditionsList.includes(CONDITIONS.DOWN_TURN) || skillInfo.conditions === CONDITIONS.DOWN_TURN) {
            effectType = 6;
        }
        if (conditionsList.includes(CONDITIONS.BUFF_DISPEL) || skillInfo.conditions === CONDITIONS.BUFF_DISPEL) {
            effectType = 7;
        }
        if (conditionsList.includes(CONDITIONS.DP_OVER_100) || skillInfo.conditions === CONDITIONS.DP_OVER_100) {
            effectType = 8;
        }
        if (conditionsList.includes(CONDITIONS.SUPER_DOWN) || skillInfo.conditions === CONDITIONS.SUPER_DOWN) {
            effectType = 9;
        }
        if (conditionsList.includes(CONDITIONS.MOTIVATION) || skillInfo.conditions === CONDITIONS.MOTIVATION) {
            effectType = 10;
        }
        if (conditionsList.includes(CONDITIONS.TOKEN_OVER) || skillInfo.conditions === CONDITIONS.TOKEN_OVER) {
            effectType = 11;
        }

        switch (skillId) {
            case 50: // トリック・カノン
                effectType = 1;
                break;
            default:
                break;
        }

        if (effectType !== 0) {
            openModal("effect", placeNo, effectType)
        } else {
            unit.buffEffectSelectType = null;
        }

        selectSkill.buffTargetCharaId = unit.buffTargetCharaId;
        selectSkill.buffEffectSelectType = unit.buffEffectSelectType;
        reRender(userOperation, true);
    }

    // OD発動/解除
    function triggerOverDrive(checked, overDriveLevel) {
        const userOperation = turn.userOperation;;
        if (checked) {
            startOverDrive(turn, overDriveLevel);
            userOperation.kbAction = KB_NEXT.ACTION;
            userOperation.overDriveLevel = overDriveLevel;
        } else {
            removeOverDrive(turn);
        }
        userOperation.triggerOverDrive = checked;
        reRender(userOperation, true);
    }

    // ユニット選択/入れ替え
    const chengeSelectUnit = ((e, placeNo) => {
        if (e.target.tagName === 'SELECT' || e.target.classList.contains("style_change")) {
            e.stopPropagation();
            return;
        }
        let newUnit = getUnitData(turn, placeNo);
        if (newUnit.blank) {
            return;
        }
        // 追加ターンの制約
        if (turn.additionalTurn) {
            if (2 < placeNo) {
                return;
            }
            if (!newUnit.additionalTurn) {
                return;
            }
        }
        let userOperation = turn.userOperation;
        let oldPlaceNo = userOperation.selectedPlaceNo;
        let selectSkill = userOperation.selectSkill;
        let placeStyle = userOperation.placeStyle;
        let render = false;
        if (oldPlaceNo !== -1) {
            if (oldPlaceNo !== placeNo) {
                let oldUnit = getUnitData(turn, oldPlaceNo)
                if (newUnit && oldUnit) {
                    newUnit.placeNo = oldPlaceNo;
                    oldUnit.placeNo = placeNo;
                }
                if (placeNo <= 2 && 3 <= oldPlaceNo) {
                    // 前衛と後衛の交換
                    exchangeUnit(newUnit, oldUnit, selectSkill);
                } else if (3 <= placeNo && oldPlaceNo <= 2) {
                    // 後衛と前衛の交換
                    exchangeUnit(oldUnit, newUnit, selectSkill);
                } else {
                    // 前衛同士/後衛同士
                    const tmp_skill = selectSkill[placeNo];
                    selectSkill[placeNo] = selectSkill[oldPlaceNo]
                    selectSkill[oldPlaceNo] = tmp_skill;
                }

                const tmp_style = placeStyle[placeNo];
                placeStyle[placeNo] = placeStyle[oldPlaceNo]
                placeStyle[oldPlaceNo] = tmp_style;
                render = true;
            }
            placeNo = -1;
        }
        userOperation.selectedPlaceNo = placeNo;
        reRender(userOperation, render);
    })

    // 前衛後衛ユニット交換
    const exchangeUnit = ((old_front, old_back, selectSkill) => {
        setInitSkill(old_back);
        setInitSkill(old_front);
        selectSkill[old_front.placeNo] = { skill_id: old_front.selectSkillId };
        selectSkill[old_back.placeNo] = { skill_id: old_back.selectSkillId };
    })

    // 備考編集
    const chengeRemark = ((e) => {
        const userOperation = turn.userOperation;;
        userOperation.remark = e.target.value;
        reRender(userOperation, false);
    })

    // スタイル変更
    const chageStyle = (placeNo, styleId) => {
        let userOperation = { ...turn.userOperation };
        userOperation.placeStyle[placeNo] = styleId;
        let unit = turn.unitList.filter(unit => unit.placeNo === placeNo)[0];
        changeStyleInfo(unit, styleId);
        userOperation.selectSkill[placeNo].skill_id = unit.initSkillId;
        skillUpdate(turn, unit.initSkillId, placeNo);
        reRender(userOperation, true);
    }

    // 次ターン
    function clickNextTurn() {
        let turnData = deepClone(turn);
        startAction(turnData);
        // ターン開始処理
        handlers.proceedTurn(turnData, true);
    };

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (!isLastTurn && isNextInfluence.current) {
            handlers.recreateTurn(index);
        }
    }, [turn, index, isLastTurn]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const [modalSetting, setModalSetting] = useState({
        isOpen: false,
        modalIndex: -1,
        modalType: null,
        effect_type: 0
    });

    const handleSelectTarget = (chara_id) => {
        const unit = turn.unitList.filter(unit => unit.placeNo === modalSetting.modalIndex)[0];
        unit.buffTargetCharaId = chara_id;
        turn.userOperation.selectSkill[modalSetting.modalIndex].buffTargetCharaId = chara_id;
        reRender(turn.userOperation, true);
    };

    const handleSelectEffect = (effect_type) => {
        const unit = turn.unitList.filter(unit => unit.placeNo === modalSetting.modalIndex)[0];
        unit.buffEffectSelectType = effect_type;
        turn.userOperation.selectSkill[modalSetting.modalIndex].buffEffectSelectType = effect_type;
        let skillInfo = getSkillData(unit.selectSkillId);

        const selectionConditions = [CONDITIONS.DESTRUCTION_OVER_200, CONDITIONS.HAS_SHADOW,
        CONDITIONS.DOWN_TURN, CONDITIONS.DP_OVER_100, CONDITIONS.SUPER_DOWN, CONDITIONS.MOTIVATION, CONDITIONS.TOKEN_OVER];
        if (selectionConditions.includes(skillInfo.conditions)) {
            if (unit.buffEffectSelectType >= 1) {
                let spCost = getSpCost(turn, skillInfo, unit)
                unit.sp_cost = spCost;
            }
        }
        reRender(turn.userOperation, true);
    };

    const clickBuffIcon = (buffList) => {
        openModal("buff", 0, buffList);
    };

    const handleOverDrive = (checked) => {
        if (checked) {
            if (Math.floor(turn.startOverDriveGauge / 100) >= 2) {
                openModal("overdrive");
            } else {
                triggerOverDrive(checked, 1);
            }
        } else {
            triggerOverDrive(checked);
        }
    };

    const openModal = (type, index, effect_type) => setModalSetting({ isOpen: true, modalIndex: index, modalType: type, effect_type: effect_type });
    const closeModal = () => setModalSetting({ isOpen: false });

    return (
        <div className="turn">
            <div className="turn_header_area">
                <div className="turn_header_top">
                    <div>
                        <div className="turn_number">{getTurnNumber(turn)}</div>
                        <div className="left flex">
                            <img className="enemy_icon" src={enemyIcon} alt="ENEMY" />
                            <div>
                                <select className="enemy_count" value={turn.enemyCount} onChange={(e) => chengeEnemyCount(e)}>
                                    {[1, 2, 3].filter(value => value === turn.enemyCount || !isCapturing)
                                        .map(enemyCount => <option value={enemyCount} key={`enemy_count${enemyCount}`}>{`${enemyCount}体`}</option>)}
                                </select>
                                <span className="ml-1">場</span>
                                <select className="enemy_count" value={turn.field} onChange={(e) => chengeField(e)}>
                                    {Object.keys(FIELD_LIST)
                                        .filter(value => Number(value) === turn.field || !isCapturing)
                                        .map(field => <option value={field} key={`field${field}`}>{FIELD_LIST[field]}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <OverDriveGauge turn={turn} />
                </div>
                <BuffIconComponent buffList={turn.enemyDebuffList} loopLimit={12} loopStep={1} placeNo={7} turnNumber={turn.turnNumber} clickBuffIcon={clickBuffIcon} />
            </div>
            <div className="party_member">
                <div className="flex front_area">
                    {[0, 1, 2].map(placeNo =>
                        <UnitComponent turn={turn} key={`unit${placeNo}`} placeNo={placeNo} selectedPlaceNo={turn.userOperation.selectedPlaceNo}
                            chageStyle={chageStyle} chengeSkill={chengeSkill} chengeSelectUnit={chengeSelectUnit} clickBuffIcon={clickBuffIcon} hideMode={hideMode} isCapturing={isCapturing} />
                    )}
                </div>
                <div className="flex back_area">
                    {[3, 4, 5].map(placeNo =>
                        <UnitComponent turn={turn} key={`unit${placeNo}`} placeNo={placeNo} selectedPlaceNo={turn.userOperation.selectedPlaceNo}
                            chageStyle={chageStyle} chengeSkill={chengeSkill} chengeSelectUnit={chengeSelectUnit} clickBuffIcon={clickBuffIcon} hideMode={hideMode} isCapturing={isCapturing} />
                    )}
                    <div>
                        <select className="action_select" value={turn.userOperation.kbAction || turn.userOperation.kb_action} onChange={(e) => chengeAction(e)}>
                            {turn.userOperation.kbAction === KB_NEXT.ACTION || !isCapturing ?
                                <option value={KB_NEXT.ACTION}>行動開始</option> : null}
                            {turn.userOperation.kbAction === KB_NEXT.ACTION_OD_1 ||
                                (turn.overDriveGauge + turn.addOverDriveGauge >= 100 && turn.overDriveMaxTurn === 0) ?
                                <option value={KB_NEXT.ACTION_OD_1}>行動開始+OD1</option> : null}
                            {turn.userOperation.kbAction === KB_NEXT.ACTION_OD_2 ||
                                (turn.overDriveGauge + turn.addOverDriveGauge >= 200 && turn.overDriveMaxTurn === 0) ?
                                <option value={KB_NEXT.ACTION_OD_2}>行動開始+OD2</option> : null}
                            {turn.userOperation.kbAction === KB_NEXT.ACTION_OD_3 ||
                                (turn.overDriveGauge + turn.addOverDriveGauge >= 300 && turn.overDriveMaxTurn === 0) ?
                                <option value={KB_NEXT.ACTION_OD_3}>行動開始+OD3</option> : null}
                        </select>
                        <div
                            className="flex"
                            style={{
                                justifyContent: "flex-end",
                            }}>
                            {turn.startOverDriveGauge >= 100 && !turn.additionalTurn && (turn.overDriveNumber === 0 || turn.triggerOverDrive) ?
                                <input type="checkbox" className="trigger_over_drive" checked={turn.triggerOverDrive} onChange={(e) => handleOverDrive(e.target.checked)} />
                                : null}
                            {isLastTurn ?
                                <input className="turn_button next_turn" defaultValue="次ターン" type="button" onClick={clickNextTurn} />
                                :
                                <input className="turn_button return_turn" defaultValue="戻す" type="button" onClick={() => handlers.returnTurn(turn.seqTurn)} />
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="remark_area">
                <textarea className="remaek_text" onChange={(e) => chengeRemark(e)} value={turn.userOperation.remark} />
            </div>
            <div>
                <ReactModal
                    isOpen={modalSetting.isOpen}
                    onRequestClose={closeModal}
                    className={"modal-content " + (modalSetting.isOpen ? "modal-content-open" : "")}
                    overlayClassName={"modal-overlay " + (modalSetting.isOpen ? "modal-overlay-open" : "")}
                >
                    {
                        modalSetting.modalType === "target" ?
                            <ModalTargetSelection closeModal={closeModal} onSelect={handleSelectTarget} unitList={turn.unitList} />
                            : modalSetting.modalType === "effect" ?
                                <ModalEffectSelection closeModal={closeModal} onSelect={handleSelectEffect} effectType={modalSetting.effect_type} />
                                : modalSetting.modalType === "buff" ?
                                    <BuffDetailListComponent buffList={modalSetting.effect_type} />
                                    : modalSetting.modalType === "overdrive" &&
                                    <ModalTriggerOverDrive triggerOverDrive={triggerOverDrive} closeModal={closeModal} overDriveLevel={Math.floor(turn.startOverDriveGauge / 100)} />
                    }
                </ReactModal>
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // 再描画が必要ないなら true を返す
    return (
        prevProps.turn === nextProps.turn &&
        prevProps.isLastTurn === nextProps.isLastTurn &&
        prevProps.hideMode === nextProps.hideMode &&
        prevProps.isCapturing === nextProps.isCapturing
    );
});

export default TurnData