// Reusable UI primitives

export function Spinner({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-ink-400">
      <Spinner size={24} />
    </div>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="text-center py-16 px-4">
      {icon && <div className="text-4xl mb-4 select-none">{icon}</div>}
      <p className="font-semibold text-ink-900 text-base">{title}</p>
      {body && <p className="text-ink-500 text-sm mt-1 max-w-xs mx-auto">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return <p className="alert-error">{message}</p>;
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return <p className="alert-success">{message}</p>;
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton h-44" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="flex justify-between pt-2">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { currentPage, totalPages, totalProperties } = pagination;

  return (
    <div className="flex items-center justify-between mt-8 pt-4 border-t border-ink-100">
      <p className="text-xs text-ink-400">{totalProperties} total</p>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="btn-secondary btn-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-xs text-ink-500 px-2">
          {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="btn-secondary btn-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, condition, fallback }) {
  if (!condition) return fallback || null;
  return children;
}
