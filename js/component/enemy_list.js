const EnmeyListComponent = ({ enemy_class, enemy_select, handleChange }) => {
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

    return (
        <div>
            <label className="area_title">敵情報</label>
            <div id="enemy_select">
                <select id="enemy_class" value={enemy.enemy_class} onChange={(e) => changeEnemyClass(e.target.value)}>
                    <option value="1">異時層</option>
                    <option value="2">オーブボス</option>
                    <option value="3">時計塔(N)</option>
                    <option value="4">時計塔(H)</option>
                    <option value="5">宝珠の迷宮</option>
                    <option value="6">スコアアタック</option>
                    <option value="7">プリズムバトル</option>
                    <option value="8">恒星掃戦線</option>
                    <option value="9">イベント隠しボス</option>
                    <option value="10">時の修練場</option>
                    <option value="11">制圧戦</option>
                    <option value="12">セラフ遭遇戦</option>
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
            </div>
        </div>
    )
};
