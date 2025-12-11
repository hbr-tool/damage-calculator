import React, { useState, useEffect, useMemo } from "react";
import ReactModal from "react-modal";
import { useStyleList } from "components/StyleListProvider";
import skillAttack from "data/skillAttack";
import { getCharaData, getSkillData } from "utils/common";
import { SKILL_ID, ATTRIBUTE, STATUS_KBN, JEWEL_TYPE, JEWEL_EXPLAIN, COST_TYPE } from 'utils/const';
import { getCharaIdToMember, getSkillPower, getStatUp, getApplyGradient, getCostVariable, getStatus } from "./logic";
import attribute from 'assets/attribute';
import { AttackLineChart } from "./SimpleLineChart";

const TYPE_PHYSICAL = ["none", "slash", "stab", "strike"];
const TYPE_ELEMENT = ["none", "fire", "ice", "thunder", "light", "dark"];

const AttackList = ({ attackInfo, setAttackInfo, selectSkillLv, setSelectSkillLv,
    abilitySettingMap, passiveSettingMap, state, dispatch,
}) => {
    const { styleList } = useStyleList();
    const [modal, setModal] = useState(false);

    const handleChangeAttackId = (value) => {
        let selectAttackInfo = getAttackInfo(value);
        if (selectAttackInfo) {
            const physical = getCharaData(selectAttackInfo.chara_id).physical;
            selectAttackInfo.attack_physical = physical;
            setSelectSkillLv(selectAttackInfo.max_lv);
            setAttackInfo(selectAttackInfo);
        }
    }

    const getAttackInfo = (value) => {
        const filteredAttack = memberAttackList.filter((obj) => obj.attack_id === value);
        return filteredAttack.length > 0 ? filteredAttack[0] : undefined;
    }

    const [checkSpecial, setCheckSpecial] = useState(true);

    const memberAttackList = useMemo(() => {
        let memberAttackList = [];
        for (let memberInfo of styleList.selectStyleList) {
            if (!memberInfo) continue;
            const charaId = memberInfo.styleInfo.chara_id;
            const styleId = memberInfo.styleInfo.style_id;
            const matchedSkill = skillAttack.filter(skill =>
                skill.chara_id === charaId &&
                (skill.style_id === styleId || skill.style_id === 0) &&
                (!checkSpecial || skill.attack_id < 1000)
            ).filter(skill => !(memberInfo.exclusionSkillList.includes(skill.skill_id))
            ).sort((x, y) => y.style_id - x.style_id || y.skill_id - x.skill_id);
            if (matchedSkill.length > 0) {
                memberAttackList.push(...matchedSkill);
            }
        }
        return memberAttackList;
    }, [checkSpecial, styleList.selectStyleList]);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (!attackInfo || !memberAttackList.some(a => a.attack_id === attackInfo.attack_id)) {
            if (memberAttackList.length > 0) {
                const firstAttack = memberAttackList[0];
                const newInfo = {
                    ...firstAttack,
                    attack_physical: getCharaData(firstAttack.chara_id).physical,
                };
                setAttackInfo(newInfo);
                setSelectSkillLv(newInfo.max_lv);
            } else {
                setAttackInfo(undefined);
                setSelectSkillLv(undefined);
            }
        }
    }, [memberAttackList, attackInfo]);
    /* eslint-enable react-hooks/exhaustive-deps */

    return (
        <div className="attack_area surround_area mx-auto mt-2 adjust_width">
            <label className="area_title">攻 撃</label>
            <div className="flex">
                <select className="ml-6" id="attack_list" value={attackInfo?.attack_id} onChange={e => handleChangeAttackId(Number(e.target.value))}>
                    {styleList.selectStyleList.filter(memberInfo => memberInfo).map((memberInfo, index) => {
                        let charaData = getCharaData(memberInfo.styleInfo.chara_id)
                        return (
                            <optgroup key={`chara${memberInfo.styleInfo.chara_id}`} label={charaData.chara_name}>
                                {memberAttackList.filter(obj =>
                                    obj.chara_id === memberInfo.styleInfo.chara_id
                                ).map((skill, index) => {
                                    return (
                                        <option key={`attack${skill.attack_id}`} value={skill.attack_id} data-chara_id={skill.chara_id}>
                                            {skill.attack_name}
                                        </option>
                                    );
                                })}
                            </optgroup>
                        )
                    })}
                </select>
                {attackInfo && (() => {
                    const { attack_element, range_area } = attackInfo;
                    const attack_physical = getCharaData(attackInfo.chara_id).physical;
                    return (
                        <>
                            <div className="lv">
                                <select id="skill_lv" value={selectSkillLv} onChange={e => setSelectSkillLv(e.target.value)} >
                                    {attackInfo && (() =>
                                        Array.from({ length: attackInfo.max_lv }, (_, i) => i + 1).map(value => (
                                            <option key={`skill${value}`} value={value}>
                                                {value}
                                            </option>
                                        ))
                                    )()}
                                </select>
                            </div>
                            <img className="w-6 h-6" src={attribute[TYPE_PHYSICAL[attack_physical]]} alt="物理" />
                            <img className="w-6 h-6" src={attribute[TYPE_ELEMENT[attack_element]]} alt="属性" />
                            <span className={`range_area ${range_area === 1 ? "unit" : "all"}`}>
                                {range_area === 1 ? "単体" : "全体"}
                            </span>
                        </>
                    );
                })()}
            </div>
            <div className="ml-6">
                <div className="mb-2">
                    <input id="skill_special_display" type="checkbox" checked={checkSpecial} onChange={e => setCheckSpecial(e.target.checked)} />
                    <label className="checkbox01" htmlFor="skill_special_display">
                        EXスキル以外を非表示にする
                    </label>
                    <input type="button" className="w-20 ml-12 default" value="スキル詳細" onClick={() => setModal(true)} />
                </div>
                <SkillUnique attackInfo={attackInfo} setAttackInfo={setAttackInfo} />
            </div>
            <ReactModal
                isOpen={modal}
                onRequestClose={() => setModal(false)}
                className={"modal-content " + (modal ? "modal-content-open" : "")}
                overlayClassName={"modal-overlay " + (modal ? "modal-overlay-open" : "")}
            >
                <AttackDetail attackInfo={attackInfo} setAttackInfo={setAttackInfo}
                    selectSkillLv={selectSkillLv} styleList={styleList} state={state}
                    abilitySettingMap={abilitySettingMap} passiveSettingMap={passiveSettingMap} closeModal={() => setModal(false)} />
            </ReactModal>
        </div >
    )
};

const SkillUnique = ({ attackInfo, setAttackInfo }) => {
    if (!attackInfo) return null;

    const { skill_id } = attackInfo;

    if (skill_id === SKILL_ID.MEGA_DESTROYER) {
        return <YamawakiServant attackInfo={attackInfo} setAttackInfo={setAttackInfo} />;
    }

    if (attackInfo.rest_dp) {
        let dpRate = attackInfo.dp_rate ? attackInfo.dp_rate : 100;
        let background = getApplyGradient("#4F7C8B", dpRate / 1.5);
        return (
            <div className="skill_unique">
                <div className="flex">
                    自身のDP
                    <div className="dp_gauge">
                        <input type="range" className="player_dp_range dp_range w-[160px]"
                            value={dpRate} max="150" min="0" step="1" style={{ background: background }}
                            onChange={e => { setAttackInfo({ ...attackInfo, dp_rate: e.target.value }); }}
                        />
                        <output className="gauge_rate">{dpRate}%</output>
                    </div>
                </div>
            </div>
        );
    }

    if (attackInfo.rest_sp) {
        let costSp = attackInfo.cost_sp ? attackInfo.cost_sp : 30;
        return (
            <div className="skill_unique">
                <div className="flex">
                    残りSP
                    <input type="number" className="ml-2 w-12" max="30" min="0" id="skill_unique_sp" value={costSp}
                        onChange={e => setAttackInfo({ ...attackInfo, cost_sp: e.target.value })} />
                </div>
            </div>
        );
    }
    return null;
}

const YamawakiServant = ({ attackInfo, setAttackInfo }) => {
    const [servantCount, setServantCount] = React.useState(1);
    const handleChangeServantCount = (servantCount) => {
        let val = 0;
        if (servantCount < 2) {
            val = 300;
        } else if (servantCount < 4) {
            val = 350;
        } else {
            val = 400;
        }
        const newAttackInfo = { ...attackInfo, servantCount: servantCount, penetration: val };
        if (!newAttackInfo.collect) {
            newAttackInfo.collect = {};
        }
        newAttackInfo.collect.sphalf = servantCount >= 3;
        setServantCount(servantCount);
        setAttackInfo(newAttackInfo);
    }

    return (
        <div className="skill_unique">
            <div className="flex">
                山脇様のしもべ
                <select value={servantCount} onChange={e => handleChangeServantCount(Number(e.target.value))} >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}人</option>
                    ))}
                </select>
            </div>
        </div>
    );
}


const AttackDetail = ({ attackInfo, setAttackInfo, selectSkillLv, styleList, state, abilitySettingMap, passiveSettingMap, closeModal }) => {
    const minPower = attackInfo.min_power * (1 + 0.05 * (selectSkillLv - 1));
    const maxPower = attackInfo.max_power * (1 + 0.02 * (selectSkillLv - 1));

    const memberInfo = getCharaIdToMember(styleList, attackInfo.chara_id);
    const enemyInfo = state.enemyInfo;
    const skillInfo = getSkillData(attackInfo.skill_id);

    let statUp = getStatUp(styleList, state, memberInfo, attackInfo.collect, abilitySettingMap, passiveSettingMap);
    let enemyStatDown = 0;
    if (attackInfo.collect?.hacking) {
        enemyStatDown = 100;
    } else if (attackInfo.collect?.misfortune) {
        enemyStatDown = 20;
    }
    let criticalStatDown = Math.max(enemyStatDown, 50);
    let skillPower = getSkillPower(attackInfo, selectSkillLv, memberInfo, statUp, enemyInfo, enemyStatDown);
    let criticalPower = getSkillPower(attackInfo, selectSkillLv, memberInfo, statUp, enemyInfo, criticalStatDown);

    let enemyStat = Number(enemyInfo.enemy_stat);
    let status = getStatus(attackInfo, memberInfo, statUp);

    const jpnName = ["", "力", "器用さ", "体力", "精神", "知性", "運"];
    // 宝珠レベル
    let jewelLv = 0;
    const jewelType = memberInfo.styleInfo.jewel_type;
    if (jewelType === JEWEL_TYPE.ATTACK_UP) {
        jewelLv = memberInfo.jewelLv;
    }
    // 消費SP
    let spCost = 0;
    if (skillInfo.cost_type === COST_TYPE.SP) {
        spCost = getCostVariable(skillInfo.use_cost, attackInfo.collect, memberInfo, abilitySettingMap, passiveSettingMap);
    }
    return (
        <div className="modal text-left mx-auto p-6">
            <div>
                <span className="damage_label">スキル詳細</span>
                <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="w-[350px] mx-auto grid grid-cols-[2fr_3fr] text-center">
                <span>スキル</span>
                <span>{attackInfo.attack_name}</span>
                <div></div>
                <div className="flex justify-center items-center h-full">
                    <div className="flex">
                        <img className="w-6 h-6" src={attribute[TYPE_PHYSICAL[attackInfo.attack_physical]]} alt="物理" />
                        <img className="w-6 h-6" src={attribute[TYPE_ELEMENT[attackInfo.attack_element]]} alt="属性" />
                        <span className={`range_area ${attackInfo.range_area === 1 ? "unit" : "all"}`}>
                            {attackInfo.range_area === 1 ? "単体" : "全体"}
                        </span>
                    </div>
                </div>
                <span>攻撃力</span>
                <span>{`${minPower.toLocaleString()}～${maxPower.toLocaleString()}`}</span>
                <div></div>
                <span>(スキルLv{selectSkillLv})</span>
                <span>破壊係数</span>
                <span>{attackInfo.destruction}%</span>
                <span>HIT数</span>
                <span>{attackInfo.hit_count}</span>
                <span>消費SP</span>
                <span>{spCost}</span>
                {skillInfo.skill_attribute === ATTRIBUTE.SP_HALF &&
                    <>
                        <span>消費SP半減</span>
                        <div className="text-center status_checkbox">
                            <input type="checkbox" id="sphalf" checked={attackInfo.collect?.sphalf}
                                onChange={(e) => setAttackInfo({ ...attackInfo, collect: { ...attackInfo.collect, sphalf: e.target.checked } })} />
                            <label htmlFor="sphalf" className="checkbox01"></label>
                        </div>
                    </>
                }
                {skillInfo.skill_attribute === ATTRIBUTE.SP_ZERO &&
                    <>
                        <span>消費SP無し</span>
                        <div className="text-center status_checkbox">
                            <input type="checkbox" id="spzero" checked={attackInfo.collect?.spzero}
                                onChange={(e) => setAttackInfo({ ...attackInfo, collect: { ...attackInfo.collect, spzero: e.target.checked } })} />
                            <label htmlFor="spzero" className="checkbox01"></label>
                        </div>
                    </>
                }
                <span>参照ステータス</span>
                <span>
                    {attackInfo.ref_status_1 !== 0 ? <span className={`ref_status ${STATUS_KBN[attackInfo.ref_status_1]}`}>
                        {jpnName[attackInfo.ref_status_1]}</span> : null}
                    {attackInfo.ref_status_1 !== 0 && attackInfo.ref_status_2 !== 0 ? <span className={`ref_status ${STATUS_KBN[attackInfo.ref_status_1]}`}>
                        {jpnName[attackInfo.ref_status_1]}</span> : null}
                    {attackInfo.ref_status_2 !== 0 ? <span className={`ref_status ${STATUS_KBN[attackInfo.ref_status_2]}`}>
                        {jpnName[attackInfo.ref_status_2]}</span> : null}
                    {attackInfo.ref_status_3 !== 0 ? <span className={`ref_status ${STATUS_KBN[attackInfo.ref_status_3]}`}>
                        {jpnName[attackInfo.ref_status_3]}</span> : null}
                </span>
                {attackInfo.dp_damege !== 0 ? (
                    <>
                        <span>DP補正</span>
                        <span>+{attackInfo.dp_damege}%</span>
                    </>
                ) : null}
                {attackInfo.hp_damege !== 0 ? (
                    <>
                        <span>HP補正</span>
                        <span>+{attackInfo.hp_damege}%</span>
                    </>
                ) : null}
                {attackInfo.penetration && (
                    <>
                        <span>貫通クリティカル</span>
                        <span>+{attackInfo.penetration}%</span>
                    </>
                )}
            </div>
            <AttackLineChart status={Math.floor(status)} attackInfo={attackInfo} enemyStat={enemyStat} enemyStatDown={enemyStatDown} jewelLv={jewelLv} skillLv={selectSkillLv} />
            <div className="mt-2">
                <span className="damage_label">使用者情報</span>
            </div>
            <div className="w-[350px] mx-auto grid grid-cols-2 text-center">
                <span>ステータス</span>
                <span>{Math.floor(status * 100) / 100}</span>
                <span>宝珠強化</span>
                <span className="explain">{`${JEWEL_EXPLAIN[memberInfo.styleInfo.jewel_type]}(Lv${memberInfo.jewelLv})`}</span>
                <span>闘志</span>
                <div className="text-center status_checkbox">
                    <input type="checkbox" id="fightingspirit" checked={attackInfo.collect?.fightingspirit}
                        onChange={(e) => setAttackInfo({ ...attackInfo, collect: { ...attackInfo.collect, fightingspirit: e.target.checked } })} />
                    <label htmlFor="fightingspirit" className="checkbox01"></label>
                </div>
                <span>厄</span>
                <div className="text-center status_checkbox">
                    <input type="checkbox" id="misfortune" checked={attackInfo.collect?.misfortune}
                        onChange={(e) => setAttackInfo({ ...attackInfo, collect: { ...attackInfo.collect, misfortune: e.target.checked } })} />
                    <label htmlFor="misfortune" className="checkbox01"></label>
                </div>
                <span>ハッキング</span>
                <div className="text-center status_checkbox">
                    <input type="checkbox" id="hacking" checked={attackInfo.collect?.hacking}
                        onChange={(e) => setAttackInfo({ ...attackInfo, collect: { ...attackInfo.collect, hacking: e.target.checked } })} />
                    <label htmlFor="hacking" className="checkbox01"></label>
                </div>
            </div>
            <div className="mt-2">
                <label className="damage_label">スキル攻撃力</label>
            </div>
            <div className="w-[350px] mx-auto grid grid-cols-2 text-center">
                <span>クリティカル</span>
                <span>{criticalPower}</span>
                <span>通常ダメージ</span>
                <span>{skillPower}</span>
            </div>
        </div>
    )
}

export default AttackList;