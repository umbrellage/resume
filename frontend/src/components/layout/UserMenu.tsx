import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface UserMenuProps {}

export default function UserMenu({}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();

  if (!token || !user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <span className="text-xs font-medium text-white">{user.email[0].toUpperCase()}</span>
        </div>
        <span className="text-sm text-gray-600 max-w-24 truncate">{user.email}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">{user.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {user.email.includes('premium') || user.email.includes('pro') ? 'Premium' : 'Free'} 用户
              </p>
            </div>

            <div className="py-2">
              <button
                onClick={() => { logout(); navigate('/'); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
