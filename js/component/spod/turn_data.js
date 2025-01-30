const TurnDataComponent = React.memo(({ turn, index, is_last_turn, hideMode }) => {
    const isNextInfluence = React.useRef(false);
    const [turnData, setTurnData] = React.useState({
        user_operation: turn.user_operation
    });

    // 再描画
    const reRender = (user_operation, is_next_influence) => {
        isNextInfluence.current = is_next_influence;
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
        processSkillChange(unit, skill_id, user_operation, select_skill);
    }

    // スキルデータ更新
    const skillUpdate = (turn_data, skill_id, place_no) => {
        const unit = turn_data.unit_list.filter(unit => unit.place_no === place_no)[0];
        unit.select_skill_id = skill_id;
        if (skill_id !== 0) {
            unit.sp_cost = getSpCost(turn_data, getSkillData(skill_id), unit);
        } else {
            unit.sp_cost = 0;
        }
    }

    // スキル変更時の追加処理
    async function processSkillChange(unit, skill_id, user_operation, select_skill) {
        const buff_list = getBuffInfo(skill_id);
        if (!await handleTargetSelection(unit, turn, buff_list)) {
            // 未選択時に初期値に戻す
            unit.select_skill_id = unit.init_skill_id;
            chengeSkill(unit.init_skill_id, unit.place_no);
        }
        if (!await handleEffectSelection(unit, skill_id, buff_list)) {
            // 未選択時に初期値に戻す
            unit.select_skill_id = unit.init_skill_id;
            chengeSkill(unit.init_skill_id, unit.place_no);
        }

        let sp_cost = unit.sp_cost;
        let skill_info = getSkillData(skill_id);
        const selectionConditions = [CONDITIONS_HAS_SHADOW, CONDITIONS_DOWN_TURN];
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
        select_skill.buff_target_chara_id = unit.buff_target_chara_id;
        select_skill.buff_effect_select_type = unit.buff_effect_select_type;
        reRender(user_operation, true);
    }

    // OD発動/解除
    function triggerOverDrive(checked) {
        let user_operation = turn.user_operation;;
        if (checked) {
            turn.startOverDrive();
            user_operation.kb_action = KB_NEXT_ACTION;
        } else {
            turn.removeOverDrive();
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
                // 前衛と後衛の交換
                if (place_no <= 2 && 3 <= old_place_no) {
                    old_unit.select_skill_id = old_unit.init_skill_id;
                    new_unit.select_skill_id = 0;
                    new_unit.sp_cost = 0;
                    new_unit.buff_effect_select_type = null;
                    new_unit.buff_target_chara_id = null;
                    select_skill[place_no] = { skill_id: 0 };
                }
                // 後衛と前衛の交換
                if (3 <= place_no && old_place_no <= 2) {
                    old_unit.select_skill_id = 0;
                    old_unit.sp_cost = 0;
                    old_unit.buff_effect_select_type = null;
                    old_unit.buff_target_chara_id = null;
                    select_skill[old_place_no] = { skill_id: 0 };
                    new_unit.select_skill_id = new_unit.init_skill_id;
                }
                const tmp_skill = select_skill[place_no];
                select_skill[place_no] = select_skill[old_place_no]
                select_skill[old_place_no] = tmp_skill;

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

    // 次ターン
    function clickNextTurn() {
        turn.is_last_turn = false;
        let turn_data = deepClone(turn);
        turn_data.is_last_turn = true;
        startAction(turn_data, seq_last_turn);
        // 次ターンを追加
        proceedTurn(turn_data, true);
    };

    // ユーザ操作の取得
    const updateUserOperation = (turn_data) => {
        let filtered = user_operation_list.filter((item) =>
            compereUserOperation(item, turn_data) == 0
        );
        let user_operation = turn_data.user_operation;
        if (filtered.length === 0) {
            turn_data.user_operation.kb_action = KB_NEXT_ACTION;
            user_operation_list.push(turn_data.user_operation);
            // 表示確認用
            user_operation_list.sort((a, b) => compereUserOperation(a, b));
        } else {
            user_operation = filtered[0];
            turn_data.user_operation = user_operation;
        }
        user_operation.used = true;
    }

    // ユーザ操作をターンに反映
    const reflectUserOperation = (turn_data) => {
        // 配置変更
        turn_data.unit_list.forEach((unit) => {
            if (unit.blank) return;
            let operation_place_no = turn_data.user_operation.place_style.findIndex((item) =>
                item === unit.style.style_info.style_id);
            if (turn_data.additional_turn) {
                if (operation_place_no != unit.place_no) {
                    turn_data.user_operation.select_skill[unit.place_no].skill_id = unit.init_skill_id;
                    turn_data.user_operation.place_style[unit.place_no] = unit.style.style_info.style_id;
                }
                return;
            }
            unit.place_no = operation_place_no;
        })
        // オーバードライブ発動
        if (turn_data.user_operation.trigger_over_drive && turn_data.over_drive_gauge > 100) {
            turn_data.startOverDrive();
        }
        // スキル設定
        turn_data.unit_list.forEach((unit) => {
            if (unit.blank) return;
            const skill = turn_data.user_operation.select_skill[unit.place_no];
            unit.buff_target_chara_id = skill.buff_target_chara_id;
            unit.buff_effect_select_type = skill.buff_effect_select_type;
            skillUpdate(turn_data, turn_data.user_operation.select_skill[unit.place_no].skill_id, unit.place_no);
        })
        // OD再計算
        turn_data.add_over_drive_gauge = getOverDrive(turn_data);
        // 行動反映
        if (turn_data.over_drive_gauge < 100) {
            turn_data.user_operation.kb_action = KB_NEXT_ACTION;
        }
        // OD発動反映
        turn_data.trigger_over_drive = turn_data.user_operation.trigger_over_drive;
    }

    // ユーザ操作の比較
    const compereUserOperation = (comp1, comp2) => {
        if (comp1.turn_number !== comp2.turn_number) {
            return comp1.turn_number - comp2.turn_number;
        }
        if (comp1.finish_action !== comp2.finish_action) {
            return comp1.finish_action - comp2.finish_action;
        }
        if (comp1.end_drive_trigger_count !== comp2.end_drive_trigger_count) {
            return comp1.end_drive_trigger_count - comp2.end_drive_trigger_count;
        }
        if (comp1.over_drive_number !== comp2.over_drive_number) {
            return comp1.over_drive_number - comp2.over_drive_number;
        }
        if (comp1.additional_count !== comp2.additional_count) {
            return comp1.additional_count - comp2.additional_count;
        }
        return 0;
    }

    React.useEffect(() => {
        if (seq_last_turn !== index && isNextInfluence.current) {
            // 最終ターンの情報
            const last_turn_operation = turn_list[seq_last_turn].user_operation;

            // 指定されたnumber以上の要素を削除
            turn_list = turn_list.slice(0, index + 1);
            let turn_data = turn_list[index];

            // ユーザ操作リストのチェック
            user_operation_list.forEach((item) => {
                item.used = compereUserOperation(item, turn_data) <= 0;
            })

            while (compereUserOperation(turn_data.user_operation, last_turn_operation) < 0) {
                // 現ターン処理
                turn_data = deepClone(turn_data);
                startAction(turn_data);
                proceedTurn(turn_data, false);
                // ユーザ操作の更新
                updateUserOperation(turn_data);
                // ユーザ操作をターンに反映
                reflectUserOperation(turn_data);
            }
            // ユーザ操作リストの削除
            user_operation_list = user_operation_list.filter((item) => item.used)
            updateTurnList(turn_list);
        }
    }, [turnData, index]);

    return (
        <div className="turn">
            <div className="turn_header_area">
                <div className="turn_header_top">
                    <div>
                        <div className="turn_number">{turn.getTurnNumber()}</div>
                        <div className="left flex">
                            <img className="enemy_icon" src="icon/BtnEventBattleActive.webp" />
                            <div>
                                <select className="enemy_count" value={turn.enemy_count} onChange={(e) => chengeEnemyCount(e)}>
                                    {[1, 2, 3].map(enemy_count => <option value={enemy_count} key={`enemy_count${enemy_count}`}>{`${enemy_count}体`}</option>)}
                                </select>
                                <label className="ml-1">場</label>
                                <select className="enemy_count" value={turn.field} onChange={(e) => chengeField(e)}>
                                    {Object.keys(FIELD_LIST).map(field => <option value={field} key={`field${field}`}>{FIELD_LIST[field]}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <OverDriveGauge turn={turn} />
                </div>
                <BuffIconComponent buff_list={turn.enemy_debuff_list} loop_limit={12} loop_step={1} place_no={7} turn_number={turn.turn_number} />
            </div>
            <div className="party_member">
                <div className="flex front_area">
                    {[0, 1, 2].map(place_no =>
                        <UnitComponent turn={turn} key={`unit${place_no}`} place_no={place_no} selected_place_no={turnData.user_operation.selected_place_no}
                            chengeSkill={chengeSkill} chengeSelectUnit={chengeSelectUnit} hideMode={hideMode}/>
                    )}
                </div>
                <div className="flex back_area">
                    {[3, 4, 5].map(place_no =>
                        <UnitComponent turn={turn} key={`unit${place_no}`} place_no={place_no} selected_place_no={turnData.user_operation.selected_place_no}
                            chengeSkill={chengeSkill} chengeSelectUnit={chengeSelectUnit} hideMode={hideMode}/>
                    )}
                    <div>
                        <select className="action_select" value={turnData.user_operation.kb_action} onChange={(e) => chengeAction(e)}>
                            <option value={KB_NEXT_ACTION}>行動開始</option>
                            {turn.over_drive_gauge >= 100 ? <option value={KB_NEXT_ACTION_OD}>行動開始+OD</option> : null}
                        </select>
                        <div
                            className="flex"
                            style={{
                                justifyContent: "flex-end",
                            }}>
                            {turn.start_over_drive_gauge >= 100 && !turn.additional_turn && (turn.over_drive_number == 0 || turn.trigger_over_drive) ?
                                <input type="checkbox" className="trigger_over_drive" checked={turn.trigger_over_drive} onChange={(e) => triggerOverDrive(e.target.checked)} />
                                : null}
                            {is_last_turn ?
                                <input className="turn_button next_turn" defaultValue="次ターン" type="button" onClick={clickNextTurn} />
                                :
                                <input className="turn_button return_turn" defaultValue="ここに戻す" type="button" onClick={() => returnTurn(turn.seq_turn)} />
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="remark_area">
                <textarea className="remaek_text" />
            </div>
        </div>
    )
});