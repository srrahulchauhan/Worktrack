import React from 'react';
import { useWorkTrack } from '../../context/WorkTrackContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function WorkTrackToasts() {
  const { toasts, removeToast } = useWorkTrack();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              isError
                ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : isInfo
                ? 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                : 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isError ? (
                <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
              ) : isInfo ? (
                <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <p className="text-xs font-semibold leading-snug truncate">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
