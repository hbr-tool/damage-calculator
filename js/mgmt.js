let hot1;
let hot2;
function setEventTrigger() {
    // 表示列数変更
    $("#display_columns").change(function () {
        createGrid();
        saveInitDispaly();
        updateHeight();
    });
    //　オーブ設定変更
    $(".orb").change(function () {
        let width = getWidth();
        columns = createColumns();
        if ($("#display_columns").val() == 1) {
            hot1.updateSettings({ columns: columns, width: width });
        } else {
            hot1.updateSettings({ columns: columns, width: width });
            hot2.updateSettings({ columns: columns, width: width });
        }
        updateWidthSetting(width);
        saveInitDispaly();
    });

    // データ保存ボタン
    $("#exportSaveBtn").on("click", function (event) {
        let compress = compressString(JSON.stringify(data));
        downloadStringAsFile(compress, "character_management.sav");
    });

    // データ読込ボタン
    $("#importSaveBtn").on("click", function (event) {
        readFileAsString(function (content) {
            let decompress = decompressString(content)
            let jsondata = JSON.parse(decompress);
            data = replaceCharaData(jsondata)
            if ($("#display_columns").val() == 1) {
                hot1.updateSettings({ data: data });
                hot1.render();
            } else {
                hot1.updateSettings({ data: getData1() });
                hot1.render();
                hot2.updateSettings({ data: getData2() });
                hot2.render();
            }
            saveStorage();
        });
    });

    $(window).on('resize', function() {
        updateHeight();
    });
};

function updateHeight() {
    if ($("#display_columns").val() == 1) {
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const calculatedHeight = windowHeight - 125;
        hot1.updateSettings({ height: calculatedHeight });
    } else {
        hot1.updateSettings({ height: 800 });
    }
}

function getWidth() {
    let width = 350;
    let values = [$("#orb1").val(), $("#orb2").val(), $("#orb3").val()];
    let count = values.filter(value => value != 0).length;
    return width + count * 125;
}

function createGrid() {
    let grid1 = document.getElementById('grid1');
    let grid2 = document.getElementById('grid2');
    let width = getWidth();
    if ($("#display_columns").val() == 1) {
        if (hot1) {
            hot1.updateSettings({ data: data });
        } else {
            hot1 = new Handsontable(grid1, getColumnOptions(data, width));
        }
        if (hot2) {
            hot2.destroy();
            hot2 = undefined;
            $("#grid2").hide();
        }
        $("#grid_area").addClass("grid-cols-1")
        $("#grid_area").removeClass("grid-cols-2");
    } else {
        let data1 = getData1();
        let data2 = getData2();
        if (hot1) {
            hot1.updateSettings({ data: data1 });
        } else {
            hot1 = new Handsontable(grid1, getColumnOptions(data1, width));
        }
        if (hot2) {
            hot2.updateSettings({ data: data2 });
        } else {
            hot2 = new Handsontable(grid2, getColumnOptions(data2, width));
        }
        $("#grid_area").addClass("grid-cols-2")
        $("#grid_area").removeClass("grid-cols-1")
        $("#grid2").show();
    }
    updateWidthSetting(width)
}
// 表示幅取得
function updateWidthSetting(width) {
    let display_columns = $("#display_columns").val();
    let main_width = 4 + width * display_columns;
    $("#grid_area").width(main_width);
}

// データ取得
function getData1() {
    return data.filter(function (item) {
        return item["chara_id"] <= 24 || 48 < item["chara_id"];
    });
}
function getData2() {
    return data.filter(function (item) {
        return item["chara_id"] > 24 && item["chara_id"] <= 48;
    });
}

// 行定義生成
function createColumns() {
    let newColumns = baseColumns;
    if ($("#orb1").val() != 0) {
        newColumns = addOrbColumn(newColumns, $("#orb1").val());
    }
    if ($("#orb2").val() != 0) {
        newColumns = addOrbColumn(newColumns, $("#orb2").val());
    }
    if ($("#orb3").val() != 0) {
        newColumns = addOrbColumn(newColumns, $("#orb3").val());
    }
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
    let edited_chara_data = JSON.parse(JSON.stringify(chara_data));

    // chara_dataのループを行う
    edited_chara_data.forEach(value => {
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
    return edited_chara_data;
}

// 初期設定
function initSetting() {
    let mgmt_init_display = localStorage.getItem('mgmt_init_display');
    if (mgmt_init_display) {
        let init = JSON.parse(mgmt_init_display);
        // 保存状態復元
        $("#display_columns").val(init["display_columns"]);
        for (let i = 0; i < 3; i++) {
            $("#orb" + (i + 1)).val(init["orbs"][i]);
        }
    } else {
        // 初期設定
        if ($(window).width() <= 610) {
            $("#display_columns").val(1);
            $("#orb2").val(0);
        } else if ($(window).width() <= 950) {
            $("#display_columns").val(1);
        } else if ($(window).width() <= 1200) {
            $("#orb2").val(0);
        }
    }
}

// 初期表示設定
function saveInitDispaly() {
    let init = new Object();
    init["display_columns"] = $("#display_columns").val();
    init["orbs"] = [$("#orb1").val(), $("#orb2").val(), $("#orb3").val()];
    localStorage.setItem('mgmt_init_display', JSON.stringify(init));
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

/**
 * 以下handson設定
 */
// 行オプション
function getColumnOptions(data, width) {
    return {
        data: data,
        colHeaders: true,
        height: 800,
        width: width,
        columns: columns,
        afterChange: afterChange,
        afterGetColHeader: afterGetColHeader,
        // 行追加禁止
        afterCreateRow: function (index, amount) {
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
        { colspan: 5, class: 'htMiddle', id: "1" },
        { colspan: 5, class: 'htMiddle', id: "2" },
        { colspan: 5, class: 'htMiddle', id: "3" },
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
        { label: 'R', },
        { label: 'B', },
        { label: 'Y', },
        { label: 'W', },
        { label: 'P', },
    ]
];

function afterGetColHeader(col, TH) {
    let header = getHeaderHtml(nestedHeaders);
    $('table.htCore thead').empty();
    $('table.htCore thead').prepend(header);
}
function getHeaderHtml(nestedHeaders) {
    let headerHtml = [''];
    for (const row of nestedHeaders) {
        headerHtml.push('<tr>');
        for (const [index, value] of row.entries()) {
            if (typeof value == 'object') {
                headerHtml.push('<th class=');
                headerHtml.push(value.class != undefined ? '"' + value.class + '"' : '""');
                headerHtml.push(value.colspan != undefined ? ' colspan="' + value.colspan + '"' : "");
                headerHtml.push(value.rowspan != undefined ? ' rowspan="' + value.rowspan + '"' : "");
                headerHtml.push(value.style != undefined ? ' style="' + value.style + '"' : "");
                headerHtml.push('>');
                if (value.label != undefined) {
                    headerHtml.push(getThHtml(value.label));
                } else {
                    let selectedText = ''; // 選択されたテキストを保持する変数を定義
                    let id = 1;
                    for (let i = 1; i <= 3; i++) {
                        const $selectedOption = $("#orb" + i + " option:selected");
                        if ($selectedOption.val() != 0) {
                            if (id == value.id) {
                                selectedText = $selectedOption.text(); // 選択されたテキストを保持
                                break;
                            }
                            id++;
                        }
                    }
                    headerHtml.push(selectedText); // ループの外で保持したテキストを使用                    
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
            let chara_id = Number(rowData["chara_id"]);
            if (chara_id < 100 && chara_id % 6 == 0 || chara_id == 104) {
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
