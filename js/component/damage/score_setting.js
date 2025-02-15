const ScoreSettingComponent = ({ enemy_info }) => {

    const [selectHalf, setSelectHalf] = React.useState(1);
    if (enemy_info === undefined || enemy_info.enemy_class != ENEMY_CLASS_SCORE_ATTACK) {
        return null;
    }
    let filtered_grade = grade_list.filter((obj) => obj.score_attack_no == enemy_info.sub_no);
    let filtered_bonus = bonus_list.filter((obj) => obj.score_attack_no == enemy_info.sub_no);
    const uniqueHalf = [...new Set(filtered_grade.map(item => item.half))];

    let half_grade = filtered_grade.filter((obj) => obj.half == selectHalf);

    // タブ変更
    const handleTabChange = (half) => {
        setSelectHalf(half)
        setEnemyStatus(enemy_info, false);
    }

    // レベル変更
    const handleScoreChange = () => {
        setEnemyStatus(enemy_info, false);
    }

    // グレード変更
    const handleGradeChange = () => {
        setEnemyStatus(enemy_info, false);
    }


    const getImg = (conditions) => {
        let img = "img/";
        switch (conditions) {
            case "physical_1":
                img += "slash.webp";
                break;
            case "physical_2":
                img += "stab.webp";
                break;
            case "physical_3":
                img += "strike.webp";
                break;
            case "element_1":
                img += "fire.webp";
                break;
            case "element_2":
                img += "ice.webp";
                break;
            case "element_3":
                img += "thunder.webp";
                break;
            case "element_4":
                img += "light.webp";
                break;
            case "element_5":
                img += "dark.webp";
                break;
        }
        return img;
    }

    const getStr = (bonus) => {
        let str = "";
        switch (bonus.effect_kind) {
            case "STAT_UP":
                str += "全能力+";
        }
        str += bonus.effect_size;
        return str;
    }

    return (
        <div className="score_attack mx-auto">
            <div id="half_tab">
                {uniqueHalf.map((half, index) => (
                    <React.Fragment key={half}>
                        <input defaultChecked={index === 0} id={`half_tab_${half}`} name="rule_tab" type="radio" onChange={() => handleTabChange(half)} />
                        <label htmlFor={`half_tab_${half}`} id={`half_tab_${half}`}>
                            {half}週目
                        </label>
                    </React.Fragment>
                ))}

                <span id="score_turn">
                    ターン数
                    <select className="text-right w-12" id="turn_count">
                        {Array.from({ length: 30 }, (_, i) => (
                            <option value={i + 1} key={`turn_${i}`}>{i + 1}</option>
                        ))}
                    </select>
                </span>
                <span id="score_turn">
                    Lv
                    <select className="text-right w-12" id="score_lv" onChange={() => handleScoreChange()}>
                        {Array.from({ length: 50 }, (_, i) => (
                            <option value={150 - i} key={`score_lv_${i}`}>{150 - i}</option>
                        ))}
                    </select>
                </span>
                <div>
                    {half_grade.map((grade, index) => (
                        <div key={`grade_${selectHalf}_${index}`}>
                            <input className={`half_check half_tab_${selectHalf}`} type="checkbox" id={`half_grade${index}`}
                                data-grade_no={grade.grade_no}
                                onChange={() => handleGradeChange()} />
                            <label className="checkbox01" htmlFor={`half_grade${index}`}>
                                {grade.grade_name}(グレード:{grade.grade_rate})
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-1">
                <label>ボーナス</label>
                <div className="flex flex-wrap">
                    {filtered_bonus.map((bonus, index) => (
                        <div className="flex items-center" key={`bunus_${index}`}>
                            <img className="ml-1" src={getImg(bonus.conditions)} style={{ width: 20, height: 20 }} />
                            <label className="">{getStr(bonus)}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};
