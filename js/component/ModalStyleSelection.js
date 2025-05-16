


const ModalStyleSelection = ({ index, closeModal, narrowStyle, setNarrowStyle }) => {
    const { styleList, setStyleList, setMember, removeMember } = useStyleList();

    const PHYSICAL_LIST = { "1": "slash", "2": "stab", "3": "strike" };
    const ELEMENT_LIST = { "0": "none", "1": "fire", "2": "ice", "3": "thunder", "4": "light", "5": "dark" };
    const ROLE_LIST = { "1": "ATTACKER", "2": "BREAKER", "3": "BLASTER", "4": "HEALER", "5": "BUFFER", "6": "DEBUFFER", "7": "DEFENDER", "8": "ADMIRAL", "9": "RIDER" };
    const RARITY_LIST = { "1": "IconRaritySS", "2": "IconRarityS", "3": "IconRarityA" };
    const TROOP_LIST = {
        "31A": "DioramaStamp31a", "31B": "DioramaStamp31b", "31C": "DioramaStamp31c",
        "31D": "DioramaStamp31d", "31E": "DioramaStamp31e", "31F": "DioramaStamp31f", "31X": "DioramaStamp31x",
        "30G": "DioramaStamp30g", "SRP": "seraphIcon", "AB!": "angelbeats"
    };
    const BUFF_LIST = [
        [0, "攻撃UP"],
        [1, "属性攻撃UP"],
        [2, "心眼"],
        [16, "連撃"],
        [3, "防御DOWN"],
        [4, "属性防御DOWN"],
        [5, "脆弱"],
        [21, "永続防御力DOWN"],
        [22, "永続属性防御DOWN"],
        [20, "耐性DOWN"],
        [6, "クリ率UP"],
        [7, "クリダメUP"],
        [8, "属性クリ率UP"],
        [9, "属性クリダメUP"],
        [10, "チャージ"],
        [11, "フィールド"],
        [12, "破壊率UP"],
    ];

    const chengeBuff = (value, buff_no) => {
        if (buff_no == 1) {
            narrowStyle.buff_1 = value;
        } else if (buff_no == 2) {
            narrowStyle.buff_2 = value;
        } else if (buff_no == 3) {
            narrowStyle.buff_3 = value;
        }
        setNarrowStyle({ ...narrowStyle });
    }

    const checkBuff = (buff_info, buff_no) => {
        if (buff_info.buff_kind != buff_no) {
            return false;
        }
        const CHECK_BUFF_LIST = [
            BUFF_ATTACKUP, BUFF_ELEMENT_ATTACKUP, BUFF_MINDEYE,
            BUFF_CRITICALRATEUP, BUFF_CRITICALDAMAGEUP, BUFF_ELEMENT_CRITICALRATEUP, BUFF_ELEMENT_CRITICALDAMAGEUP,
            BUFF_CHARGE, BUFF_FUNNEL, BUFF_DAMAGERATEUP
        ];
        if (!CHECK_BUFF_LIST.includes(buff_info.buff_kind)) {
            return true;
        }
        let target_out_range = []
        switch (narrowStyle.target) {
            case "self":
                target_out_range = [RANGE_SELF_OTHER, RANGE_ALLY_BACK, RANGE_FRONT_OTHER, RANGE_OTHER_UNIT];
                break;
            case "other":
                target_out_range = [RANGE_SELF, RANGE_FRONT_OTHER];
                break;
        }
        return !target_out_range.includes(buff_info.range_area);
    }

    const clickRemoveMember = (index) => {
        localStorage.removeItem(`troops_${styleList.selectTroops}_${index}`);
        removeMember(index);
        closeModal();
    }

    const clickSetMember = (index, style_id) => {
        setMember(index, style_id);
        localStorage.setItem(`troops_${styleList.selectTroops}_${index}`, style_id);
        closeModal();
    }
    return (
        <div className="modal_inner">
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
                    let opacity = (narrowStyle.physical == null || key == narrowStyle.physical) ? "" : "translucent";
                    let className = `narrow physical ${opacity}`
                    return (<input className={className} id={`physical_${key}`} src={`img/${PHYSICAL_LIST[key]}.webp`} type="image" key={`physical_${key}`}
                        onClick={(e) => {
                            let newPhysical = key;
                            if (narrowStyle.physical == key) {
                                newPhysical = null;
                            }
                            setNarrowStyle({ ...narrowStyle, physical: newPhysical });
                        }}
                    />)
                })}
                <div className="w-12" />
                {Object.keys(ELEMENT_LIST).map(key => {
                    let opacity = (narrowStyle.element == null || key == narrowStyle.element) ? "" : "translucent";
                    let className = `narrow element ${opacity}`
                    return (<input className={className} id={`element_${key}`} src={`img/${ELEMENT_LIST[key]}.webp`} type="image" key={`element_${key}`}
                        onClick={(e) => {
                            let newElement = key;
                            if (narrowStyle.element == key) {
                                newElement = null;
                            }
                            setNarrowStyle({ ...narrowStyle, element: newElement });
                        }}
                    />)
                })}
            </div>
            <div className="flex flex-wrap justify-center">
                {Object.keys(ROLE_LIST).map(key => {
                    let opacity = (narrowStyle.role == null || key == narrowStyle.role) ? "" : "translucent";
                    let className = `role ${opacity}`
                    return (<input className={className} id={`role_${key}`} defaultValue={ROLE_LIST[key]} type="button" key={`role_${key}`}
                        onClick={(e) => {
                            let newRole = key;
                            if (narrowStyle.role == key) {
                                newRole = null;
                            }
                            setNarrowStyle({ ...narrowStyle, role: newRole });
                        }}
                    />)
                })}
            </div>
            <div className="flex flex-wrap rearity_area justify-center mx-auto">
                {Object.keys(RARITY_LIST).map(key => {
                    let opacity = key == narrowStyle.rarity ? "" : "translucent";
                    let className = `rarity ${opacity}`
                    return (<input className={className} id={`rarity_${key}`} src={`img/${RARITY_LIST[key]}.webp`} type="image" key={`rearity_${key}`}
                        onClick={(e) => {
                            setNarrowStyle({ ...narrowStyle, rarity: key });
                        }}
                    />)
                })}
                <div>
                    <div className="text-sm text-center mt-1">
                        <label>バフの対象：</label>
                        <label className="radio_label ml-0.5">
                            <input type="radio" name="target" value="all" checked={narrowStyle.target == "self"}
                                onChange={(e) => setNarrowStyle({ ...narrowStyle, target: "self" })} />
                            自分含む
                        </label>
                        <label className="radio_label ml-2">
                            <input type="radio" name="target" value="other" checked={narrowStyle.target == "other"}
                                onChange={(e) => setNarrowStyle({ ...narrowStyle, target: "other" })} />
                            他人含む
                        </label>
                        <label className="radio_label ml-2">
                            <input type="radio" name="target" value="none" checked={narrowStyle.target == "none"}
                                onChange={(e) => setNarrowStyle({ ...narrowStyle, target: "none" })} />
                            指定無し
                        </label>
                    </div>
                    <div className="text-sm">
                        <select className="narrow_buff" onChange={(e) => chengeBuff(Number(e.target.value), 1)} value={narrowStyle.buff_1}>
                            <option value="-1">未設定</option>
                            {BUFF_LIST.map(([key, value]) => (
                                <option key={`buff1_${key}`} value={key}>{value}</option>
                            ))}
                        </select>
                        <select className="narrow_buff" onChange={(e) => chengeBuff(Number(e.target.value), 2)} value={narrowStyle.buff_2}>
                            <option value="-1">未設定</option>
                            {BUFF_LIST.map(([key, value]) => (
                                <option key={`buff2_${key}`} value={key}>{value}</option>
                            ))}
                        </select>
                        <select className="narrow_buff" onChange={(e) => chengeBuff(Number(e.target.value), 3)} value={narrowStyle.buff_3}>
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
                    let filterList = style_list.filter((style) => {
                        let chara_data = getCharaData(style.chara_id);
                        let buff_list = skill_buff.filter(obj =>
                            (obj.chara_id === chara_data.chara_id || obj.chara_id === 0) &&
                            (obj.style_id === style.style_id || obj.style_id === 0 &&
                                obj.skill_id < 8000)
                        );

                        if (narrowStyle.buff_1 != -1) {
                            if (!buff_list.some(obj => checkBuff(obj, narrowStyle.buff_1))) {
                                return false;
                            };
                        }
                        if (narrowStyle.buff_2 != -1) {
                            if (!buff_list.some(obj => checkBuff(obj, narrowStyle.buff_2))) {
                                return false;
                            };
                        }
                        if (narrowStyle.buff_3 != -1) {
                            if (!buff_list.some(obj => checkBuff(obj, narrowStyle.buff_3))) {
                                return false;
                            };
                        }
                        return chara_data.troops == key
                            && (narrowStyle.rarity == null || style.rarity == narrowStyle.rarity)
                            && (narrowStyle.physical == null || chara_data.physical == narrowStyle.physical)
                            && (narrowStyle.element == null || style.element == narrowStyle.element || style.element2 == narrowStyle.element)
                            && (narrowStyle.role == null || style.role == narrowStyle.role);
                    })
                    return (<div className="troops" key={`troops_${key}`}>
                        <input className="emblem" src={`img/${TROOP_LIST[key]}.webp`} type="image" />
                        <div className="flex flex-wrap">
                            {filterList.map((style) => {
                                let chara_data = getCharaData(style.chara_id);
                                return (<img className="select_style_list" loading="lazy" id={`style_${style.style_id}`} src={`icon/${style.image_url}`} title={`[${style.style_name}]${chara_data.chara_name}`} key={`style_${style.style_id}`}
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