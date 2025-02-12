const PredictionScoreComponent = ({}) => {

    React.useEffect(() => {
        // 初回起動時に強制表示(移行中の暫定対応)
        calcDamage();
    }, []);

    return (
        <>
            <label className="area_title">予測スコア</label>
            <div className="mx-auto w-[330px] mt-2">
                <div>
                    <div className="prediction">難易度スコア</div>
                    <input
                        className="text-center prediction_value"
                        id="lv_score"
                        readOnly
                        type="text"
                    />
                </div>
                <div>
                    <div className="prediction prediction_shift">
                        <input defaultChecked id="no_break_bonus_check" type="checkbox" />
                        <label className="checkbox01" htmlFor="no_break_bonus_check">
                            ノーブレイクボーナス
                        </label>
                    </div>
                    <input
                        className="text-center prediction_value"
                        id="no_break_bonus"
                        readOnly
                        type="text"
                    />
                </div>
                <div>
                    <div className="prediction">
                        <label className="label_damage_bonus">最大ダメージボーナス</label>
                        <select id="socre_enemy_unit">
                            <option value="1">1体</option>
                            <option value="2">2体</option>
                            <option value="3">3体</option>
                        </select>
                    </div>
                    <input
                        className="text-center prediction_value"
                        id="damage_bonus_avg"
                        readOnly
                        type="text"
                    />
                    <div className="flex items-center">
                        <div className="prediction_none" />
                        <div className="mt-1">（</div>
                        <input
                            className="text-center prediction_value"
                            id="damage_bonus_min"
                            readOnly
                            type="text"
                        />
                        <div className="mt-1">～</div>
                        <input
                            className="text-center prediction_value"
                            id="damage_bonus_max"
                            readOnly
                            type="text"
                        />
                        <div className="mt-1">）</div>
                    </div>
                </div>
                <div>
                    <div className="prediction">ターン数</div>
                    <input
                        className="text-center prediction_value"
                        id="turn_bonus"
                        readOnly
                        type="text"
                    />
                </div>
                <div>
                    <div className="prediction">グレードボーナス</div>
                    <input
                        className="text-center prediction_value"
                        id="grade_bonus"
                        readOnly
                        type="text"
                    />
                </div>
                <div className="font-bold">
                    <div className="prediction mt-1">最終スコア</div>
                    <input
                        className="text-center prediction_value"
                        id="summary_score_avg"
                        readOnly
                        type="text"
                    />
                    <div className="flex">
                        <div className="prediction_none" />
                        <div className="mt-1">（</div>
                        <input
                            className="text-center prediction_value"
                            id="summary_score_min"
                            readOnly
                            type="text"
                        />
                        <div className="mt-1">～</div>
                        <input
                            className="text-center prediction_value"
                            id="summary_score_max"
                            readOnly
                            type="text"
                        />
                        <div className="mt-1">）</div>
                    </div>
                </div>
            </div>
        </>
    )
};

$(function () {
    const rootElement = document.getElementById('prediction_score');
    ReactDOM.createRoot(rootElement).render(<PredictionScoreComponent />);
});