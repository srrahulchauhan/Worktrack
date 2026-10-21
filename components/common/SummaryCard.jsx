import { ChevronRight } from "lucide-react";

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "blue",
  className = "",
  onClick,
}) {
  const variantStyles = {
    blue: {
      surface:
        "bg-blue-50/80 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/70",
      icon: "bg-blue-500 text-white",
    },
    green: {
      surface:
        "bg-emerald-50/80 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/70",
      icon: "bg-emerald-500 text-white",
    },
    red: {
      surface:
        "bg-rose-50/80 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/70",
      icon: "bg-rose-500 text-white",
    },
    amber: {
      surface:
        "bg-amber-50/80 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/70",
      icon: "bg-amber-500 text-white",
    },
    indigo: {
      surface:
        "bg-indigo-50/80 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/70",
      icon: "bg-violet-500 text-white",
    },
    slate: {
      surface:
        "bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800",
      icon: "bg-slate-500 text-white",
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative flex min-h-[86px] items-center gap-3 rounded-2xl border p-3 transition-colors ${style.surface} ${onClick ? "cursor-pointer hover:brightness-[0.98] active:scale-[0.99]" : ""} ${className}`}
    >
      {Icon && (
        <div
          className={`w-10 h-10 rounded-full shrink-0 grid place-items-center shadow-sm ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2.2} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate">
          {title}
        </p>
        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
          {value}
        </h4>
        {subtitle && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {onClick && (
        <ChevronRight size={15} className="shrink-0 text-slate-400" />
      )}
    </div>
  );
}
