import React from 'react';

const Resonance = ({ resonanceList}) => {
    return (
        <>
            {resonanceList.map((resonance, index) => {
                const name = resonance.charaName;
                const limitCount = resonance.limitCount;
                const text = resonance.resonance_text;
                const effectSize = resonance[`effect_limit_${limitCount}`];
                return (
                    <div key={index}>
                        <label >
                            {`${name}: ${resonance.resonance_name} (${text.replaceAll("{0}", effectSize)})`}
                        </label>
                    </div>
                )
            }
            )}
        </>
    );
};

export default Resonance;