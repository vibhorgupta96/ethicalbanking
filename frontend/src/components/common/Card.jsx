export function Card({ title, subtitle, children, actions, headerAction, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-lg font-bold text-slate-900">{title}</div>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </header>
      <div className="space-y-4 text-slate-700">{children}</div>
      {actions && (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          {actions}
        </div>
      )}
    </section>
  );
}

