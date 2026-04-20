# 轻松简历

免费在线简历制作平台，支持多模板、实时预览、PDF 导出、云端管理。

## 功能特性

- **多模板支持** — 经典专业、极简风格、实习生专用、应届生专用
- **实时预览** — 左右分栏编辑，所见即所得
- **PDF 导出** — 基于 Puppeteer 的高保真 PDF 生成，支持智能一页适配
- **富文本编辑** — 描述支持加粗、斜体、列表等格式，内置 STAR 法则模板
- **双编辑风格** — 扁平极简 / 精致卡片，一键切换
- **云端管理** — 多份简历管理，自动保存，一键分享
- **回收站** — 删除简历可恢复，保留 30 天

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite + TypeScript + Tailwind CSS 4 + Zustand |
| 后端 | Express + TypeScript + Prisma + MySQL |
| PDF | Puppeteer（服务端渲染） |
| 认证 | JWT |

## 项目结构

```
resume/
├── frontend/                # 前端项目
│   └── src/
│       ├── pages/           # 页面（Landing, Dashboard, Templates, Editor）
│       ├── components/
│       │   ├── layout/      # Header, SplitEditor, EditorPanel
│       │   ├── editor/      # 表单组件（Education, Experience, Project...）
│       │   ├── preview/     # 模板渲染（Classic, Minimal, Intern, FreshGrad）
│       │   └── common/      # 通用组件（Modal, Input, MonthPicker...）
│       ├── store/           # Zustand 状态管理
│       ├── api/             # API 封装
│       ├── types/           # TypeScript 类型定义
│       ├── data/            # 默认数据、模板注册
│       └── utils/           # 工具函数（HTML 序列化、PDF 客户端）
├── backend/                 # 后端项目
│   ├── prisma/              # Prisma Schema
│   └── src/
│       ├── routes/          # API 路由（auth, resumes, pdf, email）
│       ├── services/        # 服务层（PDF 生成、数据库）
│       └── middleware/       # 认证中间件
```

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+

### 1. 安装依赖

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. 配置数据库

```bash
cd backend
cp prisma/.env.example prisma/.env
# 编辑 prisma/.env，设置 DATABASE_URL
npx prisma db push
```

### 3. 启动开发服务器

```bash
# 前端（端口 5174）
cd frontend && npm run dev

# 后端（端口 3002）
cd backend && npm run dev
```

访问 http://localhost:5174

### 4. 生产构建

```bash
cd frontend && npm run build
cd backend && npm run build
```

## 编辑器双风格

编辑器支持两种 UI 风格，顶栏一键切换：

| 风格 | 特点 |
|------|------|
| 扁平极简 | 白色背景、下划线输入、蓝色竖条标题、大留白 |
| 精致卡片 | 浅灰背景、白色圆角卡片、hover 微浮、精致阴影 |

## PDF 生成流程

前端通过 `renderToStaticMarkup` 将 React 模板序列化为 HTML → 发送至后端 `/api/pdf/generate` → Puppeteer 渲染为 PDF。

模板使用内联样式（非 Tailwind），确保序列化后样式完整保留。

## License

MIT
