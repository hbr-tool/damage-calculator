
// 戦闘初期データ作成
function getInitBattleData(selectStyleList, saveMember, detailSetting) {
    // 初期データ作成
    let turn_init = {
        turn_number: 0,
        seq_turn: -1,
        over_drive_number: 0,
        end_drive_trigger_count: 0,
        over_drive_max_turn: 0,
        trigger_over_drive: false,
        additional_turn: false,
        additional_count: 0,
        enemy_debuff_list: [],
        unit_list: [],
        start_over_drive_gauge: 0,
        step_over_drive_gauge: 0,
        over_drive_gauge: 0,
        add_over_drive_gauge: 0,
        sp_cost_down: 0,
        enemy_count: 1,
        finish_action: false,
        field: 0,
        field_turn: 0,
        user_operation: {}
    }
    let unit_list = [];
    constraints_list = [];

    let init_sp_add = Number(detailSetting.initSpAdd);
    // スタイル情報を作成
    $.each(selectStyleList, function (index, member_info) {
        if (index >= 6) {
            return false;
        }
        let unit = {
            place_no: 99,
            sp: 1,
            ep: 0,
            over_drive_sp: 0,
            add_sp: 0,
            sp_cost: 0,
            buff_list: [],
            additional_turn: false,
            normal_attack_element: 0,
            earring_effect_size: 0,
            skill_list: [],
            passive_skill_list: [],
            blank: false,
            use_skill_list: [],
            buff_target_chara_id: null,
            buff_effect_select_type: 0,
            next_turn_min_sp: -1,
            select_skill_id: 0,
            init_skill_id: 0,
            no_action: false,
            limit_sp: 20,
        };
        unit.place_no = index;
        if (member_info) {
            saveMember(index);

            unit.style = member_info;
            unit.sp = member_info.init_sp;
            unit.sp += member_info.chain + init_sp_add;
            unit.normal_attack_element = member_info.bracelet;
            unit.earring_effect_size = member_info.earring;
            unit.skill_list = skill_list.filter(obj =>
                (obj.chara_id === member_info.style_info.chara_id || obj.chara_id === 0) &&
                (obj.style_id === member_info.style_info.style_id || obj.style_id === 0) &&
                obj.skill_active == 0 &&
                !member_info.exclusion_skill_list.includes(obj.skill_id)
            ).map(obj => {
                const copiedObj = JSON.parse(JSON.stringify(obj));
                if (copiedObj.chara_id === 0) {
                    copiedObj.chara_id === member_info.style_info.chara_id;
                }
                return copiedObj;
            });
            unit.passive_skill_list = skill_list.filter(obj =>
                (obj.chara_id === member_info.style_info.chara_id || obj.chara_id === 0) &&
                (obj.style_id === member_info.style_info.style_id || obj.style_id === 0) &&
                obj.skill_active == 1 &&
                !member_info.exclusion_skill_list.includes(obj.skill_id)
            )
            if (unit.style.style_info.role == ROLE_ADMIRAL) {
                unit.init_skill_id = 4; // 指揮行動
            } else {
                unit.init_skill_id = 1; // 通常攻撃
            }
            // 曙
            if (checkPassiveExist(unit.passive_skill_list, 606)) {
                unit.normal_attack_element = 4;
            }
            // アビリティ設定
            Object.values(ABILIRY_TIMING).forEach(timing => {
                unit[`ability_${timing}`] = [];
            });
            ["0", "00", "1", "3", "4", "5", "10"].forEach(numStr => {
                const num = parseInt(numStr, 10);
                if (member_info.style_info[`ability${numStr}`] && num <= member_info.limit_count) {
                    let ability_info = getAbilityInfo(member_info.style_info[`ability${numStr}`]);
                    if (!ability_info) {
                        return;
                    }
                    if (CONSTRAINTS_ABILITY.includes(ability_info.ability_id)) {
                        constraints_list.push(ability_info.ability_id);
                    }
                    unit[`ability_${ability_info.activation_timing}`].push(ability_info);
                    if (ability_info.ability_id == 510) {
                        // 蒼天
                        turn_init.sp_cost_down = ability_info.effect_size;
                    }
                }
            });
            unit.passive_skill_list.forEach(skill => {
                let passive_info = getPassiveInfo(skill.skill_id);
                if (!passive_info) {
                    return;
                }
                unit[`ability_${passive_info.activation_timing}`].push(passive_info);
            });
        } else {
            unit.blank = true;
        }
        unit_list.push(unit);
    });

    // 初期設定を読み込み
    turn_init.field = Number(detailSetting.initField);
    if (turn_init.field > 0) {
        turn_init.field_turn = -1;
    }
    turn_init.over_drive_gauge = Number(detailSetting.initOverDrive);
    turn_init.front_sp_add = Number(detailSetting.frontSpAdd);
    turn_init.back_sp_add = Number(detailSetting.backSpAdd);
    turn_init.step_turn_over_drive = Number(detailSetting.stepTurnOverDrive);
    turn_init.step_over_drive_gauge = Number(detailSetting.stepOverDriveGauge);
    turn_init.step_turn_sp = Number(detailSetting.stepTurnSp);
    turn_init.step_sp_front_add = Number(detailSetting.stepSpFrontAdd);
    turn_init.step_sp_back_add = Number(detailSetting.stepSpBackAdd);
    turn_init.step_sp_all_add = Number(detailSetting.stepSpAllAdd);

    turn_init.enemy_count = Number($("#enemy_select_count").val());;
    turn_init.unit_list = unit_list;
    turn_init.enemy_info = getEnemyInfo()
    // 戦闘開始アビリティ
    abilityAction(ABILIRY_TIMING.BATTLE_START, turn_init);
    setUserOperation(turn_init);

    return turn_init;
}

const SettingArea = () => {
    // 敵選択
    let enemy_class = localStorage.getItem("enemy_class");
    enemy_class = enemy_class ? enemy_class : "1";
    let enemy_select = localStorage.getItem("enemy_select");
    enemy_select = enemy_select ? enemy_select : "1";

    // 上書き確認
    let is_overwrite = localStorage.getItem("is_overwrite");
    is_overwrite = is_overwrite == "true" ? true : false;

    const changeOverwrite = (e) => {
        is_overwrite = e.target.checked;
        localStorage.setItem("is_overwrite", e.target.checked);
    }

    const { styleList, setStyleList, saveMember, removeMember } = useStyleList();

    const [hideMode, setHideMode] = React.useState(false);

    const [simProc, dispatch] = React.useReducer(reducer, {
        turn_list: [],
        seq_last_turn: 0,
        enemy_info: {}
    });

    // 戦闘開始前処理
    const startBattle = (update, setUpdate) => {
        for (let i = 0; i < styleList.selectStyleList.length; i++) {
            let style = styleList.selectStyleList[i]?.style_info;
            if (NOT_USE_STYLE.includes(style?.style_id)) {
                let chara_data = getCharaData(style.chara_id);
                alert(`[${style.style_name}]${chara_data.chara_name}は現在使用できません。`);
                return;
            }
        };
        // 後衛が居る場合、前衛に空き不可
        const hasBlankFront = styleList.selectStyleList.some(function (style, index) {
            return style === undefined && index <= 2
        });
        const hasBack = styleList.selectStyleList.some(function (style, index) {
            return style !== undefined && index >= 3
        });
        if (hasBlankFront && hasBack) {
            alert("後衛がいるとき 前衛には3名必要です");
            return;
        }

        if (is_overwrite) {
            if (simProc.turn_list.length > 0 && !confirm("現在の結果が消えますが、よろしいですか？")) {
                return;
            }
        }

        /** 戦闘開始処理 */
        // 初期データ作成
        let turn_init = getInitBattleData(styleList.selectStyleList, saveMember, detailSetting);
        // 制約事項更新
        setUpdate(update + 1);
        // 初期処理
        initTurn(turn_init, true);
        let turn_list = [turn_init];
        dispatch({ type: "INIT_TURN_LIST", turn_list: turn_list });
    };

    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    const loadData = (saveData, key, setKey) => {
        // 部隊情報上書き
        const updatedStyleList = [...styleList.selectStyleList];
        saveData.unit_data_list.forEach((unit_data, index) => {
            if (unit_data) {
                let member_info = { ...initialMember };
                let style_info = style_list.find((obj) => obj.style_id === unit_data.style_id);
                // メンバー情報作成
                // member_info.is_select = true;
                member_info.chara_no = Number(index);
                member_info.style_info = style_info;
                member_info.limit_count = unit_data.limit_count;
                member_info.earring = unit_data.earring;
                member_info.bracelet = unit_data.bracelet;
                member_info.chain = unit_data.chain;
                member_info.init_sp = unit_data.init_sp;
                member_info.exclusion_skill_list = unit_data.exclusion_skill_list;
                updatedStyleList[index] = member_info;
            } else {
                updatedStyleList[index] = null;
            }
        })
        setStyleList({ ...styleList, selectStyleList: updatedStyleList });
        // 初期データ作成
        let turnInit = getInitBattleData(updatedStyleList, saveMember, detailSetting);
        // 制約事項更新
        setKey(key + 1);
        let turn_list = [];
        recreateTurnData(turn_list, turnInit, saveData.user_operation_list, true);
        // 画面反映
        dispatch({ type: "INIT_TURN_LIST", turn_list: turn_list });
    }

    const [enemy, setEnemy] = React.useState({
        enemy_class: enemy_class,
        enemy_select: enemy_select
    });

    const [detailSetting, setDetailSetting] = React.useState({
        initField: 0,
        initOverDrive: 0,
        initSpAdd: 0,
        changeElement0: 0,
        changeElement1: 0,
        changeElement2: 0,
        changeElement3: 0,
        changeElement4: 0,
        changeElement5: 0,
        frontSpAdd: 0,
        backSpAdd: 0,
        stepTurnOverDrive: 1,
        stepOverDriveGauge: 0,
        stepTurnSp: 1,
        stepSpAllAdd: 0,
        stepSpFrontAdd: 0,
        stepSpBackAdd: 0,
    });

    const [update, setUpdate] = React.useState(0);

    return (
        <>
            {
                hideMode ?
                    null
                    :
                    <div className="setting_area">
                        <div className="unit_setting_area">
                            <input className="w-20" defaultValue="注意事項" role="button" type="button"
                                onClick={openModal} />
                            <CharaSetting />
                        </div>
                        <div>
                            <EnemyArea enemy={enemy} setEnemy={setEnemy} detailSetting={detailSetting} />
                            <DetailSetting detailSetting={detailSetting} setDetailSetting={setDetailSetting} />
                        </div>
                        <div className="flex justify-center mt-2 text-sm">
                            <input id="is_overwrite" type="checkbox" onChange={(e) => { changeOverwrite(e) }} defaultChecked={is_overwrite} />
                            <label className="checkbox01 text-sm" htmlFor="is_overwrite">
                                上書き確認
                            </label>
                            <input className="battle_start" defaultValue="戦闘開始" type="button" onClick={e => startBattle(update, setUpdate)} />
                        </div>
                        <div>
                            <ConstraintsList />
                        </div>
                        <div>
                            <ReactModal
                                isOpen={modalIsOpen}
                                onRequestClose={closeModal}
                                className={"modal-content modal-wide " + (modalIsOpen ? "modal-content-open" : "")}
                                overlayClassName={"modal-overlay " + (modalIsOpen ? "modal-overlay-open" : "")}
                            >
                                <ModalExplanation />
                            </ReactModal>
                        </div>
                    </div>
            }
            <BattleArea hideMode={hideMode} setHideMode={setHideMode} turnList={simProc.turn_list} dispatch={dispatch} loadData={loadData} update={update} setUpdate={setUpdate} />
        </>
    )
};
