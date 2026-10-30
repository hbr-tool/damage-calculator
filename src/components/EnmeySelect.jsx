import React from "react";
import { ENEMY_CLASS } from "utils/const";
import enemyList from "data/enemyList";

const EnmeySelect = ({ enemyClass, enemySelect, handleChange, isFreeInput }) => {
    const reverseClass = [ENEMY_CLASS.SCORE_ATTACK, ENEMY_CLASS.SCORE_ATTACK_EX, ENEMY_CLASS.EVENT_PRISMATIC];

    let classList = enemyList.filter((obj) => obj.enemy_class === enemyClass);
    if (reverseClass.includes(Number(enemyClass))) {
        classList.reverse();
    }
    let enemyInfo = classList.filter((obj) => obj.enemy_class === enemyClass && obj.enemy_class_no === enemySelect)[0];
    if (!enemyInfo) {
        enemyInfo = enemyList[0];
    }

    const handleClassChange = (newClass) => {
        localStorage.setItem("enemy_class", newClass);
        const newClassList = enemyList.filter((obj) => obj.enemy_class === Number(newClass));
        if (reverseClass.includes(Number(newClass))) {
            newClassList.reverse();
        }
        let selectNum = newClassList[0].enemy_class_no;
        localStorage.setItem("enemy_select", selectNum);
        handleChange(Number(newClass), Number(selectNum));
    };

    const handleSelectChange = (newSelect) => {
        localStorage.setItem("enemy_select", newSelect);
        handleChange(Number(enemyClass), Number(newSelect));
    };


    // 敵保存ボタンクリック
    const clickEnemySave = () => {
        let enemyName = window.prompt("敵名称を入力してください", enemyInfo.enemy_name || ("敵" + enemySelect));
        if (enemyName === null) {
            return;
        }
        enemyInfo.enemy_name = enemyName;
        localStorage.setItem("free_enemy_" + enemySelect, JSON.stringify(enemyInfo));
        handleChange(Number(enemyClass), Number(enemySelect));
    }

    return (
        <>
            <div id="enemy_select">
                <select id="enemy_class" value={enemyClass} onChange={(e) => handleClassChange(e.target.value)}>
                    <option value="1">異時層</option>
                    <option value="15">異時層EX</option>
                    <option value="2">オーブボス</option>
                    <option value="3">時計塔(N)</option>
                    <option value="4">時計塔(H)</option>
                    <option value="5">宝珠の迷宮</option>
                    {/* <option value="17">夢幻の螺旋</option> */}
                    <option value="6">スコアアタック</option>
                    <option value="16">スコアタEX</option>
                    {/* <option value="14">セラフ遭遇戦</option> */}
                    <option value="7">プリズムバトル</option>
                    <option value="13">イベントプリズム</option>
                    <option value="8">恒星掃戦線</option>
                    <option value="9">イベント隠しボス</option>
                    <option value="10">時の修練場/アリーナ</option>
                    {/* <option value="11">制圧戦</option> */}
                    <option value="12">聖環の庭</option>
                    {isFreeInput ?
                        <option value="99">自由入力</option>
                        : null}
                </select>
                <select id="enemy_list" value={enemySelect} onChange={(e) => handleSelectChange(e.target.value)}>
                    {classList.map((value) => {
                        let text = value.enemy_name;
                        if (enemyClass === ENEMY_CLASS.SCORE_ATTACK) {
                            text = `#${value.sub_no} ${value.enemy_name}`;
                        } else if (enemyClass === ENEMY_CLASS.CLOCK_TOWER_NORMAL || enemyClass === ENEMY_CLASS.CLOCK_TOWER_HARD) {
                            text = `(${value.sub_no}F) ${value.enemy_name}`;
                        }
                        return (
                            <option key={`enemy_class_no${value.enemy_class_no}`} value={value.enemy_class_no}>{text}</option>
                        )
                    })}
                </select>
                <select value={enemyInfo.enemy_count} disabled id="enemy_select_count" >
                    <option value="1">1体</option>
                    <option value="2">2体</option>
                    <option value="3">3体</option>
                </select>
                {enemyClass === ENEMY_CLASS.FREE_INPUT ?
                    <input id="enemy_save" type="button" value="保存" onClick={clickEnemySave} />
                    : null
                }
            </div>
        </>
    )
};

export default EnmeySelect;