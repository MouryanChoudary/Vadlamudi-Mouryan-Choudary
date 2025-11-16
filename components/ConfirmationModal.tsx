import React, { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirmation-title"
    >
      <div
        className="bg-[#1E293B] w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="confirmation-title" className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-slate-400">{message}</p>
        </div>
        <div className="bg-slate-800/50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};