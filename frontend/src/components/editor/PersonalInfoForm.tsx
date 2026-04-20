import MonthPicker from '../common/MonthPicker';
import { useResumeStore } from '../../store/useResumeStore';

const underline = 'w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors';

export default function PersonalInfoForm({ editorStyle }: { editorStyle?: 'flat' | 'card' }) {
  const resume = useResumeStore((s) => s.resume);
  const updatePersonalInfo = useResumeStore((s) => s.updatePersonalInfo);
  if (!resume) return null;
  const info = resume.personalInfo;
  const isFlat = editorStyle === 'flat';
  const isCard = editorStyle === 'card';

  return (
    <div className="py-4">
      <div className={`flex items-center gap-2 mb-5 ${isFlat ? 'border-l-2 border-blue-500 pl-3' : ''} ${isCard ? 'bg-gray-50 rounded-lg px-3 py-2' : ''}`}>
        <span className="text-sm font-semibold text-gray-700">基本信息</span>
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-4">
          <input className={`${underline} text-base font-medium`} value={info.name} onChange={(e) => updatePersonalInfo('name', e.target.value)} placeholder="姓名" />
          <input className={underline} value={info.title} onChange={(e) => updatePersonalInfo('title', e.target.value)} placeholder="求职意向，例如：前端工程师" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input className={underline} value={info.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} placeholder="手机号" />
          <input className={underline} value={info.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} placeholder="邮箱" />
          <input className={underline} value={info.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} placeholder="城市" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <MonthPicker value={info.birthDate} onChange={(v) => updatePersonalInfo('birthDate', v)} placeholder="出生年月" />
          <input className={underline} value={info.gender} onChange={(e) => updatePersonalInfo('gender', e.target.value)} placeholder="性别" />
          <input className={underline} value={info.website} onChange={(e) => updatePersonalInfo('website', e.target.value)} placeholder="个人网站 / GitHub" />
        </div>
      </div>
    </div>
  );
}
