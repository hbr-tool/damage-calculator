const ContentsAreaComponent = ({ }) => {

    // 敵選択
    let enemy_class = localStorage.getItem("enemy_class");
    enemy_class = enemy_class ? enemy_class : "1";
    let enemy_select = localStorage.getItem("enemy_select");
    enemy_select = enemy_select ? enemy_select : "1";

    const filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no == enemy_select);
    let enemy_info = filtered_enemy.length > 0 ? filtered_enemy[0] : undefined;

    if (!enemy_info) {
        // データ消えたりしてたら初期値に戻す
        enemy_class = "1";
        enemy_select = "1";
        enemy_info = enemy_list[0];
    }
    enemy_info = Object.assign({}, enemy_info);

    const handleChange = (enemy_class, enemy_select) => {
        const filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no == enemy_select);
        let enemy_info = filtered_enemy.length > 0 ? filtered_enemy[0] : undefined;
        dispatch({ type: "SET_ENEMY", enemy_info });
    };

    const initialState = {
        enemy_info: enemy_info,
        hpRate: 100,
        dpRate: Array(enemy_info.max_dp.split(",").length).fill(0),
        destruction: enemy_info.destruction_limit,
        max_limit: enemy_info.destruction_limit,
        strong_break: false,
        score_lv: 150,
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
        }
    };

    const setEnemy = (state, action) => {
        const enemy = action.enemy_info;
        return {
            ...state,
            enemy_info: enemy,
            hpRate: 100,
            dpRate: Array(enemy.max_dp.split(",").length).fill(0),
            destruction: enemy.destruction_limit,
            max_limit: enemy.destruction_limit,
            strong_break: false,
            correction: Object.fromEntries(Object.keys(state.correction).map(k => [k, 0])),
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
            destruction: 100,
        };
    };

    const setCollect = (state, action) => {
        if (action.grade.grade_none == 1) return state;
        const updated = { ...state.correction };
        let new_limit = state.max_limit;
        for (let i = 1; i <= 4; i++) {
            const kind = action.grade[`effect_kind${i}`];
            if (kind) {
                const size = action.grade[`effect_size${i}`];
                updated[kind] = action.checked ? size : 0;
                if (kind === "destruction_limit") {
                    new_limit = state.enemy_info.destruction_limit + updated.destruction_limit + (state.strong_break ? 300 : 0);
                }
            }
        }
        let new_destruction = new_limit < state.destruction ? new_limit : state.destruction;
        return {
            ...state,
            correction: updated,
            max_limit: new_limit,
            destruction: new_destruction,
        };
    };

    const reducer = (state, action) => {
        switch (action.type) {
            case "SET_ENEMY": return setEnemy(state, action);
            case "SET_HP": return { ...state, hpRate: action.value };
            case "SET_DP": return setDp(state, action);
            case "RESET_DP": return { ...state, dpRate: Array(state.enemy_info.max_dp.split(",").length).fill(0), };
            case "SET_DESTRUCTION": {
                let value = Number(action.value);
                return {
                    ...state,
                    destruction: Math.min(value, state.max_limit),
                    dpRate: value > 100 ? Array(state.enemy_info.max_dp.split(",").length).fill(0) : state.dpRate,
                };
            }
            case "STRONG_BREAK": {
                const base = Number(state.enemy_info.destruction_limit || 0);
                const correction = Number(state.correction.destruction_limit || 0);
                const bonus = action.checked ? 300 : 0;
                const limit = base + correction + bonus;
                return {
                    ...state,
                    strong_break: action.checked,
                    max_limit: limit,
                    destruction: limit,
                    dpRate: Array(state.enemy_info.max_dp.split(",").length).fill(0),
                };
            }
            case "SET_SCORE_LV":
                return { ...state, score_lv: action.lv };

            case "RESET_COLLECT":
                return {
                    ...state,
                    correction: Object.fromEntries(Object.keys(state.correction).map(k => [k, 0])),
                };

            case "SET_COLLECT": {
                return setCollect(state, action)
            }

            default: return state;
        }
    };
    const [state, dispatch] = React.useReducer(reducer, initialState);
    let attack_info = getAttackInfo();
    // 移行中の暫定対応
    if (enemy_info.enemy_class == ENEMY_CLASS_SCORE_ATTACK) {
        $("#prediction_score").show();
    } else {
        $("#prediction_score").hide();
    }
    if (state.dpRate.reduce((sum, value) => sum + value, 0) == 0) {
        $(".row_dp").css("display", "none");
    } else {
        $(".row_dp").css("display", "table-cell");
    }
    return (
        <>
            <div id="contents_area" className="surround_area adjust_width mx-auto mt-2">
                <label className="area_title">コンテンツ情報</label>
                <EnmeyListComponent enemy_class={enemy_class} enemy_select={enemy_select} handleChange={handleChange} is_free_input={true} />
                <HardLayerComponent enemy_info={enemy_info} />
                <ScoreSettingComponent enemy_info={enemy_info} state={state} dispatch={dispatch} />
                <BikePartsComponent enemy_info={enemy_info} />
                <SeraphCardList enemy_info={enemy_info} />
            </div>
            <div id="enemy_status" className="surround_area adjust_width mx-auto mt-2">
                <EnemyAreaComponent state={state} dispatch={dispatch} attack_info={attack_info} />
            </div>
        </>
    )
};

$(function () {
    const rootElement = document.getElementById('enemy_area');
    ReactDOM.createRoot(rootElement).render(<ContentsAreaComponent />);
});