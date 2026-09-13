import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

const HIDE_NAV_PATTERN = /^\/house\//;

export function CustomerLayout() {
  const location = useLocation();
  const showBottomNav = !HIDE_NAV_PATTERN.test(location.pathname);

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-surface shadow-[0_0_0_1px_var(--color-border)] sm:my-0">
        <main className={`flex-1 ${showBottomNav ? 'pb-20' : ''}`}>
          <Outlet />
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
