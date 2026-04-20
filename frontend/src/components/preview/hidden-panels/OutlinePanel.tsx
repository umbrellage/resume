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