
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
        // { label: 'アモン', colspan: 5, class: 'htMiddle' },
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
        // { label: 'R', },
        // { label: 'B', },
        // { label: 'Y', },
        // { label: 'W', },
        // { label: 'P', },
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
function createNewCharaData() {
    let data = [];
    $.each(chara_data, function(index, value) {
        let chara = {};
        chara["id"] = chara_id;
        chara["troop"] = value.troops;
        chara["name"] = value.chara_name;
        chara["lv"] = 120;
        chara["rein"] = 0;
        data.push(chara);
    });
    return data;
}

function saveStorage() {
    localStorage.setItem('mgmt_json_data', JSON.stringify(data));
}

function loadStorage() {
    let jsondata = localStorage.getItem('mgmt_json_data');
    if (jsondata) {
        data = JSON.parse(jsondata);
    } else {
        data = createNewCharaData();
    }
}

baseColumns = [
    {
        data: "troop",
        className: "htCenter",
        readOnly: true,
        renderer: function (instance, td, row, column, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            let rowData = instance.getSourceData()[row];
            if (Number(rowData["id"]) % 6 == 0 || Number(rowData["id"]) == 104) {
                $(td).addClass("underLine");
            }
        },
        width: 35,
    },
    {
        data: "name",
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
