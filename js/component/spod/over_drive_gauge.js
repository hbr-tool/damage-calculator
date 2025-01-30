const OverDriveGauge = ({ turn }) => {

   
    let over_drive_gauge = turn.over_drive_gauge;
    let add_over_drive_gauge = getOverDrive(turn);
    turn.add_over_drive_gauge = add_over_drive_gauge;
    over_drive_gauge += add_over_drive_gauge;
    over_drive_gauge = over_drive_gauge > 300 ? 300 : over_drive_gauge;
    let gauge = Math.floor(turn.over_drive_gauge / 100);

    return (
        <div className="flex">
            <label className="od_text">
                <span className={turn.over_drive_gauge < 0 ? "od_minus" : ""}>{`${(turn.over_drive_gauge).toFixed(2)}%`}</span><br />⇒
                <span className={over_drive_gauge < 0 ? "od_minus" : ""}>{`${over_drive_gauge.toFixed(2)}%`}</span>
            </label>
            <div className="inc_od_icon">
                {gauge > 0 ?
                    <img className="od_number" src={`img/ButtonOverdrive${gauge}Default.webp`} />
                    :
                    <img className="od_icon" src="img/FrameOverdriveGaugeR.webp" />
                }
            </div>
        </div>
    );
}
