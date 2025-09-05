import React from "react";
import {
    BUFF, EFFECT, STATUS_KBN, JEWEL_EXPLAIN, ATTRIBUTE
} from "utils/const";
import {
    DEBUFF_LIST, KIND_ATTACKUP, KIND_DEFENSEDOWN,
    getCharaIdToMember, getCharaIdToTroopKbn, getEffectSize, getStatUp, getStatus, getCostVariable
} from "./logic";
import { getSkillData, getPassiveInfo, getAbilityInfo } from "utils/common";
import { BuffLineChart, DebuffLineChart } from "./SimpleLineChart";
import { CHARA_ID, JEWEL_TYPE } from "utils/const";

const BUFF_KIND_TO_JEWEL_TYPE = {
    [BUFF.ATTACKUP]: JEWEL_TYPE.SKILL_ATTACKUP,
    [BUFF.ELEMENT_ATTACKUP]: JEWEL_TYPE.SKILL_ATTACKUP,
    [BUFF.CRITICALRATEUP]: JEWEL_TYPE.CRITICALRATE_UP,
    [BUFF.ELEMENT_CRITICALRATEUP]: JEWEL_TYPE.CRITICALRATE_UP,
    [BUFF.ETERNAL_OARH]: JEWEL_TYPE.SKILL_ATTACKUP,
};

const BUFF_LIST = [BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP, BUFF.MINDEYE, BUFF.CHARGE,
BUFF.CRITICALRATEUP, BUFF.ELEMENT_CRITICALRATEUP, BUFF.ETERNAL_OARH];

const BuffDetail = ({ buffInfo, styleList, state, index, buffSettingMap, setBuffSettingMap,
    abilitySettingMap, passiveSettingMap, resonanceList, closeModal }) => {
    const charaId = buffInfo.use_chara_id;
    const memberInfo = getCharaIdToMember(styleList, charaId);
    const enemyInfo = state.enemyInfo;
    const isBuffChart = BUFF_LIST.includes(buffInfo.buff_kind);
    const isDebuff = DEBUFF_LIST.includes(buffInfo.buff_kind);
    const buffSetting = buffSettingMap[buffInfo.buff_kind][index][buffInfo.key];
    const skillInfo = getSkillData(buffInfo.skill_id);
    const isJewel = isDebuff || [BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP, BUFF.CRITICALRATEUP, BUFF.ELEMENT_CRITICALRATEUP].includes(buffInfo.buff_kind)

    const changeBuffSetting = (item, value) => {
        const updateSettingMap = { ...buffSettingMap };
        const buffSetting = updateSettingMap[buffInfo.buff_kind][index][buffInfo.key]
        if (!buffSetting["collect"]) {
            buffSetting["collect"] = {};
        }
        buffSetting["collect"] = { ...buffSetting["collect"], [item]: value };;
        buffSetting.effect_size = getEffectSize(styleList, buffInfo, buffSetting, memberInfo, state,
            abilitySettingMap, passiveSettingMap, resonanceList);

        setBuffSettingMap(updateSettingMap);
    };

    let statUp = getStatUp(styleList, state, memberInfo, buffSetting.collect, abilitySettingMap, passiveSettingMap);
    let enemyStatDown = 0;
    let enemyStat = 0;
    if (isDebuff) {
        enemyStat = enemyInfo.enemy_stat;
        if (buffSetting.collect?.hacking) {
            enemyStatDown = 100;
        } else if (buffSetting.collect?.misfortune) {
            enemyStatDown = 20;
        }
    }
    let status = getStatus(buffInfo, memberInfo, statUp)

    const effectSize = getEffectSize(styleList, buffInfo, buffSetting, memberInfo, state,
        abilitySettingMap, passiveSettingMap, resonanceList);

    const jpnName = ["", "力", "器用さ", "体力", "精神", "知性", "運"];

    const effectTypeMap = new Map([
        [KIND_ATTACKUP, EFFECT.GIVEATTACKBUFFUP],
        [KIND_DEFENSEDOWN, EFFECT.GIVEDEFFENCEDEBUFFUP],
        [[BUFF.FIELD], EFFECT.FIELD_STRENGTHEN]
    ]);

    function getAbilityListByBuff(buffKind, charaId) {
        for (const [kindList, effectType] of effectTypeMap) {
            if (kindList.includes(buffKind)) {
                return Object.values(abilitySettingMap)
                    .filter(ability => ability.chara_id === charaId)
                    .filter(ability => {
                        const abilityInfo = getAbilityInfo(ability.ability_id);
                        return abilityInfo.effect_type === effectType;
                    });
            }
        }
        return [];
    }

    function getPassiveListByBuff(buffKind, charaId) {
        for (const [kindList, effectType] of effectTypeMap) {
            if (kindList.includes(buffKind)) {
                return Object.values(passiveSettingMap)
                    .filter(passive => passive.chara_id === charaId)
                    .filter(passive => {
                        const passiveInfo = getPassiveInfo(passive.skill_id);
                        return passiveInfo.effect_type === effectType;
                    });
            }
        }
        return [];
    }

    const abilityList = getAbilityListByBuff(buffInfo.buff_kind, charaId);
    const passiveList = getPassiveListByBuff(buffInfo.buff_kind, charaId);

    // 宝珠レベル
    let jewelLv = 0;
    const kind = buffInfo.buff_kind;
    const jewelType = memberInfo.styleInfo.jewel_type;
    if ((DEBUFF_LIST.includes(kind) && jewelType === JEWEL_TYPE.SKILL_DEBUFFUP) ||
        (BUFF_KIND_TO_JEWEL_TYPE[kind] && jewelType === BUFF_KIND_TO_JEWEL_TYPE[kind])) {
        jewelLv = memberInfo.jewelLv;
    }

    // 消費SP
    let spCost = getCostVariable(skillInfo.sp_cost, buffSetting.collect, memberInfo, abilitySettingMap, passiveSettingMap)

    // バフ強化
    let strengthen = false;
    if ([BUFF.ATTACKUP, BUFF.ELEMENT_ATTACKUP].includes(buffInfo.buff_kind)) {
        let troopsBuff = getCharaIdToTroopKbn(styleList, CHARA_ID.STRENGTH_BUFF);
        if (buffInfo.troopKbn === troopsBuff) {
            strengthen = true;
        }
    }
    if (isDebuff) {
        if (charaId === CHARA_ID.MIYA) {
            strengthen = true;
        }
        let troopsDebuff = getCharaIdToTroopKbn(styleList, CHARA_ID.STRENGTH_DEBUFF);
        if (buffInfo.troopKbn === troopsDebuff) {
            strengthen = true;
        }
    }
    return (
        <div className="modal text-left p-6 mx-auto">
            <div>
                <span className="damage_label">スキル詳細</span>
                <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="w-[350px] mx-auto grid grid-cols-2 text-center">
                <span>スキル</span>
                <span>{buffInfo.buff_name}</span>
                <span>効果量</span>
                <span>{getBuffEffectDisplay(buffInfo, buffSetting.skill_lv)}</span>
                <div></div>
                <span>(スキルLv{buffSetting.skill_lv})</span>
                <div>消費SP</div>
                <span>{spCost}</span>
                {skillInfo.skill_attribute === ATTRIBUTE.SP_HALF &&
                    <>
                        <span>消費SP半減</span>
                        <div className="text-center status_checkbox">
                            <input type="checkbox" id="sphalf" checked={buffSetting.collect?.sphalf}
                                onChange={(e) => changeBuffSetting("sphalf", e.target.checked)}
                            />
                            <label htmlFor="sphalf" className="checkbox01"></label>
                        </div>
                    </>
                }
                {skillInfo.skill_attribute === ATTRIBUTE.SP_ZERO &&
                    <>
                        <span>消費SP無し</span>
                        <div className="text-center status_checkbox">
                            <input type="checkbox" id="spzero" checked={buffSetting.collect?.spzero}
                                onChange={(e) => changeBuffSetting("spzero", e.target.checked)}
                            />
                            <label htmlFor="spzero" className="checkbox01"></label>
                        </div>
                    </>
                }
                {strengthen &&
                    <>
                        <span>強化</span>
                        <div className="text-center status_checkbox">
                            <input type="checkbox" id="strengthen" checked={buffSetting.collect?.strengthen}
                                onChange={(e) => changeBuffSetting("strengthen", e.target.checked)}
                            />
                            <label htmlFor="strengthen" className="checkbox01"></label>
                        </div>
                    </>
                }
                {buffInfo.ref_status_1 !== 0 && buffInfo.min_power !== buffInfo.max_power &&
                    <>
                        <span>参照ステータス</span>
                        <span>
                            {buffInfo.ref_status_1 !== 0 ? <span className={`ref_status ${STATUS_KBN[buffInfo.ref_status_1]}`}>
                                {jpnName[buffInfo.ref_status_1]}</span> : null}
                            {buffInfo.ref_status_1 !== 0 && buffInfo.ref_status_2 !== 0 ? <span className={`ref_status ${STATUS_KBN[buffInfo.ref_status_1]}`}>
                                {jpnName[buffInfo.ref_status_1]}</span> : null}
                            {buffInfo.ref_status_2 !== 0 ? <span className={`ref_status ${STATUS_KBN[buffInfo.ref_status_2]}`}>
                                {jpnName[buffInfo.ref_status_2]}</span> : null}
                        </span>
                    </>
                }
            </div>
            {isBuffChart &&
                <>
                    <BuffLineChart status={Math.floor(status)} buffInfo={buffInfo} jewelLv={jewelLv} skillLv={buffSetting.skill_lv} />
                    <div className="text-right text-sm">※バフ強化適用前の効果量です</div>
                </>
            }
            {isDebuff &&
                <>
                    <DebuffLineChart status={Math.floor(status)} buffInfo={buffInfo} enemyStat={enemyStat - enemyStatDown} jewelLv={jewelLv} skillLv={buffSetting.skill_lv} />
                    <div className="text-right text-sm">※デバフ強化適用前の効果量です</div>
                </>
            }
            {/* {buffInfo.param_limit !== 0 && buffInfo.min_power !== buffInfo.max_power && ( */}
            <>
                <div className="mt-2">
                    <span className="damage_label">使用者情報</span>
                </div>
                <div className="w-[350px] mx-auto grid grid-cols-2 text-center">
                    {buffInfo.ref_status_1 !== 0 && buffInfo.min_power !== buffInfo.max_power &&
                        <>
                            <span>ステータス</span>
                            <span>{Math.floor(status * 100) / 100}</span>
                            {isJewel &&
                                <>
                                    <span>宝珠強化</span>
                                    <span className="explain">{`${JEWEL_EXPLAIN[memberInfo.styleInfo.jewel_type]}(Lv${memberInfo.jewelLv})`}</span>
                                </>
                            }
                            <span>闘志</span>
                            <div className="text-center status_checkbox">
                                <input type="checkbox" id="fightingspirit" checked={buffSetting.collect?.fightingspirit}
                                    onChange={(e) => changeBuffSetting("fightingspirit", e.target.checked)}
                                />
                                <label htmlFor="fightingspirit" className="checkbox01"></label>
                            </div>
                            {isDebuff &&
                                <>
                                    <span>厄</span>
                                    <div className="text-center status_checkbox">
                                        <input type="checkbox" id="misfortune" checked={buffSetting.collect?.misfortune}
                                            onChange={(e) => changeBuffSetting("misfortune", e.target.checked)}
                                        />
                                        <label htmlFor="misfortune" className="checkbox01"></label>
                                    </div>
                                    <span>ハッキング</span>
                                    <div className="text-center status_checkbox">
                                        <input type="checkbox" id="hacking" checked={buffSetting.collect?.hacking}
                                            onChange={(e) => changeBuffSetting("hacking", e.target.checked)}
                                        />
                                        <label htmlFor="hacking" className="checkbox01"></label>
                                    </div>
                                </>
                            }
                        </>
                    }
                    <span>最終効果量</span>
                    <span>{Math.floor(effectSize * 100) / 100}%</span>
                </div>
            </>
            {/* )} */}
            {abilityList.length > 0 &&
                <>
                    <div className="mt-2">
                        <span className="damage_label">関連アビリティ</span>
                    </div>
                    <div className="w-[350px] mx-auto">
                        {abilityList.map((ability, index) => {
                            const key = ability.key;
                            const abilityInfo = getAbilityInfo(ability.ability_id);
                            return (
                                <div key={key} className="explain">
                                    <input type="checkbox" className="ability" id={key}
                                        checked={abilitySettingMap[key].checked}
                                        disabled={abilitySettingMap[key].disabled} />
                                    <label htmlFor={key}
                                        className="checkbox01">
                                        {`${abilityInfo.ability_name}:${abilityInfo.ability_short_explan}`}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </>
            }
            {passiveList.length > 0 &&
                <>
                    <div className="mt-2">
                        <span className="damage_label">関連パッシブ</span>
                    </div>
                    <div className="w-[350px] mx-auto">
                        {passiveList.map((passive, index) => {
                            const key = passive.key;
                            const passiveInfo = getPassiveInfo(passive.skill_id);
                            return (
                                <div key={key} className="explain">
                                    <input type="checkbox" className="ability" id={key} checked={passiveSettingMap[key].checked} />
                                    <label htmlFor={key}
                                        className="checkbox01">
                                        {`${passiveInfo.passive_name}:${passiveInfo.passive_short_explan}`}
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </>
            }
        </div>
    )
}


const getBuffEffectDisplay = (buffInfo, skillLv) => {
    let minPower;
    let maxPower;
    switch (buffInfo.buff_kind) {
        case BUFF.FUNNEL:
            let unit = buffInfo.effect_size;
            minPower = buffInfo.min_power;
            maxPower = buffInfo.max_power;
            if (minPower === maxPower) {
                return `${unit}%×${minPower}Hit`
            } else {
                return `${unit}%×${minPower}Hit～${maxPower}Hit`
            }
        default:
            minPower = buffInfo.min_power * (1 + 0.03 * (skillLv - 1));
            maxPower = buffInfo.max_power * (1 + 0.02 * (skillLv - 1));
            if (minPower === maxPower) {
                return `${minPower.toLocaleString()}%`
            } else {
                return `${minPower.toLocaleString()}%～${maxPower.toLocaleString()}%`
            }
    }
}

export default BuffDetail;
