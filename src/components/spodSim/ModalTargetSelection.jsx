import React from "react";
import thumbnail from 'assets/thumbnail';
import crossIcon from 'assets/img/cross.png';

const ModalTargetSelection = ({ closeModal, onSelect, unitList }) => {

    const setSelectTarget = (chara_id) => {
        onSelect(chara_id);
        closeModal();
    }
    return (
        <div className="p-6">
            <div>
                <label className="modal_label">対象選択</label>
            </div>
            <div className="flex">
                {unitList
                    .slice() // 元の配列を変更しないようコピーを作成
                    .sort((a, b) => a.placeNo - b.placeNo)
                    .map((unit, index) => {
                        if (!unit.blank) {
                            let src = thumbnail[unit.style.styleInfo.image_url.replace(/\.(webp)$/, '')];
                            return <img className="select_style" src={src} key={`select_target${index}`}
                                alt={unit.style.styleInfo.style_name}
                                onClick={() => setSelectTarget(unit.style.styleInfo.chara_id)}
                            />
                        } else {
                            return <img className="select_style" src={crossIcon} key={`select_target${index}`}
                                alt="" />
                        }

                    }
                    )}
            </div>
        </div>
    )
};

export default ModalTargetSelection;