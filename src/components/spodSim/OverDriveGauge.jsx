import React from "react";
import { getOverDrive } from "./logic";
import overdriveIcons from 'assets/overdrive';

const OverDriveGauge = ({ turn }) => {
    const overDriveGauge = turn.overDriveGauge;
    const calcOverDriveGauge = getOverDrive(turn);
    turn.calcOverDriveGauge = calcOverDriveGauge;
    let gauge = Math.floor(overDriveGauge / 100);
    const maxGauge = Math.floor(turn.maxOverDriveGauge / 100);
    gauge = gauge > maxGauge ? maxGauge : gauge;

    return (
        <div className="flex">
            <label className="od_text">
                <span className={overDriveGauge < 0 ? "od_minus" : ""}>{`${(overDriveGauge).toFixed(2)}%`}</span><br />⇒
                <span className={calcOverDriveGauge < 0 ? "od_minus" : ""}>{`${calcOverDriveGauge.toFixed(2)}%`}</span>
            </label>
            <div className="inc_od_icon">
                {gauge > 0 ?
                    <>
                        { turn.maxOverDriveGauge <= 300 ?
                            <img className="od_number" src={overdriveIcons[`ButtonOverdrive${gauge}Default`]} alt={`Overdrive${gauge}`} />
                            :
                            <img className="od_number" src={overdriveIcons[`ButtonOverdrive${gauge}PentagonDefault`]} alt={`Overdrive${gauge}`} />
                        }
                    </>
                    :
                    <img className="od_icon" src={overdriveIcons["FrameOverdriveGaugeR"]} alt={`OverdriveNone`} />
                }
            </div>
        </div>
    );
}

export default OverDriveGauge;