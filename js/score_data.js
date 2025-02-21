const score_stat = [290, 320, 322, 324, 326, 328, 330, 332, 334, 336, 338, 341, 343, 345, 347, 349, 351, 353, 355, 357, 360, 380, 382, 385, 388, 390, 393, 395, 398, 401, 403, 406, 408, 411, 414, 416, 419, 422, 424, 427, 430, 455, 460, 465, 470, 475, 480, 485, 490, 495, 500];
const level_bonus = [147775, 153640, 159505, 165370, 171235, 177100, 182965, 188830, 194695, 200560, 206425, 212290, 218155, 224020, 229885, 235750, 241615, 247480, 253345, 259210, 265075, 274045, 280200, 286356, 292511, 298667, 304822, 310978, 317133, 323289, 329444, 335600, 341755, 347911, 354066, 360222, 366377, 372533, 378688, 384844, 390999, 419000, 433111, 447222, 461333, 475444, 489555, 503666, 517777, 531888, 546000];
const no_break_bonus = [5750, 33158, 34427, 35696, 36965, 38234, 39503, 40772, 42041, 43310, 44579, 45849, 47118, 48387, 49656, 50925, 52194, 53463, 54732, 56001, 57270, 58535, 59806, 61077, 62348, 63619, 64890, 66161, 67432, 68703, 69974, 71246, 72517, 73788, 75059, 76330, 77601, 78872, 80143, 81414, 82685, 90835, 96891, 102946, 109002, 115057, 121113, 127168, 133224, 139279, 145335];
const damage_limit1 = [1000000, 1200000, 1663158, 2126316, 2589474, 3052632, 3515789, 3978947, 4442105, 4905263, 5368421, 5831579, 6294737, 6757895, 7221053, 7684211, 8147368, 8610526, 9073684, 9536842, 10000000, 11000000, 12000000, 13000000, 14000000, 15000000, 16000000, 17000000, 18000000, 19000000, 20000000, 21000000, 22000000, 23000000, 24000000, 25000000, 26000000, 27000000, 28000000, 29000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000];
// ↓新スコアタでまだ未使用
let damage_limit2 = [1400000, 1680000, 1960000, 2240000, 2520000, 2800000, 3080000, 3360000, 3640000, 3920000, 4200000, 7980000, 11760000, 12040000, 12320000, 12600000, 12880000, 13160000, 13440000, 13720000, 14000000, 15400000, 16800000, 18200000, 19600000, 21000000, 22400000, 23800000, 25200000, 26600000, 28000000, 29400000, 30800000, 32200000, 33600000, 35000000, 36400000, 37800000, 39200000, 40600000, 42000000];
const turn_bonus = [0.00, 1.30, 1.29, 1.28, 1.27, 1.26, 1.24, 1.23, 1.22, 1.21, 1.20, 1.19, 1.18, 1.17, 1.16, 1.15, 1.14, 1.13, 1.12, 1.11, 1.10, 1.09, 1.08, 1.07, 1.06, 1.05, 1.04, 1.03, 1.02, 1.01, 1.00];
const score_attack_list = [
    { "score_attack_no": 68, "enemy_count": 1, "max_damage_rate": 0.770, "dp_rate": [1.040, 1.040, 1.040, 1.050, 1.010], "hp_rate": [1.060, 1.060, 1.005, 1.057, 1.010] },
    { "score_attack_no": 69, "enemy_count": 1, "max_damage_rate": 0.770, "dp_rate": [1.040, 1.040, 1.030, 1.038, 1.020], "hp_rate": [1.050, 1.050, 1.050, 1.050, 1.020] },
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
                score_lv > 140 ? 10 : score_lv < 130 ? 0 : score_lv - 130,
                score_lv > 140 ? score_lv - 140 : 0];
    let magn = 1;
    let add = 0;
    for (let i = 0; i < 5; i++) {
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
                score_lv > 140 ? 10 : score_lv < 130 ? 0 : score_lv - 130,
                score_lv > 140 ? score_lv - 140 : 0];
    let magn = 1;
    let add = 0;
    for (let i = 0; i < 5; i++) {
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