// イベントトリガー設定
function setEventTrigger() {
    // スタイルクリック
    $(".select_arts").on('click', function () {
        let select = $(this).data("select");
        let troops = $(this).data("troops");

        if (select == "1") {
            released($(this), troops);
            deck_count -= 1;
        } else {
            selected($(this), troops);
            deck_count += 1;
        }
        setDeckCount();
    });
    // 全選択
    $("#btn_select").on('click', function () {
        $(".select_arts").each(function (index, value) {
            selected($(this));
        });
        $.each(troop_list, function (index, value) {
            saveLocalStrage(value);
        });
        deck_count = arts_list.length;
        setDeckCount();
    });
    // 全解除
    $("#btn_release").on('click', function () {
        $(".select_arts").each(function (index, value) {
            released($(this));
        });
        $.each(troop_list, function (index, value) {
            saveLocalStrage(value);
        });
        deck_count = 0;
        setDeckCount();
    });
    // 生成ボタン
    $('#outputBtn').click(function () {
        combineImagesWithHatching();
    });
}

// デッキ枚数設定
function setDeckCount() {
    $("#deck_count").text(deck_count + "枚");
}

// 選択
function selected(item, troops) {
    item.css("opacity", "1");
    item.data("select", "1");
    saveLocalStrage(troops);
}

// 解除
function released(item, troops) {
    item.css("opacity", "0.3");
    item.data("select", "0");
    saveLocalStrage(troops);
}

// 保存
function saveLocalStrage(troops) {
    if (!troops) {
        return;
    }
    let selectValues = [];
    $('#arts_list_' + troops).children().each(function () {
        selectValues.push($(this).data('select'));
    });
    localStorage.setItem("arts_select_" + troops, selectValues.join(','));
}

// アーツリスト作成
function createArtsList() {
    let arts_select_list = new Object();
    $.each(troop_list, function (index, value) {
        arts_select = localStorage.getItem("arts_select_" + value);
        if (arts_select) {
            arts_select_list[value] = arts_select.split(",");
        } else {
            arts_select_list[value] = Array(24).fill(0);
        }
    });
    $.each(arts_list, function (index, value) {
        let source = "arts/" + value.image_url;
        let opacity = 0.3;
        let idx = (Number(value.rarity) - 1) * 6 + Number(value.chara_id) - 1;
        let select = arts_select_list[value.troops][idx];
        if (select == "1") {
            deck_count += 1;
            opacity = 1;
        }

        let input = $('<input>')
            .attr("type", "image")
            .attr("src", source)
            .data("select", select)
            .data("troops", value.troops)
            .addClass("select_arts")
            .css("opacity", opacity);
        $("#arts_list_" + value.troops.replace("!", "")).append(input);
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
    let rows = 10;
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
            arts_select_list[value] = Array(24).fill(0);
        }
    });

    let promises = [];
    // 画像をロードして描画
    $.each(arts_list, function (index, value) {
        let img = $('<img>');
        let idx = (Number(value.rarity) - 1) * 6 + Number(value.chara_id) - 1;
        let select = arts_select_list[value.troops][idx];

        // 画像の読み込みを管理するプロミスを作成し、配列に追加する
        let promise = new Promise(function (resolve, reject) {
            img.on('load', function () {
                let [row, col] = getRowColumn(value.troops, Number(value.rarity), Number(value.chara_id));
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

    Promise.all(promises).then(function() {
        // ダウンロードリンクを作成し、クリック時にダウンロードされるよう設定
        let downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL();
        downloadLink.download = 'arts_deck.png'; // ダウンロード時のファイル名
        downloadLink.click();
    });
}

// 行と列の番号を計算する
function getRowColumn(troops, rarity, chara_id) {
    let stage = 0;
    let mass = 0;
    if (troops == "31A") {
        stage = 0;
        mass = 0;
    } else if (troops == "31B") {
        stage = 0;
        mass = 1;
    } else if (troops == "31C") {
        stage = 4;
        mass = 0;
    } else if (troops == "31E") {
        stage = 4;
        mass = 1;
    } else if (troops == "31F") {
        stage = 7;
        mass = 0;
    }

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