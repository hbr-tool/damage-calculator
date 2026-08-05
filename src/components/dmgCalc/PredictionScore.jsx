import React from 'react';
import { ENEMY_CLASS } from "utils/const";
import { getScoreAttack, NO_BREAK_BONUS, DAMAGE_LIMIT, LEVEL_BONUS, TURN_BONUS } from "data/scoreData";

const PredictionScore = ({ damageResult, state, enemyClass }) => {
    let enemyInfo = state.enemyInfo
    let scoreLv = state.score.lv;
    let turnCount = state.score.turnCount;
    let totalGradeRate = state.score.totalGradeRate;
    const [checkNobreak, setCheckNobreak] = React.useState(true);
    const [socreEnemyUnit, setSocreEnemyUnit] = React.useState(enemyInfo.enemy_count);

    // スコア設定
    let noBreakValue = 0;
    let damageBonusAvg = 0;
    let damageBonusMax = 0;
    let damageBonusMin = 0;
    let damageLimitValue = 0;
    let maxDamageRate = 0;
    let levelBonus = 0;
    let turnBonus = 0;

    if (enemyClass === ENEMY_CLASS.SCORE_ATTACK) {
        let scoreAttack = getScoreAttack(enemyInfo.sub_no);
        let num = scoreLv - 20;
        levelBonus = LEVEL_BONUS[num];
        noBreakValue = checkNobreak ? NO_BREAK_BONUS[num] : 0;
        damageLimitValue = DAMAGE_LIMIT[scoreAttack["max_damage_rate"]][num]
        maxDamageRate = scoreAttack["max_damage_rate"];
        turnBonus = TURN_BONUS[turnCount];
    } else {
        levelBonus = 100_000;
        damageLimitValue = 2_000_000_000;
        maxDamageRate = 0.0001;
        const bonus = [0.00, 2.00, 2.00, 2.00, 2.00, 2.00, 
                            1.99, 1.98, 1.97, 1.96, 1.95, 
                            1.92, 1.89, 1.86, 1.83, 1.80, 
                            1.77, 1.74, 1.71, 1.68, 1.65, 
                            1.62, 1.59, 1.56, 1.53, 1.50, 
                            1.47, 1.44, 1.41, 1.38, 1.35];
        turnBonus = bonus[turnCount];
    }

    damageBonusAvg = getDamageBonus(damageResult.criticalResult.avg.damage, damageLimitValue, maxDamageRate, socreEnemyUnit);
    damageBonusMax = getDamageBonus(damageResult.criticalResult.max.damage, damageLimitValue, maxDamageRate, socreEnemyUnit);
    damageBonusMin = getDamageBonus(damageResult.criticalResult.min.damage, damageLimitValue, maxDamageRate, socreEnemyUnit);

    let summaryScoreAvg = Math.floor((levelBonus + noBreakValue + damageBonusAvg) * turnBonus * (1 + totalGradeRate / 100));
    let summaryScoreMax = Math.floor((levelBonus + noBreakValue + damageBonusMax) * turnBonus * (1 + totalGradeRate / 100));
    let summaryScoreMin = Math.floor((levelBonus + noBreakValue + damageBonusMin) * turnBonus * (1 + totalGradeRate / 100));

    const gradeBonus = "×" + (1 + totalGradeRate / 100);
    return (
        <div className="surround_area mx-auto my-2 adjust_width">
            <label className="area_title">予測スコア</label>
            <div className="mx-auto w-[350px] mt-2">
                <div>
                    <div className="prediction">難易度スコア</div>
                    <input type="text" className="text-center prediction_value" readOnly value={levelBonus.toLocaleString(0)}
                    />
                </div>
                <div>
                    <div className="prediction prediction_shift">
                        <input id="no_break_bonus_check" type="checkbox" checked={checkNobreak} onChange={(e) => setCheckNobreak(e.target.checked)} />
                        <label className="checkbox01" htmlFor="no_break_bonus_check">ノーブレイクボーナス</label>
                    </div>
                    <input type="text" className="text-center prediction_value" readOnly value={noBreakValue.toLocaleString(0)} />
                </div>
                <div>
                    <div className="prediction">
                        <label className="label_damage_bonus">最大ダメージボーナス</label>
                        <select value={socreEnemyUnit} onChange={(e) => setSocreEnemyUnit(e.target.value)}>
                            <option value="1">1体</option>
                            <option value="2">2体</option>
                            <option value="3">3体</option>
                        </select>
                    </div>
                    <input type="text" className="text-center prediction_value" readOnly value={damageBonusAvg.toLocaleString(0)}
                    />
                    <div className="flex items-center">
                        <div className="prediction_none" />
                        <div className="mt-1">（</div>
                        <input type="text" className="text-center prediction_value" readOnly value={damageBonusMin.toLocaleString(0)} />
                        <div className="mt-1">～</div>
                        <input type="text" className="text-center prediction_value" readOnly value={damageBonusMax.toLocaleString(0)} />
                        <div className="mt-1">）</div>
                    </div>
                </div>
                <div>
                    <div className="prediction">ターン数</div>
                    <input type="text" className="text-center prediction_value" readOnly value={"×" + turnBonus} />
                </div>
                <div>
                    <div className="prediction">グレードボーナス</div>
                    <input type="text" className="text-center prediction_value" readOnly value={gradeBonus} />
                </div>
                <div className="font-bold">
                    <div className="prediction mt-1">最終スコア</div>
                    <input type="text" className="text-center prediction_value" readOnly value={summaryScoreAvg.toLocaleString(2)} />
                    <div className="flex">
                        <div className="prediction_none" />
                        <div className="mt-1">（</div>
                        <input type="text" className="text-center prediction_value" readOnly value={summaryScoreMin.toLocaleString(2)} />
                        <div className="mt-1">～</div>
                        <input type="text" className="text-center prediction_value" readOnly value={summaryScoreMax.toLocaleString(2)} />
                        <div className="mt-1">）</div>
                    </div>
                </div>
            </div>
        </div>
    )
};

// ダメージボーナス算出
function getDamageBonus(damage, damageLimitValue, maxDamageRate, socreEnemyUnit) {
    damage *= Number(socreEnemyUnit);
    // ダメージ上限
    damage = damage > 2_000_000_000 ? 2_000_000_000 : damage;
    let damageBonus;
    if (damage <= damageLimitValue) {
        damageBonus = damage;
    } else {
        damageBonus = damageLimitValue * (1 + Math.log(damage / damageLimitValue));
    }
    return Math.floor(damageBonus * maxDamageRate);
}

export default PredictionScore