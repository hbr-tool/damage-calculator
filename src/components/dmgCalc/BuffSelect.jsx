import React, { useState } from 'react';
import { isOnlyBuff, isOnlyUse, isAloneActivation, isSelectBuff } from "./logic";
import { getBuffIdToBuff, getSkillData } from "utils/common";
import ConfirmModal from 'components/ConfirmModal';

const BuffSelect = ({ attackInfo, buffList, buffKey, buffSettingMap, handleChangeSkillLv, selectedKey, index, handleSelectChange, openModal }) => {
    const [modalData, setModalData] = useState(null);
    if (Object.keys(buffSettingMap).length > 0) {
        buffList.sort((a, b) => buffSettingMap[b.key]?.effect_size - buffSettingMap[a.key]?.effect_size);
    }

    const confirmSet = (message, onConfirm) => {
        setModalData({
            title: "確認",
            message,
            onConfirm: () => {
                onConfirm();
                setModalData(null);
            },
            onCancel: () => setModalData(null),
        });
    };

    const onChangeBuff = (value) => {
        const newSelected = [...selectedKey];
        newSelected[index] = value;

        if (value) {
            const type = Number(value.split('_')[0]);
            if (type === "buff") {
                const buffId = Number(value.split('_')[1]);
                let buffInfo = getBuffIdToBuff(buffId);
                if (isOnlyBuff(attackInfo, buffInfo) && newSelected[index ^ 1] === value) {
                    confirmSet(`${buffInfo.buff_name}は\r\n通常、複数付与出来ません。\r\n設定してよろしいですか？`, () => {
                        handleSelectChange(buffKey, newSelected);
                    });
                    return;
                }
                if (isSelectBuff(buffInfo)) {
                    const partnerBuffId = Number(newSelected[index ^ 1]?.split('_')[1]);
                    if (partnerBuffId) {
                        let partnerBuffInfo = getBuffIdToBuff(partnerBuffId);
                        if (buffInfo.skill_id === partnerBuffInfo.skill_id) {
                            let skillInfo = getSkillData(buffInfo.skill_id);
                            confirmSet(`${skillInfo.skill_name}は\r\n通常、複数付与出来ません。\r\n設定してよろしいですか？`, () => {
                                handleSelectChange(buffKey, newSelected);
                            });
                            return;
                        }
                    }
                }
                if (isAloneActivation(buffInfo)) {
                    handleSelectChange(buffKey, [value, ""]);
                    return;
                }
                if (isOnlyUse(attackInfo, buffInfo)) {
                    confirmSet(`${buffInfo.buff_name}は\r\n通常、他スキルに設定出来ません。\r\n設定してよろしいですか？`, () => {
                        handleSelectChange(buffKey, newSelected);
                    });
                    return;
                }
            }
        }

        handleSelectChange(buffKey, newSelected);
    }
    const value = selectedKey.length > index ? selectedKey[index] : "";
    const selectBuff = buffList.find(buff => buff.key === value);

    return (
        <>
            <td>
                <select className="buff" value={value} onChange={(e) => onChangeBuff(e.target.value)}>
                    <option value="">無し</option>
                    {buffList.map((buff, index) => {
                        let effect_text = `${buff.chara_name}: ${buff.buff_name} ${Math.floor(buffSettingMap[buff.key]?.effect_size * 100) / 100}%`;
                        return <option key={buff.key}
                            value={buff.key}
                        >{effect_text}</option>
                    })}
                </select>
            </td>
            <td>
                {value &&
                    <input className="strengthen" type="button" value={"詳細"} onClick={() => openModal("buffDetail", selectBuff, index)} />
                }
            </td>
            <td>
                {selectBuff ?
                    <div className="lv">
                        <select className="lv_effect" disabled={selectBuff.max_lv === 1} value={buffSettingMap[selectedKey[index]]?.skill_lv}
                            onChange={(e) => handleChangeSkillLv(buffKey, selectedKey[index], Number(e.target.value), index)}>
                            {Array.from({ length: selectBuff.max_lv }, (_, index) => selectBuff.max_lv - index).map(
                                (lv, index) => <option key={index} value={lv}>{lv}</option>
                            )}
                        </select>
                    </div>
                    : null
                }
            </td>
            <ConfirmModal
                isOpen={!!modalData}
                title={modalData?.title}
                message={modalData?.message}
                onConfirm={modalData?.onConfirm}
                onCancel={modalData?.onCancel}
            />
        </>
    )
};

export default BuffSelect;