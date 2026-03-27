import React from 'react';
import * as common from "utils/common";

const Resonance = ({ resonanceList }) => {
    return (
        <>
            {resonanceList.map((resonance, index) => {
                const name = resonance.charaName;
                const limitCount = resonance.limitCount;
                const resonanceEffectList = common.getResonanceEffectList(resonance.resonance_id);
                let effectText = resonance.resonance_text;
                for (const resonanceEffect of resonanceEffectList) {
                    const placeholder = `{${resonanceEffect.item_no}}`;
                    effectText = effectText.replaceAll(placeholder, resonanceEffect[`effect_limit_${limitCount}`]);
                }
                return (
                    <div key={index}>
                        <label >
                            {`${name}: ${resonance.resonance_name} (${effectText})`}
                        </label>
                    </div>
                )
            }
            )}
        </>
    );
};

export default Resonance;