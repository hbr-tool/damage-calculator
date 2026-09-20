import React from "react";
import allStyleList from "data/styleList";
import skillEffect from "data/skillEffect";
import { getCharaData } from "utils/common";
import { EFFECT, RANGE } from 'utils/const';
import thumbnail from 'assets/thumbnail';
import rarity from 'assets/rarity';
import attribute from 'assets/attribute';
import troop from 'assets/troop';

import 'assets/styles/styleSelection.css';

const ModalStyleSelection = ({ index, narrowStyle, setNarrowStyle, clickSetMember, clickRemoveMember }) => {

    const PHYSICAL_LIST = { 1: "slash", 2: "stab", 3: "strike" };
    const ELEMENT_LIST = { 0: "none", 1: "fire", 2: "ice", 3: "thunder", 4: "light", 5: "dark", 6: "void" };
    const ROLE_LIST = { 1: "ATTACKER", 2: "BREAKER", 3: "BLASTER", 4: "HEALER", 5: "BUFFER", 6: "DEBUFFER", 7: "DEFENDER", 8: "ADMIRAL", 9: "RIDER" };
    const RARITY_LIST = { 0: "IconRaritySSR", 1: "IconRaritySS", 2: "IconRarityS", 3: "IconRarityA" };
    const TROOP_LIST = {
        "31A": "DioramaStamp31a", "31B": "DioramaStamp31b", "31C": "DioramaStamp31c",
        "31D": "DioramaStamp31d", "31E": "DioramaStamp31e", "31F": "DioramaStamp31f", "31X": "DioramaStamp31x",
        "30G": "DioramaStamp30g", "19A": "19AIcon", "SRP": "seraphIcon", "AB!": "angelbeats", "P5R": "persona5r"
    };
    const BUFF_LIST = [
        ["8-0", "攻撃UP"],
        ["8-1", "属性攻撃UP"],
        ["8-2", "心眼"],
        ["8-16", "連撃"],
        ["22-3", "防御DOWN"],
        ["22-4", "属性防御DOWN"],
        ["22-5", "脆弱"],
        ["22-21", "永続防御力DOWN"],
        ["22-22", "永続属性防御DOWN"],
        ["22-20", "属性耐性DOWN"],
        ["8-6", "CRT率UP"],
        ["8-7", "CRTダメージUP"],
        ["8-8", "属性CRT率UP"],
        ["8-9", "属性CRTダメージUP"],
        ["8-10", "チャージ"],
        ["7-0", "フィールド"],
        ["8-5", "破壊率UP"],
    ];

    const chengeBuff = (value, targetNo) => {
        narrowStyle[`buff_${targetNo}`] = value;
        setNarrowStyle({ ...narrowStyle });
    }

    const checkBuff = (effectInfo, targetKey) => {
        const effectKey = `${effectInfo.effect_type}-${effectInfo.effect_no || "0"}`;
        if (effectKey !== targetKey) {
            return false;
        }
        const CHECK_EFFECT_LIST = [
            EFFECT.GRANT_BUFF, EFFECT.GRANT_DEBUFF
        ];
        if (!CHECK_EFFECT_LIST.includes(effectInfo.effect_type)) {
            return true;
        }
        let targetOutRange = []
        switch (narrowStyle.target) {
            case "self":
                targetOutRange = [RANGE.SELF_OTHER, RANGE.ALLY_BACK, RANGE.FRONT_OTHER, RANGE.OTHER_UNIT];
                break;
            case "other":
                targetOutRange = [RANGE.SELF, RANGE.FRONT_OTHER];
                break;
            default:
                break;
        }
        return !targetOutRange.includes(effectInfo.range_area);
    }

    return (
        <div className="modal_inner stylelist">
            <div className="modal_inner_headline">
                <div className="flex leading-10">
                    <div className="mx-auto pl-16">スタイル選択</div>
                    <input
                        className="remove_btn text-center mr-2"
                        defaultValue="外す"
                        id="calc"
                        type="button"
                        onClick={() => { clickRemoveMember(index) }}
                    />
                </div>
            </div>
            <hr className="line" />
            <div className="narrow_element flex mx-auto">
                {Object.keys(PHYSICAL_LIST).map(key => {
                    key = Number(key);
                    let opacity = (narrowStyle.physical === null || key === narrowStyle.physical) ? "" : "translucent";
                    let className = `narrow physical ${opacity}`
                    return (<input className={className} id={`physical_${key}`} src={attribute[PHYSICAL_LIST[key]]} type="image"
                        key={`physical_${key}`}
                        alt={PHYSICAL_LIST[key]}
                        onClick={() => {
                            let newPhysical = key;
                            if (narrowStyle.physical === key) {
                                newPhysical = null;
                            }
                            setNarrowStyle({ ...narrowStyle, physical: newPhysical });
                        }}
                    />)
                })}
                <div className="w-12" />
                {Object.keys(ELEMENT_LIST).map(key => {
                    key = Number(key);
                    let opacity = (narrowStyle.element === null || key === narrowStyle.element) ? "" : "translucent";
                    let className = `narrow element ${opacity}`
                    return (<input className={className} id={`element_${key}`} src={attribute[ELEMENT_LIST[key]]} type="image"
                        key={`element_${key}`}
                        alt={ELEMENT_LIST[key]}
                        onClick={() => {
                            let newElement = key;
                            if (narrowStyle.element === key) {
                                newElement = null;
                            }
                            setNarrowStyle({ ...narrowStyle, element: newElement });
                        }}
                    />)
                })}
            </div>
            <div className="flex flex-wrap justify-center">
                {Object.keys(ROLE_LIST).map(key => {
                    key = Number(key);
                    let opacity = (narrowStyle.role === null || key === narrowStyle.role) ? "" : "translucent";
                    let className = `role ${opacity}`
                    return (<input className={className} id={`role_${key}`} defaultValue={ROLE_LIST[key]} type="button"
                        key={`role_${key}`}
                        alt={ROLE_LIST[key]}
                        onClick={() => {
                            let newRole = key;
                            if (narrowStyle.role === key) {
                                newRole = null;
                            }
                            setNarrowStyle({ ...narrowStyle, role: newRole });
                        }}
                    />)
                })}
            </div>
            <div className="flex flex-wrap rearity_area justify-center mx-auto">
                {Object.keys(RARITY_LIST).map((key, index) => {
                    key = Number(key);
                    let opacity = narrowStyle.rarity[index] ? "" : "translucent";
                    let className = `rarity ${opacity}`
                    return (<input className={className} id={`rarity_${key}`} src={rarity[RARITY_LIST[key]]} type="image"
                        key={`rearity_${key}`}
                        alt={RARITY_LIST[key]}
                        onClick={(e) => {
                            setNarrowStyle(prev => ({
                                ...prev,
                                rarity: prev.rarity.map((v, i) => (i === index ? !v : v)),
                            }));
                        }}
                    />)
                })}
                <div>
                    <div className="text-sm text-center mt-1">
                        <label>バフの対象：</label>
                        <label className="radio_label ml-0.5">
                            <input type="radio" name="target" value="all" checked={narrowStyle.target === "self"}
                                onChange={(e) => setNarrowStyle({ ...narrowStyle, target: "self" })} />
                            自分含む
                        </label>
                        <label className="radio_label ml-2">
                            <input type="radio" name="target" value="other" checked={narrowStyle.target === "other"}
                                onChange={(e) => setNarrowStyle({ ...narrowStyle, target: "other" })} />
                            他人含む
                        </label>
                        <label className="radio_label ml-2">
                            <input type="radio" name="target" value="none" checked={narrowStyle.target === "none"}
                                onChange={(e) => setNarrowStyle({ ...narrowStyle, target: "none" })} />
                            指定無し
                        </label>
                    </div>
                    <div className="text-sm">
                        <select className="narrow_buff" onChange={(e) => chengeBuff(e.target.value, 1)} value={narrowStyle.buff_1}>
                            <option value="-1">未設定</option>
                            {BUFF_LIST.map(([key, value]) => (
                                <option key={`buff1_${key}`} value={key}>{value}</option>
                            ))}
                        </select>
                        <select className="narrow_buff" onChange={(e) => chengeBuff(e.target.value, 2)} value={narrowStyle.buff_2}>
                            <option value="-1">未設定</option>
                            {BUFF_LIST.map(([key, value]) => (
                                <option key={`buff2_${key}`} value={key}>{value}</option>
                            ))}
                        </select>
                        <select className="narrow_buff" onChange={(e) => chengeBuff(e.target.value, 3)} value={narrowStyle.buff_3}>
                            <option value="-1">未設定</option>
                            {BUFF_LIST.map(([key, value]) => (
                                <option key={`buff3_${key}`} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="search_result_area">
                {Object.keys(TROOP_LIST).map(key => {
                    let filterList = allStyleList.filter((style) => {
                        let charaData = getCharaData(style.chara_id);
                        let effectList = skillEffect.filter(obj =>
                            (obj.chara_id === charaData.chara_id || obj.chara_id === 0) &&
                            ((obj.style_id === style.style_id || obj.style_id === 0) && obj.skill_id < 8000)
                        );

                        if (narrowStyle.buff_1 !== "-1") {
                            if (!effectList.some(obj => checkBuff(obj, narrowStyle.buff_1))) {
                                return false;
                            };
                        }
                        if (narrowStyle.buff_2 !== "-1") {
                            if (!effectList.some(obj => checkBuff(obj, narrowStyle.buff_2))) {
                                return false;
                            };
                        }
                        if (narrowStyle.buff_3 !== "-1") {
                            if (!effectList.some(obj => checkBuff(obj, narrowStyle.buff_3))) {
                                return false;
                            };
                        }
                        return charaData.troops === key
                            && (narrowStyle.rarity[style.rarity] || (narrowStyle.rarity[0] && style.rarity === 1 && style.resonance === 1))
                            && (narrowStyle.physical === null || charaData.physical === narrowStyle.physical)
                            && (narrowStyle.element === null || style.element === narrowStyle.element || style.element2 === narrowStyle.element)
                            && (narrowStyle.role === null || style.role === narrowStyle.role);
                    })
                    return (<div className="flex" key={`troops_${key}`}>
                        <input className="emblem" src={troop[TROOP_LIST[key]]} alt={TROOP_LIST[key]} type="image" />
                        <div className="flex flex-wrap">
                            {filterList.map((style) => {
                                let charaData = getCharaData(style.chara_id);
                                const imageName = style.image_url.replace(/\.webp$/, '');
                                const icon = thumbnail[imageName];
                                return (<img className="select_style_list" loading="lazy" id={`style_${style.style_id}`}
                                    alt={`[${style.style_name}]${charaData.chara_name}`}
                                    src={icon} title={`[${style.style_name}]${charaData.chara_name}`} key={`style_${style.style_id}`}
                                    onClick={() => { clickSetMember(index, style.style_id) }}
                                />)
                            })}
                        </div>
                    </div>)
                })}
            </div>
        </div>
    )
};

export default ModalStyleSelection;