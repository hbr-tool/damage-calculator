import React from 'react';
import { getAbilityInfo, getPassiveInfo } from 'utils/common';

const ConstraintsList = ({ constraintsAbility, constraintsPassive }) => {

    return (constraintsAbility.length + constraintsPassive.length === 0 ?
        null
        :
        <div className="surround_area mx-auto mt-2 adjust_width" id="detail_setting">
            <label className="area_title">制約事項</label>
            <ul className="text-sm ml-2">
                {constraintsAbility.length > 0 && (
                    <>
                        <label>以下のアビリティは現在発動しません。</label>
                        {constraintsAbility.map((abilityId, index) => {
                            let abilityInfo = getAbilityInfo(abilityId);
                            return (<li key={index}>{`・${abilityInfo.ability_name} ${abilityInfo.ability_explan}`}</li>)
                        })
                        }
                    </>
                )}
                {constraintsPassive.length > 0 && (
                    <>
                        <label>以下のパッシブは現在発動しません。</label>
                        {constraintsPassive.map((skill_id, index) => {
                            let passiveInfo = getPassiveInfo(skill_id);
                            return (<li key={index}>{`・${passiveInfo.passive_name} ${passiveInfo.passive_explan}`}</li>)
                        })}
                    </>
                )}
            </ul>
        </div>
    )
};

export default ConstraintsList;