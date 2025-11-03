import React from 'react';

const DetailSetting = ({ detailSetting, setDetailSetting }) => {

    // 入力値チェック
    const checkNumber = (e) => {
        let value = e.target.value;
        const max = Number(e.target.getAttribute('max'));
        const min = Number(e.target.getAttribute('min'));
        if (isNaN(value)) {
            value = 0;
        }
        if (value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }
        e.target.value = value;
    }

    const updateDetailSetting = (e) => {
        let kind = e.target.id;
        let value = e.target.value;
        const updatedDetailSetting = { ...detailSetting };
        updatedDetailSetting[kind] = value;
        setDetailSetting(updatedDetailSetting);
    }

    const ELEMENT_WEAK_LIST = [-150, -100, -50, 0, 50, 100, 150];
    return (
        <div className="surround_area mx-auto mt-2 adjust_width" id="detail_setting">
            <label className="area_title">詳細設定</label>
            <ul className="text-sm ml-2">
                <li>
                    <label>バトル開始時</label>
                    <div className="ml-2">
                        フィールド
                        <select id="initField" value={detailSetting.initField} onChange={(e) => updateDetailSetting(e)}>
                            <option value="0">無し</option>
                            <option value="1">火</option>
                            <option value="2">氷</option>
                            <option value="3">雷</option>
                            <option value="4">光</option>
                            <option value="5">闇</option>
                            <option value="6">稲穂</option>
                            <option value="7">砂嵐</option>
                        </select>
                        OverDriveGauge
                        <input className="step_od_gauge w-[70px]" value={detailSetting.initOverDrive}
                            id="initOverDrive" max="300" min="-300" step="0.01" type="number"
                            onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                        SP＋
                        <input className="step_sp" value={detailSetting.initSpAdd}
                            id="initSpAdd" max="20" min="-20" step="1" type="number"
                            onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                    </div>
                </li>
                <li>
                    弱点変化 火
                    <select value={detailSetting.changeElement1} id="changeElement1" className="text-right" onChange={(e) => updateDetailSetting(e)}>
                        {ELEMENT_WEAK_LIST.map((value, index) => {
                            return <option key={index} value={value}>{value}</option>
                        })}
                    </select>
                    水
                    <select value={detailSetting.changeElement2} id="changeElement2" className="text-right" onChange={(e) => updateDetailSetting(e)}>
                        {ELEMENT_WEAK_LIST.map((value, index) => {
                            return <option key={index} value={value}>{value}</option>
                        })}
                    </select>
                    雷
                    <select value={detailSetting.changeElement3} id="changeElement3" className="text-right" onChange={(e) => updateDetailSetting(e)}>
                        {ELEMENT_WEAK_LIST.map((value, index) => {
                            return <option key={index} value={value}>{value}</option>
                        })}
                    </select>
                    光
                    <select value={detailSetting.changeElement4} id="changeElement4" className="text-right" onChange={(e) => updateDetailSetting(e)}>
                        {ELEMENT_WEAK_LIST.map((value, index) => {
                            return <option key={index} value={value}>{value}</option>
                        })}
                    </select>
                    闇
                    <select value={detailSetting.changeElement5} id="changeElement5" className="text-right" onChange={(e) => updateDetailSetting(e)}>
                        {ELEMENT_WEAK_LIST.map((value, index) => {
                            return <option key={index} value={value}>{value}</option>
                        })}
                    </select>
                </li>
                <li>
                    <select className="h-[25px]" id="stepTurnOverDrive" value={detailSetting.stepTurnOverDrive} onChange={(e) => updateDetailSetting(e)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    ターンごとに OverDriveGauge
                    <input id="stepOverDriveGauge" className="step_od_gauge w-[70px]" value={detailSetting.stepOverDriveGauge}
                        max="300" min="-300" step="5" type="number" onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                </li>
                <li>
                    <select className="h-[25px]" id="stepTurnSp" value={detailSetting.stepTurnSp} onChange={(e) => updateDetailSetting(e)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    ターンごとに SP 全体
                    <select className="step_sp" id="stepSpAllAdd" value={detailSetting.stepSpAllAdd} onChange={(e) => updateDetailSetting(e)}>
                        {Array.from({ length: 11 }, (_, i) => {
                            const value = i - 5;
                            return (
                                <option value={value} key={value}>
                                    {value > 0 ? `+${value}` : value}
                                </option>
                            );
                        })}
                    </select>
                    前衛
                    <select className="step_sp" id="stepSpFrontAdd" value={detailSetting.stepSpFrontAdd} onChange={(e) => updateDetailSetting(e)}>
                        {Array.from({ length: 11 }, (_, i) => {
                            const value = i - 5;
                            return (
                                <option value={value} key={value}>
                                    {value > 0 ? `+${value}` : value}
                                </option>
                            );
                        })}
                    </select>
                    後衛
                    <select className="step_sp" id="stepSpBackAdd" value={detailSetting.stepSpBackAdd} onChange={(e) => updateDetailSetting(e)}>
                        {Array.from({ length: 11 }, (_, i) => {
                            const value = i - 5;
                            return (
                                <option value={value} key={value}>
                                    {value > 0 ? `+${value}` : value}
                                </option>
                            );
                        })}
                    </select>
                </li>
                <li>
                    <input id="ordinalTurnOverDrive" className="step_od_gauge w-[30px]" value={detailSetting.ordinalTurnOverDrive}
                        max="30" min="0" step="1" type="number" onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                    ターン目に OverDriveGauge
                    <input id="ordinalOverDriveGauge" className="step_od_gauge w-[70px]" value={detailSetting.ordinalOverDriveGauge}
                        max="300" min="-300" step="5" type="number" onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                </li>
                <li>
                    <input id="ordinalTurnSp" className="step_od_gauge w-[30px]" value={detailSetting.ordinalTurnSp}
                        max="30" min="0" step="1" type="number" onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                    ターン目に SP 全体
                    <input id="ordinalSpAllAdd" className="step_od_gauge step_sp" value={detailSetting.ordinalSpAllAdd}
                        max="30" min="-30" step="1" type="number" onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                    前衛
                    <input id="ordinalSpFrontAdd" className="step_od_gauge step_sp" value={detailSetting.ordinalSpFrontAdd}
                        max="30" min="-30" step="1" type="number" onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                    後衛
                    <input id="ordinalSpBackAdd" className="step_od_gauge step_sp" value={detailSetting.ordinalSpBackAdd}
                        max="30" min="-30" step="1" type="number" onChange={(e) => { checkNumber(e); updateDetailSetting(e) }} />
                </li>
            </ul>
        </div>
    )
};

export default DetailSetting;