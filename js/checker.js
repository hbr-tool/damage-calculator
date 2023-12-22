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
}

// Twitter起動
function shareOnTwitter(message) {
    // エンコードされたメッセージを生成
    var encodedMessage = encodeURIComponent(message);
    var hashtags = "ヘブバン,ヘブバンスタイル所持率チェッカー";
    var url = location.href;
    // TwitterのシェアURLを生成
    var twitterURL = 'https://twitter.com/share?text=';
    if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('iPad') > 0 || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
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