# 多份简历支持设计

## Overview

用户可以创建、管理多份简历，每份简历独立存储在 MySQL 数据库。支持从落地页浏览、仪表板管理、模板选择创建。

## Pages

| Page | URL | Auth | Description |
|------|-----|------|-------------|
| Landing | `/` | Public | 产品落地页 |
| Dashboard | `/dashboard` | Required | 简历列表管理 |
| Templates | `/templates` | Required | 新建简历选择模板 |
| Editor | `/editor/:id` | Required + Owner | 编辑指定简历 |

## Landing Page (`/`)

- Hero 区域：产品介绍 + CTA（登录/注册按钮）
- 功能展示区
- Footer

## Dashboard (`/dashboard`)

### Header
- Logo/标题
- 用户邮箱 + 退出按钮

### Resume Grid
- 简历卡片网格布局（每行 3-4 张）
- 每张卡片显示：
  - 简历标题
  - 模板名称
  - 最后更新时间
  - 操作按钮：编辑、分享、复制、删除

### Actions
- "新建简历" 按钮 → `/templates`
- 登出按钮

### Empty State
- 无简历时显示引导：先选择一个模板创建你的第一份简历

## Templates Page (`/templates`)

- 模板卡片网格
- 点击模板 → 创建简历 → 跳转到 `/editor/:id`

## Editor Page (`/editor/:id`)

- 编辑器布局（SplitEditor）
- Header 显示：简历标题（可编辑）+ 保存状态 + 用户邮箱 + 退出
- 保存逻辑：更新到服务器

## Resume Card Actions

| Action | Description |
|--------|-------------|
| 编辑 | 跳转到 `/editor/:id` |
| 分享 | 调用 share API，显示分享链接 |
| 复制 | 创建副本，跳转到新简历编辑器 |
| 删除 | 确认弹窗，删除后刷新列表 |

## Login Flow with Local Data

1. 用户在未登录状态下编辑简历（localStorage）
2. 用户登录
3. 登录成功后，检测 localStorage 有简历数据
4. 弹窗提示："发现本地简历，是否导入到云端？"
5. 确认后：创建新简历记录，数据上传，清除 localStorage
6. 取消后：localStorage 保留，用户可选择手动导入

## API Changes

### Resume APIs (already implemented)
- `GET /api/resumes` - 列表
- `POST /api/resumes` - 创建
- `PUT /api/resumes/:id` - 更新
- `DELETE /api/resumes/:id` - 删除
- `POST /api/resumes/:id/share` - 生成分享链接

### New APIs needed
- `POST /api/resumes/:id/duplicate` - 复制简历

## Frontend Routes

Add React Router:
- `/` - LandingPage
- `/dashboard` - DashboardPage
- `/templates` - TemplatesPage
- `/editor/:id` - EditorPage

## Components to Create

- `LandingPage` - 落地页
- `DashboardPage` - 简历列表页
- `TemplatesPage` - 模板选择页
- `ResumeCard` - 简历卡片组件

## Implementation Order

1. Add React Router
2. Create LandingPage
3. Create DashboardPage with resume list
4. Create TemplatesPage
5. Update EditorPage to load from server by ID
6. Add localStorage import flow on login
7. Add resume card actions (edit, share, duplicate, delete)
