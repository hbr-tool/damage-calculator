// リンクリスト
const link_list = [
    {url: ".", title: "ダメージ計算ツール"},
    {url: "style_checker.html", title: "スタイル所持率チェッカー"},
]

$(function(){ 
    let ui = $("<ul>").addClass('gNav-menu');
    link_list.forEach(element => {
        ui.append($('<li>').append($('<a>', {class: 'header_link', href: element.url, text: element.title})));
    });
    ui.append($('<li>').append($('<a>', {class: 'header_link', href: "siteinfo.html", text: "このサイトについて"})));
    let headerHTML = $('<div>', {class: 'hamburger'})
        .append($('<img>', {class: 'logo', src: 'img/title_log.png'}))
        .append($('<p>', {class: 'btn-gNav'})
            .append($('<span>'))
            .append($('<span>'))
            .append($('<span>'))
        )
        .append($('<nav>', {class: 'gNav'})
            .append(ui)
        );

    $(".header").append(headerHTML);
    $('.btn-gNav').on("click", function () {
		$('.gNav').toggleClass('open');
	});
});

// キャラ名取得
function getCharaData(chara_id) {
    const filtered_name = chara_data.filter((obj) => obj.chara_id == chara_id);
    return filtered_name.length > 0 ? filtered_name[0] : undefined;
}