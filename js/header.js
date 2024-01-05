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
