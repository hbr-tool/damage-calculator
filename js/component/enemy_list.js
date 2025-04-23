const EnmeyListComponent = ({ enemy_class, enemy_select, handleChange, is_free_input }) => {
    const [enemy, setEnemy] = React.useState({
        enemy_class: enemy_class,
        enemy_select: enemy_select
    });

    const changeEnemyClass = (enemy_class) => {
        localStorage.setItem("enemy_class", enemy_class);
        localStorage.setItem("enemy_select", "1");

        setEnemy({ enemy_class: enemy_class, enemy_select: "1" });
        handleChange(enemy_class, "1");
    };

    const changeEnemySelect = (enemy_select) => {
        localStorage.setItem("enemy_select", enemy_select);
        setEnemy({ ...enemy, enemy_select: enemy_select });
        handleChange(enemy.enemy_class, enemy_select);
    };

    let class_List = enemy_list.filter((obj) => obj.enemy_class == enemy.enemy_class);
    let enemy_status = enemy_list.filter((obj) => obj.enemy_class == enemy.enemy_class && obj.enemy_class_no == enemy.enemy_select)[0];
    if (!enemy_status) {
        enemy_status = enemy_list[0];
    }

    // 敵保存ボタンクリック
    const clickEnemySave = () => {
        let enemy_class_no = Number($("#enemy_list option:selected").val());
        let enemy_name = window.prompt("敵名称を入力してください", "敵" + enemy_class_no);
        if (enemy_name === null) {
            return;
        }
        let enemy_info = {};
        enemy_info.enemy_name = enemy_name
        enemy_info.enemy_stat = $("#enemy_stat").val();
        enemy_info.max_dp = removeComma($("#enemy_dp_0").val()) + "," + removeComma($("#enemy_dp_1").val()) + "," + removeComma($("#enemy_dp_2").val()) + "," + removeComma($("#enemy_dp_3").val());
        enemy_info.max_hp = removeComma($("#enemy_hp").val());
        let enemy_info_status_list = ["destruction_limit", "destruction"];
        enemy_info_status_list.forEach(value => {
            enemy_info[value] = $("#enemy_" + value).val();
        });
        let enemy_info_resist_list = ["physical_1", "physical_2", "physical_3", "element_0", "element_1", "element_2", "element_3", "element_4", "element_5",];
        enemy_info_resist_list.forEach(value => {
            enemy_info[value] = $("#enemy_" + value).data("init");
        });
        $("#enemy_list option:selected").text(enemy_name);
        updateEnemyStatus(enemy_class_no, enemy_info);
        localStorage.setItem("free_enemy_" + enemy_class_no, JSON.stringify(enemy_info));
    }

    $(".enemy_input").attr("readonly", enemy_class != ENEMY_CLASS_FREE_INPUT);

    return (
        <>
            <div id="enemy_select">
                <select id="enemy_class" value={enemy.enemy_class} onChange={(e) => changeEnemyClass(e.target.value)}>
                    <option value="1">異時層</option>
                    <option value="2">オーブボス</option>
                    <option value="3">時計塔(N)</option>
                    <option value="4">時計塔(H)</option>
                    <option value="5">宝珠の迷宮</option>
                    <option value="6">スコアアタック</option>
                    <option value="7">プリズムバトル</option>
                    <option value="13">イベントプリズム</option>
                    <option value="8">恒星掃戦線</option>
                    <option value="9">イベント隠しボス</option>
                    <option value="10">時の修練場/アリーナ</option>
                    <option value="11">制圧戦</option>
                    <option value="12">セラフ遭遇戦</option>
                    {is_free_input ?
                        <option value="99">自由入力</option>
                    : null}
                </select>
                <select id="enemy_list" value={enemy.enemy_select} onChange={(e) => changeEnemySelect(e.target.value)}>
                    {class_List.map((value) => {
                        let text = value.enemy_name;
                        if (enemy.enemy_class == ENEMY_CLASS_SCORE_ATTACK) {
                            text = `#${value.sub_no} ${value.enemy_name}`;
                        } else if (enemy.enemy_class == ENEMY_CLASS_CLOCK_TOWER_NORMAL || enemy.enemy_class == ENEMY_CLASS_CLOCK_TOWER_HARD) {
                            text = `(${value.sub_no}F) ${value.enemy_name}`;
                        }
                        return (
                            <option key={`enemy_class_no${value.enemy_class_no}`} value={value.enemy_class_no}>{text}</option>
                        )
                    })}
                </select>
                <select value={enemy_status.enemy_count} disabled id="enemy_select_count" >
                    <option value="1">1体</option>
                    <option value="2">2体</option>
                    <option value="3">3体</option>
                </select>
                {enemy_class == ENEMY_CLASS_FREE_INPUT ?
                    <input id="enemy_save" type="button" value="保存" onClick={clickEnemySave} />
                    : null
                }
            </div>
        </>
    )
};
