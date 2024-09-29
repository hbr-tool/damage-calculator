const styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);
let last_turn;
let turn_list = [];
let now_turn;
let battle_enemy_info;
let physical_name = ["", "斬", "突", "打"];
let element_name = ["無", "火", "氷", "雷", "光", "闇"];
let next_display;

const KB_NEXT_OD = 0;
const KB_NEXT_ACTION = 1;
const KB_NEXT_ACTION_OD = 2;

const KB_ABILIRY_BATTLE_START = 0;
const KB_ABILIRY_SELF_START = 1;
const KB_ABILIRY_ACTION_START = 2;
const KB_ABILIRY_ENEMY_START = 3;
const KB_ABILIRY_ADDITIONALTURN = 4;
const KB_ABILIRY_OD_START = 5;
const KB_ABILIRY_OTHER = 6;

const BUFF_ATTACKUP = 0; // 攻撃力アップ
const BUFF_ELEMENT_ATTACKUP = 1; // 属性アップ
const BUFF_MINDEYE = 2; // 心眼
const BUFF_DEFENSEDOWN = 3; // 防御ダウン
const BUFF_ELEMENT_DEFENSEDOWN = 4; // 属性防御ダウン
const BUFF_FRAGILE = 5; // 脆弱
const BUFF_CRITICALRATEUP = 6; // クリ率
const BUFF_CRITICALDAMAGEUP = 7; // クリダメ
const BUFF_ELEMENT_CRITICALRATEUP = 8; // 属性クリ率
const BUFF_ELEMENT_CRITICALDAMAGEUP = 9; // 属性クリダメ
const BUFF_CHARGE = 10;// チャージ
const BUFF_FIELD = 11; // フィールド
const BUFF_DAMAGERATEUP = 12; // 破壊率アップ
const BUFF_OVERDRIVEPOINTUP = 13; // OD増加
const BUFF_FIGHTINGSPIRIT = 14; // 闘志
const BUFF_MISFORTUNE = 15; // 厄
const BUFF_FUNNEL_SMALL = 16; // 連撃(小)
const BUFF_FUNNEL_LARGE = 17; // 連撃(大)
const BUFF_STRONG_BREAK = 18; // 強ブレイク
const BUFF_DEFENSEDP = 19; // DP防御ダウン
const BUFF_RESISTDOWN = 20; // 耐性ダウン
const BUFF_ETERNAL_DEFENSEDOWN = 21; // 永続防御力ダウン
const BUFF_ELEMENT_ETERNAL_DEFENSEDOWN = 22; // 永続属性防御ダウン
const BUFF_HEALSP = 23; // SP増加
const BUFF_RECOIL = 24; // 行動不能
const BUFF_PROVOKE = 25; // 挑発
const BUFF_ADDITIONALTURN = 26 // 追加ターン
const BUFF_COVER = 27; // 注目
const BUFF_GIVEATTACKBUFFUP = 28; // バフ強化
const BUFF_GIVEDEBUFFUP = 29; // デバフ強化
const BUFF_ARROWCHERRYBLOSSOMS = 30; // 桜花の矢
const BUFF_ETERNAL_OARH = 31; // 永遠なる誓い
const BUFF_EX_DOUBLE = 32; // EXスキル連続発動
const BUFF_BABIED = 33; // オギャり
const BUFF_MORALE = 34; // 士気
const BUFF_ABILITY_FUNNEL_SMALL = 116; // アビリティ連撃(小)
const BUFF_ABILITY_FUNNEL_LARGE = 117; // アビリティ連撃(大)

const RANGE_FILED = 0; // 場
const RANGE_ENEMY_UNIT = 1; // 敵単体
const RANGE_ENEMY_ALL = 2; // 敵全体
const RANGE_ALLY_UNIT = 3; // 味方単体
const RANGE_ALLY_FRONT = 4; // 味方前衛
const RANGE_ALLY_BACK = 5; // 味方後衛
const RANGE_ALLY_ALL = 6; // 味方全員
const RANGE_SELF = 7; // 自分
const RANGE_SELF_OTHER = 8; // 自分以外
const RANGE_SELF_AND_UNIT = 9; // 自分と味方単体

const BUFF_FUNNEL_LIST = [BUFF_FUNNEL_SMALL, BUFF_FUNNEL_LARGE, BUFF_ABILITY_FUNNEL_SMALL, BUFF_ABILITY_FUNNEL_LARGE];
const SINGLE_BUFF_LIST = [BUFF_CHARGE, BUFF_RECOIL, BUFF_ARROWCHERRYBLOSSOMS, BUFF_ETERNAL_OARH, BUFF_EX_DOUBLE, BUFF_BABIED];
// 貫通クリティカル
const PENETRATION_ATTACK_LIST = [84, 135, 137, 156];

class turn_data {
    constructor() {
        this.turn_number = 0;
        this.over_drive_turn = 0;
        this.over_drive_max_turn = 0;
        this.additional_turn = false;
        this.enemy_debuff_list = [];
        this.unit_list = [];
        this.over_drive_gauge = 0;
        this.add_over_drive_gauge = 0;
        this.enemy_count = 1;
        this.fg_action = false;
        this.front_sp_add = 0;
        this.back_sp_add = 0;
        this.step_turn = 0;
        this.step_over_drive_down = 0;
        this.step_sp_down = 0;
    }

    // 0:先打ちOD,1:通常戦闘,2:後打ちOD,3:追加ターン
    turnProceed(kb_next) {
        this.enemy_debuff_list.sort((a, b) => a.buff_kind - b.buff_kind);
        if (kb_next == KB_NEXT_ACTION) {
            // オーバードライブ
            if (this.over_drive_max_turn > 0) {
                this.over_drive_turn++;
                $.each(this.unit_list, function (index, unit) {
                    if (!unit.blank) {
                        unit.unitOverDriveTurnProceed();
                    }
                });
                if (this.over_drive_max_turn < this.over_drive_turn) {
                    // オーバードライブ終了
                    this.over_drive_max_turn = 0;
                    this.over_drive_turn = 0;
                    if (this.fg_action) {
                        this.nextTurn();
                    }
                }
            } else {
                this.nextTurn();
            }
        } else {
            // OD
            this.over_drive_turn = 1;
            let over_drive_level = Math.floor(this.over_drive_gauge / 100)
            this.startOverDrive(over_drive_level);
            this.over_drive_max_turn = over_drive_level;
            this.over_drive_gauge = 0;
            this.add_over_drive_gauge = 0;
            if (kb_next == KB_NEXT_ACTION_OD) {
                // 行動開始＋OD発動
                this.fg_action = true;
                $.each(this.unit_list, function (index, unit) {
                    if (!unit.blank) {
                        unit.unitOverDriveTurnProceed();
                    }
                });
            } else if (kb_next == KB_NEXT_OD) {
                // OD発動
                this.fg_action = false;
            }
        }
    }
    nextTurn() {
        let self = this;
        // 通常進行
        $.each(this.unit_list, function (index, unit) {
            if (!unit.blank) {
                unit.unitTurnProceed(self);
            }
        });
        this.turn_number++;
        this.fg_action = false;
        this.abilityAction(KB_ABILIRY_SELF_START);
        if (this.turn_number % this.step_turn == 0 && this.over_drive_gauge > 0) {
            this.over_drive_gauge += this.step_over_drive_down;
            if (this.over_drive_gauge < 0) {
                this.over_drive_gauge = 0;
            }
        }
        // 敵のデバフ消費
        this.debuffConsumption();
    }
    unitSort() {
        this.unit_list.sort((a, b) => a.place_no - b.place_no);
    }
    getTurnNumber() {
        const defalt_turn = "ターン" + this.turn_number;
        // 追加ターン
        if (this.additional_turn) {
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
    startOverDrive(over_drive_level) {
        let sp_list = [0, 5, 12, 20];
        $.each(this.unit_list, function (index, unit) {
            if (!unit.blank) {
                unit.sp += sp_list[over_drive_level];
            }
        });
    }
    debuffConsumption() {
        for (let i = this.enemy_debuff_list.length - 1; i >= 0; i--) {
            let debuff = this.enemy_debuff_list[i];
            if (debuff.rest_turn == 1) {
                this.enemy_debuff_list.splice(i, 1);
            } else {
                debuff.rest_turn -= 1;
            }
        }
    }
    abilityAction(action_kbn) {
        const self = this;
        $.each(this.unit_list, function (index, unit) {
            if (unit.blank) {
                return true;
            }
            let action_list = [];
            switch (action_kbn) {
                case KB_ABILIRY_BATTLE_START: // 戦闘開始時
                    action_list = unit.ability_battle_start;
                    break;
                case KB_ABILIRY_SELF_START: // 自分のターン開始時
                    action_list = unit.ability_self_start;
                    break;
                case KB_ABILIRY_ACTION_START: // 行動開始時
                    action_list = unit.ability_action_start;
                    break;
                case KB_ABILIRY_ENEMY_START: // 敵のターン開始時
                    action_list = unit.ability_enemy_start;
                    break;
                case KB_ABILIRY_ADDITIONALTURN: // 追加ターン
                    action_list = unit.ability_additional_turn;
                    break;
                case KB_ABILIRY_OD_START: // オーバードライブ開始時
                    action_list = unit.ability_over_drive;
                    break;
                case KB_ABILIRY_OTHER: // その他
                    action_list = unit.ability_other;
                    break;
            }
            $.each(action_list, function (index, ability) {
                // 前衛
                if (ability.activation_place == 1 && unit.place_no >= 3) {
                    return true;
                }
                // 後衛
                if (ability.activation_place == 2 && unit.place_no < 3) {
                    return true;
                }
                let target_list = [];
                switch (ability.ability_target) {
                    case 1: // 自分
                        target_list = [unit.place_no];
                        break;
                    case 2: // 味方前衛
                        target_list = [0, 1, 2];
                        break;
                    case 3: // 味方後衛
                        target_list = [3, 4, 5];
                        break;
                    case 4: // 味方全員
                        target_list = [0, 1, 2, 3, 4, 5];
                        break;
                }
                let buff;
                switch (ability.effect_type) {
                    case 6: // 連撃数アップ
                        buff = new buff_data();
                        buff.buff_kind = ability.effect_size == 40 ? BUFF_ABILITY_FUNNEL_LARGE : BUFF_ABILITY_FUNNEL_SMALL;
                        buff.buff_element = 0;
                        buff.effect_size = ability.effect_size == 40 ? 3 : 5;
                        buff.rest_turn = -1;
                        unit.buff_list.push(buff);
                        break;
                    case 12: // SP回復
                        $.each(target_list, function (index, target_no) {
                            let unit_data = getUnitData(self, target_no);
                            if (unit_data.sp < 20) {
                                switch (ability.ability_id) {
                                    case 1109: // 吉報
                                    case 1119: // 旺盛
                                        unit_data.add_sp += ability.effect_size;
                                        break;
                                    case 1112: // 好機
                                        if (unit_data.sp <= 3) {
                                            unit_data.sp += ability.effect_size;
                                        }
                                        break;
                                    case 1118: // 充填
                                        // チャージ存在チェック
                                        if (checkBuffExist(unit_data.buff_list, BUFF_CHARGE)) {
                                            unit_data.sp += ability.effect_size;
                                        }
                                        break;
                                    case 1111: // みなぎる士気
                                        let exist_list = unit_data.buff_list.filter(function (buff_info) {
                                            return buff_info.buff_kind == BUFF_MORALE;
                                        });
                                        if (exist_list.length > 0) {
                                            if (exist_list[0].lv >= 6) {
                                                unit_data.sp += ability.effect_size;
                                            }
                                        }
                                        break;
                                    case 1204: // エンゲージリンク
                                        // 永遠なる誓いチェック
                                        if (checkBuffExist(unit_data.buff_list, BUFF_ETERNAL_OARH)) {
                                            unit_data.sp += ability.effect_size;
                                        }
                                        break;
                                    default:
                                        unit_data.sp += ability.effect_size;
                                        break;
                                }
                                if (unit_data.sp > 20) {
                                    unit_data.sp = 20
                                }
                            }
                        });
                        break;
                    case 14: // ODアップ
                        self.over_drive_gauge += ability.effect_size;
                        break;
                    case 23: // 桜花の矢
                        buff = new buff_data();
                        buff.buff_kind = BUFF_ARROWCHERRYBLOSSOMS;
                        buff.buff_element = 0;
                        buff.rest_turn = -1;
                        buff.buff_name = ability.ability_name
                        unit.buff_list.push(buff);
                        break;
                    case 8: // チャージ
                        buff = new buff_data();
                        buff.buff_kind = BUFF_CHARGE;
                        buff.buff_element = 0;
                        buff.rest_turn = -1;
                        buff.buff_name = ability.ability_name
                        unit.buff_list.push(buff);
                        break;
                }
            });
        });
    }
}

// アビリティ存在チェック
function checkAbilityExist(ability_list, ability_id) {
    let exist_list = ability_list.filter(function (ability_info) {
        return ability_info.ability_id == ability_id;
    });
    return exist_list.length > 0;
}

// バフ存在チェック
function checkBuffExist(buff_list, buff_kind) {
    let exist_list = buff_list.filter(function (buff_info) {
        return buff_info.buff_kind == buff_kind;
    });
    return exist_list.length > 0;
}

// メンバー存在チェック
function checkMember(unit_list, troops) {
    let member_list = unit_list.filter(function (unit_info) {
        if (unit_info.style) {
            let chara_info = getCharaData(unit_info.style.style_info.chara_id);
            return chara_info.troops == troops;
        }
        return false;
    });
    return member_list.length;
}

class unit_data {
    constructor() {
        this.place_no = 99;
        this.sp = 1;
        this.add_sp = 0;
        this.sp_cost = 0;
        this.buff_list = [];
        this.additional_turn = false;
        this.unit = null;
        this.normal_attack_element = 0;
        this.earring_effect_size = 0;
        this.skill_list = [];
        this.blank = false;
        this.first_use = [];
        this.buff_target_chara_id = null;
        this.buff_effect_select_type = 0;
        this.ability_battle_start = [];
        this.ability_self_start = [];
        this.ability_action_start = [];
        this.ability_enemy_start = [];
        this.ability_additional_turn = [];
        this.ability_over_drive = [];
        this.ability_other = [];
        this.next_turn_min_sp = -1;
    }

    unitTurnProceed(turn_data) {
        this.buffSort();
        if (this.next_turn_min_sp > 0) {
            if (this.next_turn_min_sp > this.sp) {
                this.sp = this.next_turn_min_sp;
                this.next_turn_min_sp = -1
            }
        }
        if (this.sp < 20) {
            this.sp += 2;
            if (this.place_no < 3) {
                this.sp += turn_data.front_sp_add;
            } else {
                this.sp += turn_data.back_sp_add;
            }
            if ((turn_data.turn_number + 1) % turn_data.step_turn == 0) {
                this.sp += turn_data.step_sp_down;
            }
            if (this.sp > 20) {
                this.sp = 20
            }
        }

        for (let i = this.buff_list.length - 1; i >= 0; i--) {
            let buff = this.buff_list[i];
            if (buff.rest_turn == 1) {
                this.buff_list.splice(i, 1);
            } else {
                buff.rest_turn -= 1;
            }
        }
    }
    unitOverDriveTurnProceed() {
        this.buffSort();
        for (let i = this.buff_list.length - 1; i >= 0; i--) {
            let buff_info = this.buff_list[i];
            // 星屑の航路/星屑の航路+/バウンシー・ブルーミー
            if (buff_info.skill_id == 67 || buff_info.skill_id == 491 || buff_info.skill_id == 523) {
                if (buff_info.rest_turn == 1) {
                    this.buff_list.splice(i, 1);
                } else {
                    buff_info.rest_turn -= 1;
                }
            }
        }
    }
    buffSort() {
        this.buff_list.sort((a, b) => {
            if (a.buff_kind === b.buff_kind) {
                return a.effect_size - b.effect_size;
            }
            return a.buff_kind - b.buff_kind;
        });
    }
    payCost() {
        this.sp -= this.sp_cost;
        this.sp_cost = 0;
    }
    getEarringEffectSize(hit_count) {
        // ドライブ
        if (this.earring_effect_size != 0) {
            hit_count = hit_count < 1 ? 1 : hit_count;
            hit_count = hit_count > 10 ? 10 : hit_count;
            return (this.earring_effect_size - ((this.earring_effect_size - 5) / 9 * (10 - hit_count)));
        }
        return 0;
    }
    getfunnelList() {
        let ret = [];
        let funnel_list = this.buff_list.filter(function (buff_info) {
            return BUFF_FUNNEL_LIST.includes(buff_info.buff_kind);
        });
        let ability_count = 0;
        $.each(funnel_list, function (index, buff_info) {
            let effect_size;
            let effect_count;
            let effect_unit;
            if (buff_info.buff_kind == BUFF_FUNNEL_SMALL || buff_info.buff_kind == BUFF_ABILITY_FUNNEL_SMALL) {
                effect_count = buff_info.effect_size;
                effect_unit = 10
            } else {
                effect_count = buff_info.effect_size;
                effect_unit = 40
            }
            if (buff_info.buff_kind == BUFF_ABILITY_FUNNEL_LARGE || buff_info.buff_kind == BUFF_ABILITY_FUNNEL_SMALL) {
                ability_count++
            }
            effect_size = effect_unit * effect_unit;
            ret.push({ "effect_count": effect_count, "effect_unit": effect_unit, "effect_size": effect_size });
        });
        // effect_sizeで降順にソート
        ret.sort(function (a, b) {
            return b.effect_size - a.effect_size;
        });

        let consume = 2;
        if (checkBuffExist(this.buff_list, BUFF_EX_DOUBLE)) {
            consume = 4;
        }
        // 上位の要素を取得       
        let top_two = ret.slice(0, consume + ability_count);

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
        this.skill_id = -1;
        this.buff_name = null;
        this.lv = 0;
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
        localStorage.setItem("enemy_class", enemy_class);
        localStorage.setItem("enemy_list", "1");
        createEnemyList(enemy_class);
    });
    $("#enemy_list").on("change", function (event) {
        localStorage.setItem("enemy_list", $(this).val());
        setEnemyStatus();
    });
    $('.enemy_type_value').on('input', function () {
        if (!isNaN(value)) {
            let value = $(this).val().replace(/[^\d]/g, '');
            let int_value = parseInt(value, 10);
            if (int_value < 0) {
                int_value = 0;
            } else if (int_value > 999) {
                int_value = 999;
            }
            $(this).val(int_value);
        }
    });
    $('.enemy_type_value').on('blur', function () {
        let value = parseInt($(this).val(), 10);
        if (isNaN(value)) {
            $(this).val('0');
        }
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
    // ソート順
    $("#next_display").on("change", function (event) {
        localStorage.setItem("next_display", $(this).val());
    });
    // 上書き確認
    $("#is_overwrite").on("change", function (event) {
        localStorage.setItem("is_overwrite", $(this).prop("checked"));
    });
    // 戦闘開始ボタンクリック
    $(".battle_start").on("click", function (event) {
        if ($("#is_overwrite").prop("checked")) {
            if ($("#battle_area").css("visibility") !== "hidden" && !confirm("現在の結果が消えますが、よろしいですか？")) {
                return;
            }
        }
        // 初期化
        last_turn = 0;
        next_display = $("#next_display").val();
        $("#battle_area").html("");
        turn_list = [];
        battle_enemy_info = getEnemyInfo();
        for (let i = 1; i <= 3; i++) {
            battle_enemy_info[`physical_${i}`] = Number($(`#enemy_physical_${i}`).val());
        }
        for (let i = 0; i <= 5; i++) {
            battle_enemy_info[`element_${i}`] = Number($(`#enemy_element_${i}`).val());
        }
        procBattleStart();
    });
    // 行動選択変更
    $(document).on("change", "select.action_select", function (event) {
        if ($(this).val() == "0") {
            $(`.turn${last_turn} .front_area select.unit_skill`).prop("selectedIndex", 0);
            $(`.turn${last_turn} .back_area select.unit_skill`).prop("selectedIndex", 0);
            $(`.turn${last_turn} select.unit_skill`).trigger("change");
            $(`.turn${last_turn} .front_area select.unit_skill`).prop("disabled", true);
            $(`.turn${last_turn} .back_area select.unit_skill`).prop("disabled", true);
        } else {
            $(`.turn${last_turn} .front_area select.unit_skill`).prop("disabled", false);
            $(`.turn${last_turn} .back_area select.unit_skill`).prop("disabled", false);
            setOverDrive();
        }
    });
    // 敵カウント変更
    $(document).on("change", "select.enemy_count", function (event) {
        // ODゲージを設定
        setOverDrive();
    });
    // スキル変更
    $(document).on("change", "select.unit_skill", function (event) {
        // スキル変更処理
        selectUnitSkill($(this));
    });
    // 行動開始
    $(document).on("click", ".next_turn", function (event) {
        // 前ターンを不能
        $(`.turn${last_turn} select.unit_skill`).off("click");
        $(`.turn${last_turn} .unit_select`).off("click");
        $(`.turn${last_turn} .icon_list`).off("click");
        $(`.turn${last_turn} .enemy_icon_list`).off("click");
        $(`.turn${last_turn} select.unit_skill`).prop("disabled", true);
        $(`.turn${last_turn} select.action_select`).prop("disabled", true);
        $(".unit_selected").removeClass("unit_selected");
        let kb_next = $(`.turn${last_turn} select.action_select`).val()
        let turn_data = deepClone(now_turn);
        if (kb_next != KB_NEXT_OD) {
            startAction(turn_data, last_turn);
        }
        // 次ターンを追加
        proceedTurn(turn_data, kb_next);
    });

    // ターンを戻す
    $(document).on("click", ".return_turn", function (event) {
        // 現ターンのイベント削除
        $(`.turn${last_turn} select.unit_skill`).off("click");
        $(`.turn${last_turn} .unit_select`).off("click");

        // 前ターンを削除
        function removeTurnsAfter(turn_number) {
            // 選択したターン数より大きいターンの要素を取得し、削除
            $(`#battle_area .turn`).filter(function () {
                // クラス名からターン数を抽出
                const turn_class = $(this).attr('class').match(/turn(\d+)/);
                return turn_class && parseInt(turn_class[1]) > turn_number;
            }).remove();

            // 指定されたnumber以上の要素を削除
            turn_list = turn_list.slice(0, turn_number);
        }
        last_turn = $(this).data("trun_number");
        removeTurnsAfter(last_turn);
        now_turn = turn_list[turn_list.length - 1];

        if ($(`.turn${last_turn} select.action_select`).val() != KB_NEXT_OD) {
            $(`.turn${last_turn} select.unit_skill`).prop("disabled", false);
        }
        $(`.turn${last_turn} select.action_select`).prop("disabled", false);
        addUnitEvent();
        setTurnButton();
    });
}

// スキル変更処理
function selectUnitSkill(select) {
    const skill_id = Number(select.find('option:selected').val());
    const index = select.index(`.turn${last_turn} select.unit_skill`);
    const unit_data = getUnitData(now_turn, index);

    function setupModalIcons() {
        $(`.turn${last_turn} img.unit_style`).each((index, value) => {
            $(`#select_target${index}`).attr("src", $(value).attr("src")).data("value", index);
        });
    }

    function showModalSelectTarget() {
        return new Promise((resolve) => {
            handleModalResult = resolve;
            setupModalIcons();

            MicroModal.show('modal_select_target', {
                onClose: (modal) => {
                    if ($(modal).data('value') === undefined) {
                        handleModalResult(null);
                    }
                    $(modal).removeData('value');
                }
            });

            const handleClick = function () {
                const value = $(this).data('value');
                $('#modal_select_target').data('value', value);
                MicroModal.close('modal_select_target');
                resolve(value);
                $('.select_target').off('click', handleClick);
            };

            $('.select_target').on('click', handleClick);
        });
    }

    function showModalSelectEffect() {
        return new Promise((resolve) => {
            handleModalResult = resolve;

            MicroModal.show('modal_select_effect', {
                onClose: (modal) => {
                    if ($(modal).data('value') === undefined) {
                        handleModalResult(null);
                    }
                    $(modal).removeData('value');
                }
            });

            const handleClick = function () {
                const value = $(this).data('value');
                $('#modal_select_effect').data('value', value);
                MicroModal.close('modal_select_effect');
                resolve(value);
                $('.effect_button').off('click', handleClick);
            };

            $('.effect_button').on('click', handleClick);
        });
    }

    async function handleTargetSelection(buff_list) {
        if (buff_list.some(buff => buff.range_area == RANGE_ALLY_UNIT || buff.range_area == RANGE_SELF_AND_UNIT)) {
            const target_no = await showModalSelectTarget();
            if (!target_no && target_no !== 0) {
                select.prop("selectedIndex", 0);
                return false;
            }
            const target_unit_data = getUnitData(now_turn, target_no);
            unit_data.buff_target_chara_id = target_unit_data.style.style_info.chara_id;
        }
        return true;
    }

    async function handleEffectSelection(skill_id) {
        let effect_type = 0;
        switch (skill_id) {
            case 50: // トリック・カノン
                effect_type = 1;
                break;
            case 357: // 次の主役はあなた
                effect_type = 2;
                break;
            case 415: // 哀のスノードロップ
            case 405: // 夢視るデザイア
                effect_type = 3;
                break;
            case 22: // ブレスショット
            case 33: // 闘気斬
            case 113: // ヴィヴィットシュート
            case 120: // リバースショット
            case 132: // 砕華
            case 190: // ゲインカノン
            case 212: // 粛正
            case 239: // キャンディ・バースト
            case 259: // 不純なアリア
            case 309: // フォーチュンスラッシュ
            case 324: // トランスペイン
            case 382: // エキゾーストノート
            case 397: // 春雷
            case 427: // ファンタズム
                effect_type = 4;
                break;
            case 496: // レッドラウンドイリュージョン
            case 498: // 浮き浮きサニー・ボマー
                effect_type = 5;
                break;
            default:
                break;
        }
        if (effect_type != 0) {
            for (let i = 1; i <= 5; i++) {
                if (i == effect_type) {
                    $(`#effect_type${i}`).addClass("active");
                } else {
                    $(`#effect_type${i}`).removeClass("active");
                }
            }
            const effect_select_type = await showModalSelectEffect();
            if (!effect_select_type && effect_select_type !== 0) {
                select.prop("selectedIndex", 0);
                return false;
            }
            unit_data.buff_effect_select_type = effect_select_type;
        }
        return true;
    }

    async function processSkillChange() {
        const buff_list = getBuffInfo(skill_id);
        const target_selected = await handleTargetSelection(buff_list);
        // if (!target_selected) return;
        const effect_selected = await handleEffectSelection(skill_id);
        // if (!effect_selected) return;

        setOverDrive();
        let sp_cost = select.find('option:selected').data("sp_cost");
        if (skill_id == 199 || skill_id == 518) {
            // コーシュカ・アルマータ、疾きこと風の如し
            sp_cost = unit_data.sp;
        } else if (skill_id == 496) {
            // レッドラウンドイリュージョン
            if (unit_data.buff_effect_select_type == 1) {
                sp_cost /= 2;
            }
        }

        updateSp(select.parent().find(".unit_sp"), sp_cost);
        updateAction(now_turn)
    }

    function updateSp(target, sp_cost) {
        unit_data.sp_cost = sp_cost;
        let unit_sp = unit_data.sp - sp_cost;
        $(target).text(getDispSp(unit_data));
        $(target).toggleClass("minus", unit_sp < 0);
    }

    processSkillChange();
}

// 行動制限
function updateAction(turn_data) {
    let is_over_drive = (turn_data.over_drive_gauge + turn_data.add_over_drive_gauge) >= 100;
    toggleItemVisibility($(`.turn${last_turn} select.action_select option[value='2']`), is_over_drive);
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
    $("#enemy_count").val(enemy_info.enemy_count);
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
function procBattleStart() {
    let turn_init = new turn_data();
    let unit_list = [];

    let init_sp_add = Number($("#init_sp_add").val());
    // スタイル情報を作成
    $.each(select_style_list, function (index, value) {
        if (index >= 6) {
            return false;
        }
        let unit = new unit_data();
        unit.place_no = index;
        if (value) {
            unit.sp = Number($("#init_sp_" + index).val());
            unit.sp += Number($("#chain_" + index).val()) + init_sp_add;
            unit.normal_attack_element = $("#bracelet_" + index).val();
            unit.earring_effect_size = Number($(`#earring_${index} option:selected`).val());
            unit.style = value;
            unit.skill_list = skill_list.filter(obj =>
                (obj.chara_id === value.style_info.chara_id || obj.chara_id === 0) &&
                (obj.style_id === value.style_info.style_id || obj.style_id === 0) &&
                obj.skill_active == 0
            );
            let limit = Number($("#limit_" + index).val());
            ["0", "00", "1", "3", "5", "10"].forEach(num => {
                if (value.style_info[`ability${num}`] && num <= limit) {
                    let ability_info = getAbilityInfo(value.style_info[`ability${num}`]);
                    switch (ability_info.activation_timing) {
                        case KB_ABILIRY_BATTLE_START: // 戦闘開始時
                            unit.ability_battle_start.push(ability_info);
                            break;
                        case KB_ABILIRY_SELF_START: // 自分のターン開始時
                            unit.ability_self_start.push(ability_info);
                            break;
                        case KB_ABILIRY_ACTION_START: // 行動開始時
                            unit.ability_action_start.push(ability_info);
                            break;
                        case KB_ABILIRY_ENEMY_START: // 敵ターン開始時
                            unit.ability_enemy_start.push(ability_info);
                            break;
                        case KB_ABILIRY_ADDITIONALTURN: // 追加ターン
                            unit.ability_additional_turn.push(ability_info);
                            break;
                        case KB_ABILIRY_OD_START: // オーバードライブ開始時
                            unit.ability_over_drive.push(ability_info);
                            break;
                        case KB_ABILIRY_OTHER: // その他
                            unit.ability_other.push(ability_info);
                            break;

                    }
                }
            });
        } else {
            unit.blank = true;
        }
        unit_list.push(unit);
    });

    // 初期設定を読み込み
    turn_init.over_drive_gauge = Number($("#init_over_drive").val());
    turn_init.front_sp_add = Number($("#front_sp_add").val());
    turn_init.back_sp_add = Number($("#back_sp_add").val());
    turn_init.step_turn = Number($("#step_turn").val());
    turn_init.step_over_drive_down = Number($("#step_over_drive_down").val());
    turn_init.step_sp_down = Number($("#step_sp_down").val());

    turn_init.enemy_count = Number($("#enemy_count").val());;
    turn_init.unit_list = unit_list;

    // 戦闘開始アビリティ
    turn_init.abilityAction(0);

    // 領域表示
    $("#battle_area").css("visibility", "visible");

    // ターンを進める
    proceedTurn(turn_init, 1);
}

// ターンを進める
function proceedTurn(turn_data, kb_next) {
    last_turn++;
    turn_data.unitSort();
    if (turn_data.additional_turn) {
        turn_data.abilityAction(KB_ABILIRY_ADDITIONALTURN);
    } else {
        turn_data.turnProceed(kb_next);
        if (kb_next == KB_NEXT_OD || kb_next == KB_NEXT_ACTION_OD) {
            turn_data.abilityAction(KB_ABILIRY_OD_START);
        } else {
            turn_data.abilityAction(KB_ABILIRY_ACTION_START);
        }
    }

    let turn = $('<div>').addClass(`turn turn${last_turn}`);
    let header_area = $('<div>').addClass("header_area");
    let header_left = $('<div>');
    let turn_number = $('<div>').text(turn_data.getTurnNumber()).addClass("turn_number");
    let enemy = $('<div>').addClass("left flex").append(
        $('<img>').attr("src", "icon/BtnEventBattleActive.webp").addClass("enemy_icon"),
        $("<select>").attr("id", `enemy_count_turn${last_turn}`).append(
            ...Array.from({ length: 3 }, (_, i) => $("<option>").val(i + 1).text(`×${i + 1}体`))
        ).val(turn_data.enemy_count).addClass("enemy_count"),
        createBuffIconList(turn_data.enemy_debuff_list, 5, 7).addClass("enemy_icon_list")
    );
    let over_drive = createOverDriveGauge(turn_data.over_drive_gauge);

    header_left.append(turn_number).append(enemy);
    header_area.append(header_left, over_drive);

    let party_member = $('<div>').addClass("party_member");
    let front_area = $('<div>').addClass("flex front_area");
    let back_area = $('<div>').addClass("flex back_area");

    turn_data.unitSort();
    $.each(turn_data.unit_list, function (index, unit) {
        const chara_div = $('<div>').addClass("unit_select");
        const img = $('<img>').data("chara_no", index).addClass("unit_style");
        const unit_div = $('<div>').addClass("flex");
        const skill_select = $('<select>').addClass("unit_skill");
        let sp_cost = 0;

        const createOptionText = (value) => {
            let text = value.skill_name;
            if (value.skill_name === "通常攻撃") {
                sp_cost = 0;
                text += `(${physical_name[value.attack_physical]}・${element_name[unit.normal_attack_element]})`;
            } else if (value.skill_name === "追撃") {
                sp_cost = 0;
                text += `(${physical_name[value.attack_physical]})`;
            } else if (value.attack_id) {
                sp_cost = getSpCost(turn_data, value, unit);
                text += `(${physical_name[value.attack_physical]}・${element_name[value.attack_element]}/${sp_cost})`;
            } else {
                sp_cost = getSpCost(turn_data, value, unit);
                text += `(${sp_cost})`;
            }
            return text;
        };

        const createSkillOption = (value) => {
            return $('<option>')
                .text(createOptionText(value))
                .val(value.skill_id)
                .data("sp_cost", sp_cost)
                .addClass(value.skill_name === "追撃" ? "back" : "front");
        };

        const appendUnitDetails = () => {
            const sp = $('<div>').text(getDispSp(unit)).addClass("unit_sp");
            if (unit.sp < 0) sp.addClass("minus");
            img.attr("src", `icon/${unit.style.style_info.image_url}`);
            unit_div.append($('<div>').append(img).append(sp));
            chara_div.append(unit_div);
        };

        const appendDefaultImg = () => {
            img.attr("src", "img/cross.png");
            chara_div.append(img);
        };

        const appendSkillOptions = () => {
            skill_select.append($('<option>').text("なし").val(0).addClass("back").data("sp_cost", 0));
            $.each(unit.skill_list, function (index, value) {
                skill_select.append(createSkillOption(value));
            });
        };

        const handleRecoil = () => {
            const recoil = unit.buff_list.filter((obj) => obj.buff_kind == 24);
            if (recoil.length > 0 || !unit.style || (turn_data.additional_turn && !unit.additional_turn)) {
                skill_select.css("visibility", "hidden");
            }
        };

        const appendBuffList = () => {
            if (unit.buff_list.length > 0) {
                unit_div.append(createBuffIconList(unit.buff_list, 3, index).addClass("icon_list"));
            }
        };

        const appendToArea = () => {
            if (unit.place_no < 3) {
                setFrontOptions(skill_select);
                front_area.append(chara_div);
            } else {
                setBackOptions(skill_select);
                back_area.append(chara_div);
            }
        };

        if (unit.style) {
            appendUnitDetails();
        } else {
            appendDefaultImg();
        }

        appendSkillOptions();
        appendBuffList();
        handleRecoil();
        chara_div.prepend(skill_select);
        appendToArea();

        unit.additional_turn = false;
    });

    const $div = $('<div>').append(
        $('<select>').addClass('action_select').append(
            turn_data.over_drive_gauge >= 100 ? $('<option>').val("0").text("OD発動") : null,
            $('<option>').val("1").text("行動開始").prop("selected", true),
            $('<option>').val("2").text("行動開始+OD")
        ),
        $('<div>').addClass('mx-auto w-[80px] mt-2').append(
            $('<input>').attr({ type: 'button', value: '次ターン' }).addClass('turn_button next_turn')
        ).append(
            $('<input>').attr({ type: 'button', value: 'ここに戻す' }).addClass('turn_button return_turn').data("trun_number", last_turn)
        )
    );
    back_area.append($div)

    party_member.append(front_area).append(back_area);
    let remark_area = $('<div>').addClass("remark_area");
    let remaek_text = $("<textarea>").addClass("remaek_text")
    remark_area.append(remaek_text);
    turn.append(header_area).append(party_member).append(remark_area);
    if (next_display == "1") {
        $("#battle_area").prepend(turn);
    } else {
        $("#battle_area").append(turn);
    }

    addUnitEvent();
    turn_data.additional_turn = false;
    turn_list.push(turn_data);
    now_turn = turn_data;

    setTurnButton();
    // ODゲージを設定
    setOverDrive();
    // 行動制限
    updateAction(now_turn);
}

// ターンボタン表示設定
function setTurnButton() {
    if (next_display == "1") {
        // 最初の要素のみ表示
        $('.next_turn:first').show();
        $('.next_turn:gt(0)').hide();
        // 最初の要素を非表示、以降の要素を表示
        $('.return_turn:first').hide();
        $('.return_turn:gt(0)').show();
    } else {
        // 最後の要素のみ表示
        $('.next_turn:last').show();
        $('.next_turn:not(:last)').hide();
        // 最後の要素を非表示、以前の要素を表示
        $('.return_turn:last').hide();
        $('.return_turn:not(:last)').show();
    }
}

// SP表示取得
function getDispSp(unit_data) {
    let unit_sp = unit_data.sp - unit_data.sp_cost;
    return unit_sp + (unit_data.add_sp > 0 ? ("+" + unit_data.add_sp) : "");;
}

// バフアイコンリスト
function createBuffIconList(buff_list, loop_limit, chara_index) {
    let div = $("<div>").addClass("scroll-container");
    let inner = $("<div>").addClass("scroll-content");
    $.each(buff_list, function (index, buff_info) {
        let img = getBuffIconImg(buff_info);
        img.addClass("unit_buff");
        inner.append(img)
    });

    let unit_buffs = inner.find(".unit_buff");
    if (unit_buffs.length > loop_limit * 2) {
        inner.addClass('scroll');

        // アイコンの数によってアニメーションの速度を調整
        const duration = unit_buffs.length * 0.5; // 例: アイコン数に応じて2秒ごとに1アイコンがスクロール

        // @keyframesを動的に生成
        const animationName = `scroll-${last_turn}-${chara_index}`;
        const translateXValue = unit_buffs.length * 24;
        const keyframes = `
      @keyframes ${animationName} {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-${translateXValue}px);
        }
      }
    `;
        // 既存の同名アニメーションを削除
        for (let i = 0; i < styleSheet.sheet.cssRules.length; i++) {
            if (styleSheet.sheet.cssRules[i].name === animationName) {
                styleSheet.sheet.deleteRule(i);
                break;
            }
        }
        // 新しいアニメーションを追加
        inner[0].style.animation = `${animationName} ${duration}s linear infinite`;
        styleSheet.sheet.insertRule(keyframes, styleSheet.sheet.cssRules.length);
        // 既存のunit_buffクラスのアイコンを複製して追加
        unit_buffs.each(function () {
            let cloned_icon = $(this).clone();
            inner.append(cloned_icon);
        });
    } else {
        inner.removeClass('scroll').addClass("flex-wrap");
    }

    div.append(inner);
    return div;
}

// バフアイコン取得
function getBuffIconImg(buff_info) {
    let img = $('<img>');
    let src = "img/";
    switch (buff_info.buff_kind) {
        case BUFF_ATTACKUP: // 攻撃力アップ
        case BUFF_ELEMENT_ATTACKUP: // 属性攻撃力アップ
            src += "IconBuffAttack";
            break;
        case BUFF_MINDEYE: // 心眼
            src += "IconMindEye";
            break;
        case BUFF_DEFENSEDOWN: // 防御力ダウン
        case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
            src += "IconBuffDefense";
            break;
        case BUFF_FRAGILE: // 脆弱
            src += "IconFragile";
            break;
        case BUFF_CRITICALRATEUP:	// クリティカル率アップ
        case BUFF_ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
            src += "IconCriticalRate";
            break;
        case BUFF_CRITICALDAMAGEUP:	// クリティカルダメージアップ
        case BUFF_ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
            src += "IconCriticalDamage";
            break;
        case BUFF_CHARGE: // チャージ
            src += "IconCharge";
            break;
        case BUFF_DAMAGERATEUP: // 破壊率アップ
            src += "IconDamageRate";
            break;
        case BUFF_FIGHTINGSPIRIT: // 闘志
            src += "IconFightingSpirit";
            break;
        case BUFF_MISFORTUNE: // 厄
            src += "IconMisfortune";
            break;
        case BUFF_FUNNEL_SMALL: // 連撃(小)
        case BUFF_ABILITY_FUNNEL_SMALL: // アビリティ連撃(小)
            src += "IconFunnelS";
            break;
        case BUFF_FUNNEL_LARGE: // 連撃(大)
        case BUFF_ABILITY_FUNNEL_LARGE: // アビリティ連撃(大)
            src += "IconFunnelL";
            break;
        case BUFF_DEFENSEDP: // DP防御ダウン
            src += "IconBuffDefenseDP";
            break;
        case BUFF_RESISTDOWN: // 耐性ダウン
            src += "IconResistElement";
            break;
        case BUFF_ETERNAL_DEFENSEDOWN: // 永続防御ダウン
        case BUFF_ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
            src += "IconBuffDefenseE";
            break;
        case BUFF_RECOIL: // 行動不能
            src += "IconRecoil";
            break;
        case BUFF_PROVOKE: // 挑発
            src += "IconTarget";
            break;
        case BUFF_COVER: // 注目
            src += "IconCover";
            break;
        case BUFF_GIVEATTACKBUFFUP: // バフ強化
            src += "IconGiveAttackBuffUp";
            break;
        case BUFF_GIVEDEBUFFUP: // デバフ強化
            src += "IconGiveDebuffUp";
            break;
        case BUFF_ARROWCHERRYBLOSSOMS: // 桜花の矢
            src += "IconArrowCherryBlossoms";
            break;
        case BUFF_ETERNAL_OARH: // 永遠なる誓い
            src += "iconEternalOath";
            break;
        case BUFF_EX_DOUBLE: // EXスキル連続使用
            src += "IconDoubleActionExtraSkill";
            break;
        case BUFF_BABIED: // オギャり
            src += "IconBabied";
            break;
        case BUFF_MORALE: // 士気
            src += "IconMorale";
            break;
    }
    if (buff_info.buff_element != 0) {
        src += buff_info.buff_element;
    }
    src += ".webp";
    img.attr("src", src);
    return img;
}

// ODゲージ生成
function createOverDriveGauge(over_drive_gauge) {
    let over_drive = $('<div>').addClass("flex");
    let over_drive_label = $('<label>').addClass("od_text");
    let over_drive_img = $('<div>').append($('<img>').attr("src", "img/FrameOverdriveGaugeR.webp").addClass("od_icon")).addClass("inc_od_icon");
    if (over_drive_gauge >= 100) {
        let gauge = Math.floor(over_drive_gauge / 100);
        over_drive_img.append($('<img>').attr("src", `img/ButtonOverdrive${gauge}Default.webp`).addClass("od_number"));
    }
    over_drive.append(over_drive_label).append(over_drive_img);
    return over_drive;
}

// ODテキスト生成
function setOverDrive() {
    let turn_data = now_turn;
    let over_drive_gauge = turn_data.over_drive_gauge;
    if ($(`.turn${last_turn} select.action_select`).val() == "0") {
        over_drive_gauge = 0;
    } else {
        let enemy_count = Number($(`#enemy_count_turn${last_turn}`).val());
        let add_over_drive_gauge = getOverDrive(last_turn, enemy_count);
        turn_data.add_over_drive_gauge = add_over_drive_gauge;
        over_drive_gauge += add_over_drive_gauge;
        over_drive_gauge = over_drive_gauge > 300 ? 300 : over_drive_gauge;
    }
    let span_before = $("<span>").text(`${(turn_data.over_drive_gauge).toFixed(2)}%`);
    if (turn_data.over_drive_gauge < 0) {
        span_before.addClass("od_minus");
    }
    let span_after = $("<span>").text(`${over_drive_gauge.toFixed(2)}%`);
    if (over_drive_gauge < 0) {
        span_after.addClass("od_minus");
    }
    $(`.turn${last_turn} .od_text`).html("");
    $(`.turn${last_turn} .od_text`).append(span_before).append('<br>⇒').append(span_after);
}

// ユニットイベント
function addUnitEvent() {
    let first_click = null;
    let first_click_index = -1;

    // ユニット交換イベントの伝播を止める
    $(`.turn${last_turn} select.unit_skill`).on("click", function (event) {
        event.stopPropagation();
    });

    $(`.turn${last_turn} .unit_select`).on("click", function (event) {
        // クリックされた要素を取得
        let clicked_element = $(this);
        let index = $(this).parent().index() * 3 + $(this).index();
        let unit_data = getUnitData(now_turn, index);
        if (!unit_data || unit_data.blank || now_turn.additional_turn) {
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

            let first_click_unit_data = getUnitData(now_turn, first_click_index);
            first_click_unit_data.place_no = index;
            unit_data.place_no = first_click_index;

            // 前衛と後衛が入れ替わった場合
            if (index >= 0 && index <= 2 && first_click_index >= 3 && first_click_index <= 5) {
                setFrontOptions(first_click.find("select"));
                setBackOptions(second_click.find("select"));
                unit_data.sp_cost = 0;
                let second_sp = second_click.find(".unit_sp");
                second_sp.text(getDispSp(unit_data));
                if (unit_data.sp > 0) {
                    second_sp.removeClass("minus");
                }
            }
            // 後衛と前衛が入れ替わった場合
            if (index >= 3 && index <= 5 && first_click_index >= 0 && first_click_index <= 2) {
                setFrontOptions(second_click.find("select"));
                setBackOptions(first_click.find("select"));
                first_click_unit_data.sp_cost = 0;
                let first_sp = first_click.find(".unit_sp");
                first_sp.text(getDispSp(first_click_unit_data));
                if (first_click_unit_data.sp > 0) {
                    first_sp.removeClass("minus");
                }
            }
            // 要素を交換
            swapElements(first_click, second_click)

            // 最初にクリックした要素をリセット
            first_click = null;
            first_click_index = -1;
            // OD再表示
            setOverDrive(now_turn);
        }
    });

    // バフ詳細表示
    function showBuffList(event, buff_list) {
        let buff_detail = $("#buff_detail");
        buff_detail.html("");
        $.each(buff_list, function (index, buff_info) {
            let div = $("<div>").addClass("flex detail_line_height");
            let img = getBuffIconImg(buff_info).addClass("icon_buff_detail");;
            div.append(img);
            let label = $("<label>");
            let buff_kind_name = getBuffKindName(buff_info);
            let turn = buff_info.rest_turn < 0 ? "∞" : buff_info.rest_turn;
            switch (buff_info.buff_kind) {
                case BUFF_MORALE: // 士気
                    label.html(`${buff_kind_name}<br>${buff_info.buff_name}(Lv${buff_info.lv})`);
                    break;
                default:
                    label.html(`${buff_kind_name}<br>${buff_info.buff_name}(残りターン${turn})`);
                    break;
            }
            buff_detail.append(div.append(label));
        });
        MicroModal.show('modal_buff_detail_list');
        event.stopPropagation();
    }
    // デバフリストの表示    
    $(`.turn${last_turn} .enemy_icon_list`).on("click", function (event) {
        showBuffList(event, now_turn.enemy_debuff_list);
    });
    // バフリストの表示    
    $(`.turn${last_turn} .icon_list`).on("click", function (event) {
        let index = $(this).parent().parent().index();
        let unit_data = getUnitData(now_turn, index);
        if (!unit_data || unit_data.blank || now_turn.additional_turn) {
            return;
        }
        showBuffList(event, unit_data.buff_list);
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
function getUnitData(turn_data, index) {
    let unit_list = turn_data.unit_list;
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
    const filtered_attack = skill_attack.filter((obj) => obj.attack_id == attack_id);
    return filtered_attack.length > 0 ? filtered_attack[0] : undefined;
}
// バフ情報取得
function getBuffInfo(skill_id) {
    const filtered_buff = skill_buff.filter((obj) => obj.skill_id == skill_id);
    return filtered_buff;
}
// アビリティ情報取得
function getAbilityInfo(ability_id) {
    const filtered_ability = ability_list.filter((obj) => obj.ability_id == ability_id);
    return filtered_ability.length > 0 ? filtered_ability[0] : undefined;
}

// スキル設定
function setFrontOptions(select) {
    toggleItemVisibility(select.find("option.front"), true);
    toggleItemVisibility(select.find("option.back"), false);
    select.find("option.front:first").prop('selected', true);
}
function setBackOptions(select) {
    toggleItemVisibility(select.find("option.front"), false);
    toggleItemVisibility(select.find("option.back"), true);
    select.find("option:not(.front):first").prop('selected', true);
}

// 行動開始
function startAction(turn_data, turn_number) {
    let seq = sortActionSeq(turn_number);
    // 攻撃後に付与されるバフ種
    const ATTACK_AFTER_LIST = [BUFF_ATTACKUP, BUFF_ELEMENT_ATTACKUP, BUFF_CRITICALRATEUP, BUFF_CRITICALDAMAGEUP, BUFF_ELEMENT_CRITICALRATEUP,
        BUFF_ELEMENT_CRITICALDAMAGEUP, BUFF_CHARGE, BUFF_DAMAGERATEUP];
    $.each(seq, function (index, skill_data) {
        let skill_info = skill_data.skill_info;
        let unit_data = getUnitData(turn_data, skill_data.place_no);
        let attack_info;

        let buff_list = getBuffInfo(skill_info.skill_id);
        for (let i = 0; i < buff_list.length; i++) {
            let buff_info = buff_list[i];
            if (!(buff_info.skill_attack1 == 999 && ATTACK_AFTER_LIST.includes(buff_info.buff_kind))) {
                addBuffUnit(turn_data, buff_info, skill_data.place_no, unit_data);
            }
        }
        if (skill_info.skill_name == "通常攻撃") {
            attack_info = { "attack_id": 0, "attack_element": unit_data.normal_attack_element };
        } else if (skill_info.attack_id) {
            attack_info = getAttackInfo(skill_info.attack_id);
        }

        if (attack_info) {
            consumeBuffUnit(unit_data.buff_list, attack_info, skill_info);
        }

        // 攻撃後にバフを付与
        for (let i = 0; i < buff_list.length; i++) {
            let buff_info = buff_list[i];
            if (buff_info.skill_attack1 == 999 && ATTACK_AFTER_LIST.includes(buff_info.buff_kind)) {
                addBuffUnit(turn_data, buff_info, skill_data.place_no, unit_data);
            }
        }
        origin(turn_data, skill_info, unit_data);
        unit_data.payCost();
    });

    turn_data.over_drive_gauge += turn_data.add_over_drive_gauge;
    if (turn_data.over_drive_gauge > 300) {
        turn_data.over_drive_gauge = 300;
    }
}

// OD上昇量取得
function getOverDrive(turn_number, enemy_count) {
    let seq = sortActionSeq(turn_number);
    let od_plus = 0;
    let temp_turn = deepClone(now_turn);
    $.each(seq, function (index, skill_data) {
        let skill_info = skill_data.skill_info;
        let unit_data = getUnitData(temp_turn, skill_data.place_no);
        let buff_list = getBuffInfo(skill_info.skill_id);
        let attack_info = getAttackInfo(skill_info.attack_id);
        let unit_od_plus = 0;

        let correction = 1;
        let badies = 0;
        // オギャり状態
        if (checkBuffExist(unit_data.buff_list, BUFF_BABIED)) {
            badies += 20;
        }
        let earring = 0;
        if (skill_info.attack_id) {
            earring = unit_data.getEarringEffectSize(attack_info.hit_count);
        }

        buff_list.forEach(function (buff_info) {
            // OD増加
            if (buff_info.buff_kind == 13) {
                // 哀のスノードロップBREAKなし
                if (buff_info.buff_id == 123 && unit_data.buff_effect_select_type == 0) {
                    return true;
                }
                // サービス・エースが可変
                if (skill_info.attack_id) {
                    correction = 1 + (badies + earring) / 100;
                } else {
                    correction = 1 + badies / 100;
                }
                unit_od_plus += Math.floor(buff_info.max_power * correction * 100) / 100;
            }
            // 連撃のみとオギャり状態処理
            if (BUFF_FUNNEL_LIST.includes(buff_info.buff_kind) || buff_info.buff_kind == BUFF_BABIED) {
                addBuffUnit(temp_turn, buff_info, skill_data.place_no, unit_data);
            }
        });
        let funnel_list = unit_data.getfunnelList();
        let physical = getCharaData(unit_data.style.style_info.chara_id).physical;

        if (skill_info.skill_name == "通常攻撃") {
            if (isResist(physical, unit_data.normal_attack_element, skill_info.attack_id)) {
                correction = 1 + badies / 100;
                let hit_od = Math.floor(2.5 * correction * 100) / 100;
                unit_od_plus += hit_od * (3 + funnel_list.length);
            }
        } else if (skill_info.attack_id) {
            if (isResist(physical, attack_info.attack_element, skill_info.attack_id)) {
                correction = 1 + (badies + earring) / 100;
                let hit_od = Math.floor(2.5 * correction * 100) / 100;
                let enemy_target = enemy_count;
                if (attack_info.range_area == 1) {
                    enemy_target = 1;
                }
                if (checkBuffExist(unit_data.buff_list, BUFF_EX_DOUBLE)) {
                    unit_od_plus += attack_info.hit_count * hit_od * 2 * enemy_target;
                } else {
                    unit_od_plus += attack_info.hit_count * hit_od * enemy_target;
                }
                unit_od_plus += funnel_list.length * hit_od * enemy_target;
            }
        }
        od_plus += unit_od_plus;
    });

    // 後衛の選択取得
    $(`.turn${turn_number} .back_area select.unit_skill option:selected`).each(function (index, element) {
        if ($(element).css("visibility") == "hidden") {
            return true;
        }
        let skill_id = $(element).val();
        if (skill_id == 0) {
            return true;
        }
        if ($(element).text().startsWith("追撃")) {
            let skill_info = getSkillData(skill_id);
            let chara_data = getCharaData(skill_info.chara_id);
            od_plus += chara_data.pursuit * 2.5;
        }
    });
    return od_plus;
}

// 耐性判定
function isResist(physical, element, attack_id) {
    let physical_rate = battle_enemy_info[`physical_${physical}`];
    let element_rate = battle_enemy_info[`element_${element}`];
    if (PENETRATION_ATTACK_LIST.includes(attack_id)) {
        physical_rate = 400;
        element_rate = 100;
    }
    return physical_rate / 100 * element_rate / 100 >= 1;
}

// 弱点判定
function isWeak(physical, element, attack_id) {
    if (PENETRATION_ATTACK_LIST.includes(attack_id)) {
        return true;
    }
    let physical_rate = battle_enemy_info[`physical_${physical}`];
    let element_rate = battle_enemy_info[`element_${element}`];
    return physical_rate / 100 * element_rate / 100 > 1;
}

// 独自仕様
function origin(turn_data, skill_info, unit_data) {
    switch (skill_info.skill_id) {
        // 初回判定
        case 335: // ルーイン・イリュージョン
        case 387: // 流星+
        case 422: // 必滅！ヴェインキック+
        case 450: // 醒めたる思い
        case 506: // ブラッディ・ダンス+
        case 508: // そよ風に吹かれて
        case 509: // リフレッシング・チアーズ！
            unit_data.first_use.push(skill_info.skill_id);
            break;
        case 177: // エリミネイト・ポッシブル
            let target_unit_data = turn_data.unit_list.filter(unit => unit?.style?.style_info?.chara_id === unit_data.buff_target_chara_id);
            target_unit_data[0].next_turn_min_sp = 3;
            break;
    }
    return;
}

// 消費SP取得
function getSpCost(turn_data, skill_info, unit) {
    let sp_cost = skill_info.sp_cost;
    if (harfSpSkill(turn_data, skill_info, unit)) {
        sp_cost = Math.ceil(sp_cost / 2)
    }
    // 追加ターン
    if (turn_data.additional_turn) {
        // クイックリキャスト
        if (checkAbilityExist(unit.ability_other, 1506)) {
            sp_cost -= 2;
        }
        // 優美なる剣舞
        if (checkAbilityExist(unit.ability_other, 1512)) {
            sp_cost -= 2;
        }
        // 疾駆
        if (checkAbilityExist(unit.ability_other, 1515)) {
            sp_cost -= 2;
        }
    }
    return sp_cost < 0 ? 0 : sp_cost;
}

// 消費SP半減
function harfSpSkill(turn_data, skill_info, unit_data) {
    switch (skill_info.skill_id) {
        case 327: // 姫君の寵愛
        case 359: // とどけ！ 誓いのしるし
        case 488: // 花舞う、可憐のフレア
            // 挑発
            if (checkBuffExist(turn_data.enemy_debuff_list, BUFF_PROVOKE)) {
                return true;
            }
            // 注目
            if (checkBuffExist(turn_data.enemy_debuff_list, BUFF_COVER)) {
                return true;
            }
            break;
        case 361: // にゃんこ大魔法
            // 防御ダウン
            if (checkBuffExist(turn_data.enemy_debuff_list, BUFF_DEFENSEDOWN)) {
                return true;
            }
            break;
        case 381: // 御稲荷神話
            // 脆弱
            if (checkBuffExist(turn_data.enemy_debuff_list, BUFF_FRAGILE)) {
                return true;
            }
            break;
        case 422: // 必滅！ヴェインキック+
        case 506: // ブラッディ・ダンス+
        case 508: // そよ風に吹かれて
        case 509: // リフレッシング・チアーズ！
            // 初回
            if (!unit_data.first_use.includes(skill_info.skill_id)) {
                return true;
            }
            break;
        case 473: // ロリータフルバースト
        case 494: // 蒼焔ノ螺旋
        case 516: // 放課後の淡いスリル
            // 追加ターン
            if (unit_data.additional_turn) {
                return true;
            }
            break;
        case 477: // ヌラルジャ
            // オーバードライブ中
            if (turn_data.over_drive_max_turn > 0) {
                return true;
            }
            break;
        case 419: // リミット・インパクト+(31A3人以上)
            if (checkMember(turn_data.unit_list, "31A") >= 3) {
                return true;
            }
            break;
        case 531: // 魔炎閃獄門+(31E3人以上)
            if (checkMember(turn_data.unit_list, "31E") >= 3) {
                return true;
            }
            break;
    }
    return false;
}

// バフを追加
function addBuffUnit(turn_data, buff_info, place_no, use_unit_data) {
    // 対象：場
    if (buff_info.range_area == 0) {
        return;
    }

    // 個別判定
    switch (buff_info.buff_id) {
        // 選択されなかった
        case 2: // トリック・カノン(攻撃力低下)
        case 46: // 次の主役はあなた(破壊率200％未満)
        case 141: // 夢視るデザイア(SP回復)
        case 497: // 浮き浮きサニー・ボマー(クリティカル率アップ/クリティカルダメージアップ/心眼)
        case 3301: // ブレスショット(SP回復)
        case 3302: // 闘気斬(SP回復)
        case 3303: // ヴィヴィットシュート(SP回復)
        case 3304: // リバースショット(SP回復)
        case 3305: // 砕華(SP回復)
        case 3306: // ゲインカノン(SP回復)
        case 3307: // 粛正(SP回復)
        case 3308: // キャンディ・バースト(SP回復)
        case 3309: // 不純なアリア(SP回復)
        case 3310: // フォーチュンスラッシュ(SP回復)
        case 3311: // トランスペイン(SP回復)
        case 3312: // エキゾーストノート(SP回復)
        case 3313: // 春雷(SP回復)
        case 3314: // ファンタズム(SP回復)
            if (use_unit_data.buff_effect_select_type == 0) {
                return;
            }
            break;
        // 敵1体
        case 111: // 豪快！パイレーツキャノン
            if (turn_data.enemy_count != 1) {
                return;
            }
            break;
        // 敵2体
        case 112: // 豪快！パイレーツキャノン
            if (turn_data.enemy_count != 2) {
                return;
            }
            break;
        // 敵3体
        case 113: // 豪快！パイレーツキャノン
            if (turn_data.enemy_count != 3) {
                return;
            }
            break;
        // 1ターン目のみ
        case 3315: // スイーツチャージ！
            if (turn_data.turn_number != 1) {
                return;
            }
            break;
        // 初回のみ
        case 39: // ルーイン・イリュージョン(クリダメ)
        case 40: // ルーイン・イリュージョン(心眼)
        case 92: // 醒めたる思い(雷属性攻撃アップ)
        case 99: // 流星+(連撃)
            if (use_unit_data.first_use.includes(buff_info.skill_id)) {
                return;
            }
            break;
        // OD中のみ
        case 76: // フローズン・ワルツ(連撃)
            if (turn_data.over_drive_max_turn == 0) {
                return;
            }
            break;
        // 追加ターンのみ
        case 146: // 蒼焔ノ迷宮(ATTACK)(連撃)
            if (turn_data.additional_turn) {
                return;
            }
            break;
    }
    let target_list;
    // 対象策定
    switch (buff_info.buff_kind) {
        case BUFF_ATTACKUP: // 攻撃力アップ
        case BUFF_ELEMENT_ATTACKUP: // 属性攻撃力アップ
        case BUFF_MINDEYE: // 心眼
        case BUFF_CRITICALRATEUP:	// クリティカル率アップ
        case BUFF_CRITICALDAMAGEUP:	// クリティカルダメージアップ
        case BUFF_ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
        case BUFF_ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
        case BUFF_CHARGE: // チャージ
        case BUFF_DAMAGERATEUP: // 破壊率アップ
        case BUFF_FUNNEL_SMALL: // 連撃(小)
        case BUFF_FUNNEL_LARGE: // 連撃(大)
        case BUFF_RECOIL: // 行動不能
        case BUFF_GIVEATTACKBUFFUP: // バフ強化
        case BUFF_GIVEDEBUFFUP: // デバフ強化
        case BUFF_ARROWCHERRYBLOSSOMS: // 桜花の矢
        case BUFF_ETERNAL_OARH: // 永遠なる誓い
        case BUFF_EX_DOUBLE: // EXスキル連続使用
        case BUFF_BABIED: // オギャり
            // バフ追加
            target_list = getTargetList(turn_data, buff_info, place_no, use_unit_data.buff_target_chara_id);
            if (buff_info.buff_kind == BUFF_ATTACKUP || buff_info.buff_kind == BUFF_ELEMENT_ATTACKUP) {
                // 先頭のバフ強化を消費する。
                let index = use_unit_data.buff_list.findIndex(function (buff_info) {
                    return buff_info.buff_kind == BUFF_GIVEATTACKBUFFUP;
                });
                if (index !== -1) {
                    use_unit_data.buff_list.splice(index, 1);
                }
            }
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(turn_data, target_no);
                // 単一バフ
                if (SINGLE_BUFF_LIST.includes(buff_info.buff_kind)) {
                    if (checkBuffExist(unit_data.buff_list, buff_info.buff_kind)) {
                        return true;
                    }
                }
                let buff = createBuffData(buff_info, use_unit_data);
                unit_data.buff_list.push(buff);
            });
            break;
        case BUFF_MORALE: // 士気
            // バフ追加
            target_list = getTargetList(turn_data, buff_info, place_no, use_unit_data.buff_target_chara_id);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(turn_data, target_no);
                let exist_list = unit_data.buff_list.filter(function (buff_info) {
                    return buff_info.buff_kind == BUFF_MORALE;
                });
                let buff;
                if (exist_list.length > 0) {
                    buff = exist_list[0];
                } else {
                    buff = createBuffData(buff_info, use_unit_data);
                    unit_data.buff_list.push(buff);
                }
                if (buff.lv < 10) {
                    buff.lv += buff_info.effect_count;
                }
            });
            break;
        case BUFF_DEFENSEDOWN: // 防御力ダウン
        case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
        case BUFF_FRAGILE: // 脆弱
        case BUFF_DEFENSEDP: // DP防御力ダウン
        case BUFF_RESISTDOWN: // 耐性ダウン
        case BUFF_ETERNAL_DEFENSEDOWN: // 永続防御ダウン
        case BUFF_ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
        case BUFF_PROVOKE: // 挑発
        case BUFF_COVER: // 注目
            // デバフ追加
            let add_count = 1;
            if (buff_info.range_area == RANGE_ENEMY_ALL) {
                add_count = turn_data.enemy_count;
            }
            // デバフ強化を消費する。
            let index = use_unit_data.buff_list.findIndex(function (buff_info) {
                return buff_info.buff_kind == BUFF_GIVEDEBUFFUP || buff_info.buff_kind == BUFF_ARROWCHERRYBLOSSOMS;
            });
            if (index !== -1) {
                use_unit_data.buff_list.splice(index, 1);
            }
            for (let i = 0; i < add_count; i++) {
                let debuff = createBuffData(buff_info, use_unit_data);
                turn_data.enemy_debuff_list.push(debuff);
            }
            break;
        case BUFF_HEALSP: // SP追加
            target_list = getTargetList(turn_data, buff_info, place_no, use_unit_data.buff_target_chara_id);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(turn_data, target_no);
                unit_data.sp += buff_info.min_power;
            });
            break;
        case BUFF_ADDITIONALTURN: // 追加ターン
            target_list = getTargetList(turn_data, buff_info, place_no, use_unit_data.buff_target_chara_id);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(turn_data, target_no);
                unit_data.additional_turn = true;
            });
            turn_data.additional_turn = true;
        default:
            break;
    }
}

function createBuffData(buff_info, use_unit_data) {
    let buff = new buff_data();
    buff.buff_kind = buff_info.buff_kind;
    buff.buff_element = buff_info.buff_element;
    buff.effect_size = buff_info.max_power;
    buff.buff_name = buff_info.buff_name
    buff.skill_id = buff_info.skill_id;
    switch (buff_info.buff_kind) {
        case BUFF_DEFENSEDOWN: // 防御力ダウン
        case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
        case BUFF_FRAGILE: // 脆弱
        case BUFF_DEFENSEDP: // DP防御力ダウン 
        case BUFF_RECOIL: // 行動不能
            buff.rest_turn = buff_info.effect_count;
            // ダブルリフト
            if (checkAbilityExist(use_unit_data.ability_other, 1516)) {
                buff.rest_turn++;
            }
            break;
        case BUFF_PROVOKE: // 挑発
        case BUFF_COVER: // 注目
            buff.rest_turn = buff_info.max_power;
            break;
        default:
            buff.rest_turn = -1;
            break;
    }

    // 星屑とバウンシー・ブルーミーのみ特殊仕様
    if (buff_info.skill_id == 67 || buff_info.skill_id == 491 || buff_info.skill_id == 523) {
        buff.rest_turn = 3;
    }
    return buff;
}

// 攻撃時にバフ消費
function consumeBuffUnit(buff_list, attack_info, skill_info) {
    let consume_kind = [];
    let consume_count = 2
    if (checkBuffExist(buff_list, BUFF_EX_DOUBLE)) {
        consume_count = 4;
    }
    // バフ消費
    for (let i = buff_list.length - 1; i >= 0; i--) {
        buff_info = buff_list[i];
        const countWithFilter = consume_kind.filter(buff_kind => buff_kind === buff_info.buff_kind).length;
        // 同一バフは制限
        if (countWithFilter < consume_count) {
            switch (buff_info.buff_kind) {
                case BUFF_ELEMENT_ATTACKUP: // 属性攻撃力アップ
                    if (attack_info.attack_element != buff_info.buff_element) {
                        continue;
                    }
                case BUFF_ATTACKUP: // 攻撃力アップ
                case BUFF_MINDEYE: // 心眼
                case BUFF_CHARGE: // チャージ
                case BUFF_DAMAGERATEUP: // 破壊率アップ
                case BUFF_ARROWCHERRYBLOSSOMS: // 桜花の矢
                    // スキルでのみ消費
                    if (attack_info.attack_id == 0) {
                        continue;
                    }
                    if (buff_info.buff_kind == BUFF_MINDEYE) {
                        // 弱点のみ消費
                        if (!isWeak(attack_info.physical, attack_info.attack_element, attack_info.attack_id)) {
                            continue;
                        }
                    }
                    buff_list.splice(i, 1);
                    break;
                case BUFF_ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
                case BUFF_ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
                    if (attack_info.attack_element != buff_info.buff_element) {
                        continue;
                    }
                case BUFF_CRITICALRATEUP:	// クリティカル率アップ
                case BUFF_CRITICALDAMAGEUP:	// クリティカルダメージアップ
                case BUFF_FUNNEL_SMALL: // 連撃(小)
                case BUFF_FUNNEL_LARGE: // 連撃(大)
                case BUFF_ABILITY_FUNNEL_SMALL: // アビリティ連撃(小)
                case BUFF_ABILITY_FUNNEL_LARGE: // アビリティ連撃(大)
                    // 星屑の航路は消費しない。
                    if (buff_info.skill_id == 67 || buff_info.skill_id == 491) {
                        continue;
                    }
                    // 通常攻撃でも消費
                    buff_list.splice(i, 1);
                    break;
                case BUFF_EX_DOUBLE:	// EXスキル連続使用
                    // EXスキルでのみ消費
                    if (skill_info.skill_kind != 1 && skill_info.skill_kind != 2) {
                        continue;
                    }
                    buff_list.splice(i, 1);
                    break;
                default:
                    // 上記以外のバフ消費しない
                    break;
            }
            consume_kind.push(buff_info.buff_kind);
        }
    };
}

// バフ名称取得
function getBuffKindName(buff_info) {
    let buff_kind_name = "";
    if (buff_info.buff_element != 0) {
        buff_kind_name = element_name[buff_info.buff_element] + "属性";
    }

    switch (buff_info.buff_kind) {
        case BUFF_ATTACKUP: // 攻撃力アップ
        case BUFF_ELEMENT_ATTACKUP: // 属性攻撃力アップ
            buff_kind_name += "攻撃力アップ";
            break;
        case BUFF_MINDEYE: // 心眼
            buff_kind_name += "心眼";
            break;
        case BUFF_DEFENSEDOWN: // 防御力ダウン
        case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
            buff_kind_name += "防御力ダウン";
            break;
        case BUFF_FRAGILE: // 脆弱
            buff_kind_name += "脆弱";
            break;
        case BUFF_CRITICALRATEUP:	// クリティカル率アップ
        case BUFF_ELEMENT_CRITICALRATEUP:	// 属性クリティカル率アップ
            buff_kind_name += "クリティカル率アップ";
            break;
        case BUFF_CRITICALDAMAGEUP:	// クリティカルダメージアップ
        case BUFF_ELEMENT_CRITICALDAMAGEUP:	// 属性クリティカルダメージアップ
            buff_kind_name += "クリティカルダメージアップ";
            break;
        case BUFF_CHARGE: // チャージ
            buff_kind_name += "チャージ";
            break;
        case BUFF_DAMAGERATEUP: // 破壊率アップ
            buff_kind_name += "破壊率アップ";
            break;
        case BUFF_FIGHTINGSPIRIT: // 闘志
            buff_kind_name += "闘志";
            break;
        case BUFF_MISFORTUNE: // 厄
            buff_kind_name += "厄";
            break;
        case BUFF_FUNNEL_SMALL: // 連撃(小)
        case BUFF_ABILITY_FUNNEL_SMALL: // アビリティ連撃(小)
            buff_kind_name += "連撃(小)";
            break;
        case BUFF_FUNNEL_LARGE: // 連撃(大)
        case BUFF_ABILITY_FUNNEL_LARGE: // アビリティ連撃(大)
            buff_kind_name += "連撃(大)";
            break;
        case BUFF_DEFENSEDP: // DP防御力ダウン
            buff_kind_name += "DP防御力ダウン";
            break;
        case BUFF_RESISTDOWN: // 耐性ダウン
            buff_kind_name += "耐性打ち消し/ダウン";
            break;
        case BUFF_ETERNAL_DEFENSEDOWN: // 永続防御ダウン
        case BUFF_ELEMENT_ETERNAL_DEFENSEDOWN: // 永続属性防御ダウン
            buff_kind_name += "防御力ダウン";
            break;
        case BUFF_RECOIL: // 行動不能
            buff_kind_name += "行動不能";
            break;
        case BUFF_PROVOKE: // 挑発
            buff_kind_name += "挑発";
            break;
        case BUFF_COVER: // 注目
            buff_kind_name += "注目";
            break;
        case BUFF_GIVEATTACKBUFFUP: // バフ強化
            buff_kind_name += "バフ強化";
            break;
        case BUFF_GIVEDEBUFFUP: // デバフ強化
            buff_kind_name += "デバフ強化";
            break;
        case BUFF_ARROWCHERRYBLOSSOMS: // 桜花の矢
            buff_kind_name += "桜花の矢";
            break;
        case BUFF_ETERNAL_OARH: // 永遠なる誓い
            buff_kind_name += "永遠なる誓い";
            break;
        case BUFF_EX_DOUBLE: // EXスキル連続使用
            buff_kind_name += "EXスキル連続使用";
            break;
        case BUFF_BABIED: // オギャり
            buff_kind_name += "オギャり";
            break;
        case BUFF_MORALE: // 士気
            buff_kind_name += "士気";
            break;
        default:
            break;
    }
    return buff_kind_name;
}


// ターゲットリスト追加
function getTargetList(turn_data, buff_info, place_no, buff_target_chara_id) {
    let target_list = [];
    let target_unit_data;
    switch (buff_info.range_area) {
        case RANGE_FILED: // 場
            break;
        case RANGE_ENEMY_UNIT: // 敵単体
            break;
        case RANGE_ENEMY_ALL: // 敵全体
            break;
        case RANGE_ALLY_UNIT: // 味方単体
            target_unit_data = turn_data.unit_list.filter(unit => unit?.style?.style_info?.chara_id === buff_target_chara_id);
            target_list.push(target_unit_data[0].place_no);
            break;
        case RANGE_ALLY_FRONT: // 味方前衛
            target_list = [0, 1, 2];
            break;
        case RANGE_ALLY_BACK: // 味方後衛
            target_list = [3, 4, 5];
            break;
        case RANGE_ALLY_ALL: // 味方全員
            target_list = [...Array(6).keys()];
            break;
        case RANGE_SELF: // 自分
            target_list.push(place_no);
            break;
        case RANGE_SELF_OTHER: // 自分以外
            target_list = [...Array(6).keys()].filter(num => num !== place_no);
            break;
        case RANGE_SELF_AND_UNIT: // 味方単体
            target_unit_data = turn_data.unit_list.filter(unit => unit?.style?.style_info?.chara_id === buff_target_chara_id);
            target_list.push(place_no);
            target_list.push(target_unit_data[0].place_no);
            break;
        default:
            break;
    }
    if (buff_info.target_element != 0) {
        for (let i = target_list.length - 1; i >= 0; i--) {
            let unit = getUnitData(turn_data, target_list[i]);
            if (unit.blank || (unit.style.style_info.element != buff_info.target_element && unit.style.style_info.element2 != buff_info.target_element)) {
                target_list.splice(i, 1);
            }
        }
    }
    return target_list;
}

// 行動順を取得
function sortActionSeq(turn_number) {
    let buff_seq = [];
    let attack_seq = [];

    // 前衛のスキルを取得
    $(`.turn${turn_number} .front_area select.unit_skill`).each(function (index, element) {
        if ($(element).css("visibility") == "hidden") {
            return true;
        }
        let skill_id = Number($(element).val());
        if (skill_id == 0) {
            return true;
        }
        let skill_info = getSkillData(skill_id);
        let skill_data = {
            skill_info: skill_info,
            place_no: index
        };
        if (skill_info.attack_id || skill_info.skill_name == "通常攻撃") {
            attack_seq.push(skill_data);
        } else {
            buff_seq.push(skill_data);
        }
    });
    // バフとアタックの順序を結合
    return buff_seq.concat(attack_seq);
}