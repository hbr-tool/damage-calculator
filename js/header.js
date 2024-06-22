// リンクリスト
const link_list = [
    {url: ".", title: "ダメージ計算ツール"},
//    {url: "spod_sim.html", title: "SP/ODシミュレータ"},
    {url: "style_checker.html", title: "スタイル所持率チェッカー"},
    {url: "arts_list.html", title: "アーツデッキ画像生成"},
    {url: "chara_mgmt.html", title: "キャラ管理ツール"},
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
