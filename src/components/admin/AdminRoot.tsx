import { useState } from 'react';
import { isAdminAuthed, setAdminAuthed } from '../../services/authRepository';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';

export function AdminRoot() {
  const [authed, setAuthed] = useState(() => isAdminAuthed());

  if (!authed) {
    return (
      <AdminLogin
        onLogin={() => {
          setAdminAuthed(true);
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <AdminLayout
      onLogout={() => {
        setAdminAuthed(false);
        setAuthed(false);
      }}
    />
  );
}
