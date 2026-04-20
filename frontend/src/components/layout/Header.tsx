import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useResumeStore } from '../../store/useResumeStore';
import type { EditorStyle } from '../../store/useResumeStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface HeaderProps {
  saveStatus?: SaveStatus;
  onSave?: () => void;
  onShowLogin?: () => void;
  onSendEmail?: () => void;
  showBack?: boolean;
  title?: string;
  editableTitle?: boolean;
  onTitleChange?: (title: string) => void;
}

export default function Header({ saveStatus = 'idle', onSave, onShowLogin, onSendEmail, showBack, title = '轻松简历', editableTitle, onTitleChange }: HeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { editorStyle, setEditorStyle } = useResumeStore();

  const toggleEditorStyle = () => {
    setEditorStyle(editorStyle === 'flat' ? 'card' : 'flat');
  };

  const handleTitleClick = () => {
    if (!editableTitle) return;
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange && titleValue !== title) {
      onTitleChange(titleValue);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return '保存中...';
      case 'saved':
        return '已保存';
      case 'error':
        return '保存失败';
      default:
        return '保存';
    }
  };

  const getSaveButtonStyle = () => {
    switch (saveStatus) {
      case 'saving':
        return 'bg-gray-100 text-gray-500';
      case 'saved':
        return 'bg-green-50 text-green-600';
      case 'error':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← 返回
          </button>
        )}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className="text-base font-semibold text-gray-800 border-b border-blue-500 bg-transparent px-1 py-0.5 outline-none"
          />
        ) : (
          <h1
            onClick={handleTitleClick}
            className={`text-base font-semibold text-gray-800 ${editableTitle ? 'cursor-pointer hover:text-blue-600' : ''}`}
          >
            {titleValue || '轻松简历'}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleEditorStyle}
          title={editorStyle === 'flat' ? '当前：扁平模式，点击切换为卡片模式' : '当前：卡片模式，点击切换为扁平模式'}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {editorStyle === 'flat' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="4" x2="15" y2="4" />
              <line x1="3" y1="9" x2="15" y2="9" />
              <line x1="3" y1="14" x2="15" y2="14" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="6" height="5" rx="1" />
              <rect x="10" y="3" width="6" height="5" rx="1" />
              <rect x="4" y="10" width="6" height="5" rx="1" />
              <rect x="12" y="10" width="4" height="5" rx="1" opacity="0.5" />
            </svg>
          )}
        </button>
        {token && user ? (
          <>
            <span className="text-sm text-gray-400">{user.email}</span>
            {onSave && (
              <button
                onClick={onSave}
                disabled={saveStatus === 'saving'}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${getSaveButtonStyle()} disabled:cursor-not-allowed`}
              >
                {getSaveButtonText()}
              </button>
            )}
            {onSendEmail && (
              <button
                onClick={onSendEmail}
                className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                发送简历
              </button>
            )}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              退出
            </button>
          </>
        ) : (
          <>
            {onShowLogin && (
              <button
                onClick={onShowLogin}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                登录
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
