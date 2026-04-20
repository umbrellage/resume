# 列表功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在简历编辑器的描述编辑器中添加圆点列表和数字列表功能

**Architecture:** 使用浏览器原生 `document.execCommand('insertUnorderedList')` 和 `document.execCommand('insertOrderedList')` API，在现有的 DescriptionEditor 组件工具栏添加两个新按钮，复用现有的 execFormat 模式。

**Tech Stack:** React 19, TypeScript, contentEditable

---

## 文件结构

**修改文件：**
- `frontend/src/components/common/DescriptionEditor.tsx` - 添加列表功能

**无需创建新文件**

---

## 任务清单

### Task 1: 添加 execListFormat 函数

**Files:**
- Modify: `frontend/src/components/common/DescriptionEditor.tsx:27-41`

- [ ] **Step 1: 添加 execListFormat 函数到 DescriptionEditor 组件**

在 `execFormat` 函数之后添加新函数：

```typescript
const execListFormat = useCallback((command: 'insertUnorderedList' | 'insertOrderedList') => {
  document.execCommand(command, false);
  // Sync state after format
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    let node = sel.anchorNode;
    while (node && !(node instanceof HTMLDivElement && node.contentEditable === 'true')) {
      node = node.parentNode;
    }
    if (node) {
      const idx = editorRefs.current.indexOf(node as HTMLDivElement);
      if (idx >= 0) onUpdate(idx, (node as HTMLDivElement).innerHTML);
    }
  }
}, [onUpdate]);
```

插入位置：第 41 行 `}, [onUpdate]);` 之后

- [ ] **Step 2: 运行开发服务器验证编译**

```bash
cd frontend && npm run dev
```

预期：无 TypeScript 编译错误

- [ ] **Step 3: 提交更改**

```bash
git add frontend/src/components/common/DescriptionEditor.tsx
git commit -m "feat: add execListFormat function for list support"
```

---

### Task 2: 添加圆点列表按钮

**Files:**
- Modify: `frontend/src/components/common/DescriptionEditor.tsx:64-89`

- [ ] **Step 1: 在工具栏添加圆点列表按钮**

在工具栏分隔线（第 90 行 `<div className="w-px h-3 bg-gray-200 mx-1" />`）之前插入按钮：

```tsx
<button
  type="button"
  onMouseDown={(e) => { e.preventDefault(); execListFormat('insertUnorderedList'); }}
  className="px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-white rounded"
  title="圆点列表"
>
  •
</button>
```

插入位置：第 89 行 `</button>` 之后，第 90 行 `<div className="w-px...` 之前

- [ ] **Step 2: 验证按钮显示**

```bash
cd frontend && npm run dev
```

在浏览器中打开编辑器，检查工具栏是否显示圆点列表按钮（•）

预期：工具栏显示新按钮，样式与其他按钮一致

- [ ] **Step 3: 测试圆点列表功能**

1. 在描述编辑器中点击圆点列表按钮
2. 输入一些文字
3. 按回车创建新列表项
4. 再次按回车退出列表

预期：可以创建和编辑圆点列表

- [ ] **Step 4: 提交更改**

```bash
git add frontend/src/components/common/DescriptionEditor.tsx
git commit -m "feat: add bullet list button to toolbar"
```

---

### Task 3: 添加数字列表按钮

**Files:**
- Modify: `frontend/src/components/common/DescriptionEditor.tsx`

- [ ] **Step 1: 在圆点列表按钮后添加数字列表按钮**

在刚添加的圆点列表按钮之后插入：

```tsx
<button
  type="button"
  onMouseDown={(e) => { e.preventDefault(); execListFormat('insertOrderedList'); }}
  className="px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-white rounded"
  title="数字列表"
>
  1.
</button>
```

插入位置：圆点列表按钮的 `</button>` 之后，分隔线 `<div className="w-px...` 之前

- [ ] **Step 2: 验证按钮显示**

刷新浏览器，检查工具栏是否同时显示圆点列表按钮和数字列表按钮

预期：两个按钮都显示，排列为 `[•] [1.]`

- [ ] **Step 3: 测试数字列表功能**

1. 在描述编辑器中点击数字列表按钮
2. 输入一些文字
3. 按回车创建新列表项（应显示 2.）
4. 再次按回车退出列表

预期：可以创建和编辑数字列表

- [ ] **Step 4: 提交更改**

```bash
git add frontend/src/components/common/DescriptionEditor.tsx
git commit -m "feat: add numbered list button to toolbar"
```

---

### Task 4: 完整功能测试

**Files:**
- Test: Manual testing in browser

- [ ] **Step 1: 测试选中文字转列表**

1. 在描述编辑器中输入多行文字
2. 选中其中几行
3. 点击圆点列表按钮

预期：选中的段落转换为列表项

- [ ] **Step 2: 测试列表切换**

1. 创建一个圆点列表
2. 选中列表项
3. 点击数字列表按钮

预期：圆点列表转换为数字列表

- [ ] **Step 3: 测试取消列表**

1. 创建一个列表
2. 选中列表项
3. 点击相同类型的列表按钮

预期：列表格式被取消，恢复为普通段落

- [ ] **Step 4: 测试格式保留**

1. 在列表项中输入文字并设置粗体
2. 转换为另一种列表类型
3. 再转换回原类型

预期：粗体格式保留

- [ ] **Step 5: 测试边界情况**

1. 空列表项按回车
2. 列表末尾连续按两次回车

预期：正确退出列表模式

- [ ] **Step 6: 跨浏览器验证**

在 Chrome、Firefox、Safari 中测试功能

预期：所有浏览器功能一致

- [ ] **Step 7: 提交最终版本**

```bash
git add frontend/src/components/common/DescriptionEditor.tsx
git commit -m "test: verify list functionality works correctly"
```

---

## 验收标准

- [ ] 工具栏显示圆点列表按钮（•）和数字列表按钮（1.）
- [ ] 点击按钮可创建对应类型的列表
- [ ] 回车可在列表中创建新项
- [ ] 连续两次回车可退出列表
- [ ] 选中文字可转换为列表
- [ ] 两种列表类型可互相切换
- [ ] 列表中保留粗体/斜体/下划线格式
- [ ] 无 TypeScript 编译错误
- [ ] 所有主流浏览器功能一致

---

## 完成后检查

- [ ] 所有任务已完成
- [ ] 所有验收标准已满足
- [ ] 代码已提交
- [ ] 功能已测试
