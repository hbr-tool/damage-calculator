let hot;
const AREA_MAPPING = [
    { area: 1, min: 1, max: 5 },
    { area: 2, min: 6, max: 9 },
    { area: 3, min: 10, max: 14 },
    { area: 4, min: 15, max: 19 },
    { area: 5, min: 20, max: 23 },
    { area: 6, min: 24, max: 28 },
    { area: 7, min: 29, max: 33 },
    { area: 8, min: 34, max: 37 },
    { area: 9, min: 38, max: 42 },
    { area: 10, min: 43, max: 46 },
    { area: 11, min: 47, max: 51 },
    { area: 12, min: 52, max: 56 },
];

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
        // if ($("#display_columns").val() == 1) {
        //     hot1.updateSettings({ columns: columns, width: width });
        //     hot1.loadData(getData(isBadge));
        // } else {
        //     hot1.updateSettings({ columns: columns, width: width });
        //     hot2.updateSettings({ columns: columns, width: width });
        //     hot1.loadData(getData1(isBadge));
        // }
        // updateWidthSetting(width);
        saveInitDispaly();
    });

    $(window).on('resize', function () {
        updateHeight();
    });
};

function updateHeight() {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const calculatedHeight = windowHeight - 125;
    hot.updateSettings({ height: calculatedHeight });
}

function getWidth(columns) {
    return columns.reduce((acc, column) => acc + column.width, 0) + 25;
}

function createGrid() {
    let grid = document.getElementById('grid');
    let width = getWidth(columns);
    let data = getEnemyData();
    hot = new Handsontable(grid, getGridOptions(data, width, columns));
    // updateWidthSetting(width)
}

function getEnemyData() {
    let data = enemy_list.filter((obj) => obj.enemy_class == 4);
    data.forEach((item) => {
        const mapping = AREA_MAPPING.find(m => item.sub_no >= m.min && item.sub_no <= m.max);
        item.area = mapping ? mapping.area : null;
    });
    return data;
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

/**
 * 以下handson設定
 */
function createMergeCells(data) {
    // マージセルを追加するヘルパー関数
    const addMergeCell = (list, row, col, startIndex, endIndex) => {
        list.push({ row: startIndex, col: col, rowspan: endIndex - startIndex, colspan: 1 });
    };

    let oldSubNo = 0, startSubNo = 0;
    let oldArea = 0, startArea = 0;

    const areaCol = getIndexesByValue("area");
    const subNoCol = getIndexesByValue("sub_no");
    const turnCountCol = getIndexesByValue("turn_count");
    const formationCol = getIndexesByValue("formation");

    const mergeCellsList = [];

    data.forEach((row, index) => {
        if (row.sub_no !== oldSubNo) {
            if (oldSubNo !== 0) {
                addMergeCell(mergeCellsList, startSubNo, subNoCol, startSubNo, index);
                addMergeCell(mergeCellsList, startSubNo, turnCountCol, startSubNo, index);
                addMergeCell(mergeCellsList, startSubNo, formationCol, startSubNo, index);
            }
            oldSubNo = row.sub_no;
            startSubNo = index;
        }

        if (row.area !== oldArea) {
            if (oldArea !== 0) {
                addMergeCell(mergeCellsList, startArea, areaCol, startArea, index);
            }
            oldArea = row.area;
            startArea = index;
        }
    });

    // ループ終了後の最後のデータを処理
    addMergeCell(mergeCellsList, startSubNo, subNoCol, startSubNo, data.length);
    addMergeCell(mergeCellsList, startSubNo, turnCountCol, startSubNo, data.length);
    addMergeCell(mergeCellsList, startSubNo, formationCol, startSubNo, data.length);
    addMergeCell(mergeCellsList, startArea, areaCol, startArea, data.length);
    return mergeCellsList;
}


function getIndexesByValue(value) {
    return columns.findIndex(item => item['data'] === value);
}

// 行オプション
function getGridOptions(data, width, columns) {
    return {
        data: data,
        colHeaders: true,
        height: 800,
        width: width,
        columns: columns,
        // columnHeaderHeight: 50,
        afterChange: afterChange,
        //        afterGetColHeader: afterGetColHeader,
        // 行追加禁止
        afterCreateRow: function (index, amount) {
            data.splice(index, amount)
        },
        afterOnCellMouseDown: (event, coords, TD) => {
            console.log('Cell clicked:', coords, 'Element:', TD);
            if (coords.row >= 0 && coords.col >= 0) {
                const columnDefinition = columns[coords.col];
                if (columnDefinition.data.includes("formation")) {
                    MicroModal.show('modal_style_section');
                }
            }
        },
        mergeCells: createMergeCells(data),
    }
}

function afterChange(changes, source) {
    if (source != "loadData") {
        saveStorage();
    }
}

function resistRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (value > 100) {
        $(td).addClass("enemy_weak");
    } else if (value < 90) {
        $(td).addClass("enemy_resist");
    }
}

let columns = [
    {
        data: "area",
        title: "エリア",
        className: "htCenter",
        readOnly: true,
        width: 50,
    },
    {
        data: "sub_no",
        title: "階層",
        className: "htCenter",
        readOnly: true,
        width: 35,
    },
    {
        data: "enemy_name",
        title: "敵",
        readOnly: true,
        width: 250,
    },
    {
        data: "enemy_stat",
        title: "STATUS",
        className: "htCenter",
        readOnly: true,
        width: 60,
    },
    {
        data: "max_dp",
        title: "DP",
        className: "htRight",
        type: "numeric",
        numericFormat: {
            pattern: "0,000"
            , culture: "ja-JP"
        },
        readOnly: true,
        width: 80,
    },
    {
        data: "max_hp",
        title: "HP",
        className: "htRight",
        type: "numeric",
        numericFormat: {
            pattern: "0,000"
            , culture: "ja-JP"
        },
        readOnly: true,
        width: 80,
    },
    {
        data: "physical_1",
        title: "<img src='img/slash.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "physical_2",
        title: "<img src='img/stab.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "physical_3",
        title: "<img src='img/strike.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "element_0",
        title: "<img src='img/none.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "element_1",
        title: "<img src='img/fire.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "element_2",
        title: "<img src='img/ice.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "element_3",
        title: "<img src='img/thunder.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "element_4",
        title: "<img src='img/light.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "element_5",
        title: "<img src='img/dark.webp'>",
        className: "htCenter",
        type: "numeric",
        renderer: resistRenderer,
        readOnly: true,
        width: 30,
    },
    {
        data: "turn_count",
        title: "ターン数",
        className: "htCenter",
        type: "numeric",
        readOnly: true,
        width: 50,
    },
    {
        data: "formation_0",
        title: "編成",
        className: "formation",
        renderer: formationRenderer,
        readOnly: true,
        width: 48,
    },
    {
        data: "formation_1",
        title: "編成",
        className: "formation",
        renderer: formationRenderer,
        readOnly: true,
        width: 48,
    },
    {
        data: "formation_2",
        title: "編成",
        className: "formation",
        renderer: formationRenderer,
        readOnly: true,
        width: 48,
    },
    {
        data: "formation_3",
        title: "編成",
        className: "formation",
        renderer: formationRenderer,
        readOnly: true,
        width: 48,
    },
    {
        data: "formation_4",
        title: "編成",
        className: "formation",
        renderer: formationRenderer,
        readOnly: true,
        width: 48,
    },
    {
        data: "formation_5",
        title: "編成",
        className: "formation",
        renderer: formationRenderer,
        readOnly: true,
        width: 48,
    },
];

function formationRenderer(instance, td, row, column, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    let html = ""
    html += "<img class='style' src='img/plus.png'></img>"
    $(td).html(html);
}
