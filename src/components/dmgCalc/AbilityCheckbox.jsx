import React from 'react';
import * as constants from 'utils/const';
import * as common from 'utils/common';

const AbilityCheckbox = ({ attackInfo, abilityList, abilitySettingMap, handleAbilityChange, rengeArea }) => {
    if (!attackInfo) return null;
    const kindAbilityList = abilityList.filter(ability => {
        if (common.getAbilityEffectList(ability.ability_id).some(effect => constants.RANGE_ALL_ABILITY.includes(effect.effect_type))) {
            return rengeArea === 3;
        }
        switch (ability.range_area) {
            case constants.RANGE.SELF:
                if (rengeArea !== 0) {
                    return false;
                }
                break;
            case constants.RANGE.ALLY_FRONT:
            case constants.RANGE.ALLY_BACK:
            case constants.RANGE.ALLY_ALL:
            case constants.RANGE.ENEMY_ALL:
            case constants.RANGE.OTHER:
                switch (ability.activation_place) {
                    case 1: // 前衛
                        if (rengeArea !== 1) {
                            return false;
                        }
                        break;
                    case 2: // 後衛
                        if (rengeArea !== 2) {
                            return false;
                        }
                        break;
                    case 3: // 全体
                    case 0: // その他
                        if (rengeArea !== 3) {
                            return false;
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        return true;
    });

    return (
        <>
            {kindAbilityList.map(ability => {
                const key = `${ability.ability_id}-${ability.chara_id}`
                if (abilitySettingMap[key] === undefined) {
                    return null;
                }
                const checked = abilitySettingMap[key].checked;
                const disabled = abilitySettingMap[key].disabled;
                const name = abilitySettingMap[key].name;
                return (
                    <div key={key}>
                        <input type="checkbox" className="ability" id={key} disabled={disabled} checked={checked}
                            onChange={e => handleAbilityChange(e, key)}
                        />
                        <label htmlFor={key}
                            className="checkbox01">
                            {`${name}: ${ability.ability_name} (${ability.ability_short_explan})`}
                        </label>
                    </div>
                )
            }
            )}
        </>
    );
};

export default AbilityCheckbox;