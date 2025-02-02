const SettingAreaComponent = ({ }) => {
    // 敵選択
    let enemy_class = localStorage.getItem("enemy_class");
    enemy_class = enemy_class ? enemy_class : "1";
    let enemy_select = localStorage.getItem("enemy_select");
    enemy_select = enemy_select ? enemy_select : "1";

    // 上書き確認
    let is_overwrite = localStorage.getItem("is_overwrite");
    is_overwrite = is_overwrite == "true" ? true : false;

    const changeOverwrite = (e) => {
        is_overwrite = e.target.checked;
        localStorage.setItem("is_overwrite", e.target.checked);
    }

    const startBattle = () => {
        for (let i = 0; i < select_style_list.length; i++) {
            let style = select_style_list[i]?.style_info;
            if (NOT_USE_STYLE.includes(style?.style_id)) {
                let chara_data = getCharaData(style.chara_id);
                alert(`[${style.style_name}]${chara_data.chara_name}は現在使用できません。`);
                return;
            }
        };
        // 後衛が居る場合、前衛に空き不可
        const hasBlankFront = select_style_list.some(function (style, index) {
            return style === undefined && index <= 2
        });
        const hasBack = select_style_list.some(function (style, index) {
            return style !== undefined && index >= 3
        });
        if (hasBlankFront && hasBack) {
            alert("後衛がいるとき 前衛には3名必要です");
            return;
        }

        if (is_overwrite) {
            if (turn_list.length > 0 && !confirm("現在の結果が消えますが、よろしいですか？")) {
                return;
            }
        }
        procBattleStart();
    };

    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    return (
        <div className="top_area">
            <div className="unit_setting_area">
                <input className="w-20" defaultValue="注意事項" role="button" type="button"
                    onClick={openModal} />
                <CharaSettingComponent />
            </div>
            <div>
                <EnemyAreaComponent enemy_class={enemy_class} enemy_select={enemy_select} />
                <DetailSettingComponent />
            </div>
            <div className="flex justify-center mt-2 text-sm">
                <input id="is_overwrite" type="checkbox" onChange={(e) => { changeOverwrite(e) }} defaultChecked={is_overwrite} />
                <label className="checkbox01 text-sm" htmlFor="is_overwrite">
                    上書き確認
                </label>
                <input className="battle_start" defaultValue="戦闘開始" type="button" onClick={startBattle} />
            </div>
            <div>
                <ReactModal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className={"modal-content modal-wide " + (modalIsOpen ? "modal-content-open" : "")}
                    overlayClassName={"modal-overlay " + (modalIsOpen ? "modal-overlay-open" : "")}
                >
                    <Explanation />
                </ReactModal>
            </div>
        </div>
    )
};

$(function () {
    const rootElement = document.getElementById('setting_area');
    ReactDOM.createRoot(rootElement).render(<SettingAreaComponent />);
});