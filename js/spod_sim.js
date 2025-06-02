let select_troops = localStorage.getItem('select_troops');
let select_style_list = Array(6).fill(undefined);
// 使用不可スタイル
const NOT_USE_STYLE = [36];
// 制限アビリティ
const CONSTRAINTS_ABILITY = [
    1136, // 勝勢
    1138, // ラストリゾート
    1210, // アルゴリズム
    1505, // 激動
    1509, // 怪盗乱麻
    1523, // アンコール
    1525, // ポジショニング
];
// 謎の処理順序
const ACTION_ORDER = [1, 0, 2, 3, 4, 5];

let physical_name = ["", "斬", "突", "打"];
let element_name = ["無", "火", "氷", "雷", "光", "闇"];
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
const ABILIRY = {
    BATTLE_START: 0,
    SELF_START: 1,
    ACTION_START: 2,
    ENEMY_START: 3,
    ADDITIONALTURN: 4,
    OD_START: 5,
    BREAK: 6,
    RECEIVE_DAMAGE: 7,
    EX_SKILL_USE: 8,
    PURSUIT: 9,
    OTHER: 99,
}

const BUFF_FUNNEL_LIST = [BUFF_FUNNEL, BUFF_ABILITY_FUNNEL];
const SINGLE_BUFF_LIST = [BUFF_CHARGE, BUFF_RECOIL, BUFF_ARROWCHERRYBLOSSOMS, BUFF_ETERNAL_OARH, BUFF_EX_DOUBLE, BUFF_BABIED, BUFF_DIVA_BLESS, BUFF.YAMAWAKI_SERVANT];
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


// SPチェック
function checkSp(turn_data, range_area, sp) {
    let target_list = getTargetList(turn_data, range_area, null, null, null);
    let exist_list = target_list.filter(function (target_no) {
        let unit_data = getUnitData(turn_data, target_no);
        return unit_data.sp < sp;
    })
    return exist_list.length > 0;
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

// ユーザ操作の取得
const updateUserOperation = (user_operation_list, turn_data) => {
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
                    setInitSkill(unit);
                    turn_data.user_operation.select_skill[unit.place_no].skill_id = unit.select_skill_id;
                    turn_data.user_operation.place_style[unit.place_no] = unit.style.style_info.style_id;
                }
                return;
            }
        }
        unit.place_no = operation_place_no;
    })
    // オーバードライブ発動
    if (turn_data.user_operation.trigger_over_drive && turn_data.over_drive_gauge > 100) {
        startOverDrive(turn_data);
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
        case BUFF.YAMAWAKI_SERVANT: // 山脇様のしもべ
            src += "IconYamawakiServant";
            break;
        case BUFF.HIGH_BOOST: // ハイブースト状態
            src += "IconHighBoost";
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
    return filtered_ability.length > 0 ? JSON.parse(JSON.stringify(filtered_ability[0])) : undefined;
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
        unitLoop(function (unit) {
            if (unit.additional_turn) {
                unit.additional_turn = false;
            } else {
                unit.no_action = true;
            }
        }, turn_data.unit_list);
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
    const front_cost_list = [];
    for (const skill_data of seq) {
        let skill_info = skill_data.skill_info;
        let unit_data = getUnitData(turn_data, skill_data.place_no);
        let sp_cost = unit_data.sp_cost;
        // SP消費してから行動
        payCost(unit_data);

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
            front_cost_list.push(sp_cost);
            attack_info = getAttackInfo(skill_info.attack_id);
        }

        if (attack_info) {
            consumeBuffUnit(turn_data, unit_data, attack_info, skill_info);
        }

        // EXスキル使用
        if (skill_info.skill_kind == KIND_EX_GENERATE || skill_info.skill_kind == KIND_EX_EXCLUSIVE) {
            // アビリティ
            abilityActionUnit(turn_data, ABILIRY_EX_SKILL_USE, unit_data);
            // EXスキル連続使用
            if (checkBuffExist(unit_data.buff_list, BUFF_EX_DOUBLE)) {
                for (let i = 0; i < buff_list.length; i++) {
                    let buff_info = buff_list[i];
                    if (!(buff_info.skill_attack1 == 999 && ATTACK_AFTER_LIST.includes(buff_info.buff_kind))) {
                        addBuffUnit(turn_data, buff_info, skill_data.place_no, unit_data);
                    }
                }
                if (attack_info) {
                    consumeBuffUnit(turn_data, unit_data, attack_info, skill_info);
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
    }

    // 後衛の選択取得
    [3, 4, 5].forEach(function (place_no) {
        let unit_data = getUnitData(turn_data, place_no);
        if (unit_data.blank) {
            return;
        }
        let skill_id = unit_data.select_skill_id;
        // 無し
        if (skill_id == SKILL.NONE) {
            return true;
        }
        // 追撃
        if (skill_id == SKILL.PURSUIT) {
            abilityActionUnit(turn_data, ABILIRY.PURSUIT, unit_data)
            return true;
        }

        // 自動追撃
        if (skill_id == SKILL.AUTO_PURSUIT) {
            front_cost_list.filter(cost => cost <= 8).forEach(cost => {
                abilityActionUnit(turn_data, ABILIRY.PURSUIT, unit_data)
            });
            return true;
        }
        let skill_info = getSkillData(skill_id)
        let attack_info = getAttackInfo(skill_info.attack_id);
        if (attack_info) {
            // SP消費してから行動
            payCost(unit_data);

            let buff_list = getBuffInfo(skill_info.skill_id);
            for (let i = 0; i < buff_list.length; i++) {
                let buff_info = buff_list[i];
                if (!(buff_info.skill_attack1 == 999 && ATTACK_AFTER_LIST.includes(buff_info.buff_kind))) {
                    addBuffUnit(turn_data, buff_info, place_no, unit_data);
                }
            }
            consumeBuffUnit(turn_data, unit_data, attack_info, skill_info);
        }
        if (skill_id == 633) {
            // ネコジェット・シャテキ後自動追撃
            abilityActionUnit(turn_data, ABILIRY.PURSUIT, unit_data)
            const validCosts = front_cost_list.filter(cost => cost <= 8);
            validCosts.slice(0, Math.max(validCosts.length - 1, 0)).forEach(() => {
                abilityActionUnit(turn_data, ABILIRY.PURSUIT, unit_data)
            });
        }
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
function isResist(enemy_info, physical, element, attack_id) {
    let physical_rate = enemy_info[`physical_${physical}`];
    let element_rate = enemy_info[`element_${element}`];
    if (PENETRATION_ATTACK_LIST.includes(attack_id)) {
        physical_rate = 400;
        element_rate = 100;
    }
    return physical_rate / 100 * element_rate / 100 >= 1;
}

// 弱点判定
function isWeak(enemy_info, physical, element, attack_id) {
    if (PENETRATION_ATTACK_LIST.includes(attack_id)) {
        return true;
    }
    let physical_rate = enemy_info[`physical_${physical}`];
    let element_rate = enemy_info[`element_${element}`];
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
        case 617: // ドリーミー・ガーデン
            let target_unit_list = turn_data.unit_list.filter(unit => unit?.style?.style_info?.chara_id !== unit_data.style.style_info.chara_id);
            target_unit_list.forEach(unit => unit.next_turn_min_sp = 10);
            break;
    }
    return;
}

// OD上昇量取得
const getOverDrive = (turn) => {
    // OD上昇量取得
    const seq = sortActionSeq(turn);
    const enemy_count = turn.enemy_count;
    let od_plus = 0;
    const temp_turn = deepClone(turn);
    const front_cost_list = [];

    for (const skill_data of seq) {
        const skill_info = skill_data.skill_info;
        const unit_data = getUnitData(temp_turn, skill_data.place_no);
        const buff_list = getBuffInfo(skill_info.skill_id);
        const attack_info = getAttackInfo(skill_info.attack_id);
        let unit_od_plus = 0;
        // オギャり状態
        let badies = checkBuffExist(unit_data.buff_list, BUFF_BABIED) ? 20 : 0;
        const earring = skill_info.attack_id ? getEarringEffectSize(attack_info.hit_count, unit_data) : 0;

        for (const buff_info of buff_list) {
            // OD増加
            if (buff_info.buff_kind == BUFF_OVERDRIVEPOINTUP) {
                // 条件判定
                if (buff_info.conditions && !judgmentCondition(buff_info.conditions, temp_turn, unit_data, buff_info.skill_id)) {
                    continue;
                }
                // サービス・エースが可変
                let correction = 1 + (badies + earring) / 100;
                unit_od_plus += Math.floor(buff_info.max_power * correction * 100) / 100;
            }
            // 連撃、オギャり状態、チャージ処理
            const PROC_KIND = [BUFF_BABIED, BUFF_CHARGE];
            if (BUFF_FUNNEL_LIST.includes(buff_info.buff_kind) || PROC_KIND.includes(buff_info.buff_kind)) {
                addBuffUnit(temp_turn, buff_info, skill_data.place_no, unit_data);
            }
        }
        let physical = getCharaData(unit_data.style.style_info.chara_id).physical;

        if (skill_info.skill_attribute == ATTRIBUTE_NORMAL_ATTACK) {
            if (isResist(turn.enemy_info, physical, unit_data.normal_attack_element, skill_info.attack_id)) {
                unit_od_plus += calcODGain(3, 1, badies);
            }
        } else if (skill_info.attack_id) {
            // 攻撃IDの変換(暫定)
            let attack_id = skill_info.attack_id
            switch (skill_info.attack_id) {
                case 83:
                    // 唯雅粛正
                    if (checkBuffExist(unit_data.buff_list, BUFF_CHARGE)) {
                        attack_id = 84;
                    }
                    break;
            }
            front_cost_list.push(unit_data.sp_cost);
            if (isResist(turn.enemy_info, physical, attack_info.attack_element, attack_id)) {
                let enemy_target = enemy_count;
                if (attack_info.range_area == 1) {
                    enemy_target = 1;
                }
                let funnel_list = getFunnelList(unit_data);
                unit_od_plus += calcODGain(attack_info.hit_count, enemy_target, badies, earring, funnel_list.length);
                // EXスキル連続使用
                if (checkBuffExist(unit_data.buff_list, BUFF_EX_DOUBLE) && (skill_info.skill_kind == KIND_EX_GENERATE || skill_info.skill_kind == KIND_EX_EXCLUSIVE)) {
                    buff_list.forEach(function (buff_info) {
                        // 連撃のみ処理
                        if (BUFF_FUNNEL_LIST.includes(buff_info.buff_kind)) {
                            addBuffUnit(temp_turn, buff_info, skill_data.place_no, unit_data);
                        }
                    });
                    let funnel_list = getFunnelList(unit_data);
                    unit_od_plus += calcODGain(attack_info.hit_count, enemy_target, badies, earring, funnel_list.length);
                }
            }
        }
        od_plus += unit_od_plus;
    }
    // // 後衛の選択取得
    [3, 4, 5].forEach(function (place_no) {
        let unit_data = getUnitData(temp_turn, place_no);
        if (unit_data.blank) {
            return;
        }
        let skill_id = unit_data.select_skill_id;
        if (skill_id == SKILL.NONE) {
            return true;
        }
        // 追撃
        if (skill_id == SKILL.PURSUIT) {
            let chara_data = getCharaData(unit_data.style.style_info.chara_id);
            if (isResist(turn.enemy_info, chara_data.physical, 0, 0)) {
                od_plus += chara_data.pursuit * 2.5;
            }
            return true;
        }
        let physical = getCharaData(unit_data.style.style_info.chara_id).physical;
        // 自動追撃
        if (skill_id == SKILL.AUTO_PURSUIT) {
            if (isResist(turn.enemy_info, physical, 0, 0)) {
                let chara_data = getCharaData(unit_data.style.style_info.chara_id)
                front_cost_list.filter(cost => cost <= 8).forEach(cost => {
                    od_plus += chara_data.pursuit * 2.5
                });
            }
            return true;
        }

        let skill_info = getSkillData(skill_id)
        let attack_info = getAttackInfo(skill_info.attack_id);
        if (attack_info) {
            let badies = checkBuffExist(unit_data.buff_list, BUFF_BABIED) ? 20 : 0;
            const earring = skill_info.attack_id ? getEarringEffectSize(attack_info.hit_count, unit_data) : 0;
            if (isResist(turn.enemy_info, physical, attack_info.attack_element, skill_info.attack_id)) {
                let enemy_target = enemy_count;
                if (attack_info.range_area == 1) {
                    enemy_target = 1;
                }
                let funnel_list = getFunnelList(unit_data);
                od_plus += calcODGain(attack_info.hit_count, enemy_target, badies, earring, funnel_list.length);
            }
        }
        if (skill_id == 633) {
            // ネコジェット・シャテキ後自動追撃
            if (isResist(turn.enemy_info, physical, 0, 0)) {
                let chara_data = getCharaData(unit_data.style.style_info.chara_id)
                const validCosts = front_cost_list.filter(cost => cost <= 8);
                validCosts.slice(0, Math.max(validCosts.length - 1, 0)).forEach(() => {
                    od_plus += chara_data.pursuit * 2.5;
                });
            }
        }
    });
    return od_plus;
}

// OD計算
const calcODGain = (hitCount, enemyTarget, badies = 0, earring = 0, funnelCount = 0) => {
    const correction = 1 + (badies + earring) / 100;
    const hit_od = Math.floor(2.5 * correction * 100) / 100;
    return (hitCount * hit_od * enemyTarget) + (funnelCount * hit_od * enemyTarget);
};

// 消費SP取得
function getSpCost(turn_data, skill_info, unit) {
    if (!skill_info) {
        return 0;
    }
    const NON_ACTION_ATTRIBUTE = [1, 2, 3, 99];
    if (NON_ACTION_ATTRIBUTE.includes(skill_info.skill_attribute)) {
        return 0;
    }
    let sp_cost = skill_info.sp_cost;
    let sp_cost_down = turn_data.sp_cost_down;
    let sp_cost_up = 0;
    if (harfSpSkill(turn_data, skill_info, unit)) {
        sp_cost = Math.ceil(sp_cost / 2);
    }
    if (ZeroSpSkill(turn_data, skill_info, unit)) {
        return 0;
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
    // ハイブースト
    if (checkBuffExist(unit.buff_list, BUFF.HIGH_BOOST)) {
        sp_cost_up = 2;
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
        sp_cost_up = 0;
    }
    sp_cost += sp_cost_up - sp_cost_down;
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
        case CONDITIONS_DP_OVER_100: // DP100%以上
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
        case CONDITIONS.OVER_31C_3: // 31C3人以上
            return checkMember(turn_data.unit_list, "31C") >= 3;
        case CONDITIONS.OVER_31D_3: // 31D3人以上
            return checkMember(turn_data.unit_list, "31D") >= 3;
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
        case CONDITIONS_SP_UNDER_0_ALL: // SP0以下の味方がいる
            return checkSp(turn_data, RANGE_ALLY_ALL, 0);
        case CONDITIONS.SARVANT_OVER3: // 山脇様のしもべ3人以上
        case CONDITIONS.SARVANT_OVER5: // 山脇様のしもべ5人以上
        case CONDITIONS.SARVANT_OVER6: // 山脇様のしもべ6人以上
            let servant_count = 0;
            turn_data.unit_list.forEach((unit) => {
                if (checkBuffExist(unit.buff_list, BUFF.YAMAWAKI_SERVANT)) {
                    servant_count++;
                };
            })
            if (CONDITIONS.SARVANT_OVER3 == conditions) {
                return servant_count >= 3;
            } else if (CONDITIONS.SARVANT_OVER5 == conditions) {
                return servant_count >= 5;
            } else if (CONDITIONS.SARVANT_OVER6 == conditions) {
                return servant_count >= 6;
            }
        case CONDITIONS.USE_COUNT_2: // 2回目以降
            return 1 <= unit_data.use_skill_list.filter(id => id === skill_id).length;
        case CONDITIONS.USE_COUNT_3: // 3回目以降
            return 2 <= unit_data.use_skill_list.filter(id => id === skill_id).length;
        case CONDITIONS.USE_COUNT_4: // 4回目以降
            return 3 <= unit_data.use_skill_list.filter(id => id === skill_id).length;

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
        case BUFF.YAMAWAKI_SERVANT: // 山脇様のしもべ
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
                buff.lv = Math.min(buff.lv + buff_info.effect_size, 10);
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
    limit_sp = unit_data.limit_sp > limit_sp ? unit_data.limit_sp : limit_sp;
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
    let buff = {};
    buff.buff_kind = buff_info.buff_kind;
    buff.buff_element = buff_info.buff_element;
    buff.effect_size = buff_info.effect_size;
    buff.effect_count = buff_info.effect_count;
    buff.buff_name = buff_info.buff_name
    buff.skill_id = buff_info.skill_id;
    buff.buff_id = buff_info.buff_id;
    buff.max_power = buff_info.max_power;
    buff.rest_turn = buff_info.effect_count == 0 ? -1 : buff_info.effect_count;
    buff.lv = 0;
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
function consumeBuffUnit(turn_data, unit_data, attack_info, skill_info) {
    let consume_kind = [];
    let consume_count = 2
    if (skill_info.attack_id) {
        // 連撃消費
        getFunnelList(unit_data);
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
                        if (!isWeak(turn_data.enemy_info, physical, attack_info.attack_element, attack_info.attack_id)) {
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
        case BUFF.YAMAWAKI_SERVANT: // 山脇様のしもべ
            buff_kind_name += "山脇様のしもべ";
            break;
        case BUFF.HIGH_BOOST: // ハイブースト状態
            buff_kind_name += "ハイブースト";
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
            if (target_unit_data.length > 0) {
                target_list.push(target_unit_data[0].place_no);
            }
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
            if (target_unit_data.length > 0) {
                target_list.push(target_unit_data[0].place_no);
            }
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