import React from "react";
import EnmeySelect from "components/EnmeySelect";
import attribute from 'assets/attribute';

const EnemyArea = ({ enemyClass, enemySelect, setEnemyClass, setEnemySelect, enemyInfo, detailSetting }) => {
    const PHYSICAL_LIST = { 1: "slash", 2: "stab", 3: "strike" };
    const ELEMENT_LIST = { 0: "none", 1: "fire", 2: "ice", 3: "thunder", 4: "light", 5: "dark" };

    const setEnemyStatus = (enemyClass, enemySelect) => {
        setEnemyClass(enemyClass);
        setEnemySelect(enemySelect);
    }

    return (
        <div className="surround_area mx-auto mt-2 adjust_width" id="enemy_area">
            <label className="area_title">敵情報</label>
            <EnmeySelect enemyClass={enemyClass} enemySelect={enemySelect} handleChange={setEnemyStatus} isFreeInput={false} />
            <div className="resist_area mx-auto mt-2">
                <div className="grid grid-cols-9">
                    {Object.keys(PHYSICAL_LIST).map(key => {
                        let className = "enemy_type_value";
                        let val = enemyInfo[`physical_${key}`];
                        if (val < 100) {
                            className += " enemy_resist";
                        } else if (val > 100) {
                            className += " enemy_weak";
                        }
                        let src = attribute[PHYSICAL_LIST[key]];
                        return (
                            <div key={`physical_${key}`}>
                                <input className="enemy_type_icon" src={src} type="image" alt={PHYSICAL_LIST[key]} />
                                <input className={className} type="text" value={val} readOnly />
                            </div>
                        );
                    })}
                    {Object.keys(ELEMENT_LIST).map(key => {
                        let className = "enemy_type_value";
                        let val = enemyInfo[`element_${key}`] + Number(detailSetting[`changeElement${key}`]);;
                        if (val < 100) {
                            className += " enemy_resist";
                        } else if (val > 100) {
                            className += " enemy_weak";
                        }
                        let src = attribute[ELEMENT_LIST[key]];
                        return (
                            <div key={`element_${key}`}>
                                <input className="enemy_type_icon" src={src} type="image" alt={ELEMENT_LIST[key]} />
                                <input className={className} type="text" value={val} readOnly />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
};

export default EnemyArea;