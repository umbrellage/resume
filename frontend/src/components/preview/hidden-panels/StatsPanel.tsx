import { useResumeStore } from '../../../store/useResumeStore';

export default function StatsPanel() {
  const resume = useResumeStore((s) => s.resume);
  if (!resume) return null;

  const personalInfo = resume.personalInfo;
  const totalChars = [
    personalInfo.name,
    personalInfo.title,
    personalInfo.phone,
    personalInfo.email,
    personalInfo.location,
    personalInfo.website,
  ].filter(Boolean).join('').length;

  const sectionCounts = resume.sections.map((section) => ({
    type: section.type,
    count: section.items.length,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">{totalChars}</div>
        <div className="text-sm text-gray-500 mt-1">总字数</div>
      </div>

      <div className="border-t pt-4">
        <div className="text-sm font-medium text-gray-700 mb-3">已完成区块</div>
        <div className="space-y-2">
          {sectionCounts.map((s) => (
            <div key={s.type} className="flex justify-between text-sm">
              <span className="text-gray-600">{s.type}</span>
              <span className={s.count > 0 ? 'text-green-600' : 'text-gray-400'}>
                {s.count} 条
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}