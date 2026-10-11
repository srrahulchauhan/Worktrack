import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  className = '',
  onClick,
}) {
  const variantStyles = {
    blue: {
      cardBg: 'bg-white dark:bg-dark-900/90 bg-gradient-to-br from-blue-50/70 via-white to-white dark:from-blue-950/40 dark:via-dark-900 dark:to-dark-950 border-slate-200/80 dark:border-blue-500/20 hover:border-blue-500/80 dark:hover:border-blue-400/80',
      glowShadow: 'hover:shadow-[0_12px_30px_-5px_rgba(59,130,246,0.18)] dark:hover:shadow-[0_12px_35px_-8px_rgba(59,130,246,0.35)]',
      orbColor: 'from-blue-500/15 via-cyan-500/10 to-transparent dark:from-blue-500/30 dark:via-cyan-500/15 dark:to-transparent',
      iconBox: 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25',
      textAccent: 'text-blue-600 dark:text-blue-400',
      dotColor: 'bg-blue-500 dark:bg-blue-400',
      tagBg: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-500/30',
    },
    green: {
      cardBg: 'bg-white dark:bg-dark-900/90 bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/40 dark:via-dark-900 dark:to-dark-950 border-slate-200/80 dark:border-emerald-500/20 hover:border-emerald-500/80 dark:hover:border-emerald-400/80',
      glowShadow: 'hover:shadow-[0_12px_30px_-5px_rgba(16,185,129,0.18)] dark:hover:shadow-[0_12px_35px_-8px_rgba(16,185,129,0.35)]',
      orbColor: 'from-emerald-500/15 via-teal-500/10 to-transparent dark:from-emerald-500/30 dark:via-teal-500/15 dark:to-transparent',
      iconBox: 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/25',
      textAccent: 'text-emerald-600 dark:text-emerald-400',
      dotColor: 'bg-emerald-500 dark:bg-emerald-400',
      tagBg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30',
    },
    red: {
      cardBg: 'bg-white dark:bg-dark-900/90 bg-gradient-to-br from-rose-50/70 via-white to-white dark:from-rose-950/40 dark:via-dark-900 dark:to-dark-950 border-slate-200/80 dark:border-rose-500/20 hover:border-rose-500/80 dark:hover:border-rose-400/80',
      glowShadow: 'hover:shadow-[0_12px_30px_-5px_rgba(244,63,94,0.18)] dark:hover:shadow-[0_12px_35px_-8px_rgba(244,63,94,0.35)]',
      orbColor: 'from-rose-500/15 via-pink-500/10 to-transparent dark:from-rose-500/30 dark:via-red-500/15 dark:to-transparent',
      iconBox: 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/25',
      textAccent: 'text-rose-600 dark:text-rose-400',
      dotColor: 'bg-rose-500 dark:bg-rose-400',
      tagBg: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/30',
    },
    amber: {
      cardBg: 'bg-white dark:bg-dark-900/90 bg-gradient-to-br from-amber-50/70 via-white to-white dark:from-amber-950/40 dark:via-dark-900 dark:to-dark-950 border-slate-200/80 dark:border-amber-500/20 hover:border-amber-500/80 dark:hover:border-amber-400/80',
      glowShadow: 'hover:shadow-[0_12px_30px_-5px_rgba(245,158,11,0.18)] dark:hover:shadow-[0_12px_35px_-8px_rgba(245,158,11,0.35)]',
      orbColor: 'from-amber-500/15 via-orange-500/10 to-transparent dark:from-amber-500/30 dark:via-orange-500/15 dark:to-transparent',
      iconBox: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25',
      textAccent: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500 dark:bg-amber-400',
      tagBg: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30',
    },
    indigo: {
      cardBg: 'bg-white dark:bg-dark-900/90 bg-gradient-to-br from-indigo-50/70 via-white to-white dark:from-indigo-950/40 dark:via-dark-900 dark:to-dark-950 border-slate-200/80 dark:border-indigo-500/20 hover:border-indigo-500/80 dark:hover:border-indigo-400/80',
      glowShadow: 'hover:shadow-[0_12px_30px_-5px_rgba(99,102,241,0.18)] dark:hover:shadow-[0_12px_35px_-8px_rgba(99,102,241,0.35)]',
      orbColor: 'from-indigo-500/15 via-purple-500/10 to-transparent dark:from-indigo-500/30 dark:via-purple-500/15 dark:to-transparent',
      iconBox: 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-md shadow-indigo-500/25',
      textAccent: 'text-indigo-600 dark:text-indigo-400',
      dotColor: 'bg-indigo-500 dark:bg-indigo-400',
      tagBg: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/30',
    },
    slate: {
      cardBg: 'bg-white dark:bg-dark-900/90 bg-gradient-to-br from-slate-100/60 via-white to-white dark:from-slate-900/80 dark:via-dark-900 dark:to-dark-950 border-slate-200/80 dark:border-slate-700/40 hover:border-slate-400 dark:hover:border-cyan-500/60',
      glowShadow: 'hover:shadow-[0_12px_30px_-5px_rgba(100,116,139,0.15)] dark:hover:shadow-[0_12px_35px_-8px_rgba(6,182,212,0.25)]',
      orbColor: 'from-slate-400/15 via-slate-300/10 to-transparent dark:from-cyan-500/20 dark:via-slate-700/15 dark:to-transparent',
      iconBox: 'bg-gradient-to-tr from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-600 text-white shadow-md shadow-slate-700/25',
      textAccent: 'text-slate-700 dark:text-slate-300',
      dotColor: 'bg-slate-500 dark:bg-cyan-400',
      tagBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-300 ease-out select-none overflow-hidden backdrop-blur-xl ${
        style.cardBg
      } ${style.glowShadow} ${
        onClick
          ? 'cursor-pointer hover:-translate-y-1.5 active:scale-[0.98]'
          : 'hover:-translate-y-0.5'
      } ${className}`}
    >
      {/* Ambient Pulsing Glow Orb in the corner */}
      <div
        className={`pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${style.orbColor} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500`}
      />

      {/* Sweeping Light Beam (Shimmer effect on hover) */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />

      {/* Top Header Row: Title & Icon Box */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className={`w-2 h-2 rounded-full ${style.dotColor} animate-pulse shrink-0 ring-2 ring-white/50 dark:ring-transparent`}
            />
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors truncate">
              {title}
            </p>
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 truncate group-hover:scale-[1.02] origin-left transition-transform duration-200">
            {value}
          </h4>

          {subtitle && (
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 mt-1 truncate transition-colors">
              {subtitle}
            </p>
          )}

          {trend && (
            <div
              className={`mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.tagBg}`}
            >
              <Sparkles size={11} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Floating Glowing Icon with hover bounce */}
        {Icon && (
          <div className="relative shrink-0">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${style.iconBox}`}
            >
              <Icon size={21} strokeWidth={2.2} />
            </div>

            {/* Micro Click Indicator */}
            {onClick && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={10} className="text-slate-700 dark:text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Glowing Border Line on Hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-blue-500/60 dark:via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
}
