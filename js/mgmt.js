let hot1;
let hot2;
function setEventTrigger() {
    //　オーブ設定変更
    $(".orb").change(function() {
        columns = createColumns();
        hot1.updateSettings({columns: columns});
        hot2.updateSettings({columns: columns});
    });

    // データ保存ボタン
    $("#exportSaveBtn").on("click", function(event) {
        let compress = compressString(JSON.stringify(data));
        downloadStringAsFile(compress, "character_management.sav");
    });

    // データy読込ボタン
    $("#importSaveBtn").on("click", function(event) {
        readFileAsString(function(content) {
            let decompress = decompressString(content) 
            let jsondata = JSON.parse(decompress);
            data = replaceCharaData(jsondata)
            hot1.updateSettings({data: getData1()});
            hot1.render();
            hot2.updateSettings({data: getData2()});
            hot2.render();
            saveStorage();
        });
    });
};

// データ取得
function getData1() {
    return data.filter(function(item) {
        return item["chara_id"] <= 24 || 48 < item["chara_id"];
    });
}
function getData2() {
    return data.filter(function(item) {
        return item["chara_id"] > 24 && item["chara_id"] <= 48;
    });
}

// 行定義生成
function createColumns() {
    let newColumns = baseColumns;
    newColumns = addOrbColumn(newColumns, $("#orb1").val());
    newColumns = addOrbColumn(newColumns, $("#orb2").val());
    return newColumns;
}

// オーブ行追加
function addOrbColumn(columns, value) {
    const orbColumns = {
        "1": exoColumns,
        "2": rectusColumns,
        "3": amonColumns
    };
    return value in orbColumns ? columns.concat(orbColumns[value]) : columns;
}

// キャラデータ取得
function replaceCharaData(jsondata) {
    let editedCharaData = JSON.parse(JSON.stringify(jsondata));

    // chara_dataのループを行う
    editedCharaData.forEach(value => {
        // chara_idを取得
        const chara_id = value.chara_id;
        // jsondataから同様のchara_idを持つ列を取得
        const matchingData = jsondata.find(data => data.chara_id === chara_id);
        // 取得できた場合、chara_data列を取得した列で置き換える
        if (matchingData) {
            for (let key in matchingData) {
                value[key] = matchingData[key];
            }
        } else {
            // 初期値
            value["lv"] = 120;
            value["rein"] = 0;
        }
    });
    return editedCharaData;
}

// ストレージに保存
function saveStorage() {
    let compress = compressString(JSON.stringify(data));
    localStorage.setItem('mgmt_json_data', compress);
}

// ストレージから読み込み
function loadStorage() {
    let jsonstr = localStorage.getItem('mgmt_json_data');
    let jsondata = []
    if (jsonstr) {
        let decompress = decompressString(jsonstr) 
        jsondata = JSON.parse(decompress);
    }
    data = replaceCharaData(jsondata)
}

// 文字列を圧縮
function compressString(inputString) {
    const compressedData = pako.deflate(inputString);
    const compressedString = btoa(String.fromCharCode.apply(null, compressedData));
    return compressedString;
}

// 圧縮された文字列を解凍
function decompressString(compressedString) {
    const compressedDataBuffer = new Uint8Array(atob(compressedString).split('').map(function (c) { return c.charCodeAt(0); }));
    const decompressedData = pako.inflate(compressedDataBuffer);
    const decompressedString = new TextDecoder().decode(decompressedData);
    return decompressedString;
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
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        // ファイルの読み込みが完了した時の処理
        reader.onload = function(event) {
            const content = event.target.result;
            callback(content); // コールバック関数を呼び出し、ファイルの内容を渡す
        };
        // ファイルの読み込みを開始
        reader.readAsText(file);
    });
    // ファイル選択用のinput要素をクリックしてファイルを選択するダイアログを表示
    input.click();
}

/**
 * 以下handson設定
 */
// 行オプション
function getColumnOptions(data) {
    return {
        data: data,
        colHeaders: true,
        height: 800,
        width: 580,
        columns: columns,
        afterChange: afterChange,
        afterGetColHeader: afterGetColHeader,
//        fixedColumnsLeft: 6, 
        // 行追加禁止
        afterCreateRow: function(index, amount){
            data.splice(index, amount)
        },
    }
}

function afterChange(changes, source) {
    if (source != "loadData") {
        saveStorage();
    }
}
let nestedHeaders = [
    [
        { label: '部<br>隊', rowspan: 2, class: 'htMiddle' },
        { label: 'キャラクター', rowspan: 2, class: 'htMiddle' },
        { label: 'Lv', rowspan: 2, class: 'htMiddle' },
        { label: '転生<br>回数', rowspan: 2, class: 'htMiddle' },
        { label: 'スキル<br>Lv', rowspan: 2, class: 'htMiddle' },
        { label: 'ジェネ<br>ライズ', rowspan: 2, class: 'htMiddle' },
        { label: 'エグゾウォッチャー', colspan: 5, class: 'htMiddle' },
        { label: 'レクタス/シニスター', colspan: 5, class: 'htMiddle' },
    ],
    [
        { label: 'R', },
        { label: 'B', },
        { label: 'Y', },
        { label: 'W', },
        { label: 'P', },
        { label: 'R', },
        { label: 'B', },
        { label: 'Y', },
        { label: 'W', },
        { label: 'P', },
    ]
];

let header = getHeaderHtml(nestedHeaders);
function afterGetColHeader(col, TH) {
    $('table.htCore thead').empty();
    $('table.htCore thead').prepend(header);
}
function getHeaderHtml(nestedHeaders) {
    let headerHtml = [''];
    for (const row of nestedHeaders) {
        headerHtml.push('<tr>');
        for (const [index, value] of row.entries()) {
            if (typeof value == 'object') {
                if (value.label != undefined) {
                    headerHtml.push('<th class=');
                    headerHtml.push(value.class != undefined ? '"' + value.class + '"' : '""');
                    headerHtml.push(value.colspan != undefined ? ' colspan="' + value.colspan + '"' : "");
                    headerHtml.push(value.rowspan != undefined ? ' rowspan="' + value.rowspan + '"' : "");
                    headerHtml.push(value.style != undefined ? ' style="' + value.style + '"' : "");
                    headerHtml.push('>');
                    headerHtml.push(getThHtml(value.label));
                }
            }
            else {
                headerHtml.push('<th class="">');
                headerHtml.push(getThHtml(value));
            }
        }

        headerHtml.push('</tr>');
    }
    return headerHtml.join('');
}
function getThHtml(text) {
    return '<div class="relative"><span class="colHeader">' + text + '</span></div></th>';
}

baseColumns = [
    {
        data: "troops",
        className: "htCenter",
        readOnly: true,
        renderer: function (instance, td, row, column, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            let rowData = instance.getSourceData()[row];
            if (Number(rowData["chara_id"]) % 6 == 0 || Number(rowData["chara_id"]) == 104) {
                $(td).addClass("underLine");
            }
        },
        width: 35,
    },
    {
        data: "chara_name",
        readOnly: true,
        width: 150,
    },
    {
        data: "lv",
        className: "htCenter rightLine",
        type: "numeric",
        renderer: function (instance, td, row, column, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            if (value <= 120) {
                $(td).addClass("limit_0");
            } else if (value <= 130) {
                $(td).addClass("limit_1");
            } else if (value <= 140) {
                $(td).addClass("limit_2");
            } else if (value <= 150) {
                $(td).addClass("limit_3");
            } else if (value <= 170) {
                $(td).addClass("limit_4");
            }
        },
        width: 35,
    },
    {
        data: "rein",
        className: "htCenter rightLine",
        type: "numeric",
        renderer: function (instance, td, row, column, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            if (value == 0) {
                $(td).addClass("limit_0");
            } else if (value < 5) {
                $(td).addClass("limit_1");
            } else if (value < 10) {
                $(td).addClass("limit_2");
            } else if (value < 20) {
                $(td).addClass("limit_3");
            } else if (value == 20) {
                $(td).addClass("limit_4");
            }
        },
        width: 35,
    },
    {
        data: "skill",
        className: "htCenter rightLine",
        width: 35,
    },
    {
        data: "generate",
        className: "htCenter rightLine",
        width: 40,
    },
];

exoColumns = [
     {
        data: "Exo_R",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Exo_B",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Exo_Y",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Exo_W",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Exo_P",
        className: "htCenter rightLine",
        width: 25,
    },   
];
rectusColumns = [
    {
        data: "Rectus_R",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Rectus_B",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Rectus_Y",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Rectus_W",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Rectus_P",
        className: "htCenter rightLine",
        width: 25,
    },
];
amonColumns = [
    {
        data: "Amon_R",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Amon_B",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Amon_Y",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Amon_W",
        className: "htCenter",
        width: 25,
    },
    {
        data: "Amon_P",
        className: "htCenter rightLine",
        width: 25,
    },
];
