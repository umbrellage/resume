import { useCallback, useRef } from 'react';
import RichTextEditor from './RichTextEditor';
import { useResumeStore } from '../../store/useResumeStore';

interface DescriptionEditorProps {
  descriptions: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  placeholder?: string;
}

const STAR_TEMPLATE = '<b>[情境]</b> <br><b>[任务]</b> <br><b>[行动]</b> <br><b>[结果]</b> ';

export default function DescriptionEditor({
  descriptions,
  onUpdate,
  onAdd,
  onRemove,
  onMove,
  onDuplicate,
  placeholder,
}: DescriptionEditorProps) {
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editorStyle = useResumeStore((s) => s.editorStyle);
  const isCard = editorStyle === 'card';

  const restoreSelectionAndExec = useCallback((editorIndex: number, command: string) => {
    const editor = editorRefs.current[editorIndex];
    if (!editor) return;

    document.execCommand(command, false);
    onUpdate(editorIndex, editor.innerHTML);
  }, [onUpdate]);

  // Style variants based on editorStyle
  const containerClass = isCard
    ? 'group relative border border-gray-100 rounded-xl focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-50 transition-all'
    : 'group relative border border-transparent focus-within:border-gray-200 focus-within:rounded-lg transition-all';

  const toolbarClass = isCard
    ? 'flex items-center gap-1 px-2.5 py-1.5 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 rounded-t-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'
    : 'flex items-center gap-1 px-2.5 py-1.5 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 rounded-t-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity';

  const formatBtnClass = isCard
    ? 'px-2 py-1 text-xs text-gray-400 hover:text-gray-800 hover:bg-white rounded-md transition-all duration-200'
    : 'px-2 py-1 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-all duration-200';

  const actionBtnClass = 'px-1.5 py-1 text-gray-400 hover:text-gray-600 rounded transition-all duration-200';
  const deleteBtnClass = 'px-1.5 py-1 text-gray-400 hover:text-red-500 rounded transition-all duration-200';

  const addBtnClass = isCard
    ? 'text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md font-medium transition-all duration-200'
    : 'text-xs text-blue-500 hover:text-blue-600 font-medium';

  const starBtnClass = isCard
    ? 'text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md font-medium transition-all duration-200'
    : 'text-xs text-blue-500 hover:text-blue-600 font-medium';

  return (
    <div className="space-y-3">
      {descriptions.map((desc, i) => (
        <div key={i} className={containerClass}>
          {/* Mini toolbar */}
          <div className={toolbarClass}>
            {/* Format buttons */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); restoreSelectionAndExec(i, 'bold'); }}
              className={`${formatBtnClass} font-bold`}
              title="加粗"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); restoreSelectionAndExec(i, 'italic'); }}
              className={`${formatBtnClass} italic`}
              title="斜体"
            >
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); restoreSelectionAndExec(i, 'underline'); }}
              className={`${formatBtnClass} underline`}
              title="下划线"
            >
              U
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); restoreSelectionAndExec(i, 'insertUnorderedList'); }}
              className={formatBtnClass}
              title="圆点列表"
            >
              &bull;
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); restoreSelectionAndExec(i, 'insertOrderedList'); }}
              className={formatBtnClass}
              title="数字列表"
            >
              1.
            </button>

            <div className="w-px h-3.5 bg-gray-200 mx-1" />

            {/* Action buttons */}
            <button
              type="button"
              onClick={() => i > 0 && onMove(i, i - 1)}
              disabled={i === 0}
              className={`${actionBtnClass} disabled:opacity-30`}
              title="上移"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
            <button
              type="button"
              onClick={() => i < descriptions.length - 1 && onMove(i, i + 1)}
              disabled={i === descriptions.length - 1}
              className={`${actionBtnClass} disabled:opacity-30`}
              title="下移"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(i)}
              className={actionBtnClass}
              title="复制"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>

            <div className="flex-1" />

            <button
              type="button"
              onClick={() => onRemove(i)}
              className={deleteBtnClass}
              title="删除"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <RichTextEditor
            ref={(el) => { editorRefs.current[i] = el; }}
            value={desc}
            onChange={(html) => onUpdate(i, html)}
            placeholder={placeholder}
            minRows={3}
          />
        </div>
      ))}

      <div className="flex items-center gap-2">
        <button onClick={onAdd} className={addBtnClass}>+ 添加描述</button>
        <button
          onClick={() => {
            onAdd();
            setTimeout(() => onUpdate(descriptions.length, STAR_TEMPLATE), 0);
          }}
          className={starBtnClass}
        >
          + STAR模板
        </button>
      </div>
    </div>
  );
}
