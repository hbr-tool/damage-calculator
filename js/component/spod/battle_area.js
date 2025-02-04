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

    const clickDownload = () => {
        setIsCapturing(true); // キャプチャ前に表示切替
        setTimeout(() => {
            domtoimage.toPng(elementRef.current)
                .then(dataUrl => {
                    const link = document.createElement("a");
                    link.href = dataUrl;
                    link.download = "capture.png";
                    link.click();
                })
                .catch(error => console.error("Error capturing image", error))
                .finally(() => setIsCapturing(false)); // キャプチャ後に元に戻す
        }, 100);  // DOMの更新が反映されるまで少し待つ
    }

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
                    <div className="flex justify-between">
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
                            return <TurnDataComponent turn={turn} index={index} key={`turn${index}-${key}`} is_last_turn={seq_last_turn == index} hideMode={hideMode} isCapturing={isCapturing}/>
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
                        <div>
                            <label className="modal_label">データ選択</label>
                        </div>
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