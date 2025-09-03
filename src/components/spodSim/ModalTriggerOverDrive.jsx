import React from "react";
import overdriveIcons from 'assets/overdrive';

const ModalTriggerOverDrive = ({ closeModal, triggerOverDrive, overDriveLevel }) => {

    const selectOverDrive = (overDriveLevel) => {
        triggerOverDrive(true, overDriveLevel);
        closeModal();
    }
    return (
        <div className="p-6">
            <div>
                <label className="modal_label">レベル選択</label>
            </div>
            <div className="flex justify-center">
                {Array.from({ length: overDriveLevel }, (_, i) => i + 1).map((gauge) => {
                    return <img className="od_number" src={overdriveIcons[`ButtonOverdrive${gauge}Default`]} alt={`Overdrive${gauge}`}
                        onClick={() => selectOverDrive(gauge)} />
                })}
            </div>
        </div>
    )
};

export default ModalTriggerOverDrive;