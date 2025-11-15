import React, { useState } from "react";
import ReactModal from "react-modal";
import { useStyleList } from "components/StyleListProvider";
import ModalSkillSelectList from "components/ModalSkillSelectList";
import ModalStyleSelection from "components/ModalStyleSelection";
import StyleIcon from "components/StyleIcon";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const CharaSetting = ({ setSettingUpdate }) => {
    const BRACELET_LIST = ["無し", "火撃", "氷撃", "雷撃", "光撃", "闇撃"];
    const EARRING_LIST = [10, 12, 15];

    const { styleList, setStyleList, loadTroops, setMember, removeMember } = useStyleList();

    // 設定変更
    const setSetting = (index, item, value) => {
        if (styleList.selectStyleList[index]) {
            const updatedStyleList = [...styleList.selectStyleList];
            updatedStyleList[index] = {
                ...updatedStyleList[index],
                [item]: Number(value)
            };
            setStyleList({ ...styleList, selectStyleList: updatedStyleList });
        }
    }

    // リセットボタン押下
    const resetStyle = () => {
        styleList.selectStyleList.forEach((style, index) => {
            localStorage.removeItem(`troops_${styleList.selectTroops}_${index}`);
        })
        setSettingUpdate(false);
        setStyleList({ ...styleList, selectStyleList: Array(6).fill(undefined) });
    }

    // 部隊変更
    const changeTroops = (e) => {
        if (e.target.value === styleList.selectTroops) {
            return;
        }
        const updatedStyleList = [...styleList.selectStyleList];
        updatedStyleList.forEach((style, index) => {
            removeMember(index);
        })
        let selectTroops = e.target.value;
        localStorage.setItem('select_troops', selectTroops);
        loadTroops(selectTroops);
        setSettingUpdate(false);
    }

    // メンバー入れ替え
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const updatedStyleList = [...styleList.selectStyleList];
        const [removed] = updatedStyleList.splice(result.source.index, 1);
        updatedStyleList.splice(result.destination.index, 0, removed);

        updatedStyleList.forEach((style, index) => {
            let style_id = null;
            if (style) {
                style_id = style.styleInfo.style_id;
            }
            localStorage.setItem(`troops_${styleList.selectTroops}_${index}`, style_id);
        })

        setStyleList({ ...styleList, selectStyleList: updatedStyleList });
    };

    // スキルリストの表示    
    const showSkillList = (index) => {
        if (styleList.selectStyleList[index]) {
            openModal(index, "skill");
        }
    };

    const [modalSetting, setModalSetting] = useState({
        isOpen: false,
        modalIndex: -1,
        modalType: null,
    });

    const openModal = (index, type) => setModalSetting({ isOpen: true, modalIndex: index, modalType: type, });
    const closeModal = () => setModalSetting({ isOpen: false });

    const [narrowStyle, setNarrowStyle] = useState({
        physical: null,
        element: null,
        role: null,
        rarity: [true, true, false, false],
        target: "none",
        buff_1: -1,
        buff_2: -1,
        buff_3: -1,
    });

    const clickSetMember = (index, style_id) => {
        setMember(index, style_id);
        localStorage.setItem(`troops_${styleList.selectTroops}_${index}`, style_id);
        setSettingUpdate(false);
        closeModal();
    }

    const clickRemoveMember = (index) => {
        localStorage.removeItem(`troops_${styleList.selectTroops}_${index}`);
        removeMember(index);
        setSettingUpdate(false);
        closeModal();
    }

    return (
        <div className="grid grid-cols-7 text-center gap-y-px gap-x-0" id="chara_setting">
            <span className="mt-3 mb-3 small_font">部隊選択</span>
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
                <span className="small_font">スタイル</span>
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
                                                    <StyleIcon styleId={style?.styleInfo.style_id} placeNo={index} onClick={() => { openModal(index, "style") }} />
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
                <span className="label_status">限界突破</span>
                <span className="label_status text-xs leading-6 whitespace-nowrap">ドライブピアス</span>
                <span className="label_status text-xs leading-5 whitespace-nowrap">ブレスレット</span>
                <span className="label_status">チェーン</span>
                <span className="label_status">初期SP</span>
                <span className="label_status">初期士気</span>
                <span className="label_status">スキル</span>
            </div>
            {styleList.selectStyleList.map((value, index) => {
                let style = value;
                let rarity = style ? style.styleInfo.rarity : 1;
                let bracelet = style ? style.bracelet : 0;
                let chain = style ? style.chain : 0;
                let earring = style ? style.earring : 0;
                let initSp = style ? style.initSp : 1;
                let limit = style ? style.limitCount : 0;
                let morale = style ? style.morale ? style.morale : 0 : 0;

                return (
                    <div key={`chara_no${index}`} >
                        <select className="status" value={limit} onChange={(e) => { setSetting(index, "limitCount", e.target.value) }}>
                            {rarity <= 1 || rarity === 9 ?
                                Array.from({ length: 5 }, (_, i) => (
                                    <option value={i} key={`limit_${i}`}>{i}</option>
                                ))
                                : null
                            }
                            {rarity === 2 ? <option value="10">10</option> : null}
                            {rarity === 3 ? <option value="20">20</option> : null}
                        </select>
                        <select className="status" value={earring} onChange={(e) => { setSetting(index, "earring", e.target.value) }}>
                            <option value="0">無し</option>
                            {EARRING_LIST.map((value, index) => (
                                <option value={value} key={`earring_${index}`}>{value}%</option>
                            ))}
                        </select>
                        <select className="status" value={bracelet} onChange={(e) => { setSetting(index, "bracelet", e.target.value) }}>
                            {BRACELET_LIST.map((value, index) => (
                                <option value={index} key={`bracelet_${index}`}>{value}</option>
                            ))}
                        </select>
                        <select className="status" value={chain} onChange={(e) => { setSetting(index, "chain", e.target.value) }}>
                            {Array.from({ length: 4 }, (_, i) => (
                                <option value={i} key={`chain_${i}`}>SP+{i}</option>
                            ))}
                        </select>
                        <input className="status" value={initSp} type="number" onChange={(e) => { setSetting(index, "initSp", e.target.value) }} />
                        <select className="status" value={morale} onChange={(e) => { setSetting(index, "morale", e.target.value) }}>
                            {Array.from({ length: 11 }, (_, i) => (
                                <option value={i} key={`morale_${i}`}>{i}</option>
                            ))}
                        </select>
                        <input className="status" defaultValue="設定" type="button" onClick={() => showSkillList(index)} />
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
                        modalSetting.modalType === "skill" ?
                            <ModalSkillSelectList index={modalSetting.modalIndex} closeModal={closeModal} />
                            :
                            <ModalStyleSelection index={modalSetting.modalIndex} closeModal={closeModal}
                                narrowStyle={narrowStyle} setNarrowStyle={setNarrowStyle}
                                clickSetMember={clickSetMember} clickRemoveMember={clickRemoveMember} />
                    }
                </ReactModal>
            </div>
        </div>
    )
};

export default CharaSetting;