import React, { useState } from 'react';
import artsList from 'data/artsList';
import artsImage from 'assets/arts';

const TROOPS_LIST = ["31A", "31B", "31C", "31D", "31E", "31F", "31X", "30G"];
const SHOW_TROOPS_LIST = {
    "0": TROOPS_LIST,
    "2": ["31A", "31B", "31C", "31E"],
    "3": ["31A", "31B", "31C", "31F"],
    "4": ["31A", "31D", "31E", "31F"],
    "6": ["31A", "31E", "31F", "31X"],
    "7": ["31A", "31D", "31X", "30G"],
}
const MAX_TROOPS_ARTS_COUNT = 24;
const TROOPS_ARTS_COUNT = {
    "31A": 4,
    "31B": 3,
    "31C": 3,
    "31D": 3,
    "31E": 3,
    "31F": 3,
    "31X": 3,
    "30G": 3,
}
// 保存
function saveLocalStrage(troops, artsSelect) {
    localStorage.setItem("arts_select_" + troops, artsSelect.join(','));
}

const ArtsList = () => {
    const [update, setUpdate] = useState(0);
    const [showArts, setShowArts] = useState("0");
    const troopList = SHOW_TROOPS_LIST[showArts];

    const handleCArtsClick = (troops, artsSplit, index, select) => {
        let newSelect = select === "1" ? "0" : "1";
        artsSplit[index] = newSelect;
        saveLocalStrage(troops, artsSplit)
        setUpdate(update + 1);
    }

    const handleSelectClick = (select) => {
        troopList.forEach((troops) => {
            let artsSplit = Array(TROOPS_ARTS_COUNT[troops] * 6).fill(select);
            saveLocalStrage(troops, artsSplit);
        });
        setUpdate(update + 1);
    }

    return (
        <div className="arts_frame static h-screen overflow-y-scroll">
            <div className="flex">
                <div className="main_area mx-auto">
                    <div className="text-left float-left flex">
                        <input type="button" className="mt-2 mb-2 default" value="画像ダウンロード"
                            onClick={() => combineImagesWithHatching(SHOW_TROOPS_LIST[showArts])}
                        />
                    </div>
                    <div className="text-right">
                        <input type="button" className="w-16 mt-2 mb-2 default" value="全選択"
                            onClick={() => handleSelectClick("1")}
                        />
                        <input type="button" className="w-16 mt-2 mb-2 default" value="全解除"
                            onClick={() => handleSelectClick("0")}
                        />
                    </div>
                    <div className="clear-left flex">
                        <div className="flex text-2xl font-bold">
                            <div className="w-32">デッキ枚数</div>
                            <label className="text-center w-12" id="deck_count" />
                        </div>
                        <select
                            className="border border-black text-lg font-bold" value={showArts}
                            onChange={(e) => { setShowArts(e.target.value); }}>
                            <option value="0">全数</option>
                            <option value="2">ENDLESSシーズン2</option>
                            <option value="3">ENDLESSシーズン3</option>
                            <option value="4">ENDLESSシーズン4,5</option>
                            <option value="6">ENDLESSシーズン6</option>
                            <option value="7">ENDLESSシーズン7</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2">
                        {troopList.map((troopId) => {
                            const troopArtsList = artsList.filter((arts) => arts.troops === troopId)
                            let artsSelect = localStorage.getItem("arts_select_" + troopId);
                            return (
                                <div key={troopId} className="bg-black" style={{ lineHeight: "0px" }}>
                                    {troopArtsList.map((arts, index) => {
                                        let artsSplit = artsSelect ? artsSelect.split(",") : [];
                                        const isSelected = artsSplit[index];
                                        let opacity = isSelected === "1" ? 1 : 0.3;
                                        return (
                                            <input type="image" key={arts.image_url}
                                                src={artsImage[arts.image_url]} className="select_arts"
                                                style={{ opacity: opacity }}
                                                alt={arts.image_url}
                                                onClick={() => { handleCArtsClick(troopId, artsSplit, index, isSelected) }}
                                            />
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
            <br />
            <br />
        </div>
    );
}
export default ArtsList;

function combineImagesWithHatching(showList) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    // Canvas サイズを設定
    const separate = 5;
    const columns = 12;

    const rows = getRowSize(showList);

    // 画像の横幅と高さを半分に縮小
    const scaledWidth = Math.floor(512 / 4);
    const scaledHeight = Math.floor(702 / 4);

    canvas.width = scaledWidth * columns + separate * 3;
    canvas.height = scaledHeight * rows + separate * 3;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let artsSelectList = {};
    for (const value of showList) {
        const artsSelect = localStorage.getItem(`arts_select_${value}`);
        if (artsSelect) {
            artsSelectList[value] = artsSelect.split(',');
        } else {
            artsSelectList[value] = Array(MAX_TROOPS_ARTS_COUNT).fill(0);
        }
    }

    const promises = [];

    artsList.forEach((arts) => {
        if (!showList.includes(arts.troops)) {
            return true;
        }
        const img = new Image();
        const idx = (Number(arts.rarity) - 1) * 6 + Number(arts.chara_id) - 1;
        const select = artsSelectList[arts.troops][idx];

        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                const [row, col] = getRowColumn(showList, arts.troops, Number(arts.rarity), Number(arts.chara_id));
                const adjustRow = (Math.floor(row / 4) + 1) * separate;
                const adjustCol = (Math.floor(col / 6) + 1) * separate;

                context.drawImage(
                    img, col * scaledWidth + adjustCol, row * scaledHeight + adjustRow, scaledWidth, scaledHeight
                );
                // 未所持の場合網掛けを描画
                if (select !== "1") {
                    drawHatching(
                        context, col * scaledWidth + adjustCol, row * scaledHeight + adjustRow,
                        scaledWidth, scaledHeight
                    );
                }
                resolve();
            };
            img.onerror = reject;
            img.src = artsImage[arts.image_url];
        });

        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        const downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL();
        downloadLink.download = 'arts_deck.png';
        downloadLink.click();
    });
}


// 画像の行サイズ取得
function getRowSize(showList) {
    let stage = 0;
    let add = 0;
    showList.forEach((value, index) => {
        if (index % 2 === 0) {
            add = TROOPS_ARTS_COUNT[value];
        } else {
            add = add > TROOPS_ARTS_COUNT[value] ? add : TROOPS_ARTS_COUNT[value];
            stage += add;
            add = 0;
        }
    });
    return stage + add;
}

// 行と列の番号を計算する
function getRowColumn(showList, troops, rarity, chara_id) {
    let stage = 0;
    let mass = 0;

    let add = 0;
    for (let index = 0; index < showList.length; index++) {
        const value = showList[index];
        if (value === troops) {
            mass = index % 2;
            break;
        }

        if (index % 2 === 0) {
            add = TROOPS_ARTS_COUNT[value];
        } else {
            add = Math.max(add, TROOPS_ARTS_COUNT[value]);
            stage += add;
        }
    }

    let vertical = rarity - 1;
    let beside = chara_id - 1;

    let row = stage + vertical;
    let column = mass * 6 + beside;
    return [row, column];
}

// 網掛けを描画する関数
function drawHatching(context, pos_x, pos_y, width, height) {
    context.beginPath();
    for (var x = 0; x < width; x += 2) {
        context.moveTo(x + pos_x, pos_y);
        context.lineTo(x + pos_x, height + pos_y);
    }
    for (var y = 0; y < height; y += 2) {
        context.moveTo(pos_x, y + pos_y);
        context.lineTo(width + pos_x, y + pos_y);
    }
    context.strokeStyle = 'rgba(0, 0, 0, 1)';
    context.stroke();
}