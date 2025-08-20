import React, { useEffect } from 'react';
import { useStyleList } from "components/StyleListProvider";
import { filteredOrb } from "./logic";
import { getCharaData, getAbilityInfo, getSkillData } from "utils/common";

const BuffBulkSetting = ({ buffGroup, attackInfo, setMultiBuff }) => {
    const { styleList } = useStyleList();
    const [settingBuffList, setSettingBuffList] = React.useState({});
    const [orb, setOrb] = React.useState(false);

    const buffList = [];
    Object.keys(buffGroup).forEach(key => {
        buffGroup[key][0].forEach(buff => {
            buffList.push(buff);
        });
    })
    const filteredBuff = filteredOrb(buffList, orb);

    // 初期化処理
    useEffect(() => {
        const newBuffMap = {};
        styleList.selectStyleList?.forEach(member => {
            if (!member?.styleInfo) return;

            const styleBuffList = filteredBuff.filter(obj =>
                obj.use_chara_id === member.styleInfo.chara_id
            );

            const uniqueBuffList = styleBuffList.filter((buff, index, self) =>
                index === self.findIndex(b => b.skill_id === buff.skill_id)
            );

            uniqueBuffList.forEach(buff => {
                newBuffMap[`${buff.skill_id}-${buff.use_chara_id}`] = 0;
            });
        });
        setSettingBuffList(newBuffMap);
    }, []);

    const handleChangeIndex = (key, index) => {
        setSettingBuffList(prev => ({
            ...prev,
            [key]: index
        }));
    };

    return (
        <div className="container_multi_buff">
            <div className="multi_inner_headline">
                <div className="buff_title">
                    <div className="mx-auto">一括設定</div>
                    <input
                        className="text-center"
                        defaultValue="設定"
                        onClick={() => setMultiBuff(settingBuffList)}
                        id="bulk_buff_setting"
                        type="button"
                    />
                </div>
            </div>
            <div className="text-xs">※複数設定不可のスキルは複数反映されません。</div>
            <div>
                <input id="orb_buff" type="checkbox" checked={orb} onChange={() => setOrb(!orb)} />
                <label className="checkbox01" htmlFor="orb_buff">
                    オーブスキルを表示する
                </label>
            </div>

            {styleList.selectStyleList?.map(member => {
                if (!member?.styleInfo) return null;

                const styleBuffList = filteredBuff.filter(obj =>
                    obj.use_chara_id === member.styleInfo.chara_id
                );

                const uniqueBuffList = styleBuffList.filter((buff, index, self) =>
                    index === self.findIndex(b => b.skill_id === buff.skill_id)
                );

                const charaName = getCharaData(member.styleInfo.chara_id)?.chara_name ?? '不明キャラ';

                return (
                    <div key={member.styleInfo.chara_id}>
                        <span className="chara_name">{charaName}</span>
                        {uniqueBuffList.map(buff => {
                            let skillName = "";
                            let isSecond = true;
                            if (buff.kbn === 'ability') {
                                skillName = getAbilityInfo(buff.skill_id).ability_name;
                                isSecond = false;
                            } else {
                                skillName = getSkillData(buff.skill_id).skill_name;
                                if (buff.kbn === 'passive') {
                                    isSecond = false;
                                }
                            }
                            return (<div key={buff.key}>
                                <div className="buff_container">
                                    <div>{skillName}</div>
                                    <div className="multi-way-choice">
                                        {[0, 1, 2].map(index => (
                                            <React.Fragment key={`${buff.key}_${index}`}>
                                                <input
                                                    className="bulk_buff"
                                                    value={index}
                                                    id={`${buff.key}_${index}`}
                                                    checked={settingBuffList[`${buff.skill_id}-${buff.use_chara_id}`] === index}
                                                    onChange={() => handleChangeIndex(`${buff.skill_id}-${buff.use_chara_id}`, index)}
                                                    name={buff.key}
                                                    type="radio"
                                                />
                                                <label htmlFor={`${buff.key}_${index}`}
                                                    className={((index === 2 && !isSecond) ? "invisible" : "")}
                                                >{index}</label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default BuffBulkSetting;