import React from "react";
import { removeComma, getApplyGradient } from "./logic";
import { ENEMY_CLASS } from "utils/const";
import attribute from 'assets/attribute';

const EnemyArea = ({ state, dispatch, attackInfo }) => {
    const PHYSICAL_LIST = { 1: "slash", 2: "stab", 3: "strike" };
    const ELEMENT_LIST = { 0: "none", 1: "fire", 2: "ice", 3: "thunder", 4: "light", 5: "dark" };

    let enemyInfo = state.enemyInfo;
    let max_dp_list = enemyInfo.max_dp.split(",");

    const handleEnemyChange = (key, value) => {
        const newEnemyInfo = enemyInfo;
        let newValue = removeComma(value);
        newEnemyInfo[key] = newValue;
        dispatch({ type: "UPDATE_ENEMY", enemyInfo: newEnemyInfo });
    };

    const handleMaxDpEnemyChange = (index, value) => {
        max_dp_list[index] = removeComma(value);
        const newMaxDpList = max_dp_list;
        const newMaxDp = newMaxDpList.join(",")
        const newEnemyInfo = enemyInfo;
        newEnemyInfo["max_dp"] = newMaxDp;
        dispatch({ type: "UPDATE_ENEMY", enemyInfo: newEnemyInfo });
    };

    const handleEnemyDamageRateChange = (value) => {
        dispatch({ type: "SET_DAMAGE_RATE", value });
    };

    const handleHpChange = (value) => {
        dispatch({ type: "RESET_DP" });
        dispatch({ type: "SET_HP", value });
    };

    const handleDpChange = (index, value) => {
        dispatch({ type: "SET_DP", index, value });
    };

    const handleCheckDamageRate = (type, checked) => {
        dispatch({ type: type, checked });
    };

    const handleMaxDamageRate = (value) => {
        const newEnemyInfo = enemyInfo;
        newEnemyInfo["destruction_limit"] = value;
        dispatch({ type: "MAX_DAMAGE_RATE", enemyInfo: newEnemyInfo });
    };

    // HP補正
    let maxHp = Number(enemyInfo.max_hp);
    let enemyStat = Number(enemyInfo.enemy_stat);
    maxHp = Math.floor(maxHp * (1 + state.correction.hp_rate / 100));
    let backgroundHp = getApplyGradient("#7C4378", state.hpRate)

    // 破壊率補正
    let destruction = enemyInfo.destruction
    destruction *= (1 - state.correction.destruction_resist / 100);

    // 自由入力時の対応
    let isFreeInput = false;
    if (enemyInfo.enemy_class === ENEMY_CLASS.FREE_INPUT) {
        isFreeInput = true;
    }
    const [focus, setFocus] = React.useState(undefined);
    const handleElementFocus = (id, target) => {
        target.value = enemyInfo[id];
        setFocus(id);
    };
    const handleBlur = () => {
        setFocus(undefined);
    };

    return (
        <div>
            <label className="area_title">敵情報</label>
            <div className="flex">
                <div className="flex flex-wrap gap-1 w-40">
                    <div className="text-right enemy_label">防御値</div>
                    <input type="number" className="w-10 text-center" value={enemyStat} id="enemy_stat" readOnly={!isFreeInput}
                        onChange={(e) => handleEnemyChange("enemy_stat", e.target.value)} />
                    <div className="text-right enemy_label">破壊率上限</div>
                    <input type="number" className="w-10 text-center" value={state.maxDamageRate} id="enemy_destruction_limit" readOnly={!isFreeInput}
                        onChange={(e) => handleMaxDamageRate(e.target.value)} />
                    <div className="text-right enemy_label">破壊率</div>
                    <input type="number" className="text-center" id="enemy_destruction_rate" min="100" value={state.damageRate}
                        onChange={(e) => handleEnemyDamageRateChange(e.target.value)} />
                    <div className="text-right col-span-2 ml-14">
                        <input type="checkbox" id="strong_break" onChange={(e) => handleCheckDamageRate("STRONG_BREAK", e.target.checked)} checked={state.strongBreak} />
                        <label className="checkbox01 text-xs font-bold" htmlFor="strong_break">強ブレイク</label>
                    </div>
                    <div className="text-right col-span-2 ml-14">
                        <input type="checkbox" id="super_down" onChange={(e) => handleCheckDamageRate("SUPER_DOWN", e.target.checked)} checked={state.superDown} />
                        <label className="checkbox01 text-xs font-bold" htmlFor="super_down">超ダウン</label>
                    </div>
                    <div className="text-right enemy_label">破壊係数</div>
                    <input type="number" className="text-center" id="enemy_destruction" min="1" value={destruction} readOnly={!isFreeInput}
                        onChange={(e) => handleEnemyChange("destruction", e.target.value)} />
                </div>
                <div>
                    <div className="flex">
                        <div className="w-5">DP</div>
                        <div>
                            {max_dp_list.map((dp, index) => {
                                let no = max_dp_list.length - 1 - index;
                                let enemy_id = "enemy_dp_" + no;
                                let range_id = "dp_range_" + no;
                                let dp_rate = state.dpRate[no];
                                let maxDp = Number(max_dp_list[no]);
                                maxDp = Math.floor(maxDp * (1 + state.correction.dp_rate / 100));
                                let background = getApplyGradient("#4F7C8B", dp_rate)
                                return (
                                    <div className="dp_gauge" key={enemy_id}>
                                        <input type="text" className="w-20 text-right comma"
                                            value={focus === enemy_id ? maxDp : Number(maxDp).toLocaleString()}
                                            id={enemy_id} pattern="\d*" readOnly={!isFreeInput}
                                            onChange={(e) => handleMaxDpEnemyChange(no, e.target.value)}
                                            onFocus={() => setFocus(enemy_id)}
                                            onBlur={() => handleBlur()} />
                                        <input type="range" className="enemy_dp_range dp_range" value={dp_rate} id={range_id} max="100" min="0" step="1" onChange={(e) => handleDpChange(no, e.target.value)}
                                            style={{ background: background }}
                                        />
                                        <output className="gauge_rate">{dp_rate}%</output>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-5">HP</div>
                        <div>
                            <div className="flex">
                                <input type="text" id="enemy_hp" className="w-20 text-right comma"
                                    value={focus === "enemy_hp" ? maxHp : maxHp.toLocaleString()} readOnly={!isFreeInput}
                                    onChange={(e) => handleEnemyChange("max_hp", e.target.value)}
                                    onFocus={() => setFocus("enemy_hp")}
                                    onBlur={() => handleBlur()} />
                                <input type="range" className="hp_range" value={state.hpRate} id="hp_range" max="100" min="0" step="1" onChange={(e) => handleHpChange(e.target.value)}
                                    style={{ background: backgroundHp }}
                                />
                                <output className="gauge_rate">{state.hpRate}%</output>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="resist_area mx-auto mt-2">
                <div className="grid grid-cols-9">
                    {Object.keys(PHYSICAL_LIST).map(key => {
                        let src = attribute[PHYSICAL_LIST[key]];
                        let id = `physical_${key}`;
                        let correction = state.correction[`physical_${key}`];
                        let val = enemyInfo[id] - (focus === id ? 0 : correction);
                        if (attackInfo?.penetration && Number(key) === attackInfo?.attack_physical) {
                            // 貫通クリティカル
                            val = 100 + Number(attackInfo.penetration);
                        }
                        let addClass = val < 100 ? "enemy_resist" : val > 100 ? "enemy_weak" : "";
                        let select = attackInfo?.attack_physical === Number(key) ? " selected" : "";
                        return (<div key={id} className={select}>
                            <input className="enemy_type_icon" src={src} type="image" alt="" />
                            <input className={`enemy_type_value ${addClass}`}
                                readOnly={!isFreeInput}
                                type="text"
                                value={val}
                                onChange={(e) => handleEnemyChange("physical_" + key, e.target.value)}
                                onFocus={(e) => handleElementFocus("physical_" + key, e.target)}
                                onBlur={(e) => handleBlur()} />
                        </div>)
                    })}
                    {Object.keys(ELEMENT_LIST).map(key => {
                        let src = attribute[ELEMENT_LIST[key]];
                        let id = `element_${key}`;
                        let correction = state.correction[`element_${key}`];
                        let val = enemyInfo[id]
                        if (focus !== id) {
                            // 属性打ち消し
                            if (val < 100 && state.resistDown[key] > 0) {
                                val = 100;
                            }
                            val -= correction - state.resistDown[key];
                            if (attackInfo?.penetration && key === 0) {
                                // 貫通クリティカル
                                val = 100;
                            }
                        }
                        val = Math.floor(val);
                        let addClass = val < 100 ? "enemy_resist" : val > 100 ? "enemy_weak" : "";
                        let select = attackInfo?.attack_element === Number(key) ? " selected" : "";
                        return (<div key={id} className={select}>
                            <input className="enemy_type_icon" src={src} type="image" alt="" />
                            <input className={`enemy_type_value ${addClass}`}
                                readOnly={!isFreeInput}
                                type="text"
                                value={val}
                                onChange={(e) => handleEnemyChange(id, e.target.value)}
                                onFocus={(e) => handleElementFocus(id, e.target)}
                                onBlur={(e) => handleBlur()} />
                        </div>)
                    })}
                </div>
            </div>
        </div>
    )
};

export default EnemyArea;