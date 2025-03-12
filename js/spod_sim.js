let select_troops = localStorage.getItem('select_troops');
let select_style_list = Array(6).fill(undefined);
// 使用不可スタイル
const NOT_USE_STYLE = [36];
// 制限アビリティ
const CONSTRAINTS_ABILITY = [
    1136, // 勝勢
    1138, // ラストリゾート
    1505, // 激動
    1509, // 怪盗乱麻
    1523, // アンコール
    1525, // ポジショニング
];
// 謎の処理順序
const ACTION_ORDER = [1, 0, 2, 3, 4, 5];

const styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);
let turn_list = [];
let battle_enemy_info;
let physical_name = ["", "斬", "突", "打"];
let element_name = ["無", "火", "氷", "雷", "光", "闇"];
let user_operation_list = [];
let seq_last_turn = 0;
let constraints_list = [];

const KB_NEXT_ACTION = 1;
const KB_NEXT_ACTION_OD = 2;
const KB_NEXT_ADDITIONALTURN = 3;

const ABILIRY_BATTLE_START = 0;
const ABILIRY_SELF_START = 1;
const ABILIRY_ACTION_START = 2;
const ABILIRY_ENEMY_START = 3;
const ABILIRY_ADDITIONALTURN = 4;
const ABILIRY_OD_START = 5;
const ABILIRY_BREAK = 6;
const ABILIRY_RECEIVE_DAMAGE = 7;
const ABILIRY_EX_SKILL_USE = 8;
const ABILIRY_OTHER = 99;

const BUFF_FUNNEL_LIST = [BUFF_FUNNEL, BUFF_ABILITY_FUNNEL];
const SINGLE_BUFF_LIST = [BUFF_CHARGE, BUFF_RECOIL, BUFF_ARROWCHERRYBLOSSOMS, BUFF_ETERNAL_OARH, BUFF_EX_DOUBLE, BUFF_BABIED, BUFF_DIVA_BLESS];
const FIELD_LIST = {
    [FIELD_NORMAL]: "無し",
    [FIELD_FIRE]: "火",
    [FIELD_ICE]: "氷",
    [FIELD_THUNDER]: "雷",
    [FIELD_LIGHT]: "光",
    [FIELD_DARK]: "闇",
    [FIELD_RICE]: "稲穂",
    [FIELD_SANDSTORM]: "砂嵐"
}
class turn_data {
    constructor() {
        this.turn_number = 0;
        this.seq_turn = -1;
        this.over_drive_number = 0;
        this.end_drive_trigger_count = 0;
        this.over_drive_max_turn = 0;
        this.trigger_over_drive = false;
        this.additional_turn = false;
        this.additional_count = 0;
        this.enemy_debuff_list = [];
        this.unit_list = [];
        this.start_over_drive_gauge = 0;
        this.over_drive_gauge = 0;
        this.add_over_drive_gauge = 0;
        this.enemy_count = 1;
        this.finish_action = false;
        this.field = 0;
        this.field_turn = 0;
        this.user_operation = {}

        // 特殊設定
        this.front_sp_add = 0;
        this.back_sp_add = 0;
        this.step_turn = 0;
        this.step_over_drive_down = 0;
        this.step_sp_down = 0;
        this.sp_cost_down = 0;
    }

    unitLoop(func) {
        $.each(this.unit_list, function (index, unit) {
            if (!unit.blank) {
                func(unit);
            }
        });
    }

    unitOrderLoop(func) {
        const self = this;
        ACTION_ORDER.forEach(function (index) {
            let unit = self.unit_list[index];
            if (!unit.blank) {
                func(unit);
            }
        });
    }

    // 1:通常戦闘,2:後打ちOD,3:追加ターン
    turnProceed(kb_next) {
        const self = this;
        let turnProgress = false;
        this.enemy_debuff_list.sort((a, b) => a.buff_kind - b.buff_kind);
        if (kb_next == KB_NEXT_ACTION) {
            // オーバードライブ
            if (this.over_drive_max_turn > 0) {
                this.over_drive_number++;
                this.unitLoop(function (unit) {
                    unit.unitOverDriveTurnProceed();
                });
                if (this.over_drive_max_turn < this.over_drive_number) {
                    // オーバードライブ終了
                    this.over_drive_max_turn = 0;
                    this.over_drive_number = 0;
                    this.end_drive_trigger_count++;
                    if (this.finish_action) {
                        turnProgress = true;
                        this.nextTurn();
                    }
                }
            } else {
                turnProgress = true;
                this.nextTurn();
            }
            this.additional_count = 0;
        } else if (kb_next == KB_NEXT_ADDITIONALTURN) {
            // 追加ターン
            this.additional_count++;
        } else {
            // 行動開始＋OD発動
            this.startOverDrive();
            this.finish_action = true;
            this.end_drive_trigger_count = 0;
            this.unitLoop(function (unit) {
                unit.unitOverDriveTurnProceed();
            });
        }
        // ターンごとに初期化
        this.trigger_over_drive = false;
        this.start_over_drive_gauge = this.over_drive_gauge;
        this.old_field = this.field;
        this.seq_turn++;
        this.unitLoop(function (unit) {
            if (unit.no_action) {
                unit.no_action = false;
                return;
            }
            unit.buffConsumption(turnProgress);
            unit.unitTurnInit(self.additional_turn);
        });
        this.setUserOperation();
        if (turnProgress) {
            this.abilityAction(ABILIRY_SELF_START);
        }
    }

    setUserOperation() {
        // 初期値を設定
        this.user_operation = {
            field: null,
            enemy_count: null,
            select_skill: this.unit_list.map(function (unit) {
                if (unit.blank) {
                    return null;
                }
                return { skill_id: (unit.place_no < 3 ? unit.init_skill_id : SKILL_NONE) };
            }),
            place_style: this.unit_list.map(function (unit) {
                return unit.blank ? 0 : unit.style.style_info.style_id;
            }),
            trigger_over_drive: false,
            selected_place_no: -1,
            kb_action: KB_NEXT_ACTION,
            finish_action: this.finish_action,
            end_drive_trigger_count: this.end_drive_trigger_count,
            turn_number: this.turn_number,
            additional_count: this.additional_count,
            over_drive_number: this.over_drive_number,
        }
    }

    nextTurn() {
        let self = this;
        // 通常進行
        this.unitLoop(function (unit) {
            unit.unitTurnProceed(self);
        });

        this.turn_number++;
        this.finish_action = false;
        this.end_drive_trigger_count = 0;
        this.abilityAction(ABILIRY_RECEIVE_DAMAGE);
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
        if (this.over_drive_number > 0) {
            return `${defalt_turn} OverDrive${this.over_drive_number}/${this.over_drive_max_turn}`;
        }
        return defalt_turn;
    }
    addOverDrive(add_od_gauge) {
        this.over_drive_gauge += add_od_gauge;
        if (this.over_drive_gauge > 300) {
            this.over_drive_gauge = 300;
        }
    }
    startOverDrive() {
        let over_drive_level = Math.floor(this.over_drive_gauge / 100)
        this.over_drive_number = 1;
        this.over_drive_max_turn = over_drive_level;
        this.over_drive_gauge = 0;
        this.add_over_drive_gauge = 0;

        let sp_list = [0, 5, 12, 20];
        let self = this;
        this.unitLoop(function (unit) {
            unit.over_drive_sp = sp_list[over_drive_level];
            unit.sp_cost = getSpCost(self, getSkillData(unit.select_skill_id), unit);
        });
        this.abilityAction(ABILIRY_OD_START);
        this.trigger_over_drive = true;
    }
    removeOverDrive() {
        this.over_drive_number = 0;
        this.over_drive_max_turn = 0;
        this.over_drive_gauge = this.start_over_drive_gauge;
        this.add_over_drive_gauge = 0;

        let self = this;
        this.unitLoop(function (unit) {
            unit.over_drive_sp = 0;
            unit.sp_cost = getSpCost(self, getSkillData(unit.select_skill_id), unit);
        });
        this.trigger_over_drive = false;
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
        this.unitOrderLoop(function (unit) {
            unit.abilityAction(self, action_kbn)
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

// パッシブ存在チェック
function checkPassiveExist(passive_list, skill_id) {
    let exist_list = passive_list.filter(function (passive) {
        return passive.skill_id == skill_id;
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

// バフ存在チェック
function checkBuffIdExist(buff_list, buff_id) {
    let exist_list = buff_list.filter(function (buff_info) {
        return buff_info.buff_id == buff_id;
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
        this.ep = 0;
        this.over_drive_sp = 0;
        this.add_sp = 0;
        this.sp_cost = 0;
        this.buff_list = [];
        this.additional_turn = false;
        this.normal_attack_element = 0;
        this.earring_effect_size = 0;
        this.skill_list = [];
        this.passive_skill_list = [];
        this.blank = false;
        this.use_skill_list = [];
        this.buff_target_chara_id = null;
        this.buff_effect_select_type = 0;
        this.ability_battle_start = [];
        this.ability_self_start = [];
        this.ability_action_start = [];
        this.ability_enemy_start = [];
        this.ability_additional_turn = [];
        this.ability_over_drive = [];
        this.ability_ex_skill_use = [];
        this.ability_receive_damage = [];
        this.ability_other = [];
        this.next_turn_min_sp = -1;
        this.select_skill_id = 0;
        this.init_skill_id = 0;
        this.no_action = false;
    }

    unitTurnInit(additional_turn) {
        this.buff_effect_select_type = 0;
        if (this.place_no < 3 && (!additional_turn || this.additional_turn)) {
            this.setInitSkill();
        } else {
            this.select_skill_id = SKILL_NONE;
        }
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
    }

    setInitSkill() {
        if (this.place_no < 3) {
            this.select_skill_id = this.init_skill_id;
            this.sp_cost = 0;
        } else {
            this.select_skill_id = SKILL_NONE;
            this.sp_cost = 0;
        }
        this.buff_effect_select_type = null;
        this.buff_target_chara_id = null;
    }

    unitOverDriveTurnProceed() {
        this.buffSort();
        // OverDriveゲージをSPに加算
        this.sp += this.over_drive_sp;
        if (this.sp > 99) this.sp = 99;
        this.over_drive_sp = 0;
    }

    buffConsumption(turnProgress) {
        for (let i = this.buff_list.length - 1; i >= 0; i--) {
            let buff_info = this.buff_list[i];
            if (!turnProgress) {
                // 単独発動と行動不能
                if (isAloneActivation(buff_info) || buff_info.buff_kind == BUFF_RECOIL) {
                    if (buff_info.rest_turn == 1) {
                        this.buff_list.splice(i, 1);
                    } else {
                        buff_info.rest_turn -= 1;
                    }
                }
            } else {
                // 全バフターン消費
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
        // OD上限突破
        if (this.sp + this.over_drive_sp > 99) {
            this.sp = 99 - this.over_drive_sp;
        }
        if (this.select_skill_id == 591) {
            // ノヴァエリミネーション
            this.ep -= this.sp_cost;
        } else {
            this.sp -= this.sp_cost;
        }
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
    getFunnelList() {
        let ret = [];
        let buff_funnel_list = this.buff_list.filter(function (buff_info) {
            return BUFF_FUNNEL == buff_info.buff_kind && !isAloneActivation(buff_info);
        });
        let buff_unit_funnel_list = this.buff_list.filter(function (buff_info) {
            return BUFF_FUNNEL == buff_info.buff_kind && isAloneActivation(buff_info);
        });
        let ability_list = this.buff_list.filter(function (buff_info) {
            return BUFF_ABILITY_FUNNEL == buff_info.buff_kind;
        });

        // effect_sumで降順にソート
        buff_funnel_list.sort(function (a, b) {
            return b.effect_sum - a.effect_sum;
        });
        buff_unit_funnel_list.sort(function (a, b) {
            return b.effect_sum - a.effect_sum;
        });
        ability_list.sort(function (a, b) {
            return b.effect_sum - a.effect_sum;
        });
        // 単独発動の効果値判定
        let buff_total = buff_funnel_list.slice(0, 2).reduce(function (sum, element) {
            return sum + element["effect_sum"];
        }, 0);
        let buff_unit_total = buff_unit_funnel_list.slice(0, 1).reduce(function (sum, element) {
            return sum + element["effect_sum"];
        }, 0);
        if (buff_total <= buff_unit_total) {
            ret = buff_unit_funnel_list.slice(0, 1)
        } else {
            ret = buff_funnel_list.slice(0, 2)
            buff_funnel_list = buff_funnel_list.slice(2);
        }
        // アビリティを追加
        if (ability_list.length > 0) {
            ret.push(ability_list[0]);
        }

        // 新しいリストを作成
        let result_list = [];

        // 各要素のeffect_count分effect_unitを追加
        ret.forEach(function (item) {
            for (let i = 0; i < item.max_power; i++) {
                result_list.push(item.effect_size);
            }
            item.use_funnel = true;
        });
        // 使用後にリストから削除
        this.buff_list = this.buff_list.filter(function (item) {
            return !item.use_funnel || isAloneActivation(item) || ALONE_ACTIVATION_ABILITY_LIST.includes(item.ability_id);
        })
        return result_list;
    }

    abilityAction(turn_data, action_kbn) {
        let self = this;
        let action_list = [];
        switch (action_kbn) {
            case ABILIRY_BATTLE_START: // 戦闘開始時
                action_list = self.ability_battle_start;
                break;
            case ABILIRY_SELF_START: // 自分のターン開始時
                action_list = self.ability_self_start;
                break;
            case ABILIRY_ACTION_START: // 行動開始時
                action_list = self.ability_action_start;
                break;
            case ABILIRY_ENEMY_START: // 敵のターン開始時
                action_list = self.ability_enemy_start;
                break;
            case ABILIRY_ADDITIONALTURN: // 追加ターン
                action_list = self.ability_additional_turn;
                break;
            case ABILIRY_OD_START: // オーバードライブ開始時
                action_list = self.ability_over_drive;
                break;
            case ABILIRY_EX_SKILL_USE: // EXスキル使用
                action_list = self.ability_ex_skill_use;
                break;
            case ABILIRY_RECEIVE_DAMAGE: // 被ダメージ時
                // 前衛のみ
                if (self.place_no < 3) {
                    action_list = self.ability_receive_damage;
                }
                break;
            case ABILIRY_OTHER: // その他
                action_list = self.ability_other;
                break;
        }
        $.each(action_list, function (index, ability) {
            // 前衛
            if (ability.activation_place == 1 && self.place_no >= 3) {
                return true;
            }
            // 後衛
            if (ability.activation_place == 2 && self.place_no < 3) {
                return true;
            }
            let target_list = getTargetList(turn_data, ability.range_area, ability.target_element, self.place_no, null);
            let buff;
            switch (ability.conditions) {
                case "火属性フィールド":
                    if (turn_data.field != FIELD_FIRE) {
                        return;
                    }
                    break;
                case "歌姫の加護":
                    if (!checkBuffExist(self.buff_list, BUFF_DIVA_BLESS)) {
                        return;
                    };
                    break;
                case "SP0以下":
                    if (self.sp > 0) {
                        return;
                    }
                    break;
                case "破壊率が200%以上":
                case "トークン4つ以上":
                case "敵のバフ解除":
                    return;
            }
            switch (ability.effect_type) {
                case EFFECT_FUNNEL: // 連撃数アップ
                    buff = new buff_data();
                    buff.ability_id = ability.ability_id;
                    buff.buff_kind = BUFF_ABILITY_FUNNEL;
                    buff.buff_name = ability.ability_name;
                    buff.buff_element = 0;
                    buff.max_power = ability.effect_count;
                    buff.effect_size = ability.effect_size;
                    buff.effect_sum = ability.effect_size * ability.effect_count;
                    buff.rest_turn = -1;
                    self.buff_list.push(buff);
                    break;
                case EFFECT_OVERDRIVE_SP: // ODSPアップ
                    $.each(target_list, function (index, target_no) {
                        let unit_data = getUnitData(turn_data, target_no);
                        unit_data.over_drive_sp += ability.effect_size;
                    });
                    break;
                case EFFECT_HEALSP: // SP回復
                    $.each(target_list, function (index, target_no) {
                        let unit_data = getUnitData(turn_data, target_no);
                        if (unit_data.sp + unit_data.over_drive_sp < 20) {
                            if (ability.ability_id) {
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
                            }
                            if (ability.skill_id) {
                                switch (ability.skill_id) {
                                    case 524: // 痛気持ちいぃ～！
                                        unit_data.add_sp += ability.effect_size;
                                        break;
                                    default:
                                        unit_data.sp += ability.effect_size;
                                        break;
                                }
                            }
                            if (unit_data.sp + unit_data.over_drive_sp > 20) {
                                unit_data.sp = 20 - unit_data.over_drive_sp;
                            }
                        }
                    });
                    break;
                case EFFECT_HEALEP: // EP回復
                    self.ep += ability.effect_size;
                    if (self.ep > 10) {
                        self.ep = 10
                    }
                    break;
                case EFFECT_MORALE: // 士気
                    $.each(target_list, function (index, target_no) {
                        let unit_data = getUnitData(turn_data, target_no);
                        if (!unit_data.style) {
                            return true;
                        }

                        let exist_list = unit_data.buff_list.filter(function (buff_info) {
                            return buff_info.buff_kind == BUFF_MORALE;
                        });
                        let buff;
                        if (exist_list.length > 0) {
                            buff = exist_list[0];
                        } else {
                            buff = new buff_data();
                            buff.buff_kind = BUFF_MORALE;
                            buff.buff_element = 0;
                            buff.rest_turn = -1;
                            buff.buff_name = ability.ability_name;
                            unit_data.buff_list.push(buff);
                        }
                        if (buff.lv < 10) {
                            buff.lv += ability.effect_size;
                        }
                    });
                    break;
                case EFFECT_OVERDRIVEPOINTUP: // ODアップ
                    turn_data.over_drive_gauge += ability.effect_size;
                    if (turn_data.over_drive_gauge > 300) {
                        turn_data.over_drive_gauge = 300;
                    }
                    break;
                case EFFECT_ARROWCHERRYBLOSSOMS: // 桜花の矢
                    buff = new buff_data();
                    buff.buff_kind = BUFF_ARROWCHERRYBLOSSOMS;
                    buff.buff_element = 0;
                    buff.rest_turn = -1;
                    buff.buff_name = ability.ability_name;
                    self.buff_list.push(buff);
                    break;
                case EFFECT_CHARGE: // チャージ
                    buff = new buff_data();
                    buff.buff_kind = BUFF_CHARGE;
                    buff.buff_element = 0;
                    buff.rest_turn = -1;
                    buff.buff_name = ability.ability_name;
                    self.buff_list.push(buff);
                    break;
                case EFFECT_FIELD_DEPLOYMENT: // フィールド
                    if (ability.element) {
                        turn_data.field = ability.element;
                    } else if (ability.skill_id == 525) {
                        // いつの日かここで
                        turn_data.field = FIELD_RICE;
                    }
                    break;
                case EFFECT_NEGATIVE: // ネガティブ
                    buff = new buff_data();
                    buff.buff_kind = BUFF_NAGATIVE;
                    buff.buff_element = 0;
                    buff.rest_turn = ability.effect_count + 1;
                    buff.buff_name = ability.ability_name;
                    self.buff_list.push(buff);
                    break;
                case EFFECT_ADDITIONALTURN: // 追加ターン
                    if (turn_data.additional_count == 0) {
                        self.additional_turn = true;
                        turn_data.additional_turn = true;
                    }
                    break;
            }
        });
    }
}
class buff_data {
    constructor() {
        this.rest_turn = -1;
        this.effect_size = 0;
        this.buff_kind = 0;
        this.skill_id = -1;
        this.buff_id = -1;
        this.max_power = 0;
        this.buff_name = null;
        this.lv = 0;
    }
}

/* 戦闘開始処理 */
function procBattleStart() {
    // 戦闘データ初期化
    cleanBattleData();
    // 初期データ作成
    let turn_init = getInitBattleData();
    // バトルエリアリフレッシュ
    startBattle();
    // 制約事項更新
    updateConstraints();
    // ターンを進める
    proceedTurn(turn_init, true);
}

// 戦闘データ初期化
function cleanBattleData() {
    // 初期化
    turn_list = [];
    user_operation_list = [];
    battle_enemy_info = getEnemyInfo();
    for (let i = 1; i <= 3; i++) {
        battle_enemy_info[`physical_${i}`] = Number($(`#enemy_physical_${i}`).val());
    }
    for (let i = 0; i <= 5; i++) {
        battle_enemy_info[`element_${i}`] = Number($(`#enemy_element_${i}`).val());
    }
}

// 戦闘初期データ作成
function getInitBattleData() {
    // 初期データ作成
    let turn_init = new turn_data();
    let unit_list = [];
    constraints_list = [];

    let init_sp_add = Number($("#init_sp_add").val());
    // スタイル情報を作成
    $.each(select_style_list, function (index, member_info) {
        if (index >= 6) {
            return false;
        }
        let unit = new unit_data();
        unit.place_no = index;
        if (member_info) {
            saveStyle(member_info);
            saveExclusionSkill(member_info);
            let physical = getCharaData(member_info.style_info.chara_id).physical;

            unit.style = member_info;
            unit.sp = member_info.init_sp;
            unit.sp += member_info.chain + init_sp_add;
            unit.normal_attack_element = member_info.bracelet;
            unit.earring_effect_size = member_info.earring;
            unit.skill_list = skill_list.filter(obj =>
                (obj.chara_id === member_info.style_info.chara_id || obj.chara_id === 0) &&
                (obj.style_id === member_info.style_info.style_id || obj.style_id === 0) &&
                obj.skill_active == 0 &&
                !member_info.exclusion_skill_list.includes(obj.skill_id)
            ).map(obj => {
                const copiedObj = JSON.parse(JSON.stringify(obj));
                if (copiedObj.chara_id === 0) {
                    copiedObj.chara_id === member_info.style_info.chara_id;
                    copiedObj.attack_physical = physical;
                }
                return copiedObj;
            });
            unit.passive_skill_list = skill_list.filter(obj =>
                (obj.chara_id === member_info.style_info.chara_id || obj.chara_id === 0) &&
                (obj.style_id === member_info.style_info.style_id || obj.style_id === 0) &&
                obj.skill_active == 1 &&
                !member_info.exclusion_skill_list.includes(obj.skill_id)
            )
            if (unit.style.style_info.role == ROLE_ADMIRAL) {
                unit.init_skill_id = 4; // 指揮行動
            } else {
                unit.init_skill_id = 1; // 通常攻撃
            }
            // 曙
            if (checkPassiveExist(unit.passive_skill_list, 606)) {
                unit.normal_attack_element = 4;
            }
            ["0", "00", "1", "3", "5", "10"].forEach(num => {
                if (member_info.style_info[`ability${num}`] && num <= member_info.limit_count) {
                    let ability_info = getAbilityInfo(member_info.style_info[`ability${num}`]);
                    if (CONSTRAINTS_ABILITY.includes(ability_info.ability_id)) {
                        constraints_list.push(ability_info.ability_id);
                    }
                    switch (ability_info.activation_timing) {
                        case ABILIRY_BATTLE_START: // 戦闘開始時
                            unit.ability_battle_start.push(ability_info);
                            break;
                        case ABILIRY_SELF_START: // 自分のターン開始時
                            unit.ability_self_start.push(ability_info);
                            break;
                        case ABILIRY_ACTION_START: // 行動開始時
                            unit.ability_action_start.push(ability_info);
                            break;
                        case ABILIRY_ENEMY_START: // 敵ターン開始時
                            unit.ability_enemy_start.push(ability_info);
                            break;
                        case ABILIRY_ADDITIONALTURN: // 追加ターン
                            unit.ability_additional_turn.push(ability_info);
                            break;
                        case ABILIRY_OD_START: // オーバードライブ開始時
                            unit.ability_over_drive.push(ability_info);
                            break;
                        case ABILIRY_EX_SKILL_USE: // EXスキル使用時    
                            unit.ability_ex_skill_use.push(ability_info);
                            break;
                        case ABILIRY_RECEIVE_DAMAGE: // 被ダメージ時
                            unit.ability_receive_damage.push(ability_info);
                            break;
                        case ABILIRY_OTHER: // その他
                            if (ability_info.ability_id == 510) {
                                // 蒼天
                                turn_init.sp_cost_down = ability_info.effect_size;
                            }
                            unit.ability_other.push(ability_info);
                            break;
                    }
                }
            });
            unit.passive_skill_list.forEach(skill => {
                let passive_info = getPassiveInfo(skill.skill_id);
                if (!passive_info) {
                    return;
                }
                switch (passive_info.activation_timing) {
                    case ABILIRY_BATTLE_START: // 戦闘開始時
                        unit.ability_battle_start.push(passive_info);
                        break;
                    case ABILIRY_SELF_START: // 自分のターン開始時
                        unit.ability_self_start.push(passive_info);
                        break;
                    case ABILIRY_ACTION_START: // 行動開始時
                        unit.ability_action_start.push(passive_info);
                        break;
                    case ABILIRY_ENEMY_START: // 敵ターン開始時
                        unit.ability_enemy_start.push(passive_info);
                        break;
                    case ABILIRY_ADDITIONALTURN: // 追加ターン
                        unit.ability_additional_turn.push(passive_info);
                        break;
                    case ABILIRY_OD_START: // オーバードライブ開始時
                        unit.ability_over_drive.push(passive_info);
                        break;
                    case ABILIRY_EX_SKILL_USE: // EXスキル使用時    
                        unit.ability_ex_skill_use.push(passive_info);
                        break;
                    case ABILIRY_RECEIVE_DAMAGE: // 被ダメージ時
                        unit.ability_receive_damage.push(passive_info);
                        break;
                    case ABILIRY_OTHER: // その他
                        unit.ability_other.push(passive_info);
                        break;
                }
            });
        } else {
            unit.blank = true;
        }
        unit_list.push(unit);
    });

    // 初期設定を読み込み
    turn_init.field = Number($("#init_field").val());
    if (turn_init.field > 0) {
        turn_init.field_turn = -1;
    }
    turn_init.over_drive_gauge = Number($("#init_over_drive").val());
    turn_init.front_sp_add = Number($("#front_sp_add").val());
    turn_init.back_sp_add = Number($("#back_sp_add").val());
    turn_init.step_turn = Number($("#step_turn").val());
    turn_init.step_over_drive_down = Number($("#step_over_drive_down").val());
    turn_init.step_sp_down = Number($("#step_sp_down").val());

    turn_init.enemy_count = Number($("#enemy_select_count").val());;
    turn_init.unit_list = unit_list;

    // 戦闘開始アビリティ
    turn_init.abilityAction(ABILIRY_BATTLE_START);
    turn_init.setUserOperation();

    return turn_init;
}

// メンバー読み込み時の固有処理
function loadMember(select_chara_no, member_info) {
    loadExclusionSSkill(member_info)
}

// 除外スキルを保存
function saveExclusionSkill(member_info) {
    let style_id = member_info.style_info.style_id;
    localStorage.setItem(`exclusion_${style_id}`, member_info.exclusion_skill_list.join(","));
}

// 除外スキルを読み込む
function loadExclusionSSkill(member_info) {
    let style_id = member_info.style_info.style_id;
    let exclusion_skill_list = localStorage.getItem(`exclusion_${style_id}`);
    if (exclusion_skill_list) {
        member_info.exclusion_skill_list = exclusion_skill_list.split(",").map(Number);
    }
}

// ターンを進める
function proceedTurn(turn_data, isInitTurn) {
    // ターン開始処理
    initTurn(turn_data, isInitTurn);

    turn_list.push(turn_data);

    seq_last_turn = turn_list.length - 1;
    if (isInitTurn) {
        user_operation_list.push(turn_data.user_operation);
        // 画面反映
        updateTurnList(seq_last_turn);
    }
}

// ターン初期処理
function initTurn(turn_data) {
    turn_data.unitSort();
    if (turn_data.additional_turn) {
        turn_data.turnProceed(KB_NEXT_ADDITIONALTURN);
        turn_data.abilityAction(ABILIRY_ADDITIONALTURN);
    } else {
        let kb_action = turn_data.user_operation.kb_action;
        turn_data.turnProceed(kb_action);
        if (kb_action == KB_NEXT_ACTION) {
            turn_data.abilityAction(ABILIRY_ACTION_START);
        }
    }
}

// ターンを戻す
function returnTurn(seq_turn) {
    // 指定されたnumber以上の要素を削除
    turn_list = turn_list.slice(0, seq_turn + 1);
    seq_last_turn = turn_list.length - 1;
    user_operation_list = user_operation_list.slice(0, seq_turn + 1);

    // 画面反映
    updateTurnList(seq_last_turn);
}

// スキルデータ更新
const skillUpdate = (turn_data, skill_id, place_no) => {
    const unit = turn_data.unit_list.filter(unit => unit.place_no === place_no)[0];
    unit.select_skill_id = skill_id;
    if (skill_id !== 0) {
        unit.sp_cost = getSpCost(turn_data, getSkillData(skill_id), unit);
    } else {
        unit.sp_cost = 0;
    }
}

// ターンデータ再生成
const recreateTurnData = (turn_data, last_turn_operation, isLoadMode) => {
    // ユーザ操作リストのチェック
    user_operation_list.forEach((item) => {
        item.used = compereUserOperation(item, turn_data) <= 0;
    })

    while (compereUserOperation(turn_data.user_operation, last_turn_operation) < 0) {
        // 現ターン処理
        turn_data = deepClone(turn_data);
        startAction(turn_data);
        proceedTurn(turn_data, false);
        // ユーザ操作の更新
        updateUserOperation(turn_data);
        // ユーザ操作をターンに反映
        reflectUserOperation(turn_data, isLoadMode);
    }
    // ユーザ操作リストの削除
    user_operation_list = user_operation_list.filter((item) => item.used)
    updateTurnList(turn_list);
}

// ユーザ操作の取得
const updateUserOperation = (turn_data) => {
    let filtered = user_operation_list.filter((item) =>
        compereUserOperation(item, turn_data) == 0
    );
    let user_operation = turn_data.user_operation;
    if (filtered.length === 0) {
        turn_data.user_operation.kb_action = KB_NEXT_ACTION;
        user_operation_list.push(turn_data.user_operation);
        // 表示確認用
        user_operation_list.sort((a, b) => compereUserOperation(a, b));
    } else {
        user_operation = filtered[0];
        turn_data.user_operation = user_operation;
    }
    user_operation.used = true;
}

// ユーザ操作をターンに反映
const reflectUserOperation = (turn_data, isLoadMode) => {
    // 配置変更
    turn_data.unit_list.forEach((unit) => {
        if (unit.blank) return;
        let operation_place_no = turn_data.user_operation.place_style.findIndex((item) =>
            item === unit.style.style_info.style_id);
        if (turn_data.additional_turn) {
            if (!isLoadMode) {
                if (operation_place_no != unit.place_no) {
                    turn_data.user_operation.select_skill[unit.place_no].skill_id = unit.place_no < 3 ? unit.init_skill_id : SKILL_NONE;
                    turn_data.user_operation.place_style[unit.place_no] = unit.style.style_info.style_id;
                }
                return;
            }
        }
        unit.place_no = operation_place_no;
    })
    // オーバードライブ発動
    if (turn_data.user_operation.trigger_over_drive && turn_data.over_drive_gauge > 100) {
        turn_data.startOverDrive();
    }
    // スキル設定
    turn_data.unit_list.forEach((unit) => {
        if (unit.blank) return;
        const skill = turn_data.user_operation.select_skill[unit.place_no];
        unit.buff_target_chara_id = skill.buff_target_chara_id;
        unit.buff_effect_select_type = skill.buff_effect_select_type;
        skillUpdate(turn_data, turn_data.user_operation.select_skill[unit.place_no].skill_id, unit.place_no);
    })
    // OD再計算
    turn_data.add_over_drive_gauge = getOverDrive(turn_data);
    // 行動反映
    if (turn_data.over_drive_gauge + turn_data.add_over_drive_gauge < 100) {
        turn_data.user_operation.kb_action = KB_NEXT_ACTION;
    }
    // OD発動反映
    turn_data.trigger_over_drive = turn_data.user_operation.trigger_over_drive;
}

// ユーザ操作の比較
const compereUserOperation = (comp1, comp2) => {
    if (comp1.turn_number !== comp2.turn_number) {
        return comp1.turn_number - comp2.turn_number;
    }
    if (comp1.finish_action !== comp2.finish_action) {
        return comp1.finish_action - comp2.finish_action;
    }
    if (comp1.end_drive_trigger_count !== comp2.end_drive_trigger_count) {
        return comp1.end_drive_trigger_count - comp2.end_drive_trigger_count;
    }
    if (comp1.over_drive_number !== comp2.over_drive_number) {
        return comp1.over_drive_number - comp2.over_drive_number;
    }
    if (comp1.additional_count !== comp2.additional_count) {
        return comp1.additional_count - comp2.additional_count;
    }
    return 0;
}

// バフアイコン取得
function getBuffIconImg(buff_info) {
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
        case BUFF_FUNNEL: // 連撃
        case BUFF_ABILITY_FUNNEL: // アビリティ連撃
            src += "IconFunnel";
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
        case BUFF_DIVA_BLESS: // 歌姫の加護
            src += "IconDivaBress";
            break;
        case BUFF_SHREDDING: // 速弾き
            src += "IconShredding";
            break;
        case BUFF_NAGATIVE: // ネガティブ
            src += "IconNegativeMind";
            break;
    }
    if (buff_info.buff_element != 0) {
        src += buff_info.buff_element;
    }
    src += ".webp";
    return src;
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

// パッシブ情報取得
function getPassiveInfo(skill_id) {
    const filtered_passive = skill_passive.filter((obj) => obj.skill_id == skill_id);
    return filtered_passive.length > 0 ? filtered_passive[0] : undefined;
}

// 行動開始
function startAction(turn_data) {
    // 追加ターンフラグ削除
    if (turn_data.additional_turn) {
        turn_data.additional_turn = false;
        turn_data.unitLoop(function (unit) {
            if (unit.additional_turn) {
                unit.additional_turn = false;
            } else {
                unit.no_action = true;
            }
        });
    }
    // フィールド判定
    let old_field = turn_data.old_field;
    let select_field = turn_data.user_operation.field;
    if (old_field != select_field && select_field) {
        // 変更があった場合はフィールドターンをリセット
        turn_data.field_turn = 0;
    }

    let seq = sortActionSeq(turn_data);
    // 攻撃後に付与されるバフ種
    const ATTACK_AFTER_LIST = [BUFF_ATTACKUP, BUFF_ELEMENT_ATTACKUP, BUFF_CRITICALRATEUP, BUFF_CRITICALDAMAGEUP, BUFF_ELEMENT_CRITICALRATEUP,
        BUFF_ELEMENT_CRITICALDAMAGEUP, BUFF_CHARGE, BUFF_DAMAGERATEUP];
    $.each(seq, function (index, skill_data) {
        let skill_info = skill_data.skill_info;
        let unit_data = getUnitData(turn_data, skill_data.place_no);
        // SP消費してから行動
        unit_data.payCost();

        let buff_list = getBuffInfo(skill_info.skill_id);
        for (let i = 0; i < buff_list.length; i++) {
            let buff_info = buff_list[i];
            if (!(buff_info.skill_attack1 == 999 && ATTACK_AFTER_LIST.includes(buff_info.buff_kind))) {
                addBuffUnit(turn_data, buff_info, skill_data.place_no, unit_data);
            }
        }
        let attack_info;
        if (skill_info.skill_attribute == ATTRIBUTE_NORMAL_ATTACK) {
            attack_info = { "attack_id": 0, "attack_element": unit_data.normal_attack_element };
        } else if (skill_info.attack_id) {
            attack_info = getAttackInfo(skill_info.attack_id);
        }

        if (attack_info) {
            consumeBuffUnit(unit_data, attack_info, skill_info);
        }

        // EXスキル使用
        if (skill_info.skill_kind == KIND_EX_GENERATE || skill_info.skill_kind == KIND_EX_EXCLUSIVE) {
            // アビリティ
            unit_data.abilityAction(turn_data, ABILIRY_EX_SKILL_USE);
            // EXスキル連続使用
            if (checkBuffExist(unit_data.buff_list, BUFF_EX_DOUBLE)) {
                for (let i = 0; i < buff_list.length; i++) {
                    let buff_info = buff_list[i];
                    if (!(buff_info.skill_attack1 == 999 && ATTACK_AFTER_LIST.includes(buff_info.buff_kind))) {
                        addBuffUnit(turn_data, buff_info, skill_data.place_no, unit_data);
                    }
                }
                if (attack_info) {
                    consumeBuffUnit(unit_data, attack_info, skill_info);
                }
                unit_data.buff_list = unit_data.buff_list.filter(obj => obj.buff_kind !== BUFF_EX_DOUBLE);
            }
        }

        // 攻撃後にバフを付与
        for (let i = 0; i < buff_list.length; i++) {
            let buff_info = buff_list[i];
            if (buff_info.skill_attack1 == 999 && ATTACK_AFTER_LIST.includes(buff_info.buff_kind)) {
                addBuffUnit(turn_data, buff_info, skill_data.place_no, unit_data);
            }
        }
        origin(turn_data, skill_info, unit_data);
    });

    turn_data.over_drive_gauge += turn_data.add_over_drive_gauge;
    if (turn_data.over_drive_gauge > 300) {
        turn_data.over_drive_gauge = 300;
    }
    // 残りフィールドターン
    if (turn_data.field_turn > 1 && !turn_data.additional_turn) {
        turn_data.field_turn--;
    } else if (turn_data.field_turn == 1) {
        turn_data.field = 0;
    }
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
    // 初回判定
    unit_data.use_skill_list.push(skill_info.skill_id);
    switch (skill_info.skill_id) {
        case 177: // エリミネイト・ポッシブル
            let target_unit_data = turn_data.unit_list.filter(unit => unit?.style?.style_info?.chara_id === unit_data.buff_target_chara_id);
            target_unit_data[0].next_turn_min_sp = 3;
            break;
    }
    return;
}

// OD上昇量取得
const getOverDrive = (turn) => {
    // OD上昇量取得
    let seq = sortActionSeq(turn);
    let enemy_count = turn.enemy_count;
    let od_plus = 0;
    let temp_turn = deepClone(turn);
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
            if (buff_info.buff_kind == BUFF_OVERDRIVEPOINTUP) {
                // 条件判定
                if (buff_info.conditions != null) {
                    if (!judgmentCondition(buff_info.conditions, temp_turn, unit_data, buff_info.skill_id)) {
                        return true;
                    }
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
        let physical = getCharaData(unit_data.style.style_info.chara_id).physical;

        if (skill_info.skill_attribute == ATTRIBUTE_NORMAL_ATTACK) {
            if (isResist(physical, unit_data.normal_attack_element, skill_info.attack_id)) {
                correction = 1 + badies / 100;
                let hit_od = Math.floor(2.5 * correction * 100) / 100;
                let hit_count = 3;
                if (checkPassiveExist(unit_data.passive_skill_list, 606)) {
                    hit_count = enemy_count;
                }
                unit_od_plus += hit_od * hit_count;
            }
        } else if (skill_info.attack_id) {
            if (isResist(physical, attack_info.attack_element, skill_info.attack_id)) {
                correction = 1 + (badies + earring) / 100;
                let hit_od = Math.floor(2.5 * correction * 100) / 100;
                let enemy_target = enemy_count;
                if (attack_info.range_area == 1) {
                    enemy_target = 1;
                }
                let funnel_list = unit_data.getFunnelList();
                unit_od_plus += attack_info.hit_count * hit_od * enemy_target;
                unit_od_plus += funnel_list.length * hit_od * enemy_target;
                // EXスキル連続使用
                if (checkBuffExist(unit_data.buff_list, BUFF_EX_DOUBLE) && (skill_info.skill_kind == KIND_EX_GENERATE || skill_info.skill_kind == KIND_EX_EXCLUSIVE)) {
                    buff_list.forEach(function (buff_info) {
                        // 連撃のみ処理
                        if (BUFF_FUNNEL_LIST.includes(buff_info.buff_kind)) {
                            addBuffUnit(temp_turn, buff_info, skill_data.place_no, unit_data);
                        }
                    });
                    let funnel_list = unit_data.getFunnelList();
                    unit_od_plus += attack_info.hit_count * hit_od * enemy_target;
                    unit_od_plus += funnel_list.length * hit_od * enemy_target;
                }
            }
        }
        od_plus += unit_od_plus;
    });
    // // 後衛の選択取得
    [3, 4, 5].forEach(function (place_no) {
        let unit_data = getUnitData(temp_turn, place_no);
        let skill_id = unit_data.select_skill_id;
        if (skill_id == 0) {
            return true;
        }
        // 追撃
        if (skill_id == 3) {
            let chara_data = getCharaData(unit_data.style.style_info.chara_id);
            if (isResist(chara_data.physical, 0, 0)) {
                od_plus += chara_data.pursuit * 2.5;
            }
        }
    });
    return od_plus;
}

// 消費SP取得
function getSpCost(turn_data, skill_info, unit) {
    let sp_cost = skill_info.sp_cost;
    let sp_cost_down = turn_data.sp_cost_down
    if (harfSpSkill(turn_data, skill_info, unit)) {
        sp_cost = Math.ceil(sp_cost / 2);
    }
    if (ZeroSpSkill(turn_data, skill_info, unit)) {
        sp_cost = 0;
    }
    // 追加ターン
    if (turn_data.additional_turn) {
        // クイックリキャスト
        if (checkAbilityExist(unit.ability_other, 1506)) {
            sp_cost_down = 2;
        }
        // 優美なる剣舞
        if (checkAbilityExist(unit.ability_other, 1512)) {
            sp_cost_down = 2;
        }
        // 疾駆
        if (checkAbilityExist(unit.ability_other, 1515)) {
            sp_cost_down = 2;
        }
    }
    // オーバードライブ中
    if (turn_data.over_drive_max_turn > 0) {
        // 獅子に鰭
        if (checkAbilityExist(unit.ability_other, 1521)) {
            sp_cost_down = 2;
        }
        // 飛躍
        if (checkAbilityExist(unit.ability_other, 1525)) {
            sp_cost_down = 2;
        }
    }
    // 歌姫の加護
    if (checkBuffExist(unit.buff_list, BUFF_DIVA_BLESS)) {
        // 絶唱
        if (checkAbilityExist(unit.ability_other, 1522)) {
            sp_cost_down = 2;
        }
    }
    // カラスの鳴き声で
    if (skill_info.skill_id == 578) {
        const count = unit.use_skill_list.filter(value => value === 578).length;
        sp_cost = 8 + 4 * count;
        sp_cost = sp_cost > 20 ? 20 : sp_cost;
    }
    // SP全消費
    if (sp_cost == 99) {
        sp_cost = unit.sp + unit.over_drive_sp;
        sp_cost_down = 0;
    }
    sp_cost -= sp_cost_down;
    return sp_cost < 0 ? 0 : sp_cost;
}

// 消費SP半減
function harfSpSkill(turn_data, skill_info, unit_data) {
    // SP消費半減
    if (skill_info.skill_attribute == ATTRIBUTE_SP_HALF) {
        if (judgmentCondition(skill_info.attribute_conditions, turn_data, unit_data, skill_info.skill_id)) {
            return true;
        }
    }
    return false;
}

// 消費SP0
function ZeroSpSkill(turn_data, skill_info, unit_data) {
    // SP消費0
    if (skill_info.skill_attribute == ATTRIBUTE_SP_ZERO) {
        if (judgmentCondition(skill_info.attribute_conditions, turn_data, unit_data, skill_info.skill_id)) {
            return true;
        }
    }
    return false;
}

// 条件判定
function judgmentCondition(conditions, turn_data, unit_data, skill_id) {
    switch (conditions) {
        case CONDITIONS_FIRST_TURN: // 1ターン目
            return turn_data.turn_number == 1;
        case CONDITIONS_SKILL_INIT: // 初回
            return !unit_data.use_skill_list.includes(skill_id)
        case CONDITIONS_ADDITIONAL_TURN: // 追加ターン
            return turn_data.additional_turn;
        case CONDITIONS_DESTRUCTION_OVER_200: // 破壊率200%以上
        case CONDITIONS_BREAK: // ブレイク時
        case CONDITIONS_HAS_SHADOW: // 影分身
        case CONDITIONS_PERCENTAGE_30: // 確率30%
        case CONDITIONS_DOWN_TURN: // ダウンターン
        case CONDITIONS_BUFF_DISPEL: // バフ解除
            return unit_data.buff_effect_select_type == 1;
        case CONDITIONS_OVER_DRIVE: // オーバードライブ中
            return turn_data.over_drive_max_turn > 0;
        case CONDITIONS_DEFFENCE_DOWN: // 防御ダウン
            return checkBuffExist(turn_data.enemy_debuff_list, BUFF_DEFENSEDOWN);
        case CONDITIONS_FRAGILE: // 脆弱
            return checkBuffExist(turn_data.enemy_debuff_list, BUFF_FRAGILE);
        case CONDITIONS_TARGET_COVER: // 集中・挑発状態
            return checkBuffExist(turn_data.enemy_debuff_list, BUFF_PROVOKE) || checkBuffExist(turn_data.enemy_debuff_list, BUFF_COVER);
        case CONDITIONS_HAS_CHARGE: // チャージ
            return checkBuffExist(unit_data.buff_list, BUFF_CHARGE);
        case CONDITIONS_ENEMY_COUNT_1: // 敵1体
            return turn_data.enemy_count == 1;
        case CONDITIONS_ENEMY_COUNT_2: // 敵2体
            return turn_data.enemy_count == 2;
        case CONDITIONS_ENEMY_COUNT_3: // 敵3体
            return turn_data.enemy_count == 3;
        case CONDITIONS_31A_OVER_3: // 31A3人以上
            return checkMember(turn_data.unit_list, "31A") >= 3;
        case CONDITIONS_31E_OVER_3: // 31E3人以上
            return checkMember(turn_data.unit_list, "31E") >= 3;
        case CONDITIONS_FIELD_NOT_FIRE: // 火属性フィールド以外
            return turn_data.field != FIELD_FIRE && turn_data.field != FIELD_NORMAL;
        case CONDITIONS_DIVA_BLESS: // 歌姫の加護
            return checkBuffExist(unit_data.buff_list, BUFF_DIVA_BLESS);
        case CONDITIONS_NOT_DIVA_BLESS: // 歌姫の加護以外
            return !checkBuffExist(unit_data.buff_list, BUFF_DIVA_BLESS);
        case CONDITIONS_NOT_NEGATIVE: // ネガティブ以外
            return !checkBuffExist(unit_data.buff_list, BUFF_NAGATIVE);
    }
    return true;
}

function getFieldElement(turn_data) {
    let field_element = Number(turn_data.field);
    if (field_element == FIELD_RICE || field_element == FIELD_SANDSTORM) {
        field_element = 0;
    }
    return field_element;
}

// バフを追加
function addBuffUnit(turn_data, buff_info, place_no, use_unit_data) {
    // 条件判定
    if (buff_info.conditions != null) {
        if (!judgmentCondition(buff_info.conditions, turn_data, use_unit_data, buff_info.skill_id)) {
            return;
        }
    }

    // 個別判定
    switch (buff_info.buff_id) {
        // 選択されなかった
        case 2: // トリック・カノン(攻撃力低下)
            if (use_unit_data.buff_effect_select_type == 0) {
                return;
            }
            break;
    }
    switch (buff_info.skill_id) {
        case 557: // 極彩色
            let field_element = getFieldElement(turn_data);
            if (buff_info.buff_element != field_element) {
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
        case BUFF_FUNNEL: // 連撃
        case BUFF_RECOIL: // 行動不能
        case BUFF_GIVEATTACKBUFFUP: // バフ強化
        case BUFF_GIVEDEBUFFUP: // デバフ強化
        case BUFF_ARROWCHERRYBLOSSOMS: // 桜花の矢
        case BUFF_ETERNAL_OARH: // 永遠なる誓い
        case BUFF_EX_DOUBLE: // EXスキル連続使用
        case BUFF_BABIED: // オギャり
        case BUFF_DIVA_BLESS: // 歌姫の加護
        case BUFF_SHREDDING: // 速弾き
            // バフ追加
            target_list = getTargetList(turn_data, buff_info.range_area, buff_info.target_element, place_no, use_unit_data.buff_target_chara_id);
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
                if (unit_data.blank) {
                    return;
                }
                // 単一バフ
                if (SINGLE_BUFF_LIST.includes(buff_info.buff_kind)) {
                    if (checkBuffExist(unit_data.buff_list, buff_info.buff_kind)) {
                        if (buff_info.effect_count > 0) {
                            // 残ターン更新
                            let filter_list = unit_data.buff_list.filter(function (buff) {
                                return buff.buff_kind == buff_info.buff_kind;
                            })
                            filter_list[0].rest_turn = buff_info.effect_count;
                        }
                        return true;
                    }
                }
                if (isAloneActivation(buff_info)) {
                    if (checkBuffIdExist(unit_data.buff_list, buff_info.buff_id)) {
                        if (buff_info.effect_count > 0) {
                            // 残ターン更新
                            let filter_list = unit_data.buff_list.filter(function (buff) {
                                return buff.buff_id == buff_info.buff_id;
                            })
                            filter_list[0].rest_turn = buff_info.effect_count;
                        }
                        return true;
                    }
                }
                let buff = createBuffData(buff_info, use_unit_data);
                unit_data.buff_list.push(buff);
            });
            break;
        case BUFF_MORALE: // 士気
            // バフ追加
            target_list = getTargetList(turn_data, buff_info.range_area, buff_info.target_element, place_no, use_unit_data.buff_target_chara_id);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(turn_data, target_no);
                if (unit_data.blank) {
                    return;
                }
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
                    buff.lv += buff_info.effect_size;
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
            target_list = getTargetList(turn_data, buff_info.range_area, buff_info.target_element, place_no, use_unit_data.buff_target_chara_id);
            $.each(target_list, function (index, target_no) {
                skillHealSp(turn_data, target_no, buff_info.min_power, buff_info.max_power, place_no, false, buff_info.buff_id);
            });
            break;
        case BUFF_ADDITIONALTURN: // 追加ターン
            target_list = getTargetList(turn_data, buff_info.range_area, buff_info.target_element, place_no, use_unit_data.buff_target_chara_id);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(turn_data, target_no);
                unit_data.additional_turn = true;
            });
            turn_data.additional_turn = true;
            break;
        case BUFF_FIELD: // フィールド
            turn_data.field = buff_info.buff_element;
            let field_turn = buff_info.effect_count;
            if (field_turn > 0) {
                // 天長地久
                if (checkAbilityExist(use_unit_data.ability_other, 603)) {
                    field_turn = 0;
                }
                // メディテーション
                if (checkPassiveExist(use_unit_data.passive_skill_list, 501)) {
                    field_turn = 0;
                }
            }
            turn_data.field_turn = field_turn;
            break;
        case BUFF_DISPEL: // ディスペル
            target_list = getTargetList(turn_data, buff_info.range_area, buff_info.target_element, place_no, use_unit_data.buff_target_chara_id);
            $.each(target_list, function (index, target_no) {
                let unit_data = getUnitData(turn_data, target_no);
                unit_data.buff_list = unit_data.buff_list.filter(function (buff_info) {
                    return buff_info.buff_kind != BUFF_RECOIL && buff_info.buff_kind != BUFF_NAGATIVE;
                });
            });
            break;
        default:
            break;
    }
}

function skillHealSp(turn_data, target_no, add_sp, limit_sp, use_place_no, is_recursion, buff_id) {
    let unit_data = getUnitData(turn_data, target_no);
    let unit_sp = unit_data.sp;
    let minus_sp = 0;
    // クレール・ド・リュンヌ(＋)、収穫祭+は消費SPを加味する。
    if (buff_id == 120 || buff_id == 121 || buff_id == 229) {
        minus_sp = unit_data.sp_cost;
    }
    unit_sp += add_sp;
    if (unit_sp + unit_data.over_drive_sp - minus_sp > limit_sp) {
        unit_sp = limit_sp - unit_data.over_drive_sp + minus_sp;
    }
    if (unit_sp < unit_data.sp) {
        unit_sp = unit_data.sp
    }
    unit_data.sp = unit_sp;

    if (!is_recursion) {
        // 愛嬌
        if (checkAbilityExist(unit_data.ability_other, 1605) && target_no != use_place_no) {
            skillHealSp(turn_data, target_no, 3, 30, null, true, 0)
        }
        // お裾分け
        if (checkAbilityExist(unit_data.ability_other, 1606) && target_no != use_place_no) {
            let target_list = getTargetList(turn_data, RANGE_ALLY_ALL, 0, target_no, null);
            $.each(target_list, function (index, target_no) {
                skillHealSp(turn_data, target_no, 2, 30, null, true, 0)
            });
        }
    }
}

function createBuffData(buff_info, use_unit_data) {
    let buff = new buff_data();
    buff.buff_kind = buff_info.buff_kind;
    buff.buff_element = buff_info.buff_element;
    buff.effect_size = buff_info.effect_size;
    buff.effect_count = buff_info.effect_count;
    buff.buff_name = buff_info.buff_name
    buff.skill_id = buff_info.skill_id;
    buff.buff_id = buff_info.buff_id;
    buff.max_power = buff_info.max_power;
    buff.rest_turn = buff_info.effect_count == 0 ? -1 : buff_info.effect_count;
    switch (buff_info.buff_kind) {
        case BUFF_DEFENSEDOWN: // 防御力ダウン
        case BUFF_ELEMENT_DEFENSEDOWN: // 属性防御力ダウン
        case BUFF_FRAGILE: // 脆弱
        case BUFF_DEFENSEDP: // DP防御力ダウン 
            // ダブルリフト
            if (checkAbilityExist(use_unit_data.ability_other, 1516)) {
                buff.rest_turn++;
            }
            break;
        case BUFF_FUNNEL: // 連撃
            buff.effect_sum = buff_info.effect_size * buff_info.max_power;
            break;
    }
    return buff;
}

// 単独発動判定
function isAloneActivation(buff_info) {
    if (ALONE_ACTIVATION_BUFF_KIND.includes(buff_info.buff_kind)) {
        return buff_info.effect_count > 0;
    }
    return false;
}

// 攻撃時にバフ消費
function consumeBuffUnit(unit_data, attack_info, skill_info) {
    let consume_kind = [];
    let consume_count = 2
    if (skill_info.attack_id) {
        // 連撃消費
        unit_data.getFunnelList();
    }
    // バフ消費
    let buff_list = unit_data.buff_list;
    for (let i = buff_list.length - 1; i >= 0; i--) {
        buff_info = buff_list[i];
        const countWithFilter = consume_kind.filter(buff_kind => buff_kind === buff_info.buff_kind).length;
        if (buff_info.rest_turn > 0) {
            // 残ターンバフは現状単独発動のみ
            for (j = 0; j < consume_count; j++) {
                consume_kind.push(buff_info.buff_kind);
            }
            continue;
        }
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
                        let physical = getCharaData(unit_data.style.style_info.chara_id).physical;
                        if (!isWeak(physical, attack_info.attack_element, attack_info.attack_id)) {
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
                    // 通常攻撃でも消費
                    buff_list.splice(i, 1);
                    // 星屑の航路は消費しない。
                    if (buff_info.skill_id == 67 || buff_info.skill_id == 491) {
                        continue;
                    }
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
        case BUFF_FUNNEL: // 連撃
        case BUFF_ABILITY_FUNNEL: // アビリティ連撃
            switch (buff_info.effect_size) {
                case 10:
                    buff_kind_name += "連撃(小)";
                    break
                case 20:
                    buff_kind_name += "連撃(中)";
                    break
                case 40:
                    buff_kind_name += "連撃(大)";
                    break
                case 80:
                    buff_kind_name += "連撃(特大)";
                    break
            }
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
        case BUFF_DIVA_BLESS: // 歌姫の加護
            buff_kind_name += "歌姫の加護";
            break;
        case BUFF_SHREDDING: // 速弾き
            buff_kind_name += "速弾き";
            break;
        case BUFF_NAGATIVE: // ネガティブ
            buff_kind_name += "ネガティブ";
            break;
        default:
            break;
    }
    return buff_kind_name;
}


// ターゲットリスト追加
function getTargetList(turn_data, range_area, target_element, place_no, buff_target_chara_id) {
    let target_list = [];
    let target_unit_data;
    switch (range_area) {
        case RANGE_FIELD: // 場
            break;
        case RANGE_ENEMY_UNIT: // 敵単体
            break;
        case RANGE_ENEMY_ALL: // 敵全体
            break;
        case RANGE_ALLY_UNIT: // 味方単体
        case RANGE_OTHER_UNIT: // 自分以外の味方単体
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
        case RANGE_FRONT_OTHER: // 自分以外の前衛
            target_list = [...Array(3).keys()].filter(num => num !== place_no);
            break;
        case RANGE_31C_MEMBER: // 31Cメンバー
            target_list = getTargetPlaceList(turn_data.unit_list, CHARA_ID_31C);
            break;
        case RANGE_31E_MEMBER: // 31Eメンバー
            target_list = getTargetPlaceList(turn_data.unit_list, CHARA_ID_31E);
            break;
        case CHARA_ID_MARUYAMA: // 丸山部隊メンバー
            target_list = getTargetPlaceList(turn_data.unit_list, CHARA_ID_MARUYAMA);
            break;
        case RANGE_RUKA_SHARO: // 月歌とシャロ
            target_list = getTargetPlaceList(turn_data.unit_list, CHARA_ID_RUKA_SHARO);
            break;
        default:
            break;
    }
    if (target_element != 0) {
        for (let i = target_list.length - 1; i >= 0; i--) {
            let unit = getUnitData(turn_data, target_list[i]);
            if (unit.blank || (unit.style.style_info.element != target_element && unit.style.style_info.element2 != target_element)) {
                target_list.splice(i, 1);
            }
        }
    }
    return target_list;
}

// メンバーリスト作成
function getTargetPlaceList(unit_list, member_id_list) {
    return member_id_list.reduce((acc, member_id) => {
        const place_no = charaIdToPlaceNo(unit_list, member_id);
        if (place_no !== null) { // nullを除外
            acc.push(place_no);
        }
        return acc;
    }, []);
}
// キャラIDから場所番号を取得
function charaIdToPlaceNo(unit_list, member_id) {
    for (let unit of unit_list) {
        if (unit.style?.style_info?.chara_id == member_id) {
            return unit.place_no;
        }
    }
    return null;
}

// 行動順を取得
const sortActionSeq = (turn_data) => {
    let buff_seq = [];
    let attack_seq = [];

    // 前衛のスキルを取得
    turn_data.unit_list.forEach((unit, index) => {
        let skill_id = unit.select_skill_id;
        let place_no = unit.place_no;
        // 前衛以外
        if (skill_id == 0 || 3 <= place_no) {
            return true;
        }
        // 追加ターン以外
        if (turn_data.additional_turn && !unit.additional_turn) {
            return true;
        }
        // 行動不能
        if (checkBuffExist(unit.buff_list, BUFF_RECOIL)) {
            return true;
        }
        let skill_info = getSkillData(skill_id);
        let skill_data = {
            skill_info: skill_info,
            place_no: place_no
        };
        if (skill_info.attack_id || skill_info.skill_attribute == ATTRIBUTE_NORMAL_ATTACK) {
            attack_seq.push(skill_data);
        } else {
            buff_seq.push(skill_data);
        }
    });
    attack_seq.sort((a, b) => a.place_no - b.place_no);
    buff_seq.sort((a, b) => a.place_no - b.place_no);
    // バフとアタックの順序を結合
    return buff_seq.concat(attack_seq);
}