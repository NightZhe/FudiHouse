import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * 後台登入狀態存取層（Supabase Auth，email + 密碼）。
 *
 * 登入成功但帳號不在 `public.staff` 名單內，視同沒有後台權限：顯示錯誤並自動登出，
 * 不讓「登入成功」與「有後台權限」被混為一談。
 */

export interface AdminSession {
  userId: string;
  email: string | null;
}

async function isStaffMember(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('staff').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(`無法確認帳號權限：${error.message}`);
  return data !== null;
}

function toAdminSession(session: Session): AdminSession {
  return { userId: session.user.id, email: session.user.email ?? null };
}

function mapSignInError(message: string): string {
  if (message.includes('Invalid login credentials')) return '帳號或密碼錯誤';
  if (message.includes('Email not confirmed')) return '帳號尚未完成驗證，請聯絡管理員';
  return `登入失敗：${message}`;
}

/** Email + 密碼登入；成功但非員工會自動登出並丟出「此帳號沒有後台權限」。 */
export async function signInStaff(email: string, password: string): Promise<AdminSession> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapSignInError(error.message));
  if (!data.session) throw new Error('登入失敗，請稍後再試');

  const staff = await isStaffMember(data.session.user.id).catch(async (err) => {
    await supabase.auth.signOut();
    throw err;
  });
  if (!staff) {
    await supabase.auth.signOut();
    throw new Error('此帳號沒有後台權限');
  }

  return toAdminSession(data.session);
}

export async function signOutStaff(): Promise<void> {
  await supabase.auth.signOut();
}

/** 目前登入狀態；只有「已登入且在員工名單內」才回傳 session，否則回傳 null。 */
export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  const staff = await isStaffMember(data.session.user.id).catch(() => false);
  return staff ? toAdminSession(data.session) : null;
}

/** 訂閱登入狀態變化；回傳的函式用於取消訂閱。 */
export function onAdminSessionChange(callback: (session: AdminSession | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      callback(null);
      return;
    }
    isStaffMember(session.user.id)
      .then((staff) => callback(staff ? toAdminSession(session) : null))
      .catch(() => callback(null));
  });
  return () => data.subscription.unsubscribe();
}
