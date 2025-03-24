const BikePartsComponent = ({ enemy_info }) => {

    const BIKE_PARTS_LIST = ["無し(その他)", "攻撃＋", "クリティカル率＋", "チャージ", "敵防御ダウン", "攻撃＋＋", "心眼(改)", "クリティカルダメージ＋", "連撃＋", "破壊率＋",
        "攻撃＋改", "クリティカル率＋改", "敵防御ダウン改", "攻撃＋＋改", "クリティカルダメージ＋改", "連撃＋改", "破壊率＋改"];

    if (enemy_info === undefined || enemy_info.enemy_class != ENEMY_CLASS_CONTROL_BATTLE) {
        removeSupportMember(0);
        return null;
    }
    React.useEffect(() => {
        // メンバー情報作成
        let member_info = new Member();
        member_info.is_select = true;
        member_info.chara_no = 20;
        let style_info = {};
        style_info.chara_id = 501;
        style_info.jewel_type = 0;
        member_info.style_info = style_info;
        support_style_list[0] = member_info;
        addBuffList(member_info, 2);
    }, []);

    // バイクパーツ交換
    const changeBikePatrs = () => {
        let has_charge = false;
        let has_mindeye = false;
        let has_funnel = false;
        let has_funnel_impro = false;
        $('.bike_parts').each(function () {
            if ($(this).val() === "3") {
                has_charge = true;
            }
            if ($(this).val() === "6") {
                has_mindeye = true;
            }
            if ($(this).val() === "8") {
                has_funnel = true;
            }
            if ($(this).val() === "15") {
                has_funnel_impro = true;
            }
        });
        if (has_charge) {
            toggleItemVisibility(`.skill_id-8001`, true);
            $(".charge").each(function (index, value) {
                sortEffectSize($(value));
                select2ndSkill($(value));
            });
        } else {
            toggleItemVisibility(`.skill_id-8001`, false);
        }
        if (has_mindeye) {
            toggleItemVisibility(`.skill_id-8002`, true);
            $(".mindeye").each(function (index, value) {
                sortEffectSize($(value));
                select2ndSkill($(value));
            });
        } else {
            toggleItemVisibility(`.skill_id-8002`, false);
        }
        if (has_funnel) {
            toggleItemVisibility(`.skill_id-8003`, true);
            $(".funnel").each(function (index, value) {
                sortEffectSize($(value));
                select2ndSkill($(value));
            });
        } else {
            toggleItemVisibility(`.skill_id-8003`, false);
        }
        if (has_funnel_impro) {
            toggleItemVisibility(`.skill_id-8004`, true);
            $(".funnel").each(function (index, value) {
                sortEffectSize($(value));
                select2ndSkill($(value));
            });
        } else {
            toggleItemVisibility(`.skill_id-8004`, false);
        }
    }

    // ステータスアップ変更
    const handleAllStatusUpChange = () => {
        updateVariableEffectSize();
    }

    return (
        <div className="bike_buff adjust_width mx-auto">
            <div className="mt-2">
                メンバーの全能力＋
                <input className="limit_number" defaultValue="0" id="all_status_up" max="286" min="0" step="1" type="number" onChange={handleAllStatusUpChange} />
            </div>
            <div className="mt-1">
                <span>バイクパーツ</span>
                <select className="bike_parts w-24" id="bike_parts_1" onChange={changeBikePatrs}>
                    {BIKE_PARTS_LIST.map((item, index) => (
                        <option key={`bike1_${index}`} value={index}>{item}</option>
                    ))}
                </select>
                <select className="bike_parts w-24" id="bike_parts_2" onChange={changeBikePatrs}>
                    {BIKE_PARTS_LIST.map((item, index) => (
                        <option key={`bike1_${index}`} value={index}>{item}</option>
                    ))}
                </select>
                <select className="bike_parts w-24" id="bike_parts_3" onChange={changeBikePatrs}>
                    {BIKE_PARTS_LIST.map((item, index) => (
                        <option key={`bike1_${index}`} value={index}>{item}</option>
                    ))}
                </select>
            </div>
        </div>
    )
};
