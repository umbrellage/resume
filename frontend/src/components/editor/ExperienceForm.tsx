import { useResumeStore } from '../../store/useResumeStore';
import MonthPicker from '../common/MonthPicker';
import DescriptionEditor from '../common/DescriptionEditor';
import ItemToolbar from './ItemToolbar';

interface ExperienceFormProps { sectionIndex: number; itemIndex: number; }

export default function ExperienceForm({ sectionIndex, itemIndex }: ExperienceFormProps) {
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
    company: string; position: string; startDate: string; endDate: string; location: string; description: string[];
  };
  if (!item) return null;

  const ul = 'w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors';

  return (
    <div className="space-y-1">
      <ItemToolbar sectionIndex={sectionIndex} itemIndex={itemIndex} totalItems={section.items.length} />
      <div>
        <input className={`${ul} font-medium`} value={item.company} onChange={(e) => updateItem(sectionIndex, itemIndex, 'company', e.target.value)} placeholder="公司名称" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input className={ul} value={item.position} onChange={(e) => updateItem(sectionIndex, itemIndex, 'position', e.target.value)} placeholder="职位" />
        <input className={ul} value={item.location} onChange={(e) => updateItem(sectionIndex, itemIndex, 'location', e.target.value)} placeholder="城市" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MonthPicker label="开始时间" value={item.startDate} onChange={(v) => updateItem(sectionIndex, itemIndex, 'startDate', v)} />
        <MonthPicker label="结束时间" value={item.endDate} onChange={(v) => updateItem(sectionIndex, itemIndex, 'endDate', v)} showPresent />
      </div>
      <div className="pt-3">
        <DescriptionEditor
          descriptions={item.description || []}
          onUpdate={(bi, val) => updateBulletPoint(sectionIndex, itemIndex, bi, val)}
          onAdd={() => addBulletPoint(sectionIndex, itemIndex)}
          onRemove={(bi) => removeBulletPoint(sectionIndex, itemIndex, bi)}
          onMove={(from, to) => moveBulletPoint(sectionIndex, itemIndex, from, to)}
          onDuplicate={(bi) => duplicateBulletPoint(sectionIndex, itemIndex, bi)}
          placeholder="描述你的工作内容和成果..."
        />
      </div>
    </div>
  );
}
