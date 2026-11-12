import React from "react";
import { ENEMY_CLASS } from "utils/const";
import EnmeySelect from "components/EnmeySelect";
import EnemyArea from "./EnemyArea";
import HardLayer from "./HardLayer";
import HardLayerEx from "./HardLayerEx";
import DamageOptions from "./DamageOptions";
import ScoreSetting from "./ScoreSetting";
import { getEnemyInfo } from "utils/common";

const ContentsArea = ({ argument, attackInfo, enemyClass, enemySelect, setEnemyClass, setEnemySelect, state, dispatch }) => {

    const handleChange = (newClass, newSelect) => {
        setEnemyClass(newClass);
        setEnemySelect(newSelect);
        dispatch({ type: "SET_ENEMY", enemyInfo: getEnemyInfo(newClass, newSelect) });
    };

    let contentComponent = null;

    switch (enemyClass) {
        case ENEMY_CLASS.HARD_LAYER:
            contentComponent = <HardLayer state={state} dispatch={dispatch} />;
            break;

        case ENEMY_CLASS.SCORE_ATTACK:
        case ENEMY_CLASS.SCORE_ATTACK_EX:
            contentComponent = <ScoreSetting state={state} dispatch={dispatch} enemyClass={enemyClass} />;
            break;

        case ENEMY_CLASS.HARD_LAYER_EX:
            contentComponent = <HardLayerEx state={state} dispatch={dispatch} />;
            break;

        case ENEMY_CLASS.VISIONARY_SPIRAL:
        case ENEMY_CLASS.FREE_INPUT:
            contentComponent = <DamageOptions argument={argument} />;
            break;
        default:
            break;
    }

    return (
        <>
            <div id="contents_area" className="surround_area adjust_width mx-auto mt-2">
                <label className="area_title">コンテンツ情報</label>
                <EnmeySelect enemyClass={enemyClass} enemySelect={enemySelect} handleChange={handleChange} isFreeInput={true} />
                {contentComponent}
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