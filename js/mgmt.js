let hot1;
let hot2;

function setEventTrigger() {
    // 表示列数変更
    $("#display_columns").change(function () {
        createGrid();
        saveInitDispaly();
        updateHeight();
    });
    //　表示設定変更
    $(".select_info").change(function () {
        let isBadge = $("#badge").prop("checked");
        let columns = baseColumns;
        if (isBadge) {
            columns = getTitleColumns();
        }
        let width = getWidth(columns);
        if ($("#display_columns").val() == 1) {
            hot1.updateSettings({ columns: columns, width: width + 20 });
            hot1.loadData(getData());
        } else {
            hot1.updateSettings({ columns: columns, width: width });
            hot2.updateSettings({ columns: columns, width: width });
            hot1.loadData(getData1());
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
            let isBadge = $("#badge").prop("checked");

            data = replaceCharaData(jsondata)
            if ($("#display_columns").val() == 1) {
                hot1.loadData(getData());
            } else {
                hot1.loadData(getData1());
                hot2.loadData(getData2());
            }
            saveStorage();
        });
    });

    $(window).on('resize', function () {
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

function getWidth(columns) {
    return columns.reduce((acc, column) => acc + column.width, 0) + 5;
}

function createGrid() {
    let grid1 = document.getElementById('grid1');
    let grid2 = document.getElementById('grid2');
    let columns = baseColumns;
    let isBadge = $("#badge").prop("checked");
    if (isBadge) {
        columns = getTitleColumns();
    }
    let width = getWidth(columns);
    if ($("#display_columns").val() == 1) {
        let dataAll = getData();
        if (hot1) {
            hot1.loadData(dataAll);
        } else {
            hot1 = new Handsontable(grid1, getGridOptions(dataAll, width + 20, columns));
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
            hot1.loadData(data1);
        } else {
            hot1 = new Handsontable(grid1, getGridOptions(data1, width, columns));
        }
        if (hot2) {
            hot2.loadData(data2);
        } else {
            hot2 = new Handsontable(grid2, getGridOptions(data2, width, columns));
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
function getData(isBadge) {
    return data;
}
function getData1(isBadge) {
    return data.filter(function (item) {
        return item["chara_id"] <= 24 || 100 < item["chara_id"];
    });
}
function getData2() {
    return data.filter(function (item) {
        return item["chara_id"] > 24 && item["chara_id"] <= 99;
    });
}

// キャラデータ取得
function replaceCharaData(jsondata) {
    let edited_chara_data = JSON.parse(JSON.stringify(chara_data.filter(function (chara) {
        // chara_idが500以上のものを排除
        return chara.chara_id < 500 && chara.chara_id != 92 && chara.chara_id != 93;
    })));

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
function getGridOptions(data, width, columns) {
    return {
        data: data,
        colHeaders: true,
        height: 800,
        width: width,
        columns: columns,
        columnHeaderHeight: 50,
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
let baseHeaders = [
    [
        { label: '部<br>隊', rowspan: 2, class: 'htMiddle' },
        { label: 'キャラクター', rowspan: 2, class: 'htMiddle' },
        { label: 'Lv', rowspan: 2, class: 'htMiddle' },
        { label: '転生<br>回数', rowspan: 2, class: 'htMiddle' },
        { label: 'スキル<br>Lv', rowspan: 2, class: 'htMiddle' },
        { label: 'ジェネ<br>ライズ', rowspan: 2, class: 'htMiddle' },
        { label: 'エグゾウォッチャー', colspan: 5, class: 'htMiddle', id: "1" },
        { label: 'レクタス/シニスター', colspan: 5, class: 'htMiddle', id: "2" },
        { label: 'アモン', colspan: 5, class: 'htMiddle', id: "3" },
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
    let headers = baseHeaders;
    if ($("#badge").prop("checked")) {
        headers = titleHeaders;
    }
    let header = getHeaderHtml(headers);
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

let baseColumns = [
    {
        data: "troops",
        className: "htCenter",
        readOnly: true,
        renderer: function (instance, td, row, column, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            let rowData = instance.getSourceData()[row];
            let chara_id = Number(rowData["chara_id"]);
            if ((chara_id < 50 && chara_id % 6 == 0) || chara_id == 91 || chara_id == 92 ||chara_id == 93 ||chara_id == 107) {
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
            if (value >= 160) {
                $(td).addClass("achievement7");
            } else if (value >= 150) {
                $(td).addClass("achievement6");
            } else if (value >= 140) {
                $(td).addClass("achievement5");
            } else if (value >= 130) {
                $(td).addClass("achievement4");
            } else if (value >= 120) {
                $(td).addClass("achievement3");
            } else if (value >= 110) {
                $(td).addClass("achievement2");
            } else if (value >= 100) {
                $(td).addClass("achievement1");
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
            if (value >= 20) {
                $(td).addClass("achievement7");
            } else if (value >= 15) {
                $(td).addClass("achievement6");
            } else if (value >= 10) {
                $(td).addClass("achievement5");
            } else if (value >= 5) {
                $(td).addClass("achievement4");
            } else if (value >= 1) {
                $(td).addClass("achievement2");
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

let titleHeaders = [
    [
        { label: '部<br>隊', rowspan: 2, class: 'htMiddle' },
        { label: 'キャラクター', rowspan: 2, class: 'htMiddle' },
        { label: '称号<br>ランク', rowspan: 2, class: 'htMiddle' },
        { label: 'NEXT<br>EXP', rowspan: 2, class: 'htMiddle' },
        { label: 'Lv', rowspan: 2, class: 'htMiddle' },
        { label: '限界<br>突破', rowspan: 2, class: 'htMiddle' },
        { label: '転生<br>回数', rowspan: 2, class: 'htMiddle' },
        { label: 'オーブ<br>取得', rowspan: 2, class: 'htMiddle' },
        { label: 'スコア<br>アタック', rowspan: 2, class: 'htMiddle' },
        { label: '戦闘<br>回数', rowspan: 2, class: 'htMiddle' },
        { label: 'ダンジョン', rowspan: 2, class: 'htMiddle' },
        { label: '異時層', colspan: 10, class: 'htMiddle' },
    ],
    [
        { label: '<img src="img/BadgeStoryHardMode_DeathSlug.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_RotaryMole.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_RedCrimson.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_Feeler.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_FlatHand.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_UltimateFeeler.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_UltimateFlatHand.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_DesertDendron.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_SkullFeatherHeadTail.webp">', },
        { label: '<img src="img/BadgeStoryHardMode_SkullFeatherHead2nd.webp">', },
    ]
];

function getExp(rowData) {
    // 経験値
    let exp = 0;

    // 経験値の増分データを処理する関数
    function applyExpIncrements(value, increments) {
        increments.forEach(increment => {
            if (value >= increment.threshold) {
                exp += increment.exp;
            }
        });
    }

    // 経験値の増分データ
    let expData = [
        {
            value: rowData["lv"],
            increments: [
                { threshold: 100, exp: 50 },
                { threshold: 110, exp: 50 },
                { threshold: 120, exp: 100 },
                { threshold: 130, exp: 200 },
                { threshold: 140, exp: 300 },
                { threshold: 150, exp: 500 },
                { threshold: 160, exp: 1000 },
            ]
        },
        {
            value: rowData["limit_count"],
            increments: [
                { threshold: 1, exp: 200 },
                { threshold: 2, exp: 200 },
                { threshold: 3, exp: 300 },
                { threshold: 4, exp: 300 },
            ]
        },
        {
            value: rowData["rein"],
            increments: [
                { threshold: 1, exp: 100 },
                { threshold: 5, exp: 250 },
                { threshold: 10, exp: 500 },
                { threshold: 15, exp: 500 },
                { threshold: 20, exp: 500 },
            ]
        },
        {
            value: rowData["orb_count"],
            increments: [
                { threshold: 1, exp: 100 },
                { threshold: 3, exp: 250 },
                { threshold: 5, exp: 500 },
                { threshold: 8, exp: 500 },
                { threshold: 10, exp: 500 },
                { threshold: 15, exp: 1000 },
            ]
        },
        {
            value: rowData["score_attack"],
            increments: [
                { threshold: 100000, exp: 50 },
                { threshold: 200000, exp: 50 },
                { threshold: 400000, exp: 100 },
                { threshold: 600000, exp: 200 },
                { threshold: 800000, exp: 500 },
                { threshold: 1000000, exp: 1000 }
            ]
        },
        {
            value: rowData["battle_count"],
            increments: [
                { threshold: 10, exp: 50 },
                { threshold: 100, exp: 100 },
                { threshold: 1000, exp: 500 },
                { threshold: 5000, exp: 1000 },
                { threshold: 10000, exp: 2000 }
            ]
        },
        {
            value: rowData["dungeon_count"],
            increments: [
                { threshold: 5, exp: 50 },
                { threshold: 50, exp: 100 },
                { threshold: 100, exp: 500 },
                { threshold: 250, exp: 1000 },
                { threshold: 500, exp: 2000 }
            ]
        },
        {
            value: rowData["deathSlag"],
            increments: [
                { threshold: 1, exp: 100 },
            ]
        },
        {
            value: rowData["rotaryMoll"],
            increments: [
                { threshold: 1, exp: 200 },
            ]
        },
        {
            value: rowData["redCrimson"],
            increments: [
                { threshold: 1, exp: 200 },
            ]
        },
        {
            value: rowData["filler"],
            increments: [
                { threshold: 1, exp: 300 },
            ]
        },
        {
            value: rowData["flatHand3rd"],
            increments: [
                { threshold: 1, exp: 300 },
            ]
        },
        {
            value: rowData["ultimateFiller"],
            increments: [
                { threshold: 1, exp: 500 },
            ]
        },
        {
            value: rowData["flatHand4th"],
            increments: [
                { threshold: 1, exp: 500 },
            ]
        },
        {
            value: rowData["dessertDendron"],
            increments: [
                { threshold: 1, exp: 1000 },
            ]
        },
        {
            value: rowData["skullFeather"],
            increments: [
                { threshold: 1, exp: 1000 },
            ]
        },
        {
            value: rowData["skullFeather2nd"],
            increments: [
                { threshold: 1, exp: 1000 },
            ]
        },
    ];

    // 経験値の増分データ
    let expDataAB = [
        {
            value: rowData["lv"],
            increments: [
                { threshold: 100, exp: 100 },
                { threshold: 110, exp: 100 },
                { threshold: 120, exp: 300 },
                { threshold: 130, exp: 500 },
            ]
        },
        {
            value: rowData["rein"],
            increments: [
                { threshold: 1, exp: 200 },
                { threshold: 5, exp: 300 },
                { threshold: 10, exp: 500 },
                { threshold: 15, exp: 500 },
                { threshold: 20, exp: 500 },
            ]
        },
        {
            value: rowData["orb_count"],
            increments: [
                { threshold: 1, exp: 200 },
                { threshold: 3, exp: 300 },
                { threshold: 5, exp: 500 },
                { threshold: 8, exp: 500 },
                { threshold: 10, exp: 500 },
                { threshold: 15, exp: 1000 },
            ]
        },
        {
            value: rowData["score_attack"],
            increments: [
                { threshold: 100000, exp: 100 },
                { threshold: 200000, exp: 100 },
                { threshold: 400000, exp: 200 },
                { threshold: 600000, exp: 300 },
                { threshold: 800000, exp: 500 },
                { threshold: 1000000, exp: 1000 }
            ]
        },
        {
            value: rowData["battle_count"],
            increments: [
                { threshold: 10, exp: 100 },
                { threshold: 100, exp: 200 },
                { threshold: 1000, exp: 500 },
                { threshold: 5000, exp: 1000 },
                { threshold: 10000, exp: 2000 }
            ]
        },
        {
            value: rowData["dungeon_count"],
            increments: [
                { threshold: 5, exp: 100 },
                { threshold: 50, exp: 200 },
                { threshold: 100, exp: 500 },
                { threshold: 250, exp: 1000 },
                { threshold: 500, exp: 2000 }
            ]
        },
        {
            value: rowData["deathSlag"],
            increments: [
                { threshold: 1, exp: 200 },
            ]
        },
        {
            value: rowData["rotaryMoll"],
            increments: [
                { threshold: 1, exp: 300 },
            ]
        },
        {
            value: rowData["redCrimson"],
            increments: [
                { threshold: 1, exp: 300 },
            ]
        },
        {
            value: rowData["filler"],
            increments: [
                { threshold: 1, exp: 500 },
            ]
        },
        {
            value: rowData["flatHand3rd"],
            increments: [
                { threshold: 1, exp: 500 },
            ]
        },
        {
            value: rowData["ultimateFiller"],
            increments: [
                { threshold: 1, exp: 800 },
            ]
        },
        {
            value: rowData["flatHand4th"],
            increments: [
                { threshold: 1, exp: 800 },
            ]
        },
        {
            value: rowData["dessertDendron"],
            increments: [
                { threshold: 1, exp: 1000 },
            ]
        },
        {
            value: rowData["skullFeather"],
            increments: [
                { threshold: 1, exp: 1000 },
            ]
        },
        {
            value: rowData["skullFeather2nd"],
            increments: [
                { threshold: 1, exp: 1000 },
            ]
        },
    ];

    // 各データに対して経験値を計算
    let chara_id = Number(rowData["chara_id"]);
    if (chara_id < 100) {
        expData.forEach(data => applyExpIncrements(data.value, data.increments));
    } else {
        expDataAB.forEach(data => applyExpIncrements(data.value, data.increments));
    }
    return exp;
}

function rankUp(exp) {
    let rank = 1;
    while (rank < 10 && exp >= rank * 500) {
        exp -= rank * 500;
        rank++;
    }
    return { rank, remainingExp: exp };
}

function getTitleColumns() {
    let titleColumns = [
        {
            data: "troops",
            className: "htCenter",
            readOnly: true,
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                let rowData = instance.getSourceData()[row];
                let chara_id = Number(rowData["chara_id"]);
                if ((chara_id < 50 && chara_id % 6 == 0) || chara_id == 91 || chara_id == 92 ||chara_id == 93 ||chara_id == 107) {
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
            data: "title_rank",
            className: "htCenter",
            readOnly: true,
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                let rowData = instance.getSourceData()[row];
                let exp = getExp(rowData);
                let rank = rowData["rank"];
                if (rowData['exp'] != exp) {
                    let result = rankUp(exp);
                    rank = result["rank"];
                    if (rank < 10) {
                        rowData["next_rank"] = rank * 500 - result["remainingExp"];
                    } else {
                        rowData["next_rank"] = 0;
                    }
                    rowData["rank"] = rank;
                    rowData["exp"] = exp;
                }
                value = rank;
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                if (rank >= 10) {
                    $(td).addClass("achievement7");
                } else if (rank >= 7) {
                    $(td).addClass("achievement6");
                } else if (rank >= 5) {
                    $(td).addClass("achievement5");
                } else if (rank >= 3) {
                    $(td).addClass("achievement4");
                } else if (rank >= 1) {
                    $(td).addClass("achievement2");
                }
            },
            width: 40,
        },
        {
            data: "next_rank",
            className: "htCenter rightLine",
            readOnly: true,
            width: 40,
        },
        {
            data: "lv",
            className: "htCenter rightLine",
            type: "numeric",
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                if (value >= 160) {
                    $(td).addClass("achievement7");
                } else if (value >= 150) {
                    $(td).addClass("achievement6");
                } else if (value >= 140) {
                    $(td).addClass("achievement5");
                } else if (value >= 130) {
                    $(td).addClass("achievement4");
                } else if (value >= 120) {
                    $(td).addClass("achievement3");
                } else if (value >= 110) {
                    $(td).addClass("achievement2");
                } else if (value >= 100) {
                    $(td).addClass("achievement1");
                }
            },
            width: 35,
        },
        {
            data: "limit_count",
            className: "htCenter rightLine",
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                let rowData = instance.getSourceData()[row];
                let chara_id = Number(rowData["chara_id"]);
                if (chara_id > 100) {
                    value = "-";
                    cellProperties.readOnly = true;
                }
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                if (value >= 4) {
                    $(td).addClass("achievement7");
                } else if (value >= 3) {
                    $(td).addClass("achievement6");
                } else if (value >= 2) {
                    $(td).addClass("achievement5");
                } else if (value >= 1) {
                    $(td).addClass("achievement2");
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
                if (value >= 20) {
                    $(td).addClass("achievement7");
                } else if (value >= 15) {
                    $(td).addClass("achievement6");
                } else if (value >= 10) {
                    $(td).addClass("achievement5");
                } else if (value >= 5) {
                    $(td).addClass("achievement4");
                } else if (value >= 1) {
                    $(td).addClass("achievement2");
                }
            },
            width: 35,
        },
        {
            data: "orb_count",
            className: "htCenter rightLine",
            type: "numeric",
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                if (value >= 15) {
                    $(td).addClass("achievement7");
                } else if (value >= 10) {
                    $(td).addClass("achievement6");
                } else if (value >= 8) {
                    $(td).addClass("achievement5");
                } else if (value >= 5) {
                    $(td).addClass("achievement4");
                } else if (value >= 3) {
                    $(td).addClass("achievement2");
                } else if (value >= 1) {
                    $(td).addClass("achievement1");
                }
            },
            width: 40,
        },
        {
            data: "score_attack",
            className: "htCenter rightLine",
            type: "numeric",
            numericFormat: {
                pattern: "0,000"
                , culture: "ja-JP"
            },
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                Handsontable.renderers.NumericRenderer.apply(this, arguments);
                if (value >= 1000000) {
                    $(td).addClass("achievement7");
                } else if (value >= 800000) {
                    $(td).addClass("achievement6");
                } else if (value >= 600000) {
                    $(td).addClass("achievement5");
                } else if (value >= 400000) {
                    $(td).addClass("achievement4");
                } else if (value >= 200000) {
                    $(td).addClass("achievement2");
                } else if (value >= 100000) {
                    $(td).addClass("achievement1");
                }
            },
            width: 70,
        },
        {
            data: "battle_count",
            className: "htCenter rightLine",
            type: "numeric",
            numericFormat: {
                pattern: "0,000"
                , culture: "ja-JP"
            },
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                Handsontable.renderers.NumericRenderer.apply(this, arguments);
                if (value >= 10000) {
                    $(td).addClass("achievement7");
                } else if (value >= 5000) {
                    $(td).addClass("achievement6");
                } else if (value >= 1000) {
                    $(td).addClass("achievement5");
                } else if (value >= 100) {
                    $(td).addClass("achievement4");
                } else if (value >= 10) {
                    $(td).addClass("achievement2");
                }
            },
            width: 50,
        },
        {
            data: "dungeon_count",
            className: "htCenter rightLine",
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                if (value >= 500) {
                    $(td).addClass("achievement7");
                } else if (value >= 250) {
                    $(td).addClass("achievement6");
                } else if (value >= 100) {
                    $(td).addClass("achievement5");
                } else if (value >= 50) {
                    $(td).addClass("achievement4");
                } else if (value >= 5) {
                    $(td).addClass("achievement2");
                }
            },
            width: 60,
        },
    ];
    const HARD_LAYER = ["deathSlag", "rotaryMoll", "redCrimson", "filler", "flatHand3rd", "ultimateFiller", "flatHand4th", "dessertDendron", "skullFeather", "skullFeather2nd"];
    $.each(HARD_LAYER, function (index, enemy_name) {
        let column = {
            className: "htCenter",
            editor: "select",
            selectOptions: { "0": "", "1": "○", },
            renderer: function (instance, td, row, column, prop, value, cellProperties) {
                if (enemy_name == "redCrimson") {
                    let rowData = instance.getSourceData()[row];
                    let chara_id = Number(rowData["chara_id"]);
                    if (chara_id == 7) {
                        value = "×";
                        Handsontable.renderers.TextRenderer.apply(this, arguments);
                        cellProperties.readOnly = true;
                        return;
                    }
                } 
                if (value == "1") {
                    $(td).addClass("achievement7");
                    value = "○";
                } else if (value == "0") {
                    value = "";
                }
                Handsontable.renderers.TextRenderer.apply(this, arguments);
            },
            width: 30,
        }
        column["data"] = enemy_name;
        titleColumns.push(column);
    });
    titleColumns[titleColumns.length - 1]["className"] = "htCenter rightLine";
    return titleColumns;
}
