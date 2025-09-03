import ReactModal from "react-modal";
import React, { useState } from "react";
import { generateGradientFromRange } from "./logic";

const DamageDetail = ({ mode, enemyInfo, detail, result, dispatch, closeModal }) => {

    let dispRestHp = calculatePercentage(result.max.restHp, result.min.restHp, enemyInfo.max_hp, "hp");
    let gradientStyleHp = generateGradientFromRange(dispRestHp, "#BE71BE")

    // 破壊率
    const maxRate = Math.round(result.max.damageRate * 10) / 10;
    const minRate = Math.round(result.min.damageRate * 10) / 10;

    const handleChilckRefrection = () => {
        if (result.avg.restDp[0] <= 0) {
            dispatch({ type: "RESET_DP" });
            dispatch({ type: "SET_HP", value: Math.floor(result.min.restHp / enemyInfo.max_hp * 100) });
            dispatch({ type: "SET_DAMAGE_RATE", value: Math.floor(result.avg.damageRate) });
            closeModal();
        } else {
            for (let index = result.avg.restDp.length; index >= 0; index--) {
                if (result.avg.restDp[index] > 0) {
                    dispatch({
                        type: "SET_DP", index,
                        value: Math.floor(result.avg.restDp[index] / Number(enemyInfo.max_dp.split(",")[index]) * 100)
                    });
                }
            }
            dispatch({ type: "SET_DAMAGE_RATE", value: Math.floor(result.avg.damageRate) });
            closeModal();
        }
    }

    const rateText = maxRate === minRate ? `${maxRate}%` : `${maxRate}%～${minRate}%`;
    return (
        <div className="modal text-left mx-auto p-6">
            <div>
                <span className="damage_label">ダメージ詳細</span>
            </div>
            <div className="text-center mx-auto">
                <input type="text" className="text-center damage"
                    value={result.avg.damage.toLocaleString()} readOnly />
                <div>
                    最大
                    <input type="text" className="text-center min_damage"
                        value={result.max.damage.toLocaleString()} readOnly />
                </div>
                <div>
                    最小
                    <input type="text" className="text-center min_damage"
                        value={result.min.damage.toLocaleString()} readOnly />
                </div>
                <span className="detail_max_damage">最終破壊率</span>
                <span className="damage_label">{rateText}</span>
            </div>
            <div className="enemy_rest_hp text-center w-[240px] mx-auto">
                <div className="flex">
                    <div className="w-8">DP</div>
                    <div>
                        {result.avg.restDp.map((dp, revIndex) => {
                            const index = result.avg.restDp.length - 1 - revIndex;
                            let enemyDp = Number(enemyInfo.max_dp.split(",")[index]);
                            let dispRestDp = calculatePercentage(result.max.restDp[index], result.min.restDp[index], enemyDp, "hp");
                            return (
                                <output key={index} className="rest_gauge_rate"
                                    style={{ background: generateGradientFromRange(dispRestDp, "#A7BEC5") }}>{dispRestDp}</output>
                            )
                        })}
                    </div>
                </div>
                <div className="flex">
                    <div className="w-8">HP</div>
                    <div>
                        <div className="flex">
                            <output className="rest_gauge_rate" style={{ background: gradientStyleHp }}>{dispRestHp}</output>
                        </div>
                    </div>
                </div>
                <input type="button" className="durability_reflection" defaultValue="敵情報に反映" onClick={handleChilckRefrection} />
            </div>
            <div className="w-[250px] mx-auto mt-3">
                <div className="font-bold">補正詳細(初段Hit時点)</div>
                <div>
                    <div className="magnification">スキル攻撃力</div>
                    <input type="text" className="text-center magnification_value" value={result.skillPower} readOnly />
                </div>
                <div>
                    <div className="magnification">×攻撃力アップ</div>
                    <input type="text" className="text-center magnification_value" value={detail.buff} readOnly />
                </div>
                <div>
                    <div className="magnification">×防御力ダウン</div>
                    <input type="text" className="text-center magnification_value" value={detail.debuff} readOnly />
                </div>
                <div>
                    <div className="magnification">×HP/DP特攻</div>
                    <input type="text" className="text-center magnification_value" value={detail.special} readOnly />
                </div>
                <div>
                    <div className="magnification">×連撃</div>
                    <input type="text" className="text-center magnification_value" value={detail.funnel} readOnly />
                </div>
                <div>
                    <div className="magnification">×トークン補正</div>
                    <input type="text" className="text-center magnification_value" value={detail.token} readOnly />
                </div>
                <div>
                    <div className="magnification">×武器相性</div>
                    <input type="text" className="text-center magnification_value" value={detail.physical} readOnly />
                </div>
                <div>
                    <div className="magnification">×属性相性</div>
                    <input type="text" className="text-center magnification_value" value={detail.element} readOnly />
                </div>
                <div>
                    <div className="magnification">×破壊率</div>
                    <input type="text" className="text-center magnification_value" value={detail.damageRate} readOnly />
                </div>
                <div>
                    <div className="magnification">×オーバードライブ</div>
                    <input type="text" className="text-center magnification_value" value={detail.overdrive} readOnly />
                </div>
                <div>
                    <div className="magnification">×スキル固有補正</div>
                    <input type="text" className="text-center magnification_value" value={detail.skillUniqueRate} readOnly />
                </div>
                <div>
                    <div className="magnification">×敵防御力</div>
                    <input type="text" className="text-center magnification_value" value={detail.enemyDefenceRate} readOnly />
                </div>
                {mode === "critical" && (
                    <div>
                        <div className="magnification">×クリティカル倍率</div>
                        <input type="text" className="text-center magnification_value" value={detail.criticalBuff} readOnly />
                    </div>
                )}
            </div>
        </div>
    )
}

// 残りの実数値と全体値から、割合範囲を取得する。
function calculatePercentage(min, max, total, dphp) {
    if (total === 0) {
        return "0%";
    }
    // 最小値、最大値、全体値が0以下の場合、それぞれ0に設定
    let temp_min = Math.max(0, min);
    let temp_max = Math.max(0, max);

    // 最小値と最大値が同じ場合は、範囲指定しない
    if (Math.ceil((temp_min / total) * 100) === Math.ceil((temp_max / total) * 100)) {
        return Math.ceil((temp_min / total) * 100) + '%';
    } else {
        if (dphp === "hp") {
            return Math.ceil((min / total) * 100) + '%～' + Math.ceil((max / total) * 100) + '%';
        } else {
            return Math.ceil((temp_min / total) * 100) + '%～' + Math.ceil((temp_max / total) * 100) + '%';
        }
    }
}

const DamageResult = ({ damageResult, enemyInfo, dispatch }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        mode: ""
    });

    if (!damageResult) return null;
    const openModal = (mode) => setModal({ isOpen: true, mode: mode });
    const closeModal = () => setModal({ isOpen: false, mode: "" });
    return (
        <>
            <div className="footer">
                <div className="text-center mx-auto" id="damage_result">
                    <div className="flex">
                        <div className="mt-2 damage-flex">
                            <div>
                                <span className="damage_label">クリティカル</span>
                                <span className="font-bold">{`(発生率${damageResult.criticalRate})`}</span>
                            </div>
                            <div>
                                <span className="damage_label">最終破壊率</span>
                                <span className="damage_label">{`${damageResult.criticalResult.avg.damageRate}%`}</span>
                                <input type="button" className="open_detail" defaultValue="詳細" onClick={() => openModal("critical")} />

                            </div>
                            <div className="text-center mx-auto">
                                <input type="text" className="text-center damage"
                                    value={damageResult.criticalResult.avg.damage.toLocaleString()} readOnly />
                                <div className="leading-4 items-end">
                                    <span className="pb-0.5">(</span>
                                    <input type="text" className="text-center min_damage"
                                        value={damageResult.criticalResult.min.damage.toLocaleString()} readOnly />
                                    <span className="pb-0.5">～</span>
                                    <input type="text" className="text-center min_damage"
                                        value={damageResult.criticalResult.max.damage.toLocaleString()} readOnly />
                                    <span className="pb-0.5">)</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 damage-flex">
                            <div>
                                <span className="damage_label">通常ダメージ</span>
                            </div>
                            <div>
                                <span className="damage_label">最終破壊率</span>
                                <span className="damage_label">{`${damageResult.normalResult.avg.damageRate}%`}</span>
                                <input type="button" className="open_detail" defaultValue="詳細" onClick={() => openModal("normal")} />
                            </div>
                            <div className="text-center mx-auto">
                                <input className="text-center damage"
                                    value={damageResult.normalResult.avg.damage.toLocaleString()} readOnly type="text" />
                                <div className="leading-4 items-end">
                                    <span className="pb-0.5">(</span>
                                    <input type="text" className="text-center min_damage"
                                        value={damageResult.normalResult.min.damage.toLocaleString()} readOnly />
                                    <span className="pb-0.5">～</span>
                                    <input type="text" className="text-center min_damage"
                                        value={damageResult.normalResult.max.damage.toLocaleString()} readOnly />
                                    <span className="pb-0.5">)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ReactModal
                isOpen={modal.isOpen}
                onRequestClose={closeModal}
                className={"modal-content " + (modal.isOpen ? "modal-content-open" : "")}
                overlayClassName={"modal-overlay " + (modal.isOpen ? "modal-overlay-open" : "")}
            >
                <DamageDetail mode={modal.mode} enemyInfo={enemyInfo} detail={damageResult} dispatch={dispatch}
                    result={modal.mode === "critical" ? damageResult.criticalResult : damageResult.normalResult}
                    closeModal={closeModal} />
            </ReactModal>
        </>
    )
}

export default DamageResult;