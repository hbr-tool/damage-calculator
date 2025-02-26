const BattleAreaComponent = () => {
    const [key, setKey] = React.useState(0);

    const [updatedTurnIndexList, setUpdatedTurnIndexList] = React.useState([]);

    const [hideMode, setHideMode] = React.useState(false);

    const [isCapturing, setIsCapturing] = React.useState(false);  // キャプチャ中の状態を管理
    const elementRef = React.useRef(null); // キャプチャ対象の要素参照

    window.startBattle = () => {
        setKey(key + 1);
    }
    window.updateTurnList = (last_turn) => {
        setUpdatedTurnIndexList(last_turn)
    };

    const clickDownload = async () => {
        if (!elementRef.current) return;

        setIsCapturing(true); // キャプチャ前に表示切替
        try {
            const element = elementRef.current;
            const children = Array.from(element.children);
            const images = await captureChildren(children); // 子要素をキャプチャ
            // 画像を結合
            const finalImage = await mergeImages(images);
            // ダウンロード処理
            downloadImage(finalImage);
        } catch (error) {
            alert("画像生成に失敗しました");
        } finally {
            setIsCapturing(false); // キャプチャ後に元に戻す
        }
    };
    // 子要素をキャプチャして画像データを返す関数
    const captureChildren = async (children) => {
        const images = [];
        for (let child of children) {
            try {
                const imgData = await domtoimage.toPng(child);
                images.push(imgData);
            } catch (error) {
                console.error("画像キャプチャに失敗しました", error);
            }
        }
        return images;
    };

    // 画像をダウンロードする処理
    const downloadImage = (finalImage) => {
        const link = document.createElement("a");
        link.href = finalImage;
        link.download = "capture.png";
        link.click();
    };

    // 画像を結合する関数
    const mergeImages = async (imageDataArray) => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // 画像をすべて読み込む
            Promise.all(imageDataArray.map(src => new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
            }))).then(images => {
                if (images.length === 0) return resolve("");

                const width = images[0].width;
                const totalHeight = images.reduce((sum, img) => sum + img.height, 0) + 3 * (images.length + 1); // 3pxの隙間を追加

                canvas.width = width;
                canvas.height = totalHeight;
                // 背景色を白に設定
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                let offsetY = 3;
                images.forEach((img) => {
                    ctx.drawImage(img, 0, offsetY, img.width, img.height);
                    offsetY += img.height + 3; 
                });

                resolve(canvas.toDataURL("image/png"));
            });
        });
    };

    const changeHideMode = (e) => {
        const hideMode = e.target.checked;
        if (hideMode) {
            $("#setting_area").addClass("hidden");
        } else {
            $("#setting_area").removeClass("hidden");
        }
        setHideMode(hideMode);
    }

    let display_class = hideMode ? "hide_mode " : "show_mode";

    const [modal, setModa] = React.useState({
        isOpen: false,
        mode: ""
    });
    const openModal = (mode) => setModa({ isOpen: true, mode: mode });
    const closeModal = () => setModa({ isOpen: false, mode: "" });

    ReactModal.setAppElement("#root"); // ここを追加

    return (
        <>
            {turn_list.length == 0 ?
                <input type="button" id="btnLoad" value="読込" onClick={() => openModal("load")} />
                :
                <div className={display_class}>
                    <div className="flex justify-between mt-1">
                        <div className="flex mode_button">
                            <input type="checkbox" className="switch" id="mode_switch" onChange={(e) => changeHideMode(e)} /><label htmlFor="mode_switch">設定画面を隠す</label>
                        </div>
                        <div>
                            <input type="button" id="btnSave" value="保存" onClick={() => openModal("save")} />
                            <input type="button" id="btnLoad" value="読込" onClick={() => openModal("load")} />
                            <input type="button" id="btnDownload" value="画像として保存" onClick={clickDownload} />
                        </div>
                    </div>
                    <div id="battle_display" className="text-left" ref={elementRef}>
                        {turn_list.map((turn, index) => {
                            return <TurnDataComponent turn={turn} index={index} key={`turn${index}-${key}`} is_last_turn={seq_last_turn == index} hideMode={hideMode} isCapturing={isCapturing} />
                        })}
                    </div>
                </div>
            }
            {
                modal.isOpen ?
                    <ReactModal
                        isOpen={modal.isOpen}
                        onRequestClose={closeModal}
                        className={"modal-content modal-narrwow " + (modal.isOpen ? "modal-content-open" : "")}
                        overlayClassName={"modal-overlay " + (modal.isOpen ? "modal-overlay-open" : "")}
                    >
                        <SaveLoadComponent mode={modal.mode} handleClose={closeModal} />
                    </ReactModal>
                    : null
            }
        </>
    )
};

$(function () {
    const rootElement = document.getElementById('battle_area');
    ReactDOM.createRoot(rootElement).render(<BattleAreaComponent />);
});