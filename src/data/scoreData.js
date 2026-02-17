export const SCORE_STATUS = [0, 370, 390, 410, 430, 450, 470, 490, 510, 530, 550, 570, 590, 610, 630, 650, 670, 690, 710, 730, 750];
export const LEVEL_BONUS = [0, 113_769, 129_998, 146_381, 162_916, 179_599, 202_070, 224_795, 247_769, 270_988, 300_349, 330_081, 360_178, 390_633, 427_647, 465_163, 503_175, 548_141, 593_764, 646_700, 700_000];
export const NO_BREAK_BONUS = [0, 23_082, 26_536, 30_033, 33_572, 37_150, 41_980, 46_874, 51_831, 56_848, 63_200, 69_639, 76_163, 82_768, 90_799, 98_941, 107_191, 116_947, 126_843, 138_316, 150_000];
export const DAMAGE_LIMIT = {
    0.018: [0, 2_614_035, 2_966_374, 3_318_713, 3_671_053, 4_023_392, 4_493_177, 4_962_963, 5_432_748, 5_902_534, 6_489_766, 7_076_998, 7_664_230, 8_251_462, 8_956_141, 9_660_819, 10_365_497, 11_187_622, 12_009_747, 12_949_318, 13_888_889],
}
export const TURN_BONUS = [0.00, 1.30, 1.29, 1.28, 1.27, 1.26, 1.24, 1.23, 1.22, 1.21, 1.20, 1.19, 1.18, 1.17, 1.16, 1.15, 1.14, 1.13, 1.12, 1.11, 1.10, 1.09, 1.08, 1.07, 1.06, 1.05, 1.04, 1.03, 1.02, 1.01, 1.00];
const score_attack_list = [
    {
        "score_attack_no": 91, "enemy_count": 1, "max_damage_rate": 0.0180,
        "dp_rate": { 21: 235827, 26: 409748, 31: 670630, 36: 1061953, 39: 1465134, 40: 1560000 },
        "hp_rate": { 21: 13319273, 26: 23883309, 31: 39729362, 36: 63498443, 39: 87987799, 40: 93750000 },
        "damage_limit": [0, 3_139_535, 3_139_535, 3_139_535, 3_139_535, 3_139_535, 4_534_884, 4_534_884, 4_534_884, 4_534_884, 4_534_884, 6_976_744, 6_976_744, 6_976_744, 6_976_744, 6_976_744, 8_720_930, 8_720_930, 8_720_930, 8_720_930, 8_720_930],
    },
];

// スコアタ情報取得
export function getScoreAttack(score_attack_no) {
    const filtered_score_attack = score_attack_list.filter((obj) => obj.score_attack_no === score_attack_no);
    return filtered_score_attack.length > 0 ? filtered_score_attack[0] : undefined;
}

// スコアタHP取得
export function getScoreHpDp(scoreLv, scoreAttack, rateKbn) {
    if (scoreLv === 40) {
        return scoreAttack[rateKbn][40];
    }
    let maxNum;
    let minNum;
    if (scoreLv >= 36) {
        maxNum = 39;
        minNum = 36;
    } else if (scoreLv >= 31) {
        maxNum = 36;
        minNum = 31;
    } else if (scoreLv >= 26) {
        maxNum = 31;
        minNum = 26;
    } else if (scoreLv >= 21) {
        maxNum = 26;
        minNum = 21;
    }

    let base = scoreAttack[rateKbn][minNum];
    let div = (scoreAttack[rateKbn][maxNum] - scoreAttack[rateKbn][minNum]) / (maxNum - minNum);
    let diff = scoreLv - minNum;
    return Math.floor(base + div * diff);
}
