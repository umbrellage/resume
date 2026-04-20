import type { TemplateInfo } from '../types/resume';

export const templates: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    nameZh: '经典专业',
    category: 'classic',
    description: '标准专业简历模板，适合所有岗位，HR 友好设计',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameZh: '极简风格',
    category: 'classic',
    description: '极简设计，更多留白，突出内容本身',
  },
  {
    id: 'intern',
    name: 'Intern',
    nameZh: '实习生专用',
    category: 'intern',
    description: '双栏布局，突出项目和技能，适合实习生投递',
  },
  {
    id: 'fresh-grad',
    name: 'Fresh Grad',
    nameZh: '应届生专用',
    category: 'fresh-grad',
    description: '教育经历优先展示，适合应届生校招',
  },
];
