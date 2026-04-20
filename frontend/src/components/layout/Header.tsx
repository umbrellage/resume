import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useResumeStore } from '../../store/useResumeStore';
import TemplateSelector from './TemplateSelector';
import UserMenu from './UserMenu';

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
  onToggleEditor?: () => void;
  editorHidden?: boolean;
  showEditorControls?: boolean;
}

export default function Header({ saveStatus = 'idle', onSave, onShowLogin, onSendEmail, showBack, title = '轻松简历', editableTitle, onTitleChange, onToggleEditor, editorHidden, showEditorControls = false }: HeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
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
            className={`group flex items-center gap-1.5 text-base font-semibold transition-colors ${editableTitle ? 'cursor-pointer text-gray-700 hover:text-blue-600' : 'text-gray-800'}`}
          >
            <span>{titleValue || '轻松简历'}</span>
            {editableTitle && (
              <svg className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showEditorControls && (
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
        )}
        {showEditorControls && onToggleEditor && (
          <button
            onClick={onToggleEditor}
            className={`p-1.5 rounded-lg transition-colors ${editorHidden ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            title={editorHidden ? '显示编辑区' : '隐藏编辑区'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="14" height="12" rx="2" />
              <line x1="6" y1="7" x2="12" y2="7" />
              <line x1="6" y1="10" x2="10" y2="10" />
            </svg>
          </button>
        )}
        {showEditorControls && <TemplateSelector />}
        {showEditorControls && onSave && (
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${saveStatus === 'saving' ? 'bg-gray-100 text-gray-500' : saveStatus === 'saved' ? 'bg-green-50 text-green-600' : saveStatus === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '已保存' : saveStatus === 'error' ? '保存失败' : '保存'}
          </button>
        )}
        {token && user ? (
          <UserMenu />
        ) : (
          onShowLogin && (
            <button
              onClick={onShowLogin}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录
            </button>
          )
        )}
      </div>
    </header>
  );
}
