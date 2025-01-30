const DetailSettingComponent = () => {

    // 属性交換
    const changeElement = () => {
        const before = Number(document.getElementById('change_element_before').value);
        const after = Number(document.getElementById('change_element_after').value);
        if (before !== 0 && after !== 0 && before !== after) {
            let element_before_value = document.getElementById(`enemy_element_${before}`).value;
            let element_after_value = document.getElementById(`enemy_element_${after}`).value;
            let element_before_className = document.getElementById(`enemy_element_${before}`).className;
            let element_after_className = document.getElementById(`enemy_element_${after}`).className;
            document.getElementById(`enemy_element_${before}`).value = element_after_value;
            document.getElementById(`enemy_element_${after}`).value = element_before_value;
            document.getElementById(`enemy_element_${before}`).className = element_after_className;
            document.getElementById(`enemy_element_${after}`).className = element_before_className;
        }
    }

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

    return (
        <div className="surround_area mx-auto mt-2 adjust_width" id="detail_setting">
            <label className="area_title">詳細設定</label>
            <ul className="text-sm ml-2">
                <li>
                    <label>バトル開始時</label>
                    <div className="ml-2">
                        フィールド
                        <select id="init_field" defaultValue="0">
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
                        <input className="step_od_gauge w-[70px]" defaultValue="0"
                            id="init_over_drive" max="300" min="0" step="0.01" type="number" onChange={(e) => {checkNumber(e)}} />
                        SP＋
                        <input className="step_sp" defaultValue="0"
                            id="init_sp_add" max="20" min="0" step="1" type="number" onChange={(e) => {checkNumber(e)}} />
                    </div>
                </li>
                <li>
                    <select defaultValue="0" id="change_element_before" onChange={(e) => changeElement()}>
                        <option value="0"></option>
                        <option value="1">火</option>
                        <option value="2">氷</option>
                        <option value="3">雷</option>
                        <option value="4">光</option>
                        <option value="5">闇</option>
                    </select>
                    弱点が
                    <select defaultValue="0" id="change_element_after" onChange={(e) => changeElement()}>
                        <option value="0"></option>
                        <option value="1">火</option>
                        <option value="2">氷</option>
                        <option value="3">雷</option>
                        <option value="4">光</option>
                        <option value="5">闇</option>
                    </select>
                    弱点に変化
                </li>
                <li>
                    <label>毎ターン</label>
                    前衛のSP+
                    <select className="step_sp" id="front_sp_add" defaultValue="0">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                    後衛のSP+
                    <select className="step_sp" id="back_sp_add" defaultValue="0">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </li>
                <li>
                    <select className="h-[25px]" id="step_turn" defaultValue="1">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    ターンごとに OverDriveGauge
                    <select className="step_od_gauge w-[60px]" id="step_over_drive_down" defaultValue="0">
                        <option value="0">0%</option>
                        <option value="-5">-5%</option>
                        <option value="-10">-10%</option>
                        <option value="-15">-15%</option>
                    </select>
                    SP
                    <select className="step_sp" id="step_sp_down" defaultValue="0">
                        <option value="0">0</option>
                        <option value="-1">-1</option>
                        <option value="-2">-2</option>
                        <option value="-3">-3</option>
                    </select>
                </li>
            </ul>
        </div>
    )
};