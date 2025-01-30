


const EffectSelectionComponent = () => {

    const [effectType, setEffectType] = React.useState([0]);

    function showModalSelectEffect(effect_type) {
        return new Promise((resolve) => {
            setEffectType(effect_type);
            MicroModal.show('modal_effect_selection', {
                onClose: (modal) => {
                    resolve($(modal).data('value'));
                    $(modal).removeData('value');
                }
            });
        });
    }

    window.handleEffectSelection = async function (unit, skill_id, buff_list) {
        let effect_type = 0;
        let skill_info = getSkillData(skill_id);
        const conditionsList = buff_list.map(buff => buff.conditions).filter(condition => condition !== null);

        if (conditionsList.includes(CONDITIONS_DESTRUCTION_OVER_200)) {
            effect_type = 2;
        }
        if (conditionsList.includes(CONDITIONS_BREAK)) {
            effect_type = 3;
        }
        if (conditionsList.includes(CONDITIONS_PERCENTAGE_30)) {
            effect_type = 4;
        }
        if (conditionsList.includes(CONDITIONS_HAS_SHADOW) || skill_info.attribute_conditions == CONDITIONS_HAS_SHADOW) {
            effect_type = 5;
        }
        if (conditionsList.includes(CONDITIONS_DOWN_TURN) || skill_info.attribute_conditions == CONDITIONS_DOWN_TURN) {
            effect_type = 6;
        }
        if (conditionsList.includes(CONDITIONS_BUFF_DISPEL) || skill_info.attribute_conditions == CONDITIONS_BUFF_DISPEL) {
            effect_type = 7;
        }

        switch (skill_id) {
            case 50: // トリック・カノン
                effect_type = 1;
                break;
            default:
                break;
        }

        if (effect_type != 0) {
            const effect_select_type = await showModalSelectEffect(effect_type);
            if (!effect_select_type && effect_select_type !== 0) {
                unit.buff_effect_select_type = 0;
                return false;
            }
            unit.buff_effect_select_type = effect_select_type;
        } else {
            unit.buff_effect_select_type = null;
        }
        return true;
    }

    const setSelectEffect = (chara_id) => {
        $('#modal_effect_selection').data('value', chara_id);
        MicroModal.close('modal_effect_selection');
    }

    let value = [];
    switch (effectType) {
        case 1:
            value = ["攻撃力低下(50%)", "防御力低下(50%)"];
            break;
        case 2:
            value = ["破壊率200%未満", "破壊率200%以上"];
            break;
        case 3:
            value = ["BREAKなし", "BREAKあり"];
            break;
        case 4:
            value = ["SP回復なし", "SP回復(30%)"];
            break;
        case 5:
            value = ["影分身なし", "影分身あり"];
            break;
        case 6:
            value = ["ダウンターンなし", "ダウンターンあり"];
            break;
        case 7:
            value = ["バフ解除なし", "バフ解除あり"];
            break;
    }
    return (
        <>
            <div className="mb-4">
                <label className="modal_label">効果選択</label>
            </div>
            <div className="select_effect">
                <input
                    className="effect_button"
                    data-value="0"
                    defaultValue={value[0]}
                    onClick={() => setSelectEffect(0)}
                    type="button"
                />
                <input
                    className="effect_button"
                    data-value="1"
                    defaultValue={value[1]}
                    onClick={() => setSelectEffect(1)}
                    type="button"
                />
            </div>
        </>
    )
};
$(function () {
    const rootElement = document.getElementById('effect_selection');
    ReactDOM.createRoot(rootElement).render(<EffectSelectionComponent />);
});