let last_turn;
let turn_list = [];
let now_turn;
let physical_name = ["", "斬", "突", "打"]
let element_name = ["無", "火", "氷", "雷", "光", "闇"]
class turn_data {
    constructor() {
        this.turn_number = 0;
        this.over_drive_turn = 0;
        this.over_drive_max_turn = 0;
        this.add_turn = false;
        this.enemy_debuff_list = [];
        this.unit_list = [];
        this.over_drive_gauge = 0;
        this.enemy_count = 1;
    }

    // 0:先打ちOD,1:通常戦闘,2:後打ちOD,3:追加ターン
    turnProceed(val) {
        this.unitSort();
        if (val == 1) {
            // 通常
            $.each(this.unit_list, function (index, value) {
                if (!value.blank) {
                    value.unitTurnProceed();
                }
            });
            // 敵のデバフ消費
            this.debuffConsumption();
            this.turn_number++;
        } else if (val == 3) {

        } else {
            // OD
            this.over_drive_turn = 1;
            this.over_drive_max_turn = Math.floor(this.over_drive_gauge / 100);
        }
    }
    unitSort() {
        this.unit_list.sort((a, b) => a.place_no - b.place_no);
    }
    getTurnNumber() {
        const defalt_turn = "ターン" + this.turn_number;
        // 追加ターン
        if (this.add_turn) {
            return `${defalt_turn} 追加ターン`;
        }
        // オーバードライブ中
        if (this.over_drive_turn > 0) {
            return `${defalt_turn} OverDrive${this.over_drive_turn}/${this.over_drive_max_turn}`;
        }
        return defalt_turn;
    }
    addOverDrive(add_od_gauge) {
        this.over_drive_gauge += add_od_gauge;
        if (this.over_drive_gauge > 300) {
            this.over_drive_gauge = 300;
        }
    }
    debuffConsumption() {
        for (let i = this.enemy_debuff_list.length - 1; i >= 0; i--) {
            let debuff = this.enemy_debuff_list[i];
            if (debuff.rest_turn <= 1) {
                buff_list.splice(i, 1);
            } else {
                debuff.rest_turn -= 1;
            }
        }
    }
}

class unit_data {
    constructor() {
        this.place_no = 99;
        this.sp = 1;
        this.buff_list = [];
        this.add_turn = false;
        this.unit = null;
        this.normal_attack_element = 0;
        this.earring_effect_size = 0;
        this.skill_list = [];
        this.blank = false;
        this.first_ultimate = false;
    }

    unitTurnProceed() {
        if (this.sp < 20) {
            this.sp += 2;
            if (this.place_no <= 2) {
                // 前衛
                this.sp += 1;
            }
            if (this.sp > 20) {
                this.sp = 20
            }
        }
    }
    payCost(sp_cost) {
        this.sp -= sp_cost;
    }
    getEarringEffectSize(hit_count) {
        // ドライブ
        if (this.earring_effect_size != 0) {
            hit_count = hit_count < 1 ? 1 : hit_count;
            hit_count = hit_count > 10 ? 10 : hit_count;
            return (this.earring_effect_size - (10 / 9 * (hit_count - 1)));
        }
        return 0;
    }
    getfunnelList() {
        let ret = [];
        let funnel_list = this.buff_list.filter(function (buff_info) {
            return buff_info.buff_kind == 16 || buff_info.buff_kind == 17;
        });
        $.each(funnel_list, function (index, buff_info) {
            let effect_size;
            let effect_count;
            let effect_unit;
            if (buff_info.buff_kind == 16) {
                effect_count = buff_info.effect_size;
                effect_unit = 10
            } else {
                effect_count = buff_info.effect_size;
                effect_unit = 40
            }
            effect_size = effect_unit * effect_unit;
            ret.push({ "effect_count": effect_count, "effect_unit": effect_unit, "effect_size": effect_size });
        });
        // effect_sizeで降順にソート
        ret.sort(function (a, b) {
            return b.effect_size - a.effect_size;
        });

        // 上位2つの要素を取得
        let top_two = ret.slice(0, 2);

        // 新しいリストを作成
        let result_list = [];

        // 各要素のeffect_count分effect_unitを追加
        top_two.forEach(function (item) {
            for (let i = 0; i < item.effect_count; i++) {
                result_list.push(item.effect_unit);
            }
        });
        return result_list;
    }
}
class buff_data {
    constructor() {
        this.rest_turn = -1;
        this.effect_size = 0;
        this.buff_kind = 0;
    }
}

function setEventTrigger() {
    // リセットボタン
    $("#style_reset_btn").on("click", function (event) {
        styleReset(true);
    });
    // 敵リストイベント
    $("#enemy_class").on("change", function (event) {
        let enemy_class = $(this).val();
        createEnemyList(enemy_class);
    });
    $("#enemy_list").on("change", function (event) {
        setEnemyStatus();
    });
    // 部隊変更ボタンクリック
    $(".troops_btn").on("click", function (event) {
        if ($(this).hasClass("selected_troops")) {
            return;
        }
        $(".selected_troops").removeClass("selected_troops");
        $(this).addClass("selected_troops");
        styleReset(false);
        select_troops = $(this).val();
        localStorage.setItem('select_troops', select_troops);
        loadTroopsList(select_troops);
    });
    // 戦闘開始ボタンクリック
    $(".battle_start").on("click", function (event) {
        last_turn = 0;
        $("#turn_area").html("");
        battle_start();
    });
    // スキル変更
    $(document).on("change", "select.unit_skill", function (event) {
        // 消費SPを減らす
        function tempDownSp(target, index, skill_id) {
            let unit_data = getUnitData(index);
            let skill_info = getSkillData(skill_id);
            let unit_sp = unit_data.sp - skill_info.sp_cost;
            // SP半減効果
            if (harfSpSkill(skill_info, unit_data)) {
                unit_sp += skill_info.sp_cost / 2;
            }
            $(target).text(unit_sp);
            if (unit_sp < 0) {
                $(target).addClass("minus");
            } else {
                $(target).removeClass("minus");
            }
        }
        tempDownSp($(this).parent().find(".unit_sp"), $(this).index("select.unit_skill"), $(this).find('option:selected').val());
    });
    // ユニット交換イベントの伝播を止める
    $(document).on("click", "select.unit_skill", function (event) {
        event.stopPropagation();
    });
    // 行動開始
    $(document).on("click", ".next_turn", function (event) {
        // 前ターンを不能
        $(".turn" + last_turn + " .unit_select").off("click");
        $(".turn" + last_turn + " select").prop("disabled", true);
        $(".unit_selected").removeClass("unit_selected");

        startAction(last_turn);
        // 次ターンを追加
        addTurn(now_turn, 1);
    });
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
    setEnemyStatus();
}
// 敵ステータス設定
function setEnemyStatus() {
    let enemy_info = getEnemyInfo();
    if (enemy_info === undefined) {
        return;
    }
    for (let i = 1; i <= 3; i++) {
        setEnemyElement("#enemy_physical_" + i, enemy_info["physical_" + i]);
    }
    for (let i = 0; i <= 5; i++) {
        setEnemyElement("#enemy_element_" + i, enemy_info["element_" + i]);
    }
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

/* 戦闘開始処理 */
function battle_start() {
    let turn_init = new turn_data();
    let unit_list = [];

    // スタイル情報を作成
    $.each(select_style_list, function (index, value) {
        let unit = new unit_data();
        unit.place_no = index;
        if (value) {
            unit.sp += Number($("#chain_" + index).val());
            unit.normal_attack_element = $("#bracelet_" + index).val();
            unit.earring_effect_size = Number($(`#earring_${index} option:selected`).val());
            unit.style = value;
            unit.skill_list = skill_list.filter(obj =>
                (obj.chara_id === value.style_info.chara_id || obj.chara_id === 0) &&
                (obj.style_id === value.style_info.style_id || obj.style_id === 0)
            );
        } else {
            unit.blank = true;
        }
        unit_list.push(unit);
    });
    turn_init.enemy_count = Number($("#enemy_count").val());;
    turn_init.unit_list = unit_list;
    turn_list.push(turn_init);
    // 
    addTurn(turn_init, 1);

    // 領域表示
    $("#battle_area").css("visibility", "visible");
}

function addTurn(turn_data, kb_add_turn) {
    last_turn++;
    turn_data.turnProceed(kb_add_turn);

    let turn = $('<div>').addClass("turn").addClass("turn" + last_turn);
    let header_area = $('<div>').addClass("flex");
    let turn_number = $('<div>').text(turn_data.getTurnNumber());
    let enemy = $('<div>').append($('<img>').attr("src", "icon/BtnEventBattleActive.webp").addClass("enemy_icon")).addClass("left flex");
    let turn_enemy_count = $("<select>").attr("id", `enemy_count_turn${last_turn}`);
    for (let i = 1; i <= 3; i++) {
        let option = $("<option>").val(i).text(`×${i}体`);
        turn_enemy_count.append(option);
    }
    turn_enemy_count.val(turn_data.enemy_count);
    let debuuf_lidt = createBuffIconList(turn_data.enemy_debuff_list);
    enemy.append(turn_enemy_count).append(debuuf_lidt);
    let over_drive = createOverDriveGauge(turn_data.over_drive_gauge);
    header_area.addClass("container").append(turn_number).append(enemy).append(over_drive);
    let party_member = $('<div>').addClass("flex");
    let front_area = $('<div>').addClass("flex").addClass("front_area");
    let back_area = $('<div>').addClass("flex").addClass("back_area");
    $.each(turn_data.unit_list, function (index, unit) {
        let chara_div = $('<div>').addClass("unit_select");
        let img = $('<img>')
            .data("chara_no", index)
            .addClass("unit_style");
        let unit_div = $('<div>').addClass("flex");
        if (unit.style) {
            let sp = $('<div>').text(unit.sp).addClass("unit_sp");
            if (unit.sp < 0) {
                sp.addClass("minus");
            }
            img.attr("src", "icon/" + unit.style.style_info.image_url)
            let inner_div = $('<div>').append(img).append(sp);
            unit_div.append(inner_div);
            chara_div.append(unit_div);
        } else {
            img.attr("src", "img/cross.png")
            chara_div.append(img);
        }

        let skill_select = $('<select>').addClass("unit_skill");
        let option = $('<option>').text("なし").val(0).addClass("back");
        skill_select.append(option);
        $.each(unit.skill_list, function (index, value) {
            let text = value.skill_name;
            if (value.skill_name == "通常攻撃") {
                text += `(${physical_name[value.attack_physical]}・${element_name[unit.normal_attack_element]})`;
            } else if (value.skill_name == "追撃") {
                text += `(${physical_name[value.attack_physical]})`;
            } else if (value.attack_id) {
                text += `(${physical_name[value.attack_physical]}・${element_name[value.attack_element]}/${value.sp_cost})`;
            } else {
                text += `(${value.sp_cost})`;
            }
            option = $('<option>').text(text)
                .val(value.skill_id).addClass(value.skill_name == "追撃" ? "back" : "front");
            skill_select.append(option);
        });
        if (unit.buff_list.length > 0) {
            unit_div.append(createBuffIconList(unit.buff_list));
        }
        if (!unit.style) {
            skill_select.css("visibility", "hidden");
        }
        chara_div.prepend(skill_select);

        if (unit.place_no < 3) {
            setFrontOptions(skill_select);
            front_area.append(chara_div);
        } else {
            setBackOptions(skill_select);
            back_area.append(chara_div);
        }
    });
    party_member.append(front_area).append(back_area)
    turn.append(header_area).append(party_member);
    $("#turn_area").prepend(turn);

    addUnitEvent(turn_data.unit_list);
    turn_list.push(turn_data);
    now_turn = turn_data;
}
// バフアイコンリスト
function createBuffIconList(buff_list) {
    let div = $("<div>").addClass("icon_list flex flex-wrap");
    $.each(buff_list, function (index, value) {
        let img = $('<img>');
        let src = "img/";
        switch (value.buff_kind) {
            case 0: // 攻撃力アップ
            case 1: // 属性攻撃力アップ
                src += "IconBuffAttack";
                break;
            case 2: // 心眼
                src += "IconMindEye";
                break;
            case 3: // 防御力ダウン
            case 4: // 属性防御力ダウン
                src += "IconBuffDefense";
                break;
            case 5: // 脆弱
                src += "IconFragile";
                break;
            case 6:	// クリティカル率アップ
            case 8:	// 属性クリティカル率アップ
                src += "IconCriticalRate";
                break;
            case 7:	// クリティカルダメージアップ
            case 9:	// 属性クリティカルダメージアップ
                src += "IconCriticalDamage";
                break;
            case 10: // チャージ
                src += "IconCharge";
                break;
            case 12: // 破壊率アップ
                src += "IconDamageRate";
                break;
            case 14: // 闘志
                src += "IconFightingSpirit";
                break;
            case 15: // 厄
                src += "IconMisfortune";
                break;
            case 16: // 連撃(小)
                src += "IconFunnelS";
                break;
            case 17: // 連撃(大)
                src += "IconFunnelL";
                break;
            case 19: // DP防御ダウン
                src += "IconBuffDefenseDP";
                break;
            case 20: // 耐性ダウン
                src += "IconResistElement";
                break;
            default:
                break;
        }
        if (value.buff_element != 0) {
            src += value.buff_element;
        }
        src += ".webp";
        img.attr("src", src).addClass("unit_buff");
        div.append(img)
    });
    return div;
}

// ODゲージ生成
function createOverDriveGauge(over_drive_gauge) {
    let over_drive = $('<div>').addClass("flex");
    let over_drive_text = $('<label>').text(`${(over_drive_gauge % 100).toFixed(2)}%`).addClass("od_text");
    let over_drive_img = $('<div>').append($('<img>').attr("src", "img/FrameOverdriveGaugeR.webp").addClass("od_icon"));
    if (over_drive_gauge >= 100) {
        let gauge = Math.floor(over_drive_gauge / 100);
        over_drive_img.append($('<img>').attr("src", `img/ButtonOverdrive${gauge}Default.webp`).addClass("od_number"));
    }
    over_drive.append(over_drive_text).append(over_drive_img);
    return over_drive;
}
// ユニットイベント
function addUnitEvent(unit_list) {
    let first_click = null;
    let first_click_index = -1;

    $(".turn" + last_turn + " .unit_select").on("click", function (event) {
        // クリックされた要素を取得
        let clicked_element = $(this);
        let index = $(this).parent().index() * 3 + $(this).index();
        let unit_data = getUnitData(index);
        if (!unit_data || unit_data.blank) {
            return;
        }
        // 最初にクリックされた要素かどうかを確認
        if (first_click === null) {
            // 最初にクリックされた要素を記録
            first_click = clicked_element;
            first_click_index = index;
            clicked_element.addClass("unit_selected");
        } else {
            first_click.removeClass("unit_selected");
            // 同じ要素が2回クリックされた場合は処理しない
            if (first_click.is(clicked_element)) {
                // 最初にクリックした要素をリセット
                first_click = null;
                return;
            }
            // 2回目にクリックされた要素を取得
            let second_click = clicked_element;

            let first_click_unit_data = getUnitData(first_click_index);
            first_click_unit_data.place_no = index;
            unit_data.place_no = first_click_index;

            // 前衛と後衛が入れ替わった場合、
            if (index >= 0 && index <= 2 && first_click_index >= 3 && first_click_index <= 5) {
                setFrontOptions(first_click.find("select"));
                setBackOptions(second_click.find("select"));
                let second_sp = second_click.find(".unit_sp");
                second_sp.text(unit_data.sp);
                if (unit_data.sp > 0) {
                    second_sp.removeClass("minus");
                }
            }
            if (index >= 3 && index <= 5 && first_click_index >= 0 && first_click_index <= 2) {
                setFrontOptions(second_click.find("select"));
                setBackOptions(first_click.find("select"));
                let first_sp = first_click.find(".unit_sp");
                first_sp.text(first_click_unit_data.sp);
                if (first_click_unit_data.sp > 0) {
                    first_sp.removeClass("minus");
                }
            }
            // 要素を交換
            swapElements(first_click, second_click)

            // 最初にクリックした要素をリセット
            first_click = null;
            first_click_index = -1;
        }
    });
}

// 要素を交換する関数
function swapElements(first_element, second_element) {
    const first_select_val = first_element.find("select").val();
    const second_select_val = second_element.find("select").val();

    const first_clone = first_element.clone(true);
    const second_clone = second_element.clone(true);

    first_clone.find("select").val(first_select_val);
    second_clone.find("select").val(second_select_val);

    first_element.replaceWith(second_clone);
    second_element.replaceWith(first_clone);
}

// 敵情報取得
function getEnemyInfo() {
    const enemy_class = Number($("#enemy_class option:selected").val());
    const enemy_class_no = Number($("#enemy_list option:selected").val());
    const filtered_enemy = enemy_list.filter((obj) => obj.enemy_class == enemy_class && obj.enemy_class_no === enemy_class_no);
    return filtered_enemy.length > 0 ? filtered_enemy[0] : undefined;
}
// ユニットデータ取得
function getUnitData(index) {
    let unit_list = now_turn.unit_list;
    const filtered_unit = unit_list.filter((obj) => obj.place_no == index);
    return filtered_unit.length > 0 ? filtered_unit[0] : undefined;
}
// スキルデータ取得
function getSkillData(skill_id) {
    const filtered_skill = skill_list.filter((obj) => obj.skill_id == skill_id);
    return filtered_skill.length > 0 ? filtered_skill[0] : undefined;
}
// 攻撃情報取得
function getAttackInfo(attack_id) {
    const filtered_attack = skill_attack.filter((obj) => obj.attack_id === attack_id);
    return filtered_attack.length > 0 ? filtered_attack[0] : undefined;
}
// バフ情報取得
function getBuffInfo(skill_id) {
    const filtered_buff = skill_buff.filter((obj) => obj.skill_id === skill_id);
    return filtered_buff;
}

// スキル設定
function setFrontOptions(select) {
    select.find("option.front").show();
    select.find("option.back").hide();
    select.find("option.front:first").prop('selected', true);
}
function setBackOptions(select) {
    select.find("option.front").hide();
    select.find("option.back").show();
    select.find("option:not(.front):first").prop('selected', true);
}

// 行動開始
function startAction(turn_number) {
    let seq = sortActionSeq(turn_number);
    let enemy_count = Number($(`#enemy_count_turn${turn_number}`).val());
    now_turn.enemy_count = enemy_count;
    $.each(seq, function (index, skill_data) {
        let skill_info = skill_data.skill_info;
        let unit_data = getUnitData(skill_data.place_no);
        let sp_cost = skill_info.sp_cost;
        let od_plus = 0;
        let attack_info;

        let buff_list = getBuffInfo(skill_info.skill_id);
        if (buff_list) {
            for (let i = 0; i < buff_list.length; i++) {
                addBuffUnit(buff_list[i], skill_data.place_no);
            }
        }
        origin(skill_info, unit_data);

        let funnel_list = unit_data.getfunnelList();
        if (skill_info.skill_name == "通常攻撃") {
            od_plus = 7.5
            attack_info = { "attack_id": 0, "attack_element": unit_data.normal_attack_element };
            od_plus += funnel_list.length * 2.5 * enemy_count;
        } else if (skill_info.attack_id) {
            attack_info = getAttackInfo(skill_info.attack_id);
            let earring = 1 + unit_data.getEarringEffectSize(11 - attack_info.hit_count) / 100;
            let hit_od = Math.floor(2.5 * earring * 100) / 100
            if (attack_info.range_area == 1) {
                enemy_count = 1;
            }
            od_plus = attack_info.hit_count * hit_od * enemy_count;
            od_plus += funnel_list.length * hit_od * enemy_count;
        }

        if (attack_info) {
            consumeBuffUnit(unit_data.buff_list, attack_info);
        }
        unit_data.payCost(sp_cost);
        now_turn.addOverDrive(od_plus);
    });
}

// 独自仕様
function origin(skill_info, unit_data) {
    if (harfSpSkill(skill_info, unit_data)) {
        unit_data.sp += skill_info.sp_cost / 2;
        unit_data.first_ultimate = true;
    }
    return;
}

// 消費SP半減
function harfSpSkill(skill_info, unit_data) {
    switch (skill_info.skill_id) {
        case 416: // 必滅！ヴェインキック+
            if (!unit_data.first_ultimate) {
                return true;
            }
            break;
    }
    return false;
}

// バフを追加
function addBuffUnit(buff_info, place_no) {
    // 対象：場
    if (buff_info.range_area == 0) {
        if (buff_info.buff_kind == 13) {
            // OD増加
            now_turn.addOverDrive(buff_info.min_power);
        }
        return;
    }
    // 個別判定
    switch (buff_info.buff_id) {
        case 111: // 豪快！パイレーツキャノン(敵1体)
            if (now_turn.enemy_count != 1) {
                return;
            }
            break;
        case 112: // 豪快！パイレーツキャノン(敵2体)
            if (now_turn.enemy_count != 2) {
                return;
            }
            break;
        case 113: // 豪快！パイレーツキャノン(敵3体)
            if (now_turn.enemy_count != 3) {
                return;
            }
            break;
    }
    let target_list;
    // 対象策定
    switch (buff_info.buff_kind) {
        case 0: // 攻撃力アップ
        case 1: // 属性攻撃力アップ
        case 2: // 心眼
        case 6:	// クリティカル率アップ
        case 7:	// クリティカルダメージアップ
        case 8:	// 属性クリティカル率アップ
        case 9:	// 属性クリティカルダメージアップ
        case 10: // チャージ
        case 12: // 破壊率アップ
        case 16: // 連撃(小)
        case 17: // 連撃(大)
            // バフ追加
            target_list = getTargetList(buff_info, place_no);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(target_no);
                let buff = new buff_data();
                buff.buff_kind = buff_info.buff_kind;
                buff.buff_element = buff_info.buff_element;
                buff.effect_size = buff_info.min_power;
                unit_data.buff_list.push(buff);
            });
            break;
        case 3: // 防御力ダウン
        case 4: // 属性防御力ダウン
        case 5: // 脆弱
        case 19: // DP防御力ダウン
        case 20: // 耐性ダウン
        case 21: // 永続防御ダウン
        case 22: // 永続属性防御ダウン
            // デバフ追加
            let add_count = 1;
            if (buff_info.range_area == 2) {
                add_count = now_turn.enemy_count;
            }
            for (let i = 0; i < add_count; i++) {
                let debuff = new buff_data();
                debuff.buff_kind = buff_info.buff_kind;
                debuff.buff_element = buff_info.buff_element;
                debuff.effect_size = buff_info.min_power;
                debuff.rest_turn = buff_info.effect_count;
                now_turn.enemy_debuff_list.push(debuff);
            }
            break;
        case 23: // SP追加
            target_list = getTargetList(buff_info, place_no);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(target_no);
                unit_data.sp += buff_info.min_power;
            });
            break;
        default:
            break;
    }
}

// 攻撃時にバフ消費
function consumeBuffUnit(buff_list, attack_info) {
    let consume_kind = [];
    // バフ追加
    for (let i = buff_list.length - 1; i >= 0; i--) {
        buff_info = buff_list[i];
        const countWithFilter = consume_kind.filter(buff_kind => buff_kind === buff_info.buff_kind).length;
        // 同一バフは2個まで
        if (countWithFilter >= 2) {
            if (attack_info.attack_id == 0) {
                return true;
            }
        }
        switch (buff_info.buff_kind) {
            case 1: // 属性攻撃力アップ
                if (attack_info.attack_element != buff_info.buff_element) {
                    continue;
                }
            case 0: // 攻撃力アップ
            case 2: // 心眼
            case 10: // チャージ
            case 12: // 破壊率アップ
                // スキルでのみ消費
                if (attack_info.attack_id == 0) {
                    continue;
                }
                buff_list.splice(i, 1);
                break;
            case 8:	// 属性クリティカル率アップ
            case 9:	// 属性クリティカルダメージアップ
                if (attack_info.attack_element != buff_info.buff_element) {
                    continue;
                }
            case 6:	// クリティカル率アップ
            case 7:	// クリティカルダメージアップ
            case 16: // 連撃(小)
            case 17: // 連撃(大)
                // 通常攻撃でも消費
                buff_list.splice(i, 1);
                break;
            default:
                break;
        }
        consume_kind.push(buff_info.buff_kind);
    };
}


// ターゲットリスト追加
function getTargetList(buff_info, place_no) {
    let target_list = [];
    switch (buff_info.range_area) {
        case 0: // 場
            break;
        case 1: // 敵単体
            break;
        case 2: // 敵全体
            break;
        case 3: // 味方単体
            break;
        case 4: // 味方前衛
            target_list = target_list.concat([0, 1, 2]);
            break;
        case 5: // 味方後衛
            target_list = target_list.concat([3, 4, 5]);
            break;
        case 6: // 味方全員
            target_list = target_list.concat([0, 1, 2, 3, 4, 5]);
            break;
        case 7: // 自分
            target_list.push(place_no);
            break;
        case 8: // 自分以外
            break;
        default:
            break;
    }
    return target_list;
}

// 行動順を取得
function sortActionSeq(turn_number) {
    let buff_seq = [];
    let attack_seq = [];

    // 前衛のスキルを取得
    $(`.turn${turn_number} .front_area select.unit_skill`).each(function (index, element) {
        let skill_id = $(element).val();
        if (skill_id == 0) {
            return true;
        }
        let skill_info = getSkillData(skill_id);
        let skill_data = {
            skill_info: skill_info,
            place_no: index
        };
        if (skill_info.attack_id) {
            attack_seq.push(skill_data);
        } else {
            buff_seq.push(skill_data);
        }
    });
    // バフとアタックの順序を結合
    return buff_seq.concat(attack_seq);
}