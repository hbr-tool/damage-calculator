const ContentsAreaComponent = ({ }) => {

    const [enemyInfo, setEnemyInfo] = React.useState(null);

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

    const handleChange = (enemy_class, enemy_select) => {
        const filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no == enemy_select);
        setEnemyInfo(filtered_enemy.length > 0 ? filtered_enemy[0] : undefined);
    };

    React.useEffect(() => {
        // 再描画時に呼び出す
        setEnemyStatus(enemy_info, true);
    }, [enemyInfo]);

    return (
        <>
            <label className="area_title">コンテンツ情報</label>
            <EnmeyListComponent enemy_class={enemy_class} enemy_select={enemy_select} handleChange={handleChange} is_free_input={true}/>
            <HardLayerComponent enemy_info={enemy_info} />
            <ScoreSettingComponent enemy_info={enemy_info} />
            <BikePartsComponent enemy_info={enemy_info} />
        </>
    )
};

$(function () {
    const rootElement = document.getElementById('contents_area');
    ReactDOM.createRoot(rootElement).render(<ContentsAreaComponent />);
});