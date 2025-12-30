import React from 'react';
import { isAloneActivation } from "./logic";
import { BUFF } from "utils/const";
import BuffSelect from "./BuffSelect";
import { getBuffIdToBuff } from "utils/common";

const BuffField = ({ buffKey, index, rowSpan, buffDef, attackInfo,
    buffInnerList, buffSettingMap, handleChangeSkillLv, selectedKey, handleSelectChange, openModal }) => {

    let isAlone = false;
    if (selectedKey[0]) {
        if (selectedKey[0].split('_')[0] !== "buff") {
            isAlone = true;
        } else {
            let buffId = Number(selectedKey[0].split('_')[1]);
            let buffInfo = getBuffIdToBuff(buffId);
            isAlone = isAloneActivation(buffInfo);
        }
    }
    const buffName = buffDef.name;
    const buffKind = buffDef.kind;

    return (
        <>
            <tr>
                {index === 0 && (
                    <td className="kind pc_only" rowSpan={rowSpan}>
                        {buffKind === BUFF.ATTACKUP ? "バフ" : buffKind === BUFF.DEFENSEDOWN ? "デバフ" : "クリティカル"}
                    </td>
                )}
                <td rowSpan={buffDef.overlap ? 2 : 1}>{buffName}</td>
                <BuffSelect
                    attackInfo={attackInfo}
                    buffList={buffInnerList[0] || []}
                    buffKind={buffKind}
                    buffKey={buffKey}
                    buffSettingMap={buffSettingMap[0] || []}
                    handleChangeSkillLv={handleChangeSkillLv}
                    selectedKey={selectedKey}
                    index={0}
                    handleSelectChange={handleSelectChange}
                    openModal={openModal}
                />
            </tr>
            {buffDef.overlap &&
                <tr>
                    {isAlone ?
                        <>
                            <td>
                                <select className="buff" disabled>
                                    <option value={""}>使用不可</option>
                                </select>
                            </td>
                            <td></td>
                            <td></td>
                        </>
                        :
                        <BuffSelect
                            attackInfo={attackInfo}
                            buffList={buffInnerList[1] || []}
                            buffKind={buffKind}
                            buffKey={buffKey}
                            buffSettingMap={buffSettingMap[1] || []}
                            handleChangeSkillLv={handleChangeSkillLv}
                            selectedKey={selectedKey}
                            index={1}
                            handleSelectChange={handleSelectChange}
                            openModal={openModal}
                        />
                    }

                </tr>
            }
        </>
    )
}

export default BuffField;
