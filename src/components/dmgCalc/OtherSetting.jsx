import React, { useEffect } from 'react';

const OtherSetting = ({ attackInfo, otherSetting, setOtherSetting, bulkSetting }) => {

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (attackInfo?.attack_element === 0 && otherSetting.ring !== 0) {
            setOtherSetting((prev) => ({ ...prev, ring: 0 }));
        }
    }, [attackInfo?.attack_element, otherSetting.ring]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const changeBulkSetting = (name, value) => {
        let newSetting = { ...otherSetting, collect: { ...otherSetting.collect, [name]: value } };
        setOtherSetting(newSetting);
        bulkSetting(newSetting.collect);
    }

    return (
        <div className="surround_area mx-auto my-2 adjust_width">
            <label className="area_title">他設定</label>
            <div className="flex flex-wrap py-1 ml-3 gap-x-2 gap-y-2">
                <div className="flex">
                    <div className="pt-0.5">属性リング</div>
                    <select disabled={attackInfo?.attack_element === 0} value={otherSetting.ring} onChange={(e) => setOtherSetting({ ...otherSetting, ring: e.target.value })}>
                        <option value="0">無し</option>
                        {attackInfo?.attack_element !== 0 && (
                            <>
                                <option value="2">+0(2%)</option>
                                <option value="4">+1(4%)</option>
                                <option value="6">+2(6%)</option>
                                <option value="8">+3(8%)</option>
                                <option value="10">+4(10%)</option>
                            </>
                        )}
                    </select>
                </div>
                <div className="flex">
                    <div className="pt-0.5">ピアス</div>
                    <select value={otherSetting.earring} onChange={(e) => setOtherSetting({ ...otherSetting, earring: e.target.value })}>
                        <option value="0">選択無し</option>
                        <option value="attack_10">アタック10%</option>
                        <option value="attack_12">アタック12%</option>
                        <option value="attack_15">アタック15%</option>
                        <option value="break_10">ブレイク10%</option>
                        <option value="break_12">ブレイク12%</option>
                        <option value="break_15">ブレイク15%</option>
                        <option value="blast_10">ブラスト10%</option>
                        <option value="blast_12">ブラスト12%</option>
                        <option value="blast_15">ブラスト15%</option>
                    </select>
                </div>
                <div className="flex">
                    <div className="pt-0.5">チェーン</div>
                    <select value={otherSetting.chain} onChange={(e) => setOtherSetting({ ...otherSetting, chain: e.target.value })}>
                        <option value="0">選択無し</option>
                        <option value="1">火耀</option>
                        <option value="2">銀氷</option>
                        <option value="3">雷霆</option>
                        <option value="4">光輝</option>
                    </select>
                </div>
                <div className="flex">
                    <div className="pt-0.5">オーバードライブ</div>
                    <select value={otherSetting.overdrive} onChange={(e) => setOtherSetting({ ...otherSetting, overdrive: e.target.value })}>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
            </div>
            <label className="area_title">一括設定</label>
            <div className="flex flex-wrap py-1 ml-3 gap-x-4 gap-y-2">
                <div className="flex">
                    <input className="ml-3" id="bulkFightingspirit" type="checkbox"
                        value={otherSetting.collect.fightingspirit}
                        onChange={(e) => changeBulkSetting("fightingspirit", e.target.checked)} />
                    <label className="checkbox01" style={{ paddingTop: '2px' }} htmlFor="bulkFightingspirit">闘志</label>
                </div>
                <div className="flex">
                    <label className="pt-0.5" htmlFor="bulkStatDown">敵ステータス低下</label>
                    <select className="text-center w-16" id="bulkStatDown"
                        value={otherSetting.collect.statDown}
                        onChange={(e) => changeBulkSetting("statDown", e.target.value)} >
                        <option value="0">未設定</option>
                        <option value="20">-20</option>
                        <option value="70">-70</option>
                        <option value="100">-100</option>
                    </select>
                </div>
            </div>
        </div>
    )
};

export default OtherSetting;