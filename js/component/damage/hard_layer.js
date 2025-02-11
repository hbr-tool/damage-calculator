const HardLayerComponent = ({ enemy_info }) => {

    const tears_of_dreams_list = [0, 12, 12, 12, 12, 15, 15, 15, 15, 15, 20, 20, 20, 20]
    if (enemy_info === undefined || enemy_info.enemy_class != ENEMY_CLASS_HARD_LAYER) {
        return null;
    }

    //  サブメンバー呼び出し
    const changeSubTroops = (sub_troops) => {
        loadSubTroopsList(sub_troops);
    }
    // 夢の泪変更
    const handleTearsOfDreamsChange = () => {
        updateVariableEffectSize();
    }

    let traars_value = tears_of_dreams_list[enemy_info.enemy_class_no]

    return (
        <div className="hard_layer adjust_width">
            <div className="flex ml-0 mt-2">
                <label className="mt-3">他部隊選択</label>
                <select className="mt-3" id="sub_troops" onChange={(e) => changeSubTroops(e.target.value)}>
                    <option value="-1">なし</option>
                    <option value="0">部隊0</option>
                    <option value="1">部隊1</option>
                    <option value="2">部隊2</option>
                    <option value="3">部隊3</option>
                    <option value="4">部隊4</option>
                    <option value="5">部隊5</option>
                    <option value="6">部隊6</option>
                    <option value="7">部隊7</option>
                    <option value="8">部隊8</option>
                </select>
                {Array.from({ length: 6 }, (_, i) => (
                    <div id={`sub_chara_container_${i}`} key={`chara_${i}`}>
                        <img className="sub_style" data-chara_no={i} id={`sub_chara_${i}`} src="img/cross.png" />
                    </div>
                ))}
            </div>
            <div>
                <div className="flex ml-6 leading-6">夢の泪
                    <select className="ml-2 w-12 text-center h-6" defaultValue="0" id="tears_of_dreams" type="number" onChange={handleTearsOfDreamsChange}>
                        {Array.from({ length: 6 }, (_, i) => (
                            <option value={i * traars_value} key={`tear_${i}`}>{i}</option>
                        ))}
                    </select>
                    {enemy_info.enemy_class_no == 12 || enemy_info.enemy_class_no == 13 ?
                        <div className="ml-2" id="skull_feather_1st">
                            防御力アップ×
                            <input className="text-center h-6" defaultValue="0" id="skull_feather_1st_defense" max="20" min="0" type="number" />
                        </div>
                        : null}
                </div>
            </div>
        </div>
    )
};
