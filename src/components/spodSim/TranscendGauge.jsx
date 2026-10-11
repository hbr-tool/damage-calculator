import React from "react";
import attribute from 'assets/attribute';

const TranscendGauge = ({ turn }) => {
    const { transcendGauge, transcendElement } = turn;
    const ELEMENT_LIST = { 0: "none", 1: "fire", 2: "ice", 3: "thunder", 4: "light", 5: "dark" };

    let src = attribute[ELEMENT_LIST[transcendElement]];
    return (transcendElement !== 0 &&
        <div className="flex items-center mr-1">
            <label className="flex items-center">
                <img
                    className="w-6 h-6"
                    src={src}
                    alt={ELEMENT_LIST[transcendElement]}
                />
                <span className="font-bold text-sm">
                    {`超越${transcendGauge}%`}
                </span>
            </label>
        </div>
    );
}

export default TranscendGauge;