let select_troops = localStorage.getItem('select_troops');
let select_style_list = Array(6).fill(undefined);
let sub_style_list = Array(6).fill(undefined);
let support_style_list = Array(6).fill(undefined);
let status_kbn = ["", "str", "dex", "con", "mnd", "int", "luk"];

class Member {
    constructor() {
        this.style_info = null;
        this.is_select = false;
        this.chara_no = -1;
        this.str = 400;
        this.dex = 400;
        this.con = 400;
        this.mnd = 400;
        this.int = 400;
        this.luk = 400;
        this.jewel_lv = 5;
        this.limit_count = 2;
        this.earring = 0;
        this.bracelet = 1;
        this.chain = 3;
        this.init_sp = 1;
        this.passive_skill_list = [];
    }
}

// スタイルリスト作成
function createStyleList() {
    $.each(style_list, function (index, value) {
        let source = "icon/" + value.image_url;
        let chara_data = getCharaData(value.chara_id);
        let input = $('<img>')
            .attr("src", source)
            .attr("title", "[" + value.style_name + "]" + chara_data.chara_name)
            .attr('loading', 'lazy')
            .data("style_id", value.style_id)
            .addClass("select_style_list")
            .addClass("physical_" + chara_data.physical)
            .addClass("element_" + value.element)
            .addClass("element_" + value.element2)
            .addClass("role_" + value.role);
        $("#sytle_list_" + value.rarity + "_" + chara_data.troops.replace("!", "")).append(input);
    });
}

// モーダル系イベント
function addModalEvent() {
    // モーダルを開く
    $('.showmodal').on('click', function () {
        chara_no = $(this).data("chara_no");
        MicroModal.show('modal_style_section');
    });

    let narrow = { "physical": "", "element": "", "role": "" };
    // スタイル絞り込み
    $(".narrow").on('click', function () {
        let classification = "";
        if ($(this).hasClass("physical")) {
            classification = "physical";
        } else if ($(this).hasClass("element")) {
            classification = "element";
        } else {
            classification = "role";
        }

        let selecter = ".narrow" + "." + classification;
        let select = $(this).data("select");

        if (select == "1") {
            $(selecter).css("opacity", "0.3");
            $(selecter).data("select", "1");
            $(this).css("opacity", "1");
            $(this).data("select", "0");
            narrow[classification] = "." + $(this).prop("id");
        } else {
            $(selecter).css("opacity", "1");
            $(selecter).data("select", "1");
            narrow[classification] = "";
        }

        $(".select_style_list").hide();
        let show_class = ".select_style_list" + narrow.physical + narrow.element + narrow.role;
        $(show_class).show();
    });

    // レアリティ変更
    $(".rarity").on('click', function () {
        $(this).css("opacity", "1");
        $(this).data("select", "1");
        if ($(this).prop("id") == "rarity_1") {
            $("#rarity_2").css("opacity", "0.3").data("select", "0");
            $("#rarity_3").css("opacity", "0.3").data("select", "0");
            $("#rank_ss").show();
            $("#rank_s").hide();
            $("#rank_a").hide();
        } else if ($(this).prop("id") == "rarity_2") {
            $("#rarity_1").css("opacity", "0.3").data("select", "0");
            $("#rarity_3").css("opacity", "0.3").data("select", "0");
            $("#rank_ss").hide();
            $("#rank_s").show();
            $("#rank_a").hide();
        } else {
            $("#rarity_1").css("opacity", "0.3").data("select", "0");
            $("#rarity_2").css("opacity", "0.3").data("select", "0");
            $("#rank_ss").hide();
            $("#rank_s").hide();
            $("#rank_a").show();
        }
    });

    // スタイルを選択
    $('img.select_style_list').on('click', function () {
        setMember(chara_no, $(this).data("style_id"), true)
        closeModel();
    });

    // メンバーを外す
    $('.remove_btn').on('click', function () {
        localStorage.removeItem(`troops_${select_troops}_${chara_no}`);
        removeMember(chara_no, true);
        closeModel();
    });
}

// モーダルを閉じる
function closeModel() {
    chara_no = -1;
    MicroModal.close('modal_style_section');
}

// メンバーを設定する。
function setMember(select_chara_no, style_id, isTrigger) {
    let style_info = style_list.find((obj) => obj.style_id === style_id);

    // 同一のキャラIDは不許可
    for (let i = 0; i < select_style_list.length; i++) {
        if (i !== select_chara_no && select_style_list[i]?.style_info.chara_id === style_info.chara_id) {
            alert("同一キャラクターは複数選択できません");
            return false;
        }
    }
    // メンバーの情報を削除
    removeMember(select_chara_no, isTrigger);

    // メンバー情報作成
    let member_info = new Member();
    member_info.is_select = true;
    member_info.chara_no = Number(select_chara_no);
    member_info.style_info = style_info;

    localStorage.setItem(`troops_${select_troops}_${select_chara_no}`, style_id);

    // 画像切り替え
    $('#select_chara_' + select_chara_no).attr("src", "icon/" + style_info.image_url);

    // ステータスを読み込む
    loadStyle(member_info);
    select_style_list[select_chara_no] = member_info;

    $.each(status_kbn, function (index, value) {
        if (index == 0) return true;
        $(`#${value}_${select_chara_no}`).val(member_info[value]);
    });
    $(`#limit_${select_chara_no}`).val(member_info.limit_count);
    $(`#jewel_${select_chara_no}`).val(member_info.jewel_lv);
    $(`#earring_${select_chara_no}`).val(member_info.earring);
    $(`#bracelet_${select_chara_no}`).val(member_info.bracelet);
    $(`#chain_${select_chara_no}`).val(member_info.chain);
    $(`#init_sp_${select_chara_no}`).val(member_info.init_sp);
    changeRarity(select_chara_no, style_info.rarity);
    if (typeof loadMember == "function") {
        loadMember(member_info, isTrigger);
    }
}

// ステータスを保存
function saveStyle(member_info) {
    if (member_info === undefined) {
        return
    }
    if (navigator.cookieEnabled) {
        let style_id = member_info.style_info.style_id;
        let save_item = [member_info.style_info.rarity,
        member_info.str, member_info.dex,
        member_info.con, member_info.mnd,
        member_info.int, member_info.luk,
        member_info.limit_count, member_info.jewel_lv,
        member_info.earring, member_info.bracelet,
        member_info.chain, member_info.init_sp].join(",");
        localStorage.setItem(`style_${style_id}`, save_item);
    }
}

// ステータスを読み込む
function loadStyle(member_info) {
    let style_id = member_info.style_info.style_id;
    let save_item = localStorage.getItem("style_" + style_id);
    if (save_item) {
        let items = save_item.split(",");
        $.each(status_kbn, function (index, value) {
            if (index == 0) return true;
            member_info[value] = Number(items[index]);
        });
        member_info.limit_count = Number(items[7]);
        member_info.jewel_lv = Number(items[8]);
        if (items.length > 9) {
            member_info.earring = Number(items[9]);
            member_info.bracelet = Number(items[10]);
            member_info.chain = Number(items[11]);
            member_info.init_sp = Number(items[12]);
        }
    }
}

// パッシブスキルを保存
function savePassiveSkill(member_info) {
    let style_id = member_info.style_info.style_id;
    localStorage.setItem(`passive_${style_id}`, member_info.passive_skill_list.join(","));
}

// パッシブスキルを読み込む
function loadPassiveSkill(member_info) {
    let style_id = member_info.style_info.style_id;
    let passive_list = localStorage.getItem(`passive_${style_id}`);
    if (passive_list) {
        member_info.passive_skill_list = passive_list.split(",").map(Number);
    }
}

// メンバーを外す
function removeMember(select_chara_no, isTrigger) {
    if (select_style_list[select_chara_no] === undefined) {
        return;
    }
    // 入れ替えスタイルのスキルを削除
    let chara_id = select_style_list[select_chara_no].style_info.chara_id;
    let chara_id_class = ".chara_id-" + chara_id;
    let parent = $(".include_lv " + chara_id_class + ":selected").parent();
    $.each(parent, function (index, value) {
        // 暫定的にdisplay:none追加
        $(value).find(chara_id_class).css("display", "none");
        select2ndSkill($("#" + $(value).prop("id")));
    });
    // 該当メンバーのスキル削除
    $(chara_id_class).remove();
    $(".display_chara_id-" + chara_id).removeClass(`block_chara_id-${chara_id}`);
    $(".display_chara_id-" + chara_id + " input").prop("checked", false);
    $(".display_chara_id-" + chara_id + " input").trigger("change");
    select_style_list[select_chara_no] = undefined;
    // 消費SP初期化
    $('#sp_cost_' + select_chara_no).text(0);
    // 画像初期化
    $('#select_chara_' + select_chara_no).attr("src", "img/plus.png");
    if (isTrigger) {
        $("#attack_list").trigger("change");
    }
}

// 部隊リストの呼び出し
function loadTroopsList(troops_no) {
    for (let i = 0; i < 6; i++) {
        const style_id = localStorage.getItem(`troops_${troops_no}_${i}`);
        if (style_id !== null) {
            setMember(i, Number(style_id), false);
        }
    }
    $("#attack_list").trigger("change");
}

// サブ部隊リストの呼び出し
function loadSubTroopsList(troops_no) {
    // 既存のメンバーの情報を削除
    for (let i = 0; i < 6; i++) {
        removeSubMember(i);
    }

    // 新規メンバーの情報追加
    for (let i = 0; i < 6; i++) {
        const style_id = localStorage.getItem(`troops_${troops_no}_${i}`);
        if (style_id !== null) {
            setSubMember(i, Number(style_id));
        }
    }
    $("#attack_list").trigger("change");
}

// サブパーティのメンバーを設定する。
function setSubMember(sub_chara_no, style_id) {
    let style_info = style_list.find((obj) => obj.style_id === style_id);

    let isDuplication = false;
    // 同一のキャラIDがあるかどうかをチェック
    for (let style of Object.values(select_style_list)) {
        if (style?.style_info?.chara_id === style_info.chara_id) {
            isDuplication = true;
            break;
        }
    }

    // メンバー情報作成
    let member_info = new Member();
    member_info.style_info = style_info;
    member_info.chara_no = Number(sub_chara_no) + 10;

    // 画像切り替え
    $('#sub_chara_' + sub_chara_no).attr("src", "icon/" + style_info.image_url);

    if (isDuplication) {
        $('#sub_chara_container_' + sub_chara_no).addClass("ban_style");
        sub_style_list[sub_chara_no] = undefined;
        return false;
    }

    // ステータスを読み込み
    loadStyle(member_info);
    sub_style_list[sub_chara_no] = member_info;

    // デバフのみを追加
    addBuffList(member_info, 1);
    // フィールドのみ追加
    addAbility(member_info);
    addPassive(member_info);
}

// メンバーを外す
function removeSubMember(sub_chara_no) {
    // 画像初期化
    $('#sub_chara_' + sub_chara_no).attr("src", "img/cross.png");
    $('#sub_chara_container_' + sub_chara_no).removeClass("ban_style");

    let member_info = sub_style_list[sub_chara_no]
    if (member_info === undefined) {
        return;
    }
    // 入れ替えスタイルのスキルを削除
    let chara_id = member_info.style_info.chara_id;
    let chara_id_class = ".chara_id-" + chara_id;
    let parent = $(".include_lv " + chara_id_class + ":selected").parent();
    $.each(parent, function (index, value) {
        // 暫定的にdisplay:none追加
        $(value).find(chara_id_class).css("display", "none");
        select2ndSkill($("#" + $(value).prop("id")));
    });
    // 該当メンバーのスキル削除
    $(chara_id_class).remove();
    $(".display_chara_id-" + chara_id).removeClass(`block_chara_id-${chara_id}`);
    $(".display_chara_id-" + chara_id + " input").prop("checked", false);
    $(".display_chara_id-" + chara_id + " input").trigger("change");
    sub_style_list[sub_chara_no] = undefined;
}

// サポートメンバーを外す
function removeSupportMember(support_chara_no) {
    let member_info = support_style_list[support_chara_no]
    if (member_info === undefined) {
        return;
    }
    // 入れ替えスタイルのスキルを削除
    let chara_id = member_info.style_info.chara_id;
    let chara_id_class = ".chara_id-" + chara_id;
    let parent = $(".include_lv " + chara_id_class + ":selected").parent();
    $.each(parent, function (index, value) {
        // 暫定的にdisplay:none追加
        $(value).find(chara_id_class).css("display", "none");
        select2ndSkill($("#" + $(value).prop("id")));
    });
    // 該当メンバーのスキル削除
    $(chara_id_class).remove();
    $(".display_chara_id-" + chara_id).removeClass(`block_chara_id-${chara_id}`);
    $(".display_chara_id-" + chara_id + " input").prop("checked", false);
    $(".display_chara_id-" + chara_id + " input").trigger("change");
    support_style_list[support_chara_no] = undefined;
}

// スタイルリセット
function styleReset(isLocalStorageReset) {
    $.each(select_style_list, function (index, value) {
        if (index > 5) {
            return false;
        }
        if (value) {
            removeMember(index, false);
            if (isLocalStorageReset) {
                localStorage.removeItem(`troops_${select_troops}_${index}`);
            }
        }
    });
    $("#attack_list").trigger("change");
}

// レアリティ対応
function changeRarity(select_chara_no, rarity) {
    $("#limit_" + select_chara_no).prop("disabled", false);
    if (rarity == 1) {
        $("#jewel_" + select_chara_no).prop("disabled", false);
        $('#limit_' + select_chara_no + ' option[value="10"]').css('display', 'none');
        $('#limit_' + select_chara_no + ' option[value="20"]').css('display', 'none');
    } else {
        $("#limit_" + select_chara_no).prop("disabled", true);
        if (rarity == 2) {
            $("#jewel_" + select_chara_no).prop("disabled", false);
            $('#limit_' + select_chara_no + ' option[value="10"]').css('display', 'block');
            $('#limit_' + select_chara_no).val(10);
            select_style_list[select_chara_no].limit_count = 10;
        } else {
            $("#jewel_" + select_chara_no).val(0);
            $("#jewel_" + select_chara_no).prop("disabled", true);
            $('#limit_' + select_chara_no + ' option[value="20"]').css('display', 'block');
            $('#limit_' + select_chara_no).val(20);
            select_style_list[select_chara_no].limit_count = 20;
        }
    }
}