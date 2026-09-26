import type { ReactNode } from 'react';
import { LayoutDashboard, List, LogOut, PlusCircle } from 'lucide-react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useListings } from '../../context/ListingsContext';
import { signOutStaff } from '../../services/authRepository';
import { Logo } from '../layout/Logo';
import { Dashboard } from './Dashboard';
import { ListingsManager } from './ListingsManager';
import { ListingForm } from './ListingForm';

interface AdminLayoutProps {
  onLogout: () => void;
}

export function AdminLayout({ onLogout }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isFormRoute = location.pathname === '/admin/new' || location.pathname.startsWith('/admin/edit/');

  const handleLogout = async () => {
    await signOutStaff();
    onLogout();
  };

  return (
    <div className="min-h-dvh bg-surface-alt">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-surface-alt shadow-[0_0_0_1px_var(--color-border)]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-5 py-3">
          <Logo variant="full" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-alt"
            aria-label="登出"
            title="登出"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className={`flex-1 ${isFormRoute ? '' : 'pb-20'}`}>
          <Routes>
            <Route
              index
              element={
                <Dashboard onNavigateListings={() => navigate('/admin/listings')} onNavigateAdd={() => navigate('/admin/new')} />
              }
            />
            <Route
              path="listings"
              element={
                <ListingsManager
                  onEdit={(listing) => navigate(`/admin/edit/${listing.id}`)}
                  onAdd={() => navigate('/admin/new')}
                />
              }
            />
            <Route path="new" element={<ListingFormRoute />} />
            <Route path="edit/:id" element={<ListingFormRoute />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>

        {!isFormRoute && (
          <nav
            className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl border-t border-border bg-white"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <TabButton
              active={location.pathname === '/admin'}
              onClick={() => navigate('/admin')}
              icon={<LayoutDashboard size={20} />}
              label="總覽"
            />
            <TabButton
              active={location.pathname === '/admin/listings'}
              onClick={() => navigate('/admin/listings')}
              icon={<List size={20} />}
              label="物件管理"
            />
            <button
              type="button"
              onClick={() => navigate('/admin/new')}
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-ink-700"
            >
              <PlusCircle size={20} />
              新增物件
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

/** `/admin/new`（新增）與 `/admin/edit/:id`（編輯）共用的路由包裝：依網址決定要編輯的物件。 */
function ListingFormRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListingById } = useListings();
  const isEditing = id !== undefined;
  const listing = isEditing ? (getListingById(id) ?? null) : null;

  // 編輯網址帶的 id 找不到物件（例如已被刪除）：回列表，不要卡在空表單。
  if (isEditing && !listing) {
    return <Navigate to="/admin/listings" replace />;
  }

  return (
    <ListingForm
      initialListing={listing}
      onDone={() => navigate('/admin/listings')}
      onCancel={() => navigate('/admin/listings')}
    />
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
        active ? 'font-bold text-brand-700' : 'font-medium text-ink-500'
      }`}
    >
      {active && <span className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-brand-700" />}
      {icon}
      {label}
    </button>
  );
}
