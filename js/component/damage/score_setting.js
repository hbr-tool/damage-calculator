const ScoreSettingComponent = ({ enemy_info }) => {

    const [selectHalf, setSelectHalf] = React.useState(1);
    if (enemy_info === undefined || enemy_info.enemy_class != ENEMY_CLASS_SCORE_ATTACK) {
        return null;
    }
    let filtered_grade = grade_list.filter((obj) => obj.score_attack_no == enemy_info.sub_no);
    const uniqueHalf = [...new Set(filtered_grade.map(item => item.half))];

    let half_grade = filtered_grade.filter((obj) => obj.half == selectHalf);

    // レベル変更
    const handleScoreChange = () => {
        setEnemyStatus(enemy_info);
    }

    // グレード変更
    const handleGradeChange = () => {
        setEnemyStatus(enemy_info);
    }

    return (
        <div className="score_attack mx-auto">
            <div id="half_tab">
                {uniqueHalf.map((half, index) => (
                    <React.Fragment key={half}>
                        <input defaultChecked={index === 0} id={`half_tab_${half}`} name="rule_tab" type="radio" onChange={() => setSelectHalf(half)}/>
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
                        <div key={`grade_${index}`}>
                            <input className={`half_check half_tab_${index + 1}`} type="checkbox" id={`half_grade${index}`}
                             data-grade_no={grade.grade_no}
                             onChange={() => handleGradeChange()}/>
                            <label className="checkbox01" htmlFor={`half_grade${index}`}>
                                {grade.grade_name}(グレード:{grade.grade_rate})
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};
