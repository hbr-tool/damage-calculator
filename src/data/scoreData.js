export const SCORE_STATUS = [0, 370, 390, 410, 430, 450, 470, 490, 510, 530, 550, 570, 590, 610, 630, 650, 670, 690, 710, 730, 750];
export const LEVEL_BONUS = [0, 200_000, 210_000, 220_000, 230_000, 250_000, 300_000, 310_000, 320_000, 330_000, 350_000, 400_000, 420_000, 450_000, 470_000, 500_000, 600_000, 610_000, 620_000, 630_000, 700_000];
export const NO_BREAK_BONUS = [0, 26_000, 32_000, 38_000, 44_000, 50_000, 60_000, 70_000, 80_000, 90_000, 100_000, 104_000, 108_000, 112_000, 116_000, 120_000, 130_000, 135_000, 140_000, 145_000, 150_000];
export const DAMAGE_LIMIT1 = [0, 9_000_000, 9_000_000, 9_000_000, 9_000_000, 9_000_000, 13_000_000, 13_000_000, 13_000_000, 13_000_000, 13_000_000, 20_000_000, 20_000_000, 20_000_000, 20_000_000, 20_000_000, 25_000_000, 25_000_000, 25_000_000, 25_000_000, 25_000_000];
export const DAMAGE_LIMIT2 = [0, 12_600_000, 12_600_000, 12_600_000, 12_600_000, 12_600_000, 18_200_000, 18_200_000, 18_200_000, 18_200_000, 18_200_000, 28_000_000, 28_000_000, 28_000_000, 28_000_000, 28_000_000, 35_000_000, 35_000_000, 35_000_000, 35_000_000];
export const TURN_BONUS = [0.00, 1.30, 1.29, 1.28, 1.27, 1.26, 1.24, 1.23, 1.22, 1.21, 1.20, 1.19, 1.18, 1.17, 1.16, 1.15, 1.14, 1.13, 1.12, 1.11, 1.10, 1.09, 1.08, 1.07, 1.06, 1.05, 1.04, 1.03, 1.02, 1.01, 1.00];
const score_attack_list = [
    {
        "score_attack_no": 79, "enemy_count": 1, "max_damage_rate": 1,
        "dp_rate": { 21: 52182, 26: 84731, 31: 133555, 36: 206791, 39: 282246, 40: 300000 },
        "hp_rate": { 21: 14203636, 26: 25472412, 31: 42375576, 36: 67730323, 39: 93853395, 40: 100000000 },
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
