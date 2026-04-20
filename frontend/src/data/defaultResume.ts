import { v4 as uuidv4 } from 'uuid';
import type { ResumeData } from '../types/resume';

export function createDefaultResume(): ResumeData {
  return {
    id: uuidv4(),
    title: '我的简历',
    templateId: 'classic',
    personalInfo: {
      name: '',
      title: '',
      phone: '',
      email: '',
      location: '',
      website: '',
      summary: '',
      photoUrl: '',
      birthDate: '',
      gender: '',
    },
    sections: [
      { type: 'education', items: [] },
      { type: 'experience', items: [] },
      { type: 'project', items: [] },
      { type: 'skill', items: [] },
      { type: 'certification', items: [] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
