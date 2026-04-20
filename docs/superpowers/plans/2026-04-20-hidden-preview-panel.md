# Hidden Preview Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 隐藏预览后，通过下拉切换在空白区域展示统计/模板/操作/大纲四个面板

**Architecture:** PreviewPanel 增加 hiddenPanel state，下拉选择面板类型，隐藏模式下渲染对应面板组件

**Tech Stack:** React + TypeScript + Zustand

---

## File Structure

- Modify: `frontend/src/components/preview/PreviewPanel.tsx` - 添加 hiddenPanel state 和下拉选择器
- Create: `frontend/src/components/preview/hidden-panels/StatsPanel.tsx` - 统计面板
- Create: `frontend/src/components/preview/hidden-panels/TemplatePanel.tsx` - 模板切换面板
- Create: `frontend/src/components/preview/hidden-panels/ActionsPanel.tsx` - 快捷操作面板
- Create: `frontend/src/components/preview/hidden-panels/OutlinePanel.tsx` - 大纲导航面板

---

### Task 1: 添加 hiddenPanel state 和下拉选择器到 PreviewPanel

**Files:**
- Modify: `frontend/src/components/preview/PreviewPanel.tsx:10-30`

- [ ] **Step 1: 添加 hiddenPanel state 类型和 state**

在 PreviewPanel.tsx 顶部添加类型定义和 state：

```typescript
type HiddenPanelType = 'stats' | 'templates' | 'actions' | 'outline';

const [hiddenPanel, setHiddenPanel] = useState<HiddenPanelType>('stats');
```

- [ ] **Step 2: 修改控制栏，添加下拉选择器**

在控制栏的隐藏按钮旁边添加下拉选择器（隐藏按钮之后）：

```tsx
<select
  value={hiddenPanel}
  onChange={(e) => setHiddenPanel(e.target.value as HiddenPanelType)}
  className="px-2 py-1.5 text-xs border border-gray-200 rounded bg-white text-gray-600"
>
  <option value="stats">统计</option>
  <option value="templates">模板</option>
  <option value="actions">操作</option>
  <option value="outline">大纲</option>
</select>
```

注意：下拉只在隐藏模式下显示（条件渲染 `hidden` 时显示）

---

### Task 2: 创建 StatsPanel 统计面板

**Files:**
- Create: `frontend/src/components/preview/hidden-panels/StatsPanel.tsx`

- [ ] **Step 1: 创建 StatsPanel.tsx**

```tsx
import { useResumeStore } from '../../../store/useResumeStore';

export default function StatsPanel() {
  const resume = useResumeStore((s) => s.resume);
  if (!resume) return null;

  const personalInfo = resume.personalInfo;
  const totalChars = [
    personalInfo.name,
    personalInfo.title,
    personalInfo.phone,
    personalInfo.email,
    personalInfo.location,
    personalInfo.website,
  ].filter(Boolean).join('').length;

  const sectionCounts = resume.sections.map((section) => ({
    type: section.type,
    count: section.items.length,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">{totalChars}</div>
        <div className="text-sm text-gray-500 mt-1">总字数</div>
      </div>

      <div className="border-t pt-4">
        <div className="text-sm font-medium text-gray-700 mb-3">已完成区块</div>
        <div className="space-y-2">
          {sectionCounts.map((s) => (
            <div key={s.type} className="flex justify-between text-sm">
              <span className="text-gray-600">{s.type}</span>
              <span className={s.count > 0 ? 'text-green-600' : 'text-gray-400'}>
                {s.count} 条
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

---

### Task 3: 创建 TemplatePanel 模板切换面板

**Files:**
- Create: `frontend/src/components/preview/hidden-panels/TemplatePanel.tsx`

- [ ] **Step 1: 创建 TemplatePanel.tsx**

```tsx
import { useResumeStore } from '../../../store/useResumeStore';
import { templates } from '../../../data/templates';

export default function TemplatePanel() {
  const resume = useResumeStore((s) => s.resume);
  const setTemplate = useResumeStore((s) => s.setTemplate);

  if (!resume) return null;

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-gray-700 mb-4">选择模板</div>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`p-2 rounded-lg border-2 transition-all ${
              resume.templateId === t.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-medium">{t.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

---

### Task 4: 创建 ActionsPanel 快捷操作面板

**Files:**
- Create: `frontend/src/components/preview/hidden-panels/ActionsPanel.tsx`

- [ ] **Step 1: 创建 ActionsPanel.tsx**

```tsx
import { useResumeStore } from '../../../store/useResumeStore';
import { serializeResumeToHtml } from '../../../utils/htmlSerializer';
import { generatePdf } from '../../../utils/pdfClient';

export default function ActionsPanel() {
  const resume = useResumeStore((s) => s.resume);
  const onePageScale = useResumeStore((s) => s.onePageScale);

  const handleDownload = async () => {
    if (!resume) return;
    const html = serializeResumeToHtml(resume, onePageScale);
    const blob = await generatePdf(html);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.personalInfo.name || '简历'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-gray-700 mb-4">快捷操作</div>
      <div className="space-y-3">
        <button
          onClick={handleDownload}
          disabled={!resume}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          导出 PDF
        </button>
        <button
          onClick={handleCopyLink}
          className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          复制链接
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

---

### Task 5: 创建 OutlinePanel 大纲导航面板

**Files:**
- Create: `frontend/src/components/preview/hidden-panels/OutlinePanel.tsx`

- [ ] **Step 1: 创建 OutlinePanel.tsx**

```tsx
import { useResumeStore } from '../../../store/useResumeStore';

const SECTION_LABELS: Record<string, string> = {
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  certificate: '证书',
  hobby: '兴趣爱好',
  award: '获奖荣誉',
  language: '语言能力',
  intern: '实习经历',
};

export default function OutlinePanel() {
  const resume = useResumeStore((s) => s.resume);

  if (!resume) return null;

  const sections = resume.sections.map((s) => ({
    type: s.type,
    label: SECTION_LABELS[s.type] || s.type,
    count: s.items.length,
    hasContent: s.items.length > 0,
  }));

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-gray-700 mb-4">简历大纲</div>
      <div className="space-y-2">
        {sections.map((s) => (
          <div
            key={s.type}
            className={`flex items-center justify-between py-2 px-3 rounded ${
              s.hasContent ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
            }`}
          >
            <span className="text-sm">{s.label}</span>
            <span className="text-xs">{s.count} 条</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

---

### Task 6: 修改 PreviewPanel 渲染隐藏面板

**Files:**
- Modify: `frontend/src/components/preview/PreviewPanel.tsx:84-155`

- [ ] **Step 1: 导入面板组件**

```tsx
import StatsPanel from './hidden-panels/StatsPanel';
import TemplatePanel from './hidden-panels/TemplatePanel';
import ActionsPanel from './hidden-panels/ActionsPanel';
import OutlinePanel from './hidden-panels/OutlinePanel';
```

- [ ] **Step 2: 修改 contentRef div，当 hidden 为 true 时渲染面板**

在 `data-resume-content` div 内添加条件渲染：

```tsx
<div
  ref={contentRef}
  style={{
    width: `${A4_WIDTH}px`,
    minHeight: `${A4_HEIGHT}px`,
    background: '#ffffff',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
  }}
  data-resume-content
>
  {hidden ? (
    <div className="w-full h-full flex items-center justify-center">
      {hiddenPanel === 'stats' && <StatsPanel />}
      {hiddenPanel === 'templates' && <TemplatePanel />}
      {hiddenPanel === 'actions' && <ActionsPanel />}
      {hiddenPanel === 'outline' && <OutlinePanel />}
    </div>
  ) : (
    <ResumeRenderer />
  )}
</div>
```

- [ ] **Step 3: 提交**

---

### Task 7: 验证和测试

- [ ] **Step 1: 运行 TypeScript 检查**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 2: 启动开发服务器测试**

Run: `cd frontend && npm run dev`
验证：隐藏预览后，下拉选择各面板正常显示

- [ ] **Step 3: 提交所有更改**

