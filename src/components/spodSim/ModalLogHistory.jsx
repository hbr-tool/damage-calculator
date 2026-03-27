import React from 'react';

const ModalLogHistory = ({turnData}) => {
    return (
        <div className="p-8">
            <div className="mb-4">
                <label className="modal_label">戦闘ログ（β版）</label>
            </div>
            {turnData.log.map((log, index) => (
                <div key={index} className="mb-2">
                    <span className="log_history">{log}</span>
                </div>
            ))}
        </div>
    )
};

export default ModalLogHistory;