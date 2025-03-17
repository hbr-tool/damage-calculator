let select_troops = localStorage.getItem('select_troops');
let select_style_list = Array(6).fill(undefined);
let sub_style_list = Array(6).fill(undefined);
let support_style_list = Array(6).fill(undefined);
let ref_status_list = {};
let chara_sp_list = [];

function setEventTrigger() {
    // 攻撃スキル変更
    $("#attack_list").on("change", function (event) {
        let attack_info = getAttackInfo();
        if (select_attack_skill !== undefined) {
            $("." + type_physical[select_attack_skill.attack_physical]).removeClass("selected");
            $("." + type_element[select_attack_skill.attack_element]).removeClass("selected");

            if (attack_info === undefined || select_attack_skill.chara_id !== attack_info.chara_id) {
                toggleItemVisibility(`.only_chara_id-${select_attack_skill.chara_id}`, false);
            }
            if (attack_info === undefined || select_attack_skill.style_element) {
                toggleItemVisibility(`.buff_target_element-${select_attack_skill.style_element}`, false);
                toggleItemVisibility(`.buff_target_element-${select_attack_skill.style_element2}`, false);
            }
            if (attack_info === undefined || select_attack_skill.attack_id !== attack_info.attack_id) {
                toggleItemVisibility(`.skill_attack-${select_attack_skill.attack_id}`, false);
            }
            if (select_attack_skill.attack_element !== 0 && (attack_info === undefined || select_attack_skill.attack_element !== attack_info.attack_element)) {
                toggleItemVisibility(`.buff_element-${select_attack_skill.attack_element}`, false);
                toggleItemVisibility(`.row_element-${select_attack_skill.attack_element}`, false);
                $(`.buff_element-${select_attack_skill.attack_element} > input:not(':disabled')`).prop("checked", false);
            }
            if (attack_info === undefined || select_attack_skill.attack_physical !== attack_info.attack_physical) {
                toggleItemVisibility(`.buff_physical-${select_attack_skill.attack_physical}`, false);
                $(`.buff_physical-${select_attack_skill.attack_physical} > input:not(':disabled')`).prop("checked", false);
            }
            // キャラ、スタイル専用非表示
            $(".skill_unique").hide();

            $(".status_attack_skill").removeClass("status_attack_skill");
            // 敵情報初期化
            resetEnemyResist();
        }
        if (attack_info === undefined) {
            $("#attack_physical, #attack_element").attr("src", "img/blank.png");
            $("div.footer").hide();
            // 選択無しの場合は、削除のみ
            return;
        }
        select_attack_skill = attack_info;
        let max_lv = attack_info.max_lv;
        let chara_id = $(this).find("option:selected").data("chara_id");
        let member_info = getCharaIdToMember(chara_id);
        let chara_id_class = "chara_id-" + attack_info.chara_id;
        let style_id_class = "style_id-" + attack_info.style_id;
        let attack_id_class = "attack_id-" + attack_info.attack_id;
        toggleItemVisibility(`.public.buff_element-0.buff_physical-0`, true);
        if (attack_info.attack_element != 0) {
            toggleItemVisibility(`.public.buff_element-${attack_info.attack_element}`, true);
        }
        if (attack_info.attack_physical != 0) {
            toggleItemVisibility(`.public.buff_physical-${attack_info.attack_physical}`, true);
        }
        toggleItemVisibility(`.only_${chara_id_class}.buff_element-0.skill_attack-0`, true);
        toggleItemVisibility(`.only_${chara_id_class}.buff_element-0.skill_attack-999`, true);
        toggleItemVisibility(`.only_${chara_id_class}.buff_element-0.skill_attack-${attack_info.attack_id}`, true);
        $(".ability_self").hide();
        $(".passive_div").hide();
        $(".passive_all").show();
        if (attack_info.attack_element !== 0) {
            $("#elememt_ring").prop("disabled", false);
            toggleItemVisibility(`.self_element-${attack_info.attack_element}.${chara_id_class}`, true);
            toggleItemVisibility(`.only_${chara_id_class}.buff_element-${attack_info.attack_element}.skill_attack-0`, true);
            toggleItemVisibility(`.only_${chara_id_class}.buff_element-${attack_info.attack_element}.skill_attack-999`, true);
            toggleItemVisibility(`.only_${chara_id_class}.buff_element-${attack_info.attack_element}.skill_attack-${attack_info.attack_id}`, true);
        } else {
            $("#elememt_ring").prop("disabled", true);
            $("#elememt_ring").prop("selectedIndex", 0);
        }
        toggleItemVisibility(`.self_element-0.${chara_id_class}`, true);
        // キャラ、スタイル、スキル専用表示
        toggleItemVisibility(`.attack_${attack_id_class}`, true);
        toggleItemVisibility(`.attack_${style_id_class}`, true);
        toggleItemVisibility(`.attack_${chara_id_class}`, true);
        $(`.passive_${chara_id_class}`).show();
        // スタイル属性専用を非表示
        for (let i = 1; i <= 5; i++) {
            if (attack_info.style_element != i && attack_info.style_element2 != i) {
                toggleItemVisibility(`.buff_target_element-${i}`, false);
            }
        }

        // 該当ステータスに着色
        let list = [];
        for (let i = 1; i <= 3; i++) {
            if (status_kbn[attack_info["ref_status_" + i]]) {
                list.push(status_kbn[attack_info["ref_status_" + i]] + attack_info.chara_id);
            }
        }
        ref_status_list["status_attack"] = list;

        $("input[type=checkbox].ability").each(function (index, value) {
            let ability_id = $(value).data("ability_id");
            let chara_id = $(value).data("chara_id");
            let ability_info = getAbilityInfo(ability_id);
            let limit_border = Number($(value).data("limit_border"));
            let member_info = getCharaIdToMember(chara_id)
            setAbilityCheck(value, ability_info, limit_border, member_info.limit_count, chara_id_class);
        });

        // アビリティ項目の表示設定
        setAbilityDisplay(member_info.limit_count, chara_id_class);

        let attack_physical = type_physical[attack_info.attack_physical];
        let attack_element = type_element[attack_info.attack_element];
        $("#attack_physical").attr("src", "img/" + attack_physical + ".webp");
        $("#attack_element").attr("src", "img/" + attack_element + ".webp");
        $("." + attack_physical).addClass("selected");
        $("." + attack_element).addClass("selected");
        $("#range_area").text(attack_info.range_area == 1 ? "単体" : "全体");

        displayElementRow();
        $(".redisplay").each(function (index, value) {
            sortEffectSize($(value));
            select2ndSkill($(value));
        });

        // 敵情報再設定
        updateEnemyResistDown();
        createSkillLvList("skill_lv", max_lv, max_lv);
    });
    $("#skill_special_display").on("change", function (event) {
        if ($("#skill_special_display").prop("checked")) {
            toggleItemVisibility(`option.skill_kind-versatile`, false);
            $("#attack_list").trigger("change");
        } else {
            toggleItemVisibility(`option.skill_kind-versatile`, true);
        }
    });
    // バフを全て外す
    $("#all_delete").on("click", function (event) {
        $("select[name=buff]").prop("selectedIndex", 0);
        $(".include_lv").trigger("change");
        updateEnemyResistDown();
    });
    // バフスキル変更
    $(".include_lv").on("change", function (event) {
        let selected_index = $(this).prop("selectedIndex");
        let id = $(this).prop("id");
        ref_status_list["status_" + id] = [];
        let option = $(this).find("option:selected");
        setAloneActivation($(option));
        if (selected_index === 0) {
            resetSkillLv(id);
        } else {
            if (isOnlyBuff(option)) {
                if (!confirm(option.text() + "は\r\n通常、複数付与出来ませんが、設定してよろしいですか？")) {
                    $(this).prop("selectedIndex", 0);
                    return;
                }
            }
            if (isOnlyUse(option)) {
                if (!confirm(option.text() + "は\r\n通常、他スキルに設定出来ませんが、設定してよろしいですか？")) {
                    $(this).prop("selectedIndex", 0);
                    return;
                }
            }
            if (isOtherOnlyUse($(option))) {
                if (!confirm(option.text() + "は\r\n通常、自分に設定出来ませんが、設定してよろしいですか？")) {
                    $(this).prop("selectedIndex", 0);
                    return;
                }
            }
            let select_lv = option.data("select_lv");
            if (select_lv !== undefined) {
                let buff_info = getBuffIdToBuff(Number(option.val()));
                createSkillLvList(id + "_lv", buff_info.max_lv, select_lv);
            }
            setStatusToBuff(option, id);
        }
    });
    // 耐性ダウン変更
    $(".resist_down").on("change", function (event) {
        updateEnemyResistDown();
    });
    $(".enemy_type_value").on("change", function (event) {
        setEnemyElement("#" + $(this).prop("id"), $(this).val(), null, null);
        updatePenetrationResist();
        displayWeakRow();
    });
    // チャージ変更
    $("#charge").on("change", function (event) {
        let selected_index = $(this).prop("selectedIndex");
        let id = $(this).prop("id");
        ref_status_list["status_" + id] = [];
        if (selected_index !== 0) {
            let option = $(this).find("option").eq(selected_index);
            setStatusToBuff(option, id);
        }
    });
    // スキルレベル変更
    $(".lv_effect").on("change", function (event) {
        let buff_type_id = $(this).attr("id").replace("_lv", "");
        let option = $("#" + buff_type_id + " option:selected");
        let chara_id = Number(option.data("chara_id"));
        let buff_id = Number(option.val());
        let skill_lv = $(this).prop("selectedIndex") + 1;
        // バフ効果量更新
        $(".variable_effect_size.chara_id-" + chara_id + ".buff_id-" + buff_id).each(function (index, value) {
            updateBuffEffectSize($(value), skill_lv);
        });
        // 同一スキル別セレクトボックス含めて反映
        $(".chara_id-" + chara_id + ".buff_id-" + buff_id).each(function (index, value) {
            if ($(value).prop("selected")) {
                $("#" + $(value).parent().attr("id") + "_lv").prop("selectedIndex", skill_lv - 1);
            }
        });
    });
    // 入力制限
    $(".limit_number").on("change", function (event) {
        let min = parseInt(this.min);
        let max = parseInt(this.max);
        let value = parseInt(this.value);
        if (value < min) {
            this.value = min;
        }
        if (value > max) {
            this.value = max;
        }
    });
    // 士気レベル変更
    $("#morale_count").on("change", function (event) {
        updateVariableEffectSize();
    });
    // バフ/デバフ強化変更
    $(".strengthen").on("change", function (event) {
        // バフ効果量を更新
        $(this).parent().parent().find(".variable_effect_size").each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // バフ/デバフ強化アビリティ変更
    $(document).on("change", ".strengthen_skill", function (event) {
        let chara_id_class = $(this).parent().attr('class').split(' ').find(className => className.startsWith('chara_id-'));
        // バフ効果量を更新
        $(".variable_effect_size." + chara_id_class).each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // 能力上昇バフ
    $(document).on("change", ".strengthen_status", function (event) {
        let chara_id_class = $(this).parent().attr('class').split(' ').find(className => className.startsWith('chara_id-'));
        // バフ効果量を更新
        $(".variable_effect_size." + chara_id_class).each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // フィールド強化変更
    $(document).on("change", "input.strengthen_field", function (event) {
        let chara_id_class = $(this).parent().attr('class').split(' ').find(className => className.startsWith('chara_id-'));
        // フィールド強化15%
        let strengthen = $(this).prop("checked") ? $(this).data("effect_size") : 0;
        // フィールド効果量を更新
        updateFieldEffectSize(chara_id_class, strengthen);
    });
    // 前衛が3人以上の場合
    $(document).on("change", "#ability_front input", function (event) {
        // if (checkFrontAbility() > 2) {
        //     alert("前衛は攻撃キャラクターを除いた2人まで設定できます。");
        //     $(this).prop("checked", false);
        //     return;
        // }
    });
    // 後衛が3人以上の場合
    $(document).on("change", "#ability_back input", function (event) {
        let back = $(`#ability_back input:checked`).filter(function () {
            return $(this).parent().css("display") !== "none";
        });
        if (back.length > 3) {
            alert("後衛は3人まで設定できます。");
            $(this).prop("checked", false);
            return;
        }
    });
    // 破壊率上限変更
    $("#enemy_destruction_limit").on("change", function (event) {
        let destructionValue = Number($("#enemy_destruction_rate").val());
        let maxDestruction = Number($(this).val());
        if (maxDestruction <= 100) {
            $(this).val(100);
            maxDestruction = 100;
        }
        if (maxDestruction < destructionValue) {
            $("#enemy_destruction_rate").val(maxDestruction);
        }
    });
    // 破壊率変更
    $("#enemy_destruction_rate").on("change", function (event) {
        let destructionValue = Number($(this).val());
        if (destructionValue <= 100) {
            $(this).val(100);
        } else {
            for (let i = 0; i < DP_GAUGE_COUNT; i++) {
                setDpGarge(i, 0);
            }
            $(".row_dp").css("display", "none");
            let maxDestruction = Number($("#enemy_destruction_limit").val());
            if (maxDestruction < destructionValue) {
                $(this).val(maxDestruction);
            }
        }
    });
    // プレイヤーDP変更
    $(".player_dp_range").on("input", function (event) {
        let val = $(this).val();
        $("#player_dp_rate").val(val + '%');
        applyGradient($(".player_dp_range"), "#4F7C8B", val / 1.5);
    });
    // 残りDP変更
    $(".enemy_dp_range").on("input", function (event) {
        $("#enemy_destruction_rate").val(100);
        let dp_no = Number($(this).prop("id").replace(/\D/g, ''));
        setDpGarge(dp_no, $(this).val())
        if ($(this).val() == 0 && dp_no == 0) {
            $(".row_dp").css("display", "none");
        } else {
            $(".row_dp").css("display", "table-cell");
        }
        // 下層のDPを100に、上位を0にする。
        for (let i = 0; i < DP_GAUGE_COUNT; i++) {
            if (i < dp_no) {
                setDpGarge(i, 100);
            } else if (i > dp_no) {
                setDpGarge(i, 0);
            }
        }
        setHpGarge(100)
    });
    // 残りHP変更
    $("#hp_range").on("input", function (event) {
        setHpGarge($(this).val())
        // DP無力化
        for (let i = 0; i < DP_GAUGE_COUNT; i++) {
            setDpGarge(i, 0);
        }
        $(".row_dp").css("display", "none");
    });
    // 強ブレイクチェック
    $("#strong_break").on("change", function (event) {
        let enemy_info = getEnemyInfo();
        let strong_break = $("#strong_break").prop("checked") ? 300 : 0;
        $("#enemy_destruction_limit").val(enemy_info.destruction_limit + strong_break);
        $("#enemy_destruction_rate").val(enemy_info.destruction_limit + strong_break);
        for (let i = 0; i < DP_GAUGE_COUNT; i++) {
            setDpGarge(i, 0);
        }
        $(".row_dp").css("display", "none");
    });
    // カンマ区切り
    $(".comma").on('blur change input', function (event) {
        let newValue = removeComma($(this).val())
        // カンマ区切りに編集した値を取得する
        let formattedValue = newValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        // フォームの値を置き換える
        $(this).val(formattedValue);
    });
    // ダメージ詳細を開く
    $(".open_detail").on("click", function (event) {
        if ($(this).attr("id") == "modal_damage_detail_open1") {
            open_damage_detail = critical_detail;
            $("#skill_power").hide();
            $("#skill_power_critical").show();
            $("#magnification_critical").show();
        } else {
            open_damage_detail = damage_detail;
            $("#skill_power").show();
            $("#skill_power_critical").hide();
            $("#magnification_critical").hide();
        }
        open_damage_detail.setDamageDetail();
    });
    // バフ選択画面を開く
    $("#open_select_buff").on("click", function (event) {
        $("#select_buff").html("");
        $("#orb_buff").prop("checked", false);
        createBuffList();
        MicroModal.show('modal_select_buff');
    });
    // バフ詳細オーブチェック
    $("#orb_buff").on("change", function (event) {
        if ($(this).prop("checked")) {
            $(".orb_buff").css("display", "flex");
        } else {
            $(".orb_buff").css("display", "none");
        }
    });
    // バフ一括設定
    $("#bulk_buff_setting").on("click", function (event) {
        setBuffList();
    });
    // 残り耐久反映
    $(".durability_reflection").on("click", function (event) {
        for (let i = 0; i < DP_GAUGE_COUNT; i++) {
            let enemy_dp = Number($("#enemy_dp_" + i).val().replace(/,/g, ""));
            if (enemy_dp == 0) {
                setDpGarge(i, 0);
            } else {
                setDpGarge(i, Math.ceil((open_damage_detail.avg_rest_dp[i] / enemy_dp) * 100));
            }
        }
        let enemy_hp = Number($("#enemy_hp").val().replace(/,/g, ""));
        setHpGarge(Math.ceil((open_damage_detail.avg_rest_hp / enemy_hp) * 100));
        $("#enemy_destruction_rate").val(Math.floor(open_damage_detail.avg_destruction_last_rate));

        MicroModal.close('modal_damage_detail');
        // 自動選択外す
        $("#auto_skill").prop("checked", false);
        // ダメージ再計算
        calcDamage();
    });
    // ダメージ再計算
    $("input[type=range]").on("mouseup", function (event) {
        calcDamage();
        if (!$(this).data("changed")) {
            // changeイベントのデフォルト動作を防止
            // event.preventDefault();
        }
    });
    $(document).on("change", "input, select", function (event) {
        calcDamage();
    });
}
// 効果量更新
function updateVariableEffectSize() {
    // バフ効果量を更新
    $(".variable_effect_size").each(function (index, value) {
        updateBuffEffectSize($(value));
    });
}

// 限界突破変更
function updateLimitCount(chara_no, limit_count) {
    if (select_style_list[chara_no] === undefined) {
        return;
    }
    let chara_id_class = "chara_id-" + select_style_list[chara_no].style_info.chara_id;
    // アビリティのチェックボックスを更新
    $("input[type=checkbox].ability." + chara_id_class).each(function (index, value) {
        let ability_id = $(value).data("ability_id");
        let ability_info = getAbilityInfo(ability_id);
        let limit_border = Number($(value).data("limit_border"));
        if (select_attack_skill !== undefined) {
            let attack_chara_id = "chara_id-" + select_attack_skill.chara_id;
            setAbilityCheck(value, ability_info, limit_border, limit_count, attack_chara_id);
        }
    });
    // バフ効果量を更新
    $(".variable_effect_size." + chara_id_class).each(function (index, value) {
        updateBuffEffectSize($(value));
    });
    // アビリティ項目の表示設定
    setAbilityDisplay(select_style_list[chara_no].limit_count, chara_id_class);
};
// 宝珠レベル変更
function updateJewelLv(chara_no) {
    if (select_style_list[chara_no] === undefined) {
        return;
    }
    let chara_id_class = "chara_id-" + select_style_list[chara_no].style_info.chara_id;
    // バフ効果量を更新
    $(".variable_effect_size." + chara_id_class).each(function (index, value) {
        updateBuffEffectSize($(value));
    });
};
// ステータス変更
function updateStatus(chara_no) {
    if (select_style_list[chara_no] === undefined) {
        return;
    }
    let chara_id_class = "chara_id-" + select_style_list[chara_no].style_info.chara_id;
    // バフ効果量を更新
    $(".variable_effect_size." + chara_id_class).each(function (index, value) {
        updateBuffEffectSize($(value));
    });
};

// メンバー読み込み時の固有処理
function loadMember(select_chara_no, member_info, isTrigger) {

    addAttackList(member_info);
    addBuffList(member_info, 0);
    addAbility(member_info);
    addPassive(member_info);
    $(".display_chara_id-" + member_info.style_info.chara_id).addClass(`block_chara_id-${member_info.style_info.chara_id}`);

    if (isTrigger) {
        $("#attack_list").trigger("change");
    }
}

// メンバーを外す
function removeMember(select_list, select_chara_no, isTrigger) {
    if (select_list[select_chara_no] === undefined) {
        return;
    }
    // 入れ替えスタイルのスキルを削除
    let chara_id = select_list[select_chara_no].style_info.chara_id;
    let chara_id_class = ".chara_id-" + chara_id;
    let parent = $(".include_lv " + chara_id_class + ":selected").parent();
    $.each(parent, function (index, value) {
        // 暫定的にdisplay:none追加
        $(value).find(chara_id_class).css("display", "none");
        let select = $("#" + $(value).prop("id"));
        select2ndSkill(select);
        setAloneActivation(select.find("option:selected"));
    });
    // 該当メンバーのスキル削除
    $(chara_id_class).remove();
    $(".display_chara_id-" + chara_id).removeClass(`block_chara_id-${chara_id}`);
    $(".display_chara_id-" + chara_id + " input").prop("checked", false);
    $(".display_chara_id-" + chara_id + " input").trigger("change");
    // 消費SP初期化
    $('#sp_cost_' + select_chara_no).text(0);
    // 画像初期化
    $('#select_chara_' + select_chara_no).attr("src", "img/plus.png");
    if (isTrigger) {
        $("#attack_list").trigger("change");
    }
}

class RestGauge {
    constructor() {
        this.min_rest_dp = Array(DP_GAUGE_COUNT).fill(0);
        this.min_rest_hp = 0;
        this.min_damage = 0;
        this.min_destruction_last_rate = 100;
        this.max_rest_dp = Array(DP_GAUGE_COUNT).fill(0);
        this.max_rest_hp = 0;
        this.max_damage = 0;
        this.max_destruction_last_rate = 100;
        this.avg_rest_dp = Array(DP_GAUGE_COUNT).fill(0);
        this.avg_rest_hp = 0;
        this.avg_damage = 0;
        this.avg_destruction_last_rate = 100;
    }
    // 詳細反映
    setDamageDetail() {
        $("#detail_min_damage").val(Math.floor(this.min_damage).toLocaleString());
        $("#detail_max_damage").val(Math.floor(this.max_damage).toLocaleString());
        $("#detail_damage").val(Math.floor(this.avg_damage).toLocaleString());
        for (let i = 0; i < DP_GAUGE_COUNT; i++) {
            let enemy_dp = Number($("#enemy_dp_" + i).val().replace(/,/g, ""));
            let disp_rest = calculatePercentage(this.max_rest_dp[i], this.min_rest_dp[i], enemy_dp, "dp");
            $("#rest_dp_rate_" + i).val(disp_rest);
            // generateGradientFromRangeメソッドを呼び出してグラデーションスタイルを取得
            let gradientStyle = generateGradientFromRange(disp_rest, "#A7BEC5")
            // 対象の要素にスタイルを設定
            $("#rest_dp_rate_" + i).css("background", gradientStyle);
        }
        let enemy_hp = Number($("#enemy_hp").val().replace(/,/g, ""));
        let disp_rest = calculatePercentage(this.max_rest_hp, this.min_rest_hp, enemy_hp, "hp");
        $("#rest_hp_rate").val(disp_rest);
        // generateGradientFromRangeメソッドを呼び出してグラデーションスタイルを取得
        let gradientStyle = generateGradientFromRange(disp_rest, "#BE71BE")
        // 対象の要素にスタイルを設定
        $("#rest_hp_rate").css("background", gradientStyle);

        // 破壊率
        const maxRate = Math.round(this.max_destruction_last_rate * 10) / 10;
        const minRate = Math.round(this.min_destruction_last_rate * 10) / 10;

        const rateText = maxRate === minRate ? `${maxRate}%` : `${maxRate}%～${minRate}%`;
        $("#detail_destruction_last_rate").text(rateText);
    }
}

// 残りの実数値と全体値から、割合範囲を取得する。
function calculatePercentage(min, max, total, dphp) {
    if (total == 0) {
        return "0%";
    }
    // 最小値、最大値、全体値が0以下の場合、それぞれ0に設定
    let temp_min = Math.max(0, min);
    let temp_max = Math.max(0, max);

    // 最小値と最大値が同じ場合は、範囲指定しない
    if (Math.ceil((temp_min / total) * 100) === Math.ceil((temp_max / total) * 100)) {
        return Math.ceil((temp_min / total) * 100) + '%';
    } else {
        if (dphp == "hp") {
            return Math.ceil((min / total) * 100) + '%～' + Math.ceil((max / total) * 100) + '%';
        } else {
            return Math.ceil((temp_min / total) * 100) + '%～' + Math.ceil((temp_max / total) * 100) + '%';
        }
    }
}
let damage_detail = null;
let critical_detail = null;

// ダメージ計算
function calcDamage() {
    let attack_info = getAttackInfo();
    if (attack_info === undefined) {
        return;
    }
    // SP消費計算
    getSpCost();
    // グレード
    let grade_sum = getGradeSum();
    // メンバー
    let chara_id = $("#attack_list option:selected").data("chara_id");
    let member_info = getCharaIdToMember(chara_id);

    // 闘志
    let fightingspirit = $("#fightingspirit").prop("checked") ? 20 : 0;
    // 厄
    let misfortune = $("#misfortune").prop("checked") ? 20 : 0;
    // ハッキング
    let hacking = $("#hacking").prop("checked") ? 100 : 0;

    // 士気
    let morale = Number($("#morale_count").val()) * 5;
    let stat_up = getStatUp(member_info)
    // 闘志or士気
    stat_up += (morale > fightingspirit ? morale : fightingspirit);
    // 厄orハッキング
    let stat_down = hacking || misfortune;

    let basePower = getBasePower(member_info, stat_up, stat_down);
    let buff = getSumBuffEffectSize(grade_sum);
    let mindeye = isWeak() ? getSumEffectSize("mindeye") / 100 + 1 : 1;
    let debuff = getSumDebuffEffectSize();
    let fragile = isWeak() ? getSumEffectSize("fragile") / 100 + 1 : 1;
    let token = getSumTokenEffectSize(chara_id);
    let element_field = getSumEffectSize("element_field") / 100 + 1;
    let weak_physical = $("#enemy_physical_" + attack_info.attack_physical).val() / 100;
    let weak_element = $("#enemy_element_" + attack_info.attack_element).val() / 100;
    let enemy_defence_rate = getEnemyDefenceRate(grade_sum);
    let funnel_sum = 1 + getSumFunnelEffectList().reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 100;
    let destruction_rate = Number($("#enemy_destruction_rate").val());
    let special = 1 + Number($("#dp_range_0").val() == 0 ? attack_info.hp_damege / 100 : attack_info.dp_damege / 100);
    // バーチカルフォース/パドマ・ナーチュナー
    let skill_unique_rate = 1;
    if (attack_info.attack_id == 115 || attack_info.attack_id == 2167) {
        let dp_rate = Number($("#skill_unique_dp_rate").val());
        dp_rate = dp_rate < 60 ? 60 : dp_rate;
        skill_unique_rate += (dp_rate - 100) / 200
    }
    // 花舞う、可憐のフレア/プレゼント・フォー・ユー
    if (attack_info.attack_id == 136 || attack_info.attack_id == 166) {
        let dp_rate = Number($("#skill_unique_dp_rate").val());
        dp_rate = dp_rate > 100 ? 100 : dp_rate;
        skill_unique_rate += (100 - dp_rate) / 100 * 75 / 100;
    }
    // コーシュカ・アルマータ/疾きこと風の如し
    if (attack_info.attack_id == 2162 || attack_info.attack_id == 154 || attack_info.attack_id == 155) {
        let sp = Number($("#skill_unique_sp").val());
        skill_unique_rate = (sp > 30 ? 30 : sp) / 30;
    }
    // 桜花の矢
    if (attack_info.chara_id == 45 && $("#skill_unique_cherry_blossoms").prop("checked")) {
        buff += 0.5
    }
    // 影分身(アーデルハイト)
    if (attack_info.chara_id == 17 && $("#skill_unique_shadow_clone_17").prop("checked")) {
        buff += 0.3;
    }
    // 影分身(マリー)
    if (attack_info.chara_id == 18 && $("#skill_unique_shadow_clone_18").prop("checked")) {
        buff += 0.3;
    }

    let critical_power = getBasePower(member_info, stat_up, stat_down > 50 ? stat_down : 50);
    let critical_rate = getCriticalRate(member_info);
    let critical_buff = getCriticalBuff();
    // 貫通クリティカル
    if (PENETRATION_ATTACK_LIST.includes(attack_info.attack_id)) {
        critical_rate = 100;
    }

    damage_detail = new RestGauge();
    critical_detail = new RestGauge();

    let fixed = mindeye * fragile * token * element_field * weak_physical * weak_element * enemy_defence_rate * skill_unique_rate;
    calculateDamage(basePower, attack_info, buff, debuff, fixed, "#damage", "#destruction_last_rate", damage_detail);
    calculateDamage(basePower * 0.9, attack_info, buff, debuff, fixed, "#damage_min", undefined, damage_detail);
    calculateDamage(basePower * 1.1, attack_info, buff, debuff, fixed, "#damage_max", undefined, damage_detail);
    calculateDamage(critical_power, attack_info, buff, debuff, fixed * critical_buff, "#critical_damage", "#critical_destruction_last_rate", critical_detail);
    calculateDamage(critical_power * 0.9, attack_info, buff, debuff, fixed * critical_buff, "#critical_damage_min", undefined, critical_detail);
    calculateDamage(critical_power * 1.1, attack_info, buff, debuff, fixed * critical_buff, "#critical_damage_max", undefined, critical_detail);

    $("#skill_power").val((Math.floor(basePower * 100) / 100).toFixed(2));
    $("#skill_power_critical").val((Math.floor(critical_power * 100) / 100).toFixed(2));
    $("#mag_buff").val(convertToPercentage(buff));
    $("#mag_debuff").val(convertToPercentage(debuff));
    $("#mag_element_field").val(convertToPercentage(element_field));
    $("#mag_special").val(convertToPercentage(special));
    $("#mag_funnel").val(convertToPercentage(funnel_sum));
    $("#mag_physical").val(convertToPercentage(weak_physical));
    $("#mag_element").val(convertToPercentage(weak_element));
    $("#mag_token").val(convertToPercentage(token));
    $("#mag_mindeye").val(convertToPercentage(mindeye));
    $("#mag_fragile").val(convertToPercentage(fragile));
    $("#mag_destruction").val(destruction_rate + "%");
    $("#mag_critical").val(convertToPercentage(critical_buff));

    // クリティカル表示
    $("#critical_rate").text(`(発生率: ${Math.round(critical_rate * 100) / 100}%)`);
    $("div.footer").show();

    // スコア計算
    if ($("#enemy_class").val() == ENEMY_CLASS_SCORE_ATTACK) {
        calcScore(critical_detail, grade_sum.grade_rate);
    }
    // メンバー情報更新
    if (typeof updateMember == "function") {
        updateMember();
    }
}

// 倍率表示
function convertToPercentage(value) {
    // 引数×100を計算し、小数点以下2桁目以降を四捨五入してパーセント記号を付ける
    const percentage = (Math.floor(value * 10000) / 100).toFixed(2) + "%";
    return percentage;
}

// ダメージの詳細計算
function calculateDamage(basePower, attack_info, buff, debuff, fixed, id, destruction_id, rest_damage) {
    let destruction_rate = Number($("#enemy_destruction_rate").val());
    let max_destruction_rate = Number($("#enemy_destruction_limit").val());
    let enemy_destruction = Number($("#enemy_destruction").val());
    let dp_penetration = Number($("#dp_range_1").val()) == 0;
    let rest_dp = Array(DP_GAUGE_COUNT).fill(0);
    let dp_no = -1;  // 現在の使用DPゲージ番号を取得
    for (let i = 0; i < DP_GAUGE_COUNT; i++) {
        rest_dp[i] = Number($("#enemy_dp_" + i).val().replace(/,/g, "")) * Number($("#dp_range_" + i).val()) / 100;
        if (rest_dp[i] > 0) {
            dp_no = i;
        }
    }
    let rest_hp = Number($("#enemy_hp").val().replace(/,/g, "")) * Number($("#hp_range").val()) / 100;
    let hit_count = attack_info.hit_count;
    let buff_destruction = getDestructionEffectSize(hit_count);
    let destruction_size = enemy_destruction * attack_info.destruction * buff_destruction;
    let damage = 0;
    let special;
    let add_buff;
    let add_debuff;

    // ダメージ処理
    function procDamage(power, add_destruction) {
        if (rest_dp[0] <= 0 && dp_penetration) {
            special = 1 + attack_info.hp_damege / 100;
            add_buff = getEarringEffectSize("attack", hit_count) / 100;
            add_debuff = 0;
        } else {
            special = 1 + attack_info.dp_damege / 100;
            add_buff = getEarringEffectSize("break", hit_count) / 100;
            add_debuff = getSumEffectSize("dp_debuff") / 100;
        }
        let hit_damage = power * (buff + add_buff) * (debuff + add_debuff) * fixed * special * destruction_rate / 100;

        if (rest_dp[dp_no] > 0) {
            rest_dp[dp_no] -= hit_damage;
        } else if (dp_no >= 1) {
            rest_dp[dp_no - 1] -= hit_damage;
        } else {
            rest_hp -= hit_damage;
        }
        if (rest_dp[0] <= 0 && dp_penetration) {
            destruction_rate += add_destruction;
            if (destruction_rate > max_destruction_rate) destruction_rate = max_destruction_rate;
        }
        damage += hit_damage
    }
    // 通常分ダメージ処理
    let hit_list = [];
    if (attack_info.damege_distribution) {
        hit_list = attack_info.damege_distribution.split(",");
    } else {
        const value = 100 / hit_count;
        hit_list = new Array(hit_count).fill(value);
    }
    hit_list.forEach(value => {
        procDamage(basePower * value / 100, destruction_size / hit_count);
    });
    let funnel_list = getSumFunnelEffectList();
    // 連撃分ダメージ処理
    funnel_list.forEach(value => {
        procDamage(basePower * value / 100, destruction_size * value / 100);
    });

    const billion = 1000000000;
    if (damage > billion) {
        damage = billion * (2 - Math.exp(0.7 - 0.7 * (damage / billion)));
    }
    if (damage > billion * 2) {
        damage = billion * 2;
    }

    // 0以下補正
    rest_dp = rest_dp.map(dp => Math.max(0, dp));
    //    rest_hp = Math.max(0, rest_hp);
    if (id.includes("max")) {
        rest_damage.max_rest_dp = rest_dp;
        rest_damage.max_rest_hp = rest_hp;
        rest_damage.max_damage = damage;
        rest_damage.max_destruction_last_rate = destruction_rate;
    } else if (id.includes("min")) {
        rest_damage.min_rest_dp = rest_dp;
        rest_damage.min_rest_hp = rest_hp;
        rest_damage.min_damage = damage;
        rest_damage.min_destruction_last_rate = destruction_rate;
    } else {
        rest_damage.avg_rest_dp = rest_dp;
        rest_damage.avg_rest_hp = rest_hp;
        rest_damage.avg_damage = damage;
        rest_damage.avg_destruction_last_rate = destruction_rate;
    }

    $(id).val(Math.floor(damage).toLocaleString());
    if (destruction_id) $(destruction_id).text(`${Math.round(destruction_rate * 10) / 10}%`);
}

// ピアス効果量取得
function getEarringEffectSize(type, hit_count) {
    hit_count = hit_count < 1 ? 1 : hit_count;
    let earring = $("#earring option:selected");
    if (earring.data("type") === type) {
        let effect_size = Number(earring.data("effect_size"));
        return (effect_size - (10 / 9 * (hit_count - 1)));
    }
    return 0;
}

// チェーン効果量取得
function getChainEffectSize(type) {
    switch ($("#chain").val()) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
            switch (type) {
                case "skill":
                    return 10;
                case "blast":
                    return 10;
                default:
                    break;
            }
            break;
    }
    return 0;
}

// 消費SP計算
function getSpCost() {
    chara_sp_list = {};
    let sp_cost_down = 0;
    // 蒼天
    if ($("#ability_all72").prop("checked")) {
        sp_cost_down = 1;
    }
    // SP消費量計算
    for (let i = 0; i < select_style_list.length; i++) {
        if (select_style_list[i] === undefined) {
            continue;
        }
        let chara_id_class = "chara_id-" + select_style_list[i].style_info.chara_id;
        let sp_cost = 0;
        let sp_list = [];
        $("option." + chara_id_class + ":selected").each(function (index, value) {
            switch ($(value).parent().attr("id")) {
                case "attack_list":
                    let attack = getAttackInfo();
                    addSkillCount(sp_list, attack.skill_id, $(value).parent().attr("id"), attack.sp_cost)
                    break;
                default:
                    // 非表示項目を除く
                    if ($(value).parent().parent().css('display') == 'none') {
                        break;
                    }
                    let buff_id = Number($(value).val());
                    if (buff_id !== undefined && buff_id !== 0) {
                        let buff = getBuffIdToBuff(buff_id)
                        addSkillCount(sp_list, buff.skill_id, $(value).parent().attr("id"), buff.sp_cost)
                    }
                    break;
            }
        });
        // skill_idとsp_cost以外の最高値×sp_cost
        $.each(sp_list, function (index, value) {
            let single_sp_cost = 0;
            let max_count = 0;
            $.each(value, function (key, data) {
                if (key == "skill_id") {
                    return true;
                } else if (key == "sp_cost") {
                    single_sp_cost = Number(data) - sp_cost_down;
                    single_sp_cost = single_sp_cost < 0 ? 0 : single_sp_cost;
                    return true;
                }
                if (max_count < Number(data)) {
                    max_count = Number(data);
                }
            });
            sp_cost += single_sp_cost * max_count;
        });
        chara_sp_list[select_style_list[i].style_info.chara_id] = sp_cost
    }
}

// スキル使用回数取得
function addSkillCount(sp_list, skill_id, id, sp_cost) {
    const array = sp_list.filter((obj) => obj.skill_id === skill_id);

    let single = {};
    if (array.length) {
        single = array[0];
    } else {
        single.skill_id = skill_id;
        single.sp_cost = sp_cost;
        sp_list[sp_list.length] = single;
    }
    let kind = id.replace(/\d/g, '');
    if (single[kind]) {
        single[kind] = 2;
    } else {
        single[kind] = 1;
    }
}

// フィールド効果量更新
function updateFieldEffectSize(chara_id_class, strengthen) {
    let chara_id = chara_id_class.replace("chara_id-", "");
    let chara_name = getCharaData(chara_id).chara_short_name;
    $.each($(".element_field").find(`option.${chara_id_class}`), function (index, option) {
        let buff_id = Number($(option).val());
        let skill_buff = getBuffIdToBuff(buff_id);
        let effect_size = skill_buff.max_power + strengthen;
        let effect_text = `${chara_name}: ${skill_buff.buff_name} ${Math.floor(effect_size * 100) / 100}%`;
        $(option).text(effect_text).data("effect_size", effect_size).data("text_effect_size", effect_size);;
    });
}

// バフ効果量更新
function updateBuffEffectSize(option, skill_lv) {
    let buff_id = Number(option.val());
    skill_lv = skill_lv || Number(option.data("select_lv"));
    let chara_id = Number(option.data("chara_id"));
    let skill_buff = getBuffIdToBuff(buff_id);
    let member_info = getCharaIdToMember(chara_id);
    let effect_size = getEffectSize(skill_buff.buff_kind, buff_id, member_info, skill_lv);
    let chara_name = getCharaData(chara_id).chara_short_name;
    let ability_streng = getStrengthen(member_info, skill_buff);
    // バフ強化1.2倍
    let strengthen = option.parent().parent().parent().find("input").prop("checked") ? 20 : 0;
    let text_effect_size = effect_size * (1 + (ability_streng + strengthen) / 100);
    effect_size = effect_size * (1 + ability_streng / 100);
    let effect_text = `${chara_name}: ${skill_buff.buff_name} ${Math.floor(text_effect_size * 100) / 100}%`;
    option.text(effect_text).data("effect_size", effect_size).data("select_lv", skill_lv).data("text_effect_size", text_effect_size);;
    // 耐性が変更された場合
    if (skill_buff.buff_kind == BUFF_RESISTDOWN) {
        updateEnemyResistDown();
    }
}

// バフ強化効果量取得
function getStrengthen(member_info, skill_buff) {
    let sp_cost_down = 0;
    // 蒼天
    if ($("#ability_all72").prop("checked")) {
        sp_cost_down = 1;
    }

    let strengthen = 0;
    // 攻撃力アップ/属性攻撃力アップ
    let attack_up = [BUFF_ATTACKUP, BUFF_ELEMENT_ATTACKUP];
    if (attack_up.includes(skill_buff.buff_kind)) {
        let ability_list = [member_info.style_info.ability0, member_info.style_info.ability00, member_info.style_info.ability1, member_info.style_info.ability3, member_info.style_info.ability5, member_info.style_info.ability10];
        // 機転
        if (ability_list.includes(501) && member_info.limit_count >= 3) {
            strengthen += 25;
        }
        // 増幅
        if (ability_list.includes(503)) {
            strengthen += 10;
        }
        // エクシード(菅原専用)
        if (ability_list.includes(505) && $("#ability_all463").prop("checked")) {
            strengthen += 30;
        }
        // 自慢のフロートバイク
        if (ability_list.includes(509) && $("#ability_all910").prop("checked")) {
            strengthen += 25;
        }
    }
    // 防御力ダウン/属性防御力ダウン/DP防御力ダウン/永続防御ダウン/永続属性防御ダウン
    let defense_down = [BUFF_DEFENSEDOWN, BUFF_ELEMENT_DEFENSEDOWN,
        BUFF_DEFENSEDP, BUFF_ETERNAL_DEFENSEDOWN, BUFF_ELEMENT_ETERNAL_DEFENSEDOWN];
    if (defense_down.includes(skill_buff.buff_kind)) {
        let ability_list = [member_info.style_info.ability0, member_info.style_info.ability00, member_info.style_info.ability1, member_info.style_info.ability3, member_info.style_info.ability5, member_info.style_info.ability10];
        // 侵食
        if (ability_list.includes(502) && member_info.limit_count >= 3) {
            strengthen += 25;
        }
        // 減退
        if (ability_list.includes(504)) {
            strengthen += 10;
        }
        // モロイウオ
        if (ability_list.includes(506) && $("#ability_all243").prop("checked") && (skill_buff.sp_cost - sp_cost_down) <= 8) {
            strengthen += 30;
        }
        // 王の眼差し
        if (ability_list.includes(507) && $("#ability_all11").prop("checked")) {
            strengthen += 25;
        }
        // 思考加速
        if (ability_list.includes(508) && $("#ability_all190").prop("checked")) {
            strengthen += 15;
        }
        // 水光のゆらめき(あいな専用)
        if (member_info.style_info.chara_id == 24 && $("#skill_passive559").prop("checked")) {
            strengthen += 10;
        }
    }
    return strengthen;
}

// 弱点判定
function isWeak() {
    attack_info = getAttackInfo();
    if (attack_info === undefined) {
        return false
    }
    let physical_resist = Number($("#enemy_physical_" + attack_info.attack_physical).val());
    let element_resist = Number($("#enemy_element_" + attack_info.attack_element).val());
    return physical_resist * element_resist > 10000;
}

// 敵耐性初期化
function resetEnemyResist() {
    let enemy_info = getEnemyInfo();
    // 表示変更
    let physical = select_attack_skill.attack_physical;
    let element_physical = enemy_info["physical_" + physical];
    $("#enemy_physical_" + physical).val(Math.floor(element_physical));
    setEnemyElement("#enemy_physical_" + physical, Math.floor(element_physical), null, null);
    let element = select_attack_skill.attack_element;
    let element_element = enemy_info["element_" + element];
    $("#enemy_element_" + element).val(Math.floor(element_element));
    setEnemyElement("#enemy_element_" + element, Math.floor(element_element), null, null);
    // 貫通クリティカル
    updatePenetrationResist();
}

// 敵耐性変更
function updateEnemyResistDown() {
    let attack_info = getAttackInfo();
    if (attack_info === undefined) {
        return false
    }
    let resist_down = getSumEffectSize("resist_down");
    // 表示変更
    setEnemyElement(`#enemy_element_${attack_info.attack_element}`, null, null, Math.floor(resist_down));
    // 貫通クリティカル
    updatePenetrationResist();
    // 弱点行
    displayWeakRow();
}

// 貫通クリティカル耐性変更
function updatePenetrationResist() {
    let attack_info = getAttackInfo();
    if (attack_info === undefined) {
        return false
    }
    let physical = attack_info.attack_physical;
    // 貫通クリティカル
    if (PENETRATION_ATTACK_LIST.includes(attack_info.attack_id)) {
        let week_value = 100;
        switch (attack_info.attack_id) {
            case 135: // 華麗なるファントム・シーフ
                week_value += 400;
                break;
            case 84: // 唯雅粛正(チャージ)
            case 137: // トゥルーペネトレーター+
            case 156: // バブルデストロイヤー
            case 163: // ロココ・デストラクション
                week_value += 300;
                break;
            case 95: // 三日月宗近+
            case 2179: // ネオンバースト
                week_value += 200;
                break;
            default:
                break;
        }
        let element_init = Number($("#enemy_element_0").data("init")) || 0;
        let physical_init = Number($(`#enemy_physical_${physical}`).data("init")) || 0;
        setEnemyElement("#enemy_element_0", null, 100 - element_init, null);
        setEnemyElement(`#enemy_physical_${physical}`, null, week_value - physical_init, null);
    } else {
        setEnemyElement("#enemy_element_0", null, 0, null);
        setEnemyElement(`#enemy_physical_${physical}`, null, 0, null);
    }
}

// 属性行設定
function displayElementRow() {
    if (select_attack_skill.attack_element == 0) {
        $(".row_element").css("display", "none");
    } else {
        $(".row_element").css("display", "table-cell");
        $(".row_element-" + select_attack_skill.attack_element).css("display", "table-cell");
    }
}

// 心眼・脆弱行設定
function displayWeakRow() {
    if (isWeak()) {
        $(".row_weak").css("display", "table-cell");
    } else {
        $(".row_weak").css("display", "none");
    }
}

// 攻撃リストに追加
function addAttackList(member_info) {
    let attack_list = skill_attack.filter(obj =>
        obj.chara_id === member_info.style_info.chara_id && (obj.style_id === member_info.style_info.style_id || obj.style_id === 0)
    );

    let attack_sort_list = attack_list.sort((x, y) => y.style_id - x.style_id);
    let checked = $("#skill_special_display").prop("checked");
    let optgroup = $("<optgroup>");
    let chara_data = getCharaData(member_info.style_info.chara_id)
    optgroup.attr("label", chara_data.chara_name).addClass("chara_id-" + member_info.style_info.chara_id);
    $("#attack_list").append(optgroup);

    attack_sort_list.forEach(value => {
        let display = checked && value.attack_id > 1000 ? "none" : "block";
        let kind = value.attack_id < 1000 ? "exclusive" : "versatile";
        let option = $('<option>')
            .text(`${value.attack_name}(${value.hit_count}Hit)`)
            .val(value.attack_id)
            .css("display", display)
            .data("chara_id", value.chara_id)
            .addClass("skill_kind-" + kind)
            .addClass("chara_id-" + value.chara_id);
        $("#attack_list").append(option);
    });
}

// スキルレベルリスト作成
function createSkillLvList(id, max_lv, select_lv) {
    let $select = $("#" + id);
    $select.empty();
    for (var i = 1; i <= max_lv; i++) {
        var option = $("<option>")
            .text(i)
            .val(i);
        $select.append(option);
    }
    $select.parent().css("display", "block");
    $select.find("option[value='" + select_lv + "']").prop('selected', true);
    $select.prop("disabled", (max_lv === 1));
}

// バフリスト生成
function createBuffList() {
    let html = $("<div>");
    $.each(select_style_list, function (index, value) {
        if (value) {
            let chara_id = value.style_info.chara_id;
            let div = $("<div>").addClass(`buff_chara_id-${chara_id}`);
            let chara_name = getCharaData(chara_id).chara_name;
            let span = $("<span>").addClass(`chara_name`);
            span.append(chara_name);
            div.append(span);
            html.append(div);
        }
    });

    switch (Number($("#enemy_class").val())) {
        case ENEMY_CLASS_HARD_LAYER:
            $.each(sub_style_list, function (index, value) {
                if (value) {
                    let chara_id = value.style_info.chara_id;
                    let div = $("<div>").addClass(`buff_chara_id-${chara_id}`);
                    let chara_name = getCharaData(chara_id).chara_name;
                    let span = $("<span>").addClass(`chara_name`);
                    span.append(chara_name);
                    div.append(span);
                    html.append(div);
                }
            });
            break;
        case ENEMY_CLASS_CONTROL_BATTLE:
            $.each(support_style_list, function (index, value) {
                if (value) {
                    let chara_id = value.style_info.chara_id;
                    let div = $("<div>").addClass(`buff_chara_id-${chara_id}`);
                    let chara_name = getCharaData(chara_id).chara_name;
                    let span = $("<span>").addClass(`chara_name`);
                    span.append(chara_name);
                    div.append(span);
                    html.append(div);
                }
            });
            break;
    }

    $("#select_buff").html(html);
    let visible_options = $('select[name="buff"]:visible option').not(function () {
        return $(this).parent().is('span');
    });
    // 重複チェック用の一時配列を作成
    let processed_keys = [];
    $.each(visible_options, function (index, value) {
        let buff_id = Number($(value).val());
        let buff_info = getBuffIdToBuff(buff_id);
        let chara_id = $(value).data("chara_id");
        let skill_id = $(value).data("skill_id");
        let skill_info = getSkillData(skill_id)
        if (!buff_info) {
            return true;
        }
        let unique_key = chara_id + '-' + skill_info.skill_id;
        if (!processed_keys.includes(unique_key)) {
            // 重複チェック配列に uniqueKey を追加
            processed_keys.push(unique_key);

            let div = $("<div>").addClass("buff_container");
            let inner_name = $("<div>").append(skill_info.skill_name);
            let inner_radio = $("<div>").addClass("multi-way-choice");
            for (let i = 0; i <= 2; i++) {
                let input_id = unique_key + "_" + i;
                let input = $("<input>")
                    .addClass("bulk_buff")
                    .attr("type", "radio")
                    .attr("name", unique_key)
                    .attr("id", input_id).val(i);
                let label = $("<label>").attr("for", input_id).text(i);
                if (i == 0) {
                    input.prop('checked', true);
                }
                inner_radio.append(input).append(label)
            }
            if (buff_info.skill_id > 9000) {
                div.addClass("orb_buff");
            }
            div.append(inner_name).append(inner_radio);
            $(`.buff_chara_id-${chara_id}`).append(div);
        }
    });
}

// バフリスト設定
function setBuffList() {
    let processed_keys = [];
    $(".bulk_buff:checked").each(function (index, value) {
        if ($(value).is(":visible")) {
            let val = Number($(value).val());
            let unique_key = $(value).prop("name");
            for (let i = 0; i < val; i++) {
                processed_keys.push(unique_key);
            }
        }
    });
    // 全解除後再設定
    $("select[name=buff]").prop("selectedIndex", 0);
    $("select[name=buff]").each(function (index, select) {
        let visible_options = $(select).find('option').not(function () {
            return $(this).parent().is('span');
        });
        let select_id = $(select).attr("id");
        ref_status_list["status_" + select_id] = [];
        visible_options.each(function (index, option) {
            let buff_id = Number($(option).val());
            let buff_info = getBuffIdToBuff(buff_id);
            let chara_id = $(option).data("chara_id");
            let skill_id = $(option).data("skill_id");
            let skill_info = getSkillData(skill_id)
            if (!buff_info || buff_info.buff_id == 0) {
                return true;
            }
            let unique_key = chara_id + '-' + skill_info.skill_id;
            let count = processed_keys.filter(key => key === unique_key).length;
            if (count > 0) {
                // 最大数設定済み
                let skill_id_class = "skill_id-" + $(option).data("skill_id");
                let class_name = $(option).parent().attr("id").replace(/[0-9]/g, '');
                let buff_count = $("." + class_name + " option." + skill_id_class + ":selected").length;
                if (buff_count >= count) {
                    return true;
                }
                // 単独発動は1つまで
                if (isAloneActivation(buff_info) && buff_count > 0) {
                    return true;
                }

                $(option).prop("selected", true);
                if (isOnlyBuff($(option))) {
                    $(option).prop("selected", false);
                    return true;
                }
                if (isOnlyUse($(option))) {
                    $(option).prop("selected", false);
                    return true;
                }
                if (isOtherOnlyUse($(option))) {
                    $(option).prop("selected", false);
                    return true;
                }

                setAloneActivation($(option));
                let select_lv = $(option).data("select_lv");
                let max_lv = $(option).data("max_lv");
                createSkillLvList(select_id + "_lv", max_lv, select_lv);
                // 選択スキルのステータスを着色
                setStatusToBuff(option, select_id);

                // セットしたら次のバフ
                return false;
            }
        });
    });
    $(".include_lv").trigger("change");
    updateEnemyResistDown();
    MicroModal.close('modal_select_buff');
}

// バフリストに追加
function addBuffList(member_info, member_kind) {
    let chara_id = member_info.style_info.chara_id;
    let buff_list = skill_buff.filter(obj =>
        (obj.chara_id === chara_id || obj.chara_id === 0) &&
        (obj.style_id === member_info.style_info.style_id || obj.style_id === 0)
    );

    buff_list.forEach(value => {
        let buff_element = 0;
        let only_one = "";
        if (value.buff_id == 2607 && member_info.style_info.style_id != 145) {
            // 月光(歌姫の加護)
            return;
        }

        if (member_kind == 1) {
            // サブメンバーは一部のみ許可
            switch (value.buff_kind) {
                case BUFF_DEFENSEDOWN: // 防御ダウン
                case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御ダウン
                case BUFF_FRAGILE: // 脆弱
                case BUFF_FIELD: // 属性フィールド
                case BUFF_DEFENSEDP: // DP防御ダウン
                case BUFF_RESISTDOWN: // 耐性ダウン
                case BUFF_ETERNAL_DEFENSEDOWN: // 永続防御ダウン
                case BUFF_ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
                    break;
                default:
                    return;
            }
        }
        if (member_kind == 2) {
            // サポートメンバーはサポートスキルのみ許可
            if (value.skill_id < 5000 || 9000 < value.skill_id) {
                return;
            }
        }
        switch (value.buff_kind) {
            case BUFF_FIELD: // 属性フィールド
                addElementField(member_info, value.buff_name, value.min_power, value.buff_element, value.buff_id, value.skill_id);
                return;
            case BUFF_ATTACKUP: // 攻撃アップ
            case BUFF_DAMAGERATEUP: // 破壊率アップ
                only_one = "only_one";
                break;
            case BUFF_ELEMENT_ATTACKUP: // 属性攻撃アップ
                only_one = "only_one";
            case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御ダウン
            case BUFF_RESISTDOWN: // 耐性ダウン
            case BUFF_ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
                buff_element = value.buff_element;
                break;
            case BUFF_ELEMENT_CRITICALRATEUP: // 属性クリティカル率アップ
            case BUFF_ELEMENT_CRITICALDAMAGEUP: // 属性クリティカルダメージアップ
                buff_element = value.buff_element;
            case BUFF_MINDEYE: // 心眼
            case BUFF_CRITICALRATEUP: // クリ率
            case BUFF_CRITICALDAMAGEUP: // クリダメ
            case BUFF_FUNNEL: // 連撃
                only_one = "only_one";
                break;
            case BUFF_DEFENSEDOWN: // 防御ダウン
            case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御ダウン
            case BUFF_FRAGILE: // 脆弱
            case BUFF_CHARGE: // チャージ
            case BUFF_DEFENSEDP: // DP防御ダウン
            case BUFF_RESISTDOWN: // 耐性ダウン
            case BUFF_ETERNAL_DEFENSEDOWN: // 永続防御ダウン
            case BUFF_ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
                break;
            default:
                // 上記以外は適応外
                return;
        }

        let str_buff = buff_kbn[value.buff_kind];
        if (!value.skill_attack1) only_one = undefined;
        if (value.conditions === CONDITIONS_SKILL_INIT) only_one = "only_first";
        let only_chara_id = value.range_area == 7 ? `only_chara_id-${chara_id}` : "public";
        let only_other_id = value.range_area === 8 ? `only_other_chara_id-${chara_id}` : "";

        let span = $('<span>')
        let option = $('<option>')
            .val(value.buff_id)
            .data("select_lv", value.max_lv)
            .data("max_lv", value.max_lv)
            .data("skill_id", value.skill_id)
            .data("buff_id", value.buff_id)
            .data("chara_id", chara_id)
            .css("display", "none")
            .addClass("buff_element-" + buff_element)
            .addClass("buff_physical-0")
            .addClass(value.target_element == 0 ? "" : `buff_target_element-${value.target_element}`)
            .addClass("buff_id-" + value.buff_id)
            .addClass("skill_id-" + value.skill_id)
            .addClass("variable_effect_size")
            .addClass(only_chara_id)
            .addClass(only_other_id)
            .addClass(only_one)
            .addClass("chara_id-" + chara_id)
            ;
        if (value.skill_attack1) {
            option.addClass("skill_attack-" + value.skill_attack1)
        } else {
            option.addClass("skill_attack-0")
        }
        if (value.skill_attack2) {
            option.addClass("skill_attack-" + value.skill_attack2);
        }

        span.append(option);
        $("." + str_buff).append(span);
        $("." + str_buff + " .buff_id-" + value.buff_id + ".chara_id-" + chara_id).each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
}

// フィールド追加
function addElementField(member_info, field_name, effect_size, field_element, buff_id, skill_id) {
    let chara_id = member_info.style_info.chara_id;
    let chara_name = getCharaData(chara_id).chara_short_name;
    let option_text = `${chara_name}: ${field_name} ${effect_size}%`;
    let option = $('<option>')
        .text(option_text)
        .data("effect_size", effect_size)
        .data("chara_id", chara_id)
        .data("skill_id", skill_id)
        .val(buff_id)
        .css("display", "none")
        .addClass("public")
        .addClass(`buff_element-${field_element}`)
        .addClass("buff_physical-0")
        .addClass(`chara_id-${chara_id}`);
    let span = $('<span>')
    span.append(option);
    $("#element_field").append(span);
}

// アビリティ追加
function addAbility(member_info) {
    let chara_id = member_info.style_info.chara_id;
    let ability_list = [member_info.style_info.ability0, member_info.style_info.ability00, member_info.style_info.ability1, member_info.style_info.ability3, member_info.style_info.ability5, member_info.style_info.ability10];
    let is_select = member_info.is_select;

    // ロールアビリティ
    if (member_info.style_info.role == ROLE_ADMIRAL) {
        ability_list.push(299);
    }
    for (let index = 0; index < ability_list.length; index++) {
        let ability_id = ability_list[index];
        if (ability_id == null || ability_id > 1000) {
            // 1000番以降は不要
            continue;
        }
        let ability_info = getAbilityInfo(ability_id);
        if (!is_select && ability_info.range_area != RANGE_FIELD) {
            // 他部隊のアビリティはフィールドのみ許可
            continue;
        }
        let limit_border = index <= 1 ? 0 : (index === 2 ? 1 : (index === 3 ? 3 : (index === 4 ? 5 : 10)));
        let display = "none";

        if ((ability_info.element === 0 && ability_info.physical == 0)
            || (select_attack_skill && (select_attack_skill.attack_element === ability_info.element || (select_attack_skill.attack_physical === ability_info.physical)))) {
            display = "block";
        }
        let target;
        let element_type;
        let physical_type;
        let append = undefined;
        let effect_size = ability_info.effect_size;

        switch (ability_info.range_area) {
            case RANGE_FIELD: // フィールド
                addElementField(member_info, ability_info.ability_name, ability_info.effect_size, ability_info.element, 0, 0);
                continue;
            case RANGE_SELF: // 自分
                if (select_attack_skill && select_attack_skill.chara_id !== chara_id) {
                    display = "none"
                }
                target = "ability_self";
                element_type = "self_element"
                physical_type = "self_physical"
                break;
            case RANGE_ALLY_FRONT:  // 味方前衛
            case RANGE_ALLY_BACK: // 味方後衛
            case RANGE_ALLY_ALL: // 味方全体
            case RANGE_ENEMY_ALL: // 敵全体
            case RANGE_OTHER: // その他
                switch (ability_info.activation_place) {
                    case 1: // 前衛
                        target = "ability_front";
                        break;
                    case 2: // 後衛
                        target = "ability_back";
                        break;
                    case 3: // 全体
                    case 0: // その他
                        target = "ability_all";
                        break;
                }
                element_type = "public buff_element"
                physical_type = "buff_physical"
                break;
            default:
                break;
        }
        // 浄化の喝采/破砕の喝采
        // const APPEND_SELECT_LIST = [407, 408];
        // if (APPEND_SELECT_LIST.includes(ability_info.ability_id)) {
        //     // 追加
        //     var option1 = $('<option>').text("×1").val(1);
        //     var option2 = $('<option>').text("×2").val(2);
        //     append = $('<select>').append(option1).append(option2).addClass("ability_select");
        // }
        let name = (is_select ? "" : "(他部隊)") + getCharaData(chara_id).chara_short_name;
        let fg_update = false;
        let id = target + chara_id + index;
        let chara_id_class = "chara_id-" + chara_id;
        let input = $('<input>').attr("type", "checkbox").attr("id", id)
            .data("effect_size", effect_size)
            .data("limit_border", limit_border)
            .data("ability_id", ability_id)
            .data("chara_id", chara_id)
            .addClass("ability_element-" + ability_info.element)
            .addClass("ability")
            .addClass(chara_id_class);
        // スキル強化可変アビリティ
        if (ability_id == 505 || ability_id == 506 || ability_id == 507 || ability_id == 508 || ability_id == 509) {
            input.addClass("strengthen_skill");
            fg_update = true;
        }
        // フィールド強化アビリティ
        if (ability_id == 603) {
            input.addClass("strengthen_field");
            fg_update = true;
        }
        let label = $('<label>')
            .attr("for", id)
            .text(`${name}: ${ability_info.ability_name} (${ability_info.ability_short_explan})`)
            .addClass("checkbox01");
        let div = $('<div>').append(input).append(label)
            .addClass(element_type + "-" + ability_info.element)
            .addClass(physical_type + "-" + ability_info.physical)
            .addClass(ability_info.target_element == 0 ? "" : `buff_target_element-${ability_info.target_element}`)
            .addClass(target)
            .addClass(chara_id_class)
            .css("display", display);
        $("#" + target).append(div);
        // if (append !== undefined) {
        //     $(div).append(append);
        // }
        if (fg_update) {
            // バフ効果量を更新
            $(".variable_effect_size." + chara_id_class).each(function (index, value) {
                updateBuffEffectSize($(value));
            });
        }
    }
}

// アビリティチェック設定
function setAbilityCheck(input, ability_info, limit_border, limit_count, chara_id) {
    let disabled = !ability_info.conditions;
    let checked = true;
    let oldChecked = $(input).prop("checked");
    switch (ability_info.range_area) {
        case RANGE_SELF:	// 自分
            disabled = limit_count < limit_border || ($(input).hasClass(chara_id) && disabled);
            checked = limit_count >= limit_border && $(input).hasClass(chara_id);
            break
        case RANGE_ALLY_FRONT:	// 味方前衛
        case RANGE_ALLY_BACK:	// 味方後衛
            // 前衛または後衛かつ、本人以外
            if ((ability_info.activation_place == 1 || ability_info.activation_place == 2) && !$(input).hasClass(chara_id) || !disabled) {
                disabled = false;
            } else {
                disabled = true;
            }
            checked = limit_count >= limit_border && $(input).hasClass(chara_id);
            break
        case RANGE_ALLY_ALL:	// 味方全体
        case RANGE_ENEMY_ALL:	// 敵全体
        case RANGE_OTHER:	    // その他
            // 前衛または後衛かつ、本人以外
            if ((ability_info.activation_place == 1 || ability_info.activation_place == 2) && !$(input).hasClass(chara_id) || !disabled) {
                disabled = false;
            } else {
                disabled = true;
            }
            if (limit_count < limit_border) {
                disabled = true;
                checked = false;
            }
            break;
    }
    // 非表示かつチェックされている場合はチェック解除
    if ($(input).parent().css("display") == "none" && checked && !disabled) {
        checked = false;
    }
    // 新規にチェック付けて良いか
    if (!oldChecked && checked && !disabled) {
        switch (ability_info.activation_place) {
            case 1:	// 前衛
                checked = checkFrontAbility() < 2;
                break;
            case 2:	// 後衛
                // 現在チェックする必要が無い
                break;
        }
    }

    $(input).prop("checked", checked).attr("disabled", disabled);
    if (checked != oldChecked) {
        $(input).trigger("change");
    }
}
// 前衛人数チェック
function checkFrontAbility() {
    let chara_id_class = "chara_id-" + select_attack_skill.chara_id;
    let front = $(`#ability_front input:checked:not('.${chara_id_class}')`).filter(function () {
        return $(this).parent().css("display") !== "none";
    });
    return front.length;
}


// パッシブ追加
function addPassive(member_info) {
    let chara_id = member_info.style_info.chara_id;
    let style_id = member_info.style_info.style_id;
    let is_select = member_info.is_select;

    const TARGET_KIND = [
        EFFECT_ATTACKUP, // 攻撃力アップ
        EFFECT_DAMAGERATEUP, // 破壊率上昇
        EFFECT_CRITICAL_UP, // クリティカル率アップ
        EFFECT_FIELD_DEPLOYMENT, // フィールド展開
        EFFECT_STATUSUP_VALUE, // 能力固定上昇
        EFFECT_STATUSUP_RATE, // 能力%上昇
        EFFECT_FIELD_STRENGTHEN, // フィールド強化
        EFFECT_BUFF_STRENGTHEN, // バフ強化
    ]
    const SUB_TARGET_KIND = [
        EFFECT_FIELD_DEPLOYMENT, // フィールド展開
        EFFECT_STATUSUP_VALUE, // 能力固定上昇
        EFFECT_STATUSUP_RATE, // 能力%上昇
        EFFECT_FIELD_STRENGTHEN, // フィールド強化
        EFFECT_BUFF_STRENGTHEN, // バフ強化
    ]
    let passive_list = skill_list.filter(obj =>
        obj.chara_id === chara_id &&
        (obj.style_id === style_id || obj.style_id === 0) &&
        obj.skill_active == 1
    );

    $.each(passive_list, function (index, value) {
        let skill_id = value.skill_id;
        let passive_info = getPassiveInfo(skill_id);
        if (!passive_info || !TARGET_KIND.includes(passive_info.effect_type)) {
            return true;
        }
        if (!is_select && !SUB_TARGET_KIND.includes(passive_info.effect_type)) {
            // 他部隊のアビリティは一部のみ許可
            return true;
        }
        let effect_size = passive_info.effect_size;
        let target_chara_id_class = "";
        let member_list = [];
        let add_check_class = "";
        let add_div_class = "";
        switch (passive_info.range_area) {
            case RANGE_FIELD: // フィールド
                addElementField(member_info, passive_info.passive_name, effect_size, 0, 0, skill_id);
                return true;
            case RANGE_ALLY_ALL: // 全員
                add_div_class = "passive_all";
                break;
            case RANGE_SELF: // 自分
                member_list = [chara_id];
                break;
            case RANGE_31E_MEMBER: // 31Eメンバー
                member_list = CHARA_ID_31E;
                break;
            case RANGE_MARUYAMA_MEMBER: // 丸山部隊
                member_list = CHARA_ID_MARUYAMA;
                break;
            default:
                break;
        }
        $.each(member_list, function (index, value) {
            target_chara_id_class += (is_select ? " passive_chara_id-" : " passive_sub_chara_id-") + value;
        });
        switch (passive_info.effect_type) {
            case EFFECT_STATUSUP_VALUE: // 能力固定上昇
            case EFFECT_STATUSUP_RATE: // 能力%上昇
                add_div_class = "passive_all";
                add_check_class = "strengthen_status";
                break;
            case EFFECT_FIELD_STRENGTHEN: // フィールド強化
                add_div_class = "passive_all";
                add_check_class = "strengthen_field";
                break;
            case EFFECT_BUFF_STRENGTHEN: // バフ強化
                add_div_class = "passive_all";
                add_check_class = "strengthen_skill";
                break;
        }

        let chara_id_class = "chara_id-" + chara_id;
        let name = (is_select ? "" : "(他部隊)") + getCharaData(chara_id).chara_short_name;
        let id = `skill_passive${skill_id}`;
        let input = $('<input>').attr("type", "checkbox").attr("id", id)
            .data("effect_size", effect_size)
            .data("skill_id", skill_id)
            .addClass("passive")
            .addClass(add_check_class)
            .addClass(chara_id_class);
        let label = $('<label>')
            .attr("for", id)
            .text(`${name}: ${passive_info.passive_name} (${passive_info.passive_short_explan})`)
            .addClass("checkbox01");
        let div = $('<div>').append(input).append(label)
            .addClass("passive_div")
            .addClass(target_chara_id_class)
            .addClass(add_div_class)
            .addClass(chara_id_class);
        $("#skill_passive").append(div);
    });
}

// 効果量取得
function getEffectSize(buff_kind, buff_id, member_info, skill_lv) {
    let effect_size = 0;
    switch (buff_kind) {
        case BUFF_ATTACKUP: // 攻撃力アップ
        case BUFF_ELEMENT_ATTACKUP: // 属性攻撃力アップ
        case BUFF_MINDEYE: // 心眼
        case BUFF_CRITICALDAMAGEUP:	// クリティカルダメージアップ
        case BUFF_ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
        case BUFF_CHARGE: // チャージ
        case BUFF_DAMAGERATEUP: // 破壊率アップ
            effect_size = getBuffEffectSize(buff_id, member_info, skill_lv, "3");
            break;
        case BUFF_CRITICALRATEUP:	// クリティカル率アップ
        case BUFF_ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
            effect_size = getBuffEffectSize(buff_id, member_info, skill_lv, "5");
            break;
        case BUFF_DEFENSEDOWN: // 防御力ダウン
        case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
        case BUFF_FRAGILE: // 脆弱
        case BUFF_DEFENSEDP: // DP防御力ダウン
        case BUFF_RESISTDOWN: // 耐性ダウン
        case BUFF_ETERNAL_DEFENSEDOWN: // 永続防御ダウン
        case BUFF_ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
            effect_size = getDebuffEffectSize(buff_id, member_info, skill_lv);
            break;
        case BUFF_FUNNEL: // 連撃
            effect_size = getFunnelEffectSize(buff_id, member_info);
            break;
        default:
            break;
    }
    return effect_size;
}

// スキル設定
function select2ndSkill(select) {
    let id = select.attr("id");
    // 自動選択無しの場合は更新しない
    if (!$("#auto_skill").prop("checked")) {
        // 外されていた場合は、「無し」にする。
        if (select.find(":selected").css("display") == "none") {
            select.prop("selectedIndex", 0);
        }
        if (select.prop("selectedIndex") == 0) {
            resetSkillLv(id);
            ref_status_list["status_" + id] = [];
        }
        return;
    }
    select.prop("selectedIndex", 0);
    if (select.prop("disabled")) {
        return;
    }
    ref_status_list["status_" + id] = [];
    for (let i = 1; i < select.find("option").length; i++) {
        let option = select.find("option")[i];
        if ($(option).css("display") !== "none") {
            let buff_id = Number($(option).val());
            let buff_info = getBuffIdToBuff(buff_id);
            if (buff_info && buff_info.skill_id > 9000) {
                // アタッカライズ、クリシン、コンセ、ソフニング
                continue;
            }
            $(option).prop("selected", true);
            if (isOnlyBuff($(option))) {
                $(option).prop("selected", false);
                continue;
            }
            if (isOnlyUse($(option))) {
                $(option).prop("selected", false);
                continue;
            }
            if (isOtherOnlyUse($(option))) {
                $(option).prop("selected", false);
                continue;
            }
            if (buff_id == 0) {
                // アビリティ
                break;
            }
            setAloneActivation($(option));
            let select_lv = $(option).data("select_lv");
            let max_lv = $(option).data("max_lv");
            createSkillLvList(select.attr("id") + "_lv", max_lv, select_lv);
            // 選択スキルのステータスを着色
            setStatusToBuff(option, select.attr("id"));
            return;
        }
    }
    resetSkillLv(select.prop("id"));
}

// 単一バフが既に設定済み判定
function isOnlyBuff(option) {
    if (option.hasClass("only_first")) {
        let class_name = option.parent().attr("id").replace(/[0-9]/g, '');
        let buff_id = "buff_id-" + option.val();
        if ($("." + class_name + " option." + buff_id + ":selected").length > 1) {
            return true;
        }
    }
    if (option.hasClass("only_one") && select_attack_skill !== undefined) {
        if (option.hasClass("chara_id-" + select_attack_skill.chara_id)) {
            let class_name = option.parent().attr("id").replace(/[0-9]/g, '');
            let skill_id = "skill_id-" + option.data("skill_id");
            if ($("." + class_name + " option." + skill_id + ":selected").length > 1) {
                return true;
            }
        }
    }
    return false;
}

// 他スキルに使用出来ない攻撃バフ
function isOnlyUse(option) {
    if (option.hasClass("only_one") && select_attack_skill !== undefined) {
        if (option.hasClass("chara_id-" + select_attack_skill.chara_id)) {
            var attack_id = select_attack_skill.attack_id;
            var class_list = option.attr("class").split(" ");

            let ret = true;
            for (var i = 0; i < class_list.length; i++) {
                var class_name = class_list[i];
                if (class_name.startsWith("skill_attack-")) {
                    var partial_class = class_name.replace("skill_attack-", "");
                    if (Number(partial_class) != 0 && (Number(partial_class) == 999 || attack_id == Number(partial_class))) {
                        ret = false;
                    }
                }
            }
            return ret;
        }
    }
    return false;
}

// 自分に使用出来ない攻撃バフ
function isOtherOnlyUse(option) {
    if (select_attack_skill !== undefined) {
        if (option.hasClass("only_other_chara_id-" + select_attack_skill.chara_id)) {
            return true;
        }
    }
    return false;
}

// 単独発動設定
function setAloneActivation(option) {
    let buff_id = option.data("buff_id");
    let id = option.parent().attr("id");
    let partner_id = id.endsWith('1') ? id.slice(0, -1) + '2' : id.slice(0, -1) + '1';
    let buff_info = getBuffIdToBuff(buff_id);
    // 他スキルを使用不可にする。
    if (buff_info && isAloneActivation(buff_info)) {
        $(`#${partner_id}`).prop("disabled", true);
        $(`#${partner_id}`).prop("selectedIndex", 0);
        $(`#${partner_id}`).find("option").first().text("使用不可");
    } else {
        $(`#${partner_id}`).prop("disabled", false);
        $(`#${partner_id}`).find("option").first().text("無し");
    }
}

// 単独発動判定
function isAloneActivation(buff_info) {
    if (ALONE_ACTIVATION_BUFF_KIND.includes(buff_info.buff_kind)) {
        return buff_info.effect_count > 0;
    }
    return false;
}

// 選択バフのステータスを着色
function setStatusToBuff(option, id) {
    // 非表示項目は設定しない
    if ($(option).parent().parent().css('display') == 'none') {
        return;
    }
    let buff = getBuffIdToBuff(Number($(option).val()));
    if (buff !== undefined) {
        let chara_id = $(option).data("chara_id");
        let list = [];
        if (status_kbn[buff.ref_status_1]) {
            list.push(status_kbn[buff.ref_status_1] + chara_id);
        }
        if (status_kbn[buff.ref_status_2]) {
            list.push(status_kbn[buff.ref_status_2] + chara_id);
        }
        ref_status_list["status_" + id] = list;
    }
}

// スキルLv使用不可に戻す
function resetSkillLv(id) {
    $("#" + id + "_lv").empty();
    $("#" + id + "_lv").parent().css("display", "none");
}

// アビリティ項目の設定
function setAbilityDisplay(limit_count, chara_id) {
    // フィールドを更新
    $("#element_field option").each(function (index, value) {
        if (index === 0) return true;
        if ($(value).data("skill_id") == 0) {
            if ($(value).hasClass(chara_id)) {
                if (limit_count >= 3) {
                    $(value).data("limit_border", true);
                    $(value).css("display", "block");
                } else {
                    $(value).data("limit_border", false);
                    $(value).css("display", "none");
                }
            } else {
                if (!$(value).data("limit_border")) {
                    $(value).css("display", "none");
                }
            }
            select2ndSkill($(value).parent());
        }
    });
}

// 効果量合計
function getSumEffectSize(class_name) {
    let effect_size = 0;
    $("." + class_name).each(function (index, value) {
        let selected = $(value).find("option:selected");
        if (selected.val() == "") {
            return true;
        }
        if ($(selected).data("text_effect_size")) {
            effect_size += Number($(selected).data("text_effect_size"));
        } else {
            effect_size += Number($(selected).data("effect_size"));
        }
    });
    return effect_size;
}

// 合計バフ効果量取得
function getSumBuffEffectSize(grade_sum) {
    // スキルバフ合計
    let sum_buff = getSumEffectSize("buff");
    // 攻撃力アップアビリティ
    sum_buff += getSumAbilityEffectSize(EFFECT_ATTACKUP);
    // 属性リング(0%-10%)
    if (select_attack_skill.attack_element != 0) {
        sum_buff += Number($("#elememt_ring option:selected").val());
    }
    // オーバードライブ10%
    if ($("#overdrive").prop("checked")) {
        sum_buff += 10;
    }
    sum_buff += getChainEffectSize("skill");
    // トークン
    sum_buff += getSumTokenAbilirySize(EFFECT_TOKEN_ATTACKUP);
    // 士気
    sum_buff += Number($("#morale_count").val()) * 5;
    // 永遠なる誓い
    sum_buff += $("#eternal_vows").prop("checked") ? 50 : 0;
    // オギャり
    sum_buff += $("#babied").prop("checked") ? 30 : 0;
    // スコアタグレード
    if (grade_sum.power_up) {
        sum_buff += grade_sum.power_up;
    }
    // 制圧戦
    sum_buff += getBikePartsEffectSize("buff");
    return 1 + sum_buff / 100;
}

// 合計デバフ効果量取得
function getSumDebuffEffectSize() {
    // スキルデバフ合計
    let sum_debuff = getSumEffectSize("debuff");
    // 防御ダウンアビリティ
    sum_debuff += getSumAbilityEffectSize(2);
    // 制圧戦
    sum_debuff += getBikePartsEffectSize("debuff");
    return 1 + sum_debuff / 100;
}

// 合計連撃効果量取得
function getSumFunnelEffectList() {
    // スキルデバフ合計
    let funnel_list = [];
    $(".funnel").each(function (index, value) {
        let selected = $(value).find("option:selected");
        if (selected.val() == "") {
            return true;
        }
        let buff_info = getBuffIdToBuff(Number($(selected).val()));
        let loop = buff_info.max_power;
        let size = buff_info.effect_size;
        for (let i = 0; i < loop; i++) {
            funnel_list.push(size);
        }
    });

    $("input[type=checkbox].ability:checked").each(function (index, value) {
        if ($(value).parent().css("display") === "none") {
            return true;
        }
        let ability_info = getAbilityInfo(Number($(value).data("ability_id")));
        if (ability_info.effect_type == 6) {
            let size = ability_info.effect_size;
            let loop = ability_info.effect_count;
            for (let i = 0; i < loop; i++) {
                funnel_list.push(size);
            }
        }
    });
    // 降順でソート
    funnel_list.sort(function (a, b) {
        return b - a;
    });
    return funnel_list;
}

// トークン効果量
function getSumTokenEffectSize(chara_id) {
    // トークン
    let token_count = Number($(`#token_${chara_id}`).val());
    if (select_attack_skill.token_power_up == 1) {
        return 1 + token_count * 16 / 100;
    }
    return 1;
}

// トークンアビリティ取得
function getSumTokenAbilirySize(effect_type) {
    let sum = 0;
    $("input[type=checkbox].ability:checked").each(function (index, value) {
        if ($(value).parent().css("display") === "none") {
            return true;
        }
        let ability_info = getAbilityInfo(Number($(value).data("ability_id")));
        if (ability_info.effect_type == effect_type) {
            let size = ability_info.effect_size;
            let chara_id = Number($(value).data("chara_id"));
            let token_count = Number($(`#token_${chara_id}`).val());
            if (!isNaN(token_count)) {
                sum += token_count * size;
            }
        }
    });
    return sum;
}

// 制圧戦のバイクパーツ取得
function getBikePartsEffectSize(buff_kind) {
    // 制圧戦以外は無し
    if ($("#enemy_class").val() != 11) {
        return 0;
    }
    let buff = 0;
    let debuff = 0;
    let critical_rate = 0;
    let critical_buff = 0;
    let destruction_rate = 0;
    for (let i = 1; i <= 3; i++) {
        let option = Number($(`#bike_parts_${i}`).val());
        switch (option) {
            case 1: // 攻撃＋
                buff += 20;
                break;
            case 2: // クリティカル率＋
                critical_rate += 30;
                break;
            case 4: // 敵防御ダウン
                debuff += 30;
                break;
            case 5: // 攻撃＋＋
                buff += 50;
                break;
            case 7: // クリティカル率ダメージ＋
                critical_buff += 30;
                break;
            case 9: // 破壊率＋
                destruction_rate += 100;
                break;
            case 10: // 攻撃＋改
                buff += 40;
                break;
            case 11: // クリティカル率＋改
                critical_rate += 45;
                break;
            case 12: // 敵防御ダウン改
                debuff += 30;
                break;
            case 13: // 攻撃＋＋改
                buff += 65;
                break;
            case 14: // クリティカル率ダメージ＋改
                critical_buff += 40;
                break;
            case 16: // 破壊率＋改
                destruction_rate += 120;
                break;
        }
    }
    switch (buff_kind) {
        case "buff":
            return buff;
        case "debuff":
            return debuff;
        case "critical_rate":
            return critical_rate;
        case "critical_buff":
            return critical_buff;
        case "destruction_rate":
            return destruction_rate;
        default:
            return 0;
    }
}

// クリティカル率取得
function getCriticalRate(member_info) {
    let critical_rate = 1.5;
    let diff = (member_info.luk - Number($("#enemy_stat").val()));
    critical_rate += diff > 0 ? diff * 0.04 : 0;
    critical_rate = critical_rate > 15 ? 15 : critical_rate;
    critical_rate += getSumEffectSize("critical_rate");
    critical_rate += getSumAbilityEffectSize(3);
    critical_rate += $("#charge").prop("selectedIndex") > 0 ? 20 : 0;
    let grade_sum = getGradeSum();
    critical_rate -= grade_sum.critical;
    critical_rate = critical_rate < 0 ? 0 : critical_rate;
    // 永遠なる誓い
    critical_rate += $("#eternal_vows").prop("checked") ? 50 : 0;
    // 制圧戦
    critical_rate += getBikePartsEffectSize("critical_rate");
    return critical_rate > 100 ? 100 : critical_rate;
}

// クリティカルバフ取得
function getCriticalBuff() {
    let critical_buff = 50;
    critical_buff += getSumEffectSize("critical_buff");
    critical_buff += getSumAbilityEffectSize(4);
    // 制圧戦
    critical_buff += getBikePartsEffectSize("critical_buff");
    return 1 + critical_buff / 100;
}

// アビリティ効果量合計取得
function getSumAbilityEffectSize(effect_type, is_select, chara_id) {
    let ability_effect_size = 0;
    let sum_none_effect_size = 0;
    let sum_physical_effect_size = 0;
    let sum_element_effect_size = 0;
    let activation_none_effect_size = 0;
    let activation_physical_effect_size = 0;
    let activation_element_effect_size = 0;
    let sp_cost_down = 0;
    if ($("#ability_all72").prop("checked")) {
        sp_cost_down = 1;
    }
    $("input[type=checkbox].ability:checked").each(function (index, value) {
        if ($(value).parent().css("display") === "none") {
            return true;
        }
        let ability_id = Number($(value).data("ability_id"));
        if (ability_id == 602) {
            // キレアジ
            let attack_info = getAttackInfo();
            if (attack_info.sp_cost - sp_cost_down > 8) {
                return true;
            }
        }
        let ability_info = getAbilityInfo(ability_id);
        let effect_size = 0;
        if (ability_info.effect_type == effect_type) {
            effect_size = Number($(value).data("effect_size"));
        }
        if ($(value).parent().find("select").length > 0) {
            effect_size *= Number($(value).parent().find("select").val());
        }
        if (ALONE_ACTIVATION_ABILITY_LIST.includes(ability_id)) {
            if (ability_info.element != 0) {
                activation_element_effect_size = Math.max(activation_element_effect_size, effect_size);
            } else if (ability_info.physical != 0) {
                activation_physical_effect_size = Math.max(activation_physical_effect_size, effect_size);
            } else {
                activation_none_effect_size = Math.max(activation_none_effect_size, effect_size);
            }
        } else {
            if (ability_info.element != 0) {
                sum_element_effect_size += effect_size;
            } else if (ability_info.physical != 0) {
                sum_physical_effect_size += effect_size;
            } else {
                sum_none_effect_size += effect_size;
            }
        }
    });
    ability_effect_size += activation_none_effect_size + sum_none_effect_size
        + activation_physical_effect_size + sum_physical_effect_size
        + activation_element_effect_size + sum_element_effect_size;
    $("input[type=checkbox].passive:checked").each(function (index, value) {
        let select = $(value).parent();
        if (select.css("display") === "none") {
            return true;
        }
        if (chara_id) {
            if (!select.hasClass((is_select ? "passive_chara_id-" : "passive_sub_chara_id-") + chara_id)) {
                return true;
            }
        }
        let skill_id = Number($(value).data("skill_id"));
        let passive_info = getPassiveInfo(skill_id);
        let effect_size = 0;
        if (passive_info.effect_type == effect_type) {
            effect_size = Number($(value).data("effect_size"));
        }
        ability_effect_size += effect_size;
    });
    return ability_effect_size;
}

// 破壊率アップ効果量取得
function getDestructionEffectSize(hit_count) {
    let destruction_effect_size = 100;
    let grade_sum = getGradeSum();
    destruction_effect_size += getSumEffectSize("destruction_rete_up");
    destruction_effect_size += getSumAbilityEffectSize(5);
    destruction_effect_size += getSumTokenAbilirySize(EFFECT_TOKEN_DAMAGERATEUP)
    destruction_effect_size += getEarringEffectSize("blast", 10 - hit_count);
    destruction_effect_size += getChainEffectSize("blast");
    // 制圧戦
    destruction_effect_size += getBikePartsEffectSize("destruction_rate");
    destruction_effect_size -= grade_sum.destruction;
    return destruction_effect_size / 100;
}

// アビリティ情報取得
function getAbilityInfo(ability_id) {
    const filtered_ability = ability_list.filter((obj) => obj.ability_id == ability_id);
    return filtered_ability.length > 0 ? filtered_ability[0] : undefined;
}

// パッシブ情報取得
function getPassiveInfo(skill_id) {
    const filtered_passive = skill_passive.filter((obj) => obj.skill_id == skill_id);
    return filtered_passive.length > 0 ? filtered_passive[0] : undefined;
}

// キャラIDからメンバー情報取得
function getCharaIdToMember(chara_id) {
    const filtered_member = (style_list) => {
        const filter_list = style_list.filter((obj) => obj?.style_info?.chara_id == chara_id);
        return filter_list.length > 0 ? filter_list[0] : undefined;
    }
    let member;
    member = filtered_member(select_style_list)
    if (!member) {
        member = filtered_member(sub_style_list)
    }
    if (!member) {
        member = filtered_member(support_style_list)
    }
    return member;
}

// 敵リスト作成
function createEnemyList(enemy_class) {
    // $("#enemy_list").empty();
    // $.each(enemy_list, function (index, value) {
    //     if (value.enemy_class == enemy_class) {
    //         var option = $('<option>')
    //             .val(value.enemy_class_no);
    //         if (enemy_class == ENEMY_CLASS_SCORE_ATTACK) {
    //             option.text(`#${value.sub_no} ${value.enemy_name}`)
    //         } else if (enemy_class == ENEMY_CLASS_CLOCK_TOWER_NORMAL || enemy_class == ENEMY_CLASS_CLOCK_TOWER_HARD) {
    //             option.text(`(${value.sub_no}F) ${value.enemy_name}`)
    //         } else {
    //             option.text(value.enemy_name);
    //         }
    //         $("#enemy_list").append(option);
    //     }
    // });

    // const reverse = [ENEMY_CLASS_SCORE_ATTACK, ENEMY_CLASS_STELLAR_SWEEP_FRONT, ENEMY_CLASS_EVENT_PRISMATIC]
    // if (reverse.includes(enemy_class)) {
    //     // 表示を逆順にする
    //     $("#enemy_list").html($("#enemy_list option").toArray().reverse());
    //     $("#enemy_list").prop("selectedIndex", 0);
    // }

    // if (enemy_class == ENEMY_CLASS_SCORE_ATTACK) {
    // スコアタの場合、グレードを表示する。
    // $(".score_attack").css("display", "block");
    // $("#score_lv").show();
    // $("#prediction_score").show();
    // } else {
    // $(".score_attack").css("display", "none");
    // $("#score_lv").hide();
    // $("#prediction_score").hide();
    // }
    // if (enemy_class == ENEMY_CLASS_HARD_LAYER) {
    //     // 異時層の場合、サブパーティを表示する。
    //     $(".hard_layer").css("display", "block");
    // } else {
    //     $(".hard_layer").css("display", "none");
    // }
    // if (enemy_class == ENEMY_CLASS_CONTROL_BATTLE) {
    //     // 制圧戦、バイクバフを表示する。
    //     $(".bike_buff").css("display", "block");
    //     $(".bike_parts").val(0);
    //     // メンバー情報作成
    //     let member_info = new Member();
    //     member_info.is_select = true;
    //     member_info.chara_no = 20;
    //     let style_info = {};
    //     style_info.chara_id = 501;
    //     style_info.jewel_type = 0;
    //     member_info.style_info = style_info;
    //     support_style_list[0] = member_info;
    //     addBuffList(member_info, 2);
    // } else {
    //     removeSupportMember(0);
    //     $(".bike_buff").css("display", "none");
    // }
    // if (enemy_class == ENEMY_CLASS_SERAPH_ENCOUNTER) {
    //     $(".randam_card").show();
    // } else {
    //     $(".randam_card").hide();
    // }
    // if (enemy_class == ENEMY_CLASS_FREE_INPUT) {
    //     // 自由入力の場合、入力を解除する
    //     $("#enemy_save").show();
    //     $(".enemy_input").attr("readonly", false);
    //     $("#enemy_list").addClass("short");
    // } else {
    //     $("#enemy_save").hide();
    //     $(".enemy_input").attr("readonly", true);
    //     $("#enemy_list").removeClass("short");
    // }
    // 既存のメンバーの情報を削除
    for (let i = 0; i < 6; i++) {
        removeSubMember(i);
    }
    $("#sub_troops").val(-1);
    setEnemyStatus();
}

// 敵情報取得
function getEnemyInfo() {
    const enemy_class = Number($("#enemy_class option:selected").val());
    const enemy_class_no = Number($("#enemy_list option:selected").val());
    const filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no === enemy_class_no);
    return filtered_enemy.length > 0 ? filtered_enemy[0] : undefined;
}

// グレード情報更新
function updateGrade(grade_sum) {
    for (let i = 1; i <= 3; i++) {
        setEnemyElement("#enemy_physical_" + i, null, - grade_sum["physical_" + i], null);
    }
    for (let i = 0; i <= 5; i++) {
        setEnemyElement("#enemy_element_" + i, null, - grade_sum["element_" + i], null);
    }
    displayWeakRow();
}

// グレード情報取得
function getGradeSum(enemy_info) {
    if (!enemy_info) {
        enemy_info = getEnemyInfo();
    }
    let grade_sum = {
        "score_attack_no": 0, "half": 0, "grade_no": 0, "grade_rate": 0, "grade_none": 0,
        "step_turn": 0, "defense_rate": 0, "dp_rate": 0, "hp_rate": 0, "physical_1": 0, "physical_2": 0, "physical_3": 0,
        "element_0": 0, "element_1": 0, "element_2": 0, "element_3": 0, "element_4": 0, "element_5": 0, "destruction": 0, "critical": 0
    };
    if (enemy_info == undefined || enemy_info.enemy_class != ENEMY_CLASS_SCORE_ATTACK) {
        // スコアタ以外の場合は、基本値
        return grade_sum;
    }
    let checked_id = $('input[name="rule_tab"]:checked').attr('id');
    $("." + checked_id + ":checked").each(function (index, value) {
        let grade_no = Number($(value).data("grade_no"));
        let half = Number(checked_id.match(/\d+/g));
        grade_list.filter((obj) => obj.score_attack_no == enemy_info.sub_no && obj.half == half && obj.grade_no == grade_no).forEach(grade => {
            grade_sum["grade_rate"] += grade["grade_rate"];
            if (grade.grade_none == 1) {
                return true;
            }
            [1, 2, 3, 4].forEach(index => {
                let kind = grade["effect_kind" + index];
                if (kind == "") {
                    return;
                }
                let turn_count = 1;
                let conditions = grade["conditions" + index];
                if (conditions.includes("step_turn")) {
                    let step_turn = Number(conditions.replace("step_turn", ""));
                    turn_count = Math.floor(Number($("#turn_count").val()) / step_turn);
                } else if (conditions) {
                    if (!judgeConditions(conditions)) {
                        return
                    }
                }
                grade_sum[kind] = grade["effect_size" + index];
                grade_sum["effect_count"] = turn_count;
            });
        });
    });
    return grade_sum;
}

// 条件判定
function judgeConditions(conditions) {
    switch (conditions) {
        case "token":
            let attack_info = getAttackInfo();
            // トークン
            let token_count = Number($(`#token_${attack_info.chara_id}`).val());
            return token_count > 0;
    }
    return false;
}

// 敵ステータス設定
function setEnemyStatus(enemy_info, isUpdate) {
    // 種別ごとの設定
    // switch (enemy_info.enemy_class) {
    //     case ENEMY_CLASS_HARD_LAYER:
    //         if (enemy_info.enemy_class_no == 12 || enemy_info.enemy_class_no == 13) {
    //             $("#skull_feather_1st").css("display", "block");
    //         } else {
    //             $("#skull_feather_1st").css("display", "none");
    //         }
    //         break;
    //     case ENEMY_CLASS_SCORE_ATTACK:
    //         displayScoreAttack(enemy_info);
    //         break;
    // }
    if (!enemy_info) {
        return;
    }

    // 移行中の暫定対応
    if (enemy_info.enemy_class == ENEMY_CLASS_SCORE_ATTACK) {
        $("#prediction_score").show();
    } else {
        $("#prediction_score").hide();
    }

    $("#enemy_stat").val(enemy_info.enemy_stat);
    let strong_break = $("#strong_break").prop("checked") ? 300 : 0;
    $("#enemy_destruction_limit").val(Number(enemy_info.destruction_limit) + strong_break);
    $("#enemy_destruction_rate").val(Number(enemy_info.destruction_limit) + strong_break);
    $("#enemy_destruction").val(Number(enemy_info.destruction));
    for (let i = 1; i <= 3; i++) {
        setEnemyElement("#enemy_physical_" + i, enemy_info["physical_" + i], 0, 0);
    }
    for (let i = 0; i <= 5; i++) {
        setEnemyElement("#enemy_element_" + i, enemy_info["element_" + i], 0, 0);
    }
    $("#enemy_hp").val(Number(enemy_info.max_hp).toLocaleString());
    setHpGarge(100);
    let max_dp_list = enemy_info.max_dp.split(",");
    for (let i = 0; i < DP_GAUGE_COUNT; i++) {
        if (i < max_dp_list.length) {
            $("#enemy_dp_" + i).val(Number(max_dp_list[i]).toLocaleString());
            $("#enemy_dp_" + i).parent().show();
            $("#rest_dp_rate_" + i).parent().show();
        } else {
            $("#enemy_dp_" + i).parent().hide();
            $("#rest_dp_rate_" + i).parent().hide();
        }
        setDpGarge(i, 0);
    }
    $(".row_dp").css("display", "none");
    if (enemy_info.enemy_class == ENEMY_CLASS_SCORE_ATTACK) {
        updateEnemyScoreAttack(enemy_info);
    }
    // if (enemy_info.enemy_class == ENEMY_CLASS_SERAPH_ENCOUNTER) {
    //     updateSeraphEncounter();
    // }
    // バフ効果量を更新
    $(".variable_effect_size").each(function (index, value) {
        updateBuffEffectSize($(value));
    });
    if (isUpdate) {
        // 再ソート
        $(".redisplay").each(function (index, value) {
            sortEffectSize($(value));
            select2ndSkill($(value));
        });
    }
    // 耐性変更時用に再実行
    updateEnemyResistDown();

    // ダメージ再計算
    calcDamage();
}

// 敵ステータス更新
function updateEnemyStatus(enemy_class_no, enemy_info) {
    const enemy_class = 99;
    let filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no === enemy_class_no);
    let index = enemy_list.findIndex((obj) => obj === filtered_enemy[0]);
    Object.assign(enemy_list[index], enemy_info);
}

// スコアアタック敵ステータス設定
function updateEnemyScoreAttack(enemy_info) {
    if (!enemy_info) {
        enemy_info = getEnemyInfo();
    }
    let grade_sum = getGradeSum(enemy_info);
    let score_attack = getScoreAttack(enemy_info.sub_no);
    let score_lv = Number($("#score_lv").val() ? $("#score_lv").val() : 150);
    let enemy_stat = score_stat[score_lv - 100];
    let enemy_hp = getScoreHpDp(score_lv, score_attack, "hp_rate");
    let max_dp_list = enemy_info.max_dp.split(",");
    for (let i = 0; i < max_dp_list.length; i++) {
        let enemy_dp = getScoreHpDp(score_lv, score_attack, "dp_rate");
        $("#enemy_dp_" + i).val((enemy_dp * (1 + grade_sum["dp_rate"] / 100)).toLocaleString());
    }
    $("#enemy_stat").val(enemy_stat);
    $("#socre_enemy_unit").val(score_attack.enemy_count);
    $("#enemy_hp").val((enemy_hp * (1 + grade_sum["hp_rate"] / 100)).toLocaleString());
    if (grade_sum["destruction_limit"]) {
        $("#enemy_destruction_limit").val(grade_sum["destruction_limit"]);
        $("#enemy_destruction_rate").val(grade_sum["destruction_limit"]);
    }
    updateGrade(grade_sum);
}

// セラフ遭遇戦敵ステータス設定
function updateSeraphEncounter() {
    let enemy_info = getEnemyInfo();
    let checked = $('input[name=card]:checked');
    let hp_rate = 1;
    let dp_rate = 1;
    let status_up = 0;
    let resist = [0, 0, 0, 0, 0, 0];

    let kind = checked.data("kind");
    if (kind) {
        let value = Number(checked.val());
        switch (kind) {
            case "status":
                status_up = value;
                break;
            case "dp_rate":
                dp_rate += value / 100;
                break;
            case "hp_rate":
                hp_rate += value / 100;
                break;
        }
        if (kind.includes("resist")) {
            let index = Number(kind.split("_")[1]);
            resist[index] = value;
        }
    }
    let enemy_hp = Number(enemy_info.max_hp);
    let max_dp_list = enemy_info.max_dp.split(",");
    for (let i = 0; i < max_dp_list.length; i++) {
        let enemy_dp = Number(max_dp_list[i]);
        $("#enemy_dp_" + i).val((enemy_dp * dp_rate).toLocaleString());
    }
    let enemy_stat = Number(enemy_info.enemy_stat);
    $("#enemy_stat").val((enemy_stat + status_up));
    $("#enemy_hp").val((enemy_hp * hp_rate).toLocaleString());
    // for (let i = 0; i <= 5; i++) {
    //     setEnemyElement(`#enemy_element_${i}`, enemy_info[`element_${i}`] - resist[i]);
    // }
}

// スコア設定
function calcScore(detail, grade_magn) {
    let score_lv = Number($("#score_lv").val());
    let is_break = $("#no_break_bonus_check").prop("checked");
    let turn_count = $("#turn_count").val();
    let enemy_info = getEnemyInfo();
    let score_attack = getScoreAttack(enemy_info.sub_no);
    let num = score_lv - 100;
    let no_break_value = is_break ? no_break_bonus[num] : 0;
    let damage_bonus_avg = getDamageBonus(detail.avg_damage, num, score_attack);
    let damage_bonus_max = getDamageBonus(detail.max_damage, num, score_attack);
    let damage_bonus_min = getDamageBonus(detail.min_damage, num, score_attack);
    // 暫定固定値
    let summary_score_avg = (level_bonus[num] + no_break_value + damage_bonus_avg) * turn_bonus[turn_count] * (1 + grade_magn / 100);
    let summary_score_max = (level_bonus[num] + no_break_value + damage_bonus_max) * turn_bonus[turn_count] * (1 + grade_magn / 100);
    let summary_score_min = (level_bonus[num] + no_break_value + damage_bonus_min) * turn_bonus[turn_count] * (1 + grade_magn / 100);
    $("#lv_score").val(level_bonus[num].toLocaleString(0));
    $("#no_break_bonus").val(no_break_value.toLocaleString(0));
    $("#damage_bonus_avg").val(damage_bonus_avg.toLocaleString(0));
    $("#damage_bonus_max").val(damage_bonus_max.toLocaleString(0));
    $("#damage_bonus_min").val(damage_bonus_min.toLocaleString(0));
    $("#turn_bonus").val("×" + turn_bonus[turn_count]);
    $("#grade_bonus").val("×" + (1 + grade_magn / 100));
    $("#summary_score_avg").val(Math.floor(summary_score_avg).toLocaleString(2));
    $("#summary_score_max").val(Math.floor(summary_score_max).toLocaleString(2));
    $("#summary_score_min").val(Math.floor(summary_score_min).toLocaleString(2));
}

// ダメージボーナス算出
function getDamageBonus(damage, num, score_attack) {
    damage *= Number($("#socre_enemy_unit").val());
    let damage_bonus;
    let damage_limit_value;
    if (score_attack.enemy_count == 1) {
        damage_limit_value = damage_limit1[num];
    } else {
        damage_limit_value = damage_limit2[num];
    }
    if (damage <= damage_limit_value) {
        damage_bonus = damage;
    } else {
        damage_bonus = damage_limit_value * (1 + Math.log(damage / damage_limit_value));
    }
    return Math.floor(damage_bonus * score_attack.max_damage_rate / 100);
}

// 敵耐性設定
function setEnemyElement(id, init, content, resist_down) {
    init = init ?? $(id).data("init");
    $(id).data("init", init);
    content = content ?? $(id).data("content");
    $(id).data("content", content);
    resist_down = resist_down ?? $(id).data("resist_down");
    $(id).data("resist_down", resist_down);

    init = Number(init) || 0;
    content = Number(content) || 0;
    resist_down = Number(resist_down) || 0;

    if (resist_down > 0 && init < 100) {
        init = 100;
    }
    let val = init + content + resist_down;
    $(id).val(val);
    $(id).removeClass("enemy_resist");
    $(id).removeClass("enemy_weak");
    if (val < 100) {
        $(id).addClass("enemy_resist");
    } else if (val > 100) {
        $(id).addClass("enemy_weak");
    }
}

// 効果量ソート
function sortEffectSize(selecter) {
    // 初期選択を保存
    var selected = selecter.val();
    var item = selecter.children().sort(function (a, b) {
        var effectA = Number($(a).data("effect_size"));
        var effectB = Number($(b).data("effect_size"));
        if (effectA < effectB) {
            return 1;
        } else if (effectA > effectB) {
            return -1;
        } else {
            var valueA = Number($(a).val());
            var valueB = Number($(b).val());
            if (valueA > valueB) {
                return 1;
            } else if (valueA < valueB) {
                return -1;
            }
            return 0;
        }
    });
    selecter.append(item);
    // 初期選択を再選択
    selecter.val(selected);
}

// 攻撃情報取得
function getAttackInfo() {
    const attack_id = Number($("#attack_list option:selected").val());
    const chara_id = Number($("#attack_list option:selected").data("chara_id"));
    const filtered_attack = skill_attack.filter((obj) => obj.attack_id === attack_id);
    let attack_info = filtered_attack.length > 0 ? filtered_attack[0] : undefined;
    if (attack_info) {
        attack_info.attack_physical = getCharaData(attack_info.chara_id).physical;
        let member_info = getCharaIdToMember(chara_id);
        attack_info.style_element = member_info.style_info.element;
        attack_info.style_element2 = member_info.style_info.element2;
    }
    return attack_info;
}

// 基礎攻撃力取得
function getBasePower(member_info, member_correction, enemy_correction) {
    let jewel_lv = 0;
    if (member_info.style_info.jewel_type == "1") {
        jewel_lv = member_info.jewel_lv;
    }
    let attack_info = getAttackInfo();
    let molecule = 0;
    let denominator = 0;
    if (attack_info.ref_status_1 != 0) {
        molecule += (member_info[status_kbn[attack_info.ref_status_1]] + member_correction) * 2;
        denominator += 2;
    }
    if (attack_info.ref_status_2 != 0) {
        molecule += member_info[status_kbn[attack_info.ref_status_2]] + member_correction;
        denominator += 1;
    }
    if (attack_info.ref_status_3 != 0) {
        molecule += member_info[status_kbn[attack_info.ref_status_3]] + member_correction;
        denominator += 1;
    }
    let enemy_stat = Number($("#enemy_stat").val()) - enemy_correction;
    let status = molecule / denominator;

    let skill_lv = Number($("#skill_lv option:selected").val());
    let min_power = attack_info.min_power * (1 + 0.05 * (skill_lv - 1));
    let max_power = attack_info.max_power * (1 + 0.02 * (skill_lv - 1));
    let skill_stat = attack_info.param_limit;
    let base_power;
    // 宝珠分以外
    if (enemy_stat - skill_stat / 2 > status) {
        base_power = 1;
    } else if (enemy_stat > status) {
        base_power = min_power / (skill_stat / 2) * (status - (enemy_stat - skill_stat / 2));
    } else if (enemy_stat + skill_stat > status) {
        base_power = (max_power - min_power) / skill_stat * (status - enemy_stat) + min_power;
    } else {
        base_power = max_power;
    }

    // 宝珠分(SLvの恩恵を受けない)
    if (jewel_lv > 0) {
        let jusl_stat = skill_stat + jewel_lv * 20;
        if (enemy_stat - skill_stat / 2 > status) {
            base_power += 0;
        } else if (enemy_stat > status) {
            base_power += attack_info.min_power / (jusl_stat / 2) * (status - (enemy_stat - jusl_stat / 2)) * jewel_lv * 0.02;
        } else if (enemy_stat + jusl_stat > status) {
            base_power += ((attack_info.max_power - attack_info.min_power) / jusl_stat * (status - enemy_stat) + attack_info.min_power) * jewel_lv * 0.02;
        } else {
            base_power += attack_info.max_power * jewel_lv * 0.02;
        }
    }
    return base_power;
}

// スキルデータ取得
function getSkillData(skill_id) {
    const filtered_skill = skill_list.filter((obj) => obj.skill_id == skill_id);
    return filtered_skill.length > 0 ? filtered_skill[0] : undefined;
}

// バフ情報取得
function getBuffIdToBuff(buff_id) {
    const filtered_buff = skill_buff.filter((obj) => obj.buff_id === buff_id);
    return filtered_buff.length > 0 ? filtered_buff[0] : undefined;
}

// バフ効果量
function getBuffEffectSize(buff_id, member_info, skill_lv, target_jewel_type) {
    let jewel_lv = 0;
    if (member_info.style_info && member_info.style_info.jewel_type == target_jewel_type) {
        jewel_lv = member_info.jewel_lv;
    }
    let buff_info = getBuffIdToBuff(buff_id);
    if (skill_lv > buff_info.max_lv) {
        skill_lv = buff_info.max_lv;
    }
    // 固定量のバフ
    if (status_kbn[buff_info.ref_status_1] == 0 || buff_info.min_power == buff_info.max_power) {
        return buff_info.min_power;
    }
    // 士気
    let morale = 0;
    if (member_info.is_select) {
        morale = Number($("#morale_count").val()) * 5;
    }
    let stat_up = getStatUp(member_info) + morale;
    let status = member_info[status_kbn[buff_info.ref_status_1]] + stat_up;
    let min_power = buff_info.min_power * (1 + 0.03 * (skill_lv - 1));
    let max_power = buff_info.max_power * (1 + 0.02 * (skill_lv - 1));
    let skill_stat = buff_info.param_limit;
    let effect_size = 0;
    // 宝珠分以外
    if (status > buff_info.param_limit) {
        effect_size += max_power;
    } else {
        effect_size += (max_power - min_power) / skill_stat * status + min_power;
    }
    if (buff_info.buff_kind != 0 && buff_info.buff_kind != 1 && buff_info.buff_kind != 6) {
        // 攻撃力アップ、属性攻撃アップ、クリティカル率アップ以外はここまで
        return effect_size;
    }
    // 宝珠分(SLvの恩恵を受けない)
    if (jewel_lv > 0) {
        let jusl_stat = skill_stat + jewel_lv * 60;
        if (status > jusl_stat) {
            effect_size += buff_info.max_power * jewel_lv * 0.04
        } else {
            effect_size += ((buff_info.max_power - buff_info.min_power) / jusl_stat * status + buff_info.min_power) * jewel_lv * 0.04;
        }
    }
    return effect_size;
}

// デバフ効果量
function getDebuffEffectSize(buff_id, member_info, skill_lv) {
    let jewel_lv = 0;
    if (member_info.style_info && member_info.style_info.jewel_type == "4") {
        jewel_lv = member_info.jewel_lv;
    }
    let enemy_stat = Number($("#enemy_stat").val());
    let buff_info = getBuffIdToBuff(buff_id);
    if (skill_lv > buff_info.max_lv) {
        skill_lv = buff_info.max_lv;
    }
    // 士気
    let morale = 0;
    if (member_info.is_select) {
        morale = Number($("#morale_count").val()) * 5;
    }
    let stat_up = getStatUp(member_info) + morale;
    let status1 = member_info[status_kbn[buff_info.ref_status_1]] + stat_up;
    let status2 = member_info[status_kbn[buff_info.ref_status_2]] + stat_up;
    let min_power = buff_info.min_power * (1 + 0.05 * (skill_lv - 1));
    let max_power = buff_info.max_power * (1 + 0.02 * (skill_lv - 1));
    let status = (status1 * 2 + status2) / 3 - enemy_stat;
    let skill_stat = buff_info.param_limit;
    let effect_size = 0;
    // 宝珠分以外
    if (status < 0) {
        effect_size += min_power;
    } else if (status < buff_info.param_limit) {
        effect_size += (max_power - min_power) / skill_stat * status + min_power;
    } else {
        effect_size += max_power;
    }
    // 宝珠分(SLvの恩恵を受けない)
    if (jewel_lv > 0) {
        let jusl_stat = skill_stat + jewel_lv * 20;
        if (status < 0) {
            effect_size += buff_info.min_power * jewel_lv * 0.02;
        } else if (status < jusl_stat) {
            effect_size += ((buff_info.max_power - buff_info.min_power) / jusl_stat * status + buff_info.min_power) * jewel_lv * 0.02;
        } else {
            effect_size += buff_info.max_power * jewel_lv * 0.02;
        }
    }
    return effect_size;
}

// 連撃効果量
function getFunnelEffectSize(buff_id, member_info) {
    let buff_info = getBuffIdToBuff(buff_id)
    let funnel_power = buff_info.effect_size;
    let effect_size;
    let min_power = buff_info.min_power;
    let max_power = buff_info.max_power;
    if (min_power == max_power) {
        effect_size = funnel_power * min_power;
    } else {
        let status1 = member_info[status_kbn[buff_info.ref_status_1]];
        if (buff_info.param_limit > status1) {
            effect_size = funnel_power * min_power;
        } else {
            effect_size = funnel_power * max_power;
        }
    }

    return effect_size;
}

// 敵防御力取得
function getEnemyDefenceRate(grade_sum) {
    let defence_rate = 0;
    if (grade_sum.defense_rate) {
        defence_rate = grade_sum.defense_rate / 100;
    }
    let count = 1;
    if (grade_sum.effect_count !== undefined) {
        count = grade_sum.effect_count;
    }
    if ($("#skull_feather_1st_defense").is(':visible')) {
        defence_rate = 5 / 100;
        count = Number($("#skull_feather_1st_defense").val())
    }
    let enemy_defence_rate = (1 - defence_rate) ** count;
    return enemy_defence_rate;
}

// ステータスアップ取得
function getStatUp(member_info) {
    let tears_of_dreams = 0;
    // 夢の泪
    if ($("#enemy_class").val() == ENEMY_CLASS_HARD_LAYER) {
        tears_of_dreams = Number($("#tears_of_dreams").val());
    }
    // メンバー全能力アップ
    let all_status_up = 0;
    if ($("#enemy_class").val() == ENEMY_CLASS_CONTROL_BATTLE) {
        all_status_up = Number($("#all_status_up").val());
    }
    // スコアタボーナス
    let score_bonus = 0;
    if ($("#enemy_class").val() == ENEMY_CLASS_SCORE_ATTACK) {
        score_bonus = getScoreAttackBonus("STAT_UP", member_info);
    }
    // パッシブ(能力固定上昇)
    let passive_status_up = getSumAbilityEffectSize(25, member_info.is_select, member_info.style_info.chara_id);
    return tears_of_dreams + all_status_up + score_bonus + passive_status_up;
}

// スコアタボーナス取得
function getScoreAttackBonus(kind, member_info) {
    let element = member_info.style_info.element;
    let element2 = member_info.style_info.element2;
    let physical = getCharaData(member_info.style_info.chara_id).physical;
    let enemy_info = getEnemyInfo();
    let effect_max = 0;
    bonus_list.filter((obj) => obj.score_attack_no == enemy_info.sub_no && obj.effect_kind == kind).forEach((obj) => {
        let conditions = obj.conditions.split("_");
        switch (conditions[0]) {
            case "element":
                if (conditions[1] == element || conditions[1] == element2) {
                    if (effect_max < obj.effect_size) {
                        effect_max = obj.effect_size;
                    }
                }
                break;
            case "physical":
                if (conditions[1] == physical) {
                    if (effect_max < obj.effect_size) {
                        effect_max = obj.effect_size;
                    }
                }
                break;
        }
    })
    return effect_max;
}

// DPゲージ設定
function setDpGarge(i, val) {
    $("#dp_range_" + i).val(val);
    $("#dp_rate_" + i).val(val + '%');
    applyGradient($("#dp_range_" + i), "#4F7C8B", val);
}
// HPゲージ設定
function setHpGarge(val) {
    $("#hp_range").val(val);
    $("#hp_rate").val(val + '%');
    applyGradient($("#hp_range"), "#7C4378", val);
}
// カンマ削除
function removeComma(value) {
    var regex = /[^0-9]/g;
    var newValue = "0" + value.replace(regex, '');
    return Number(newValue).toString()
}
// グラデーションを設定するメソッド
function applyGradient($element, baseColor, percent) {
    // generateGradientメソッドを呼び出してグラデーションカラーコードを取得
    let gradientColor = generateGradient(baseColor, "#FFFFFF", percent);
    // グラデーションのスタイルを組み立てる
    let gradientStyle = "linear-gradient(to right, " + baseColor + " 0%, " + gradientColor + " " + percent + "%, #FFFFFF " + percent + "%)";
    // 対象の要素にスタイルを設定
    $element.css("background", gradientStyle);
}
// グラデーション生成メソッド
function generateGradient(color1, color2, percent) {
    // パーセントの範囲を0～100に制限
    percent = Math.min(100, Math.max(0, percent));
    // カラーコードを16進数から10進数に変換
    function hexToRgb(hex) {
        return parseInt(hex, 16);
    }
    // カラーコードの10進数表現
    let r1 = hexToRgb(color1.substring(1, 3));
    let g1 = hexToRgb(color1.substring(3, 5));
    let b1 = hexToRgb(color1.substring(5, 7));
    let r2 = hexToRgb(color2.substring(1, 3));
    let g2 = hexToRgb(color2.substring(3, 5));
    let b2 = hexToRgb(color2.substring(5, 7));
    // パーセント位置で補間
    let r = Math.round(r1 + (r2 - r1) * (percent / 100));
    let g = Math.round(g1 + (g2 - g1) * (percent / 100));
    let b = Math.round(b1 + (b2 - b1) * (percent / 100));
    // 10進数から16進数に変換
    function rgbToHex(value) {
        let hex = value.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
    let resultColor = "#" + rgbToHex(r) + rgbToHex(g) + rgbToHex(b);
    return resultColor;
}

// ダメージ詳細用グラデーション
function generateGradientFromRange(range, colorCode) {
    // 最小値と最大値を取得する
    const [minPercentage, maxPercentage] = parseRange(range);

    // RGBA形式の色コードを生成する
    const rgba1 = convertToRGBA(colorCode, 1);
    const rgba2 = convertToRGBA(colorCode, 0.5);

    // グラデーションスタイルを生成する
    const gradientStyle = `linear-gradient(to right, ${rgba1} 0%, ${rgba1} ${minPercentage}%, ${rgba2} ${minPercentage}%, ${rgba2} ${maxPercentage}%, rgba(255, 255, 255, 1) ${maxPercentage}%, rgba(255, 255, 255, 1) 100%)`;

    return gradientStyle;
}
function parseRange(range) {
    // 「～」を含まない場合、最小値と最大値が同じとみなしてその値を返す
    if (!range.includes('～')) {
        range += '～' + range;
    }

    // rangeを'～'で分割して最小値と最大値を取得し、数値に変換する
    const rangeValues = range.split('～').map(parseFloat);
    // 最小値と最大値が0未満の場合は0に設定
    const minPercentage = Math.max(0, rangeValues[0]);
    const maxPercentage = Math.max(0, rangeValues[1]);

    return [minPercentage, maxPercentage];
}
function convertToRGBA(colorCode, opacity) {
    // カラーコードからRGB値を抽出する
    const color = colorCode.substring(1); // #を取り除く
    const red = parseInt(color.substring(0, 2), 16); // R値
    const green = parseInt(color.substring(2, 4), 16); // G値
    const blue = parseInt(color.substring(4, 6), 16); // B値

    // RGBA形式の色コードを生成して返す
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}