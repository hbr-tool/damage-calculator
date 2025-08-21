import React from 'react';
import { getScoreAttack, NO_BREAK_BONUS, LEVEL_BONUS, TURN_BONUS, DAMAGE_LIMIT1, DAMAGE_LIMIT2 } from "data/scoreData";

const PredictionScore = ({ damageResult, state }) => {
    let enemyInfo = state.enemyInfo
    let scoreLv = state.score.lv;
    let turnCount = state.score.turnCount;
    let totalGradeRate = state.score.totalGradeRate;
    const [checkNobreak, setCheckNobreak] = React.useState(true);
    const [socreEnemyUnit, setSocreEnemyUnit] = React.useState(enemyInfo.enemy_count);

    // スコア設定
    let scoreAttack = getScoreAttack(enemyInfo.sub_no);
    let num = scoreLv - 20;
    let noBreakValue = checkNobreak ? NO_BREAK_BONUS[num] : 0;
    let damageBonusAvg = getDamageBonus(damageResult.criticalResult.avg.damage, num, scoreAttack, socreEnemyUnit);
    let damageBonusMax = getDamageBonus(damageResult.criticalResult.max.damage, num, scoreAttack, socreEnemyUnit);
    let damageBonusMin = getDamageBonus(damageResult.criticalResult.min.damage, num, scoreAttack, socreEnemyUnit);
    let summaryScoreAvg = Math.floor((LEVEL_BONUS[num] + noBreakValue + damageBonusAvg) * TURN_BONUS[turnCount] * (1 + totalGradeRate / 100));
    let summaryScoreMax = Math.floor((LEVEL_BONUS[num] + noBreakValue + damageBonusMax) * TURN_BONUS[turnCount] * (1 + totalGradeRate / 100));
    let summaryScoreMin = Math.floor((LEVEL_BONUS[num] + noBreakValue + damageBonusMin) * TURN_BONUS[turnCount] * (1 + totalGradeRate / 100));

    const turnBonus = "×" + TURN_BONUS[turnCount];
    const gradeBonus = "×" + (1 + totalGradeRate / 100);
    return (
        <div className="surround_area mx-auto my-2 adjust_width">
            <label className="area_title">予測スコア</label>
            <div className="mx-auto w-[350px] mt-2">
                <div>
                    <div className="prediction">難易度スコア</div>
                    <input type="text" className="text-center prediction_value" readOnly value={LEVEL_BONUS[num].toLocaleString(0)}
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
                    <input type="text" className="text-center prediction_value" readOnly value={turnBonus} />
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
function getDamageBonus(damage, num, scoreAttack, socreEnemyUnit) {
    damage *= Number(socreEnemyUnit);
    // ダメージ上限
    damage = damage > 2_000_000_000 ? 2_000_000_000 : damage;
    let damageBonus;
    let damageLimitValue;
    if (scoreAttack.enemy_count === 1) {
        damageLimitValue = DAMAGE_LIMIT1[num];
    } else {
        damageLimitValue = DAMAGE_LIMIT2[num];
    }
    if (damage <= damageLimitValue) {
        damageBonus = damage;
    } else {
        damageBonus = damageLimitValue * (1 + Math.log(damage / damageLimitValue));
    }
    return Math.floor(damageBonus * scoreAttack.max_damage_rate);
}

export default PredictionScore