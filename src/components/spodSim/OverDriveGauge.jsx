import React from "react";
import { getOverDrive } from "./logic";
import overdriveIcons from 'assets/overdrive';

const OverDriveGauge = ({ turn }) => {
    let overDriveGauge = turn.overDriveGauge;
    let addOverDriveGauge = getOverDrive(turn);
    turn.addOverDriveGauge = addOverDriveGauge;
    overDriveGauge += addOverDriveGauge;
    let gauge = Math.floor(turn.overDriveGauge / 100);
    gauge = gauge > 3 ? 3 : gauge;

    return (
        <div className="flex">
            <label className="od_text">
                <span className={turn.overDriveGauge < 0 ? "od_minus" : ""}>{`${(turn.overDriveGauge).toFixed(2)}%`}</span><br />⇒
                <span className={overDriveGauge < 0 ? "od_minus" : ""}>{`${overDriveGauge.toFixed(2)}%`}</span>
            </label>
            <div className="inc_od_icon">
                {gauge > 0 ?
                    <img className="od_number" src={overdriveIcons[`ButtonOverdrive${gauge}Default`]} alt={`Overdrive${gauge}`} />
                    :
                    <img className="od_icon" src={overdriveIcons["FrameOverdriveGaugeR"]} alt={`OverdriveNone`} />
                }
            </div>
        </div>
    );
}

export default OverDriveGauge;