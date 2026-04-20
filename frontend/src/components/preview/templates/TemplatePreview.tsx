import type { FC } from 'react';
import type { ResumeData } from '../../../types/resume';
import type { TemplateProps } from './index';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import InternTemplate from './InternTemplate';
import FreshGradTemplate from './FreshGradTemplate';

const templateComponents: Record<string, FC<TemplateProps>> = {
  'classic': ClassicTemplate,
  'minimal': MinimalTemplate,
  'intern': InternTemplate,
  'fresh-grad': FreshGradTemplate,
};

interface TemplatePreviewProps {
  templateId: string;
}

export default function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const TemplateComponent = templateComponents[templateId];
  if (!TemplateComponent) return null;

  const previewData: ResumeData = {
    id: 'preview',
    title: '简历预览',
    templateId,
    personalInfo: {
      name: '张三',
      title: '前端工程师',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      location: '北京',
      website: '',
      summary: '有多年前端开发经验',
      photoUrl: '',
      age: '28',
      gender: '男',
    },
    sections: [
      { type: 'experience', items: [
        { id: '1', company: '某科技有限公司', position: '高级前端工程师', startDate: '2020-01', endDate: '至今', location: '北京', description: ['负责前端架构设计', '主导技术选型'] }
      ]},
      { type: 'education', items: [
        { id: '2', school: '清华大学', degree: '硕士', major: '计算机科学', startDate: '2016-09', endDate: '2019-06', gpa: '3.8', highlights: [] }
      ]},
      { type: 'project', items: [
        { id: '3', name: '企业级中台系统', role: '技术负责人', startDate: '2021-03', endDate: '2022-06', url: '', description: ['React + TypeScript'], technologies: ['React', 'TypeScript'] }
      ]},
      { type: 'skill', items: [
        { id: '4', category: '前端技术', skills: 'React, Vue, TypeScript, Node.js' }
      ]},
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center bg-gray-100 p-2">
      <div
        className="bg-white shadow-lg"
        style={{
          width: '794px',
          minHeight: '1123px',
          transform: 'scale(0.5)',
          transformOrigin: 'center center',
        }}
      >
        <TemplateComponent data={previewData} />
      </div>
    </div>
  );
}
