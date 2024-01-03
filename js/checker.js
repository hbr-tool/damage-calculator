// イベントトリガー設定
function setEventTrigger() {
    // スタイル絞り込み
    $(".select_style").on('click', function() {
        let select = $(this).data("select");
        if (select == "1") {
            released($(this));
            select_count -= 1;
        } else {
            selected($(this));
            select_count += 1;
        }
        $("#style_select").text(select_count)
        setRateComplate();
    });

    // 全選択
    $("#btn_select").on('click', function() {
        $(".select_style").each(function(index, value) {
            selected($(this));
        });
        select_count = style_list.length;
        $("#style_select").text(select_count);
        setRateComplate();
    });
    // 全解除
    $("#btn_release").on('click', function() {
        $(".select_style").each(function(index, value) {
            released($(this));
        });
        select_count = 0;
        $("#style_select").text(select_count);
        setRateComplate();
    });

    // ツイート
    $(".btn_post").on('click', function() {
        let rate_complate = Math.floor(select_count / style_list.length * 1000) / 10;
        let message = `私のSSスタイル所持率は\r\n${select_count}/${style_list.length}(コンプリート率${rate_complate}%)です。\r\n`;
        shareOnTwitter(message);
    });

    //生成ボタン
    $('#openModalBtn').click(function () {
        $('#modalOverlay, #modalContent').fadeIn();
        let target = $('input[name="target"]:checked').val();

        var filtered_style_list = style_list.filter(function(style) {
            let select = localStorage.getItem("style_has_" + style.style_id);
            return target == "all" || select == "1";
        });
        combineImagesWithHatching(filtered_style_list);
    });

    // モーダル解除
    $('#modalOverlay').click(function () {
        $('#modalOverlay, #modalContent').fadeOut();
    });
}


// Twitter起動
function shareOnTwitter(message) {
    // エンコードされたメッセージを生成
    var encodedMessage = encodeURIComponent(message);
    var hashtags = "ヘブバン,ヘブバンスタイル所持率チェッカー";
    var url = location.href;
    // TwitterのシェアURLを生成
    var twitterURL = 'https://twitter.com/share?text=';
    if (window.matchMedia('(max-width: 767px)').matches) {
        // ウィンドウの幅が767px以下（モバイルデバイス）の場合
        twitterURL = 'https://twitter.com/intent/tweet?text=';
    }
    twitterURL += encodedMessage + "&hashtags=" + hashtags + "&url=" + url;
    // aタグを生成
    var link = $('<a>')
        .attr('href', twitterURL)
        .attr('target', '_blank');
    // ページにaタグを追加
    $('body').append(link);
    // aタグをクリックしてTwitterを開く
    link[0].click();
    // aタグを削除
    link.remove();
}

// 選択
function selected(item) {
    item.css("opacity", "1");
    item.data("select", "1");
    saveLocalStrage(item.data("style_id"), "1");
}

// 解除
function released(item) {
    item.css("opacity", "0.3");
    item.data("select", "0");
    saveLocalStrage(item.data("style_id"), "0");
}

// 保存
function saveLocalStrage(style_id, select) {
    localStorage.setItem("style_has_" + style_id, select);
}

// スタイルリスト作成
function createStyleList() {
    $.each(style_list, function(index, value) {
        let source = "icon/" + value.image_url;
        let select = localStorage.getItem("style_has_" + value.style_id);
        let opacity = 0.3;
        if (select === null) select = "0"
        if (select == "1") {
            select_count += 1;
            opacity = 1;
        }

        let input = $('<input>')
            .attr("type", "image")
            .attr("src", source)
            .attr("title", "[" + value.style_name + "]" + chara_full_name[value.chara_id])
            .data("style_id", value.style_id)
            .data("select", select)
            .addClass("select_style")
            .css("opacity", opacity);
        $("#sytle_list_" + value.troops).append(input);
    });
    $("#style_all").text(style_list.length);
    $("#style_select").text(select_count);
    setRateComplate();
}

// コンプリート率設定
function setRateComplate() {
    // 小数点以下2位切り捨て
    let rate_complate = Math.floor(select_count / style_list.length * 1000) / 10;
    $("#rate_complate").text(rate_complate + "%");
}

// 比較関数
function compare( a, b ){
    var r = 0;
    if( a.chara_id < b.chara_id ){ r = -1; }
    else if( a.chara_id > b.chara_id ){ r = 1; }
    return r;
}

 // 画像を生成して Canvas に描画する関数
 function combineImagesWithHatching(create_style) {
    var canvasContainer = $('#canvas-container');
    canvasContainer.empty(); // コンテナをクリア
    var canvas = $('<canvas>');
    var context = canvas[0].getContext('2d');

    // Canvas サイズを設定
    var columns = 4;
    var rows = Math.ceil(create_style.length / columns);
    // 画像の横幅と高さを半分に縮小
    var scaledWidth = 376 / 2;
    var scaledHeight = 144 / 2;
    canvas[0].width = scaledWidth * columns;
    canvas[0].height = scaledHeight * rows;

    // Canvas をコンテナに追加
    canvasContainer.append(canvas);

    // 画像をロードして描画
    var loadedImages = 0;

    function loadImageAndDraw(index, style_info) {
        var img = $('<img>');
        let select = localStorage.getItem("style_has_" + style_info.style_id);
        img[0].onload = function () {
            var row = Math.floor(index / columns);
            var col = index % columns;
            context.drawImage(img[0], col * scaledWidth, row * scaledHeight, scaledWidth, scaledHeight);

            // 未所持の場合網掛けを描画
            if (select != "1") {
                drawHatching(context, col * scaledWidth, row * scaledHeight, scaledWidth, scaledHeight);
            }
            loadedImages++;
        };
        let path = "select/" + style_info.image_url.replace("Thumbnail", "Select");
        img[0].src = path;
    }

    // 画像をロードして描画
    for (var i = 0; i < create_style.length; i++) {
      loadImageAndDraw(i, create_style[i]);
    }
}

// 網掛けを描画する関数
function drawHatching(context, pos_x, pos_y ,width, height) {
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