import React from "react";
import styleList from 'data/styleList';
import selectImg from 'assets/select';

const ModalDownload = ({ target }) => {
    const [imageColumns, setImageColumns] = React.useState(4);

    const handleDownloadClick = () => {
        let createStyle = styleList.filter(function (style) {
            let select = localStorage.getItem("style_has_" + style.style_id);
            return (style.rarity === 1 || style.rarity === 0) && (target === "all" || select === "1");
        });
        combineImagesWithHatching(createStyle, imageColumns);
    };
    return (
        <div className="p-6 text-center">
            <label className="font-bold">ダウンロード設定</label>
            <br />
            <div className="mt-3" id="download_area">
                表示列数
                <select value={imageColumns} onChange={(e) => setImageColumns(e.target.value)}>
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                    <option value="10">10</option>
                </select>
                <div>
                    <input
                        className="btn_download mt-2"
                        defaultValue="ダウンロード"
                        id="downloadBtn"
                        type="button"
                        onClick={() => handleDownloadClick()}
                    />
                </div>
            </div>
        </div>
    );
};

export default ModalDownload;

// 画像を生成して Canvas に描画する関数
function combineImagesWithHatching(createStyle, columns) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const rows = Math.ceil(createStyle.length / columns);

    const scaledWidth = 376 / 2;
    const scaledHeight = 144 / 2;

    canvas.width = scaledWidth * columns;
    canvas.height = scaledHeight * rows;

    const promises = [];

    createStyle.forEach((value, index) => {
        const img = document.createElement('img');
        const select = localStorage.getItem("style_has_" + value.style_id);

        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                context.drawImage(img, col * scaledWidth, row * scaledHeight, scaledWidth, scaledHeight);
                if (select !== "1") {
                    drawHatching(context, col * scaledWidth, row * scaledHeight, scaledWidth, scaledHeight);
                }
                resolve();
            };
            img.onerror = reject;
            img.src = selectImg[value.image_url.replace("Thumbnail", "Select").replace(/\.(webp)$/, '')];
        });
        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        const downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL();
        downloadLink.download = 'style_list.png';
        downloadLink.click();
    });
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
