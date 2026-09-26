import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { signInStaff, type AdminSession } from '../../services/authRepository';
import { Logo } from '../layout/Logo';

interface AdminLoginProps {
  onLogin: (session: AdminSession) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const session = await signInStaff(email.trim(), password);
      onLogin(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-brand-900">
      <div className="px-5 pt-5">
        <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-white/60">
          <ArrowLeft size={16} />
          返回前台
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="mb-8">
          <Logo variant="full" tone="inverted" />
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
              帳號 Email
            </label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="staff@example.com"
                autoComplete="username"
                autoFocus
                className="min-h-[44px] w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
              密碼
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="請輸入密碼"
                autoComplete="current-password"
                className="min-h-[44px] w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-12 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/40"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={!email || !password || submitting}
            className="min-h-[44px] w-full rounded-xl bg-brand-500 text-sm font-bold text-white disabled:opacity-40"
          >
            {submitting ? '登入中…' : '登入後台'}
          </button>
        </form>
      </div>
    </div>
  );
}
