import React from 'react';
import type { Toast } from '../types';

interface ToastProps {
  toast: Toast;
  onDismiss: (id: number) => void;
}

const ToastMessage: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { message, type } = toast;

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center justify-between transition-all transform';
  const typeClasses = {
    success: 'bg-green-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-slate-700/90 text-slate-200',
  };

  const icon = {
    success: (
      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    ),
    error: (
      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    info: (
      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex items-center">
        {icon[type]}
        <span>{message}</span>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="ml-4 p-1 rounded-full hover:bg-black/20">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};


interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3">
      {toasts.map(toast => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};