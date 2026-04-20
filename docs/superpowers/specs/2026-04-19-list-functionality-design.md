# 列表功能设计文档

**日期：** 2026-04-19
**状态：** 设计中

## 概述

在简历编辑器的描述编辑器中添加圆点列表和数字列表功能，允许用户在每个描述项内插入和管理列表。

## 需求

### 功能需求
1. 支持圆点列表（无序列表 `<ul>`）
2. 支持数字列表（有序列表 `<ol>`）
3. 仅单层列表，不支持嵌套
4. 通过工具栏按钮触发
5. 支持选中文字转换为列表
6. 支持多行列表编辑

### 非功能需求
- 使用浏览器原生 `execCommand` 实现
- 保持与现有代码风格一致
- 不引入新依赖

## 设计

### 架构变更

**修改文件：**
- `frontend/src/components/common/DescriptionEditor.tsx`

**变更类型：** 功能增强

**数据模型：** 无需修改

### 组件变更

**DescriptionEditor.tsx 工具栏：**

添加两个新按钮：
- 圆点列表按钮：`<ul>` 图标，标题"圆点列表"
- 数字列表按钮：`1.` 图标，标题"数字列表"

工具栏布局：
```
[B] [I] [U] | [•] [1.] | [↑] [↓] [复制] [删除]
```

### 实现细节

**execListFormat 函数：**
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

**按钮实现：**
```tsx
<button
  type="button"
  onMouseDown={(e) => { e.preventDefault(); execListFormat('insertUnorderedList'); }}
  className="px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-white rounded"
  title="圆点列表"
>
  •
</button>
<button
  type="button"
  onMouseDown={(e) => { e.preventDefault(); execListFormat('insertOrderedList'); }}
  className="px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-white rounded"
  title="数字列表"
>
  1.
</button>
```

### 行为规范

**列表按钮行为：**
1. 无选区时：在光标位置插入空列表项
2. 有选区时：将选中段落转为列表项
3. 已在同类型列表中：取消列表格式
4. 在不同类型列表中：切换列表类型

**回车行为：**
1. 列表项末尾按回车：创建新的同类型列表项
2. 空列表项按回车：退出列表模式

**选区行为：**
1. 跨段落选区：所有选中段落转为列表项
2. 保留现有格式：粗体/斜体/下划线等格式保留

### 样式

**列表样式：**
- 使用浏览器默认样式
- 继承当前字体大小和颜色
- 左缩进由浏览器自动处理

**按钮样式：**
- 与现有 B/I/U 按钮一致
- 悬停时背景变白
- 当前在列表中时可高亮显示（可选）

### 错误处理

| 场景 | 处理方式 |
|------|----------|
| 空列表项 | 连续两次回车自动退出列表 |
| 跨段落选区 | 所有段落转为列表项 |
| 已有格式 | 保留粗体/斜体等格式 |
| 切换类型 | 圆点↔数字直接切换 |
| 撤销/重做 | 浏览器原生支持 |

## 测试要点

1. 创建圆点列表
2. 创建数字列表
3. 选中文字转列表
4. 列表项之间回车新建
5. 空列表项回车退出
6. 圆点列表与数字列表切换
7. 列表中保留粗体/斜体格式
8. 跨段落选区转列表
9. 取消列表格式
10. 撤销/重操作

## 实施顺序

1. 在 DescriptionEditor.tsx 添加 execListFormat 函数
2. 在工具栏添加圆点列表按钮
3. 在工具栏添加数字列表按钮
4. 手动测试所有场景
