export interface ResumeData {
  id: string;
  title: string;
  templateId: string;
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  website: string;
  summary: string;
  photoUrl: string;
  birthDate: string;
  gender: string;
}

export type ResumeSection =
  | { type: 'education'; items: EducationItem[] }
  | { type: 'experience'; items: ExperienceItem[] }
  | { type: 'project'; items: ProjectItem[] }
  | { type: 'skill'; items: SkillItem[] }
  | { type: 'certification'; items: CertificationItem[] }
  | { type: 'summary'; items: SummaryItem[] }
  | { type: 'custom'; title: string; items: CustomItem[] };

export interface SummaryItem {
  id: string;
  content: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa: string;
  highlights: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  url: string;
  description: string[];
  technologies: string[];
}

export interface SkillItem {
  id: string;
  category: string;
  skills: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface TemplateInfo {
  id: string;
  name: string;
  nameZh: string;
  category: 'classic' | 'intern' | 'fresh-grad' | 'experienced';
  description: string;
}
