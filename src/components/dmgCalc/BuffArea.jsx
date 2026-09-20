import React, { useState, useRef, useEffect } from "react";
import ReactModal from "react-modal";
import { useStyleList } from "components/StyleListProvider";
import {
    BUFF, EFFECT, RANGE
} from "utils/const";
import * as common from "utils/common";
import * as logic from "./logic";
import * as buffLogic from "./buffLogic.js";
import BuffField from "./BuffField";
import AbilityCheckbox from "./AbilityCheckbox";
import PassiveCheckbox from "./PassiveCheckbox";
import Resonance from "./Resonance";
import BuffBulkSetting from "./BuffBulkSetting";
import BuffDetail from "./BuffDetail";

const BuffArea = ({ argument, attackCharaId, buffGroup, abilityList, passiveList, resonanceList, isWeak, selectList }) => {
    const {
        attackInfo, state, dispatch,
        selectBuffKeyMap, setSelectBuffKeyMap,
        buffSettingMap, setBuffSettingMap,
        abilitySettingMap, setAbilitySettingMap,
        passiveSettingMap, setPassiveSettingMap,
        attackUpBuffs, defDownBuffs, criticalBuffs
    } = argument;

    const { styleList } = useStyleList();
    const [checkUpdate, setCheckUpdate] = useState(true);

    let buffKeyList = {};
    attackUpBuffs.forEach(buff => {
        buffKeyList[logic.getBuffKey(buff.effect, buff.kind)] = [];
    });
    defDownBuffs.forEach(buff => {
        buffKeyList[logic.getBuffKey(buff.effect, buff.kind)] = [];
    });
    criticalBuffs.forEach(buff => {
        buffKeyList[logic.getBuffKey(buff.effect, buff.kind)] = [];
    });

    const refBuffSettingMap = useRef(buffSettingMap);

    // バフ初期化
    useEffect(() => {
        const initialMap = {};
        Object.keys(buffGroup).forEach(key => {
            const initialList = [];
            buffGroup[key].forEach(buffList => {
                const innerMap = {};
                buffList.forEach(buff => {
                    innerMap[buff.key] = {
                        effect_id: buff.effect_id,
                        skill_lv: buff.max_lv,
                        buffInfo: buff,
                        troopKbn: buff.troopKbn,
                    };
                });
                initialList.push(innerMap);
            });
            initialMap[key] = initialList;
        });
        refBuffSettingMap.current = initialMap;
        setBuffSettingMap(initialMap);
    }, [buffGroup, setBuffSettingMap]);

    // アビリティ初期化
    useEffect(() => {
        const initialMap = {};
        abilityList.forEach(ability => {
            const key = `${ability.ability_id}-${ability.chara_id}`
            let checked = true;
            const abilityEffectList = common.getAbilityEffectList(ability.ability_id);
            let disabled = abilityEffectList.some(effect => !effect.conditions);
            let limitBorder = ability.limit_border;
            let memberInfo = logic.getCharaIdToMember(styleList, ability.chara_id);
            let limitCount = memberInfo.limitCount;
            switch (abilityEffectList[0].range_area) {
                case RANGE.SELF:	// 自分
                    disabled = limitCount < limitBorder || (ability.chara_id === attackCharaId && disabled);
                    checked = limitCount >= limitBorder && ability.chara_id === attackCharaId;
                    break
                case RANGE.ALLY_FRONT:	// 味方前衛
                case RANGE.ALLY_BACK:	// 味方後衛
                    // 前衛または後衛かつ、本人以外
                    if (((ability.activation_place === 1 || ability.activation_place === 2) && !ability.chara_id !== attackCharaId) || !disabled) {
                        disabled = false;
                    } else {
                        disabled = true;
                    }
                    checked = limitCount >= limitBorder && ability.chara_id === attackCharaId;
                    break
                case RANGE.ALLY_ALL:	// 味方全体
                case RANGE.ENEMY_ALL:	// 敵全体
                case RANGE.OTHER:	    // その他
                    // 前衛または後衛かつ、本人以外
                    if (((ability.activation_place === 1 || ability.activation_place === 2) && ability.chara_id !== attackCharaId) || !disabled) {
                        disabled = false;
                    } else {
                        disabled = true;
                    }
                    if (limitCount < limitBorder) {
                        disabled = true;
                        checked = false;
                    }
                    break;
                default:
                    break;
            }
            initialMap[key] = {
                key: key,
                ability_id: ability.ability_id,
                chara_id: ability.chara_id,
                checked: checked,
                disabled: disabled,
                name: ability.chara_name,
            }
        });
        // refAbilitySettingMap.current = initialMap;
        setAbilitySettingMap(initialMap);
    }, [styleList, abilityList, attackCharaId, setAbilitySettingMap]);

    // パッシブ初期化
    useEffect(() => {
        const initialMap = {};
        passiveList.forEach(passive => {
            const key = passive.key;
            initialMap[key] = {
                key: passive.key,
                skill_id: passive.skill_id,
                chara_id: passive.chara_id,
                name: passive.chara_name,
                troopKbn: passive.troopKbn,
                checked: true,
            }
        });
        setPassiveSettingMap(initialMap);
    }, [passiveList, setPassiveSettingMap]);

    // バフ効果量更新
    useEffect(() => {
        const updateMap = { ...refBuffSettingMap.current };
        Object.keys(updateMap).forEach(buffKind => {
            updateMap[buffKind].forEach((buffInnerList, index) => {
                Object.keys(buffInnerList).forEach(buffKey => {
                    let buffSetting = buffInnerList[buffKey];
                    if (!buffSetting) return;
                    let buff = buffSetting.buffInfo;
                    const memberInfo = logic.getCharaIdToMember(styleList, buff.use_chara_id);
                    buffSetting.calcEffectSize = logic.getEffectSize(argument, buff, buffSetting, memberInfo);
                })
            });
        });

        setBuffSettingMap(updateMap);
        refBuffSettingMap.current = updateMap;
    }, [styleList, state.enemyInfo, state.hard.tearsOfDreams, abilitySettingMap, passiveSettingMap, passiveList, resonanceList]);

    // スキルレベル変更
    const handleChangeSkillLv = (buffKindKey, buffKey, lv, index) => {
        const updateMap = { ...buffSettingMap };
        updateMap[buffKindKey].forEach(buffInnerList => {
            if (Object.keys(buffInnerList).length > 0) {
                let settingBuff = buffInnerList[buffKey];
                settingBuff.skill_lv = lv
                let buff = buffGroup[buffKindKey][index].filter(buff => buff.key === buffKey)[0];
                const memberInfo = logic.getCharaIdToMember(styleList, buff.use_chara_id);
                settingBuff.calcEffectSize = logic.getEffectSize(argument, buff, settingBuff, memberInfo);
            }
        })
        setBuffSettingMap(updateMap);
    };

    const handleSelectChange = (buffKey, newSelect) => {
        setSelectBuffKeyMap(prev => ({ ...prev, [buffKey]: newSelect }));
    };

    const handleAbilityChange = (e, key) => {
        const newAbilitySettingMap = { ...abilitySettingMap };
        newAbilitySettingMap[key].checked = e.target.checked;
        setAbilitySettingMap(newAbilitySettingMap);
    };

    const handlePassiveChange = (e, key) => {
        const newPassiveSettingMap = { ...passiveSettingMap };
        newPassiveSettingMap[key].checked = e.target.checked;
        setPassiveSettingMap(newPassiveSettingMap);
    };

    // 全て外す
    const selectNoneBuff = () => {
        Object.keys(selectBuffKeyMap).forEach((buffKey) => {
            handleSelectChange(buffKey, []);
        })
    }

    // 上から2番目のbuffを子にセット
    const selectBestBuff = (selectbuffKeyList) => {
        Object.keys(selectbuffKeyList).forEach((buffKey) => {
            let kindBuffList = buffGroup[buffKey] ? buffGroup[buffKey][0] : [];
            kindBuffList = logic.filteredOrb(kindBuffList, false);

            const buffItemList = [
                ...kindBuffList.filter(buffInfo =>
                    !logic.isOnlyUse(attackInfo, buffInfo)
                ),
                ...kindBuffList.filter(buffInfo =>
                    !(logic.isAloneActivation(buffInfo) || logic.isOnlyBuff(attackInfo, buffInfo) || logic.isOnlyUse(attackInfo, buffInfo))
                ),
            ];
            const overlap = buffLogic.isOverlap(attackUpBuffs, defDownBuffs, criticalBuffs, buffKey);
            handleSelectChange(buffKey, logic.getBestBuffKeys(buffKey, buffItemList, refBuffSettingMap.current, overlap));
        })
    }

    // 存在しないバフの設定を外す
    const outNotExistBuff = () => {
        Object.keys(selectBuffKeyMap).forEach((buffKey) => {
            const selectedKeys = selectBuffKeyMap[buffKey].map(selectedKey => {
                if (refBuffSettingMap.current?.[buffKey]?.[0]?.[selectedKey]) {
                    return selectedKey;
                } else {
                    return "";
                }
            })
            handleSelectChange(buffKey, selectedKeys);
        })
    }

    // 選択内から最良を設定
    const setBestBuff = (buffKey, buffItemList) => {
        const overlap = buffLogic.isOverlap(attackUpBuffs, defDownBuffs, criticalBuffs, buffKey);
        const bestKeys = logic.getBestBuffKeys(buffKey, buffItemList, buffSettingMap, overlap);
        handleSelectChange(buffKey, bestKeys);
    }

    // バフ一括設定
    const setMultiBuff = (settingBuffList) => {
        Object.keys(buffKeyList).forEach(buffKey => {
            const [effectType, buffNo] = buffKey.split('-').map(Number);
            const buffItemList = Object.entries(settingBuffList).flatMap(([key, count]) => {
                if (count === 0) return [];
                const buffList = [];
                Object.keys(buffGroup).forEach(key => {
                    buffGroup[key][0].forEach(buff => {
                        buffList.push(buff);
                    });
                })
                const [skillId, charaId] = key.split('-').map(Number);
                const matchedBuffs = buffList.filter(buffInfo =>
                    buffInfo.effect_type === effectType &&
                    (buffInfo.effect_no ?? 0) === buffNo &&
                    buffInfo.skill_id === skillId &&
                    buffInfo.use_chara_id === charaId
                );
                // countが1なら1回、2なら2回追加（同じ要素を重複追加）
                return Array(count).fill(matchedBuffs).flat();
            });
            setBestBuff(buffKey, buffItemList)
        });
        closeModal();
    };

    let resistDownEffectSize = logic.getSumEffectSize(argument, EFFECT.GRANT_DEBUFF, EFFECT.RESISTDOWN);
    useEffect(() => {
        if (attackInfo) {
            dispatch({ type: "SET_RRGIST_DOWN", element: attackInfo.attack_element, value: resistDownEffectSize });
        }
    }, [state.enemyInfo, attackInfo?.attack_id, resistDownEffectSize]);

    useEffect(() => {
        const BUFF_KEY_LIST = [
            logic.getBuffKey(EFFECT.GRANT_BUFF, BUFF.MINDEYE),
            logic.getBuffKey(EFFECT.GRANT_DEBUFF, BUFF.FRAGILE),
            logic.getBuffKey(EFFECT.GRANT_DEBUFF, BUFF.ETERNAL_FRAGILE),
        ]

        if (attackInfo) {
            if (isWeak) {
                if (checkUpdate) {
                    let resistKey = {};
                    BUFF_KEY_LIST.forEach(buffKey => {
                        resistKey[buffKey] = [];
                    })
                    selectBestBuff(resistKey);
                } else {
                    BUFF_KEY_LIST.forEach(buffKey => {
                        handleSelectChange(buffKey, []);
                    })

                }
            }
        }
    }, [isWeak]);

    useEffect(() => {
        if (checkUpdate) {
            setSelectBuffKeyMap(buffKeyList);
            if (attackInfo) {
                selectBestBuff(buffKeyList);
            }
        } else {
            outNotExistBuff();
        }
    }, [selectList, attackInfo?.attack_id, state.enemyInfo.enemy_name]);

    useEffect(() => {
        // 山脇様のしもべ変更
        const funnelBuffKey = logic.getBuffKey(EFFECT.GRANT_BUFF, BUFF.FUNNEL);
        const funnel = buffGroup[funnelBuffKey];
        if (checkUpdate && funnel) {
            setBestBuff(funnelBuffKey, funnel[0]);
        }
    }, [attackInfo?.servantCount]);

    const [modal, setModal] = React.useState({
        isOpen: false,
        mode: "",
        buffInfo: {},
        index: 0,
    });
    const openModal = (mode, buffInfo, index) =>
        setModal({ isOpen: true, mode: mode, buffInfo: buffInfo, index: index });
    const closeModal = () => setModal({ isOpen: false, mode: "" });

    return (
        <div className="buff_area text-right mx-auto">
            <div className="flex justify-between items-center w-full">
                <div className="ml-6">
                    <input
                        className="buff_btn"
                        defaultValue="全て外す"
                        type="button"
                        onClick={selectNoneBuff}
                    />
                    <input
                        className="buff_btn"
                        defaultValue="一括設定"
                        onClick={() => openModal("bulkSetting")}
                        type="button"
                    />
                </div>
                <div className="flex items-center">
                    <input id="auto_skill" type="checkbox" checked={checkUpdate} onChange={(e) => setCheckUpdate(e.target.checked)} />
                    <label className="checkbox01 ml-2" htmlFor="auto_skill">
                        スタイル/攻撃スキル/敵選択時に最適スキルを自動選択する
                    </label>
                </div>
            </div>
            <div className="text-center">
                <table className="buff_table">
                    <colgroup>
                        <col className="title_column pc_only" />
                        <col className="type_column" />
                        <col className="skill_name_column" />
                        <col className="reinforce_column" />
                        <col className="skill_lv_column" />
                    </colgroup>
                    <tbody>
                        <tr className="sp_only">
                            <td className="kind" colSpan="4">
                                バフ
                            </td>
                        </tr>
                        {attackUpBuffs.map((buffDef, index) => {
                            const buffKey = `${logic.getBuffKey(buffDef.effect, buffDef.kind)}`
                            const totalRowCount = attackUpBuffs.reduce((sum, buff) => {
                                return sum + (buff.overlap ? 2 : 1);
                            }, 0);
                            return (
                                <BuffField key={buffKey}
                                    index={index}
                                    buffDef={buffDef}
                                    rowSpan={totalRowCount}
                                    buffKey={buffKey}
                                    attackInfo={attackInfo}
                                    buffInnerList={buffGroup[buffKey] || []}
                                    buffSettingMap={buffSettingMap[buffKey] || []}
                                    handleChangeSkillLv={handleChangeSkillLv}
                                    selectedKey={selectBuffKeyMap[buffKey] || []}
                                    handleSelectChange={handleSelectChange}
                                    openModal={openModal}
                                />
                            )
                        })}
                        <tr className="sp_only">
                            <td className="kind" colSpan="4">
                                デバフ
                            </td>
                        </tr>
                        {defDownBuffs.map((buffDef, index) => {
                            const buffKey = `${logic.getBuffKey(buffDef.effect, buffDef.kind)}`
                            const totalRowCount = defDownBuffs.reduce((sum, buff) => {
                                return sum + (buff.overlap ? 2 : 1);
                            }, 0);
                            return (
                                <BuffField key={buffKey}
                                    index={index}
                                    rowSpan={totalRowCount}
                                    buffDef={buffDef}
                                    buffKey={buffKey}
                                    attackInfo={attackInfo}
                                    buffInnerList={buffGroup[buffKey] || []}
                                    buffSettingMap={buffSettingMap[buffKey] || []}
                                    handleChangeSkillLv={handleChangeSkillLv}
                                    selectedKey={selectBuffKeyMap[buffKey] || []}
                                    handleSelectChange={handleSelectChange}
                                    openModal={openModal}
                                />
                            )
                        })}
                        <tr className="sp_only">
                            <td className="kind" colSpan="4">
                                CRT
                            </td>
                        </tr>
                        {criticalBuffs.map((buffDef, index) => {
                            const buffKey = `${logic.getBuffKey(buffDef.effect, buffDef.kind)}`
                            return (
                                <BuffField key={buffKey}
                                    index={index}
                                    rowSpan={criticalBuffs.length * 2}
                                    buffDef={buffDef}
                                    buffKey={buffKey}
                                    attackInfo={attackInfo}
                                    buffInnerList={buffGroup[buffKey] || []}
                                    buffSettingMap={buffSettingMap[buffKey] || []}
                                    handleChangeSkillLv={handleChangeSkillLv}
                                    selectedKey={selectBuffKeyMap[buffKey] || []}
                                    handleSelectChange={handleSelectChange}
                                    openModal={openModal}
                                />
                            )
                        })}
                        <tr className="sp_only">
                            <td className="kind" colSpan="5">
                                アビリティ
                            </td>
                        </tr>
                        <tr>
                            <td className="kind pc_only" rowSpan="4">
                                アビリティ
                            </td>
                            <td>攻撃者</td>
                            <td className="text-left" colSpan="3">
                                <AbilityCheckbox attackInfo={attackInfo} abilityList={abilityList} rengeArea={0}
                                    abilitySettingMap={abilitySettingMap} handleAbilityChange={handleAbilityChange} />
                            </td>
                        </tr>
                        <tr>
                            <td>前衛</td>
                            <td className="text-left" colSpan="3">
                                <AbilityCheckbox attackInfo={attackInfo} abilityList={abilityList} rengeArea={1}
                                    abilitySettingMap={abilitySettingMap} handleAbilityChange={handleAbilityChange} />
                            </td>
                        </tr>
                        <tr>
                            <td>後衛</td>
                            <td className="text-left" colSpan="3">
                                <AbilityCheckbox attackInfo={attackInfo} abilityList={abilityList} rengeArea={2}
                                    abilitySettingMap={abilitySettingMap} handleAbilityChange={handleAbilityChange} />
                            </td>
                        </tr>
                        <tr>
                            <td>全体</td>
                            <td className="text-left" colSpan="3">
                                <AbilityCheckbox attackInfo={attackInfo} abilityList={abilityList} rengeArea={3}
                                    abilitySettingMap={abilitySettingMap} handleAbilityChange={handleAbilityChange} />
                            </td>
                        </tr>
                        <tr className="sp_only">
                            <td className="kind" colSpan="5">
                                パッシブ
                            </td>
                        </tr>
                        <tr>
                            <td className="kind pc_only">パッシブ</td>
                            <td className="text-left" colSpan="4">
                                <PassiveCheckbox passiveList={passiveList}
                                    passiveSettingMap={passiveSettingMap} handlePassiveChange={handlePassiveChange} />
                            </td>
                        </tr>
                        <tr className="sp_only">
                            <td className="kind" colSpan="5">
                                共鳴アビリティ
                            </td>
                        </tr>
                        <tr>
                            <td className="kind pc_only">共鳴</td>
                            <td className="text-left" colSpan="4">
                                <Resonance resonanceList={resonanceList} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="mt-1 mx-auto text-left">
                <div className="font-bold">＜＜注意事項＞＞</div>
                <ul>
                    <li>・バフ強化/デバフ強化/桜花の矢によるデバフ強化は、「詳細」ボタンで設定してください。</li>
                    <li>・一括設定は全てのスキルに適用されます。</li>
                    <li>・異時層EXのダメージ減衰は現在未対応です。</li>
                    <li>・スコアタEX選択時のみ専用のオーバードライブゲージ補正が適用されます。</li>
                    <li className="text-base font-bold text-red-500 underline">
                        <a href="https://hbr-tool.github.io/old-damage-calculator/">旧ダメージ計算ツール</a>
                    </li>
                </ul>
                <div className="mx-auto text-right">
                    <a
                        className="text-blue-500 underline"
                        href="https://marshmallow-qa.com/ldboixq5xyndo94">
                        不具合/要望受付フォーム
                    </a>
                </div>
            </div>
            <ReactModal
                isOpen={modal.isOpen}
                onRequestClose={closeModal}
                className={"modal-content " + (modal.isOpen ? "modal-content-open" : "")}
                overlayClassName={"modal-overlay " + (modal.isOpen ? "modal-overlay-open" : "")}
            >
                {
                    modal.mode === "bulkSetting" && <BuffBulkSetting buffGroup={buffGroup} attackInfo={attackInfo} setMultiBuff={setMultiBuff} />
                }
                {
                    modal.mode === "buffDetail" &&
                    (
                        <BuffDetail argument={argument} buffInfo={modal.buffInfo} index={modal.index} closeModal={closeModal} />
                    )
                }
            </ReactModal>
        </div >
    )
};

export default BuffArea;
