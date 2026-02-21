import React from "react";
import { ENEMY_CLASS } from "utils/const";
import EnmeySelect from "components/EnmeySelect";
import EnemyArea from "./EnemyArea";
import HardLayer from "./HardLayer";
import HardLayerEx from "./HardLayerEx";
import ScoreSetting from "./ScoreSetting";
import { getEnemyInfo } from "utils/common";

const ContentsArea = ({ attackInfo, enemyClass, enemySelect, setEnemyClass, setEnemySelect, state, dispatch }) => {

    const handleChange = (newClass, newSelect) => {
        setEnemyClass(newClass);
        setEnemySelect(newSelect);
        dispatch({ type: "SET_ENEMY", enemyInfo: getEnemyInfo(newClass, newSelect) });
    };

    return (
        <>
            <div id="contents_area" className="surround_area adjust_width mx-auto mt-2">
                <label className="area_title">コンテンツ情報</label>
                <EnmeySelect enemyClass={enemyClass} enemySelect={enemySelect} handleChange={handleChange} isFreeInput={true} />
                {enemyClass === ENEMY_CLASS.HARD_LAYER &&
                    <HardLayer state={state} dispatch={dispatch} />
                }
                {enemyClass === ENEMY_CLASS.SCORE_ATTACK &&
                    <ScoreSetting state={state} dispatch={dispatch} />
                }
                {enemyClass === ENEMY_CLASS.HARD_LAYER_EX &&
                    <HardLayerEx state={state} dispatch={dispatch} />
                }
                {/* <BikePartsComponent enemyInfo={enemyInfo} /> */}
                {/* <SeraphCardList enemyInfo={enemyInfo} /> */}
            </div>
            <div id="enemy_status" className="surround_area adjust_width mx-auto mt-2">
                <EnemyArea state={state} dispatch={dispatch} attackInfo={attackInfo} />
            </div>
        </>
    )
};

export default ContentsArea;