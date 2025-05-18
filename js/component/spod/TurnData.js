const TurnData = React.memo(({ turn, index, isLastTurn, hideMode, isCapturing, handlers }) => {
    const isNextInfluence = React.useRef(false);
    const [turnData, setTurnData] = React.useState({
        user_operation: turn.user_operation
    });

    // 再描画
    const reRender = (user_operation, is_next_influence) => {
        isNextInfluence.current = is_next_influence;
        // OD再計算
        turn.add_over_drive_gauge = getOverDrive(turn);
        setTurnData({ ...turnData, user_operation: user_operation });
    }

    // 敵の数変更
    const chengeEnemyCount = (e) => {
        let user_operation = turn.user_operation;
        user_operation.enemy_count = Number(e.target.value);
        turn.enemy_count = Number(e.target.value);
        reRender(user_operation, true);
    }

    // フィールド変更
    const chengeField = (e) => {
        let user_operation = turn.user_operation;
        user_operation.field = Number(e.target.value);
        turn.field = Number(e.target.value);
        reRender(user_operation, true);
    }

    // 行動選択変更
    const chengeAction = (e) => {
        let user_operation = turn.user_operation;
        user_operation.kb_action = Number(e.target.value);
        reRender(user_operation, true);
    }

    // スキル変更
    const chengeSkill = (skill_id, place_no) => {
        let user_operation = turn.user_operation;
        let select_skill = user_operation.select_skill[place_no];
        select_skill.skill_id = skill_id;
        skillUpdate(turn, skill_id, place_no);
        const unit = turn.unit_list.filter(unit => unit.place_no === place_no)[0];

        const buff_list = getBuffInfo(skill_id);
        const SELECT_RANGE = [RANGE_ALLY_UNIT, RANGE_SELF_AND_UNIT, RANGE_OTHER_UNIT];
        if (buff_list.some(buff => SELECT_RANGE.includes(buff.range_area))) {
            openModal(place_no, "target")
        } else {
            unit.buff_target_chara_id = null;
        }

        let effect_type = 0;
        let skill_info = getSkillData(skill_id);
        const conditionsList = buff_list.map(buff => buff.conditions).filter(condition => condition !== null);
        if (conditionsList.includes(CONDITIONS_DESTRUCTION_OVER_200)) {
            effect_type = 2;
        }
        if (conditionsList.includes(CONDITIONS_BREAK)) {
            effect_type = 3;
        }
        if (conditionsList.includes(CONDITIONS_PERCENTAGE_30)) {
            effect_type = 4;
        }
        if (conditionsList.includes(CONDITIONS_HAS_SHADOW) || skill_info.attribute_conditions == CONDITIONS_HAS_SHADOW) {
            effect_type = 5;
        }
        if (conditionsList.includes(CONDITIONS_DOWN_TURN) || skill_info.attribute_conditions == CONDITIONS_DOWN_TURN) {
            effect_type = 6;
        }
        if (conditionsList.includes(CONDITIONS_BUFF_DISPEL) || skill_info.attribute_conditions == CONDITIONS_BUFF_DISPEL) {
            effect_type = 7;
        }
        if (conditionsList.includes(CONDITIONS_DP_OVER_100) || skill_info.attribute_conditions == CONDITIONS_DP_OVER_100) {
            effect_type = 8;
        }

        switch (skill_id) {
            case 50: // トリック・カノン
                effect_type = 1;
                break;
            default:
                break;
        }

        if (effect_type != 0) {
            openModal(place_no, "effect", effect_type)
        } else {
            unit.buff_effect_select_type = null;
        }

        processSkillChange(unit, user_operation, select_skill);
    }

    // スキル変更時の追加処理
    function processSkillChange(unit, user_operation, select_skill) {
        select_skill.buff_target_chara_id = unit.buff_target_chara_id;
        select_skill.buff_effect_select_type = unit.buff_effect_select_type;
        reRender(user_operation, true);
    }

    // OD発動/解除
    function triggerOverDrive(checked) {
        let user_operation = turn.user_operation;;
        if (checked) {
            startOverDrive(turn);
            user_operation.kb_action = KB_NEXT_ACTION;
        } else {
            removeOverDrive(turn);
        }
        user_operation.trigger_over_drive = checked;
        reRender(user_operation, true);
    }

    // ユニット選択/入れ替え
    const chengeSelectUnit = ((e, place_no) => {
        if (e.target.tagName === 'SELECT') {
            e.stopPropagation();
            return;
        }
        let new_unit = getUnitData(turn, place_no);
        if (new_unit.blank) {
            return;
        }
        // 追加ターンの制約
        if (turn.additional_turn) {
            if (2 < place_no) {
                return;
            }
            if (!new_unit.additional_turn) {
                return;
            }
        }
        let user_operation = turn.user_operation;
        let old_place_no = user_operation.selected_place_no;
        let select_skill = user_operation.select_skill;
        let place_style = user_operation.place_style;
        let is_next_influence = false;
        if (old_place_no != -1) {
            if (old_place_no != place_no) {
                let old_unit = getUnitData(turn, old_place_no)
                if (new_unit && old_unit) {
                    new_unit.place_no = old_place_no;
                    old_unit.place_no = place_no;
                }
                if (place_no <= 2 && 3 <= old_place_no) {
                    // 前衛と後衛の交換
                    exchangeUnit(new_unit, old_unit, select_skill);
                } else if (3 <= place_no && old_place_no <= 2) {
                    // 後衛と前衛の交換
                    exchangeUnit(old_unit, new_unit, select_skill);
                } else {
                    // 前衛同士/後衛同士
                    const tmp_skill = select_skill[place_no];
                    select_skill[place_no] = select_skill[old_place_no]
                    select_skill[old_place_no] = tmp_skill;
                }

                const tmp_style = place_style[place_no];
                place_style[place_no] = place_style[old_place_no]
                place_style[old_place_no] = tmp_style;
                is_next_influence = true;
            }
            place_no = -1;
        }
        user_operation.selected_place_no = place_no;
        reRender(user_operation, is_next_influence);
    })

    // 前衛後衛ユニット交換
    const exchangeUnit = ((old_front, old_back, select_skill) => {
        setInitSkill(old_back);
        setInitSkill(old_front);
        select_skill[old_front.place_no] = { skill_id: old_front.select_skill_id };
        select_skill[old_back.place_no] = { skill_id: old_back.select_skill_id };
    })

    // 備考編集
    const chengeRemark = ((e) => {
        let user_operation = turn.user_operation;
        user_operation.remark = e.target.value;
        reRender(user_operation, false);
    })

    // 次ターン
    function clickNextTurn() {
        turn.is_last_turn = false;
        let turn_data = deepClone(turn);
        turn_data.is_last_turn = true;
        startAction(turn_data);
        // ターン開始処理
        handlers.proceedTurn(turn_data, true);
    };

    React.useEffect(() => {
        if (!isLastTurn && isNextInfluence.current) {
            handlers.recreateTurn(index);
        }
    }, [turnData, index]);

    const [modalSetting, setModalSetting] = React.useState({
        isOpen: false,
        modalIndex: -1,
        modalType: null,
        effect_type: 0
    });

    const handleSelectTarget = (chara_id) => {
        const unit = turn.unit_list.filter(unit => unit.place_no === modalSetting.modalIndex)[0];
        unit.buff_target_chara_id = chara_id;
        turn.user_operation.select_skill[modalSetting.modalIndex].buff_target_chara_id = chara_id;
        reRender(turn.user_operation, true);
    };

    const handleSelectEffect = (effect_type) => {
        const unit = turn.unit_list.filter(unit => unit.place_no === modalSetting.modalIndex)[0];
        unit.buff_effect_select_type = effect_type;
        turn.user_operation.select_skill[modalSetting.modalIndex].buff_effect_select_type = effect_type;
        let sp_cost = unit.sp_cost;
        let skill_info = getSkillData(unit.select_skill_id);

        const selectionConditions = [CONDITIONS_HAS_SHADOW, CONDITIONS_DOWN_TURN, CONDITIONS_DP_OVER_100];
        if (selectionConditions.includes(skill_info.attribute_conditions)) {
            if (unit.buff_effect_select_type == 1) {
                if (skill_info.skill_attribute == ATTRIBUTE_SP_HALF) {
                    sp_cost = Math.floor(sp_cost / 2);
                }
                if (skill_info.skill_attribute == ATTRIBUTE_SP_ZERO) {
                    sp_cost = 0;
                }
            }
        }
        unit.sp_cost = sp_cost;
        reRender(turn.user_operation, true);
    };

    const clickBuffIcon = (buff_list) => {
        openModal(0, "buff", buff_list);
    };


    const openModal = (index, type, effect_type) => setModalSetting({ isOpen: true, modalIndex: index, modalType: type, effect_type: effect_type });
    const closeModal = () => setModalSetting({ isOpen: false });

    // console.log(`render${index}`);
    return (
        <div className="turn">
            <div className="turn_header_area">
                <div className="turn_header_top">
                    <div>
                        <div className="turn_number">{getTurnNumber(turn)}</div>
                        <div className="left flex">
                            <img className="enemy_icon" src="icon/BtnEventBattleActive.webp" />
                            <div>
                                <select className="enemy_count" value={turn.enemy_count} onChange={(e) => chengeEnemyCount(e)}>
                                    {[1, 2, 3].filter(value => value == turn.enemy_count || !isCapturing)
                                        .map(enemy_count => <option value={enemy_count} key={`enemy_count${enemy_count}`}>{`${enemy_count}体`}</option>)}
                                </select>
                                <label className="ml-1">場</label>
                                <select className="enemy_count" value={turn.field} onChange={(e) => chengeField(e)}>
                                    {Object.keys(FIELD_LIST).filter(value => value == turn.field || !isCapturing)
                                        .map(field => <option value={field} key={`field${field}`}>{FIELD_LIST[field]}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <OverDriveGauge turn={turn} />
                </div>
                <BuffIconComponent buff_list={turn.enemy_debuff_list} loop_limit={12} loop_step={1} place_no={7} turn_number={turn.turn_number} clickBuffIcon={clickBuffIcon}/>
            </div>
            <div className="party_member">
                <div className="flex front_area">
                    {[0, 1, 2].map(place_no =>
                        <UnitComponent turn={turn} key={`unit${place_no}`} place_no={place_no} selected_place_no={turnData.user_operation.selected_place_no}
                            chengeSkill={chengeSkill} chengeSelectUnit={chengeSelectUnit} clickBuffIcon={clickBuffIcon} hideMode={hideMode} isCapturing={isCapturing} />
                    )}
                </div>
                <div className="flex back_area">
                    {[3, 4, 5].map(place_no =>
                        <UnitComponent turn={turn} key={`unit${place_no}`} place_no={place_no} selected_place_no={turnData.user_operation.selected_place_no}
                            chengeSkill={chengeSkill} chengeSelectUnit={chengeSelectUnit} clickBuffIcon={clickBuffIcon} hideMode={hideMode} isCapturing={isCapturing} />
                    )}
                    <div>
                        <select className="action_select" value={turnData.user_operation.kb_action} onChange={(e) => chengeAction(e)}>
                            {turnData.user_operation.kb_action == KB_NEXT_ACTION || !isCapturing ?
                                <option value={KB_NEXT_ACTION}>行動開始</option> : null}
                            {turnData.user_operation.kb_action == KB_NEXT_ACTION_OD ||
                                (turn.over_drive_gauge + turn.add_over_drive_gauge >= 100 && turn.over_drive_max_turn == 0) ?
                                <option value={KB_NEXT_ACTION_OD}>行動開始+OD</option> : null}
                        </select>
                        <div
                            className="flex"
                            style={{
                                justifyContent: "flex-end",
                            }}>
                            {turn.start_over_drive_gauge >= 100 && !turn.additional_turn && (turn.over_drive_number == 0 || turn.trigger_over_drive) ?
                                <input type="checkbox" className="trigger_over_drive" checked={turn.trigger_over_drive} onChange={(e) => triggerOverDrive(e.target.checked)} />
                                : null}
                            {isLastTurn ?
                                <input className="turn_button next_turn" defaultValue="次ターン" type="button" onClick={clickNextTurn} />
                                :
                                <input className="turn_button return_turn" defaultValue="ここに戻す" type="button" onClick={() => handlers.returnTurn(turn.seq_turn)} />
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="remark_area">
                <textarea className="remaek_text" onChange={(e) => chengeRemark(e)} value={turn.user_operation.remark} />
            </div>
            <div>
                <ReactModal
                    isOpen={modalSetting.isOpen}
                    onRequestClose={closeModal}
                    className={"modal-content " + (modalSetting.isOpen ? "modal-content-open" : "")}
                    overlayClassName={"modal-overlay " + (modalSetting.isOpen ? "modal-overlay-open" : "")}
                >
                    {
                        modalSetting.modalType == "target" ?
                            <ModalTargetSelection closeModal={closeModal} onSelect={handleSelectTarget} unitList={turn.unit_list} />
                            : modalSetting.modalType == "effect" ?
                                <ModalEffectSelection closeModal={closeModal} onSelect={handleSelectEffect} effectType={modalSetting.effect_type} />
                                : modalSetting.modalType == "buff" ?
                                    <BuffDetailListComponent buffList={modalSetting.effect_type} />
                                    : null
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