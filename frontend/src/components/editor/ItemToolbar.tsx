import { useResumeStore } from '../../store/useResumeStore';

interface ItemToolbarProps {
  sectionIndex: number;
  itemIndex: number;
  totalItems: number;
}

export default function ItemToolbar({ sectionIndex, itemIndex, totalItems }: ItemToolbarProps) {
  const moveItem = useResumeStore((s) => s.moveItem);
  const removeItem = useResumeStore((s) => s.removeItem);
  const editorStyle = useResumeStore((s) => s.editorStyle);
  const isFlat = editorStyle === 'flat';
  const isCard = editorStyle === 'card';

  const moveBtnClass = isCard
    ? 'text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-md transition-all duration-200'
    : isFlat
    ? 'text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed'
    : 'text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed';

  const deleteBtnClass = isCard
    ? 'text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-all duration-200'
    : 'text-xs text-gray-400 hover:text-red-500';

  return (
    <div className="flex justify-between mb-1">
      <div className="flex gap-1">
        <button
          onClick={() => moveItem(sectionIndex, itemIndex, itemIndex - 1)}
          disabled={itemIndex === 0}
          className={moveBtnClass}
        >
          <svg className="w-3.5 h-3.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          {!isFlat && ' 上移'}
        </button>
        <button
          onClick={() => moveItem(sectionIndex, itemIndex, itemIndex + 1)}
          disabled={itemIndex === totalItems - 1}
          className={moveBtnClass}
        >
          <svg className="w-3.5 h-3.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          {!isFlat && ' 下移'}
        </button>
      </div>
      <button onClick={() => removeItem(sectionIndex, itemIndex)} className={deleteBtnClass}>
        <svg className="w-3.5 h-3.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        {!isFlat && ' 删除此条'}
      </button>
    </div>
  );
}
