import React, { useState, useReducer } from "react";
import { useStyleList } from "components/StyleListProvider";
import { getDamageResult, getEffectSize, getCharaIdToMember } from "./logic";
import { getEnemyInfo, } from "utils/common";
import AttackList from "./AttackList";
import CharaStatus from "./CharaStatus";
import ContentsArea from "./ContentsArea";
import OtherSetting from "./OtherSetting";
import PredictionScore from "./PredictionScore";
import DamageResult from "./DamageResult";
import BuffArea from "./BuffArea";
import { ENEMY_CLASS } from "utils/const";

const setEnemy = (state, action) => {
    const enemy = action.enemyInfo;
    return {
        ...state,
        enemyInfo: enemy,
        hpRate: 100,
        dpRate: Array(enemy.max_dp.split(",").length).fill(0),
        damageRate: enemy.destruction_limit,
        maxDamageRate: enemy.destruction_limit,
        strongBreak: false,
        superDown: false,
        correction: Object.fromEntries(Object.keys(state.correction).map(k => [k, 0])),
        resistDown: [0, 0, 0, 0, 0, 0],
    };
};

const setDp = (state, action) => {
    const { index, value } = action;
    const newDpRate = state.dpRate.map((_, i) => {
        if (i > index) return 0;
        if (i === index) return value;
        return 100;
    });
    return {
        ...state,
        dpRate: newDpRate,
        hpRate: value > 0 ? 100 : state.hpRate,
        damageRate: 100,
    };
};

const setCollect = (state, action) => {
    const updated = { ...state.correction };
    let newMaxDamageRate = state.maxDamageRate;
    for (let i = 1; i <= 5; i++) {
        const kind = action.grade[`effect_kind${i}`];
        if (kind) {
            const size = action.grade[`effect_size${i}`];
            const conditions = action.grade[`conditions${i}`];
            updated[kind] = action.checked ? size : 0;
            if (kind === "destruction_limit") {
                newMaxDamageRate = state.enemyInfo.destruction_limit + updated.destruction_limit
                    + (state.strongBreak ? 300 : 0) + (state.superDown ? 300 : 0);
            }
            if (kind === "defense_rate") {
                updated[kind] = {
                    size: action.checked ? size : 0,
                    conditions: conditions
                }
            }
        }
    }
    let newDamageRate = newMaxDamageRate < state.damageRate ? newMaxDamageRate : state.damageRate;
    return {
        ...state,
        correction: updated,
        maxDamageRate: newMaxDamageRate,
        damageRate: newDamageRate,
        score: { ...state.score, totalGradeRate: action.totalGradeRate }
    };
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_ENEMY": return setEnemy(state, action);
        case "SET_HP": return { ...state, hpRate: action.value };
        case "SET_DP": return setDp(state, action);
        case "RESET_DP": return { ...state, dpRate: Array(state.enemyInfo.max_dp.split(",").length).fill(0), };
        case "SET_DAMAGE_RATE": {
            let value = Number(action.value);
            return {
                ...state,
                damageRate: Math.min(value, state.maxDamageRate),
                dpRate: value > 100 ? Array(state.enemyInfo.max_dp.split(",").length).fill(0) : state.dpRate,
            };
        }
        case "MAX_DAMAGE_RATE": {
            const base = Number(action.enemyInfo.destruction_limit || 0);
            const strongBreak = action.strongBreak ? 300 : 0;
            const superDown = state.superDown ? 300 : 0;
            const limit = base + strongBreak + superDown;
            return {
                ...state,
                enemyInfo: action.enemyInfo,
                maxDamageRate: limit,
                damageRate: limit,
                dpRate: Array(state.enemyInfo.max_dp.split(",").length).fill(0),
            };
        }
        case "STRONG_BREAK": {
            const base = Number(state.enemyInfo.destruction_limit || 0);
            const correction = Number(state.correction.destruction_limit || 0);
            const strongBreak = action.checked ? 300 : 0;
            const superDown = state.superDown ? 300 : 0;
            const limit = base + correction + strongBreak + superDown;
            return {
                ...state,
                strongBreak: action.checked,
                maxDamageRate: limit,
                damageRate: limit,
                dpRate: Array(state.enemyInfo.max_dp.split(",").length).fill(0),
            };
        }
        case "SUPER_DOWN": {
            const base = Number(state.enemyInfo.destruction_limit || 0);
            const correction = Number(state.correction.destruction_limit || 0);
            const strongBreak = state.strongBreak ? 300 : 0;
            const superDown = action.checked ? 300 : 0;
            const limit = base + correction + strongBreak + superDown;
            return {
                ...state,
                superDown: action.checked,
                maxDamageRate: limit,
                damageRate: limit,
                dpRate: Array(state.enemyInfo.max_dp.split(",").length).fill(0),
            };
        }
        case "UPDATE_ENEMY":
            return {
                ...state,
                enemyInfo: action.enemyInfo
            };

        case "SET_SCORE_LV":
            return {
                ...state,
                enemyInfo: {
                    ...state.enemyInfo,
                    enemy_stat: action.status,
                    max_dp: action.max_dp,
                    max_hp: action.max_hp
                },
                score: { ...state.score, lv: action.lv }
            };

        case "SET_SCORE_TURN":
            return { ...state, score: { ...state.score, turnCount: action.turn } };

        case "SET_SCORE_HALF":
            return { ...state, score: { ...state.score, half: action.half } };

        case "RESET_COLLECT":
            return {
                ...state,
                correction: Object.fromEntries(Object.keys(state.correction).map(k => [k, 0])),
                score: { ...state.score, totalGradeRate: 0, half: action.half },
            };

        case "SET_COLLECT": {
            return setCollect(state, action)
        }

        case "SET_TEARS_OF_DREAMS":
            return {
                ...state,
                hard: { ...state.hard, tearsOfDreams: action.value }
            };

        case "SET_SKULL_FEATHER_DEFFENSE_DOWN":
            return {
                ...state,
                hard: { ...state.hard, skullFeatherDeffense: action.value }
            };

        case "SET_RRGIST_DOWN": {
            const newResist = [0, 0, 0, 0, 0, 0];
            newResist[action.element] = Number(action.value);
            return {
                ...state,
                resistDown: newResist,
            };
        }

        default: return state;
    }
};

const DamageCalculation = () => {
    const { styleList } = useStyleList();
    const [attackInfo, setAttackInfo] = useState(undefined);
    const [selectSkillLv, setSelectSkillLv] = useState(undefined);
    const [buffSettingMap, setBuffSettingMap] = useState({});

    // 初期値を決める関数
    const getInitialEnemyData = () => {
        let enemyClass = Number(localStorage.getItem("enemy_class")) || 1;
        let enemySelect = Number(localStorage.getItem("enemy_select")) || 1;

        let info = getEnemyInfo(enemyClass, enemySelect);

        // undefined の場合は 1,1 に強制
        if (!info) {
            enemyClass = 1;
            enemySelect = 1;
            localStorage.setItem("enemy_class", "1");
            localStorage.setItem("enemy_select", "1");
            info = getEnemyInfo(enemyClass, enemySelect);
        }

        return { enemyClass, enemySelect, info };
    };

    // 初期データ取得
    const { enemyClass: initialClass, enemySelect: initialSelect, info: initEnemyInfo } = getInitialEnemyData();

    // 状態管理
    const [enemyClass, setEnemyClass] = useState(initialClass);
    const [enemySelect, setEnemySelect] = useState(initialSelect);
    const initialState = {
        enemyInfo: initEnemyInfo,
        hpRate: 100,
        dpRate: Array(initEnemyInfo.max_dp.split(",").length).fill(0),
        damageRate: initEnemyInfo.destruction_limit,
        maxDamageRate: initEnemyInfo.destruction_limit,
        strongBreak: false,
        superDown: false,
        score: {
            lv: 40,
            turnCount: 1,
            totalGradeRate: 0,
            half: 1,
        },
        correction: {
            physical_1: 0,
            physical_2: 0,
            physical_3: 0,
            element_0: 0,
            element_1: 0,
            element_2: 0,
            element_3: 0,
            element_4: 0,
            element_5: 0,
            hp_rate: 0,
            dp_rate: 0,
            destruction_limit: 0,
            destruction_resist: 0,
        },
        hard: {
            tearsOfDreams: 0,
            skullFeatherDeffense: 0,
        },
        resistDown: [0, 0, 0, 0, 0, 0],
    };
    const [state, dispatch] = useReducer(reducer, initialState);

    const [selectBuffKeyMap, setSelectBuffKeyMap] = useState({});
    const [abilitySettingMap, setAbilitySettingMap] = useState([]);
    const [passiveSettingMap, setPassiveSettingMap] = useState([]);
    const [resonanceList, setResonanceList] = useState([]);

    const [otherSetting, setOtherSetting] = useState({
        ring: "0",
        earring: "0",
        chain: "0",
        overdrive: "0",
        collect: {
            fightingspirit: false,
            misfortune: false,
            hacking: false,
        },
    });

    let damageResult = getDamageResult(attackInfo, styleList, state, selectSkillLv,
        selectBuffKeyMap, buffSettingMap, abilitySettingMap, passiveSettingMap, resonanceList, otherSetting);

    const bulkSetting = (collect) => {
        setAttackInfo(prev => ({
            ...prev,
            collect: {
                ...prev.collect, // 既存の項目を保持
                ...collect,      // 渡された項目で上書き
            },
        }));
        const newBuffSettingMap = { ...buffSettingMap };
        Object.keys(newBuffSettingMap).forEach(key =>
            newBuffSettingMap[key].forEach((buffList, index) => {
                Object.keys(buffList).forEach(buffKey => {
                    const buffSetting = buffList[buffKey];
                    let buffInfo = buffSetting.buffInfo;
                    const charaId = buffInfo.use_chara_id;
                    const memberInfo = getCharaIdToMember(styleList, charaId);
                    buffSetting["collect"] = collect;
                    buffSetting.effect_size = getEffectSize(styleList, buffInfo, buffSetting, memberInfo, state,
                        abilitySettingMap, passiveSettingMap, resonanceList);
                })
            })
        );
        setBuffSettingMap(newBuffSettingMap);
    }

    const argument = {
        attackInfo, state, dispatch, otherSetting,
        selectBuffKeyMap, setSelectBuffKeyMap,
        buffSettingMap, setBuffSettingMap,
        abilitySettingMap, setAbilitySettingMap,
        passiveSettingMap, setPassiveSettingMap,
        resonanceList, setResonanceList
    };
    return (
        <div className="damage_frame pt-3">
            <div className="display_area mx-auto">
                <div className="status_area mx-auto">
                    <CharaStatus argument={argument} />
                    <AttackList attackInfo={attackInfo} setAttackInfo={setAttackInfo}
                        selectSkillLv={selectSkillLv} setSelectSkillLv={setSelectSkillLv}
                        abilitySettingMap={abilitySettingMap} passiveSettingMap={passiveSettingMap} state={state} dispatch={dispatch} />
                    <ContentsArea attackInfo={attackInfo} enemyClass={enemyClass}
                        enemySelect={enemySelect} setEnemyClass={setEnemyClass} setEnemySelect={setEnemySelect}
                        state={state} dispatch={dispatch} />
                    <OtherSetting attackInfo={attackInfo} otherSetting={otherSetting} setOtherSetting={setOtherSetting} bulkSetting={bulkSetting} />
                    {enemyClass === ENEMY_CLASS.SCORE_ATTACK && damageResult ?
                        <PredictionScore damageResult={damageResult} state={state} />
                        : null
                    }
                </div>
                <BuffArea argument={argument} />
            </div>
            <DamageResult damageResult={damageResult} enemyInfo={state.enemyInfo} dispatch={dispatch} />
        </div>
    );
}

export default DamageCalculation;