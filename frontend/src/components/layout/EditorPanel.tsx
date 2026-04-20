import { useState } from 'react';
import { useResumeStore, type EditorStyle } from '../../store/useResumeStore';
import type { ResumeSection } from '../../types/resume';
import PersonalInfoForm from '../editor/PersonalInfoForm';
import SectionWrapper from '../editor/SectionWrapper';

const availableAddTypes: { type: ResumeSection['type']; label: string }[] = [
  { type: 'education', label: '教育经历' },
  { type: 'experience', label: '工作经验' },
  { type: 'project', label: '项目经历' },
  { type: 'skill', label: '专业技能' },
  { type: 'certification', label: '证书认证' },
  { type: 'summary', label: '自我评价' },
  { type: 'custom', label: '自定义板块' },
];

const sectionTypeLabels: Record<string, string> = {
  education: '教育经历', experience: '工作经验', project: '项目经历',
  skill: '专业技能', certification: '证书认证', summary: '自我评价', custom: '自定义板块',
};

export default function EditorPanel({ editorStyle }: { editorStyle: EditorStyle }) {
  const resume = useResumeStore((s) => s.resume);
  const addSection = useResumeStore((s) => s.addSection);
  const [showAddMenu, setShowAddMenu] = useState(false);
  if (!resume) return null;

  const isCard = editorStyle === 'card';

  return (
    <div className={isCard ? 'space-y-4 px-6 py-4' : 'divide-y divide-gray-100'}>
      <div className={isCard ? 'bg-white rounded-xl border border-gray-200 shadow-sm p-5' : 'px-8'} data-editor-section="personal">
        <PersonalInfoForm editorStyle={editorStyle} />
      </div>

      {resume.sections.map((section, index) => (
        <div
          key={`${section.type}-${index}`}
          className={isCard ? 'bg-white rounded-xl border border-gray-200 shadow-sm p-5' : 'px-8'}
          data-editor-section={`${section.type}-${index}`}
        >
          <SectionWrapper
            sectionIndex={index}
            section={section}
            title={section.type === 'custom' ? (section as { title: string }).title : sectionTypeLabels[section.type] || section.type}
            editorStyle={editorStyle}
          />
        </div>
      ))}

      <div className={isCard ? 'py-2' : 'px-8 py-6'}>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={isCard
              ? 'w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-200'
              : 'w-full py-3 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors'}
          >
            + 添加板块
          </button>
          {showAddMenu && (
            <div className={isCard
              ? 'absolute left-0 right-0 bottom-full mb-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-10 py-2'
              : 'absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl border border-gray-200 shadow-xl z-10 py-2'}>
              {availableAddTypes.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => { addSection(type); setShowAddMenu(false); }}
                  className={isCard
                    ? 'w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-colors'
                    : 'w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors'}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
