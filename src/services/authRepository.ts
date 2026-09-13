/**
 * 後台登入狀態存取層。
 *
 * 第一版是純前端示範密碼，寫在公開 repo 裡不具安全性；正式上線前必須換成
 * 後端驗證（例如換發 session token），屆時只需要改這個檔案。
 */

const SESSION_KEY = 'fudi_admin_authed';

/** 示範密碼——僅供第一版展示用，正式環境需替換為後端登入。 */
export const DEMO_ADMIN_PASSWORD = 'fudi2026';

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function verifyAdminPassword(password: string): boolean {
  return password === DEMO_ADMIN_PASSWORD;
}

export function setAdminAuthed(authed: boolean): void {
  if (authed) {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
