// ヘッダーリンク設定
function setHeaderLink() {
    // ダメージ計算ツール
    $('#damage-calculator').on('click', function() {
        window.location.href = '.';
    });

    // スタイルチェッカー
    $('#style-checker').on('click', function() {
        window.location.href = 'style_checker.html';
    });
}

var menu3bar_off = function(e) {
    var elm = e.target ? (e.target.nodeType == 3 ? e.target.parentNode : e.target) : (window.event.srcElement ? window.event.srcElement : "");
    if(!elm || $(elm).parents(".menu3bar")[0]) {
        return "";
    }

    $(document.body).unbind("touchend", menu3bar_off);
    $(document.body).unbind("click", menu3bar_off);

    $(".menu3bar_on").removeClass("menu3bar_on");
};
var menu3bar = function(self) {
    if($(self).hasClass("menu3bar_on") ) {
        return "";
    }

    $(self).addClass("menu3bar_on");

    $(document.body).unbind("touchend", menu3bar_off).bind("touchend", menu3bar_off);
    $(document.body).unbind("click", menu3bar_off).bind("click", menu3bar_off);
};

/*
$(document).ready(function() {
    if(navigator.userAgent.indexOf("Android 2.") === -1) {
        return "";
    }
    $("div.menu3bar > ul").css( {
        "position": "absolute",
        "max-height": "none",
    } );
} );*/