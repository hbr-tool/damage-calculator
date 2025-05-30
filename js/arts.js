const troop_list = ["31A", "31B", "31C", "31D", "31E", "31F", "31X"];
const showTroopsList = {
    "0": troop_list,
    "2": ["31A", "31B", "31C", "31E"],
    "3": ["31A", "31B", "31C", "31F"],
    "4": ["31A", "31D", "31E", "31F"],
    "6": ["31A", "31E", "31F", "31X"],
} 
const MAX_TROOPS_ARTS_COUNT = 24;
const TROOPS_ARTS_COUNT = {
    "31A": 4,
    "31B": 3,
    "31C": 3,
    "31D": 3,
    "31E": 3,
    "31F": 3,
    "31X": 3,
}

// イベントトリガー設定
function setEventTrigger() {
    // スタイルクリック
    $(".select_arts").on('click', function () {
        let select = $(this).hasClass("selected");
        let troops = $(this).data("troops");

        if (select == "1") {
            released($(this), troops);
        } else {
            selected($(this), troops);
        }
        setDeckCount();
    });
    // 全選択
    $("#btn_select").on('click', function () {
        $(".select_arts").each(function (index, value) {
            if ($(this).is(':visible')) {
                selected($(this));
            }
        });
        $.each(troop_list, function (index, value) {
            saveLocalStrage(value);
        });
        setDeckCount();
    });
    // 全解除
    $("#btn_release").on('click', function () {
        $(".select_arts").each(function (index, value) {
            if ($(this).is(':visible')) {
                released($(this));
            }
        });
        $.each(troop_list, function (index, value) {
            saveLocalStrage(value);
        });
        setDeckCount();
    });
    // 表示変更
    $("#show_arts").on('change', function () {
        let show_list = getShowTroopsList()
        $.each(troop_list, function (index, value) {
            if (show_list.includes(value)) {
                $(`#arts_list_${value}`).show();
            } else {
                $(`#arts_list_${value}`).hide();
            }
        });
        setDeckCount();
    });
    // 生成ボタン
    $('#outputBtn').click(function () {
        combineImagesWithHatching();
    });
}

// 表示部隊リスト取得
function getShowTroopsList() {
    let show_list = showTroopsList[$("#show_arts").val()]
    return show_list
}

// デッキ枚数設定
function setDeckCount() {
    let deck_count = $(".select_arts.selected").filter(':visible').length;
    $("#deck_count").text(deck_count + "枚");
}

// 選択
function selected(item, troops) {
    item.addClass("selected");
    saveLocalStrage(troops);
}

// 解除
function released(item, troops) {
    item.removeClass("selected");
    saveLocalStrage(troops);
}

// 保存
function saveLocalStrage(troops) {
    if (!troops) {
        return;
    }
    let selectValues = [];
    $('#arts_list_' + troops).children().each(function () {
        selectValues.push($(this).hasClass('selected') ? "1" : "0");
    });
    localStorage.setItem("arts_select_" + troops, selectValues.join(','));
}

// 部隊リスト作成
function createTroopList() {
    $.each(troop_list, function (index, value) {
        let div = $("<div>").prop("id", `arts_list_${value}`).addClass(`troops flex flex-wrap troops_${value} h-min`)
        $("#arts_troops").append(div);
    });
}

// アーツリスト作成
function createArtsList() {
    let arts_select_list = new Object();
    $.each(troop_list, function (index, value) {
        arts_select = localStorage.getItem("arts_select_" + value);
        if (arts_select) {
            arts_select_list[value] = arts_select.split(",");
        } else {
            arts_select_list[value] = Array(MAX_TROOPS_ARTS_COUNT).fill(0);
        }
    });
    $.each(arts_list, function (index, value) {
        let source = "arts/" + value.image_url;
        // let opacity = 0.3;
        let idx = (Number(value.rarity) - 1) * 6 + Number(value.chara_id) - 1;
        let select = arts_select_list[value.troops][idx];
        let input = $('<input>')
            .attr("type", "image")
            .attr("src", source)
            .data("select", select)
            .data("troops", value.troops)
            .addClass("select_arts");
        if (select == "1") {
            input.addClass("selected");
        }
        $("#arts_list_" + value.troops).append(input);
    });
    setDeckCount();
}

// 画像を生成して Canvas に描画する関数
function combineImagesWithHatching() {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    // Canvas サイズを設定
    let separate = 5;
    let columns = 12;

    let show_list = getShowTroopsList();
    let rows = getRowSize(show_list);
    // 画像の横幅と高さを半分に縮小
    let scaledWidth = Math.floor(512 / 4);
    let scaledHeight = Math.floor(702 / 4);
    canvas.width = scaledWidth * columns + separate * 3;
    canvas.height = scaledHeight * rows + separate * 3;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let arts_select_list = new Object();
    $.each(troop_list, function (index, value) {
        arts_select = localStorage.getItem("arts_select_" + value);
        if (arts_select) {
            arts_select_list[value] = arts_select.split(",");
        } else {
            arts_select_list[value] = Array(MAX_TROOPS_ARTS_COUNT).fill(0);
        }
    });

    let promises = [];
    // 画像をロードして描画
    $.each(arts_list, function (index, value) {
        if (!show_list.includes(value.troops)) {
            return true;
        }
        let img = $('<img>');
        let idx = (Number(value.rarity) - 1) * 6 + Number(value.chara_id) - 1;
        let select = arts_select_list[value.troops][idx];

        // 画像の読み込みを管理するプロミスを作成し、配列に追加する
        let promise = new Promise(function (resolve, reject) {
            img.on('load', function () {
                let [row, col] = getRowColumn(show_list, value.troops, Number(value.rarity), Number(value.chara_id));
                let adjustRow = (Math.floor(row / 4) + 1) * separate;
                let adjustCol = (Math.floor(col / 6) + 1) * separate;
                context.drawImage(img[0], col * scaledWidth + adjustCol, row * scaledHeight + adjustRow, scaledWidth, scaledHeight);

                // 未所持の場合網掛けを描画
                if (select != "1") {
                    drawHatching(context, col * scaledWidth + adjustCol, row * scaledHeight + adjustRow, scaledWidth, scaledHeight);
                }
                resolve();
            });
            img[0].src = "arts/" + arts_list[index].image_url;
        });
        promises.push(promise);
    });

    Promise.all(promises).then(function () {
        // ダウンロードリンクを作成し、クリック時にダウンロードされるよう設定
        let downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL();
        downloadLink.download = 'arts_deck.png'; // ダウンロード時のファイル名
        downloadLink.click();
    });
}

// 画像の行サイズ取得
function getRowSize(show_list) {
    let stage = 0;
    let add = 0;
    $.each(show_list, function (index, value) {
        if (index % 2 == 0) {
            add = TROOPS_ARTS_COUNT[value];
        } else {
            add = add > TROOPS_ARTS_COUNT[value] ? add : TROOPS_ARTS_COUNT[value];
            stage += add;
            add = 0;
        }
    });
    return stage + add;
}

// 行と列の番号を計算する
function getRowColumn(show_list, troops, rarity, chara_id) {
    let stage = 0;
    let mass = 0;

    let add = 0;
    $.each(show_list, function (index, value) {
        if (value == troops) {
            mass = index % 2;
            return false;
        }
        if (index % 2 == 0) {
            add = TROOPS_ARTS_COUNT[value];
        } else {
            add = add > TROOPS_ARTS_COUNT[value] ? add : TROOPS_ARTS_COUNT[value];
            stage += add;
        }
    });

    let vertical = rarity - 1;
    let beside = chara_id - 1;

    let row = stage + vertical;
    let column = mass * 6 + beside;
    return [row, column];
}

// 網掛けを描画する関数
function drawHatching(context, pos_x, pos_y, width, height) {
    context.beginPath();
    for (var x = 0; x < width; x += 2) {
        context.moveTo(x + pos_x, pos_y);
        context.lineTo(x + pos_x, height + pos_y);
    }
    for (var y = 0; y < height; y += 2) {
        context.moveTo(pos_x, y + pos_y);
        context.lineTo(width + pos_x, y + pos_y);
    }
    context.strokeStyle = 'rgba(0, 0, 0, 1)';
    context.stroke();
}