const ModalSaveLoad = ({ mode, handleClose, turnList, loadData }) => {
    const NONE = "無し"
    const { styleList, setStyleList, setMember, saveMember, removeMember } = useStyleList();

    const handleClick = (i, name) => {
        if (mode == "save") {
            if (name == NONE) {
                name = "データ" + (i + 1);
            }
            let data_name = window.prompt("保存名称を入力してください", name);
            if (data_name === null) {
                return;
            }
            const userOperationList = turnList.map(turn => turn.user_operation);
            let save_data = {
                data_name: data_name,
                unit_data_list: convertUnitDataList(),
                user_operation_list: userOperationList,
            }
            let compress = compressString(JSON.stringify(save_data));
            localStorage.setItem(`sim_data_${i}`, compress);
            handleClose();
        } else if (mode == "load") {
            let jsonstr = localStorage.getItem(`sim_data_${i}`);
            loadSimData(jsonstr);
        }
    };

    const loadSimData = (jsonstr) => {
        let save_data = []
        if (jsonstr) {
            let ret = window.confirm("部隊情報が上書きされますが、よろしでしょうか？");
            if (!ret) {
                return;
            }
            handleClose();
            let decompress = decompressString(jsonstr)
            save_data = JSON.parse(decompress);
            loadData(save_data);
        }
    }

    // メンバー情報からユニットデータに変換
    function convertUnitDataList() {
        return styleList.selectStyleList.map((style) => {
            if (style) {
                return {
                    style_id: style.style_info.style_id,
                    limit_count: style.limit_count,
                    earring: style.earring,
                    bracelet: style.bracelet,
                    chain: style.chain,
                    init_sp: style.init_sp,
                    exclusion_skill_list: style.exclusion_skill_list,
                }
            }
        })
    }

    const loadStorage = (i) => {
        let item = localStorage.getItem(`sim_data_${i}`);
        if (item) {
            let decompress = decompressString(item)
            return JSON.parse(decompress);
        }
        return null;
    }

    // 出力クリック
    const chickOutput = () => {
        let save_data = {
            unit_data_list: convertUnitDataList(),
            user_operation_list: user_operation_list,
        }
        let compress = compressString(JSON.stringify(save_data));
        let filename = "sim_data.sav";
        downloadStringAsFile(compress, filename);
        handleClose();
    }

    // 読み込みクリック
    const chickRead = () => {
        readFileAsString(function (content) {
            loadSimData(content);
        });
    }

    // ダウンロード
    function downloadStringAsFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        // ダウンロード用のリンクを作成
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = filename;
        // ダウンロードリンクをクリックしてダウンロードを開始
        downloadLink.click();
        // 不要になったURLオブジェクトを解放
        window.URL.revokeObjectURL(downloadLink.href);
    }

    // アップロード
    function readFileAsString(callback) {
        // ファイル選択用のinput要素を動的に作成
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.sav';
        // ファイルが選択された時の処理
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            // ファイルの読み込みが完了した時の処理
            reader.onload = function (event) {
                const content = event.target.result;
                callback(content); // コールバック関数を呼び出し、ファイルの内容を渡す
            };
            // ファイルの読み込みを開始
            reader.readAsText(file);
        });
        // ファイル選択用のinput要素をクリックしてファイルを選択するダイアログを表示
        input.click();
    }

    let save = [];
    for (let i = 0; i < 10; i++) {
        let load_data = loadStorage(i);
        if (load_data) {
            save.push(load_data.data_name);
        } else {
            if (mode == "save") {
                save.push(NONE);
            }
        }
    }

    return (
        <div className="p-6">
            <div>
                <label className="modal_label">データ選択</label>
            </div>
            <div>
                <p>■保存されるもの</p>
                <p>・スタイル/スタイルごとの設定(限界突破数/装備/スキル/初期SP)</p>
                <p>・各ターンのキャラクターの配置、行動</p>
                <p>■保存されないもの</p>
                <p>・選択した敵</p>
                <p>・詳細設定</p>
                <ul className="save_load">
                    {save.map((item, index) => (
                        <li key={index} onClick={() => handleClick(index, item)}>{item}</li>
                    ))}
                </ul>
                {mode == "save" ?
                    <input type="button" className="text-sm w-[120px]" onClick={chickOutput} value="ファイルへ出力" />
                    :
                    <input type="button" className="text-sm w-[120px]" onClick={chickRead} value="ファイルから読み込み" />
                }
            </div>
        </div>
    );
};