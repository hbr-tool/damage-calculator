function setEventTrigger() {
    // リセットボタン
    $("#style_reset_btn").on("click", function(event) {
        for (let i = 0; i < select_style_list.length; i++) {
            if (select_style_list[i] !== 0) {
                chara_no = i;
                removeMember();
            }
        }
    });
    // 敵リストイベント
    $("#enemy_class").on("change", function(event) {
        let enemy_class = $("#enemy_class option:selected").val();
        createEnemyList(enemy_class);
    });
    $("#enemy_list").on("change", function(event) {
        setEnemyStatus();
        if (isWeak(undefined, undefined)) {
            $(".row_weak").css("display", "table-cell");
        } else {
            $(".row_weak").css("display", "none");
        }
    });
    // 攻撃スキル変更
    $("#attack_list").on("change", function(event) {
        if (select_attack_skill !== undefined) {
            if (select_attack_skill.attack_element !== 0) {
                $(".buff_element-" + select_attack_skill.attack_element).hide();
            }
            $("." + type_physical[select_attack_skill.attack_physical]).removeClass("selected");
            $("." + type_element[select_attack_skill.attack_element]).removeClass("selected");
            $(".only_chara_id-" + select_attack_skill.chara_id).hide();
            $(".status_attack_skill").removeClass("status_attack_skill");
        }
        if ($("#attack_list option").length == 0) {
            $("#attack_physical, #attack_element").attr("src", "img/blank.png");
            // 選択無しの場合は、削除のみ
            return;
        }
        let skill_info = getAttackInfo();
        select_attack_skill = skill_info;
        let max_lv = skill_info.max_lv;
        let chara_no = $(this).find("option:selected").data("chara_no");
        let chara_id = "chara_id-" + skill_info.chara_id;
        $(".public.buff_element-" + skill_info.attack_element).show();
        $(".public.buff_element-0").show();
        $(".only_" + chara_id + ".buff_element-0").show();
        $(".ability_self").hide();
        if (skill_info.attack_element !== 0) {
            $("#elememt_ring").prop("disabled", false);
            $(".self_element-" + skill_info.attack_element + "." + chara_id).show();
            $(".only_" + chara_id + ".buff_element-" + skill_info.attack_element).show();
        } else {
            $("#elememt_ring").prop("disabled", true);
            $("#elememt_ring").prop("selectedIndex", 0);
        }
        $(".self_element-0." + chara_id).show();

        // 該当ステータスに着色
        for (let i = 1; i <= 3; i++) {
            $("#" + status_kbn[skill_info["ref_status_" + i]] + "_" + chara_no).addClass("status_attack_skill");
        }
        $("input[type=checkbox].ability").each(function(index, value) {
            let ability_id = $(value).data("ability_id");
            let chara_no = $(value).data("chara_no");
            let ability_info = getAbilityInfo(ability_id);
            let limit_border = Number($(value).data("limit_border"));
            let limit_count = Number($("#limit_" + chara_no).val());
            setAbilityCheck(value, ability_info, limit_border, limit_count, chara_id);
        });
        $(".redisplay").each(function(index, value) {
            sortEffectSize($(value));
            select2ndSkill($(value));
        });
        let attack_physical = type_physical[skill_info.attack_physical];
        let attack_element = type_element[skill_info.attack_element];
        $("#attack_physical").attr("src", "img/" + attack_physical + ".webp");
        $("#attack_element").attr("src", "img/" + attack_element + ".webp");
        $("." + attack_physical).addClass("selected");
        $("." + attack_element).addClass("selected");

        if (skill_info.attack_element == 0) {
            $(".row_element").css("display", "none");
        } else {
            $(".row_element").css("display", "table-cell");
        }
        if (isWeak(skill_info, undefined)) {
            $(".row_weak").css("display", "table-cell");
        } else {
            $(".row_weak").css("display", "none");
        }
        createSkillLvList("skill_lv", max_lv, max_lv);
    });
    // バフスキル変更
    $(".include_lv").on("change", function(event) {
        let selected_index = $(this).prop("selectedIndex");
        let id = $(this).prop("id");
        $(".status_" + id).removeClass("status_" + id);
        if (selected_index === 0) {
            resetSkillLv(id);
        } else {
            let option = $(this).children().eq(selected_index);
            if (isOnlyBuff(option)) {
                $(this).prop("selectedIndex", 0);
                alert(option.text() + "は複数設定出来ません");
                return;
            }
            let select_lv = option.data("select_lv");
            let skill_info = getBuffIdToBuff(Number(option.val()));
            createSkillLvList(id + "_lv", skill_info.max_lv, select_lv);
            setStatusToBuff(option, id);
        }
    });
    // バフスキル変更
    $("#charge").on("change", function(event) {
        let selected_index = $(this).prop("selectedIndex");
        let id = $(this).prop("id");
        $(".status_" + id).removeClass("status_" + id);
        if (selected_index !== 0) {
            let option = $(this).children().eq(selected_index);
            setStatusToBuff(option, id);
        }
    });
    // スキルレベル変更
    $(".lv_effect").on("change", function(event) {
        let buff_type_id = $(this).attr("id").replace("_lv", "");
        let option = $("#" + buff_type_id + " option:selected");
        let chara_no = option.data("chara_no");
        let chara_id = select_style_list[chara_no].chara_id;
        let buff_id = Number(option.val());
        let skill_lv = $(this).prop("selectedIndex") + 1;
        // バフ効果量更新
        $(".variable_effect_size.chara_id-" + chara_id + ".buff_id-" + buff_id).each(function(index, value) {
            updateBuffEffectSize($(value), skill_lv);
        });
        // 同一スキル別セレクトボックス含めて反映
        $(".chara_id-" + chara_id + ".buff_id-" + buff_id).each(function(index, value) {
        	if ($(value).prop("selected")) {
            	$("#" + $(value).parent().attr("id") +"_lv").prop("selectedIndex", skill_lv - 1);
        	}
        });
    });
    // 限界突破変更
    $(".limit").on("change", function(event) {
        let limit_count = Number($(this).val());
        let chara_no = $(this).attr("id").replace("limit_", "");
        if (select_style_list[chara_no] === 0) {
            return;
        }
        let chara_id = "chara_id-" + select_style_list[chara_no].chara_id;
        // アビリティのチェックボックスを更新
        $("input[type=checkbox]." + chara_id).each(function(index, value) {
            let ability_id = $(value).data("ability_id");
            let ability_info = getAbilityInfo(ability_id);
            let limit_border = Number($(value).data("limit_border"));
            if (select_attack_skill !== undefined) {
                let attack_chara_id = "chara_id-" + select_attack_skill.chara_id;
                setAbilityCheck(value, ability_info, limit_border, limit_count, attack_chara_id);
            }
        });
        // バフ効果量を更新
        $(".variable_effect_size." + chara_id).each(function(index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // 宝珠レベル変更
    $(".jewel").on("change", function(event) {
        let chara_no = $(this).attr("id").replace(/[^0-9]/g, '');
        let chara_id = "chara_id-" + select_style_list[chara_no].chara_id;
        // バフ効果量を更新
        $(".variable_effect_size." + chara_id).each(function(index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // ステータス変更
    $(".status.effect_size").on("change", function(event) {
        let chara_no = $(this).attr("id").replace(/[^0-9]/g, '');
        let chara_id = "chara_id-" + select_style_list[chara_no].chara_id;
        // バフ効果量を更新
        $(".variable_effect_size." + chara_id).each(function(index, value) {
            updateBuffEffectSize($(value));
        });
    });
    // 前衛が3人以上の場合
    $(document).on("change", "#ability_front input", function(event) {
        let chara_id = "chara_id-" + select_attack_skill.chara_id;
        if ($("#ability_front input:checked:not(." + chara_id + ")").length > 2) {
            alert("前衛は攻撃キャラクターを除いた2人まで設定できます。");
            $(this).prop("checked", false);
            return;
        }
    });
    // 破壊率変更
    $("#enemy_destruction").on("change", function(event) {
        let destructionValue = Number($(this).val());
        if (destructionValue <= 100) {
            $(this).val(100);
        } else {
            $("#dp_range").val(0);
            $("#dp_rate").val('0%');
            let maxDestruction = Number($("#enemy_destruction_limit").val());
            if (maxDestruction < destructionValue) {
                $(this).val(maxDestruction);
            }
        }
    });
    // 残りDP変更
    $("#dp_range").on("input", function(event) {
        $('#dp_rate').val($(this).val() + '%');
        $("#enemy_destruction").val(100);
    });
    // 強ブレイクチェック
    $("#strong_break").on("change", function(event) {
        setEnemyStatus();
    });
    // ステータス保存
    $(".save").on("change", function(event) {
      if (navigator.cookieEnabled) {
        for(let i = 0; i < select_style_list.length; i++) {
          if (select_style_list[i] == 0) {
            continue;
          }
          for(let j = 1; j < status_kbn.length; j++) {
            let status = status_kbn[j];
            localStorage.setItem(status + "_" + select_style_list[i].chara_id, $("#" + status + "_" + i).val())
          }
          localStorage.setItem("jewel_" + select_style_list[i].chara_id, $("#jewel_" + i).prop("selectedIndex"));
          localStorage.setItem("limit_" + select_style_list[i].chara_id, $("#limit_" + i).prop("selectedIndex"));
        }
      }
    });
    // ダメージ再計算
    $(document).on("change", "input, select", function(event) {
        calcDamage();
    });
}

// ダメージ計算
function calcDamage() {
    let skill_info = getAttackInfo();
    if (skill_info === undefined) {
        return;
    }
    // SP消費計算
    getSpCost();
    // 闘志
    let fightingspirit = $("#fightingspirit").prop("checked") ? -20 : 0;
    // 厄
    let misfortune = $("#misfortune").prop("checked") ? -20 : 0;

    let basePower = getBasePower(fightingspirit + misfortune);
    let buff = getSumBuffEffectSize();
    let mindeye = isWeak() ? getSumEffectSize("mindeye") / 100 + 1: 1;
    let debuff = getSumDebuffEffectSize();
    let fragile = isWeak() ? getSumEffectSize("fragile") / 100 + 1: 1;
    let token = getSumTokenEffectSize();
    let element_field = getSumEffectSize("element_field") / 100 + 1;
    let weak_physical = $("#enemy_physical_" + skill_info.attack_physical).val() / 100;
    let weak_element = $("#enemy_element_" + skill_info.attack_element).val() / 100;

    let critical_power = getBasePower(fightingspirit - 50);
    let critical_rate = getCriticalRate();
    let critical_buff = getCriticalBuff();

    let fixed = mindeye * fragile * token * element_field * weak_physical * weak_element
    calculateDamage(basePower, skill_info, buff, debuff, fixed, "#damage", "#destruction_last_rate");
    calculateDamage(basePower * 0.9, skill_info, buff, debuff, fixed, "#damage_min", undefined);
    calculateDamage(basePower * 1.1, skill_info, buff, debuff, fixed, "#damage_max", undefined);
    calculateDamage(critical_power, skill_info, buff, debuff, fixed * critical_buff, "#critical_damage", "#critical_destruction_last_rate");
    calculateDamage(critical_power * 0.9, skill_info, buff, debuff, fixed * critical_buff, "#critical_damage_min", undefined);
    calculateDamage(critical_power * 1.1, skill_info, buff, debuff, fixed * critical_buff, "#critical_damage_max", undefined);
	
    // クリティカル表示
    $("#critical_rate").text(`(発生率: ${Math.round(critical_rate * 100) / 100}%)`);
    $("#damage_result").show();
}

// ダメージの詳細計算
function calculateDamage(basePower, skill_info, buff, debuff, fixed, id, destruction_id) {
    let funnel = getSumFunnelEffectSize();
    let destruction_rate = Number($("#enemy_destruction").val());
    let max_destruction_rate = Number($("#enemy_destruction_limit").val());
    let rest_dp = Number($("#enemy_dp").val().replace(/,/g, "")) * Number($("#dp_range").val()) / 100;
    let enemy_destruction = getEnemyInfo().destruction;

    let hit_count = skill_info.hit_count;
    let destruction_size = enemy_destruction * skill_info.destruction * (1 + getEarringEffectSize("blast", 10 - hit_count));
    let hit_destruction = destruction_size / hit_count;
    let hit_power = basePower / hit_count;
    let damage = 0;
    let special;
    let add_buff;
    let add_debuff;
    for (let i = 0; i < hit_count; i++) {
        if (rest_dp <= 0) {
            special = 1 + skill_info.hp_damege / 100;
            add_buff = getEarringEffectSize("attack", hit_count);
            add_debuff = 0;
        } else {
            special = 1 + skill_info.dp_damege / 100;
            add_buff = getEarringEffectSize("break", hit_count);
            add_debuff = getSumEffectSize("dp_debuff") / 100;
        }
        let hit_damage = hit_power * (buff + add_buff) * (debuff + add_debuff) * fixed * special * destruction_rate / 100;

        rest_dp -= hit_damage;
        if (rest_dp <= 0) {
           destruction_rate += hit_destruction;
            if (destruction_rate > max_destruction_rate) destruction_rate = max_destruction_rate;
        }
        damage += hit_damage
    }
    // 連撃は最終ダメージ後に追加
    if (rest_dp <= 0) {
        special = 1 + skill_info.hp_damege / 100;
        add_buff = getEarringEffectSize("attack", hit_count);
        add_debuff = 0;
    } else {
        special = 1 + skill_info.dp_damege / 100;
        add_buff = getEarringEffectSize("break", hit_count);
        add_debuff = getSumEffectSize("dp_debuff") / 100;
    }
    let hit_damage = basePower * (buff + add_buff) * (debuff + add_debuff) * fixed * funnel * special * destruction_rate / 100;
    damage += hit_damage;
    rest_dp -= hit_damage;
    if (rest_dp <= 0) {
        destruction_rate += destruction_size * funnel; 
        if (destruction_rate > max_destruction_rate) destruction_rate = max_destruction_rate;
    }
    $(id).val(Math.floor(damage).toLocaleString());
    if (destruction_id)  $(destruction_id).text(`${Math.round(destruction_rate * 10) / 10}%`);
}

// ピアス効果量取得
function getEarringEffectSize(type, hit_count) {
    hit_count = hit_count < 1 ? 1 : hit_count;
    let earring = $("#earring option:selected");
    if (earring.data("type") === type) {
        let effect_size = Number(earring.data("effect_size"));
        return (effect_size - (10 / 9 * (hit_count - 1))) / 100;
    }
    return 0;
}

// 消費SP計算
function getSpCost() {
    // SP消費量計算
	for (let i = 0; i < select_style_list.length; i++) {
        let chara_id = "chara_id-" + select_style_list[i].chara_id;
        let sp_cost = 0;
        let sp_list = [];
        $("option." + chara_id + ":selected").each(function(index, value) {
            switch ($(value).parent().attr("id")) {
                case "attack_list":
	                let attack = getAttackInfo();
	                addSkillCount(sp_list, attack.attack_name, $(value).parent().attr("id"), attack.sp_cost)
	                break;
                default:
	                let buff_id = Number($(value).val());
	                if (buff_id !== undefined && buff_id !== 0 ) {
	                    let buff = getBuffIdToBuff(buff_id)
	                    addSkillCount(sp_list, buff.buff_name, $(value).parent().attr("id"), buff.sp_cost)
	                }
	                break;
            }
        });
        // nameとsp_cost以外の最高値×sp_cost
        $.each(sp_list, function(index, value) {
            let single_sp_cost = 0;
            let max_count = 0;
            $.each(value, function(key, data) {
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
    name = name.replace("(初回)", "")
    const array = sp_list.filter((obj) => obj.name === name);

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

// バフ効果量更新
function updateBuffEffectSize(option, skill_lv) {
    let buff_id = Number(option.val());
    skill_lv = skill_lv || Number(option.data("select_lv"));
    let chara_no = option.data("chara_no");
    let skill_buff = getBuffIdToBuff(buff_id);
    let effect_size = getEffectSize(skill_buff.buff_kind, buff_id, chara_no, skill_lv);
    let chara_id = select_style_list[chara_no].chara_id;
    let effect_text = `${chara_name[chara_id]}: ${skill_buff.buff_name} ${Math.floor(effect_size * 100) / 100}%`;
    option.text(effect_text).data("effect_size", effect_size).data("select_lv", skill_lv);
}

// 弱点判定
function isWeak(skill_info, enemy_info) {
    skill_info = skill_info || getAttackInfo();
    enemy_info = enemy_info || getEnemyInfo();

    return enemy_info["physical_" + skill_info.attack_physical] > 100 || enemy_info["element_" + skill_info.attack_element] > 100;
}

// 攻撃リストに追加
function addAttackList(style, chara_no) {
    let attack_list = skill_attack.filter(obj =>
        obj.chara_id === style.chara_id && (obj.style_id === style.style_id || obj.style_id === 0)
    );

    let attack_sort_list = attack_list.sort((x, y) => y.style_id - x.style_id);

    attack_sort_list.forEach(value => {
        let option = $('<option>')
            .text(value.attack_name)
            .val(value.attack_id)
            .data("chara_no", chara_no)
            .addClass("chara_id-" + value.chara_id);
        $("#attack_list").append(option);
    });
}

// スキルレベルリスト作成
function createSkillLvList(id, max_lv, select_lv) {
    let $select = $("#" + id);
    $select.empty();
    for (var i = 1; i <= max_lv; i ++) {
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
function addBuffList(style, chara_no) {
    let buff_list = skill_buff.filter(obj => 
        (obj.chara_id === style.chara_id || obj.chara_id === 0) && 
        (obj.style_id === style.style_id || obj.style_id === 0)
        );
      
    buff_list.forEach(value => {
        let effect_size = getEffectSize(value.buff_kind, value.buff_id, chara_no, value.max_lv);
        let buff_element = 0;
        let only_one = "";
        
        switch (value.buff_kind) {
            case 11: // 属性フィールド
                addElementField(style, value.buff_name, value.min_power, value.buff_element, value.buff_id);
                return;
            case 0:
                only_one = "only_one";
            break;
            case 1: 
                only_one = "only_one";
            case 4:// 属性 
                buff_element = value.buff_element;
            break;
            case 8:
            case 9:// 属性
                buff_element = value.buff_element;
            case 6:
            case 7:
            case 16:
            case 17:
                only_one = "only_one";
            break;
        }
        
        let str_buff = buff_kbn[value.buff_kind];
        if (value.skill_attack === 0) only_one = 0;
        if (value.only_first === 1) only_one = "only_first";
        let only_chara_id = value.only_me === 1 ? `only_chara_id-${style.chara_id}` : "public";
        let option_text = `${chara_name[style.chara_id]}: ${value.buff_name} ${(Math.floor(effect_size * 100) / 100)}%`;
        
        var option = $('<option>')
            .text(option_text)
            .val(value.buff_id)
            .data("select_lv", value.max_lv)
            .data("max_lv", value.max_lv)
            .data("chara_no", chara_no)
            .data("effect_size", effect_size)
            .css("display", "none")
            .addClass("buff_element-" + buff_element)
            .addClass("buff_id-" + value.buff_id)
            .addClass("variable_effect_size")
            .addClass("skill_attack-" + value.skill_attack)
            .addClass(only_chara_id)
            .addClass(only_one)
            .addClass("chara_id-" + style.chara_id);
        
        $("." + str_buff).append(option);
    });
}

// フィールド追加
function addElementField(style, field_name, effect_size, field_element, buff_id) {
    let option_text = `${chara_name[style.chara_id]}: ${field_name} ${effect_size}%`;
    let option = $('<option>')
        .text(option_text)
        .data("effect_size", effect_size)
        .val(buff_id)
        .css("display", "none")
        .addClass("public")
        .addClass(`buff_element-${field_element}`)
        .addClass(`chara_id-${style.chara_id}`);
    $("#element_field").append(option);
}

// 連撃追加
function addBuffFunnel(buff_name, buff_id, chara_id, effect_size) {
    let option_text = `${chara_name[chara_id]}: ${buff_name} ${effect_size}%`;
    var option = $('<option>')
        .text(option_text)
        .data("chara_no", chara_no)
        .data("effect_size", effect_size)
        .val(buff_id)
        .css("display", "none")
        .addClass("buff_element-0")
        .addClass("skill_attack-0")
        .addClass("only_chara_id-" + chara_id)
        .addClass("buff_id-" + buff_id)
        .addClass("only_one")
        .addClass("chara_id-" + chara_id);
    
    $(".funnel").append(option);
}

// アビリティ追加
function addAbility(style_info, chara_no) {
    let ability_list = [style_info.ability0, style_info.ability1, style_info.ability3];
    for (let index = 0; index < ability_list.length; index++) {
        ability_id = ability_list[index];
        if (ability_id == 0 || ability_id > 1000) {
            // 1000番以降は不要
            continue;
        }
        ability_info = getAbilityInfo(ability_id);
        let limit_border = index == 0 ? 0 : (index === 1 ? 1 : 3); 
        let display = "none";

        if (ability_info.ability_element === 0 || (select_attack_skill && select_attack_skill.attack_element === ability_info.ability_element)) {
            display = "block";
        }
        let target;
        let element_type;
        switch (ability_info.ability_target) {
	        case 0: // フィールド
	            addElementField(style_info, ability_info.ability_name, ability_info.ability_power, ability_info.ability_element);
	            break;
	        case 1: // 自分
	            if (select_attack_skill && select_attack_skill.chara_id !== style_info.chara_id) {
	            	display = "none"
	            }
	            target = "ability_self";
	            element_type = "self_element"
	            break;
	        case 2: // 前衛
	            target = "ability_front";
	            element_type = "public buff_element"
	            break;
	        case 3:	// 常時
	        case 4: // その他
	            target = "ability_all";
	            element_type = "public buff_element"
	            break;
            case 5: // 狂乱の型
                addBuffFunnel(ability_info.ability_name, "0",style_info.chara_id, ability_info.ability_power);
	            break;
	        default:
	            break;
        }
        let name = chara_name[style_info.chara_id];
        let effect_size = ability_info.ability_power; 
        let id = target + style_info.chara_id;
        let chara_id = "chara_id-" + style_info.chara_id;
        let input = $('<input>').attr("type", "checkbox").attr("id", id)
            .data("effect_size", effect_size)
            .data("limit_border", limit_border)
            .data("ability_id", ability_id)
            .data("chara_no", chara_no)
            .addClass("ability_element-" + ability_info.ability_element)
            .addClass("ability")
            .addClass(chara_id);
        let label = $('<label>')
            .attr("for", id)
            .text(`${name}: ${ability_info.ability_name} (${ability_info.ability_short_explan})`)
            .css("display", display)
            .addClass("checkbox01")
            .addClass(element_type + "-" + ability_info.ability_element)
            .addClass(target)
            .addClass(chara_id);
        $("#" + target).append(input).append(label);
    }
}

// アビリティチェック設定
function setAbilityCheck(input, ability_info, limit_border, limit_count, chara_id) {
    let disabled = ability_info.ability_type == 1 ? true : false;
    let checked = true;
    switch (ability_info.ability_target) {
        case 1: // 自分
            disabled = (limit_count < limit_border || $(input).hasClass(chara_id)) && ability_info.ability_type == 1;
            checked = limit_count >= limit_border && $(input).hasClass(chara_id);
            break;
        case 2: // 前衛
            disabled = limit_count < limit_border || $(input).hasClass(chara_id);
            checked = limit_count >= limit_border && $(input).hasClass(chara_id);
            break;
        case 3:	// 常時
        case 4:	// 常時
            if (limit_count < limit_border) {
                disabled = true;
                checked = false;
            } else {
                checked = true;
            }
            break;
    }
    $(input).prop("checked", checked).attr("disabled", disabled);
}

// 効果量取得
function getEffectSize(buff_kind, buff_id, chara_no, skill_lv) {
    let effect_size = 0;
    switch (buff_kind) {
        case 0: // 攻撃力アップ
        case 1: // 属性攻撃力アップ
        case 2: // 心眼
        case 6:	// クリティカル率アップ
        case 7:	// クリティカルダメージアップ
        case 8:	// 属性クリティカル率アップ
        case 9:	// 属性クリティカルダメージアップ
        case 10: // チャージ
            effect_size = getBuffEffectSize(buff_id, chara_no, skill_lv);
        break;
        case 3: // 防御力ダウン
        case 4: // 属性防御力ダウン
        case 5: // 脆弱
        case 19: // DP防御力ダウン
            effect_size = getDebuffEffectSize(buff_id, chara_no, skill_lv);
        break;
        case 16: // 連撃(小)
        case 17: // 連撃(大)
            effect_size = getFunnelEffectSize(buff_id, chara_no, skill_lv);
        break;
        default:
        break;
    }
    return effect_size;
}

// スキル設定
function select2ndSkill(select) {
    select.prop("selectedIndex", 0);
    $(".status_" + select.attr("id")).removeClass("status_" + select.attr("id"));
    for (let i = 1; i < select.find("option").length; i++) {
        let option = select.find("option")[i];
        if ($(option).css("display") !== "none") {
            let buff_id = Number($(option).val());
            if (buff_id == 1000 || buff_id == 1600 || buff_id == 1700) {
                // アタッカライズ、クリシン、コンセ
                continue;
            }
            $(option).prop("selected", true);
            if (isOnlyBuff($(option))) {
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
    if (option.hasClass("only_first")){
        let class_name = option.parent().attr("id").replace(/[0-9]/g, '');
        let buff_id = "buff_id-" + option.val();
        if ($("." + class_name +" option." + buff_id + ":selected").length > 1) {
            return true;
        }
    }
    if (option.hasClass("only_one") && select_attack_skill !== undefined) {
        if (option.hasClass("chara_id-" + select_attack_skill.chara_id)) {
            let class_name = option.parent().attr("id").replace(/[0-9]/g, '');
            let buff_id = "buff_id-" + option.val();
            if ($("." + class_name +" option." + buff_id + ":selected").length > 1) {
                return true;
            }
        }
    }
    return false;
}

// 選択バフのステータスを着色
function setStatusToBuff(option, id) {
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

// 効果量合計
function getSumEffectSize(class_name) {
    let effect_size = 0;
    $("." + class_name).each(function(index, value) {
        let selected = $(value).find("option:selected");
        if (selected.val() == "") {
        return true;
        }
        effect_size += Number($(selected).data("effect_size"));
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
    sum_buff += token_count * getSumAbilityEffectSize(6);
    return 1 + sum_buff / 100;
}

// 合計デバフ効果量取得
function getSumDebuffEffectSize() {
    // スキルデバフ合計
    let sum_debuff = getSumEffectSize("debuff");
    sum_debuff += getSumAbilityEffectSize(7);
    return 1 + sum_debuff / 100;
}

// 合計連撃効果量取得
function getSumFunnelEffectSize() {
    // スキルデバフ合計
    let sum_funnel = getSumEffectSize("funnel");
    sum_funnel += getSumAbilityEffectSize(5);
    return sum_funnel / 100;
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
function getCriticalRate() {
    let chara_no = $("#attack_list option:selected").data("chara_no");
    let critical_rate = 1.5;
    let diff =  (Number($("#" + status_kbn[6] + "_" + chara_no).val()) - Number($("#enemy_stat").val()));
    critical_rate += diff > 0 ? diff * 0.04 : 0;
    critical_rate = critical_rate > 15 ? 15 : critical_rate;
    critical_rate += getSumEffectSize("critical_rate");
    critical_rate += getSumAbilityEffectSize(2);
    critical_rate += $("#charge").prop("selectedIndex") > 0 ? 20 : 0;
    return critical_rate > 100 ? 100 : critical_rate;
}

// クリティカルバフ取得
function getCriticalBuff() {
    let critical_buff = 50;
    critical_buff += getSumEffectSize("critical_buff");
    critical_buff += getSumAbilityEffectSize(3);
    return 1 + critical_buff / 100;
}

// アビリティ効果量合計取得
function getSumAbilityEffectSize(ability_kind) {
    let ability_effect_size = 0;
    $("input[type=checkbox].ability:checked").each(function(index, value) {
        let ability_id = Number($(value).data("ability_id"));
        let ability_info = getAbilityInfo(ability_id);
        if (ability_info.ability_kind == ability_kind) {
            ability_effect_size += Number($(value).data("effect_size"));
        }
    });
    return ability_effect_size;
}

// アビリティ情報取得
function getAbilityInfo(ability_id) {
    const filtered_ability = ability_list.filter((obj) => obj.ability_id == ability_id);
    return filtered_ability.length > 0 ? filtered_ability[0] : undefined;
}

// 敵リスト作成
function createEnemyList(enemy_class) {
    $("#enemy_list").empty();
    $.each(enemy_list, function(index, value) {
        if (value.enemy_class == enemy_class) {
            var option = $('<option>')
                        .text(value.enemy_name)
                        .val(value.enemy_class_no);
            $("#enemy_list").append(option);
        }
    });
    if (enemy_class == 6) {
        // スコアタの場合、いったん自由入力を許可する。
        $(".enemy_type_value").prop("readonly", false);
    } else {
        $(".enemy_type_value").prop("readonly", true);
    }
    setEnemyStatus();
}

// 敵情報取得
function getEnemyInfo() {
    const enemy_class = Number($("#enemy_class option:selected").val());
    const enemy_class_no = Number($("#enemy_list option:selected").val());
    const filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no === enemy_class_no);
    return filtered_enemy.length > 0 ? filtered_enemy[0] : undefined;
}

// 敵ステータス設定
function setEnemyStatus() {
    let enemy_info = getEnemyInfo();
    $("#enemy_stat").val(enemy_info.enemy_stat);
    $("#enemy_hp").val(enemy_info.max_hp.toLocaleString());
    $("#enemy_dp").val(enemy_info.max_dp.toLocaleString());
    let strong_break = $("#strong_break").prop("checked") ? 300 : 0;
    $("#enemy_destruction_limit").val(enemy_info.destruction_limit + strong_break);
    $("#enemy_destruction").val(enemy_info.destruction_limit+ strong_break);
    for (let i = 1; i <= 3; i++) {
        setEnemyElement("#enemy_physical_" + i, enemy_info["physical_" + i]);
    }
    for (let i = 0; i <= 5; i++) {
        setEnemyElement("#enemy_element_" + i, enemy_info["element_" + i]);
    }
    $("#dp_range").val(0);
    $("#dp_rate").val('0%');
}

// 敵耐性設定
function setEnemyElement(id, val) {
    $(id).val(val);
    $(id).removeClass("enemy_resist");
    $(id).removeClass("enemy_weak");
    if (val < 100) {
        $(id).addClass("enemy_resist");
    } else if (val >100) {
        $(id).addClass("enemy_weak");
    }
}

// 効果量ソート
function sortEffectSize(selecter) {
    var item = selecter.children().sort(function(a, b){
        var effectA= Number($(a).data("effect_size"));
        var effectB = Number($(b).data("effect_size"));
        if (effectA < effectB) {
            return 1;
        } else if (effectA > effectB) {
            return -1;
        } else {
            return 0;
        }
    });
    selecter.append(item);
}

// 攻撃情報取得
function getAttackInfo() {
    const attack_id = Number($("#attack_list option:selected").val());
    const filtered_attack = skill_attack.filter((obj) => obj.attack_id === attack_id);
    return filtered_attack.length > 0 ? filtered_attack[0] : undefined;
}

// 基礎攻撃力取得
function getBasePower(correction) {
    let chara_no = $("#attack_list option:selected").data("chara_no");
    let jewel_lv = 0;
    if ($("#jewel_type_" + chara_no).val() == "1") {
        jewel_lv = Number($("#jewel_lv_" + chara_no ).prop("selectedIndex"));
    }
    let skill_info = getAttackInfo();
    let molecule = 0;
    let denominator = 0;
    if (skill_info.ref_status_1 != 0) {
        molecule += Number($("#" + status_kbn[skill_info.ref_status_1] + "_" + chara_no).val()) * 2;
        denominator +=2;
    }
    if (skill_info.ref_status_2 != 0) {
        molecule += Number($("#" + status_kbn[skill_info.ref_status_2] + "_" + chara_no).val());
        denominator +=1;
    }
    if (skill_info.ref_status_3 != 0) {
        molecule += Number($("#" + status_kbn[skill_info.ref_status_3] + "_" + chara_no).val());
        denominator +=1;
    }
    let enemy_stat = Number($("#enemy_stat").val()) + correction;
    let status = molecule / denominator;

    let skill_lv = Number($("#skill_lv option:selected").val());
    let min_power = skill_info.min_power * (1 + 0.05 * (skill_lv - 1));
    let max_power = skill_info.max_power * (1 + 0.02 * (skill_lv - 1)); 
    let skill_stat = skill_info.param_limit;
    let base_power;
    // 宝珠分以外
    if (enemy_stat - skill_stat / 2 > status){
        base_power = 1;
    } else if (enemy_stat > status){
        base_power = min_power / (skill_stat / 2) * (status - (enemy_stat - skill_stat / 2));
    } else if (enemy_stat + skill_stat > status){
        base_power = (max_power - min_power) / skill_stat * (status - enemy_stat) + min_power;
    } else {
        base_power = max_power;
    }

    // 宝珠分(SLvの恩恵を受けない)
    if (jewel_lv > 0) {
        let jusl_stat = skill_stat + jewel_lv * 20;
        if (enemy_stat - skill_stat / 2 > status){
            base_power += 0;
        } else if (enemy_stat > status){
            base_power += skill_info.min_power / (jusl_stat / 2) * (status - (enemy_stat - jusl_stat / 2)) * jewel_lv * 0.02;
        } else if (enemy_stat + jusl_stat > status){
            base_power += ((skill_info.max_power - skill_info.min_power) / jusl_stat * (status - enemy_stat) + skill_info.min_power) * jewel_lv * 0.02;
        } else {
            base_power += skill_info.max_power * jewel_lv * 0.02;
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
function getBuffEffectSize(buff_id, chara_no, skill_lv) {
    let jewel_lv = 0;
    if ($("#jewel_type_" + chara_no).val() == "3") {
        jewel_lv = Number($("#jewel_lv_" + chara_no ).prop("selectedIndex"));
    }
    let skill_info = getBuffIdToBuff(buff_id);
    if (skill_lv > skill_info.max_lv) {
        skill_lv = skill_info.max_lv;
    }
    // 固定量のバフ
    if (status_kbn[skill_info.ref_status_1] == 0) {
        return skill_info.min_power;
    }
    let status = Number($("#" + status_kbn[skill_info.ref_status_1] + "_" + chara_no).val());
    let min_power = skill_info.min_power * (1 + 0.03 * (skill_lv - 1));
    let max_power = skill_info.max_power * (1 + 0.02 * (skill_lv - 1));
    let skill_stat = skill_info.param_limit;
    let effect_size = 0;
    // 宝珠分以外
    if (status > skill_info.param_limit) {
        effect_size += max_power;
    } else {
        effect_size += (max_power - min_power) / skill_stat * status + min_power;
    }
    if (skill_info.buff_kind == 2) {
        // 心眼はここまで
        return effect_size;
    }
    // 宝珠分(SLvの恩恵を受けない)
    if (jewel_lv > 0) {
        let jusl_stat = skill_stat + jewel_lv * 60;
        if (status > jusl_stat) {
            effect_size += skill_info.max_power * jewel_lv * 0.04
        } else {
            effect_size += ((skill_info.max_power - skill_info.min_power) / jusl_stat * status + skill_info.min_power) * jewel_lv * 0.04;
        }
    }
    // 機転
    let ability_id = select_style_list[chara_no].ability3;
    let limit_lv = Number($("#limit_" + chara_no ).prop("selectedIndex"));
    if (ability_id == 501 && limit_lv >= 3) {
        effect_size *= 1.25;
    }
    return effect_size;
}

// デバフ効果量
function getDebuffEffectSize(buff_id, chara_no, skill_lv) {
    let jewel_lv = 0;
    if ($("#jewel_type_" + chara_no).val() == "4") {
        jewel_lv = Number($("#jewel_lv_" + chara_no ).prop("selectedIndex"));
    }
    let enemy_stat = Number($("#enemy_stat").val());
    let skill_info = getBuffIdToBuff(buff_id);
    if (skill_lv > skill_info.max_lv) {
        skill_lv = skill_info.max_lv;
    }
    let status1 = Number($("#" + status_kbn[skill_info.ref_status_1] + "_" + chara_no).val());
    let status2 = Number($("#" + status_kbn[skill_info.ref_status_2] + "_" + chara_no).val());
    let min_power = skill_info.min_power * (1 + 0.05 * (skill_lv - 1));
    let max_power = skill_info.max_power * (1 + 0.02 * (skill_lv - 1));
    let status = (status1 * 2 + status2) / 3 - enemy_stat;
    let skill_stat = skill_info.param_limit;
    let effect_size = 0;
    // 宝珠分以外
    if (status < 0) {
        effect_size += min_power;
    } else if (status < skill_info.param_limit) {
        effect_size += (max_power - min_power) / skill_stat * status + min_power;
    } else {
        effect_size += max_power;
    }
    // 宝珠分(SLvの恩恵を受けない)
    if (jewel_lv > 0) {
        let jusl_stat = skill_stat + jewel_lv * 20;
        if (status < 0) {
            effect_size += skill_info.min_power * jewel_lv * 0.02;
        } else if (status < jusl_stat) {
            effect_size += ((skill_info.max_power - skill_info.min_power) / jusl_stat * status + skill_info.min_power) * jewel_lv * 0.02;
        } else {
            effect_size += skill_info.max_power * jewel_lv * 0.02;
        }
    }
    // 侵食
    let ability_id = select_style_list[chara_no].ability3;
    let limit_lv = Number($("#limit_" + chara_no ).prop("selectedIndex"));
    if (ability_id == 502 && limit_lv >= 3) {
        effect_size *= 1.25;
    }
    return effect_size;
}

// 連撃効果量
function getFunnelEffectSize(buff_id, chara_no, skill_lv) {
    let skill_info = getBuffIdToBuff(buff_id)
    let funnel_power;
    if (skill_info.buff_kind == 16) {
        // 連撃(小)
        funnel_power = 10;
    } else {
        // 連撃(大)
        funnel_power = 40;
    }
    let effect_size;
    let min_power = skill_info.min_power;
    let max_power = skill_info.max_power;
    if (min_power == max_power) {
        effect_size = funnel_power * min_power;
    } else {
        let status1 = Number($("#" + status_kbn[skill_info.ref_status_1] + "_" + chara_no).val());
        if (skill_info.param_limit > status1) {
            effect_size = funnel_power * min_power;
        } else {
            effect_size = funnel_power * max_power;
        }
    }

   return effect_size;
}
