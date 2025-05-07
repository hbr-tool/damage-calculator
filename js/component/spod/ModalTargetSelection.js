


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
            <div className="troops">
                {unitList
                    .slice() // 元の配列を変更しないようコピーを作成
                    .sort((a, b) => a.place_no - b.place_no)
                    .map((unit, index) => {
                        let src = "img/cross.png";
                        let value = "";
                        if (!unit.blank) {
                            src = "icon/" + unit.style.style_info.image_url;
                            value = unit.style.style_info.style_id
                        }
                        return <img className="select_style" src={src} data_value={value} key={`select_target${index}`}
                            onClick={() => !unit.blank ? setSelectTarget(unit.style.style_info.chara_id) : undefined}
                        />
                    }
                    )}
            </div>
        </div>
    )
};