class Member {
    constructor() {
        this.style_info = null;
        this.is_select = false;
        this.chara_no = -1;
        this.str = 0;
        this.dex = 0;
        this.con = 0;
        this.mnd = 0;
        this.int = 0;
        this.luk = 0;
        this.jewel_lv = 0;
        this.limit_count = 0;
    }
}

// スタイルリスト作成
function createStyleList() {
    $.each(style_list, function(index, value) {
        if (value.rarity != 1 && value.chara_id != 104) {
            return true;
        }
    	let source = "icon/" + value.image_url;
        let chara_data = getCharaData(value.chara_id);
    	let input = $('<input>')
            .attr("type", "image")
            .attr("src", source)
            .attr("title", "[" + value.style_name + "]" + chara_data.chara_name)
            .data("style_id", value.style_id)
            .addClass("select_style_list")
            .addClass("physical_" + chara_data.physical)
            .addClass("element_" + value.element)
            .addClass("element_" + value.element2)
            .addClass("role_" + value.role);
    	$("#sytle_list_" + chara_data.troops.replace("!", "")).append(input);
    });
}

// モーダル系イベント
function addModalEvent() {
    // モーダルを開く
    $('.showmodal').on('click', function() {
        chara_no = $(this).data("chara_no");
        MicroModal.show('modal_style_section');
    });

    let narrow = {"physical": "", "element": "", "role": "" };
    // スタイル絞り込み
    $(".narrow").on('click', function() {
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

    // スタイルを選択
    $('input.select_style_list').on('click', function(){
        setMember(chara_no, $(this).data("style_id"), true)
        closeModel();
    });

    // メンバーを外す
    $('.remove_btn').on('click', function() {
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

    // ステータスを設定
    $.each(status_kbn, function(index, value) {
        if (index == 0) return true;
        let status = localStorage.getItem(value + "_" + style_info.chara_id);
        if (status === null || status === undefined) {
            status = 400;
            localStorage.setItem(value + "_" + style_info.chara_id, status);
        }
        $("#" + value + "_" + select_chara_no).val(status);
        member_info[value] = Number(status);
    });
    let jewel = localStorage.getItem("jewel_" + style_info.chara_id);
    if (jewel === null || jewel === undefined) {
        jewel = 5;
        localStorage.setItem("jewel_" + style_info.chara_id, jewel);
    }
    $("#jewel_" + select_chara_no).val(jewel);
    member_info.jewel_lv = Number(jewel);

    let limit_count = localStorage.getItem("limit_" + style_info.chara_id);
    if (limit_count === null || limit_count === undefined) {
        limit_count = 2;
        localStorage.setItem("limit_" + style_info.chara_id, limit_count);
    }
    $("#limit_" + select_chara_no).val(limit_count);
    member_info.limit_count = Number(limit_count);

    select_style_list[select_chara_no] = member_info;
    // スキル・バフ・アビリティを追加
    addAttackList(member_info);
    addBuffList(member_info);
    addAbility(member_info);

    if (isTrigger) {
        $("#attack_list").trigger("change");
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
    $.each(parent, function(index, value) {
        // 暫定的にdisplay:none追加
        $(value).find(chara_id_class).css("display", "none");
        select2ndSkill($("#" + $(value).prop("id")));
    });
    // 該当メンバーのスキル削除
    $(chara_id_class).remove();
    select_style_list[select_chara_no] = undefined;
    
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

    // ステータスを設定
    $.each(status_kbn, function(index, value) {
        if (index == 0) return true;
        const status = localStorage.getItem(value + "_" + style_info.chara_id);
        if (status) member_info[value] = Number(status);
    });
    const jewel = localStorage.getItem("jewel_" + style_info.chara_id);
    if (jewel) member_info.jewel_lv = Number(jewel);;
    const limit_count = localStorage.getItem("limit_" + style_info.chara_id);
    if (limit_count) member_info.limit_count = Number(limit_count);

    sub_style_list[sub_chara_no] = member_info;

    // デバフのみを追加
    addBuffList(member_info);
    // フィールドのみ追加
    addAbility(member_info);
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
    let chara_id_class = ".chara_id-" + member_info.style_info.chara_id;
    let parent = $(".include_lv " + chara_id_class + ":selected").parent();
    $.each(parent, function(index, value) {
        // 暫定的にdisplay:none追加
        $(value).find(chara_id_class).css("display", "none");
        select2ndSkill($("#" + $(value).prop("id")));
    });
    // 該当メンバーのスキル削除
    $(chara_id_class).remove();   
    sub_style_list[sub_chara_no] = undefined;
}

// スタイルリセット
function styleReset(isLocalStorageReset) {
    $.each(select_style_list, function(index, value) {
        if (value) {
            removeMember(index, false);
            if (isLocalStorageReset) {
                localStorage.removeItem(`troops_${select_troops}_${index}`);
            }
        }
    });
    $("#attack_list").trigger("change");
}