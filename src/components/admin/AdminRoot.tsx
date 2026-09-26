import { useEffect, useState } from 'react';
import { getCurrentAdminSession, onAdminSessionChange, type AdminSession } from '../../services/authRepository';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';

export function AdminRoot() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentAdminSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setCheckingSession(false);
      }
    });
    const unsubscribe = onAdminSessionChange((s) => {
      setSession(s);
      setCheckingSession(false);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  if (checkingSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={(s) => setSession(s)} />;
  }

  return <AdminLayout onLogout={() => setSession(null)} />;
}
