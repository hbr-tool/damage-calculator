// スタイルリスト作成
function createStyleList() {
    $.each(style_list, function(index, value) {
    	let source = "icon/" + value.image_url;
    	let input = $('<input>')
            .attr("type", "image")
            .attr("src", source)
            .attr("title", "[" + value.style_name + "]" + chara_full_name[value.chara_id])
            .data("style_id", value.style_id)
            .addClass("select_style")
            .addClass("physical_" + value.physical)
            .addClass("element_" + value.element)
            .addClass("role_" + value.role);
    	$("#sytle_list_" + value.troops).append(input);
    });
}

// モーダル系イベント
function addModalEvent() {
    // モーダルを開く
    $('.showmodal').on('click', function() {
        chara_no = $(this).data("chara_no");
        $('.modal_layer').addClass('isShow');
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

        $(".select_style").hide();
        let show_class = ".select_style" + narrow.physical + narrow.element + narrow.role;
        $(show_class).show();
    });

    // スタイルを選択
    $('.select_style').on('click', function(){
        setMember($(this).data("style_id"))
        closeModel();
    });

    // メンバーを外す
    $('.remove_btn').on('click', function() {
        localStorage.removeItem(`troops_${select_troops}_${chara_no}`);
        removeMember();
        closeModel();
    });

    // モーダルを閉じる
    $('.modal_layer_mask').on('click', function() {
        closeModel();
    });
}

// モーダルを閉じる
function closeModel() {
    chara_no = 0;
    $('.modal_layer').removeClass('isShow');
}

// メンバーを設定する。
function setMember(style_id) {
    let style_ifo = style_list.find((obj) => obj.style_id === style_id);

    // 同一のキャラIDは不許可
    for(let idx in select_style_list) {
        if (select_style_list[idx].chara_id === style_ifo.chara_id && chara_no != idx) {
            alert("同一キャラクターは複数選択できません");
            return false;
        }
    }
    // メンバーの情報を削除
    removeMember();
    
    // 画像切り替え
    select_style_list[chara_no] = style_ifo;
    localStorage.setItem(`troops_${select_troops}_${chara_no}`, style_id);

    $('[data-chara_no="' + chara_no + '"]').attr("src", "icon/" + style_ifo.image_url);

    // 宝珠スキルタイプを設定
    $("#jewel_type_" + chara_no).val(style_ifo.jewel_type);
    // ステータスを設定
    for (let j = 1; j < status_kbn.length; j++) {
        const status = localStorage.getItem(status_kbn[j] + "_" + style_ifo.chara_id);
        if (status) $("#" + status_kbn[j] + "_" + chara_no).val(status);
    }
    const jewel_status = localStorage.getItem("jewel_" + style_ifo.chara_id);
    if (jewel_status) $("#jewel_" + chara_no).prop("selectedIndex", jewel_status);
    const limit_status = localStorage.getItem("limit_" + style_ifo.chara_id);
    if (limit_status) $("#limit_" + chara_no).prop("selectedIndex", limit_status);

    // スキル・バフ・アビリティを追加
    addAttackList(style_ifo, chara_no);
    addBuffList(style_ifo, chara_no);
    addAbility(style_ifo, chara_no);
    $("#attack_list").trigger("change");
}

// メンバーを外す
function removeMember() {
    // 入れ替えスタイルのスキルを削除
    let chara_id_class = ".chara_id-" + select_style_list[chara_no].chara_id;
    let parent = $(".include_lv " + chara_id_class + ":selected").parent();
    $.each(parent, function(index, value) {
        // 暫定的にdisplay:none追加
        $(value).find(chara_id_class).css("display", "none");
        select2ndSkill($("#" + $(value).prop("id")));
    });
    // 該当メンバーのスキル削除
    $(chara_id_class).remove();
    select_style_list[chara_no] = 0;

    // 画像初期化
    $('[data-chara_no="' + chara_no + '"]').attr("src", "img/plus.png");
    // スキル情報編集
    $("#attack_list").trigger("change");
}

// 部隊リストの呼び出し
function loadTroopsList(troops_no) {
    for (let j = 0; j < 6; j++) {
        const style_id = localStorage.getItem(`troops_${troops_no}_${j}`);
        if (style_id !== null) {
            chara_no = j;
            setMember(Number(style_id));
        }
    }
}

// スタイルリセット
function styleReset(isLocalStorageReset) {
    for (let i = 0; i < select_style_list.length; i++) {
        if (select_style_list[i] !== 0) {
            chara_no = i;
            removeMember();
            if (isLocalStorageReset) {
                localStorage.removeItem(`troops_${select_troops}_${chara_no}`);
            }
        }
    }
}