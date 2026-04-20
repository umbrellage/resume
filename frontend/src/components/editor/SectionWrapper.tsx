import { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import type { ResumeSection } from '../../types/resume';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import ProjectForm from './ProjectForm';
import SkillForm from './SkillForm';
import CertificationForm from './CertificationForm';
import SummaryForm from './SummaryForm';
import MonthPicker from '../common/MonthPicker';
import AutoTextarea from '../common/AutoTextarea';

const sectionTypeLabels: Record<string, string> = {
  education: '教育经历', experience: '工作经验', project: '项目经历',
  skill: '专业技能', certification: '证书认证', summary: '自我评价', custom: '自定义板块',
};

const sectionIcons: Record<string, string> = {
  education: '🎓', experience: '💼', project: '🚀',
  skill: '⚡', certification: '🏅', summary: '✨', custom: '📝',
};

interface SectionWrapperProps {
  sectionIndex: number;
  section: ResumeSection;
  title: string;
  editorStyle?: 'flat' | 'card';
}

export default function SectionWrapper({ sectionIndex, section, title, editorStyle: _editorStyle }: SectionWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
  const addItem = useResumeStore((s) => s.addItem);
  const removeSection = useResumeStore((s) => s.removeSection);
  const moveSection = useResumeStore((s) => s.moveSection);
  const resume = useResumeStore((s) => s.resume);
  const editorStyle = useResumeStore((s) => s.editorStyle);

  const totalSections = resume?.sections.length ?? 0;
  const items = 'items' in section ? section.items : [];
  const isFlat = editorStyle === 'flat';
  const isCard = editorStyle === 'card';

  return (
    <div className="py-2">
      <div className={`flex items-center justify-between mb-4 ${isCard ? 'bg-gray-50 rounded-lg px-3 py-2' : ''}`}>
        <button onClick={() => setCollapsed(!collapsed)} className={`flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 ${isFlat ? 'border-l-2 border-blue-500 pl-3' : ''}`}>
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {title}
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => moveSection(sectionIndex, sectionIndex - 1)} disabled={sectionIndex === 0} className={isCard ? 'p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 rounded-lg transition-all duration-200' : 'p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 rounded'}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={() => moveSection(sectionIndex, sectionIndex + 1)} disabled={sectionIndex === totalSections - 1} className={isCard ? 'p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 rounded-lg transition-all duration-200' : 'p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 rounded'}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={() => removeSection(sectionIndex)} className={isCard ? 'p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg ml-1 transition-all duration-200' : 'p-1 text-gray-300 hover:text-red-500 rounded ml-1'}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4">
          {items.map((item, itemIndex) => {
            const formContent = (
              <>
                {section.type === 'education' && <EducationForm sectionIndex={sectionIndex} itemIndex={itemIndex} />}
                {section.type === 'experience' && <ExperienceForm sectionIndex={sectionIndex} itemIndex={itemIndex} />}
                {section.type === 'project' && <ProjectForm sectionIndex={sectionIndex} itemIndex={itemIndex} />}
                {section.type === 'skill' && <SkillForm sectionIndex={sectionIndex} itemIndex={itemIndex} />}
                {section.type === 'certification' && <CertificationForm sectionIndex={sectionIndex} itemIndex={itemIndex} />}
                {section.type === 'summary' && <SummaryForm sectionIndex={sectionIndex} itemIndex={itemIndex} />}
                {section.type === 'custom' && <CustomForm sectionIndex={sectionIndex} itemIndex={itemIndex} />}
              </>
            );

            return (
              <div key={item.id} className={isFlat ? 'border-b border-gray-100 pb-4' : isCard ? 'bg-gray-50 rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200' : 'bg-white rounded-xl border border-gray-100 shadow-sm p-5'}>
                {formContent}
              </div>
            );
          })}
          <button
            onClick={() => addItem(sectionIndex)}
            className={isFlat
              ? 'text-sm text-blue-500 hover:text-blue-700 transition-colors font-medium'
              : isCard
              ? 'w-full py-3 text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-all duration-200 font-medium'
              : 'w-full py-3 text-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium'
            }
          >
            + 添加一段{title}
          </button>
        </div>
      )}
    </div>
  );
}

const ul = 'w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors';

function CustomForm({ sectionIndex, itemIndex }: { sectionIndex: number; itemIndex: number }) {
  const removeItem = useResumeStore((s) => s.removeItem);
  const updateItem = useResumeStore((s) => s.updateItem);
  const resume = useResumeStore((s) => s.resume);

  const section = resume?.sections[sectionIndex];
  if (!section || !('items' in section)) return null;
  const item = section.items[itemIndex] as Record<string, unknown>;
  if (!item) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-end mb-2">
        <button onClick={() => removeItem(sectionIndex, itemIndex)} className="text-xs text-gray-400 hover:text-red-500">删除</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input className={ul} value={(item.title as string) || ''} onChange={(e) => updateItem(sectionIndex, itemIndex, 'title', e.target.value)} placeholder="标题" />
        <input className={ul} value={(item.subtitle as string) || ''} onChange={(e) => updateItem(sectionIndex, itemIndex, 'subtitle', e.target.value)} placeholder="副标题" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MonthPicker label="开始时间" value={(item.startDate as string) || ''} onChange={(v) => updateItem(sectionIndex, itemIndex, 'startDate', v)} />
        <MonthPicker label="结束时间" value={(item.endDate as string) || ''} onChange={(v) => updateItem(sectionIndex, itemIndex, 'endDate', v)} showPresent />
      </div>
    </div>
  );
}
