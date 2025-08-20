import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end space-x-2">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onConfirm}>OK</button>
                    <button className="bg-gray-300 px-4 py-2 rounded" onClick={onCancel}>キャンセル</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;