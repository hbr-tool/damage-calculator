
const { DragDropContext, Droppable, Draggable } = window["ReactBeautifulDnd"];
const CharaSetting = () => {
    const BRACELET_LIST = ["無し", "火撃", "氷撃", "雷撃", "光撃", "闇撃"];
    const EARRING_LIST = [10, 12, 15];

    const { styleList, setStyleList, loadMember, removeMember } = useStyleList();

    // 設定変更
    const setSetting = (place_no, item, value) => {
        const updatedStyleList = [...styleList.selectStyleList];
        updatedStyleList[place_no] = {
            ...updatedStyleList[place_no], 
            [item]: Number(value)
        };
        setStyleList({ ...styleList, selectStyleList: updatedStyleList });
    }

    // リセットボタン押下
    const resetStyle = () => {
        styleList.selectStyleList.forEach((style, index) => {
            localStorage.removeItem(`troops_${styleList.selectTroops}_${index}`);
        })
        setStyleList({ ...styleList, selectStyleList: Array(6).fill(undefined) });
    }

    // 部隊変更
    const changeTroops = (e) => {
        if (e.target.value == styleList.selectTroops) {
            return;
        }
        const updatedStyleList = [...styleList.selectStyleList];
        updatedStyleList.forEach((style, index) => {
            removeMember(index);
        })
        let select_troops = e.target.value;
        localStorage.setItem('select_troops', select_troops);
        loadMember(select_troops);
    }

    // メンバー更新
    // window.updateMember = function () {
    //     setSelectStyle([...select_style_list]);
    // }

    // メンバー入れ替え
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const updatedStyleList = [...styleList.selectStyleList];
        const [removed] = updatedStyleList.splice(result.source.index, 1);
        updatedStyleList.splice(result.destination.index, 0, removed);

        updatedStyleList.forEach((style, index) => {
            let style_id = null;
            if (style) {
                style_id = style.style_info.style_id;
            }
            localStorage.setItem(`troops_${select_troops}_${index}`, style_id);
        })

        setStyleList({ ...styleList, selectStyleList: updatedStyleList });
    };

    // スキルリストの表示    
    const showSkillList = (index) => {
        openModal(index, "skill");
    };

    const [modalSetting, setModalSetting] = React.useState({
        isOpen: false,
        modalIndex: -1,
        modalType: null,
    });

    const openModal = (index, type) => setModalSetting({ isOpen: true, modalIndex: index, modalType: type, });
    const closeModal = () => setModalSetting({ isOpen: false });

    return (
        <div className="grid grid-cols-7 text-center gap-y-px gap-x-0" id="chara_setting">
            <label className="mt-3 mb-3 small_font">部隊選択</label>
            <div className="col-span-6 flex">
                {Array.from({ length: 9 }, (_, i) => {
                    let className = "troops_btn " + (i === Number(styleList.selectTroops) ? "selected_troops" : "")
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
                                {styleList.selectStyleList.map((style, index) => {
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
                                                    <StyleIcon style={style} place_no={index} onClick={() => { openModal(index, "style") }} />
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
                <label className="label_status text-xs leading-6 whitespace-nowrap">ドライブピアス</label>
                <label className="label_status text-xs leading-5 whitespace-nowrap">ブレスレット</label>
                <label className="label_status">チェーン</label>
                <label className="label_status">初期SP</label>
                <label className="label_status">スキル</label>
            </div>
            {styleList.selectStyleList.map((value, index) => {
                let style = value;
                let rarity = style ? style.style_info.rarity : 1;
                let bracelet = style ? style.bracelet : 0;
                let chain = style ? style.chain : 0;
                let earring = style ? style.earring : 0;
                let init_sp = style ? style.init_sp : 1;
                let limit = style ? style.limit_count : 0;

                return (
                    <div key={`chara_no${index}`} >
                        <select className="limit" value={limit} onChange={(e) => { setSetting(index, "limit_count", e.target.value) }}>
                            {rarity == 1 ?
                                Array.from({ length: 5 }, (_, i) => (
                                    <option value={i} key={`limit_${i}`}>{i}</option>
                                ))
                                : null
                            }
                            {rarity == 2 ? <option value="10">10</option> : null}
                            {rarity == 3 ? <option value="20">20</option> : null}
                        </select>
                        <select className="earring" value={earring} onChange={(e) => { setSetting(index, "earring", e.target.value) }}>
                            <option value="0">無し</option>
                            {EARRING_LIST.map((value, index) => (
                                <option value={value} key={`earring_${index}`}>{value}%</option>
                            ))}
                        </select>
                        <select className="bracelet" value={bracelet} onChange={(e) => { setSetting(index, "bracelet", e.target.value) }}>
                            {BRACELET_LIST.map((value, index) => (
                                <option value={index} key={`bracelet_${index}`}>{value}</option>
                            ))}
                        </select>
                        <select className="chain" value={chain} onChange={(e) => { setSetting(index, "chain", e.target.value) }}>
                            {Array.from({ length: 4 }, (_, i) => (
                                <option value={i} key={`chain_${i}`}>SP+{i}</option>
                            ))}
                        </select>
                        <input className="init_sp" value={init_sp} type="number" onChange={(e) => { setSetting(index, "init_sp", e.target.value) }} />
                        <input className="passive" data-chara_no="0" defaultValue="設定" type="button" onClick={() => showSkillList(index)} />
                    </div>
                )
            }
            )}
            <div>
                <ReactModal
                    isOpen={modalSetting.isOpen}
                    onRequestClose={closeModal}
                    className={"modal-content modal-narrwow " + (modalSetting.isOpen ? "modal-content-open" : "")}
                    overlayClassName={"modal-overlay " + (modalSetting.isOpen ? "modal-overlay-open" : "")}
                >
                    {
                        modalSetting.modalType == "skill" ?
                            <ModalSkillSelectList index={modalSetting.modalIndex} closeModal={closeModal} />
                            :
                            <ModalStyleSelection index={modalSetting.modalIndex} closeModal={closeModal} />
                    }
                </ReactModal>
            </div>
        </div>
    )
};
