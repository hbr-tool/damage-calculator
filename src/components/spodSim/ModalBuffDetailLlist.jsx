import React from "react";
import { getBuffIconImg, getBuffKindName } from "./logic";
import { BUFF } from "utils/const";
import buffIcons from 'assets/buffIcons';

const BuffDetailLabelComponent = ({ buff }) => {
    let img = buffIcons[getBuffIconImg(buff)];
    let buffKindName = getBuffKindName(buff);
    let buffText = buff.buff_name;
    switch (buff.buff_kind) {
        case BUFF.MORALE: // 士気
            buffText += `(Lv${buff.lv})`;
            break;
        default:
            if (buff.rest_turn > 0) {
                buffText += `(残りターン${buff.rest_turn})`;
            }
            break;
    }
    return (
        < div className="flex detail_line_height" >
            <img className="icon_buff_detail" src={img} alt={buffKindName}/>
            <label>
                {buffKindName}
                <br />
                {buffText}
            </label>
        </div >
    )
};

const BuffDetailListComponent = ({ buffList }) => {
    return (
        <div className="p-6">
            <div className="mb-4">
                <label className="modal_label">バフ一覧</label>
                {buffList.map((buff, index) => {
                    return <BuffDetailLabelComponent buff={buff} key={`buff_detail_label${index}`} />
                })}
            </div>
        </div>
    )
};

export default BuffDetailListComponent