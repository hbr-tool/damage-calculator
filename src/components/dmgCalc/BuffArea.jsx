import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactModal from "react-modal";
import { useStyleList } from "components/StyleListProvider";
import {
    BUFF, EFFECT, RANGE, ROLE
    , CHARA_ID, STYLE_ID, BUFF_ID, ABILITY_ID
} from "utils/const";
import {
    DEBUFF_LIST, TROOP_KBN, BUFF_KBN,
    getCharaIdToMember, getEffectSize, getSumEffectSize,
    getBuffKey, getBestBuffKeys, checkDuplicationChara,
    isOnlyUse, isAloneActivation, isOnlyBuff, filteredBuffList, filteredOrb,
    getEnemyResist
} from "./logic";
import { getCharaData, getPassiveInfo, getResonanceInfo, getAbilityInfo, deepClone } from "utils/common";
import BuffField from "./BuffField";
import AbilityCheckbox from "./AbilityCheckbox";
import PassiveCheckbox from "./PassiveCheckbox";
import Resonance from "./Resonance";
import BuffBulkSetting from "./BuffBulkSetting";
import BuffDetail from "./BuffDetail";
import skillList from "data/skillList";
import skillBuff from "data/skillBuff";

const TARGET_KIND = [
    EFFECT.ATTACKUP, // 攻撃力アップ
    EFFECT.DEFFENCEDOWN, // 防御力ダウン
    EFFECT.DAMAGERATEUP, // 破壊率上昇
    EFFECT.CRITICALRATEUP, // クリティカル率アップ
    EFFECT.FIELD_DEPLOYMENT, // フィールド展開
    EFFECT.STATUSUP_VALUE, // 能力固定上昇
    EFFECT.STATUSUP_RATE, // 能力%上昇
    EFFECT.FIELD_STRENGTHEN, // フィールド強化
    EFFECT.GIVEATTACKBUFFUP, // 攻撃力バフ強化
    EFFECT.GIVEDEFFENCEDEBUFFUP, // 防御力デバフ強化
    EFFECT.HIGH_BOOST, // ハイブースト状態
    EFFECT.FIRE_MARK, // 火の印
    EFFECT.FUNNEL, // 連撃
    EFFECT.FUNNEL_ALWAYS, // 連撃(永続)
]
const SUB_TARGET_KIND = [
    EFFECT.FIELD_DEPLOYMENT, // フィールド展開
    EFFECT.STATUSUP_VALUE, // 能力固定上昇
    EFFECT.STATUSUP_RATE, // 能力%上昇
    EFFECT.FIELD_STRENGTHEN, // フィールド強化
    EFFECT.GIVEDEFFENCEDEBUFFUP, // 防御力デバフ強化
    EFFECT.HIGH_BOOST, // ハイブースト状態
]

const BuffArea = ({ argument: {
    attackInfo, state, dispatch,
    selectBuffKeyMap, setSelectBuffKeyMap,
    buffSettingMap, setBuffSettingMap,
    abilitySettingMap, setAbilitySettingMap,
    passiveSettingMap, setPassiveSettingMap,
    resonanceList, setResonanceList,
} }) => {

    const { styleList } = useStyleList();
    const [checkUpdate, setCheckUpdate] = useState(true);

    let isElement = false;
    let isWeak = false;
    if (attackInfo) {
        isElement = attackInfo.attack_element;
        const [physicalResist, elementResist] = getEnemyResist(attackInfo, state);
        isWeak = physicalResist * elementResist > 10000;
    }
    let isDp = Number(state.dpRate[0]) !== 0;

    const attackUpBuffs = getAttackUpBuffs(isElement, isWeak, attackInfo, styleList.selectStyleList);
    const defDownBuffs = getDefenseDownBuffs(isElement, isWeak, isDp);
    const criticalBuffs = getCriticalBuffs(isElement);

    let buffKeyList = {};
    attackUpBuffs.forEach(buff => {
        buffKeyList[getBuffKey(buff.kind)] = [];
    });
    defDownBuffs.forEach(buff => {
        buffKeyList[getBuffKey(buff.kind)] = [];
    });
    criticalBuffs.forEach(buff => {
        buffKeyList[getBuffKey(buff.kind)] = [];
    });

    let attackCharaId = attackInfo?.chara_id;
    let selectList = styleList.selectStyleList.concat(styleList.subStyleList).map(style => {
        return style?.styleInfo.style_id + style?.exclusionSkillList.map(skill => skill).join(',');
    }).join(',');

    let supportList = styleList.selectStyleList.map(style => {
        const styleId = style?.support?.styleInfo?.style_id ?? "";
        const limitCount = style?.support?.limitCount ?? "";
        return `${styleId},${limitCount}`;
    }).join(',');

    const { buffGroup, abilityList, passiveList } = useMemo(() => {
        return generateBuffAbilityPassiveLists(styleList, attackInfo, attackUpBuffs, defDownBuffs, criticalBuffs);
    }, [attackInfo?.attack_id, attackInfo?.servantCount, selectList, isWeak, JSON.stringify(defDownBuffs)]);

    const resonance = useMemo(() => {
        return generateResonanceList(styleList, attackInfo);
    }, [attackInfo?.attack_id, selectList, supportList]);
    useEffect(() => {
        setResonanceList(resonance);
    }, [resonance]);

    const refBuffSettingMap = useRef(buffSettingMap);
    const refAbilitySettingMap = useRef(abilitySettingMap);
    const refPassiveSettingMap = useRef(passiveSettingMap);

    // バフ初期化
    useEffect(() => {
        const initialMap = {};
        Object.keys(buffGroup).forEach(key => {
            const initialList = [];
            buffGroup[key].forEach(buffList => {
                const innerMap = {};
                buffList.forEach(buff => {
                    innerMap[buff.key] = {
                        buff_id: buff.buff_id,
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
    }, [buffGroup]);

    // アビリティ初期化   
    useEffect(() => {
        const initialMap = {};
        abilityList.forEach(ability => {
            const key = `${ability.ability_id}-${ability.chara_id}`
            let checked = true;
            let disabled = !ability.conditions;
            let limit_border = ability.limit_border;
            let memberInfo = getCharaIdToMember(styleList, ability.chara_id);
            let limitCount = memberInfo.limitCount;
            switch (ability.range_area) {
                case RANGE.SELF:	// 自分
                    disabled = limitCount < limit_border || (ability.chara_id === attackCharaId && disabled);
                    checked = limitCount >= limit_border && ability.chara_id === attackCharaId;
                    break
                case RANGE.ALLY_FRONT:	// 味方前衛
                case RANGE.ALLY_BACK:	// 味方後衛
                    // 前衛または後衛かつ、本人以外
                    if (((ability.activation_place === 1 || ability.activation_place === 2) && !ability.chara_id !== attackCharaId) || !disabled) {
                        disabled = false;
                    } else {
                        disabled = true;
                    }
                    checked = limitCount >= limit_border && ability.chara_id === attackCharaId;
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
                    if (limitCount < limit_border) {
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
        refAbilitySettingMap.current = initialMap;
        setAbilitySettingMap(initialMap);
    }, [styleList, abilityList, attackCharaId]);

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
        refPassiveSettingMap.current = initialMap;
        setPassiveSettingMap(initialMap);
    }, [passiveList]);

    // バフ効果量更新
    useEffect(() => {
        const updateMap = { ...refBuffSettingMap.current };
        const newAbilitySettingMap = { ...refAbilitySettingMap.current };
        const newPassiveSettingMap = { ...refPassiveSettingMap.current };
        Object.keys(updateMap).forEach(buffKind => {
            updateMap[buffKind].forEach((buffInnerList, index) => {
                Object.keys(buffInnerList).forEach(buffKey => {
                    let buffSetting = buffInnerList[buffKey];
                    let buff = buffSetting.buffInfo;
                    const memberInfo = getCharaIdToMember(styleList, buff.use_chara_id);
                    buffSetting.effect_size = getEffectSize(styleList, buff, buffSetting, memberInfo, state,
                        newAbilitySettingMap, newPassiveSettingMap, resonanceList);
                })
            });
        });

        setBuffSettingMap(updateMap);
        refBuffSettingMap.current = updateMap;
    }, [styleList, state.enemyInfo, state.hard.tearsOfDreams, abilitySettingMap, passiveSettingMap, passiveList, resonanceList]);

    // スキルレベル変更
    const handleChangeSkillLv = (buffKindKey, buffKey, lv, index) => {
        const updateMap = { ...buffSettingMap };
        let buffKind = Number(buffKindKey.split('-')[1]);
        updateMap[buffKind].forEach(buffInnerList => {
            let settingBuff = buffInnerList[buffKey];
            settingBuff.skill_lv = lv
            let buff = buffGroup[buffKind][index].filter(buff => buff.key === buffKey)[0];
            const memberInfo = getCharaIdToMember(styleList, buff.use_chara_id);
            settingBuff.effect_size = getEffectSize(styleList, buff, settingBuff, memberInfo, state,
                abilitySettingMap, passiveSettingMap, resonanceList);
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
            let buffKind = Number(buffKey.split('-')[1]);
            let kindBuffList = buffGroup[buffKind] ? buffGroup[buffKind][0] : [];
            kindBuffList = filteredOrb(kindBuffList, false);

            const buffItemList = [
                ...kindBuffList.filter(buffInfo =>
                    !isOnlyUse(attackInfo, buffInfo)
                ),
                ...kindBuffList.filter(buffInfo =>
                    !(isAloneActivation(buffInfo) || isOnlyBuff(attackInfo, buffInfo) || isOnlyUse(attackInfo, buffInfo))
                ),
            ];
            handleSelectChange(buffKey, getBestBuffKeys(buffKind, buffItemList, refBuffSettingMap.current));
        })
    }

    // 存在しないバフの設定を外す
    const outNotExistBuff = () => {
        Object.keys(selectBuffKeyMap).forEach((buffKey) => {
            let buffKind = Number(buffKey.split('-')[1]);
            const selectedKeys = selectBuffKeyMap[buffKey].map(selectedKey => {
                if (refBuffSettingMap.current?.[buffKind]?.[0]?.[selectedKey]) {
                    return selectedKey;
                } else {
                    return "";
                }
            })
            handleSelectChange(buffKey, selectedKeys);
        })
    }

    // 選択内から最良を設定
    const setBestBuff = (buffKey, buffKind, buffItemList) => {
        const bestKeys = getBestBuffKeys(buffKind, buffItemList, refBuffSettingMap.current);
        handleSelectChange(buffKey, bestKeys);
    }

    // バフ一括設定
    const setMultiBuff = (settingBuffList) => {
        Object.keys(buffKeyList).forEach(buffKey => {
            const buffKind = Number(buffKey.split('-')[1]);
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
                    buffInfo.buff_kind === buffKind &&
                    buffInfo.skill_id === skillId &&
                    buffInfo.use_chara_id === charaId
                );
                // countが1なら1回、2なら2回追加（同じ要素を重複追加）
                return Array(count).fill(matchedBuffs).flat();
            });
            setBestBuff(buffKey, buffKind, buffItemList)
        });
        closeModal();
    };

    let resistDownEffectSize = getSumEffectSize(selectBuffKeyMap, buffSettingMap, [BUFF.RESISTDOWN])
    useEffect(() => {
        if (attackInfo) {
            dispatch({ type: "SET_RRGIST_DOWN", element: attackInfo.attack_element, value: resistDownEffectSize });
        }
    }, [state.enemyInfo, attackInfo?.attack_id, resistDownEffectSize]);

    useEffect(() => {
        if (attackInfo) {
            let resistKey = {};
            resistKey[getBuffKey(BUFF.MINDEYE)] = []
            resistKey[getBuffKey(BUFF.FRAGILE)] = []
            selectBestBuff(resistKey);
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
        let funnel = buffGroup[BUFF.FUNNEL];
        if (checkUpdate && funnel) {
            setBestBuff(getBuffKey(BUFF.FUNNEL), BUFF.FUNNEL, funnel[0]);
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
                            const buffKey = `${BUFF_KBN[buffDef.kind]}-${buffDef.kind}`
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
                                    buffInnerList={buffGroup[buffDef.kind] || []}
                                    buffSettingMap={buffSettingMap[buffDef.kind] || []}
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
                            const buffKey = `${BUFF_KBN[buffDef.kind]}-${buffDef.kind}`
                            return (
                                <BuffField key={buffKey}
                                    index={index}
                                    rowSpan={defDownBuffs.length * 2}
                                    buffDef={buffDef}
                                    buffKey={buffKey}
                                    attackInfo={attackInfo}
                                    buffInnerList={buffGroup[buffDef.kind] || []}
                                    buffSettingMap={buffSettingMap[buffDef.kind] || []}
                                    handleChangeSkillLv={handleChangeSkillLv}
                                    selectedKey={selectBuffKeyMap[buffKey] || []}
                                    handleSelectChange={handleSelectChange}
                                    openModal={openModal}
                                />
                            )
                        })}
                        <tr className="sp_only">
                            <td className="kind" colSpan="4">
                                クリティカル
                            </td>
                        </tr>
                        {criticalBuffs.map((buffDef, index) => {
                            const buffKey = `${BUFF_KBN[buffDef.kind]}-${buffDef.kind}`
                            return (
                                <BuffField key={buffKey}
                                    index={index}
                                    rowSpan={criticalBuffs.length * 2}
                                    buffDef={buffDef}
                                    buffKey={buffKey}
                                    attackInfo={attackInfo}
                                    buffInnerList={buffGroup[buffDef.kind] || []}
                                    buffSettingMap={buffSettingMap[buffDef.kind] || []}
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
                    <li>・一括設定は現在表示されているスキルのみに適用されます。</li>
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
                        modal.buffInfo.kbn === "buff" ?
                            <BuffDetail buffInfo={modal.buffInfo} styleList={styleList} state={state}
                                index={modal.index} buffSettingMap={buffSettingMap} setBuffSettingMap={setBuffSettingMap}
                                abilitySettingMap={abilitySettingMap} passiveSettingMap={passiveSettingMap}
                                resonanceList={resonanceList} closeModal={closeModal} />
                            :
                            <AbilityDetail buffInfo={modal.buffInfo} closeModal={closeModal} />
                    )
                }
            </ReactModal>
        </div >
    )
};

// バフ、アビリティ、パッシブ作成
function generateBuffAbilityPassiveLists(styleList, attackInfo, attackUpBuffs, defDownBuffs, criticalBuffs) {
    const buffList = [];
    const abilityList = [];
    const passiveList = [];
    addBuffAbilityPassiveLists(
        styleList, styleList.selectStyleList, attackInfo, buffList, abilityList, passiveList, TROOP_KBN.MAIN
    )

    addBuffAbilityPassiveLists(
        styleList, styleList.subStyleList, attackInfo, buffList, abilityList, passiveList, TROOP_KBN.SUB
    )

    let filteredBuff = filteredBuffList(buffList, attackInfo)

    // グループ化
    const buffGroup = filteredBuff.reduce((acc, buff) => {
        const key = buff.buff_kind;
        if (!acc[key]) {
            acc[key] = [[], []];
        }
        acc[key][0].push(deepClone(buff));
        const match1 = attackUpBuffs.find(item => item.kind === key);
        const match2 = defDownBuffs.find(item => item.kind === key);
        const match3 = criticalBuffs.find(item => item.kind === key);
        if (match1?.overlap || match2?.overlap || match3?.overlap === true) {
            acc[key][1].push(deepClone(buff));
        }
        return acc;
    }, {});
    return { buffList, buffGroup, abilityList, passiveList };
}

// レゾナンスリスト作成
function generateResonanceList(styleList, attackInfo) {
    let attackCharaId = attackInfo?.chara_id;

    const resonanceList = [];
    styleList.selectStyleList
        .filter(memberInfo => memberInfo)
        .forEach(memberInfo => {
            const charaId = memberInfo.styleInfo.chara_id;
            const charaName = getCharaData(charaId).chara_short_name;

            // レゾナンス判定
            if ((memberInfo.styleInfo.rarity === 0 || memberInfo.styleInfo.rarity === 9) && memberInfo.supportStyleId) {
                const support = memberInfo.support;
                if (support.styleInfo.ability_resonance) {
                    const resonance = deepClone(getResonanceInfo(support.styleInfo.ability_resonance));
                    if (resonance.effect_type === EFFECT.ATTACKUP_AND_DAMAGERATEUP) {
                        if (attackCharaId !== charaId) {
                            return;
                        }
                    }
                    resonance.charaId = charaId;
                    resonance.charaName = charaName;
                    resonance.limitCount = support.limitCount;
                    resonanceList.push(resonance);
                }
            }
        });
    return resonanceList;
}

// バフ、アビリティ、パッシブ追加
function addBuffAbilityPassiveLists(styleList, targetStyleList, attackInfo, buffList, abilityList, passiveList, troopKbn) {
    let attackCharaId = attackInfo?.chara_id;
    let attackMemberInfo = getCharaIdToMember(styleList, attackCharaId);

    targetStyleList
        .filter(memberInfo => memberInfo)
        .filter(memberInfo => !(troopKbn === TROOP_KBN.SUB && checkDuplicationChara(styleList.selectStyleList, memberInfo?.styleInfo.chara_id)))
        .forEach(memberInfo => {
            const charaId = memberInfo.styleInfo.chara_id;
            const styleId = memberInfo.styleInfo.style_id;
            const charaName = getCharaData(charaId).chara_short_name;

            const styleBuffList = skillBuff.filter(buff =>
                (buff.chara_id === charaId || buff.chara_id === 0) &&
                (buff.style_id === styleId || buff.style_id === 0) &&
                BUFF_KBN[buff.buff_kind]
            ).filter(buff => {
                switch (buff.buff_id) {
                    case BUFF_ID.MOON_LIGHT: // 月光(歌姫の加護)
                        return styleId === STYLE_ID.ONLY_MOON_LIGHT;
                    case BUFF_ID.MEGA_DESTROYER5: // メガデストロイヤー(5人以上)
                        return attackInfo?.servantCount >= 5;
                    case BUFF_ID.MEGA_DESTROYER6: // メガデストロイヤー(6人以上)
                        return attackInfo?.servantCount === 6;
                    default:
                        break;
                }
                // サブ部隊
                if (troopKbn === TROOP_KBN.SUB) {
                    return DEBUFF_LIST.includes(buff.buff_kind);
                }
                // 除外スキル
                if (memberInfo.exclusionSkillList.includes(buff.skill_id)) return false;
                return true;
            });

            const newStyleBuffList = JSON.parse(JSON.stringify(styleBuffList));
            newStyleBuffList.forEach(buff => {
                buff.key = `buff_${buff.buff_id}_${charaId}`;
                buff.chara_name = charaName;
                buff.use_chara_id = charaId;
                buff.kbn = "buff";
                buff.troopKbn = troopKbn;
            });
            buffList.push(...newStyleBuffList);

            const addBuffAbility = (kbn, skillId, charaId, skillName, buffKind, fieldElement, effectSize) => {
                buffList.push({
                    key: `${kbn}_${skillId}_${charaId}`,
                    skill_id: skillId,
                    use_chara_id: charaId,
                    buff_kind: buffKind,
                    buff_name: skillName,
                    buff_element: fieldElement,
                    chara_name: charaName,
                    max_power: effectSize,
                    max_lv: 1,
                    kbn: kbn
                });
            };

            let styleAbility = {
                "0": memberInfo.styleInfo.ability0,
                "00": memberInfo.styleInfo.ability00,
                "1": memberInfo.styleInfo.ability1,
                "3": memberInfo.styleInfo.ability3,
                "5": memberInfo.styleInfo.ability5,
                "10": memberInfo.styleInfo.ability10
            };
            if (memberInfo.styleInfo.role === ROLE.ADMIRAL) {
                styleAbility["00"] = ABILITY_ID.ADMIRAL_COMMON;
            }

            Object.keys(styleAbility).forEach(key => {
                const abilityId = styleAbility[key];
                // 1000番以降は不要
                if (!abilityId || abilityId > 1000 || !attackInfo) return;

                const abilityInfo = getAbilityInfo(abilityId);

                if (troopKbn === TROOP_KBN.SUB) {
                    // 他部隊のアビリティは一部のみ許可
                    if (!SUB_TARGET_KIND.includes(abilityInfo.effect_type)) {
                        return;
                    }
                }
                const buffTypeMap = {
                    [EFFECT.FIELD_DEPLOYMENT]: BUFF.FIELD,
                    [EFFECT.CHARGE]: BUFF.CHARGE,
                    [EFFECT.ARROWCHERRYBLOSSOMS]: BUFF.ARROWCHERRYBLOSSOMS,
                    [EFFECT.SHADOW_CLONE]: BUFF.SHADOW_CLONE,
                    [EFFECT.YAMAWAKI_SERVANT]: BUFF.YAMAWAKI_SERVANT,
                };

                if (abilityInfo.range_area === RANGE.SELF && charaId !== attackCharaId) return;
                if (abilityInfo.element !== 0 && abilityInfo.element !== attackInfo.attack_element) return;
                if (abilityInfo.physical !== 0 && abilityInfo.physical !== attackInfo.attack_physical) return;
                if (attackMemberInfo) {
                    if (abilityInfo.target_element !== 0 &&
                        abilityInfo.target_element !== attackMemberInfo.styleInfo.element &&
                        abilityInfo.target_element !== attackMemberInfo.styleInfo.element2) return;
                }

                const buffType = buffTypeMap[abilityInfo.effect_type];
                if (buffType) {
                    addBuffAbility("ability", abilityId, charaId, abilityInfo.ability_name, buffType, abilityInfo.element, abilityInfo.effect_size);
                    return;
                }

                const newAbility = JSON.parse(JSON.stringify(abilityInfo));
                newAbility.key = `${abilityId}_${charaId}`;
                newAbility.limit_border = Number(key);
                newAbility.chara_id = charaId;
                newAbility.chara_name = charaName;
                abilityList.push(newAbility);
            });

            const stylePassiveList = skillList.filter(obj =>
                obj.chara_id === charaId &&
                (obj.style_id === styleId || obj.style_id === 0) &&
                obj.skill_active === 1
            );

            stylePassiveList.forEach(skill => {
                const passive = getPassiveInfo(skill.skill_id);
                if (!passive || !TARGET_KIND.includes(passive.effect_type)) return;
                if (troopKbn === TROOP_KBN.SUB) {
                    // 他部隊のアビリティは一部のみ許可
                    if (!SUB_TARGET_KIND.includes(passive.effect_type)) {
                        return;
                    }
                }

                if (passive.range_area === RANGE.FIELD) {
                    addBuffAbility("passive", passive.skill_id, charaId, passive.passive_name, BUFF.FIELD, 0, passive.effect_size);
                } else {
                    passive.key = `${passive.skill_id}_${charaId}`;
                    passive.memberInfo = memberInfo;
                    passive.chara_id = charaId;
                    passive.chara_name = charaName;
                    passive.troopKbn = troopKbn;
                    passiveList.push(passive);
                }
            });
        });
}

const getAttackUpBuffs = function (isElement, isWeak, attackInfo, selectStyleList) {
    const isShadowClone = CHARA_ID.SHADOW_CLONE.includes(attackInfo?.chara_id);
    const isWedingSharo = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.WEDING_SHARO
    );
    const isKitchenVritika = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_VRITIKA
    );
    const isKitchenSharo = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.KITCHEN_SHARO
    );
    const isRisa = selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.chara_id === CHARA_ID.RISA
    );
    const isMiya = attackInfo?.chara_id === CHARA_ID.MIYA;
    const isServant = STYLE_ID.SERVANT.includes(attackInfo?.style_id) || selectStyleList.some(
        (memberInfo) => memberInfo?.styleInfo.style_id === STYLE_ID.UNISON_BUNGO
    );
    return [
        { name: "攻撃力UP", kind: BUFF.ATTACKUP, overlap: true },
        ...(isElement ? [{ name: "属性攻撃力UP", kind: BUFF.ELEMENT_ATTACKUP, overlap: true },] : []),
        { name: "フィールド", kind: BUFF.FIELD, overlap: false },
        { name: "チャージ", kind: BUFF.CHARGE, overlap: false },
        ...(isShadowClone ? [{ name: "影分身", kind: BUFF.SHADOW_CLONE, overlap: false },] : []),
        ...(isMiya ? [{ name: "桜花の矢", kind: BUFF.ARROWCHERRYBLOSSOMS, overlap: false },] : []),
        ...(isWedingSharo ? [{ name: "永遠なる誓い", kind: BUFF.ETERNAL_OARH, overlap: false },] : []),
        ...(isRisa ? [{ name: "オギャり", kind: BUFF.BABIED, overlap: false },] : []),
        ...(isKitchenVritika ? [{ name: "カリー", kind: BUFF.CURRY, overlap: false },] : []),
        ...(isKitchenSharo ? [{ name: "シチー", kind: BUFF.SHCHI, overlap: false },] : []),
        ...(isWeak ? [{ name: "心眼", kind: BUFF.MINDEYE, overlap: true },] : []),
        ...(isWeak && isServant ? [{ name: "山脇様のしもべ ", kind: BUFF.YAMAWAKI_SERVANT, overlap: false },] : []),
        { name: "連撃", kind: BUFF.FUNNEL, overlap: true },
        { name: "破壊率UP", kind: BUFF.DAMAGERATEUP, overlap: true },
    ];
}

const getDefenseDownBuffs = function (isElement, isWeak, isDp) {
    return [
        { name: "防御力DOWN", kind: BUFF.DEFENSEDOWN, overlap: true },
        ...(isDp ? [{ name: "DP防御力DOWN", kind: BUFF.DEFENSEDP, overlap: true },] : []),
        ...(isElement ? [{ name: "属性防御力DOWN", kind: BUFF.ELEMENT_DEFENSEDOWN, overlap: true },] : []),
        { name: "防御力DOWN(永)", kind: BUFF.ETERNAL_DEFENSEDOWN, overlap: true },
        ...(isElement ? [{ name: "属性防御力DOWN(永)", kind: BUFF.ELEMENT_ETERNAL_DEFENSEDOWN, overlap: true },] : []),
        ...(isWeak ? [{ name: "脆弱", kind: BUFF.FRAGILE, overlap: true },] : []),
        ...(isElement ? [{ name: "耐性ダウン", kind: BUFF.RESISTDOWN, overlap: true },] : []),
    ];
}
const getCriticalBuffs = function (isElement) {
    return [
        { name: "クリティカル率UP", kind: BUFF.CRITICALRATEUP, overlap: true },
        { name: "クリダメUP", kind: BUFF.CRITICALDAMAGEUP, overlap: true },
        ...(isElement ? [
            { name: "属性クリ率UP", kind: BUFF.ELEMENT_CRITICALRATEUP, overlap: true },
            { name: "属性クリダメUP", kind: BUFF.ELEMENT_CRITICALDAMAGEUP, overlap: true },
        ] : []),
    ]
}

const AbilityDetail = ({ buffInfo, closeModal }) => {
    let effectSize = 0;
    // アビリティ
    switch (buffInfo.buff_kind) {
        case BUFF.CHARGE: // チャージ
            effectSize = 30;
            break;
        case BUFF.FIELD: // フィールド
            effectSize = buffInfo.max_power;
            break;
        case BUFF.ARROWCHERRYBLOSSOMS: // 桜花の矢
            effectSize = 50;
            break;
        case BUFF.YAMAWAKI_SERVANT: // 山脇様のしもべ
            effectSize = 40;
            break;
        case BUFF.SHADOW_CLONE: // 影分身
            effectSize = 30;
            break;
        default:
            break;
    }
    return (
        <div className="modal text-left p-6 mx-auto">
            <div>
                <label className="damage_label">アビリティ詳細</label>
                <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="w-[350px] mx-auto grid grid-cols-2 text-center">
                <span>アビリティ</span>
                <span>{buffInfo.buff_name}</span>
                <span>効果量</span>
                <span>{effectSize}%</span>
            </div>
        </div>
    )
}

export default BuffArea;
