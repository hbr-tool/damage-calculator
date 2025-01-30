


const StyleSelectComponent = () => {
    const [narrowStyle, setNarrowStyle] = React.useState({
        physical: null,
        element: null,
        role: null,
        rarity: 1,
    });
    const PHYSICAL_LIST = { "1": "slash", "2": "stab", "3": "strike" };
    const ELEMENT_LIST = { "0": "none", "1": "fire", "2": "ice", "3": "thunder", "4": "light", "5": "dark" };
    const ROLE_LIST = { "1": "ATTACKER", "2": "BREAKER", "3": "BLASTER", "4": "HEALER", "5": "BUFFER", "6": "DEBUFFER", "7": "DEFENDER", "8": "ADMIRAL" };
    const RARITY_LIST = { "1": "IconRaritySS", "2": "IconRarityS", "3": "IconRarityA" };
    const TROOP_LIST = {
        "31A": "DioramaStamp31a", "31B": "DioramaStamp31b", "31C": "DioramaStamp31c",
        "31D": "DioramaStamp31d", "31E": "DioramaStamp31e", "31F": "DioramaStamp31f", "31X": "DioramaStamp31x",
        "30G": "DioramaStamp30g", "AB!": "angelbeats"
    };

    // 外すボタン
    const deleteMember = (select_style_list, chara_no) => {
        // メンバーの情報を削除
        if (typeof removeMember == "function") {
            removeMember(select_style_list, chara_no, true);
        }
        select_style_list[chara_no] = undefined;
        if (typeof updateMember == "function") {
            updateMember();
        }
    }

    // モーダルを閉じる
    function closeModel() {
        chara_no = -1;
        MicroModal.close('modal_style_section');
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
                        onClick={() => {
                            localStorage.removeItem(`troops_${select_troops}_${chara_no}`);
                            deleteMember(select_style_list, chara_no, true);
                            closeModel();
                        }}
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
            <div className="flex flex-wrap ml-2">
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
            <div className="flex flex-wrap rearity_area mx-auto">
                {Object.keys(RARITY_LIST).map(key => {
                    let opacity = key == narrowStyle.rarity ? "" : "translucent";
                    let className = `rarity ${opacity}`
                    return (<input className={className} id={`rarity_${key}`} src={`img/${RARITY_LIST[key]}.webp`} type="image" key={`rearity_${key}`}
                        onClick={(e) => {
                            setNarrowStyle({ ...narrowStyle, rarity: key });
                        }}
                    />)
                })}
            </div>
            <div className="search_result_area">
                {Object.keys(TROOP_LIST).map(key => {
                    let filterList = style_list.filter((style) => {
                        let chara_data = getCharaData(style.chara_id);
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
                                    onClick={(e) => {
                                        setMember(select_style_list, chara_no, style.style_id, true);
                                        closeModel();
                                    }}
                                />)
                            })}
                        </div>
                    </div>)
                })}
            </div>
        </div>
    )
};
$(function () {
    const rootElement = document.getElementById('modal_section');
    ReactDOM.createRoot(rootElement).render(<StyleSelectComponent />);
});