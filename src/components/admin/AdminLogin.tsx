import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { verifyAdminPassword } from '../../services/authRepository';
import { Logo } from '../layout/Logo';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(password)) {
      setError('');
      onLogin();
    } else {
      setError('密碼錯誤，請重新輸入');
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
            <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">
              管理密碼
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
                placeholder="請輸入管理密碼"
                autoFocus
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
            disabled={!password}
            className="min-h-[44px] w-full rounded-xl bg-brand-500 text-sm font-bold text-white disabled:opacity-40"
          >
            登入後台
          </button>
        </form>

        <div className="mt-6 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xs text-white/40">
            示範密碼：<span className="font-mono font-bold text-white/70">fudi2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
