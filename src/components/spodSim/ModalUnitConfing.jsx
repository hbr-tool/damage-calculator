import React from "react";

const ModalUnitConfing = ({ turn, closeModal, placeNo, updateUnitData }) => {
    const filterUnit = turn.unitList.filter(unit => unit.placeNo === placeNo);
    const unit = filterUnit[0];

    const [sp, setSp] = React.useState(unit.sp);
    const [ep, setEp] = React.useState(unit.ep);
    const [token, setToken] = React.useState(unit.token);

    const handleChickSetting = (e) => {
        updateUnitData(placeNo, { sp, ep, token });
        closeModal();
    }

    return (
        <div className="p-6">
            <div className="skill_select_container">
                <span className="modal_label">ユニット設定</span>
                <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <p>設定値を一時的に変更します。</p>
            <p className="text-xs text-red-500">※再計算時（前ターンの変更、ロード時など）には元の値に戻ります。</p>
            <div className="w-[350px] mx-auto grid grid-cols-2 text-center mt-2">
                <span>SP</span>
                <input className="status" type="number" value={sp} onChange={(e) => setSp(Number(e.target.value))} />
                <span>EP</span>
                <input className="status" type="number" value={ep} onChange={(e) => setEp(Number(e.target.value))} />
                <span>token</span>
                <input className="status" type="number" value={token} onChange={(e) => setToken(Number(e.target.value))} />
            </div>
            <div className="text-center mt-2">
                <input type="button" className="w-24" value={"設定"} onClick={handleChickSetting} />
            </div>
        </div>
    )
};

export default ModalUnitConfing;