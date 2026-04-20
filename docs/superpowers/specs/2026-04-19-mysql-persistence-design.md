# MySQL 持久化 + 用户系统设计

## Overview

为简历平台添加后端持久化存储和简单用户系统。用户可注册登录，将简历保存到 MySQL 数据库，并生成公开分享链接。

## Tech Stack

- **Runtime**: Node.js + Express
- **ORM**: Prisma
- **Database**: MySQL (127.0.0.1:3306, root)
- **Auth**: JWT + bcrypt

## Database Schema

```prisma
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
}
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | 注册 (email, password) |
| POST | /api/auth/login | 登录 (email, password) → JWT |
| GET | /api/auth/me | 获取当前用户信息 |

### Resumes
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/resumes | 获取用户简历列表 |
| POST | /api/resumes | 创建简历 |
| PUT | /api/resumes/:id | 更新简历 |
| DELETE | /api/resumes/:id | 删除简历 |
| POST | /api/resumes/:id/share | 生成/刷新分享链接 |
| GET | /api/shared/:token | 公开访问简历（无需登录）|

## Frontend Changes

### Zustand Store
- 新增 `user` 和 `token` 状态
- `token` 持久化到 localStorage
- API 请求自动携带 `Authorization: Bearer <token>`

### Editor Page
- 保存按钮：POST /api/resumes 或 PUT /api/resumes/:id
- 显示保存状态（保存中/已保存/保存失败）
- 初始加载：优先从 localStorage 读取，登录用户可选择从服务器加载

### Data Migration
- 现有 localStorage 数据保持不变
- 新保存的简历会同时写入服务器
- 用户登录后可选择导入本地简历到服务器

## Implementation Order

1. 设置 Prisma + MySQL 连接
2. 实现 User model + auth APIs
3. 实现 Resume CRUD APIs
4. 实现分享链接功能
5. 前端集成（登录/注册/保存）
