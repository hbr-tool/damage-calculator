import React from "react";

const ModalEffectSelection = ({ closeModal, onSelect, effectType }) => {

    const setSelectEffect = (effect) => {
        onSelect(effect);
        closeModal();
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
        case 8:
            value = ["DP100%未満", "DP100%以上"];
            break;
        case 9:
            value = ["超ダウンなし", "超ダウンあり"];
            break;
        case 10:
            value = ["絶不調", "不調", "普通", "好調", "絶好調"];
            break;
        case 11:
            value = ["トークン0", "トークン1", "トークン2", "トークン3", "トークン4", "トークン5", "トークン6", "トークン7", "トークン8", "トークン9", "トークン10"];
            break;
        default:
            break;
    }
    return (
        <div className="p-6">
            <div className="mb-4">
                <label className="modal_label">効果選択</label>
            </div>
            <div className="select_effect">
                {value.map((val, index) => (
                    <input
                        className="effect_button"
                        data-value="0"
                        defaultValue={val}
                        onClick={() => setSelectEffect(index)}
                        type="button"
                    />
                ))}
            </div>
        </div>
    )
};
export default ModalEffectSelection;