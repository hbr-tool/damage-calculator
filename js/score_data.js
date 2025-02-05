let score_stat = [290, 320, 320, 325, 325, 330, 330, 335, 335, 340, 340, 340, 340, 345, 345, 350, 350, 355, 355, 360, 360, 380, 385, 385, 390, 390, 395, 395, 400, 400, 405, 405, 410, 415, 415, 420, 420, 425, 425, 430, 430];
let level_bonus = [147775, 153640, 159505, 165370, 171235, 177100, 182965, 188830, 194695, 200560, 206425, 212290, 218155, 224020, 229885, 235750, 241615, 247480, 253345, 259210, 265075, 274045, 279795, 285545, 291295, 297045, 302795, 308545, 314295, 320045, 325795, 331545, 337295, 343045, 348795, 354200, 359950, 368000, 371450, 379500, 391000];
let no_break_bonus = [5750, 33158, 34500, 35650, 36991, 38333, 39483, 40825, 42166, 43316, 44658, 45808, 47150, 48491, 49641, 50983, 52325, 53475, 54855, 56120, 57270, 58535, 59800, 61065, 62330, 63595, 64860, 66125, 67390, 68655, 69920, 71185, 72450, 73830, 75095, 76360, 77625, 78890, 80155, 81420, 82685];
let turn_bonus = [0.00, 1.30, 1.29, 1.28, 1.27, 1.26, 1.24, 1.23, 1.22, 1.21, 1.20, 1.19, 1.18, 1.17, 1.16, 1.15, 1.14, 1.13, 1.12, 1.11, 1.10, 1.09, 1.08, 1.07, 1.06, 1.05, 1.04, 1.03, 1.02, 1.01, 1.00];
let damage_limit1 = [1000000, 1200000, 1400000, 1600000, 1800000, 2000000, 2200000, 2400000, 2600000, 2800000, 3000000, 5700000, 8400000, 8600000, 8800000, 9000000, 9200000, 9400000, 9600000, 9800000, 10000000, 11000000, 12000000, 13000000, 14000000, 15000000, 16000000, 17000000, 18000000, 19000000, 20000000, 21000000, 22000000, 23000000, 24000000, 25000000, 26000000, 27000000, 28000000, 29000000, 30000000];
let damage_limit2 = [1400000, 1680000, 1960000, 2240000, 2520000, 2800000, 3080000, 3360000, 3640000, 3920000, 4200000, 7980000, 11760000, 12040000, 12320000, 12600000, 12880000, 13160000, 13440000, 13720000, 14000000, 15400000, 16800000, 18200000, 19600000, 21000000, 22400000, 23800000, 25200000, 26600000, 28000000, 29400000, 30800000, 32200000, 33600000, 35000000, 36400000, 37800000, 39200000, 40600000, 42000000];
let score_attack_list = [
    { "score_attack_no": 59, "enemy_count": 1, "max_damage_rate": 0.670, "dp_add1": 9000, "dp_add2": 900, "hp_add1": 1431000, "hp_add2": 1431000 },
    { "score_attack_no": 64, "enemy_count": 1, "max_damage_rate": 0.770, "dp_rate": [1.060, 1.060, 1.040, 1.030], "hp_rate": [1.075, 1.050, 1.040, 1.030] },
    { "score_attack_no": 65, "enemy_count": 1, "max_damage_rate": 0.770, "dp_rate": [1.040, 1.040, 1.040, 1.050], "hp_rate": [1.050, 1.050, 1.040, 1.060] },
    { "score_attack_no": 66, "enemy_count": 1, "max_damage_rate": 0.770, "dp_rate": [1.040, 1.040, 0, 0], "hp_rate": [1.055, 1.055, 0, 0], "dp_add": [0, 0, 24150, 24150], "hp_add": [0, 0, 539800, 539800]},
    { "score_attack_no": 67, "enemy_count": 1, "max_damage_rate": 0.770, "dp_rate": [1.040, 1.040, 1.040, 1.050], "hp_rate": [1.050, 1.050, 1.040, 1.060] },
];

// スコアタ情報取得
function getScoreAttack(score_attack_no) {
    const filtered_score_attack = score_attack_list.filter((obj) => obj.score_attack_no == score_attack_no);
    return filtered_score_attack.length > 0 ? filtered_score_attack[0] : undefined;
}

// スコアタHP取得
function getScoreHp(score_lv, max_hp, score_attack, enemy_info) {
    let lv_hp;
    let count = [score_lv > 110 ? 10 : score_lv - 100,
                score_lv > 120 ? 10 : score_lv < 110 ? 0 : score_lv - 110,
                score_lv > 130 ? 10 : score_lv < 120 ? 0 : score_lv - 120,
                score_lv > 130 ? score_lv - 130 : 0];
    let magn = 1;
    let add = 0;
    for (let i = 0; i < 4; i++) {
        if (score_attack.hp_rate[i] !== 0) {
            magn *= Math.pow(Number(score_attack.hp_rate[i]), count[i]);
        } else {
            add += score_attack.hp_add[i] * count[i];
        }
    }
    lv_hp = Math.ceil(max_hp * magn / 1000) * 1000;
    lv_hp += add;
    return lv_hp;
}

// スコアタDP取得
function getScoreDp(score_lv, max_dp, score_attack, enemy_info) {
    let lv_dp;
    let count = [score_lv > 110 ? 10 : score_lv - 100,
                score_lv > 120 ? 10 : score_lv < 110 ? 0 : score_lv - 110,
                score_lv > 130 ? 10 : score_lv < 120 ? 0 : score_lv - 120,
                score_lv > 130 ? score_lv - 130 : 0];
    let magn = 1;
    let add = 0;
    for (let i = 0; i < 4; i++) {
        if (score_attack.dp_rate[i] !== 0) {
            magn *= Math.pow(Number(score_attack.dp_rate[i]), count[i]);
        } else {
            add += score_attack.dp_add[i] * count[i];
        }
    }
    lv_dp = Math.ceil(max_dp * magn / 1000) * 1000;
    lv_dp += add;
    return lv_dp;
}