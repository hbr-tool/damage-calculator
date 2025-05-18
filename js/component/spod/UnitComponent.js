const UnitSp = ({ unit }) => {
    let unit_sp;
    let unit_ep = unit.ep;
    if (unit.sp_cost >= 90) {
        unit_sp = 0;
    } else {
        unit_sp = unit.sp + unit.over_drive_sp;
        if (unit_sp > 99) unit_sp = 99;

        // ノヴァエリミネーション
        if (unit.select_skill_id == 591) {
            unit_ep -= unit.sp_cost;
        } else {
            unit_sp -= unit.sp_cost;
        }
    }

    let className = "unit_sp" + (unit_sp < 0 ? " minus" : "");
    return (
        <>
            <div className={className}>
                <span>{unit_sp + (unit.add_sp > 0 ? ("+" + unit.add_sp) : "")}</span>
                {
                    (unit.ep != 0 ? <span className="unit_ep">{`EP${unit_ep}`}</span> : "")
                }
            </div>
        </>
    )
}

const UnitSkillSelect = React.memo(({ turn, unit, place_no, select_skill_id, trigger_over_drive, chengeSkill, isCapturing }) => {
    let skill_list = unit.skill_list
    if (place_no < 3) {
        skill_list = skill_list.filter(skill => {
            if (skill.skill_id == 495) {
                // 夜醒
                return !turn.additional_turn;
            }
            if (skill.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
                // 通常攻撃
                return unit.style.style_info.role != ROLE.ADMIRAL;
            }
            if (skill.skill_attribute === ATTRIBUTE.COMMAND_ACTION) {
                // 指揮行動
                return unit.style.style_info.role == ROLE.ADMIRAL;
            }
            if (skill.skill_attribute === ATTRIBUTE.PURSUIT_ONLY) {
                // 追撃のみ発動可能
                return false;
            }
            const HIDDEN_SKILL_ID = [SKILL.NONE, SKILL.PURSUIT, SKILL.AUTO_PURSUIT]
            if (HIDDEN_SKILL_ID.includes(skill.skill_id)) {
                // 非表示スキルリスト
                return false;
            }
            return true;
        })
    } else {
        skill_list = unit.skill_list.filter(skill => {
            if (checkAbilityExist(unit.ability_other, 1530)) {
                if (skill.skill_id == SKILL.AUTO_PURSUIT) {
                    // 自動追撃
                    return true;
                }
            } else {
                if (skill.skill_id == SKILL.NONE) {
                    // なし
                    return true;
                } else if (skill.skill_id == SKILL.PURSUIT) {
                    // 追撃
                    return true;
                }
            }
            if (skill.skill_attribute === ATTRIBUTE.PURSUIT_ONLY) {
                // 追撃専用
                return true;
            }
            return false;
        })
    }

    const recoil = unit.buff_list.filter((obj) => obj.buff_kind == BUFF_RECOIL);
    let not_action = (recoil.length > 0 || !unit.style || (turn.additional_turn && !unit.additional_turn && place_no <= 2))
    let className = "unit_skill " + (not_action ? "invisible" : "");
    return (<select className={className} onChange={(e) => chengeSkill(Number(e.target.value), place_no)} value={unit.select_skill_id} >
        {skill_list.filter((obj) => obj.skill_id == unit.select_skill_id || !isCapturing).map(skill => {
            let text = skill.skill_name;
            let sp_cost = 0;
            if (skill.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
                text += `(${physical_name[skill.attack_physical]}・${element_name[unit.normal_attack_element]})`;
            } else if (skill.skill_id == 0 || skill.skill_id === 2) {
            } else if (skill.skill_attribute === ATTRIBUTE.COMMAND_ACTION) {
            } else if (skill.skill_attribute === ATTRIBUTE.PURSUIT) {
                text += `(${physical_name[skill.attack_physical]})`;
            } else if (skill.attack_id) {
                sp_cost = getSpCost(turn, skill, unit);
                text += `(${physical_name[skill.attack_physical]}・${element_name[skill.attack_element]}/${sp_cost})`;
            } else {
                sp_cost = getSpCost(turn, skill, unit);
                text += `(${sp_cost})`;
            }
            return (<option value={skill.skill_id} key={`skill${skill.skill_id}${skill.attack_id}`} data-sp_cost={sp_cost}>{text}</option>)
        }
        )}
    </select>
    );
}, (prevProps, nextProps) => {
    return prevProps.turn === nextProps.turn && prevProps.unit === nextProps.unit
        && prevProps.place_no === nextProps.place_no && prevProps.select_skill_id === nextProps.select_skill_id
        && prevProps.trigger_over_drive === nextProps.trigger_over_drive
        && prevProps.isCapturing === nextProps.isCapturing;
});

const UnitComponent = ({ turn, place_no, selected_place_no, chengeSkill, chengeSelectUnit, hideMode, isCapturing, clickBuffIcon }) => {
    const filterUnit = turn.unit_list.filter(unit => unit.place_no === place_no);
    if (filterUnit.size === 0) {
        return null;
    }
    const unit = filterUnit[0];
    let icon = "img/cross.png";
    if (unit?.style?.style_info?.image_url) {
        icon = "icon/" + unit.style.style_info.image_url;
    }
    let loop_limit = 3;
    if (hideMode) {
        loop_limit = 4;
    }
    let className = "unit_select " + (place_no == selected_place_no ? "unit_selected" : "");
    return (
        <div className={className} onClick={(e) => { chengeSelectUnit(e, place_no) }}>
            <UnitSkillSelect turn={turn} unit={unit} place_no={place_no} chengeSkill={chengeSkill} select_skill_id={unit.select_skill_id} trigger_over_drive={turn.trigger_over_drive} isCapturing={isCapturing} />
            <div className="flex">
                <div>
                    <img className="unit_style" src={icon} />
                    {
                        unit?.style?.style_info ? <UnitSp unit={unit} /> : null
                    }
                </div>
                {place_no <= 2 || hideMode ?
                    <BuffIconComponent buff_list={unit.buff_list} loop_limit={loop_limit} loop_step={2} place_no={place_no} turn_number={turn.turn_number} clickBuffIcon={clickBuffIcon} />
                    : null
                }
            </div>
        </div>
    )
};