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
        this.exclusion_skill_list = [];
    }
}

// メンバーを設定する。
function setMember(select_list, select_chara_no, style_id, isTrigger) {
    let style_info = style_list.find((obj) => obj.style_id === style_id);

    // 同一のキャラIDは不許可
    for (let i = 0; i < select_list.length; i++) {
        if (i !== select_chara_no && select_list[i]?.style_info.chara_id === style_info?.chara_id) {
            // メンバーを入れ替える
            select_list[i] = select_list[select_chara_no];
            localStorage.setItem(`troops_${select_troops}_${i}`, select_list[i] ? select_list[i].style_info.style_id : null);
        }
    }
    // メンバーの情報を削除
    if (typeof removeMember == "function") {
        removeMember(select_list, select_chara_no, isTrigger);
    }

    // メンバー情報作成
    let member_info = new Member();
    member_info.is_select = true;
    member_info.chara_no = Number(select_chara_no);
    member_info.style_info = style_info;

    localStorage.setItem(`troops_${select_troops}_${select_chara_no}`, style_id);

    // ステータスを読み込む
    loadStyle(member_info);
    select_list[select_chara_no] = member_info;

    if (typeof updateMember == "function") {
        updateMember();
    }

    if (typeof loadMember == "function") {
        loadMember(select_chara_no, member_info, isTrigger);
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

// 部隊リストの呼び出し
function loadTroopsList(select_list, troops_no) {
    for (let i = 0; i < 6; i++) {
        const style_id = localStorage.getItem(`troops_${troops_no}_${i}`);
        if (!isNaN(style_id) && Number(style_id) !== 0) {
            setMember(select_list, i, Number(style_id), false);
        }
    }
    $("#attack_list").trigger("change");
}

/** 部隊変更共通部 */
// スタイルリセット
function styleReset(select_list, isLocalStorageReset) {
    $.each(select_list, function (index, value) {
        if (index > 5) {
            return false;
        }
        if (value) {
            // メンバーの情報を削除
            if (typeof removeMember == "function") {
                removeMember(select_list, index, false);
            }
            select_list[index] = undefined;
            if (isLocalStorageReset) {
                localStorage.removeItem(`troops_${select_troops}_${index}`);
            }
        }
    });
    $("#attack_list").trigger("change");
}

/** ダメージ計算ツール */
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
