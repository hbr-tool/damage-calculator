// 貫通クリティカル
let penetration_attack_list = [135, 137];

function setEventTrigger() {
    // リセットボタン
    $("#style_reset_btn").on("click", function (event) {
        styleReset(true);
    });
    // 敵リストイベント
    $("#enemy_class").on("change", function (event) {
        let enemy_class = $(this).val();
        localStorage.setItem("enemy_class", enemy_class);
        localStorage.setItem("enemy_list", "1");
        createEnemyList(enemy_class);
    });
    $("#enemy_list").on("change", function (event) {
        localStorage.setItem("enemy_list", $(this).val());
        setEnemyStatus();
    });
    // 攻撃スキル変更
    $("#attack_list").on("change", function (event) {
        let attack_info = getAttackInfo();
        if (select_attack_skill !== undefined) {
            $("." + type_physical[select_attack_skill.attack_physical]).removeClass("selected");
            $("." + type_element[select_attack_skill.attack_element]).removeClass("selected");

            if (attack_info === undefined || select_attack_skill.chara_id !== attack_info.chara_id) {
                toggleItemVisibility(`.only_chara_id-${select_attack_skill.chara_id}`, false);
            }
            if (attack_info === undefined || select_attack_skill.attack_id !== attack_info.attack_id) {
                toggleItemVisibility(`.skill_attack-${select_attack_skill.attack_id}`, false);
            }
            if (select_attack_skill.attack_element !== 0 && (attack_info === undefined || select_attack_skill.attack_element !== attack_info.attack_element)) {
                toggleItemVisibility(`.buff_element-${select_attack_skill.attack_element}`, false);
                toggleItemVisibility(`.row_element-${select_attack_skill.attack_element}`, false);
            }
            if (attack_info === undefined || select_attack_skill.attack_physical !== attack_info.attack_physical) {
                toggleItemVisibility(`.buff_physical-${select_attack_skill.attack_physical}`, false);
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
        let chara_no = $(this).find("option:selected").data("chara_no");
        let member_info = select_style_list[chara_no];
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

        // 該当ステータスに着色
        for (let i = 1; i <= 3; i++) {
            $("#" + status_kbn[attack_info["ref_status_" + i]] + "_" + chara_no).addClass("status_attack_skill");
        }
        $("input[type=checkbox].ability").each(function (index, value) {
            let ability_id = $(value).data("ability_id");
            let chara_no = $(value).data("chara_no");
            let ability_info = getAbilityInfo(ability_id);
            let limit_border = Number($(value).data("limit_border"));
            let member_info = chara_no < 10 ? select_style_list[chara_no] : sub_style_list[chara_no - 10];
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
        displayWeakRow();

        $(".redisplay").each(function (index, value) {
            sortEffectSize($(value));
            select2ndSkill($(value));
        });

        // 敵情報再設定
        updateEnemyResist();
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
        $(".include_lv").prop("selectedIndex", 0);
        $(".element_field").prop("selectedIndex", 0);
        $(".include_lv").trigger("change");
        updateEnemyResist();
    });
    // バフスキル変更
    $(".include_lv").on("change", function (event) {
        let selected_index = $(this).prop("selectedIndex");
        let id = $(this).prop("id");
        $(".status_" + id).removeClass("status_" + id);
        if (selected_index === 0) {
            resetSkillLv(id);
        } else {
            let option = $(this).find("option").eq(selected_index);
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
            if (isSameBuff($(option))) {
                if (!confirm(option.text() + "は\r\n同一スキルが既に設定されています。設定してよろしいですか？")) {
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
        updateEnemyResist();
    });
    $(".enemy_type_value").on("change", function (event) {
        displayWeakRow();
    });
    // チャージ変更
    $("#charge").on("change", function (event) {
        let selected_index = $(this).prop("selectedIndex");
        let id = $(this).prop("id");
        $(".status_" + id).removeClass("status_" + id);
        if (selected_index !== 0) {
            let option = $(this).find("option").eq(selected_index);
            setStatusToBuff(option, id);
        }
    });
    // スキルレベル変更
    $(".lv_effect").on("change", function (event) {
        let buff_type_id = $(this).attr("id").replace("_lv", "");
        let option = $("#" + buff_type_id + " option:selected");
        let chara_no = Number(option.data("chara_no"));
        let chara_id = chara_no < 10 ? select_style_list[chara_no].style_info.chara_id : sub_style_list[chara_no - 10].style_info.chara_id;
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
    // 限界突破変更
    $(".limit").on("change", function (event) {
        let limit_count = Number($(this).val());
        let chara_no = $(this).attr("id").replace("limit_", "");
        if (select_style_list[chara_no] === undefined) {
            return;
        }
        select_style_list[chara_no].limit_count = limit_count;
        let chara_id_class = "chara_id-" + select_style_list[chara_no].style_info.chara_id;
        // アビリティのチェックボックスを更新
        $("input[type=checkbox]." + chara_id_class).each(function (index, value) {
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
    });
    // 宝珠レベル変更
    $(".jewel").on("change", function (event) {
        let chara_no = $(this).attr("id").replace(/[^0-9]/g, '');
        if (select_style_list[chara_no] === undefined) {
            return;
        }
        select_style_list[chara_no].jewel_lv = Number($(this).val());
        let chara_id_class = "chara_id-" + select_style_list[chara_no].style_info.chara_id;
        // バフ効果量を更新
        $(".variable_effect_size." + chara_id_class).each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // ステータス変更
    $(".status").on("change", function (event) {
        let chara_no = $(this).attr("id").replace(/[^0-9]/g, '');
        if (select_style_list[chara_no] === undefined) {
            return;
        }
        let status_kbn = $(this).prop("id").split("_")[0];
        select_style_list[chara_no][status_kbn] = Number($(this).val());
        let chara_id_class = "chara_id-" + select_style_list[chara_no].style_info.chara_id;
        if ($(this).hasClass("effect_size")) {
            // バフ効果量を更新
            $(".variable_effect_size." + chara_id_class).each(function (index, value) {
                updateBuffEffectSize($(value));
            });
        }
    });
    // 士気/夢の泪レベル変更
    $("#morale_count, #tears_of_dreams").on("change", function (event) {
        // バフ効果量を更新
        $(".variable_effect_size").each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // バフ/デバフ強化変更
    $(".strengthen").on("change", function (event) {
        // バフ効果量を更新
        $(this).parent().parent().find(".variable_effect_size").each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // バフ/デバフ強化アビリティ変更
    $(document).on("change", ".strengthen_ability", function (event) {
        let chara_id_class = $(this).parent().attr('class').split(' ').find(className => className.startsWith('chara_id-'));
        // バフ効果量を更新
        $(".variable_effect_size." + chara_id_class).each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // 前衛が3人以上の場合
    $(document).on("change", "#ability_front input", function (event) {
        let chara_id_class = "chara_id-" + select_attack_skill.chara_id;
        if ($("#ability_front input:checked:not(." + chara_id_class + ")").length > 2) {
            alert("前衛は攻撃キャラクターを除いた2人まで設定できます。");
            $(this).prop("checked", false);
            return;
        }
    });
    // 後衛が3人以上の場合
    $(document).on("change", "#ability_back input", function (event) {
        if ($("#ability_back input:checked").length > 2) {
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
    // スコアアタック敵強さ変更
    $("#score_lv").on("change", function (event) {
        updateEnemyScoreAttack();
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
    // スコアアタックチェック変更
    $(document).on("change", "input.half_check", function (event) {
        updateGrade();
    });
    // スコアタタブ変更
    $("input[name=rule_tab]").on("change", function (event) {
        updateGrade();
    });
    // ステータス保存
    $(".save").on("change", function (event) {
        if (navigator.cookieEnabled) {
            let id_split = $(this).prop("id").split("_");
            if (id_split.length > 1) {
                let chara_no = Number(id_split[1]);
                if (select_style_list[chara_no] === undefined) {
                    return
                }
                let member_info = select_style_list[chara_no];
                let style_id = member_info.style_info.style_id;
                // 新設定
                let save_item = [member_info.style_info.rarity,
                member_info.str, member_info.dex,
                member_info.con, member_info.mnd,
                member_info.int, member_info.luk,
                member_info.limit_count, member_info.jewel_lv].join(",");
                localStorage.setItem("style_" + style_id, save_item);
            }
        }
    });
    // 部隊変更ボタンクリック
    $(".troops_btn").on("click", function (event) {
        if ($(this).hasClass("selected_troops")) {
            return;
        }
        // サブ部隊初期化
        $("#sub_troops").val(-1);
        loadSubTroopsList(-1);

        $(".selected_troops").removeClass("selected_troops");
        $(this).addClass("selected_troops");
        styleReset(false);
        select_troops = $(this).val();
        localStorage.setItem('select_troops', select_troops);
        loadTroopsList(select_troops);
    });
    // サブパーティ変更
    $("#sub_troops").on("change", function (event) {
        loadSubTroopsList($(this).val());
    });
    // カンマ区切り
    $(".comma").on('blur change input', function (event) {
        let newValue = removeComma($(this).val())
        // カンマ区切りに編集した値を取得する
        let formattedValue = newValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        // フォームの値を置き換える
        $(this).val(formattedValue);
    });
    // 敵保存ボタンクリック
    $("#enemy_save").on("click", function (event) {
        let enemy_class_no = Number($("#enemy_list option:selected").val());
        let enemy_name = window.prompt("敵名称を入力してください", "敵" + enemy_class_no);
        if (enemy_name === null) {
            return;
        }
        let enemy_info = {};
        enemy_info.enemy_name = enemy_name
        enemy_info.enemy_stat = $("#enemy_stat").val();
        enemy_info.max_dp = removeComma($("#enemy_dp_0").val()) + "," + removeComma($("#enemy_dp_1").val()) + "," + removeComma($("#enemy_dp_2").val()) + "," + removeComma($("#enemy_dp_3").val());
        enemy_info.max_hp = removeComma($("#enemy_hp").val());
        let enemy_info_status_list = ["destruction_limit", "destruction",
            "physical_1", "physical_2", "physical_3", "element_0", "element_1", "element_2", "element_3", "element_4", "element_5",
        ];
        enemy_info_status_list.forEach(value => {
            enemy_info[value] = $("#enemy_" + value).val();
        });
        $("#enemy_list option:selected").text(enemy_name);
        updateEnemyStatus(enemy_class_no, enemy_info);
        localStorage.setItem("free_enemy_" + enemy_class_no, JSON.stringify(enemy_info));
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

    // 闘志
    let fightingspirit = $("#fightingspirit").prop("checked") ? -20 : 0;
    // 厄
    let misfortune = $("#misfortune").prop("checked") ? -20 : 0;
    // 士気
    let morale = Number($("#morale_count").val()) * -5;
    // 夢の泪
    let tears_of_dreams = 0;
    if ($("#enemy_class").val() == 1) {
        tears_of_dreams = Number($("#tears_of_dreams").val()) * tears_of_dreams_list[Number($("#enemy_list").val())];
    }
    // メンバー
    let chara_no = $("#attack_list option:selected").data("chara_no");
    let member_info = select_style_list[chara_no];
    // 闘志or士気
    let stat_up = (morale < fightingspirit ? morale : fightingspirit) - tears_of_dreams;

    let basePower = getBasePower(member_info, stat_up + misfortune);
    let buff = getSumBuffEffectSize();
    let mindeye = isWeak() ? getSumEffectSize("mindeye") / 100 + 1 : 1;
    let debuff = getSumDebuffEffectSize();
    let fragile = isWeak() ? getSumEffectSize("fragile") / 100 + 1 : 1;
    let token = getSumTokenEffectSize();
    let element_field = getSumEffectSize("element_field") / 100 + 1;
    let weak_physical = $("#enemy_physical_" + attack_info.attack_physical).val() / 100;
    let weak_element = $("#enemy_element_" + attack_info.attack_element).val() / 100;
    let enemy_defence_rate = 1 - grade_sum.defense_rate / 100;
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
    // 花舞う、可憐のフレア
    if (attack_info.attack_id == 136) {
        let dp_rate = Number($("#skill_unique_dp_rate").val());
        dp_rate = dp_rate > 100 ? 100 : dp_rate;
        skill_unique_rate += (100 - dp_rate) / 100 * 75 / 100;
    }
    // コーシュカ・アルマータ
    if (attack_info.attack_id == 2162) {
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

    let critical_power = getBasePower(member_info, stat_up - 50);
    let critical_rate = getCriticalRate(member_info);
    let critical_buff = getCriticalBuff();
    // 貫通クリティカル
    if (penetration_attack_list.includes(attack_info.attack_id)) {
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
    if ($("#enemy_class").val() == 6) {
        calcScore(critical_detail, grade_sum.grade_rate);
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

// 消費SP計算
function getSpCost() {
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
                    addSkillCount(sp_list, attack.attack_name, $(value).parent().attr("id"), attack.sp_cost)
                    break;
                default:
                    // 非表示項目を除く
                    if ($(value).parent().parent().css('display') == 'none') {
                        break;
                    }
                    let buff_id = Number($(value).val());
                    if (buff_id !== undefined && buff_id !== 0) {
                        let buff = getBuffIdToBuff(buff_id)
                        addSkillCount(sp_list, buff.buff_name, $(value).parent().attr("id"), buff.sp_cost)
                    }
                    break;
            }
        });
        // nameとsp_cost以外の最高値×sp_cost
        $.each(sp_list, function (index, value) {
            let single_sp_cost = 0;
            let max_count = 0;
            $.each(value, function (key, data) {
                if (key == "name") {
                    return true;
                } else if (key == "sp_cost") {
                    single_sp_cost = Number(data);
                    return true;
                }
                if (max_count < Number(data)) {
                    max_count = Number(data);
                }
            });
            sp_cost += single_sp_cost * max_count;
        });
        $("#sp_cost_" + i).text(sp_cost);
    }
}

// スキル使用回数取得
function addSkillCount(sp_list, name, id, sp_cost) {
    name = renameSkill(name);
    const array = sp_list.filter((obj) => renameSkill(obj.name) === name);

    let single = {};
    if (array.length) {
        single = array[0];
    } else {
        single.name = name;
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

// スキル名の特定文字列削除
function renameSkill(skill_name) {
    let str_replace = ["(初回)", "(弱点)", '(破壊率200%以上)', '(オーバードライブ)', '(チャージ)', '(追加ターン)', '(挑発)', "(火)", "(闇)", "(31A3人以上)", "(31C3人以上)"];
    str_replace.forEach(value => {
        skill_name = skill_name.replace(value, "");
    });
    return skill_name;
}

// バフ効果量更新
function updateBuffEffectSize(option, skill_lv) {
    let buff_id = Number(option.val());
    skill_lv = skill_lv || Number(option.data("select_lv"));
    let chara_no = Number(option.data("chara_no"));
    let skill_buff = getBuffIdToBuff(buff_id);
    let member_info = chara_no < 10 ? select_style_list[chara_no] : sub_style_list[chara_no - 10];
    let effect_size = getEffectSize(skill_buff.buff_kind, buff_id, member_info, skill_lv);
    let chara_id = member_info.style_info.chara_id;
    let chara_name = getCharaData(chara_id).chara_short_name;
    let ability_streng = getStrengthen(member_info, skill_buff);
    // バフ強化1.2倍
    let strengthen = option.parent().parent().parent().find("input").prop("checked") ? 20 : 0;
    let text_effect_size = effect_size * (1 + (ability_streng + strengthen) / 100);
    effect_size = effect_size * (1 + ability_streng / 100);
    let effect_text = `${chara_name}: ${skill_buff.buff_name} ${Math.floor(text_effect_size * 100) / 100}%`;
    option.text(effect_text).data("effect_size", effect_size).data("select_lv", skill_lv).data("text_effect_size", text_effect_size);;
    // 耐性が変更された場合
    if (skill_buff.buff_kind == 20) {
        updateEnemyResist();
    }
}

// バフ強化効果量取得
function getStrengthen(member_info, skill_buff) {
    let strengthen = 0;
    // 攻撃力アップ/属性攻撃力アップ
    let attack_up = [0, 1];
    if (attack_up.includes(skill_buff.buff_kind)) {
        let ability_id3 = member_info.style_info.ability3;
        let ability_id0 = member_info.style_info.ability0;
        // 機転
        if (ability_id3 == 501 && member_info.limit_count >= 3) {
            strengthen += 25;
        }
        // 増幅
        if (ability_id0 == 503) {
            strengthen += 10;
        }
        // エクシード(菅原専用)
        if (ability_id3 == 505 && $("#ability_all462").prop("checked")) {
            strengthen += 30;
        }
    }
    // 防御力ダウン/属性防御力ダウン/DP防御力ダウン/永続防御ダウン/永続属性防御ダウン
    let defense_down = [3, 4, 19, 20, 21, 22];
    if (defense_down.includes(skill_buff.buff_kind)) {
        // 侵食
        let ability_id3 = member_info.style_info.ability3;
        if (ability_id3 == 502 && member_info.limit_count >= 3) {
            strengthen += 25;
        }
        // 減退
        let ability_id0 = member_info.style_info.ability0;
        if (ability_id0 == 504) {
            strengthen += 10;
        }
        // モロイウオ(あいな専用)
        if (ability_id3 == 506 && $("#ability_all242").prop("checked") && skill_buff.sp_cost <= 8) {
            strengthen += 30;
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
    setEnemyElement("#enemy_physical_" + physical, Math.floor(element_physical));
    let element = select_attack_skill.attack_element;
    let element_element = enemy_info["element_" + element];
    $("#enemy_element_" + element).val(Math.floor(element_element));
    setEnemyElement("#enemy_element_" + element, Math.floor(element_element));
}

// 敵耐性変更
function updateEnemyResist() {
    let attack_info = getAttackInfo();
    let enemy_info = getEnemyInfo();
    if (attack_info === undefined || enemy_info === undefined) {
        return false
    }
    let element = attack_info.attack_element;
    let grade_sum = getGradeSum();
    let resist_down = getSumEffectSize("resist_down");
    let element_resist = Number(enemy_info["element_" + element]) - grade_sum["element_" + element];
    // 耐性打ち消し
    if (resist_down > 0) {
        if (element_resist <= 100) {
            element_resist = 100 + resist_down;
        } else {
            element_resist += resist_down;
        }
    }
    // 表示変更
    $("#enemy_element_" + element).val(Math.floor(element_resist));
    setEnemyElement("#enemy_element_" + element, Math.floor(element_resist));
    // 貫通クリティカル
    if (penetration_attack_list.includes(attack_info.attack_id)) {
        $("#enemy_element_0").val(100);
        setEnemyElement("#enemy_element_0", 100);
        $("#enemy_physical_2").val(400);
        setEnemyElement("#enemy_physical_2", 400);
    }
    displayWeakRow();
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
            .data("chara_no", member_info.chara_no)
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

// バフリストに追加
function addBuffList(member_info) {
    let chara_id = member_info.style_info.chara_id;
    let buff_list = skill_buff.filter(obj =>
        (obj.chara_id === chara_id || obj.chara_id === 0) &&
        (obj.style_id === member_info.style_info.style_id || obj.style_id === 0)
    );

    buff_list.forEach(value => {
        let buff_element = 0;
        let only_one = "";

        switch (value.buff_kind) {
            case 11: // 属性フィールド
                addElementField(member_info, value.buff_name, value.min_power, value.buff_element, value.buff_id, false);
                return;
            case 0: // 攻撃アップ
            case 12: // 破壊率アップ
                only_one = "only_one";
                break;
            case 1: // 属性攻撃アップ
                only_one = "only_one";
            case 4: // 属性防御ダウン
            case 20: // 耐性ダウン
            case 22: // 永続属性防御ダウン
                buff_element = value.buff_element;
                break;
            case 8: // 属性クリティカル率アップ
            case 9: // 属性クリティカルダメージアップ
                buff_element = value.buff_element;
            case 2: // 心眼
            case 6: // クリ率
            case 7: // クリダメ
            case 16: // 連撃(小)
            case 17: // 連撃(大)
                only_one = "only_one";
                break;
            case 3: // 防御ダウン
            case 4: // 属性防御ダウン
            case 5: // 脆弱
            case 10: // チャージ
            case 19: // DP防御ダウン
            case 20: // 耐性ダウン
            case 21: // 永続防御ダウン
            case 22: // 永続属性防御ダウン
                break;
            default:
                // 上記以外は適応外
                return;
        }
        // サブメンバーは一部のみ許可
        switch (value.buff_kind) {
            case 3: // 防御ダウン
            case 4: // 属性防御ダウン
            case 5: // 脆弱
            case 11: // 属性フィールド
            case 19: // DP防御ダウン
            case 20: // 耐性ダウン
            case 21: // 永続防御ダウン
            case 22: // 永続属性防御ダウン
                break;
            default:
                if (!member_info.is_select) return;
                break;
        }
        let str_buff = buff_kbn[value.buff_kind];
        if (value.skill_attack === 0) only_one = 0;
        if (value.only_first === 1) only_one = "only_first";
        let only_chara_id = value.range_area == 7 ? `only_chara_id-${chara_id}` : "public";
        let only_other_id = value.range_area === 8 ? `only_other_chara_id-${chara_id}` : "";

        var option = $('<option>')
            .val(value.buff_id)
            .data("select_lv", value.max_lv)
            .data("max_lv", value.max_lv)
            .data("chara_no", member_info.chara_no)
            .data("skill_id", value.skill_id)
            .css("display", "none")
            .addClass("buff_element-" + buff_element)
            .addClass("buff_physical-" + "0")
            .addClass("buff_id-" + value.buff_id)
            .addClass("skill_id-" + value.skill_id)
            .addClass("variable_effect_size")
            .addClass("skill_attack-" + value.skill_attack)
            .addClass(only_chara_id)
            .addClass(only_other_id)
            .addClass(only_one)
            .addClass("chara_id-" + chara_id);

        $("." + str_buff).append(option);
        $("." + str_buff + " .buff_id-" + value.buff_id + ".chara_id-" + chara_id).each(function (index, value) {
            updateBuffEffectSize($(value));
        });
    });
}

// フィールド追加
function addElementField(member_info, field_name, effect_size, field_element, buff_id, limit_border) {
    let chara_id = member_info.style_info.chara_id;
    let chara_name = getCharaData(chara_id).chara_short_name;
    let option_text = `${chara_name}: ${field_name} ${effect_size}%`;
    let option = $('<option>')
        .text(option_text)
        .data("effect_size", effect_size)
        .data("limit_border", limit_border)
        .val(buff_id)
        .css("display", "none")
        .addClass("public")
        .addClass(`buff_element-${field_element}`)
        .addClass(`chara_id-${chara_id}`);
    $("#element_field").append(option);
}

// アビリティ追加
function addAbility(member_info) {
    let chara_id = member_info.style_info.chara_id;
    let ability_list = [member_info.style_info.ability0, member_info.style_info.ability1, member_info.style_info.ability3, member_info.style_info.ability5, member_info.style_info.ability10];
    let is_select = member_info.is_select;

    for (let index = 0; index < ability_list.length; index++) {
        ability_id = ability_list[index];
        if (ability_id == null || ability_id > 1000) {
            // 1000番以降は不要
            continue;
        }
        let ability_info = getAbilityInfo(ability_id);
        if (!is_select && ability_info.ability_target != 6) {
            // 他部隊のアビリティはフィールドのみ許可
            continue;
        }
        let limit_border = index == 0 ? 0 : (index === 1 ? 1 : (index === 2 ? 3 : (index === 3 ? 5 : 10)));
        let display = "none";

        if ((ability_info.ability_element === 0 && ability_info.ability_physical == 0)
            || (select_attack_skill && (select_attack_skill.attack_element === ability_info.ability_element || (select_attack_skill.attack_physical === ability_info.ability_physical)))) {
            display = "block";
        }
        let target;
        let element_type;
        let physical_type;
        let append = undefined;
        let effect_size = ability_info.effect_size;

        switch (ability_info.ability_target) {
            case 6: // フィールド
                addElementField(member_info, ability_info.ability_name, ability_info.effect_size, ability_info.ability_element, 0, true);
                continue;
            case 1: // 自分
                if (select_attack_skill && select_attack_skill.chara_id !== chara_id) {
                    display = "none"
                }
                target = "ability_self";
                element_type = "self_element"
                physical_type = "self_physical"
                // 狂乱の型/五月雨
                if (ability_info.ability_id == 6 || ability_info.ability_id == 7) {
                    // 追加
                    var option1 = $('<option>').text("×1").val(1);
                    var option2 = $('<option>').text("×2").val(2);
                    append = $('<select>').append(option1).append(option2).addClass("ability_select");
                }
                break;
            case 2: // 前衛
            case 3: // 後衛
            case 5:	// 敵
            case 4:	// 全体
            case 0: // その他
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
        let name = getCharaData(chara_id).chara_short_name;
        let fg_update = false;
        let id = target + chara_id + index;
        let chara_id_class = "chara_id-" + chara_id;
        let input = $('<input>').attr("type", "checkbox").attr("id", id)
            .data("effect_size", effect_size)
            .data("limit_border", limit_border)
            .data("ability_id", ability_id)
            .data("chara_no", member_info.chara_no)
            .addClass("ability_element-" + ability_info.ability_element)
            .addClass("ability")
            .addClass(chara_id_class);
        // スキル強化可変アビリティ
        if (ability_id == 505 || ability_id == 506) {
            input.addClass("strengthen_ability");
            fg_update = true;
        }
        let label = $('<label>')
            .attr("for", id)
            .text(`${name}: ${ability_info.ability_name} (${ability_info.ability_short_explan})`)
            .addClass("checkbox01");
        let div = $('<div>').append(input).append(label)
            .addClass(element_type + "-" + ability_info.ability_element)
            .addClass(physical_type + "-" + ability_info.ability_physical)
            .addClass(target)
            .addClass(chara_id_class)
            .css("display", display);
        $("#" + target).append(div);
        if (append !== undefined) {
            $(div).append(append);
        }
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
    switch (ability_info.ability_target) {
        case 1:	// 自分
            disabled = limit_count < limit_border || ($(input).hasClass(chara_id) && disabled);
            checked = limit_count >= limit_border && $(input).hasClass(chara_id);
            break
        case 2:	// 前衛
        case 3:	// 後衛
            // 前衛または後衛かつ、本人以外
            if ((ability_info.activation_place == 1 || ability_info.activation_place == 2) && !$(input).hasClass(chara_id) || !disabled) {
                disabled = false;
            } else {
                disabled = true;
            }
            checked = limit_count >= limit_border && $(input).hasClass(chara_id);
            break
        case 4:	// 全体
        case 5:	// 敵
        case 0:	// その他
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
    $(input).prop("checked", checked).attr("disabled", disabled);
}

// 効果量取得
function getEffectSize(buff_kind, buff_id, member_info, skill_lv) {
    let effect_size = 0;
    switch (buff_kind) {
        case 0: // 攻撃力アップ
        case 1: // 属性攻撃力アップ
        case 2: // 心眼
        case 7:	// クリティカルダメージアップ
        case 9:	// 属性クリティカルダメージアップ
        case 10: // チャージ
        case 12: // 破壊率アップ
            effect_size = getBuffEffectSize(buff_id, member_info, skill_lv, "3");
            break;
        case 6:	// クリティカル率アップ
        case 8:	// 属性クリティカル率アップ
            effect_size = getBuffEffectSize(buff_id, member_info, skill_lv, "5");
            break;
        case 3: // 防御力ダウン
        case 4: // 属性防御力ダウン
        case 5: // 脆弱
        case 19: // DP防御力ダウン
        case 20: // 耐性ダウン
        case 21: // 永続防御ダウン
        case 22: // 永続属性防御ダウン
            effect_size = getDebuffEffectSize(buff_id, member_info, skill_lv);
            break;
        case 16: // 連撃(小)
        case 17: // 連撃(大)
            effect_size = getFunnelEffectSize(buff_id, member_info, skill_lv);
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
            resetSkillLv(id);
            $(".status_" + id).removeClass("status_" + id);
        }
        return;
    }
    select.prop("selectedIndex", 0);
    $(".status_" + id).removeClass("status_" + id);
    for (let i = 1; i < select.find("option").length; i++) {
        let option = select.find("option")[i];
        if ($(option).css("display") !== "none") {
            let buff_id = Number($(option).val());
            if (buff_id == 1000 || buff_id == 1300 || buff_id == 1600 || buff_id == 1700) {
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
            if (isSameBuff($(option))) {
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

            for (var i = 0; i < class_list.length; i++) {
                var class_name = class_list[i];
                if (class_name.startsWith("skill_attack-")) {
                    var partial_class = class_name.replace("skill_attack-", "");
                    if (Number(partial_class) != 0 && Number(partial_class) != 999 && attack_id != Number(partial_class)) {
                        return true;
                    }
                }
            }
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

// 複数設定出来ないバフで扱いは同一のもの
function isSameBuff(option) {
    let convert_skill_id = { "4": "133", "133": "4" };
    if (option.hasClass("only_first")) {
        let class_name = option.parent().attr("id").replace(/[0-9]/g, '');
        let buff_id = "buff_id-" + convert_skill_id[option.val()];
        if ($("." + class_name + " option." + buff_id + ":selected").length > 0) {
            return true;
        }
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
        let chara_no = $(option).data("chara_no");
        $("#" + status_kbn[buff.ref_status_1] + "_" + chara_no).addClass("status_" + id);
        $("#" + status_kbn[buff.ref_status_2] + "_" + chara_no).addClass("status_" + id);
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
        if ($(value).val() == 0) {
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
function getSumBuffEffectSize() {
    // スキルバフ合計
    let sum_buff = getSumEffectSize("buff");
    // 攻撃力アップアビリティ
    sum_buff += getSumAbilityEffectSize(1);
    // 属性リング(0%-10%)
    if (select_attack_skill.attack_element != 0) {
        sum_buff += Number($("#elememt_ring option:selected").val());
    }
    // オーバードライブ10%
    if ($("#overdrive").prop("checked")) {
        sum_buff += 10;
    }
    // トークン
    let token_count = Number($("#token_count").val());
    sum_buff += token_count * getSumAbilityEffectSize(31);
    // 士気
    sum_buff += Number($("#morale_count").val()) * 5;
    // 永遠なる誓い
    sum_buff += $("#eternal_vows").prop("checked") ? 50 : 0;
    return 1 + sum_buff / 100;
}

// 合計デバフ効果量取得
function getSumDebuffEffectSize() {
    // スキルデバフ合計
    let sum_debuff = getSumEffectSize("debuff");
    sum_debuff += getSumAbilityEffectSize(2);
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
        let effect_size = Number($(selected).data("effect_size"));
        let loop = 0;
        let size = 0
        if (effect_size == 50) {
            loop = 5;
            size = 10;
        } else if (effect_size == 30) {
            loop = 3;
            size = 10;
        } else if (effect_size == 10) {
            loop = 1;
            size = 10;
        } else if (effect_size == 100) {
            loop = 10;
            size = 10;
        } else if (effect_size == 120) {
            loop = 3;
            size = 40;
        } else if (effect_size == 80) {
            loop = 2;
            size = 40;
        }
        for (let i = 0; i < loop; i++) {
            funnel_list.push(size);
        }
    });
    let effect_size = getSumAbilityEffectSize(6);
    let loop = 0;
    if (effect_size == 10) {
        loop = 5;
        size = 10;
    } else if (effect_size == 20) {
        loop = 10;
        size = 10;
    } else if (effect_size == 40) {
        loop = 3;
        size = 40;
    } else if (effect_size == 80) {
        loop = 6;
        size = 40;
    }
    for (let i = 0; i < loop; i++) {
        funnel_list.push(size);
    }
    // 降順でソート
    funnel_list.sort(function (a, b) {
        return b - a;
    });
    return funnel_list;
}

// トークン効果量
function getSumTokenEffectSize(buff_id, chara_no, skill_lv) {
    // トークン
    let token_count = Number($("#token_count").val());
    if (select_attack_skill.token_power_up == 1) {
        return 1 + token_count * 16 / 100;
    }
    return 1;
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
    critical_rate += $("#eternal_vows").prop("checked") ? 15 : 0;
    return critical_rate > 100 ? 100 : critical_rate;
}

// クリティカルバフ取得
function getCriticalBuff() {
    let critical_buff = 50;
    critical_buff += getSumEffectSize("critical_buff");
    critical_buff += getSumAbilityEffectSize(4);
    // 星空の航路+
    critical_buff += $("option.skill_id-490:selected").length * 30;
    return 1 + critical_buff / 100;
}

// アビリティ効果量合計取得
function getSumAbilityEffectSize(effect_type) {
    let ability_effect_size = 0;
    $("input[type=checkbox].ability:checked").each(function (index, value) {
        if ($(value).parent().css("display") === "none") {
            return true;
        }
        let ability_id = Number($(value).data("ability_id"));
        if (ability_id == 602) {
            // キレアジ
            let attack_info = getAttackInfo();
            if (attack_info.sp_cost > 8) {
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
    destruction_effect_size += getEarringEffectSize("blast", 10 - hit_count);
    destruction_effect_size -= grade_sum.destruction;
    return destruction_effect_size / 100;
}

// アビリティ情報取得
function getAbilityInfo(ability_id) {
    const filtered_ability = ability_list.filter((obj) => obj.ability_id == ability_id);
    return filtered_ability.length > 0 ? filtered_ability[0] : undefined;
}

// 敵リスト作成
function createEnemyList(enemy_class) {
    $("#enemy_list").empty();
    $.each(enemy_list, function (index, value) {
        if (value.enemy_class == enemy_class) {
            var option = $('<option>')
                .val(value.enemy_class_no);
            if (enemy_class == 6) {
                option.text(`#${value.score_attack_no} ${value.enemy_name}`)
            } else {
                option.text(value.enemy_name);
            }
            $("#enemy_list").append(option);
        }
    });

    if (enemy_class == 6 || enemy_class == 8) {
        // 表示を逆順にする
        $("#enemy_list").html($("#enemy_list option").toArray().reverse());
        $("#enemy_list").prop("selectedIndex", 0);
    }

    if (enemy_class == 6) {
        // スコアタの場合、グレードを表示する。
        $(".score_attack").css("display", "block");
        $("#score_lv").show();
        $("#prediction_score").show();
    } else {
        $(".score_attack").css("display", "none");
        $("#score_lv").hide();
        $("#prediction_score").hide();
    }
    if (enemy_class == 1) {
        // 異時層の場合、サブパーティを表示する。
        $(".sub_party").css("display", "block");
    } else {
        $(".sub_party").css("display", "none");
    }
    if (enemy_class == 99) {
        // 自由入力の場合、入力を解除する
        $("#enemy_save").show();
        $(".enemy_input").attr("readonly", false);
        $("#enemy_list").addClass("short");
    } else {
        $("#enemy_save").hide();
        $(".enemy_input").attr("readonly", true);
        $("#enemy_list").removeClass("short");
    }
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
function updateGrade() {
    let enemy_info = getEnemyInfo();
    let grade_sum = getGradeSum();
    for (let i = 1; i <= 3; i++) {
        setEnemyElement("#enemy_physical_" + i, enemy_info["physical_" + i] - grade_sum["physical_" + i]);
    }
    for (let i = 0; i <= 5; i++) {
        setEnemyElement("#enemy_element_" + i, enemy_info["element_" + i] - grade_sum["element_" + i]);
    }
    updateEnemyResist();
    updateEnemyScoreAttack();
}

// グレード情報取得
function getGradeSum() {
    let grade_sum = $.extend(true, {}, grade_list.filter((obj) => obj.score_attack_no == 0)[0]);
    let enemy_info = getEnemyInfo();
    if (enemy_info == undefined) {
        return;
    }
    if (enemy_info.enemy_class != 6) {
        // スコアタ以外の場合は、基本値
        return grade_sum;
    }
    let sum_list = ["defense_rate", "dp_rate", "hp_rate", "physical_1", "physical_2", "physical_3", "element_0", "element_1", "element_2", "element_3", "element_4", "element_5", "destruction", "critical"];
    let checked_id = $('input[name="rule_tab"]:checked').attr('id');
    $("." + checked_id + ":checked").each(function (index, value) {
        let grade_no = Number($(value).data("grade_no"));
        let half = Number(checked_id.match(/\d+/g));
        grade_list.filter((obj) => obj.score_attack_no == enemy_info.score_attack_no && obj.half == half && obj.grade_no == grade_no).forEach(value => {
            grade_sum["grade_rate"] += value["grade_rate"];
            if (value.grade_none == 1) {
                return true;
            }
            let step_turn = Number(value["step_turn"]);
            let turn_count = 1;
            if (step_turn != 0) {
                turn_count = Math.floor(Number($("#turn_count").val()) / step_turn);
            }
            sum_list.forEach(element => {
                grade_sum[element] += Number(value[element]) * turn_count;
            });
        });
    });
    return grade_sum;
}

// 敵ステータス設定
function setEnemyStatus() {
    let enemy_info = getEnemyInfo();
    if (enemy_info === undefined) {
        return;
    }
    if (enemy_info.score_attack_no) {
        displayScoreAttack(enemy_info);
    }
    $("#enemy_stat").val(enemy_info.enemy_stat);
    let strong_break = $("#strong_break").prop("checked") ? 300 : 0;
    $("#enemy_destruction_limit").val(Number(enemy_info.destruction_limit) + strong_break);
    $("#enemy_destruction_rate").val(Number(enemy_info.destruction_limit) + strong_break);
    $("#enemy_destruction").val(Number(enemy_info.destruction));
    for (let i = 1; i <= 3; i++) {
        setEnemyElement("#enemy_physical_" + i, enemy_info["physical_" + i]);
    }
    for (let i = 0; i <= 5; i++) {
        setEnemyElement("#enemy_element_" + i, enemy_info["element_" + i]);
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
    if (enemy_info.score_attack_no) {
        updateEnemyScoreAttack();
    }
    updateEnemyResist();
    // バフ効果量を更新
    $(".variable_effect_size").each(function (index, value) {
        updateBuffEffectSize($(value));
    });
    // 再ソート
    $(".redisplay").each(function (index, value) {
        sortEffectSize($(value));
        select2ndSkill($(value));
    });
    // 耐性変更時用に再実行
    updateEnemyResist();
}

// 敵ステータス更新
function updateEnemyStatus(enemy_class_no, enemy_info) {
    const enemy_class = 99;
    let filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no === enemy_class_no);
    let index = enemy_list.findIndex((obj) => obj === filtered_enemy[0]);
    Object.assign(enemy_list[index], enemy_info);
}

// スコアアタック敵ステータス設定
function updateEnemyScoreAttack() {
    let enemy_info = getEnemyInfo();
    let grade_sum = getGradeSum();
    let score_attack = getScoreAttack(enemy_info.score_attack_no);
    let score_lv = Number($("#score_lv").val());
    let enemy_stat = score_stat[score_lv - 100];
    let enemy_hp = getScoreHp(score_lv, Number(enemy_info.max_hp), score_attack, enemy_info);
    let max_dp_list = enemy_info.max_dp.split(",");
    for (let i = 0; i < max_dp_list.length; i++) {
        let enemy_dp = getScoreDp(score_lv, Number(max_dp_list[i]), score_attack, enemy_info);
        $("#enemy_dp_" + i).val((enemy_dp * (1 + grade_sum["dp_rate"] / 100)).toLocaleString());
    }
    $("#enemy_stat").val(enemy_stat);
    $("#socre_enemy_unit").val(score_attack.enemy_count);
    $("#enemy_hp").val((enemy_hp * (1 + grade_sum["hp_rate"] / 100)).toLocaleString());
}

// スコアアタック表示
function displayScoreAttack(enemy_info) {
    for (let i = 1; i <= 3; i++) {
        let grade_info = grade_list.filter((obj) => obj.score_attack_no == enemy_info.score_attack_no && obj.half == i);
        if (grade_info.length == 0) {
            $("#label_half_tab_" + i).hide();
            continue;
        } else {
            $("#label_half_tab_" + i).show();
        }
        $("#half_content_" + i).html("");
        grade_info.forEach(value => {
            let id = "half_" + i + "_grade" + value.grade_no;
            let div = $("<div>");
            let input = $("<input>").attr("type", "checkbox")
                .attr("id", id)
                .data("grade_no", value.grade_no)
                .addClass("half_check")
                .addClass("half_tab_" + i);
            let label = $("<label>").attr("for", id)
                .addClass("checkbox01")
                .text(value.grade_name + "(グレード:" + value.grade_rate + ")");
            div.append(input);
            div.append(label);
            $("#half_content_" + i).append(div);
        });
    }
}

// スコア設定
function calcScore(detail, grade_magn) {
    let score_lv = Number($("#score_lv").val());
    let is_break = $("#no_break_bonus_check").prop("checked");
    let turn_count = $("#turn_count").val();
    let enemy_info = getEnemyInfo();
    let score_attack = getScoreAttack(enemy_info.score_attack_no);
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
function setEnemyElement(id, val) {
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
    const filtered_attack = skill_attack.filter((obj) => obj.attack_id === attack_id);
    let attack_info = filtered_attack.length > 0 ? filtered_attack[0] : undefined;
    if (attack_info) {
        attack_info.attack_physical = getCharaData(attack_info.chara_id).physical;
    }
    return attack_info;
}

// 基礎攻撃力取得
function getBasePower(member_info, correction) {
    let jewel_lv = 0;
    if (member_info.style_info.jewel_type == "1") {
        jewel_lv = member_info.jewel_lv;
    }
    let attack_info = getAttackInfo();
    let molecule = 0;
    let denominator = 0;
    if (attack_info.ref_status_1 != 0) {
        molecule += member_info[status_kbn[attack_info.ref_status_1]] * 2;
        denominator += 2;
    }
    if (attack_info.ref_status_2 != 0) {
        molecule += member_info[status_kbn[attack_info.ref_status_2]];
        denominator += 1;
    }
    if (attack_info.ref_status_3 != 0) {
        molecule += member_info[status_kbn[attack_info.ref_status_3]];
        denominator += 1;
    }
    let enemy_stat = Number($("#enemy_stat").val()) + correction;
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

// バフ情報取得
function getBuffIdToBuff(buff_id) {
    const filtered_buff = skill_buff.filter((obj) => obj.buff_id === buff_id);
    return filtered_buff.length > 0 ? filtered_buff[0] : undefined;
}

// バフ効果量
function getBuffEffectSize(buff_id, member_info, skill_lv, target_jewel_type) {
    let jewel_lv = 0;
    if (member_info.style_info.jewel_type == target_jewel_type) {
        jewel_lv = member_info.jewel_lv;
    }
    let buff_info = getBuffIdToBuff(buff_id);
    if (skill_lv > buff_info.max_lv) {
        skill_lv = buff_info.max_lv;
    }
    // 固定量のバフ
    if (status_kbn[buff_info.ref_status_1] == 0) {
        return buff_info.min_power;
    }
    // 士気
    let stat_up = getStatUp();
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
    if (member_info.style_info.jewel_type == "4") {
        jewel_lv = member_info.jewel_lv;
    }
    let enemy_stat = Number($("#enemy_stat").val());
    let buff_info = getBuffIdToBuff(buff_id);
    if (skill_lv > buff_info.max_lv) {
        skill_lv = buff_info.max_lv;
    }
    // 士気
    let stat_up = getStatUp();
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
function getFunnelEffectSize(buff_id, member_info, skill_lv) {
    let buff_info = getBuffIdToBuff(buff_id)
    let funnel_power;
    if (buff_info.buff_kind == 16) {
        // 連撃(小)
        funnel_power = 10;
    } else {
        // 連撃(大)
        funnel_power = 40;
    }
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

// ステータスアップ取得
function getStatUp() {
    let morale = Number($("#morale_count").val()) * 5;
    let tears_of_dreams = 0;
    if ($("#enemy_class").val() == 1) {
        tears_of_dreams = Number($("#tears_of_dreams").val()) * tears_of_dreams_list[Number($("#enemy_list").val())];
    }
    return morale + tears_of_dreams;
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