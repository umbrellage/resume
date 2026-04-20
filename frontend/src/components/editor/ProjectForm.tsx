import { useResumeStore } from '../../store/useResumeStore';
import MonthPicker from '../common/MonthPicker';
import DescriptionEditor from '../common/DescriptionEditor';
import ItemToolbar from './ItemToolbar';

interface ProjectFormProps { sectionIndex: number; itemIndex: number; }

export default function ProjectForm({ sectionIndex, itemIndex }: ProjectFormProps) {
  const resume = useResumeStore((s) => s.resume);
  const updateItem = useResumeStore((s) => s.updateItem);
  const addBulletPoint = useResumeStore((s) => s.addBulletPoint);
  const updateBulletPoint = useResumeStore((s) => s.updateBulletPoint);
  const removeBulletPoint = useResumeStore((s) => s.removeBulletPoint);
  const moveBulletPoint = useResumeStore((s) => s.moveBulletPoint);
  const duplicateBulletPoint = useResumeStore((s) => s.duplicateBulletPoint);

  const section = resume?.sections[sectionIndex];
  if (!section || !('items' in section)) return null;
  const item = section.items[itemIndex] as {
    name: string; role: string; startDate: string; endDate: string; url: string; description: string[]; technologies: string[];
  };
  if (!item) return null;

  const ul = 'w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors';

  return (
    <div className="space-y-1">
      <ItemToolbar sectionIndex={sectionIndex} itemIndex={itemIndex} totalItems={section.items.length} />
      <div className="grid grid-cols-2 gap-4">
        <input className={`${ul} font-medium`} value={item.name} onChange={(e) => updateItem(sectionIndex, itemIndex, 'name', e.target.value)} placeholder="项目名称" />
        <input className={ul} value={item.role} onChange={(e) => updateItem(sectionIndex, itemIndex, 'role', e.target.value)} placeholder="你的角色" />
      </div>
      <div>
        <input className={ul} value={item.url} onChange={(e) => updateItem(sectionIndex, itemIndex, 'url', e.target.value)} placeholder="项目链接（选填）" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MonthPicker label="开始时间" value={item.startDate} onChange={(v) => updateItem(sectionIndex, itemIndex, 'startDate', v)} />
        <MonthPicker label="结束时间" value={item.endDate} onChange={(v) => updateItem(sectionIndex, itemIndex, 'endDate', v)} showPresent />
      </div>
      <div>
        <input className={ul} value={item.technologies.join(', ')} onChange={(e) => updateItem(sectionIndex, itemIndex, 'technologies', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="技术栈，逗号分隔（React, TypeScript, Node.js）" />
      </div>
      <div className="pt-3">
        <DescriptionEditor
          descriptions={item.description || []}
          onUpdate={(bi, val) => updateBulletPoint(sectionIndex, itemIndex, bi, val)}
          onAdd={() => addBulletPoint(sectionIndex, itemIndex)}
          onRemove={(bi) => removeBulletPoint(sectionIndex, itemIndex, bi)}
          onMove={(from, to) => moveBulletPoint(sectionIndex, itemIndex, from, to)}
          onDuplicate={(bi) => duplicateBulletPoint(sectionIndex, itemIndex, bi)}
          placeholder="描述你在项目中的具体工作..."
        />
      </div>
    </div>
  );
}
