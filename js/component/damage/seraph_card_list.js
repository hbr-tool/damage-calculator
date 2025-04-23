const SeraphCardList = ({ enemy_info }) => {

    const [selectedIndices, setSelectedIndices] = React.useState([0, 0, 0, 0]);

    const CARD_LIST = [
        { name: "なし/その他", list: [] },
        { name: "敵ステータス-50", list: [{ effect_kind: "STAT_UP", effect_size: -50 }] },
        { name: "敵ステータス-25", list: [{ effect_kind: "STAT_UP", effect_size: -25 }] },
        { name: "敵ステータス+25", list: [{ effect_kind: "STAT_UP", effect_size: -25 }] },
        { name: "DP&HP+25%＆氷耐性-100%", list: [{ effect_kind: "DP_UP", effect_size: 25 }, { effect_kind: "HP_UP", effect_size: 25 }, { effect_kind: "ICE_DOWN", effect_size: 100 },] },
        { name: "DP&HP+25%＆光耐性-100%", list: [{ effect_kind: "DP_UP", effect_size: 25 }, { effect_kind: "HP_UP", effect_size: 25 }, { effect_kind: "LIGHT_DOWN", effect_size: 100 },] },
        { name: "敵ステ+50＆氷耐性-100%", list: [{ effect_kind: "STAT_UP", effect_size: 50 }, { effect_kind: "ICE_DOWN", effect_size: 100 },] },
        { name: "敵ステ+50＆光耐性-100%", list: [{ effect_kind: "STAT_UP", effect_size: 50 }, { effect_kind: "LIGHT_DOWN", effect_size: 100 },] },
        { name: "攻撃↓20%＆クリダメ+200%", list: [{ effect_kind: "ATTACK_DOWN", effect_size: 20 }, { effect_kind: "CLIRICAL_DAMAGE", effect_size: 200 },] },
    ];

    if (enemy_info === undefined || enemy_info.enemy_class != ENEMY_CLASS.SERAPH_ENCOUNTER) {
        return null;
    }

    const changeCradList = (index, value) => {
        const newIndices = [...selectedIndices];
        newIndices[index] = value;
        setSelectedIndices(newIndices);

        // 全選択肢のリストを合算
        const combinedList = newIndices
            .map((i) => CARD_LIST[i]?.list || [])
            .flat();

        updateSeraphEncounter(enemy_info, combinedList);
    };

    // メンバー更新
    window.getCardEffect = function (kind) {
        // 全選択肢のリストを合算
        const combinedList = selectedIndices
            .map((i) => CARD_LIST[i]?.list || [])
            .flat();
        let sum = 0;
        if (kind == "ATTACK_DOWN") {
            sum = 1;
            combinedList.forEach(element => {
                if (kind == element.effect_kind) {
                    sum *= (1 - element.effect_size / 100);
                }
            });
        } else {
            combinedList.forEach(element => {
                if (kind == element.effect_kind) {
                    sum += element.effect_size;
                }
            });
        }
        return sum;
    }

    return (
        <div className="bike_buff adjust_width mx-auto">
            <span className="ml-1">カードリスト</span>
            <div className="ml-4">
                {[0, 1, 2, 3].map((i) =>
                    enemy_info.sub_no > i + 1 ? (
                        <select
                            key={`card${i}`}
                            className="bike_parts w-[200px]"
                            value={selectedIndices[i]}
                            onChange={(e) => changeCradList(i, parseInt(e.target.value, 10))}
                        >
                            {CARD_LIST.map((item, index) => (
                                <option key={`card${i}_${index}`} value={index}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    ) : null
                )}
            </div>
        </div>
    );
};