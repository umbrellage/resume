# 多份简历支持实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 支持用户创建、管理多份简历，落地页展示，仪表板管理简历列表

**Architecture:** React Router 路由系统，Dashboard 显示简历列表，EditorPage 从服务器加载简历，登录时检测 localStorage 导入

**Tech Stack:** react-router-dom, existing Zustand stores, existing API clients

---

## 文件结构

### Frontend 新增
- `frontend/src/pages/DashboardPage.tsx` - 简历列表页
- `frontend/src/pages/TemplatesPage.tsx` - 模板选择页
- `frontend/src/components/common/ResumeCard.tsx` - 简历卡片组件
- `frontend/src/components/common/Modal.tsx` - 通用弹窗组件

### Frontend 修改
- `frontend/src/App.tsx` - 添加 React Router
- `frontend/src/main.tsx` - 添加 BrowserRouter
- `frontend/src/pages/LandingPage.tsx` - 改为未登录用户的落地页
- `frontend/src/pages/EditorPage.tsx` - 支持从服务器加载简历
- `frontend/src/store/authStore.ts` - 添加登录时检测 localStorage 逻辑

### Backend 新增
- `backend/src/routes/resumes.ts` - 添加复制简历端点

---

## Task 1: 安装 React Router

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: 添加 react-router-dom**

```json
{
  "dependencies": {
    "react-router-dom": "^7.0.0"
  }
}
```

Run: `cd frontend && npm install`

---

## Task 2: 设置路由系统

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 更新 main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: 更新 App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TemplatesPage from './pages/TemplatesPage';
import EditorPage from './pages/EditorPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/templates" element={
        <ProtectedRoute>
          <TemplatesPage />
        </ProtectedRoute>
      } />
      <Route path="/editor/:id" element={
        <ProtectedRoute>
          <EditorPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
```

---

## Task 3: 创建 Modal 组件

**Files:**
- Create: `frontend/src/components/common/Modal.tsx`

- [ ] **Step 1: 创建 Modal**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

---

## Task 4: 创建 ResumeCard 组件

**Files:**
- Create: `frontend/src/components/common/ResumeCard.tsx`

- [ ] **Step 1: 创建 ResumeCard**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeListItem } from '../../api/resumes';
import { shareResume, deleteResume, listResumes } from '../../api/resumes';
import { useAuthStore } from '../../store/authStore';
import Modal from './Modal';

interface ResumeCardProps {
  resume: ResumeListItem;
  onUpdate: () => void;
}

export default function ResumeCard({ resume, onUpdate }: ResumeCardProps) {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    navigate(`/editor/${resume.id}`);
  };

  const handleShare = async () => {
    if (!token) return;
    try {
      const { shareToken } = await shareResume(token, resume.id);
      const url = `${window.location.origin}/shared/${shareToken}`;
      setShareUrl(url);
      setShowShare(true);
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    setIsDeleting(true);
    try {
      await deleteResume(token, resume.id);
      setShowDelete(false);
      onUpdate();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-sm">
          简历预览
        </div>
        <h3 className="font-semibold text-gray-900 truncate">{resume.title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          模板: {resume.templateId} · {formatDate(resume.updatedAt)}
        </p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEdit}
            className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            编辑
          </button>
          <button
            onClick={handleShare}
            className="py-1.5 px-3 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            分享
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="py-1.5 px-3 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <Modal isOpen={showShare} onClose={() => setShowShare(false)} title="分享简历">
        <p className="text-sm text-gray-600 mb-3">复制以下链接分享你的简历：</p>
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
          }}
          className="w-full py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          复制链接
        </button>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="删除简历">
        <p className="text-sm text-gray-600 mb-4">
          确定要删除 "{resume.title}" 吗？此操作不可撤销。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </button>
        </div>
      </Modal>
    </>
  );
}
```

---

## Task 5: 创建 DashboardPage

**Files:**
- Create: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: 创建 DashboardPage**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { listResumes } from '../api/resumes';
import type { ResumeListItem } from '../api/resumes';
import ResumeCard from '../components/common/ResumeCard';
import Header from '../components/layout/Header';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResumes = async () => {
    if (!token) return;
    try {
      const { resumes } = await listResumes(token);
      setResumes(resumes);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [token]);

  const handleNewResume = () => {
    navigate('/templates');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">我的简历</h1>
          <button
            onClick={handleNewResume}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + 新建简历
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">还没有简历</p>
            <button
              onClick={handleNewResume}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建第一份简历
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onUpdate={fetchResumes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 6: 创建 TemplatesPage

**Files:**
- Create: `frontend/src/pages/TemplatesPage.tsx`

- [ ] **Step 1: 创建 TemplatesPage**

```tsx
import { useNavigate } from 'react-router-dom';
import { templates } from '../data/templates';
import { useAuthStore } from '../store/authStore';
import { createResume } from '../api/resumes';
import Header from '../components/layout/Header';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const handleSelect = async (templateId: string) => {
    if (!token) return;
    try {
      const { resume } = await createResume(token, {
        title: '我的简历',
        templateId,
        data: {},
      });
      navigate(`/editor/${resume.id}`);
    } catch (err) {
      console.error('Failed to create resume:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">选择模板</h1>
        <p className="text-gray-500 mb-8">选择适合你的简历模板</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all text-left"
            >
              <div className="w-full h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-sm">
                预览
              </div>
              <h3 className="font-semibold text-gray-900">{t.nameZh}</h3>
              <p className="text-sm text-gray-500 mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Task 7: 更新 LandingPage

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

- [ ] **Step 1: 更新 LandingPage 为真正的落地页**

Replace the entire file content:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { templates } from '../data/templates';

export default function LandingPage() {
  const navigate = useNavigate();
  const { token, login, register } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (token) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-8">
        <h1 className="text-lg font-semibold text-gray-900">免费简历制作平台</h1>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          制作专业的简历
        </h2>
        <p className="text-xl text-gray-500 mb-8">
          免费、简单、专业的简历制作平台
        </p>

        {/* Auth Form */}
        <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isLogin ? '登录' : '注册'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            {isLogin ? '没有账号？' : '已有账号？'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-600 hover:underline ml-1"
            >
              {isLogin ? '注册' : '登录'}
            </button>
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">功能特点</h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-semibold text-gray-900 mb-1">多种模板</h4>
              <p className="text-sm text-gray-500">精选简历模板，适合不同岗位</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💾</div>
              <h4 className="font-semibold text-gray-900 mb-1">云端保存</h4>
              <p className="text-sm text-gray-500">简历保存在云端，随时随地访问</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📤</div>
              <h4 className="font-semibold text-gray-900 mb-1">一键分享</h4>
              <p className="text-sm text-gray-500">生成分享链接，方便投递</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 8: 更新 EditorPage 支持服务器加载

**Files:**
- Modify: `frontend/src/pages/EditorPage.tsx`

- [ ] **Step 1: 重写 EditorPage**

The current EditorPage.tsx needs to be completely rewritten to:
1. Read resume ID from URL params (`/editor/:id`)
2. Load resume data from server using that ID
3. Handle save/update to server
4. Keep the save button functionality

```tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';
import { useAuthStore } from '../store/authStore';
import { getSharedResume, updateResume } from '../api/resumes';
import SplitEditor from '../components/layout/SplitEditor';
import type { ResumeData as ServerResumeData } from '../api/resumes';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resume = useResumeStore((s) => s.resume);
  const setResume = useResumeStore((s) => s.setResume);
  const initResume = useResumeStore((s) => s.initResume);
  const { token, user } = useAuthStore();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load resume from server
  useEffect(() => {
    if (!id || !token) return;

    const loadResume = async () => {
      try {
        const { resume: serverResume } = await getSharedResume(id);
        // Convert server format to local format
        // Server returns { id, title, templateId, data }
        // We need to set the resume data
        if (serverResume && serverResume.data) {
          setResume(serverResume.data as any);
        }
        setSaveStatus('idle');
      } catch (err) {
        console.error('Failed to load resume:', err);
        setSaveStatus('error');
      }
    };

    loadResume();
  }, [id, token, setResume]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!token || !user || !id || !resume) return;

    setSaveStatus('saving');

    try {
      const resumeData = {
        title: resume.personalInfo.name || '我的简历',
        templateId: resume.templateId,
        data: resume,
      };
      await updateResume(token, id, resumeData);
      setSaveStatus('saved');
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
      savedTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    }
  };

  if (saveStatus === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (saveStatus === 'error' || !resume) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">简历加载失败</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            返回仪表板
          </button>
        </div>
      </div>
    );
  }

  return <SplitEditor saveStatus={saveStatus} onSave={handleSave} />;
}
```

---

## Task 9: 添加登录时 localStorage 导入

**Files:**
- Modify: `frontend/src/store/authStore.ts`

- [ ] **Step 1: 更新 authStore 添加 localStorage 导入检测**

After successful login, check if localStorage has resume data and prompt to import.

First read the current authStore.ts, then update it:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import { createResume } from '../api/resumes';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  pendingLocalResume: boolean;  // NEW: flag for local resume waiting to be imported
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  importLocalResume: () => Promise<void>;  // NEW: import local resume to server
  dismissLocalResume: () => void;  // NEW: dismiss the import prompt
}

// Check if there's local resume data
function hasLocalResume(): boolean {
  try {
    const data = localStorage.getItem('resume-data');
    return !!data;
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      pendingLocalResume: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(email, password);
          set({ user, token, isLoading: false });
          
          // Check for local resume after successful login
          if (hasLocalResume()) {
            set({ pendingLocalResume: true });
          }
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false });
          throw err;
        }
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.register(email, password);
          set({ user, token, isLoading: false });
          
          // Check for local resume after successful registration
          if (hasLocalResume()) {
            set({ pendingLocalResume: true });
          }
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Registration failed', isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, pendingLocalResume: false });
      },

      clearError: () => {
        set({ error: null });
      },

      importLocalResume: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const dataStr = localStorage.getItem('resume-data');
          if (!dataStr) {
            set({ pendingLocalResume: false });
            return;
          }
          
          const parsed = JSON.parse(dataStr);
          const resumeData = parsed.state?.resume;
          
          if (resumeData) {
            await createResume(token, {
              title: resumeData.personalInfo?.name || '我的简历',
              templateId: resumeData.templateId || 'classic',
              data: resumeData,
            });
            
            // Clear local storage
            localStorage.removeItem('resume-data');
          }
          
          set({ pendingLocalResume: false });
        } catch (err) {
          console.error('Import failed:', err);
          set({ pendingLocalResume: false });
        }
      },

      dismissLocalResume: () => {
        set({ pendingLocalResume: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

---

## Task 10: Dashboard 添加 localStorage 导入弹窗

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: 添加导入弹窗**

Add an import prompt when user logs in with pending local resume.

Add to DashboardPage after the Header:

```tsx
// Add to imports
import { useAuthStore } from '../store/authStore';
import Modal from '../components/common/Modal';

// Add inside DashboardPage component, after useState declarations:
const { pendingLocalResume, importLocalResume, dismissLocalResume } = useAuthStore();
const [isImporting, setIsImporting] = useState(false);

// Add this JSX after the <Header /> component:
{pendingLocalResume && (
  <Modal
    isOpen={true}
    onClose={dismissLocalResume}
    title="导入本地简历"
  >
    <p className="text-sm text-gray-600 mb-4">
      发现您有本地简历数据，是否导入到云端？
    </p>
    <div className="flex gap-3">
      <button
        onClick={dismissLocalResume}
        className="flex-1 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
      >
        暂不导入
      </button>
      <button
        onClick={async () => {
          setIsImporting(true);
          await importLocalResume();
          setIsImporting(false);
          fetchResumes(); // Refresh the list
        }}
        disabled={isImporting}
        className="flex-1 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {isImporting ? '导入中...' : '导入'}
      </button>
    </div>
  </Modal>
)}
```

---

## Task 11: 后端添加复制简历 API

**Files:**
- Modify: `backend/src/routes/resumes.ts`

- [ ] **Step 1: 添加复制端点**

Add this route AFTER authMiddleware in resumes.ts:

```typescript
// POST /api/resumes/:id/duplicate - Duplicate a resume
router.post('/:id/duplicate', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get original
    const original = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
    });
    if (!original) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Create duplicate
    const duplicate = await prisma.resume.create({
      data: {
        userId: req.userId!,
        title: `${original.title} (副本)`,
        templateId: original.templateId,
        data: original.data,
      },
    });

    res.json({ resume: duplicate });
  } catch (error) {
    console.error('Duplicate resume error:', error);
    res.status(500).json({ error: 'Failed to duplicate resume' });
  }
});
```

---

## Task 12: 前端添加复制 API

**Files:**
- Modify: `frontend/src/api/resumes.ts`

- [ ] **Step 1: 添加 duplicateResume 函数**

Add at the end of resumes.ts:

```typescript
export async function duplicateResume(token: string, id: string): Promise<{ resume: ResumeListItem }> {
  const res = await fetch(`${API_BASE}/resumes/${id}/duplicate`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to duplicate resume');
  return res.json();
}
```

---

## Task 13: ResumeCard 添加复制按钮

**Files:**
- Modify: `frontend/src/components/common/ResumeCard.tsx`

- [ ] **Step 1: 添加复制功能**

1. Import `duplicateResume`
2. Add state for duplicating
3. Add handleDuplicate function
4. Add duplicate button to the card

---

## 执行方式

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
