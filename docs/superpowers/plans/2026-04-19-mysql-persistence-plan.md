# MySQL 持久化 + 用户系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为简历平台添加用户注册/登录功能，简历保存到 MySQL 数据库，支持简历分享

**Architecture:** Express + Prisma ORM + MySQL，前端 Zustand store 添加 user/token 状态，API 请求携带 JWT token

**Tech Stack:** Express, Prisma, bcrypt, jsonwebtoken, axios

---

## 文件结构

### Backend 新增
- `backend/prisma/schema.prisma` - 数据库 schema
- `backend/prisma/.env` - 数据库连接配置
- `backend/src/routes/auth.ts` - 认证路由
- `backend/src/routes/resumes.ts` - 简历 CRUD 路由
- `backend/src/middleware/auth.ts` - JWT 认证中间件
- `backend/src/services/db.ts` - Prisma client 导出

### Backend 修改
- `backend/src/index.ts` - 注册新路由
- `backend/package.json` - 添加依赖

### Frontend 新增
- `frontend/src/api/auth.ts` - 认证 API 调用
- `frontend/src/api/resumes.ts` - 简历 API 调用
- `frontend/src/store/authStore.ts` - 用户状态管理

### Frontend 修改
- `frontend/src/store/useResumeStore.ts` - 添加 serverResumeId
- `frontend/src/pages/EditorPage.tsx` - 添加保存按钮和登录状态
- `frontend/src/components/layout/Header.tsx` - 添加用户信息/登录入口

---

## Task 1: 后端依赖安装

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: 添加依赖**

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/uuid": "^10.0.0",
    "prisma": "^5.22.0"
  }
}
```

- [ ] **Step 2: 安装**

Run: `cd backend && npm install`

---

## Task 2: Prisma Schema

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/.env`

- [ ] **Step 1: 创建 schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  resumes   Resume[]
  createdAt DateTime @default(now())
}

model Resume {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String   @default("我的简历")
  templateId  String   @default("classic")
  data        Json
  shareToken  String?  @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

- [ ] **Step 2: 创建 .env**

```
DATABASE_URL="mysql://root:gwl960407@127.0.0.1:3306/resume_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

- [ ] **Step 3: 初始化 Prisma**

Run: `cd backend && npx prisma init`

- [ ] **Step 4: 创建数据库**

Run: `mysql -h 127.0.0.1 -u root -pgwl960407 -e "CREATE DATABASE IF NOT EXISTS resume_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`

- [ ] **Step 5: 运行迁移**

Run: `cd backend && npx prisma migrate dev --name init`

---

## Task 3: Prisma Client 服务

**Files:**
- Create: `backend/src/services/db.ts`

- [ ] **Step 1: 创建 Prisma Client 导出**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

---

## Task 4: JWT 认证中间件

**Files:**
- Create: `backend/src/middleware/auth.ts`

- [ ] **Step 1: 创建中间件**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## Task 5: 认证路由

**Files:**
- Create: `backend/src/routes/auth.ts`

- [ ] **Step 1: 创建 auth 路由**

```typescript
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashed },
      select: { id: true, email: true, createdAt: true },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
```

---

## Task 6: 简历路由

**Files:**
- Create: `backend/src/routes/resumes.ts`

- [ ] **Step 1: 创建简历路由**

```typescript
import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../services/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/resumes - List user's resumes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        title: true,
        templateId: true,
        shareToken: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ resumes });
  } catch (error) {
    console.error('List resumes error:', error);
    res.status(500).json({ error: 'Failed to list resumes' });
  }
});

// POST /api/resumes - Create resume
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, templateId, data } = req.body;
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId!,
        title: title || '我的简历',
        templateId: templateId || 'classic',
        data: data || {},
      },
    });
    res.json({ resume });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// PUT /api/resumes/:id - Update resume
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, templateId, data } = req.body;

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(templateId !== undefined && { templateId }),
        ...(data !== undefined && { data }),
      },
    });
    res.json({ resume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// DELETE /api/resumes/:id - Delete resume
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    await prisma.resume.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// POST /api/resumes/:id/share - Generate/refresh share link
router.post('/:id/share', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const shareToken = uuidv4().replace(/-/g, '');
    const resume = await prisma.resume.update({
      where: { id },
      data: { shareToken },
    });
    res.json({ shareToken: resume.shareToken });
  } catch (error) {
    console.error('Share resume error:', error);
    res.status(500).json({ error: 'Failed to share resume' });
  }
});

export default router;
```

---

## Task 7: 公开分享路由

**Files:**
- Modify: `backend/src/routes/resumes.ts` (add public route)

- [ ] **Step 1: 添加公开访问路由**

在 `resumes.ts` 文件开头添加（不需要 authMiddleware）:

```typescript
// GET /api/shared/:token - Public access to shared resume
router.get('/shared/:token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    const resume = await prisma.resume.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        title: true,
        templateId: true,
        data: true,
      },
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ resume });
  } catch (error) {
    console.error('Shared resume error:', error);
    res.status(500).json({ error: 'Failed to get resume' });
  }
});
```

**注意:** 这个路由需要在 `router.use(authMiddleware)` 之前注册，否则会被拦截

---

## Task 8: 注册路由到 Express

**Files:**
- Modify: `backend/src/index.ts`

- [ ] **Step 1: 更新 index.ts**

```typescript
import express from 'express';
import cors from 'cors';
import pdfRouter from './routes/pdf';
import authRouter from './routes/auth';
import resumesRouter from './routes/resumes';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', pdfRouter);
app.use('/api/auth', authRouter);
app.use('/api/resumes', resumesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
```

---

## Task 9: 前端 API 客户端

**Files:**
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/resumes.ts`

- [ ] **Step 1: 创建 auth API**

```typescript
const API_BASE = '/api';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  return res.json();
}

export async function getMe(token: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return res.json();
}
```

- [ ] **Step 2: 创建 resumes API**

```typescript
const API_BASE = '/api';

export interface ResumeListItem {
  id: string;
  title: string;
  templateId: string;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  id: string;
  title: string;
  templateId: string;
  data: unknown;
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listResumes(token: string): Promise<{ resumes: ResumeListItem[] }> {
  const res = await fetch(`${API_BASE}/resumes`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to list resumes');
  return res.json();
}

export async function createResume(token: string, data: {
  title?: string;
  templateId?: string;
  data?: unknown;
}): Promise<{ resume: ResumeListItem }> {
  const res = await fetch(`${API_BASE}/resumes`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create resume');
  return res.json();
}

export async function updateResume(token: string, id: string, data: {
  title?: string;
  templateId?: string;
  data?: unknown;
}): Promise<{ resume: ResumeListItem }> {
  const res = await fetch(`${API_BASE}/resumes/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update resume');
  return res.json();
}

export async function deleteResume(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/resumes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete resume');
}

export async function shareResume(token: string, id: string): Promise<{ shareToken: string }> {
  const res = await fetch(`${API_BASE}/resumes/${id}/share`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to share resume');
  return res.json();
}

export async function getSharedResume(token: string): Promise<{ resume: ResumeData }> {
  const res = await fetch(`${API_BASE}/resumes/shared/${token}`);
  if (!res.ok) throw new Error('Resume not found');
  return res.json();
}
```

---

## Task 10: Auth Store

**Files:**
- Create: `frontend/src/store/authStore.ts`

- [ ] **Step 1: 创建 auth store**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(email, password);
          set({ user, token, isLoading: false });
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
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Registration failed', isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      clearError: () => {
        set({ error: null });
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

## Task 11: Header 添加登录/用户信息

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: 更新 Header**

添加用户邮箱显示和退出按钮，替换现有的静态标题

```tsx
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const { user, token, logout } = useAuthStore();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-gray-800">简历编辑器</h1>
      <div className="flex items-center gap-3">
        {token && user ? (
          <>
            <span className="text-sm text-gray-500">{user.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-red-500"
            >
              退出
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-400">未登录</span>
        )}
      </div>
    </header>
  );
}
```

---

## Task 12: EditorPage 添加保存按钮和登录提示

**Files:**
- Modify: `frontend/src/pages/EditorPage.tsx`

- [ ] **Step 1: 添加保存状态和登录检测**

在 EditorPage 中：
1. 从 authStore 获取 token
2. 添加 useEffect 检测未登录时提示
3. 添加保存按钮和保存状态显示
4. 保存成功后显示服务器简历 ID

需要读取当前 EditorPage.tsx 内容后具体修改

---

## Task 13: 后端验证

**Files:**
- None (testing)

- [ ] **Step 1: 启动后端**

Run: `cd backend && npm run dev`

Expected: `Server running on http://localhost:3002`

- [ ] **Step 2: 测试注册**

Run: `curl -X POST http://localhost:3002/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'`

Expected: `{"user":{"id":"...","email":"test@example.com","createdAt":"..."},"token":"eyJ..."}`

- [ ] **Step 3: 测试登录**

Run: `curl -X POST http://localhost:3002/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'`

Expected: 返回 user 和 token

- [ ] **Step 4: 测试创建简历**

Run: `curl -X POST http://localhost:3002/api/resumes -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{"title":"我的简历","templateId":"classic","data":{}}'`

Expected: `{"resume":{"id":"...","title":"我的简历",...}}`

- [ ] **Step 5: 测试分享链接**

Run: `curl -X POST http://localhost:3002/api/resumes/<id>/share -H "Authorization: Bearer <token>"`

Expected: `{"shareToken":"..."}`

- [ ] **Step 6: 测试公开访问**

Run: `curl http://localhost:3002/api/resumes/shared/<shareToken>`

Expected: 返回简历数据

---

## Task 14: 前端验证

**Files:**
- None (testing)

- [ ] **Step 1: 启动前端**

Run: `cd frontend && npm run dev`

- [ ] **Step 2: 测试注册登录**

访问 http://localhost:5173，注册/登录

- [ ] **Step 3: 测试保存**

编辑简历后点击保存按钮，检查是否保存成功

---

## 执行方式

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
