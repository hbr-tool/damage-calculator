import React from "react";
import { compressString, decompressString } from "utils/common";
import { KB_NEXT } from "./const";

const ModalSaveLoad = ({ mode, handleClose, turnList, loadData, update, setUpdate }) => {
    const NONE = "無し"

    const handleClick = (i, name) => {
        if (mode === "save") {
            if (name === NONE) {
                name = "データ" + (i + 1);
            }
            let dataName = window.prompt("保存名称を入力してください", name);
            if (dataName === null) {
                return;
            }
            const userOperationList = turnList.map(turn => turn.userOperation);
            let saveData = {
                dataName: dataName,
                unitDataList: convertUnitDataList(turnList[0]),
                userOperationList: userOperationList,
            }
            let compress = compressString(JSON.stringify(saveData));
            localStorage.setItem(`sim_data_${i}`, compress);
            handleClose();
        } else if (mode === "load") {
            let jsonstr = localStorage.getItem(`sim_data_${i}`);
            loadSimData(jsonstr);
        }
    };

    const loadSimData = (jsonstr) => {
        let saveData = [];
        if (jsonstr) {
            let ret = window.confirm("部隊情報が上書きされますが、よろしでしょうか？");
            if (!ret) {
                return;
            }
            handleClose();
            let decompress = decompressString(jsonstr)
            saveData = JSON.parse(decompress);
            // 旧形式から新形式に変更
            converSaveData(saveData);
            loadData(saveData, update, setUpdate);
        }
    }

    // メンバー情報からユニットデータに変換
    function convertUnitDataList(turnData) {
        return turnData.unitList.map((unit) => {
            if (unit?.style) {
                return {
                    style_id: unit.style.styleInfo.style_id,
                    limitCount: unit.style.limitCount,
                    earring: unit.style.earring,
                    bracelet: unit.style.bracelet,
                    chain: unit.style.chain,
                    initSp: unit.style.initSp,
                    morale: unit.style.morale,
                    supportStyleId: unit.style.supportStyleId,
                    exclusionSkillList: unit.style.exclusionSkillList,
                }
            }
            return undefined;
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
        const userOperationList = turnList.map(turn => turn.userOperation);
        let saveData = {
            unitDataList: convertUnitDataList(turnList[0]),
            userOperationList: userOperationList,
        }
        let compress = compressString(JSON.stringify(saveData));
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
        let loadData = loadStorage(i);
        if (loadData) {
            let dataName = loadData.dataName || loadData.data_name;
            save.push(dataName);
        } else {
            if (mode === "save") {
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
                <div class="text-base font-bold text-red-500">新システム対応前のセーブデータは正しく読み込めない可能性があります。</div>
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
                {mode === "save" ?
                    <input type="button" className="text-sm" onClick={chickOutput} value="ファイルへ出力" />
                    :
                    <input type="button" className="text-sm" onClick={chickRead} value="ファイルから読み込み" />
                }
            </div>
        </div>
    );
};

export default ModalSaveLoad;

// 旧形式から新形式に変更
const converSaveData = (saveData) => {
    if (saveData.unit_data_list) {
        saveData.unitDataList = saveData.unit_data_list.map((item, index) => {
            return {
                style_id: item.style_id,
                limitCount: item.limit_count || item.limitCount,
                earring: item.earring,
                bracelet: item.bracelet,
                chain: item.chain,
                initSp: item.init_sp || item.initSp,
                morale: 0,
                supportStyleId: 0,
                exclusionSkillList: item.exclusion_skill_list || item.exclusionSkillList || [],
            };
        });
        saveData.userOperationList = saveData.user_operation_list.map((item, index) => {
            return {
                additionalCount: item.additional_count,
                endDriveTriggerCount: item.end_drive_trigger_count,
                enemyCount: item.enemy_count,
                field: item.field,
                finishAction: item.finish_action,
                overDriveNumber: item.over_drive_number,
                placeStyle: item.place_style,
                remark: item.remark,
                selectSkill: item.select_skill,
                selectedPlaceNo: item.selected_place_no,
                triggerOverDrive: item.trigger_over_drive,
                turnNumber: item.turn_number,
                kbAction: item.kb_action === KB_NEXT.ACTION_OD_OLD ? KB_NEXT.ACTION_OD_1 : item.kb_action,
            }
        });
    }
}