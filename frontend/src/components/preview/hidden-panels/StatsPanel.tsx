import { useResumeStore } from '../../../store/useResumeStore';
import { SECTION_LABELS } from './sectionLabels';

function countSectionChars(section: { items: any[] }): number {
  return section.items.reduce((sum, item) => {
    return sum + Object.values(item).filter(v => typeof v === 'string').join('').length;
  }, 0);
}

export default function StatsPanel() {
  const resume = useResumeStore((s) => s.resume);
  if (!resume) return null;

  const personalInfo = resume.personalInfo;
  const personalChars = [
    personalInfo.name,
    personalInfo.title,
    personalInfo.phone,
    personalInfo.email,
    personalInfo.location,
    personalInfo.website,
    personalInfo.summary,
  ].filter(Boolean).join('').length;

  const sectionStats = resume.sections.map((section) => ({
    type: section.type,
    label: SECTION_LABELS[section.type] || section.type,
    count: section.items.length,
    chars: countSectionChars(section),
  }));

  const totalChars = personalChars + sectionStats.reduce((sum, s) => sum + s.chars, 0);
  const completedSections = sectionStats.filter((s) => s.count > 0).length;
  const totalItems = sectionStats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center py-6 px-4">
        <div className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-3 shadow-lg shadow-blue-500/20">
          <span className="text-2xl font-bold text-white">{totalChars}</span>
        </div>
        <p className="text-gray-500 text-xs">总字数</p>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-auto">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
            <div className="text-xl font-bold text-blue-600">{completedSections}</div>
            <div className="text-xs text-gray-500">完成区块</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center border border-green-100">
            <div className="text-xl font-bold text-green-600">{totalItems}</div>
            <div className="text-xs text-gray-500">填写条数</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-100">
            <div className="text-xl font-bold text-purple-600">{personalChars}</div>
            <div className="text-xs text-gray-500">基本信息</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-xl border border-gray-100 p-3">
          <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">各区块详情</div>
          <div className="space-y-1">
            {sectionStats.map((s) => (
              <div key={s.type} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-600">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{s.chars}字</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.count > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {s.count}条
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
