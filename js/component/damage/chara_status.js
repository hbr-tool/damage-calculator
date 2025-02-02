const { DragDropContext, Droppable, Draggable } = window["ReactBeautifulDnd"];

const CharaStatus = () => {
    const [selectStyle, setSelectStyle] = React.useState([]);

    // 限界突破変更
    const changeLimitCount = (chara_no, value) => {
        let limit_count = Number(value);
        saveStatus(chara_no, "limit_count", limit_count);
        updateLimitCount(chara_no, limit_count);
    }

    // 宝珠レベル変更
    const changeJewelLv = (chara_no, value) => {
        let jewel_lv = Number(value);
        saveStatus(chara_no, "jewel_lv", jewel_lv);
        updateJewelLv(chara_no);
    }

    // ステータス変更
    const changeStatus = (chara_no, item, value) => {
        let status = Number(value);
        status = isNaN(status) ? 0 : status;
        status = status > 1000 ? 999 : status;
        saveStatus(chara_no, item, status);
        updateStatus(chara_no);
        select_style_list[chara_no][item] = status;
        setSelectStyle([...select_style_list]);
    }

    // ステータス保存
    const saveStatus = (chara_no, item, status) => {
        select_style_list[chara_no][item] = status;
        saveStyle(select_style_list[chara_no]);
    }

    // リセットボタン押下
    const resetStyle = () => {
        styleReset(select_style_list, true);
        setSelectStyle([...select_style_list]);
    }

    // 部隊変更
    const changeTroops = (e) => {
        if (e.target.value == select_troops) {
            return;
        }
        styleReset(select_style_list, false);
        select_troops = e.target.value;
        localStorage.setItem('select_troops', select_troops);
        loadTroopsList(select_style_list, select_troops);
    }

    // メンバー追加
    window.updateMember = function () {
        setSelectStyle([...select_style_list]);
    }

    // メンバー入れ替え
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const [removed] = select_style_list.splice(result.source.index, 1);
        select_style_list.splice(result.destination.index, 0, removed);

        select_style_list.forEach((style, index) => {
            let style_id = null;
            if (style) {
                style_id = style.style_info.style_id;
            }
            localStorage.setItem(`troops_${select_troops}_${index}`, style_id);
        })
        setSelectStyle([...select_style_list]);
    };

    return (
        <>
            <label className="mt-3 mb-3 small_font">部隊選択</label>
            <div className="col-span-6 flex">
                {Array.from({ length: 9 }, (_, i) => {
                    let className = "troops_btn " + (i === Number(select_troops) ? "selected_troops" : "")
                    return (
                        <input key={i}
                            className={className}
                            defaultValue={i}
                            onClick={(e) => changeTroops(e)}
                            type="button"
                        />
                    )
                })}
            </div>
            <div className="mt-2">
                <label className="small_font">スタイル</label>
                <input defaultValue="リセット" id="style_reset_btn" type="button" onClick={resetStyle} />
            </div>
            <div className="col-span-6 flex">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided) => (
                            <ul
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="col-span-6"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    listStyleType: 'none',
                                    padding: 0,
                                }}
                            >
                                {select_style_list.map((value, index) => {
                                    let id = `style_${index}`
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(provided) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        cursor: 'grab',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <StyleIcon place_no={index} />
                                                </li>
                                            )}
                                        </Draggable>)
                                })}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            <div>
                <label className="label_status">限界突破</label>
                <label className="label_status">力</label>
                <label className="label_status">器用さ</label>
                <label className="label_status">体力</label>
                <label className="label_status">精神</label>
                <label className="label_status">知性</label>
                <label className="label_status">運</label>
                <label className="label_status">宝珠Lv</label>
                <label className="label_status">トークン</label>
                <label className="label_status">消費SP</label>
            </div>
            {select_style_list.map((value, index) => {
                let style = value;
                let chara_id = style ? style.style_info.chara_id : 0;
                let rarity = style ? style.style_info.rarity : 0;
                let str = style ? style.str : 400;
                let dex = style ? style.dex : 400;
                let con = style ? style.con : 400;
                let mnd = style ? style.mnd : 400;
                let int = style ? style.int : 400;
                let luk = style ? style.luk : 400;
                let limit = style ? style.limit_count : 2;
                let jewel = style ? style.jewel_lv : 0;
                let results = [];
                Object.keys(ref_status_list).forEach(key => {
                    if (ref_status_list[key].length == 0) {
                        return null;
                    }
                    ref_status_list[key].forEach(status => {
                        if (status.includes(chara_id)) {
                            results.push(status.replace(chara_id, ""));
                        }
                    });
                })
                let strClassName = "status " + (results.includes("str") ? "status_active" : "");
                let dexClassName = "status " + (results.includes("dex") ? "status_active" : "");
                let conClassName = "status " + (results.includes("con") ? "status_active" : "");
                let mndClassName = "status " + (results.includes("mnd") ? "status_active" : "");
                let intClassName = "status " + (results.includes("int") ? "status_active" : "");
                let lukClassName = "status " + (results.includes("luk") ? "status_active" : "");
                let sp_cost = chara_sp_list[chara_id] ? chara_sp_list[chara_id] : 0;
                return (
                    <div key={`chara_no${index}`} >
                        <select className="limit" value={limit} onChange={(e) => { changeLimitCount(index, e.target.value) }}>
                            {rarity == 1 ?
                                Array.from({ length: 5 }, (_, i) => (
                                    <option value={i} key={`limit_${i}`}>{i}</option>
                                ))
                                : null
                            }
                            {rarity == 2 ? <option value="10">10</option> : null}
                            {rarity == 3 ? <option value="20">20</option> : null}
                        </select>
                        <input className={strClassName} value={str} id={`str_${chara_id}`} type="number" onChange={(e) => { changeStatus(index, "str", e.target.value) }} />
                        <input className={dexClassName} value={dex} id={`dex_${chara_id}`} type="number" onChange={(e) => { changeStatus(index, "dex", e.target.value) }}/>
                        <input className={conClassName} value={con} id={`con_${chara_id}`} type="number" onChange={(e) => { changeStatus(index, "con", e.target.value) }}/>
                        <input className={mndClassName} value={mnd} id={`mnd_${chara_id}`} type="number" onChange={(e) => { changeStatus(index, "mnd", e.target.value) }}/>
                        <input className={intClassName} value={int} id={`int_${chara_id}`} type="number" onChange={(e) => { changeStatus(index, "int", e.target.value) }}/>
                        <input className={lukClassName} value={luk} id={`luk_${chara_id}`} type="number" onChange={(e) => { changeStatus(index, "luk", e.target.value) }}/>
                        <select className="jewel" value={jewel} onChange={(e) => { changeJewelLv(index, e.target.value) }}>
                            {Array.from({length: 6 }, (_, i) => (
                                <option value={i} key={`jewel_${i}`}>{i}</option>
                            ))}
                        </select>
                        <select className="token" defaultValue="0" id={`token_${chara_id}`}>
                            {Array.from({length: 11 }, (_, i) => (
                                <option value={i} key={`token_${i}`}>{i}</option>
                            ))}
                        </select>
                        <label id={`sp_cost_${index}`}>{sp_cost}</label>
                    </div>
                )
            }
            )}
        </>
    )
};

$(function () {
    const rootElement = document.getElementById('chara_status');
    ReactDOM.createRoot(rootElement).render(<CharaStatus />);
});