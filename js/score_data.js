let score_stat = [290, 320, 320, 325, 325, 330, 330, 335, 335, 340, 340, 340, 340, 345, 345, 350, 350, 355, 355, 360, 360, 380, 385, 385, 390, 390, 395, 395, 400, 400, 405, 405, 410, 415, 415, 420, 420, 425, 425, 430, 430];
let level_bonus = [128500, 133600, 138700, 143800, 148900, 154000, 159100, 164200, 169300, 174400, 179500, 184600, 189700, 194800, 199900, 205000, 210100, 215200, 220300, 225400, 230500, 238300, 243300, 248300, 253300, 258300, 263300, 268300, 273300, 278300, 283300, 288300, 293300, 298300, 303300, 308000, 313000, 320000, 323000, 330000, 340000];
let no_break_bonus = [5000, 28833, 30000, 31000, 32166, 33333, 34333, 35500, 36666, 37666, 38833, 39833, 41000, 42166, 43166, 44333, 45500, 46500, 47700, 48800, 49800, 50900, 52000, 53100, 54200, 55300, 56400, 57500, 58600, 59700, 60800, 61900, 63000, 64200, 65300, 66400, 67500, 68600, 69700, 70800, 71900];
let turn_bonus = [0.00, 1.50, 1.47, 1.45, 1.42, 1.39, 1.36, 1.34, 1.31, 1.28, 1.25, 1.23, 1.20, 1.18, 1.16, 1.13, 1.11, 1.09, 1.07, 1.04, 1.02, 1.00, 0.98, 0.96, 0.93, 0.91, 0.89, 0.87, 0.84, 0.82, 0.80];
let damage_limit1 = [1000000, 1200000, 1400000, 1600000, 1800000, 2000000, 2200000, 2400000, 2600000, 2800000, 3000000, 5700000, 8400000, 8600000, 8800000, 9000000, 9200000, 9400000, 9600000, 9800000, 10000000, 11000000, 12000000, 13000000, 14000000, 15000000, 16000000, 17000000, 18000000, 19000000, 20000000, 21000000, 22000000, 23000000, 24000000, 25000000, 26000000, 27000000, 28000000, 29000000, 30000000];
let damage_limit2 = [1400000, 1680000, 1960000, 2240000, 2520000, 2800000, 3080000, 3360000, 3640000, 3920000, 4200000, 7980000, 11760000, 12040000, 12320000, 12600000, 12880000, 13160000, 13440000, 13720000, 14000000, 15400000, 16800000, 18200000, 19600000, 21000000, 22400000, 23800000, 25200000, 26600000, 28000000, 29400000, 30800000, 32200000, 33600000, 35000000, 36400000, 37800000, 39200000, 40600000, 42000000];
let score_attack_list = [
    { "score_attack_no": 48, "enemy_count": 2, "max_damage_rate": 0.470, "dp_rate1": 1.040, "dp_rate2": 1.050, "hp_rate1": 1.055, "hp_rate2": 1.050 },
    { "score_attack_no": 49, "enemy_count": 2, "max_damage_rate": 0.470, "dp_rate1": 1.040, "dp_rate2": 1.050, "hp_rate1": 1.055, "hp_rate2": 1.050 },
    { "score_attack_no": 50, "enemy_count": 2, "max_damage_rate": 0.470, "dp_rate1": 1.018, "dp_rate2": 1.022, "hp_rate1": 1.030, "hp_rate2": 1.045 },
    { "score_attack_no": 51, "enemy_count": 1, "max_damage_rate": 0.670, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.050 },
    { "score_attack_no": 52, "enemy_count": 2, "max_damage_rate": 0.470, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.050 },
    { "score_attack_no": 53, "enemy_count": 1, "max_damage_rate": 0.670, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.050 },
    { "score_attack_no": 54, "enemy_count": 2, "max_damage_rate": 0.470, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.050 },
    { "score_attack_no": 55, "enemy_count": 1, "max_damage_rate": 0.670, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.050 },
    { "score_attack_no": 56, "enemy_count": 1, "max_damage_rate": 0.670, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.050 },
    { "score_attack_no": 57, "enemy_count": 1, "max_damage_rate": 0.670, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.0415 },
    { "score_attack_no": 58, "enemy_count": 1, "max_damage_rate": 0.670, "dp_rate1": 1.020, "dp_rate2": 1.020, "hp_rate1": 1.040, "hp_rate2": 1.050 },
    { "score_attack_no": 59, "enemy_count": 1, "max_damage_rate": 0.670, "dp_add1": 9000, "dp_add2": 900, "hp_add1": 1431000, "hp_add2": 1431000 },
    { "score_attack_no": 60, "enemy_count": 1, "max_damage_rate": 0.670, "dp_rate1": 1.030, "dp_rate2": 1.040, "hp_rate1": 1.050, "hp_rate2": 1.050 },
    { "score_attack_no": 61, "enemy_count": 2, "max_damage_rate": 0.470, "dp_rate": [1.045, 1.025, 1.040, 1.060], "hp_rate": [1.055, 1.050, 1.040, 1.060] },
];
const const_score = {
    "score_dp_52": [180000, 200000, 210000, 221000, 231000, 242000, 252000, 263000, 273000, 284000, 294000, 305000, 315000, 326000, 336000, 357000, 347000, 357000, 368000, 379000, 400000, 450000, 472000, 492000, 512000, 532000, 552000, 572000, 592000, 612000, 632000, 652000, 672000, 692000, 712000, 732000, 752000, 772000, 792000, 812000, 832000],
    "score_hp_52": [1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000, 2300000, 2400000, 2500000, 2600000, 2700000, 2800000, 2900000, 3000000, 3100000, 3345000, 3590000, 3835000, 4080000, 4325000, 4570000, 4815000, 5060000, 5305000, 5550000, 5795000, 6040000, 6285000, 6530000, 6775000, 7020000, 7265000, 7510000, 7755000],
    "score_dp_54a": [162000, 171000, 180000, 189000, 180000, 198000, 207000, 216000, 225000, 234000, 243000, 252000, 261000, 270000, 279000, 297000, 306000, 315000, 333000, 342000, 360000, 378000, 396000, 414000, 432000, 450000, 477000, 504000, 522000, 549000, 576000, 612000, 639000, 666000, 702000, 738000, 774000, 810000, 855000, 900000, 945000],
    "score_hp_54a": [4306000, 4479000, 4658000, 4844000, 5038000, 5239000, 5449000, 5667000, 5894000, 6129000, 6374000, 6629000, 6895000, 7170000, 7457000, 7755000, 8066000, 8388000, 8724000, 9073000, 9435000, 9907000, 10403000, 10923000, 11469000, 12042000, 12644000, 13276000, 13940000, 14637000, 15369000, 16138000, 16944000, 17792000, 18681000, 19615000, 20596000, 21626000, 22707000, 23842000, 25034000],
    "score_dp_54b": [198000, 209000, 220000, 220000, 231000, 242000, 253000, 264000, 275000, 286000, 297000, 319000, 330000, 341000, 352000, 363000, 374000, 385000, 407000, 418000, 440000, 462000, 484000, 506000, 528000, 550000, 583000, 616000, 638000, 671000, 704000, 748000, 781000, 814000, 858000, 902000, 946000, 990000, 1045000, 1100000, 1155000],
    "score_hp_54b": [3960000, 4119000, 4284000, 4455000, 4633000, 4818000, 5011000, 5212000, 5420000, 5637000, 5862000, 6097000, 6341000, 6594000, 6858000, 7132000, 7418000, 7714000, 8023000, 8344000, 8677000, 9111000, 9567000, 10045000, 10547000, 11075000, 11628000, 12210000, 12820000, 13461000, 14134000, 14841000, 15583000, 16362000, 17180000, 18039000, 18941000, 19888000, 20882000, 21926000, 23023000],
};

// スコアタ情報取得
function getScoreAttack(score_attack_no) {
    const filtered_score_attack = score_attack_list.filter((obj) => obj.score_attack_no == score_attack_no);
    return filtered_score_attack.length > 0 ? filtered_score_attack[0] : undefined;
}

// スコアタHP取得
function getScoreHp(score_lv, max_hp, score_attack, enemy_info) {
    let lv_hp;
    if (score_attack.score_attack_no == 52) {
        lv_hp = const_score[`score_hp_${score_attack.score_attack_no}`][score_lv - 100];
    } else if (score_attack.score_attack_no == 54 && enemy_info.enemy_class_no == 8) {
        lv_hp = const_score[`score_hp_${score_attack.score_attack_no}a`][score_lv - 100];
    } else if (score_attack.score_attack_no == 54 && enemy_info.enemy_class_no == 9) {
        lv_hp = const_score[`score_hp_${score_attack.score_attack_no}b`][score_lv - 100];
    } else {
        if (score_attack.hp_rate) {
            let count1 = score_lv > 110 ? 10 : score_lv - 100;
            let count2 = score_lv > 120 ? 10 : score_lv - 110;
            let count3 = score_lv > 130 ? 10 : score_lv - 120;
            let count4 = score_lv > 130 ? score_lv - 130 : 0;
            let magn = Math.pow(Number(score_attack.hp_rate[0]), count1) * Math.pow(Number(score_attack.hp_rate[1]), count2)
                     * Math.pow(Number(score_attack.hp_rate[2]), count3) * Math.pow(Number(score_attack.hp_rate[3]), count4);
            lv_hp = Math.ceil(max_hp * magn / 1000) * 1000;
        } else if (score_attack.hp_rate1) {
            let count1 = score_lv > 120 ? 20 : score_lv - 100;
            let count2 = score_lv > 120 ? score_lv - 120 : 0;
            let magn = Math.pow(Number(score_attack.hp_rate1), count1) * Math.pow(Number(score_attack.hp_rate2), count2);
            lv_hp = Math.ceil(max_hp * magn / 1000) * 1000;
        } else if (score_attack.hp_add1) {
            let count = score_lv - 100;
            lv_hp = max_hp + count * score_attack.hp_add1;
        }
    }
    return lv_hp;
}

// スコアタDP取得
function getScoreDp(score_lv, max_dp, score_attack, enemy_info) {
    let lv_dp;
    if (score_attack.score_attack_no == 52) {
        lv_dp = const_score[`score_dp_${score_attack.score_attack_no}`][score_lv - 100];
    } else if (score_attack.score_attack_no == 54 && enemy_info.enemy_class_no == 8) {
        lv_dp = const_score[`score_dp_${score_attack.score_attack_no}a`][score_lv - 100];
    } else if (score_attack.score_attack_no == 54 && enemy_info.enemy_class_no == 9) {
        lv_dp = const_score[`score_dp_${score_attack.score_attack_no}b`][score_lv - 100];
    } else {
        if (score_attack.dp_rate) {
            let count1 = score_lv > 110 ? 10 : score_lv - 100;
            let count2 = score_lv > 120 ? 10 : score_lv - 110;
            let count3 = score_lv > 130 ? 10 : score_lv - 120;
            let count4 = score_lv > 130 ? score_lv - 130 : 0;
            let magn = Math.pow(Number(score_attack.dp_rate[0]), count1) * Math.pow(Number(score_attack.dp_rate[1]), count2)
                     * Math.pow(Number(score_attack.dp_rate[2]), count3) * Math.pow(Number(score_attack.dp_rate[3]), count4);
            lv_dp = Math.ceil(max_dp * magn / 1000) * 1000;
        } else if (score_attack.dp_rate1) {
            let count1 = score_lv > 120 ? 20 : score_lv - 100;
            let count2 = score_lv > 120 ? score_lv - 120 : 0;
            let magn = Math.pow(Number(score_attack.dp_rate1), count1) * Math.pow(Number(score_attack.dp_rate2), count2);
            lv_dp = Math.ceil(max_dp * magn / 1000) * 1000;
        } else if (score_attack.dp_add1) {
            let count = score_lv - 100;
            lv_dp = max_dp + count * score_attack.dp_add1;
        }
    }
    return lv_dp;
}