import { useState } from 'react';
import MonthPicker from '../common/MonthPicker';
import { useResumeStore } from '../../store/useResumeStore';

const inputStyle = 'w-full border-0 border-b border-gray-200 px-0 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors';

export default function PersonalInfoForm({ editorStyle }: { editorStyle?: 'flat' | 'card' }) {
  const resume = useResumeStore((s) => s.resume);
  const updatePersonalInfo = useResumeStore((s) => s.updatePersonalInfo);
  if (!resume) return null;
  const info = resume.personalInfo;
  const isCard = editorStyle === 'card';
  const [genderOpen, setGenderOpen] = useState(false);

  const genderOptions = [
    { value: '男', label: '男', icon: '♂' },
    { value: '女', label: '女', icon: '♀' },
  ];

  return (
    <div className={`py-4 ${isCard ? 'px-1' : ''}`}>
      <div className={`flex items-center gap-2 mb-5 ${isCard ? 'bg-gray-50 rounded-xl px-4 py-3' : 'border-l-2 border-blue-500 pl-3'}`}>
        <span className="text-sm font-semibold text-gray-700">基本信息</span>
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-4">
          <input className={`${inputStyle} text-base font-medium`} value={info.name} onChange={(e) => updatePersonalInfo('name', e.target.value)} placeholder="姓名" />
          <input className={inputStyle} value={info.title} onChange={(e) => updatePersonalInfo('title', e.target.value)} placeholder="求职意向" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input className={inputStyle} value={info.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} placeholder="手机号" />
          <input className={inputStyle} value={info.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} placeholder="邮箱" />
          <input className={inputStyle} value={info.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} placeholder="城市" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <MonthPicker value={info.birthDate} onChange={(v) => updatePersonalInfo('birthDate', v)} placeholder="出生年月" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setGenderOpen(!genderOpen)}
              className="w-full flex items-center justify-between py-2.5 px-0 border-b-2 border-gray-200 text-sm text-gray-800 hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <span className={info.gender ? 'text-gray-800' : 'text-gray-400'}>
                {info.gender || '性别'}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {genderOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setGenderOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1.5 overflow-hidden">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { updatePersonalInfo('gender', opt.value); setGenderOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                        info.gender === opt.value
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <input className={inputStyle} value={info.website} onChange={(e) => updatePersonalInfo('website', e.target.value)} placeholder="个人网站" />
        </div>
      </div>
    </div>
  );
}
