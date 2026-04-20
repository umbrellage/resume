import { useResumeStore } from '../../store/useResumeStore';
import MonthPicker from '../common/MonthPicker';
import AutoTextarea from '../common/AutoTextarea';
import ItemToolbar from './ItemToolbar';

interface EducationFormProps { sectionIndex: number; itemIndex: number; }

export default function EducationForm({ sectionIndex, itemIndex }: EducationFormProps) {
  const resume = useResumeStore((s) => s.resume);
  const updateItem = useResumeStore((s) => s.updateItem);
  const addBulletPoint = useResumeStore((s) => s.addBulletPoint);
  const updateBulletPoint = useResumeStore((s) => s.updateBulletPoint);
  const removeBulletPoint = useResumeStore((s) => s.removeBulletPoint);

  const section = resume?.sections[sectionIndex];
  if (!section || !('items' in section)) return null;
  const item = section.items[itemIndex] as {
    school: string; college: string; degree: string; major: string; startDate: string; endDate: string; gpa: string; highlights: string[];
  };
  if (!item) return null;

  const ul = 'w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors';

  return (
    <div className="space-y-1">
      <ItemToolbar sectionIndex={sectionIndex} itemIndex={itemIndex} totalItems={section.items.length} />
      <input className={`${ul} font-medium`} value={item.school} onChange={(e) => updateItem(sectionIndex, itemIndex, 'school', e.target.value)} placeholder="学校名称" />
      <input className={ul} value={item.college || ''} onChange={(e) => updateItem(sectionIndex, itemIndex, 'college', e.target.value)} placeholder="学院（选填）" />
      <div className="grid grid-cols-3 gap-4">
        <select className={ul} value={item.degree} onChange={(e) => updateItem(sectionIndex, itemIndex, 'degree', e.target.value)}>
          <option value="">学历</option>
          <option value="大专">大专</option>
          <option value="本科">本科</option>
          <option value="硕士">硕士</option>
          <option value="博士">博士</option>
        </select>
        <input className={ul} value={item.major} onChange={(e) => updateItem(sectionIndex, itemIndex, 'major', e.target.value)} placeholder="专业" />
        <input className={ul} value={item.gpa} onChange={(e) => updateItem(sectionIndex, itemIndex, 'gpa', e.target.value)} placeholder="GPA（选填）" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MonthPicker label="开始时间" value={item.startDate} onChange={(v) => updateItem(sectionIndex, itemIndex, 'startDate', v)} />
        <MonthPicker label="结束时间" value={item.endDate} onChange={(v) => updateItem(sectionIndex, itemIndex, 'endDate', v)} showPresent />
      </div>
      {(item.highlights || []).length > 0 && (
        <div className="space-y-2 pt-2">
          {item.highlights.map((h, bi) => (
            <div key={bi} className="flex gap-2 items-end">
              <AutoTextarea value={h} onChange={(e) => updateBulletPoint(sectionIndex, itemIndex, bi, e.target.value)} placeholder="荣誉/亮点..." minRows={1} />
              <button onClick={() => removeBulletPoint(sectionIndex, itemIndex, bi)} className="text-gray-300 hover:text-red-500 text-xs pb-2">✕</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => addBulletPoint(sectionIndex, itemIndex)} className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-1">+ 添加亮点</button>
    </div>
  );
}
