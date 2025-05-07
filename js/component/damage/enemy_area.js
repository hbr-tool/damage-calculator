const EnemyAreaComponent = ({ state, dispatch, attack_info }) => {
    const PHYSICAL_LIST = { 1: "slash", 2: "stab", 3: "strike" };
    const ELEMENT_LIST = { 0: "none", 1: "fire", 2: "ice", 3: "thunder", 4: "light", 5: "dark" };

    let enemy_info = state.enemy_info;
    let max_dp_list = enemy_info.max_dp.split(",");

    const [attackInfo, setAttackInfo] = React.useState(attack_info);

    const [elementResistDown, setElementResistDown] = React.useState([0, 0, 0, 0, 0, 0]);

    const handleEnemyChange = (key, value) => {
        const newEnemyInfo = enemy_info;
        let newValue = removeComma(value);
        newEnemyInfo[key] = newValue;
        dispatch({ type: "SET_ENEMY", enemy_info: newEnemyInfo });
    };

    const handleMaxDpEnemyChange = (index, value) => {
        max_dp_list[index] = removeComma(value);
        const newMaxDpList = max_dp_list;
        const newMaxDp = newMaxDpList.join(",")
        const newEnemyInfo = enemy_info;
        newEnemyInfo["max_dp"] = newMaxDp;
        dispatch({ type: "SET_ENEMY", enemy_info: newEnemyInfo });
    };

    const handleEnemyDestructionChange = (value) => {
        dispatch({ type: "SET_DESTRUCTION", value });
    };

    const handleHpChange = (value) => {
        dispatch({ type: "RESET_DP" });
        dispatch({ type: "SET_HP", value });
    };

    const handleDpChange = (index, value) => {
        dispatch({ type: "SET_DP", index, value });
    };

    const handleCheckStrongBreak = (checked) => {
        dispatch({ type: "STRONG_BREAK", checked });
    };

    // 攻撃スキル変更
    window.updateAttackInfo = function (attack_info) {
        setAttackInfo(attack_info);
    }
    // 耐性変更
    window.setEnemyResistDown = function (attack_element, resist_down) {
        const newResist = [0, 0, 0, 0, 0, 0];
        newResist[attack_element] = resist_down;
        setElementResistDown(newResist)
    }

    // 敵情報反映
    window.updateEnemyDurability = function (index, dp, hp, destruction) {
        dispatch({ type: "SET_DP", index, value: dp });
        dispatch({ type: "SET_HP", value: hp });
        dispatch({ type: "SET_DESTRUCTION", value: destruction });
    }

    // HP補正
    let maxHp = Number(enemy_info.max_hp);
    let enemy_stat = Number(enemy_info.enemy_stat);
    if (enemy_info.enemy_class == ENEMY_CLASS.SCORE_ATTACK) {
        let score_attack = getScoreAttack(enemy_info.sub_no);
        maxHp = getScoreHpDp(state.score_lv, score_attack, "hp_rate");
        enemy_stat = score_stat[state.score_lv - 100];
    }
    maxHp *= (1 + state.correction.hp_rate / 100);
    let backgroundHp = getApplyGradient("#7C4378", state.hpRate)

    // 破壊率補正
    let destruction = enemy_info.destruction
    destruction *= (1 - state.correction.destruction_resist / 100);

    React.useEffect(() => {
        // 初回描画時に呼び出す
        updateEnemyResistDown();
    }, []);

    React.useEffect(() => {
        // 再描画時に呼び出す
        $(".variable_effect_size").each(function (index, value) {
            updateBuffEffectSize($(value));
        });
        displayWeakRow();
    }, [enemy_info, elementResistDown]);

    React.useEffect(() => {
        // ダメージ再計算
        calcDamage();
    });

    // 自由入力時の対応
    let is_free_input = false;
    if (enemy_info.enemy_class == ENEMY_CLASS.FREE_INPUT) {
        is_free_input = true;
    }
    const [focus, setFocus] = React.useState(undefined);
    const handleElementFocus = (id, target) => {
        target.value = enemy_info[id];
        setFocus(id);
    };
    const handleElementBlur = () => {
        setFocus(undefined);
    };

    return (
        <div>
            <label className="area_title">敵情報</label>
            <div className="flex">
                <div className="flex flex-wrap gap-1 w-40">
                    <div className="text-right enemy_label">防御値</div>
                    <input type="number" className="w-10 text-center" value={enemy_stat} id="enemy_stat" readOnly={!is_free_input}
                        onChange={(e) => handleEnemyChange("enemy_stat", e.target.value)} />
                    <div className="text-right enemy_label">破壊率上限</div>
                    <input type="number" className="w-10 text-center" value={state.max_limit} id="enemy_destruction_limit" readOnly={!is_free_input}
                        onChange={(e) => handleEnemyChange("destruction_limit", e.target.value)} />
                    <div className="text-right enemy_label">破壊率</div>
                    <input type="number" className="text-center" id="enemy_destruction_rate" min="100" value={state.destruction}
                        onChange={(e) => handleEnemyDestructionChange(e.target.value)} />
                    <div className="text-right col-span-2 ml-14">
                        <input type="checkbox" id="strong_break" onChange={(e) => handleCheckStrongBreak(e.target.checked)} checked={state.strong_break} />
                        <label className="checkbox01 text-xs font-bold" htmlFor="strong_break">強ブレイク</label>
                    </div>
                    <div className="text-right enemy_label">破壊係数</div>
                    <input type="number" className="text-center" id="enemy_destruction" min="1" value={destruction} readOnly={!is_free_input}
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
                                if (enemy_info.enemy_class == ENEMY_CLASS.SCORE_ATTACK) {
                                    let score_attack = getScoreAttack(enemy_info.sub_no);
                                    maxDp = getScoreHpDp(state.score_lv, score_attack, "dp_rate");
                                }
                                maxDp *= (1 + state.correction.dp_rate / 100);
                                let background = getApplyGradient("#4F7C8B", dp_rate)
                                return (
                                    <div className="dp_gauge" key={enemy_id}>
                                        <input type="text" className="w-20 text-right comma" value={Number(maxDp).toLocaleString()} id={enemy_id} pattern="\d*" readOnly={!is_free_input}
                                            onChange={(e) => handleMaxDpEnemyChange(no, e.target.value)} />
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
                                <input type="text" id="enemy_hp" className="w-20 text-right comma" value={maxHp.toLocaleString()} readOnly={!is_free_input}
                                    onChange={(e) => handleEnemyChange("max_hp", e.target.value)} />
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
                        let src = `img/${PHYSICAL_LIST[key]}.webp`;
                        let id = `physical_${key}`;
                        let correction = state.correction[`physical_${key}`];
                        let val = enemy_info[id] - (focus == id ? 0 : correction);
                        if (attackInfo.penetration && key == attackInfo.attack_physical) {
                            // 貫通クリティカル
                            val = 100 + Number(attackInfo.penetration);
                            if (attackInfo.attack_id == 190) {
                                // メガデストロイヤー
                                let servant = Number($("#servant_count").val());
                                if (servant < 2) {
                                    val = 400;
                                } else if (servant < 4) {
                                    val = 450;
                                } else {
                                    val = 500;
                                }
                            }
                        }
                        let addClass = val < 100 ? "enemy_resist" : val > 100 ? "enemy_weak" : "";
                        let select = attackInfo?.attack_physical == key ? " selected" : "";
                        return (<div key={id} className={select}>
                            <input className="enemy_type_icon" src={src} type="image" />
                            <input className={`enemy_type_value ${addClass}`} id={`enemy_${id}`} readOnly={!is_free_input} type="text" value={val}
                                data-init={enemy_info[id]}
                                onChange={(e) => handleEnemyChange("physical_" + key, e.target.value)}
                                onFocus={(e) => handleElementFocus("physical_" + key, e.target)}
                                onBlur={(e) => handleElementBlur()} />
                        </div>)
                    })}
                    {Object.keys(ELEMENT_LIST).map(key => {
                        let src = `img/${ELEMENT_LIST[key]}.webp`;
                        let id = `element_${key}`;
                        let correction = state.correction[`element_${key}`];
                        let val = enemy_info[id]
                        if (!focus) {
                            // 属性打ち消し
                            if (val < 100 && elementResistDown[key] > 0) {
                                val = 100;
                            }
                            val -= correction - elementResistDown[key];
                            if (attackInfo.penetration && key == 0) {
                                // 貫通クリティカル
                                val = 100;
                            }
                        }
                        let addClass = val < 100 ? "enemy_resist" : val > 100 ? "enemy_weak" : "";
                        let select = attackInfo?.attack_element == key ? " selected" : "";
                        return (<div key={id} className={select}>
                            <input className="enemy_type_icon" src={src} type="image" />
                            <input className={`enemy_type_value ${addClass}`} id={`enemy_${id}`} readOnly={!is_free_input} type="text" value={val}
                                data-init={enemy_info[id]}
                                onChange={(e) => handleEnemyChange("element_" + key, e.target.value)}
                                onFocus={(e) => handleElementFocus("element_" + key, e.target)}
                                onBlur={(e) => handleElementBlur()} />
                        </div>)
                    })}
                </div>
            </div>
        </div>
    )
};
