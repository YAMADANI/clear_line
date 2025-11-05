import React from "react";

interface CancelCalledModalProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  number: number | null;
}

export default function CancelCalledModal({ open, onClose, onCancel, number }: CancelCalledModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[280px] flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-700 mb-4">取消確認</div>
        <div className="flex flex-col items-center mb-6">
          <span className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded bg-linear-to-br from-gray-400 to-gray-200 text-white mb-2">
            {number}
          </span>
          <span className="text-gray-600">この番号を取消しますか？</span>
        </div>
        <div className="flex gap-4">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-bold"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-bold"
            onClick={onCancel}
          >
            取消する
          </button>
        </div>
      </div>
    </div>
  );
}
