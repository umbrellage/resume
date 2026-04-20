import type { ResumeSection } from '../../types/resume';

export const SECTION_LABELS: Record<ResumeSection['type'], string> = {
  education: '教育经历',
  experience: '工作经历',
  project: '项目经历',
  skill: '专业技能',
  certification: '证书',
  summary: '自我评价',
  custom: '自定义板块',
};
