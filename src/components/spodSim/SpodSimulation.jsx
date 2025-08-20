import React, { useState } from 'react';
import SettingArea from './SettingArea';

const SpOdSimulation = () => {
    // 敵選択
    const [enemyClass, setEnemyClass] = useState(() => {
        let enemyClass = localStorage.getItem("enemy_class");
        return enemyClass ? Number(enemyClass) : 1;
    });
    const [enemySelect, setEnemySelect] = useState(() => {
        let enemySelect = localStorage.getItem("enemy_select");
        return enemySelect ? Number(enemySelect) : 1;
    });

    return (
        <div className="sim_frame pt-3">
            <SettingArea enemyClass={enemyClass}
                enemySelect={enemySelect} setEnemyClass={setEnemyClass} setEnemySelect={setEnemySelect} />
        </div>
    );
}
export default SpOdSimulation;