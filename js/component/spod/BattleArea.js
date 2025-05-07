//** ターンデータ部 */
const unitLoop = (func, unit_list, arg1) => {
    unit_list.forEach(function (unit) {
        if (!unit.blank) {
            func(unit, arg1);
        }
    });
}

const unitOrderLoop = (func, unit_list) => {
    ACTION_ORDER.forEach(function (index) {
        let unit = unit_list[index];
        if (!unit.blank) {
            func(unit);
        }
    });
}

// 1:通常戦闘,2:後打ちOD,3:追加ターン
const turnProceed = (kb_next, turn) => {
    let turnProgress = false;
    turn.enemy_debuff_list.sort((a, b) => a.buff_kind - b.buff_kind);
    if (kb_next == KB_NEXT_ACTION) {
        // オーバードライブ
        if (turn.over_drive_max_turn > 0) {
            turn.over_drive_number++;
            unitLoop(unitOverDriveTurnProceed, turn.unit_list)
            if (turn.over_drive_max_turn < turn.over_drive_number) {
                // オーバードライブ終了
                turn.over_drive_max_turn = 0;
                turn.over_drive_number = 0;
                turn.end_drive_trigger_count++;
                if (turn.finish_action) {
                    turnProgress = true;
                    nextTurn(turn);
                }
            }
        } else {
            turnProgress = true;
            nextTurn(turn);
        }
        turn.additional_count = 0;
    } else if (kb_next == KB_NEXT_ADDITIONALTURN) {
        // 追加ターン
        turn.additional_count++;
    } else {
        // 行動開始＋OD発動
        startOverDrive(turn);
        turn.finish_action = true;
        turn.end_drive_trigger_count = 0;
        unitLoop(unitOverDriveTurnProceed, turn.unit_list);
    }
    // ターンごとに初期化
    turn.trigger_over_drive = false;
    turn.start_over_drive_gauge = turn.over_drive_gauge;
    turn.old_field = turn.field;
    turn.seq_turn++;
    unitLoop(function (unit) {
        if (unit.no_action) {
            unit.no_action = false;
            return;
        }
        buffConsumption(turnProgress, unit);
        unitTurnInit(turn.additional_turn, unit);
    }, turn.unit_list);
    setUserOperation(turn);
    if (turnProgress) {
        abilityAction(ABILIRY_SELF_START, turn);
    }
}

const setUserOperation = (turn) => {
    // 初期値を設定
    turn.user_operation = {
        field: null,
        enemy_count: null,
        select_skill: turn.unit_list.map(function (unit) {
            if (unit.blank) {
                return null;
            }
            return { skill_id: (unit.place_no < 3 ? unit.init_skill_id : SKILL_NONE) };
        }),
        place_style: turn.unit_list.map(function (unit) {
            return unit.blank ? 0 : unit.style.style_info.style_id;
        }),
        trigger_over_drive: false,
        selected_place_no: -1,
        kb_action: KB_NEXT_ACTION,
        finish_action: turn.finish_action,
        end_drive_trigger_count: turn.end_drive_trigger_count,
        turn_number: turn.turn_number,
        additional_count: turn.additional_count,
        over_drive_number: turn.over_drive_number,
        remark: "",
    }
}

const nextTurn = (turn) => {
    // 通常進行
    unitLoop(unitTurnProceed, turn.unit_list, turn);

    turn.turn_number++;
    turn.finish_action = false;
    turn.end_drive_trigger_count = 0;
    abilityAction(ABILIRY_RECEIVE_DAMAGE, turn);
    if (turn.turn_number % turn.step_turn_over_drive == 0) {
        turn.over_drive_gauge += turn.step_over_drive_gauge;
        if (turn.over_drive_gauge < -300) {
            turn.over_drive_gauge = -300;
        }
        if (turn.over_drive_gauge > 300) {
            turn.over_drive_gauge = 300;
        }
    }
    // 敵のデバフ消費
    debuffConsumption(turn);
}

const unitSort = (turn) => {
    turn.unit_list.sort((a, b) => a.place_no - b.place_no);
}

const getTurnNumber = (turn) => {
    const defalt_turn = "ターン" + turn.turn_number;
    // 追加ターン
    if (turn.additional_turn) {
        return `${defalt_turn} 追加ターン`;
    }
    // オーバードライブ中
    if (turn.over_drive_number > 0) {
        return `${defalt_turn} OverDrive${turn.over_drive_number}/${turn.over_drive_max_turn}`;
    }
    return defalt_turn;
}

const addOverDrive = (add_od_gauge, turn) => {
    turn.over_drive_gauge += add_od_gauge;
    if (turn.over_drive_gauge > 300) {
        turn.over_drive_gauge = 300;
    }
}

const startOverDrive = (turn) => {
    let over_drive_level = Math.floor(turn.over_drive_gauge / 100)
    turn.over_drive_number = 1;
    turn.over_drive_max_turn = over_drive_level;
    turn.over_drive_gauge = 0;
    turn.add_over_drive_gauge = 0;

    let sp_list = [0, 5, 12, 20];
    unitLoop(function (unit) {
        unit.over_drive_sp = sp_list[over_drive_level];
        unit.sp_cost = getSpCost(turn, getSkillData(unit.select_skill_id), unit);
    }, turn.unit_list);
    abilityAction(ABILIRY_OD_START, turn);
    turn.trigger_over_drive = true;
}

const removeOverDrive = (turn) => {
    turn.over_drive_number = 0;
    turn.over_drive_max_turn = 0;
    turn.over_drive_gauge = turn.start_over_drive_gauge;
    turn.add_over_drive_gauge = 0;

    unitLoop(function (unit) {
        unit.over_drive_sp = 0;
        unit.sp_cost = getSpCost(turn, getSkillData(unit.select_skill_id), unit);
    }, turn.unit_list);
    turn.trigger_over_drive = false;
}

const debuffConsumption = (turn) => {
    for (let i = turn.enemy_debuff_list.length - 1; i >= 0; i--) {
        let debuff = turn.enemy_debuff_list[i];
        if (debuff.rest_turn == 1) {
            turn.enemy_debuff_list.splice(i, 1);
        } else {
            debuff.rest_turn -= 1;
        }
    }
}

const abilityAction = (action_kbn, turn) => {
    unitOrderLoop(function (unit) {
        abilityActionUnit(turn, action_kbn, unit)
    }, turn.unit_list);
}
/** TurnDataここまで */

/** UnitDataここから */
const unitTurnInit = (additional_turn, unit) => {
    unit.buff_effect_select_type = 0;
    if (unit.place_no < 3 && (!additional_turn || unit.additional_turn)) {
        setInitSkill(unit);
    } else {
        unit.select_skill_id = SKILL_NONE;
    }
}

const unitTurnProceed = (unit, turn) => {
    buffSort(unit);
    if (unit.next_turn_min_sp > 0) {
        if (unit.next_turn_min_sp > unit.sp) {
            unit.sp = unit.next_turn_min_sp;
            unit.next_turn_min_sp = -1
        }
    }
    if (unit.sp < 20) {
        unit.sp += 2;
        if (unit.place_no < 3) {
            unit.sp += turn.front_sp_add;
        } else {
            unit.sp += turn.back_sp_add;
        }
        if ((turn.turn_number + 1) % turn.step_turn_sp == 0) {
            unit.sp += turn.step_sp_add;
        }
        if (unit.sp > 20) {
            unit.sp = 20
        }
    }
}

const setInitSkill = (unit) => {
    if (unit.place_no < 3) {
        unit.select_skill_id = unit.init_skill_id;
        unit.sp_cost = 0;
    } else {
        unit.select_skill_id = SKILL_NONE;
        unit.sp_cost = 0;
    }
    unit.buff_effect_select_type = null;
    unit.buff_target_chara_id = null;
}

const unitOverDriveTurnProceed = (unit) => {
    buffSort(unit);
    // OverDriveゲージをSPに加算
    unit.sp += unit.over_drive_sp;
    if (unit.sp > 99) unit.sp = 99;
    unit.over_drive_sp = 0;
}

const buffConsumption = (turnProgress, unit) => {
    for (let i = unit.buff_list.length - 1; i >= 0; i--) {
        let buff_info = unit.buff_list[i];
        if (!turnProgress) {
            // 単独発動と行動不能
            if (isAloneActivation(buff_info) || buff_info.buff_kind == BUFF_RECOIL) {
                if (buff_info.rest_turn == 1) {
                    unit.buff_list.splice(i, 1);
                } else {
                    buff_info.rest_turn -= 1;
                }
            }
        } else {
            // 全バフターン消費
            if (buff_info.rest_turn == 1) {
                unit.buff_list.splice(i, 1);
            } else {
                buff_info.rest_turn -= 1;
            }
        }
    }
}

const buffSort = (unit) => {
    unit.buff_list.sort((a, b) => {
        if (a.buff_kind === b.buff_kind) {
            return a.effect_size - b.effect_size;
        }
        return a.buff_kind - b.buff_kind;
    });
}

const payCost = (unit) => {
    // OD上限突破
    if (unit.sp + unit.over_drive_sp > 99) {
        unit.sp = 99 - unit.over_drive_sp;
    }
    if (unit.select_skill_id == 591) {
        // ノヴァエリミネーション
        unit.ep -= unit.sp_cost;
    } else {
        unit.sp -= unit.sp_cost;
    }
    unit.sp_cost = 0;
}

const getEarringEffectSize = (hit_count, unit) => {
    // ドライブ
    if (unit.earring_effect_size != 0) {
        hit_count = hit_count < 1 ? 1 : hit_count;
        hit_count = hit_count > 10 ? 10 : hit_count;
        return (unit.earring_effect_size - ((unit.earring_effect_size - 5) / 9 * (10 - hit_count)));
    }
    return 0;
}

const getFunnelList = (unit) => {
    let ret = [];
    let buff_funnel_list = unit.buff_list.filter(function (buff_info) {
        return BUFF_FUNNEL == buff_info.buff_kind && !isAloneActivation(buff_info);
    });
    let buff_unit_funnel_list = unit.buff_list.filter(function (buff_info) {
        return BUFF_FUNNEL == buff_info.buff_kind && isAloneActivation(buff_info);
    });
    let ability_list = unit.buff_list.filter(function (buff_info) {
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
    unit.buff_list = unit.buff_list.filter(function (item) {
        return !item.use_funnel || isAloneActivation(item) || ALONE_ACTIVATION_ABILITY_LIST.includes(item.ability_id);
    })
    return result_list;
}

const abilityActionUnit = (turn_data, action_kbn, unit) => {
    let action_list = [];
    switch (action_kbn) {
        case ABILIRY_BATTLE_START: // 戦闘開始時
            action_list = unit.ability_battle_start;
            break;
        case ABILIRY_SELF_START: // 自分のターン開始時
            action_list = unit.ability_self_start;
            break;
        case ABILIRY_ACTION_START: // 行動開始時
            action_list = unit.ability_action_start;
            break;
        case ABILIRY_ENEMY_START: // 敵のターン開始時
            action_list = unit.ability_enemy_start;
            break;
        case ABILIRY_ADDITIONALTURN: // 追加ターン
            action_list = unit.ability_additional_turn;
            break;
        case ABILIRY_OD_START: // オーバードライブ開始時
            action_list = unit.ability_over_drive;
            break;
        case ABILIRY_EX_SKILL_USE: // EXスキル使用
            action_list = unit.ability_ex_skill_use;
            break;
        case ABILIRY_RECEIVE_DAMAGE: // 被ダメージ時
            // 前衛のみ
            if (unit.place_no < 3) {
                action_list = unit.ability_receive_damage;
            }
            break;
        case ABILIRY_OTHER: // その他
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
        let target_list = getTargetList(turn_data, ability.range_area, ability.target_element, unit.place_no, null);
        let buff;
        switch (ability.conditions) {
            case "火属性フィールド":
                if (turn_data.field != FIELD_FIRE) {
                    return;
                }
                break;
            case "歌姫の加護":
                if (!checkBuffExist(unit.buff_list, BUFF_DIVA_BLESS)) {
                    return;
                };
                break;
            case "SP0以下":
                if (self.sp > 0) {
                    return;
                }
                break;
            case "OD100%未満":
                if (turn_data.over_drive_gauge >= 100) {
                    return;
                }
                break;
            case "OD0%未満":
                if (turn_data.over_drive_gauge >= 0) {
                    return;
                }
                break;
            case "山脇様のしもべ6人":
                for (let i = 0; i < 6; i++) {
                    let unit = turn_data.unit_list[i];
                    if (unit.blank) return;
                    if (!checkBuffExist(unit.buff_list, BUFF.YAMAWAKI_SERVANT)) {
                        return;
                    }
                }
                break;
            case "破壊率が200%以上":
            case "トークン4つ以上":
            case "敵のバフ解除":
                return;
        }
        switch (ability.effect_type) {
            case EFFECT_FUNNEL: // 連撃数アップ
                buff = {};
                buff.ability_id = ability.ability_id;
                buff.buff_kind = BUFF_ABILITY_FUNNEL;
                buff.buff_name = ability.ability_name;
                buff.buff_element = 0;
                buff.max_power = ability.effect_count;
                buff.effect_size = ability.effect_size;
                buff.effect_sum = ability.effect_size * ability.effect_count;
                buff.rest_turn = -1;
                unit.buff_list.push(buff);
                break;
            case EFFECT_OVERDRIVE_SP: // ODSPアップ
                $.each(target_list, function (index, target_no) {
                    let unit_data = getUnitData(turn_data, target_no);
                    unit_data.over_drive_sp += ability.effect_size;
                });
                break;
            case EFFECT_HEALSP: // SP回復
                if (ability.used && ability.ability_id == 1528) {
                    // 戦場の華
                    return;
                }
                ability.used = true;
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
                                case 1140: // 世界を滅ぼすお手伝いでゲス！
                                    // 山脇様のしもべチェック
                                    if (checkBuffExist(unit_data.buff_list, BUFF.YAMAWAKI_SERVANT)) {
                                        unit_data.sp += ability.effect_size;
                                    };
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
                unit.ep += ability.effect_size;
                if (unit.ep > 10) {
                    unit.ep = 10
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
                        buff = {};
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
                // V字回復,世界征服の始まりでゲス！
                const onlyUseList = [1207, 1209]
                if (ability.used && onlyUseList.includes(ability.ability_id)) {
                    return;
                }
                ability.used = true;
                turn_data.over_drive_gauge += ability.effect_size;
                if (turn_data.over_drive_gauge > 300) {
                    turn_data.over_drive_gauge = 300;
                }
                break;
            case EFFECT_ARROWCHERRYBLOSSOMS: // 桜花の矢
                buff = {};
                buff.buff_kind = BUFF_ARROWCHERRYBLOSSOMS;
                buff.buff_element = 0;
                buff.rest_turn = -1;
                buff.buff_name = ability.ability_name;
                unit.buff_list.push(buff);
                break;
            case EFFECT_CHARGE: // チャージ
                buff = {};
                buff.buff_kind = BUFF_CHARGE;
                buff.buff_element = 0;
                buff.rest_turn = -1;
                buff.buff_name = ability.ability_name;
                unit.buff_list.push(buff);
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
                buff = {};
                buff.buff_kind = BUFF_NAGATIVE;
                buff.buff_element = 0;
                buff.rest_turn = ability.effect_count + 1;
                buff.buff_name = ability.ability_name;
                unit.buff_list.push(buff);
                break;
            case EFFECT_ADDITIONALTURN: // 追加ターン
                if (turn_data.additional_count == 0) {
                    unit.additional_turn = true;
                    turn_data.additional_turn = true;
                }
                break;
            case EFFECT.YAMAWAKI_SERVANT: // 山脇様のしもべ
                buff = {};
                buff.buff_kind = BUFF.YAMAWAKI_SERVANT;
                buff.buff_element = 0;
                buff.rest_turn = -1;
                buff.buff_name = ability.ability_name;
                unit.buff_list.push(buff);
                break;
        }
    });
}
/** UnitDataここまで */

// 戦闘データ初期化
function cleanBattleData() {
    // 初期化
    battle_enemy_info = getEnemyInfo();
    for (let i = 1; i <= 3; i++) {
        battle_enemy_info[`physical_${i}`] = Number($(`#enemy_physical_${i}`).val());
    }
    for (let i = 0; i <= 5; i++) {
        battle_enemy_info[`element_${i}`] = Number($(`#enemy_element_${i}`).val());
    }
}

// ターン初期処理
function initTurn(turn_data) {
    unitSort(turn_data);
    if (turn_data.additional_turn) {
        turnProceed(KB_NEXT_ADDITIONALTURN, turn_data);
        abilityAction(ABILIRY_ADDITIONALTURN, turn_data);
    } else {
        let kb_action = turn_data.user_operation.kb_action;
        turnProceed(kb_action, turn_data);
        if (kb_action == KB_NEXT_ACTION) {
            abilityAction(ABILIRY_ACTION_START, turn_data);
        }
    }
}

const BattleArea = React.memo(({ hideMode, setHideMode, turnList, dispatch, loadData }) => {
    const [isCapturing, setIsCapturing] = React.useState(false);  // キャプチャ中の状態を管理
    const elementRef = React.useRef(null); // キャプチャ対象の要素参照

    const clickDownload = async () => {
        if (!elementRef.current) return;

        setIsCapturing(true); // キャプチャ前に表示切替
        try {
            const element = elementRef.current;
            const children = Array.from(element.children);
            const images = await captureChildren(children); // 子要素をキャプチャ
            // 画像を結合
            const finalImage = await mergeImages(images);
            // ダウンロード処理
            downloadImage(finalImage);
        } catch (error) {
            alert("画像生成に失敗しました");
        } finally {
            setIsCapturing(false); // キャプチャ後に元に戻す
        }
    };
    // 子要素をキャプチャして画像データを返す関数
    const captureChildren = async (children) => {
        const images = [];
        for (let child of children) {
            try {
                const imgData = await domtoimage.toPng(child);
                images.push(imgData);
            } catch (error) {
                console.error("画像キャプチャに失敗しました", error);
            }
        }
        return images;
    };

    // 画像をダウンロードする処理
    const downloadImage = (finalImage) => {
        const link = document.createElement("a");
        link.href = finalImage;
        link.download = "capture.png";
        link.click();
    };

    // 画像を結合する関数
    const mergeImages = async (imageDataArray) => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // 画像をすべて読み込む
            Promise.all(imageDataArray.map(src => new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
            }))).then(images => {
                if (images.length === 0) return resolve("");

                const width = images[0].width;
                const totalHeight = images.reduce((sum, img) => sum + img.height, 0) + 3 * (images.length + 1); // 3pxの隙間を追加

                canvas.width = width;
                canvas.height = totalHeight;
                // 背景色を白に設定
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                let offsetY = 3;
                images.forEach((img) => {
                    ctx.drawImage(img, 0, offsetY, img.width, img.height);
                    offsetY += img.height + 3;
                });

                resolve(canvas.toDataURL("image/png"));
            });
        });
    };

    // ターンを進める
    const proceedTurn = (turn_data, isInitTurn) => {
        // ターン開始処理
        initTurn(turn_data, isInitTurn);
        // 次ターン追加
        dispatch({ type: 'ADD_TURN_LIST', payload: turn_data });
    }

    // ターンを戻す
    const returnTurn = (seq_turn) => {
        // ターン削除
        dispatch({ type: 'DEL_TURN_LIST', payload: seq_turn });
    }

    // ターン再生成
    const recreateTurn = (seq_turn) => {
        // ターン削除
        dispatch({ type: 'UPD_TURN_LIST', payload: seq_turn });
    }

    // 引数のfuntionをまとめる
    const handlers = { proceedTurn, returnTurn, recreateTurn };

    const changeHideMode = (e) => {
        const hideMode = e.target.checked;
        setHideMode(hideMode);
    }

    let display_class = hideMode ? "hide_mode " : "show_mode";

    const [modal, setModa] = React.useState({
        isOpen: false,
        mode: ""
    });
    const openModal = (mode) => setModa({ isOpen: true, mode: mode });
    const closeModal = () => setModa({ isOpen: false, mode: "" });

    return (
        <div id="battle_area">
            {turnList.length == 0 ?
                <input type="button" id="btnLoad" value="読込" onClick={() => openModal("load")} />
                :
                <div className={display_class}>
                    <div className="flex justify-between mt-1">
                        <div className="flex mode_button">
                            <input type="checkbox" className="switch" id="mode_switch" onChange={(e) => changeHideMode(e)} /><label htmlFor="mode_switch">設定画面を隠す</label>
                        </div>
                        <div>
                            <input type="button" id="btnSave" value="保存" onClick={() => openModal("save")} />
                            <input type="button" id="btnLoad" value="読込" onClick={() => openModal("load")} />
                            <input type="button" id="btnDownload" value="画像として保存" onClick={clickDownload} />
                        </div>
                    </div>
                    <div id="battle_display" className="text-left" ref={elementRef}>
                        {turnList.map((turn, index) => {
                            return <TurnData turn={turn} index={index} key={`turn${index}`}
                                isLastTurn={turnList.length - 1 == index} hideMode={hideMode} isCapturing={isCapturing} handlers={handlers} />
                        })}
                    </div>
                </div>
            }
            {
                <ReactModal
                    isOpen={modal.isOpen}
                    onRequestClose={closeModal}
                    className={"modal-content modal-narrwow " + (modal.isOpen ? "modal-content-open" : "")}
                    overlayClassName={"modal-overlay " + (modal.isOpen ? "modal-overlay-open" : "")}
                >
                    <ModalSaveLoad mode={modal.mode} handleClose={closeModal} turnList={turnList} loadData={loadData} />
                </ReactModal>
            }
        </div>
    )
});