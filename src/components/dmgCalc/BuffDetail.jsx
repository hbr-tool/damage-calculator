import React from "react";
import {
    BUFF, EFFECT, STATUS_KBN, JEWEL_EXPLAIN, ATTRIBUTE, COST_TYPE
} from "utils/const";
import {
    getCharaIdToMember
} from "./logic";
import { getSkillData, getPassiveInfo, getPassiveEffectList, getAbilityInfo, getAbilityEffectList } from "utils/common";
import { BuffLineChart, DebuffLineChart } from "./SimpleLineChart";
import { CHARA_ID, JEWEL_TYPE } from "utils/const";
import * as constant from "utils/const";
import * as common from "utils/common";
import * as logic from "./logic";

const BUFF_LIST = [EFFECT.ATTACKUP, EFFECT.CRITICALRATEUP];
const DEBUFF_LIST = [EFFECT.DEFFENCEDOWN, EFFECT.RESISTDOWN];

const BuffDetail = ({ argument, buffInfo, index, closeModal }) => {
    const {
        styleList, state,
        buffSettingMap, setBuffSettingMap,
        abilitySettingMap, passiveSettingMap,
    } = argument;
    const charaId = buffInfo.use_chara_id;
    const memberInfo = getCharaIdToMember(styleList, charaId);
    const enemyInfo = state.enemyInfo;
    const buffKey = logic.getBuffKey(buffInfo.effect_type, buffInfo.effect_no);
    const buffSetting = buffSettingMap[buffKey][index][buffInfo.key];
    let skillInfo = {};
    if (buffInfo.kbn === "buff") {
        skillInfo = getSkillData(buffInfo.skill_id);
    }

    let effect = null;
    // バフ強化対象
    let targetStrengthen = false;
    // ジュエル強化対象
    let targetJewelType = 0;

    switch (buffInfo.effect_type) {
        case EFFECT.GRANT_BUFF:
            switch (buffInfo.effect_no) {
                case BUFF.FUNNEL: // 連撃
                    effect = EFFECT.FUNNEL;
                    break;
                case BUFF.CRITICALRATEUP: // クリティカル率アップ
                case BUFF.ELEMENT_CRITICALRATEUP: // 属性クリティカル率アップ
                    effect = EFFECT.CRITICALRATEUP;
                    targetJewelType = JEWEL_TYPE.CRITICALRATE_UP;
                    break;
                case BUFF.CRITICALDAMAGEUP: // クリティカルダメージアップ
                case BUFF.ELEMENT_CRITICALDAMAGEUP: // 属性クリティカルダメージアップ
                    effect = EFFECT.CRITICAL_DAMAGE_UP;
                    break;
                case BUFF.MINDEYE: // 心眼
                    effect = EFFECT.ATTACKUP;
                    break;
                case BUFF.ATTACKUP: // 攻撃アップ
                case BUFF.ELEMENT_ATTACKUP: // 属性攻撃アップ
                case BUFF.ETERNAL_ATTACKUP: // 永続攻撃アップ
                    targetStrengthen = true;
                    targetJewelType = JEWEL_TYPE.ATTACK_UP;
                    effect = EFFECT.ATTACKUP;
                    break;
                default:
                    effect = EFFECT.ATTACKUP;
                    break;
            }
            break;
        case EFFECT.GRANT_DEBUFF:
            targetStrengthen = true;
            targetJewelType = JEWEL_TYPE.SKILL_DEBUFFUP;
            switch (buffInfo.effect_no) {
                case BUFF.FRAGILE: // 脆弱
                case BUFF.ETERNAL_FRAGILE: // 永続脆弱
                    effect = EFFECT.DEFFENCEDOWN;
                    break;
                case BUFF.RESISTDOWN: // 耐性ダウン
                    effect = EFFECT.RESISTDOWN;
                    break;
                default:
                    effect = EFFECT.DEFFENCEDOWN;
                    break;
            }
            break;
        default:
            effect = buffInfo.effect_type;
            break;
    }
    let isBuffChart = BUFF_LIST.includes(effect);
    let isDebuffChart = DEBUFF_LIST.includes(effect);

    const changeBuffSetting = (item, value) => {
        const updateSettingMap = { ...buffSettingMap };
        const buffSetting = updateSettingMap[buffKey][index][buffInfo.key]
        if (!buffSetting["collect"]) {
            buffSetting["collect"] = {};
        }
        buffSetting["collect"] = { ...buffSetting["collect"], [item]: value };;
        buffSetting.calcEffectSize = logic.getEffectSize(argument, buffInfo, buffSetting, memberInfo);

        setBuffSettingMap(updateSettingMap);
    };
    const handlers = {
        collect: buffSetting.collect,
        skillInfo, memberInfo,
    };
    let statUp = logic.getStatAllUp(argument, handlers);
    let enemyStatDown = 0;
    let enemyStat = 0;
    if (isDebuffChart) {
        enemyStat = Number(enemyInfo.enemy_stat) + (state.correction.stat_up || 0);
        if (buffSetting.collect?.statDown) {
            enemyStatDown = Number(buffSetting.collect.statDown);
        }
    }

    let status = 0;
    let buffEffect = null;
    if (isBuffChart || isDebuffChart) {
        buffEffect = common.getBuffEffect(buffInfo.effect_no).filter((obj) => obj.effect_type === effect)[0];
        if (!buffEffect.ref_status_1) {
            isBuffChart = false;
            isDebuffChart = false;
        } else {
            status = logic.getStatus(argument, handlers, buffEffect, statUp);
        }
    }

    const effectSize = logic.getEffectSize(argument, buffInfo, buffSetting, memberInfo);

    const jpnName = ["", "力", "器用さ", "体力", "精神", "知性", "運"];

    const effectTypeMap = new Map([
        [EFFECT.GRANT_BUFF, EFFECT.GIVEATTACKBUFFUP],
        [EFFECT.DEFFENCEDOWN, EFFECT.GIVEDEFFENCEDEBUFFUP],
        [EFFECT.FIELD_DEPLOYMENT, EFFECT.FIELD_STRENGTHEN]
    ]);

    function getAbilityListByBuff(buffKind, charaId) {
        for (const [kindList, effectType] of effectTypeMap) {
            if (kindList === buffKind) {
                return Object.values(abilitySettingMap)
                    .filter(ability => ability.chara_id === charaId)
                    .filter(ability => {
                        for (const abilityEffect of getAbilityEffectList(ability.ability_id)) {
                            if (abilityEffect.effect_type === effectType) {
                                return true;
                            }
                        }
                        return false;
                    });
            }
        }
        return [];
    }

    function getPassiveListByBuff(effect, charaId) {
        for (const [targetEffect, effectType] of effectTypeMap) {
            if (targetEffect === effect) {
                return Object.values(passiveSettingMap)
                    .filter(passive => passive.chara_id === charaId)
                    .filter(passive => {
                        for (const passiveEffect of getPassiveEffectList(passive.skill_id)) {
                            if (passiveEffect.effect_type === effectType) {
                                return true;
                            }
                        }
                        return false;
                    });
            }
        }
        return [];
    }

    const abilityList = getAbilityListByBuff(effect, charaId);
    const passiveList = getPassiveListByBuff(effect, charaId);

    // 宝珠レベル
    let jewelLv = 0;
    const jewelType = memberInfo.styleInfo.jewel_type;
    if (jewelType === targetJewelType) {
        jewelLv = memberInfo.jewelLv;
    }

    // 消費SP
    let spCost = 0;
    if (skillInfo.cost_type === COST_TYPE.SP) {
        const handlers = {
            collect: buffSetting.collect,
            skillInfo, styleList,
            memberInfo,
            abilitySettingMap, passiveSettingMap
        };
        spCost = logic.getCostVariable(argument, handlers);
    }

    // バフ強化
    let strengthen = false;
    if (targetStrengthen && EFFECT.ATTACKUP === effect) {
        let troopsBuff = logic.getCharaIdToTroopKbn(styleList, constant.CHARA_ID.STRENGTH_BUFF);
        if (buffInfo.troopKbn === troopsBuff) {
            strengthen = true;
        }
    }
    if (targetStrengthen && isDebuffChart) {
        if (charaId === CHARA_ID.MIYA) {
            strengthen = true;
        }
        let troopsDebuff = logic.getCharaIdToTroopKbn(styleList, constant.CHARA_ID.STRENGTH_DEBUFF);
        if (buffInfo.troopKbn === troopsDebuff) {
            strengthen = true;
        }
        troopsDebuff = logic.getStyleIdToTroopKbn(styleList, constant.CHARA_ID.STRENGTH_STYLE_DEBUFF);
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
                <span>{getBuffEffectDisplay(buffInfo, buffSetting.skill_lv, effect)}</span>
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
                {buffEffect && buffEffect.ref_status_1 &&
                    <>
                        <span>参照ステータス</span>
                        <span>
                            {buffEffect.ref_status_1 !== 0 ? <span className={`ref_status ${STATUS_KBN[buffEffect.ref_status_1]}`}>
                                {jpnName[buffEffect.ref_status_1]}</span> : null}
                            {buffEffect.ref_status_1 !== 0 && buffEffect.ref_status_2 !== 0 ? <span className={`ref_status ${STATUS_KBN[buffEffect.ref_status_1]}`}>
                                {jpnName[buffEffect.ref_status_1]}</span> : null}
                            {buffEffect.ref_status_2 !== 0 ? <span className={`ref_status ${STATUS_KBN[buffEffect.ref_status_2]}`}>
                                {jpnName[buffEffect.ref_status_2]}</span> : null}
                        </span>
                    </>
                }
            </div>
            {isBuffChart &&
                <>
                    <BuffLineChart status={Math.floor(status)} buffInfo={buffInfo} jewelLv={jewelLv} skillLv={buffSetting.skill_lv} effectType={effect} />
                    <div className="text-right text-sm">※バフ強化適用前の効果量です</div>
                </>
            }
            {isDebuffChart &&
                <>
                    <DebuffLineChart status={Math.floor(status)} buffInfo={buffInfo} enemyStat={enemyStat - enemyStatDown}
                        jewelLv={jewelLv} skillLv={buffSetting.skill_lv} effectType={effect} />
                    <div className="text-right text-sm">※デバフ強化適用前の効果量です</div>
                </>
            }
            <>
                <div className="mt-2">
                    <span className="damage_label">使用者情報</span>
                </div>
                <div className="w-[350px] mx-auto grid grid-cols-2 text-center">
                    {buffEffect && buffEffect.ref_status_1 &&
                        <>
                            <span>ステータス</span>
                            <span>{Math.floor(status * 100) / 100}</span>
                            {targetJewelType > 0 &&
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
                            {isDebuffChart &&
                                <>
                                    <span>敵ステータス低下</span>
                                    <div className="flex justify-center items-center">
                                        <select className="text-center w-16" id="bulkStatDown" value={buffSetting.collect?.statDown}
                                            onChange={(e) => changeBuffSetting("statDown", e.target.value)} >
                                            <option value="0">未設定</option>
                                            <option value="20">-20</option>
                                            <option value="70">-70</option>
                                            <option value="100">-100</option>
                                        </select>
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

const getBuffEffectDisplay = (effect, skillLv, effectType) => {
    let minPower;
    let maxPower;
    const buffEffect = common.getBuffEffectType(effect.effect_no, effectType);
    const skillMin = buffEffect.effect_size ?? effect.effect_size ?? effect.min_power;
    const skillMax = buffEffect.effect_size ?? effect.effect_size ?? effect.max_power;
    switch (effect.effect_type) {
        case EFFECT.FIELD_DEPLOYMENT:
            return `${effect.effect_size.toLocaleString()}%`;
        case EFFECT.GRANT_BUFF:
            switch (effect.effect_no) {
                case BUFF.FUNNEL:
                    const unit = effect.effect_size;
                    const effectCount = effect.effect_count;
                    return `${unit}%×${effectCount}Hit`
                default:
                    minPower = skillMin * (1 + 0.03 * (skillLv - 1));
                    maxPower = skillMax * (1 + 0.02 * (skillLv - 1));
                    if (minPower === maxPower) {
                        return `${minPower.toLocaleString()}%`
                    } else {
                        return `${minPower.toLocaleString()}%～${maxPower.toLocaleString()}%`
                    }
            }
        case EFFECT.GRANT_DEBUFF:
            minPower = skillMin * (1 + 0.05 * (skillLv - 1));
            maxPower = skillMax * (1 + 0.02 * (skillLv - 1));
            if (minPower === maxPower) {
                return `${minPower.toLocaleString()}%`
            } else {
                return `${minPower.toLocaleString()}%～${maxPower.toLocaleString()}%`
            }
        default:
            break;
    }
}

export default BuffDetail;
