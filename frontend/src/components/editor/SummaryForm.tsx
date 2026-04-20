import { useResumeStore } from '../../store/useResumeStore';
import AutoTextarea from '../common/AutoTextarea';

interface SummaryFormProps { sectionIndex: number; itemIndex: number; }

export default function SummaryForm({ sectionIndex, itemIndex }: SummaryFormProps) {
  const resume = useResumeStore((s) => s.resume);
  const updateItem = useResumeStore((s) => s.updateItem);
  const removeItem = useResumeStore((s) => s.removeItem);

  const section = resume?.sections[sectionIndex];
  if (!section || !('items' in section)) return null;
  const item = section.items[itemIndex] as { id: string; content: string };
  if (!item) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-end mb-1">
        <button onClick={() => removeItem(sectionIndex, itemIndex)} className="text-xs text-gray-400 hover:text-red-500">删除此条</button>
      </div>
      <AutoTextarea
        value={item.content}
        onChange={(e) => updateItem(sectionIndex, itemIndex, 'content', e.target.value)}
        placeholder="写一段自我评价，突出你的优势和价值..."
        minRows={3}
      />
    </div>
  );
}
