const SaveLoadComponent = ({ mode, handleClose }) => {

    const handleClick = (i) => {
        if (mode == "save") {
            let data_name = window.prompt("保存名称を入力してください", "データ" + (i + 1));
            if (data_name === null) {
                return;
            }
            let save_data = {
                data_name: data_name,
                unit_data_list: convertUnitDataList(),
                user_operation_list: user_operation_list,
            }
            let compress = compressString(JSON.stringify(save_data));
            localStorage.setItem(`sim_data_${i}`, compress);
            handleClose();
        } else if (mode == "load") {
            let jsonstr = localStorage.getItem(`sim_data_${i}`);
            let save_data = []
            if (jsonstr) {
                let ret = window.confirm("部隊情報が上書きされますが、よろしでしょうか？");
                if (!ret) {
                    return;
                }
                handleClose();
                let decompress = decompressString(jsonstr)
                save_data = JSON.parse(decompress);
                // 部隊情報上書き
                save_data.unit_data_list.forEach((unit_data, index) => {
                    setMember(select_style_list, index, unit_data.style_id, false);
                    select_style_list[index].limit_count = unit_data.limit_count;
                    select_style_list[index].earring = unit_data.earring;
                    select_style_list[index].bracelet = unit_data.bracelet;
                    select_style_list[index].chain = unit_data.chain;
                    select_style_list[index].init_sp = unit_data.init_sp;
                    select_style_list[index].exclusion_skill_list  = unit_data.exclusion_skill_list ;
                })
                // 戦闘データ初期化
                cleanBattleData();
                user_operation_list = save_data.user_operation_list;
                // 初期データ作成
                let turn_init = getInitBattleData();
                // 最終ターンの情報
                const last_turn_operation = user_operation_list[user_operation_list.length - 1];
                // ターンデータ再生成
                recreateTurnData(turn_init, last_turn_operation)
            }
        }
    };
    
    // メンバー情報からユニットデータに変換
    function convertUnitDataList() {
        return select_style_list.map((style) => {
            if (style) {
                return {
                    style_id: style.style_info.style_id,
                    limit_count: style.limit_count,
                    earring: style.earring,
                    bracelet: style.bracelet,
                    chain: style.chain,
                    init_sp: style.init_sp,
                    exclusion_skill_list: style.exclusion_skill_list,
                }
            }
        })
    }

    let save = [];
    for (let i = 0; i < 10; i++) {
        let item = localStorage.getItem(`sim_data_${i}`);
        if (item) {
            let decompress = decompressString(item)
            let save_data = JSON.parse(decompress);
            save.push(save_data.data_name);
        } else {
            if (mode == "save") {
                save.push("無し");
            }
        }
    }

    return (
        <div>
            <ul className="save_load">
                {save.map((item, index) => (
                    <li key={index} onClick={() => handleClick(index, mode)}>{item}</li>
                ))}
            </ul>
        </div>
    );
};