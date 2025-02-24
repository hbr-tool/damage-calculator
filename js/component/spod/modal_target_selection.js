


const TargetSelectionComponent = () => {

    const [unitList, setUnitList] = React.useState([]);

    function showModalSelectTarget(turn) {
        return new Promise((resolve) => {
            setUnitList(turn.unit_list);
            MicroModal.show('modal_target_selection', {
                onClose: (modal) => {
                    resolve($(modal).data('value'));
                    $(modal).removeData('value');
                }
            });
        });
    }

    window.handleTargetSelection = async function (unit, turn, buff_list) {
        const SELECT_RANGE = [RANGE_ALLY_UNIT, RANGE_SELF_AND_UNIT, RANGE_OTHER_UNIT];
        if (buff_list.some(buff => SELECT_RANGE.includes(buff.range_area))) {
            const chara_id = await showModalSelectTarget(turn);
            if (!chara_id && chara_id !== 0) {
                unit.buff_target_chara_id = 0;
                return false;
            }
            unit.buff_target_chara_id = chara_id;
        } else {
            unit.buff_target_chara_id = null;
        }
        return true;
    }

    const setSelectTarget = (chara_id) => {
        $('#modal_target_selection').data('value', chara_id);
        MicroModal.close('modal_target_selection');
    }
    return (
        <>
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
        </>
    )
};
$(function () {
    const rootElement = document.getElementById('target_selection');
    ReactDOM.createRoot(rootElement).render(<TargetSelectionComponent />);
});