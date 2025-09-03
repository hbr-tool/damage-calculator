import React, { useState } from 'react';
import styleList from 'data/styleList';
import { getCharaData } from "utils/common";
import thumbnail from 'assets/thumbnail';
import troop from 'assets/troop';
import ReactModal from "react-modal";
import ModalDownload from './ModalDownload';

// 比較関数
export function compare(a, b) {
    var r = 0;
    if (a.chara_id < b.chara_id) { r = -1; }
    else if (a.chara_id > b.chara_id) { r = 1; }
    return r;
}

// 保存
function saveLocalStrage(styleId, select) {
    localStorage.setItem(`style_has_${styleId}`, select);
}

// 読み出し
function loadLocalStrage(styleId) {
    return localStorage.getItem(`style_has_${styleId}`) || "0";
}

const TROOP_LIST = {
    "31A": "DioramaStamp31a", "31B": "DioramaStamp31b", "31C": "DioramaStamp31c",
    "31D": "DioramaStamp31d", "31E": "DioramaStamp31e", "31F": "DioramaStamp31f", "31X": "DioramaStamp31x",
    "30G": "DioramaStamp30g", "SRP": "seraphIcon", "AB!": "angelbeats"
};

const StyleChecker = () => {
    let ssStyleList = styleList.filter(function (style) {
        return style.rarity === 1 || style.rarity === 0;
    });
    ssStyleList.sort(compare);

    const [update, setUpdate] = useState(0);
    const [target, setTarget] = useState("all");

    const selectCount = ssStyleList.filter(style => loadLocalStrage(style.style_id) === "1").length;
    // 小数点以下2位切り捨て
    let rateComplate = Math.floor(selectCount / ssStyleList.length * 1000) / 10;

    const handleCStyleClick = (styleId, select) => {
        let newSelect = select === "1" ? "0" : "1";
        saveLocalStrage(styleId, newSelect)
        setUpdate(update + 1);
    }

    const handleSelectClick = (select) => {
        ssStyleList.forEach((style) => {
            saveLocalStrage(style.style_id, select);
        })
        setUpdate(update + 1);
    }

    const handlePostClick = () => {
        let message = `私のSSスタイル所持率は\r\n${selectCount}/${ssStyleList.length}(コンプリート率${rateComplate}%)です。\r\n`;
        shareOnTwitter(message);
    }
    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    return (
        <div>
            <div className="checker_frame static overflow-y-scroll">
                <div className="checker_main_area mx-auto">
                    <div className="text-left float-left flex">
                        <div>
                            <div>
                                <input
                                    type="radio"
                                    id="check_style_all"
                                    name="target"
                                    value="all"
                                    checked={target === "all"}
                                    onChange={() => setTarget("all")}
                                />
                                <label className="text-base" htmlFor="check_style_all">
                                    全てのスタイル
                                </label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="check_style_has"
                                    name="target"
                                    value="has"
                                    checked={target === "has"}
                                    onChange={() => setTarget("has")}
                                />
                                <label className="text-base" htmlFor="check_style_has">
                                    所持スタイルのみ
                                </label>
                            </div>
                        </div>
                        <input
                            className="mt-2 mb-2"
                            defaultValue="画像出力"
                            id="openModalBtn"
                            type="button"
                            onClick={openModal}
                        />
                    </div>
                    <div className="text-right">
                        <input
                            className="w-16 mt-2 mb-2"
                            defaultValue="全選択"
                            type="button"
                            onClick={() => handleSelectClick("1")}
                        />
                        <input
                            className="w-16 mt-2 mb-2"
                            defaultValue="全解除"
                            type="button"
                            onClick={() => handleSelectClick("0")}
                        />
                    </div>
                    {Object.keys(TROOP_LIST).map(key => {
                        let filterList = ssStyleList.filter((style) => {
                            let charaData = getCharaData(style.chara_id);
                            return (charaData.troops === key);
                        })
                        return (<div className="checker_troops" key={`troops_${key}`}>
                            <input className="emblem" src={troop[TROOP_LIST[key]]} alt={TROOP_LIST[key]} type="image" />
                            <div className="flex flex-wrap">
                                {filterList.map((style) => {
                                    let charaData = getCharaData(style.chara_id);
                                    const imageName = style.image_url.replace(/\.(webp)$/, '');
                                    const icon = thumbnail[imageName];
                                    const select = loadLocalStrage(style.style_id);
                                    let opacity = select === "1" ? 1 : 0.3;

                                    return (<img className="select_style_list" loading="lazy" id={`style_${style.style_id}`}
                                        alt={`[${style.style_name}]${charaData.chara_name}`}
                                        src={icon} title={`[${style.style_name}]${charaData.chara_name}`} key={`style_${style.style_id}`}
                                        style={{ opacity: opacity }}
                                        onClick={(e) => { handleCStyleClick(style.style_id, select) }}
                                    />)
                                })}
                            </div>
                        </div>)
                    })}
                </div>
            </div>
            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className={"modal-content " + (modalIsOpen ? "modal-content-open" : "")}
                overlayClassName={"modal-overlay " + (modalIsOpen ? "modal-overlay-open" : "")}
            >
                <ModalDownload target={target} />
            </ReactModal>
            <div className='mt-2'>
                <div className="w-[300px] mx-auto text-center">
                    <div className="flex text-2xl font-bold">
                        <div className="w-48">所持数</div>
                        <div className="flex">
                            <span className="text-red-700 text-3xl">{selectCount}</span>
                            <div calss="text-3xl">/</div>
                            <span className="mt-1">{ssStyleList.length}</span>
                        </div>
                    </div>
                    <div className="flex text-2xl font-bold">
                        <div className="w-48">コンプリート率</div>
                        <span className="text-center w-24">{rateComplate}%</span>
                    </div>
                    <input
                        className="btn_post mt-2 mb-2 default"
                        defaultValue="結果を𝕏にPOST"
                        type="button"
                        onClick={() => handlePostClick()}
                    />
                </div>
            </div>
        </div>
    );
}
export default StyleChecker;

// Twitter起動
function shareOnTwitter(message) {
    const encodedMessage = encodeURIComponent(message);
    const hashtags = encodeURIComponent("ヘブバン,ヘブバンスタイル所持率チェッカー");
    const url = encodeURIComponent(window.location.href);

    // モバイルの場合は intent を使う
    let twitterURL = window.matchMedia('(max-width: 767px)').matches
        ? 'https://twitter.com/intent/tweet?text='
        : 'https://twitter.com/share?text=';

    twitterURL += `${encodedMessage}&hashtags=${hashtags}&url=${url}`;

    // <a>タグを作成して自動クリック
    const link = document.createElement('a');
    link.href = twitterURL;
    link.target = '_blank';
    link.style.display = 'none'; // ユーザーに見せない

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}