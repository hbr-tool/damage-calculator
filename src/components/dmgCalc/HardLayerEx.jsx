import React from "react";
import attribute from 'assets/attribute';

const HardLayerEx = ({ state, dispatch }) => {
    const ELEMENT_LIST = { 1: "fire", 2: "ice", 3: "thunder", 4: "light", 5: "dark" };

    const [bonusElement, setBonusElement] = React.useState([false, false, false, false, false, false]);

    const handleBonusElementChange = (index) => {
        setBonusElement(prev => {
            const newBonusElement = [...prev];
            newBonusElement[index] = !newBonusElement[index];
            dispatch({ type: "SET_BONUS_ELEMENT", value: newBonusElement });
            return newBonusElement;
        });
    };
    return (
        <div className="hard_layer adjust_width">
            <div className="ml-1 mt-2">
                <div>ボーナス(設定すると自動的にステータスに加算されます)</div>
                <div className="ml-5 flex flex-wrap">
                    {Object.keys(ELEMENT_LIST).map(key => {
                        key = Number(key);
                        let opacity = bonusElement[key] ? "" : "translucent";
                        let className = `w-10 h-10 ${opacity}`
                        return (<input className={className} src={attribute[ELEMENT_LIST[key]]} type="image"
                            key={`element_${key}`}
                            alt={ELEMENT_LIST[key]}
                            onClick={() => {
                                handleBonusElementChange(key);
                            }}
                        />)
                    })}
                </div>
            </div>
        </div>
    )
};

export default HardLayerEx;