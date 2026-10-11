import React from 'react';

export function AttendanceBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const badgeMap = {
    Present: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
    Absent: {
      bg: 'bg-rose-100 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
    },
    'Half Day': {
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    'Weekly Off': {
      bg: 'bg-indigo-100 dark:bg-indigo-950/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-800',
      dot: 'bg-indigo-500',
    },
    'Paid Leave': {
      bg: 'bg-teal-100 dark:bg-teal-950/60',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-300 dark:border-teal-800',
      dot: 'bg-teal-500',
    },
    'Unpaid Leave': {
      bg: 'bg-slate-200 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    Holiday: {
      bg: 'bg-purple-100 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-800',
      dot: 'bg-purple-500',
    },
  };

  const current = badgeMap[status] || badgeMap['Present'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{status}</span>
    </span>
  );
}

export function PaymentStatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const map = {
    Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    'Partially Paid': 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    Pending: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    Delayed: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${map[status] || map['Pending']} ${sizeClasses}`}
    >
      {status}
    </span>
  );
}
