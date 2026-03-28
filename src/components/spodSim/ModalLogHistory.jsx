import React from 'react';

const ModalLogHistory = ({turnData}) => {
    return (
        <div className="p-8">
            <div className="mb-4">
                <span className="modal_label">戦闘ログ（β版）</span>
                <span>現在は「次ターン押下時」時に再反映します。</span>
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