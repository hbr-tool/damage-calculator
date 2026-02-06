import React from "react";
import { getCharaData, getSkillData } from "utils/common";
import { SKILL_ID, ABILITY_ID, BUFF, ROLE, ATTRIBUTE, SKILL, COST_TYPE } from "utils/const";
import { PHYSICAL_NAME, ELEMENT_NAME, ABILIRY_TIMING } from "./const";
import BuffIconComponent from "./BuffIconComponent";
import { getSkillIdToAttackInfo, getSpCost, checkAbilityExist } from "./logic";
import icons from 'assets/thumbnail';
import crossIcon from 'assets/img/cross.png';
import { changeStyle } from "utils/const";
import changeIcon from 'assets/img/IconSwitchSkill.png';

const UnitSp = ({ unit }) => {
    let unitSp;
    let unitEp = unit.ep;
    let skill = getSkillData(unit.selectSkillId);
    if (unit.spCost >= 90) {
        unitSp = 0;
    } else {
        unitSp = unit.sp + unit.overDriveSp;
        if (unitSp > 99) unitSp = 99;
        unitEp = unit.ep + unit.overDriveEp;

        if (skill.cost_type === COST_TYPE.EP) {
            unitEp -= skill.use_cost;
        } else {
            unitSp -= unit.spCost;
        }
    }

    let className = "unit_sp" + (unitSp < 0 ? " minus" : "");
    return (
        <>
            <div className={className}>
                <span>{unitSp + (unit.addSp > 0 ? ("+" + unit.addSp) : "")}</span>
                {
                    (unit.ep !== 0 ? <span className="unit_ep">{`${unitEp}`}</span> : "")
                }
            </div>
        </>
    )
}

const UnitSkillSelect = React.memo(({ turn, field, unit, placeNo, selectSkillId, triggerOverDrive, chengeSkill, isCapturing }) => {
    if (unit.blank) {
        return (
            <select className={"unit_skill invisible"} >
            </select>
        );
    }
    let skillList = unit.skillList
    if (placeNo < 3) {
        skillList = skillList.filter(skill => {
            // 夜醒,謀略
            const ADDTIONAL_SKILL_ID = [SKILL_ID.WAKING_NIGHT, SKILL_ID.CONSPIRACY];
            if (ADDTIONAL_SKILL_ID.includes(skill.skill_id)) {
                return !turn.additionalTurn;
            }
            if (skill.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
                // 通常攻撃
                return unit.style.styleInfo.role !== ROLE.ADMIRAL;
            }
            if (skill.skill_attribute === ATTRIBUTE.COMMAND_ACTION) {
                // 指揮行動
                return unit.style.styleInfo.role === ROLE.ADMIRAL;
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
        skillList = unit.skillList.filter(skill => {
            if (skill.skill_id === SKILL.AUTO_PURSUIT) {
                if (checkAbilityExist(unit[`ability_${ABILIRY_TIMING.OTHER}`], ABILITY_ID.AUTO_PURSUIT)) {
                    // 自動追撃
                    return true;
                }
            }
            if (skill.skill_id === SKILL.NONE) {
                // なし
                return true;
            }
            if (skill.skill_id === SKILL.PURSUIT) {
                // 追撃
                return true;
            }
            if (skill.skill_attribute === ATTRIBUTE.PURSUIT_ONLY) {
                // 追撃専用
                return true;
            }
            return false;
        })
    }

    const recoil = unit.buffList.filter((obj) => obj.buff_kind === BUFF.RECOIL);
    let not_action = (recoil.length > 0 || !unit.style || (turn.additionalTurn && !unit.additionalTurn && placeNo <= 2))
    let className = "unit_skill " + (not_action ? "invisible" : "");
    let physical = getCharaData(unit.style.styleInfo.chara_id).physical;
    return (<select className={className} onChange={(e) => chengeSkill(Number(e.target.value), placeNo)} value={unit.selectSkillId} >
        {skillList.filter((obj) => obj.skill_id === unit.selectSkillId || !isCapturing).map(skill => {
            let text = skill.skill_name;
            let spCost = 0;
            if (skill.skill_attribute === ATTRIBUTE.NORMAL_ATTACK) {
                text += `(${PHYSICAL_NAME[physical]}・${ELEMENT_NAME[unit.normalAttackElement]})`;
            } else if (skill.skill_id === 0 || skill.skill_id === 2) {
            } else if (skill.skill_attribute === ATTRIBUTE.COMMAND_ACTION) {
            } else if (skill.skill_attribute === ATTRIBUTE.PURSUIT) {
                text += `(${PHYSICAL_NAME[physical]})`;
            } else {
                let attack = "";
                const attackInfo = getSkillIdToAttackInfo(turn, skill.skill_id);
                if (attackInfo) {
                    attack = `${PHYSICAL_NAME[physical]}・${ELEMENT_NAME[attackInfo.attack_element]}/`;
                }
                if (skill.cost_type === COST_TYPE.EP) {
                    text += `(${attack}EP${skill.use_cost})`;
                } else if (skill.cost_type === COST_TYPE.CT) {
                    text += `(${attack}CT${skill.use_cost}T)`;
                } else if (skill.cost_type === COST_TYPE.OVERDRIVE) {
                    text += `(${attack}OD${skill.use_cost}%)`;
                } else if (skill.cost_type === COST_TYPE.TOKEN) {
                    text += `(${attack}token${skill.use_cost})`;
                } else {
                    spCost = getSpCost(turn, skill, unit);
                    text += `(${attack}${spCost})`;
                }
            }
            return (<option value={skill.skill_id} key={`skill${skill.skill_id}${skill.attack_id}`}>{text}</option>)
        }
        )}
    </select>
    );
}, (prevProps, nextProps) => {
    return prevProps.turn === nextProps.turn
        && prevProps.field === nextProps.field
        && prevProps.unit === nextProps.unit
        && prevProps.placeNo === nextProps.placeNo && prevProps.selectSkillId === nextProps.selectSkillId
        && prevProps.triggerOverDrive === nextProps.triggerOverDrive
        && prevProps.isCapturing === nextProps.isCapturing;
});

const UnitComponent = ({ turn, placeNo, selectedPlaceNo, chageStyle, chengeSkill, chengeSelectUnit, hideMode, isCapturing, clickBuffIcon }) => {
    const filterUnit = turn.unitList.filter(unit => unit.placeNo === placeNo);
    const unit = filterUnit[0];

    let icon = icons[unit?.style?.styleInfo?.image_url] || crossIcon;
    let loopLimit = 3;
    if (hideMode) {
        loopLimit = 4;
    }
    let className = "relative unit_select " + (placeNo === selectedPlaceNo ? "unit_selected" : "");
    const selectSkill = turn.userOperation.selectSkill[placeNo];
    let targetIcon = undefined;
    if (selectSkill && selectSkill.skill_id && selectSkill.buffTargetCharaId) {
        const targetUnit = turn.unitList.filter(unit => unit?.style?.styleInfo.chara_id === selectSkill.buffTargetCharaId)[0];
        targetIcon = icons[targetUnit?.style?.styleInfo?.image_url]
    }

    return (
        <div className={className} onClick={(e) => { chengeSelectUnit(e, placeNo) }}>
            <UnitSkillSelect turn={turn} field={turn.field}
                unit={unit} placeNo={placeNo} chengeSkill={chengeSkill} selectSkillId={unit.selectSkillId} triggerOverDrive={turn.triggerOverDrive} isCapturing={isCapturing} />
            <div className="flex">
                <div>
                    <img className="unit_style" src={icon} alt="" />
                    {
                        unit?.style?.styleInfo ? <UnitSp unit={unit} /> : null
                    }
                    {changeStyle[unit?.style?.styleInfo.style_id] &&
                        <img
                            className="absolute style_change bottom-[0px] left-[0px] w-[24px] h-[24px] cursor-grab"
                            src={changeIcon}
                            alt={"変更"}
                            onClick={() => { chageStyle(placeNo, changeStyle[unit?.style?.styleInfo.style_id]) }}
                        />
                    }
                    {targetIcon &&
                        <div className="absolute bottom-0 left-[24px] w-[24px] h-[24px] rounded-full ring-2 ring-red-500 overflow-hidden">
                            <img
                                className="absolute style_change"
                                src={targetIcon}
                                alt={"対象"}
                            />
                        </div>
                    }
                </div>
                {placeNo <= 2 || hideMode ?
                    <BuffIconComponent buffList={unit.buffList} loopLimit={loopLimit} loopStep={2} placeNo={placeNo} turnNumber={turn.turnNumber} clickBuffIcon={clickBuffIcon} />
                    : null
                }
            </div>
        </div>
    )
};

export default UnitComponent;