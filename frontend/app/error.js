'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="page min-h-[60vh] flex flex-col items-center justify-center text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <h1 className="text-xl font-semibold text-ink-900 mb-1">Something went wrong</h1>
      <p className="text-ink-500 text-sm mb-6">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
