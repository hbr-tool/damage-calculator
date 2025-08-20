import React from "react";
import scoreGrade from "data/scoreGrade";
import bonusList from "data/scoreBonus";
import attribute from 'assets/attribute';
import { getScoreAttack, getScoreHpDp, SCORE_STATUS } from "data/scoreData";

const ScoreSetting = ({ state, dispatch }) => {
    const selectHalf = state.score.half
    const [checkedGrades, setCheckedGrades] = React.useState({});

    let enemyInfo = state.enemyInfo;

    /* eslint-disable react-hooks/exhaustive-deps */
    React.useEffect(() => {
        setCheckedGrades([]);
        handleScoreChange(40);
    }, [enemyInfo.sub_no]);
    /* eslint-enable react-hooks/exhaustive-deps */

    let filteredGrade = scoreGrade.filter((obj) => obj.score_attack_no === enemyInfo.sub_no);
    const uniqueHalf = [...new Set(filteredGrade.map(item => item.half))];
    let filteredBonus = bonusList.filter((obj) => obj.score_attack_no === enemyInfo.sub_no && (obj.half === 0 || obj.half === selectHalf));

    let halfGrade = filteredGrade.filter((obj) => obj.half === selectHalf);

    // タブ変更
    const handleTabChange = (half) => {
        setCheckedGrades([]);
        dispatch({ type: "RESET_COLLECT", half });
    }

    // ターン変更
    const handleTurnChange = (turn) => {
        dispatch({ type: "SET_SCORE_TURN", turn });
    }

    // レベル変更
    const handleScoreChange = (lv) => {
        let status = SCORE_STATUS[Number(lv) - 20]
        let scoreAttack = getScoreAttack(enemyInfo.sub_no);
        let max_dp = getScoreHpDp(Number(lv), scoreAttack, "dp_rate").toString();
        let max_hp = getScoreHpDp(Number(lv), scoreAttack, "hp_rate");
        dispatch({ type: "SET_SCORE_LV", lv, status, max_dp, max_hp });
    }

    // グレード変更
    const handleGradeChange = (grade, checked) => {
        // チェック状態の更新
        const newCheckedGrades = {
            ...checkedGrades,
            [grade.grade_no]: checked
        };
        setCheckedGrades(newCheckedGrades);

        // チェックされているgradeの合計を計算
        const totalGradeRate = halfGrade
            .filter(g => newCheckedGrades[g.grade_no])
            .reduce((sum, g) => sum + g.grade_rate, 0);

        dispatch({ type: "SET_COLLECT", grade, checked, totalGradeRate });
    };

    const getImg = (conditions) => {
        let img = "";
        switch (conditions) {
            case "physical_1":
                img += "slash";
                break;
            case "physical_2":
                img += "stab";
                break;
            case "physical_3":
                img += "strike";
                break;
            case "element_1":
                img += "fire";
                break;
            case "element_2":
                img += "ice";
                break;
            case "element_3":
                img += "thunder";
                break;
            case "element_4":
                img += "light";
                break;
            case "element_5":
                img += "dark";
                break;
            default:
                break;
        }
        return img;
    }

    const getStr = (bonus) => {
        let str = "";
        switch (bonus.effect_kind) {
            case "STAT_UP":
                str += "全能力+";
                break;
            default:
                break;
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
                        <label htmlFor={`half_tab_${half}`}>
                            {half}週目
                        </label>
                    </React.Fragment>
                ))}

                <span id="score_turn">
                    ターン数
                    <select className="text-right w-12" value={state.score.turn} onChange={(e) => handleTurnChange(e.target.value)}>
                        {Array.from({ length: 30 }, (_, i) => (
                            <option value={i + 1} key={`turn_${i}`}>{i + 1}</option>
                        ))}
                    </select>
                </span>
                <span id="score_turn">
                    Lv
                    <select className="text-right w-12" value={state.score.lv} onChange={(e) => handleScoreChange(e.target.value)}>
                        {Array.from({ length: 20 }, (_, i) => (
                            <option value={40 - i} key={`score_lv_${i}`}>{40 - i}</option>
                        ))}
                    </select>
                </span>
                <div>
                    {halfGrade.map((grade, index) => (
                        <div key={`grade_${selectHalf}_${index}`}>
                            <input className={`half_check half_tab_${selectHalf}`} type="checkbox" id={`halfGrade${index}`}
                                data-grade_no={grade.grade_no}
                                checked={!!checkedGrades[grade.grade_no]}
                                onChange={(e) => handleGradeChange(grade, e.target.checked)} />
                            <label className="checkbox01" htmlFor={`halfGrade${index}`}>
                                {grade.grade_name}(グレード:{grade.grade_rate})
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-1">
                <label>ボーナス(ステータスは自動的に加算されます)</label>
                <div className="flex flex-wrap">
                    {filteredBonus.map((bonus, index) => (
                        <div className="flex items-center" key={`bunus_${index}`}>
                            <img className="ml-1" src={attribute[getImg(bonus.conditions)]} style={{ width: 20, height: 20 }}
                                alt={getImg(bonus.conditions)} />
                            <label className="">{getStr(bonus)}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default ScoreSetting;