import { useResumeStore } from '../../store/useResumeStore';
import Input from '../common/Input';
import ItemToolbar from './ItemToolbar';

interface SkillFormProps {
  sectionIndex: number;
  itemIndex: number;
}

export default function SkillForm({ sectionIndex, itemIndex }: SkillFormProps) {
  const resume = useResumeStore((s) => s.resume);
  const updateItem = useResumeStore((s) => s.updateItem);

  const section = resume?.sections[sectionIndex];
  if (!section || !('items' in section)) return null;
  const item = section.items[itemIndex] as {
    category: string;
    skills: string;
  };
  if (!item) return null;

  return (
    <div className="space-y-3">
      <ItemToolbar sectionIndex={sectionIndex} itemIndex={itemIndex} totalItems={section.items.length} />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="技能类别"
          value={item.category}
          onChange={(e) => updateItem(sectionIndex, itemIndex, 'category', e.target.value)}
          placeholder="前端开发"
        />
        <Input
          label="技能列表（逗号分隔）"
          value={item.skills}
          onChange={(e) => updateItem(sectionIndex, itemIndex, 'skills', e.target.value)}
          placeholder="React, Vue, TypeScript"
        />
      </div>
    </div>
  );
}
