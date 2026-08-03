'use client';
import { useEffect, useState } from 'react';

// Prevents SSR/client mismatch when Zustand persisted state
// differs from server-rendered HTML.
export default function HydrationGuard({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Show children immediately on server, wait for mount on client
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }
  return <>{children}</>;
}
