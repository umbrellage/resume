import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  ResumeData,
  PersonalInfo,
  ResumeSection,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillItem,
  CertificationItem,
  SummaryItem,
} from '../types/resume';
import { createDefaultResume } from '../data/defaultResume';

export type EditorStyle = 'flat' | 'card';

interface ResumeStore {
  resume: ResumeData | null;
  activeSection: string | null;
  isExporting: boolean;
  onePageScale: number | null;
  editorStyle: EditorStyle;
  setEditorStyle: (style: EditorStyle) => void;

  initResume: () => void;
  setResume: (data: ResumeData) => void;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;
  addSection: (type: ResumeSection['type'], title?: string) => void;
  removeSection: (index: number) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  addItem: (sectionIndex: number) => void;
  updateItem: (sectionIndex: number, itemIndex: number, field: string, value: string | string[]) => void;
  removeItem: (sectionIndex: number, itemIndex: number) => void;
  moveItem: (sectionIndex: number, fromIndex: number, toIndex: number) => void;
  addBulletPoint: (sectionIndex: number, itemIndex: number) => void;
  updateBulletPoint: (sectionIndex: number, itemIndex: number, bulletIndex: number, value: string) => void;
  removeBulletPoint: (sectionIndex: number, itemIndex: number, bulletIndex: number) => void;
  moveBulletPoint: (sectionIndex: number, itemIndex: number, from: number, to: number) => void;
  duplicateBulletPoint: (sectionIndex: number, itemIndex: number, bulletIndex: number) => void;
  setTemplate: (templateId: string) => void;
  setIsExporting: (v: boolean) => void;
  setActiveSection: (section: string | null) => void;
  setOnePageScale: (scale: number | null) => void;
  resetResume: () => void;
}

function createEmptyItem(sectionType: ResumeSection['type']) {
  const id = uuidv4();
  switch (sectionType) {
    case 'education':
      return { id, school: '', degree: '', major: '', startDate: '', endDate: '', gpa: '', highlights: [''] } satisfies EducationItem;
    case 'experience':
      return { id, company: '', position: '', startDate: '', endDate: '', location: '', description: [''] } satisfies ExperienceItem;
    case 'project':
      return { id, name: '', role: '', startDate: '', endDate: '', url: '', description: [''], technologies: [] } satisfies ProjectItem;
    case 'skill':
      return { id, category: '', skills: '' } satisfies SkillItem;
    case 'certification':
      return { id, name: '', issuer: '', date: '', url: '' } satisfies CertificationItem;
    case 'summary':
      return { id, content: '' } satisfies SummaryItem;
    case 'custom':
      return { id, title: '', subtitle: '', startDate: '', endDate: '', description: [''] };
    default:
      return { id };
  }
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: null,
      activeSection: null,
      isExporting: false,
      onePageScale: null,
      editorStyle: 'flat',

      initResume: () => set({ resume: createDefaultResume() }),

      setResume: (data) => set({ resume: data }),

      updatePersonalInfo: (field, value) =>
        set((state) => {
          if (!state.resume) return state;
          return {
            resume: {
              ...state.resume,
              personalInfo: { ...state.resume.personalInfo, [field]: value },
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addSection: (type, title) =>
        set((state) => {
          if (!state.resume) return state;
          const newSection = type === 'custom'
            ? { type: 'custom' as const, title: title || '自定义', items: [] }
            : { type, items: [] } as ResumeSection;
          return {
            resume: {
              ...state.resume,
              sections: [...state.resume.sections, newSection],
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeSection: (index) =>
        set((state) => {
          if (!state.resume) return state;
          return {
            resume: {
              ...state.resume,
              sections: state.resume.sections.filter((_, i) => i !== index),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      moveSection: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = [...state.resume.sections];
          const [moved] = sections.splice(fromIndex, 1);
          sections.splice(toIndex, 0, moved);
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      addItem: (sectionIndex) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = 'items' in section ? section.items : [];
            return { ...section, items: [...items, createEmptyItem(section.type)] };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      updateItem: (sectionIndex, itemIndex, field, value) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = 'items' in section ? (section.items as Record<string, unknown>[]) : [];
            const updated = items.map((item, j) =>
              j === itemIndex ? { ...item, [field]: value } : item
            );
            return { ...section, items: updated };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      removeItem: (sectionIndex, itemIndex) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = 'items' in section ? section.items : [];
            return { ...section, items: items.filter((_, j) => j !== itemIndex) };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      moveItem: (sectionIndex, fromIndex, toIndex) =>
        set((state) => {
          if (!state.resume) return state;
          if (fromIndex === toIndex) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = [...('items' in section ? section.items : [])];
            const [moved] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, moved);
            return { ...section, items };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      addBulletPoint: (sectionIndex, itemIndex) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = (section.items as Record<string, unknown>[]).map((item, j) => {
              if (j !== itemIndex) return item;
              const key = 'highlights' in item ? 'highlights' : 'description';
              const arr = (item[key] as string[]) || [];
              return { ...item, [key]: [...arr, ''] };
            });
            return { ...section, items };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      updateBulletPoint: (sectionIndex, itemIndex, bulletIndex, value) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = (section.items as Record<string, unknown>[]).map((item, j) => {
              if (j !== itemIndex) return item;
              const key = 'highlights' in item ? 'highlights' : 'description';
              const arr = (item[key] as string[]) || [];
              const updated = arr.map((b: string, k: number) => (k === bulletIndex ? value : b));
              return { ...item, [key]: updated };
            });
            return { ...section, items };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      removeBulletPoint: (sectionIndex, itemIndex, bulletIndex) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = (section.items as Record<string, unknown>[]).map((item, j) => {
              if (j !== itemIndex) return item;
              const key = 'highlights' in item ? 'highlights' : 'description';
              const arr = (item[key] as string[]) || [];
              return { ...item, [key]: arr.filter((_: string, k: number) => k !== bulletIndex) };
            });
            return { ...section, items };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      moveBulletPoint: (sectionIndex, itemIndex, from, to) =>
        set((state) => {
          if (!state.resume) return state;
          if (from === to) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = (section.items as Record<string, unknown>[]).map((item, j) => {
              if (j !== itemIndex) return item;
              const key = 'highlights' in item ? 'highlights' : 'description';
              const arr = [...((item[key] as string[]) || [])];
              const [moved] = arr.splice(from, 1);
              arr.splice(to, 0, moved);
              return { ...item, [key]: arr };
            });
            return { ...section, items };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      duplicateBulletPoint: (sectionIndex, itemIndex, bulletIndex) =>
        set((state) => {
          if (!state.resume) return state;
          const sections = state.resume.sections.map((section, i) => {
            if (i !== sectionIndex) return section;
            const items = (section.items as Record<string, unknown>[]).map((item, j) => {
              if (j !== itemIndex) return item;
              const key = 'highlights' in item ? 'highlights' : 'description';
              const arr = [...((item[key] as string[]) || [])];
              arr.splice(bulletIndex + 1, 0, arr[bulletIndex]);
              return { ...item, [key]: arr };
            });
            return { ...section, items };
          });
          return {
            resume: { ...state.resume, sections, updatedAt: new Date().toISOString() },
          };
        }),

      setTemplate: (templateId) =>
        set((state) => {
          if (!state.resume) return state;
          return {
            resume: { ...state.resume, templateId, updatedAt: new Date().toISOString() },
          };
        }),

      setIsExporting: (v) => set({ isExporting: v }),
      setEditorStyle: (style) => set({ editorStyle: style }),
      setActiveSection: (section) => set({ activeSection: section }),
      setOnePageScale: (scale) => set({ onePageScale: scale }),
      resetResume: () => set({ resume: createDefaultResume() }),
    }),
    {
      name: 'resume-data',
      partialize: (state) => ({
        resume: state.resume ? {
          ...state.resume,
          // Don't persist updatedAt to avoid constant re-renders during editing
          updatedAt: undefined
        } : null,
        editorStyle: state.editorStyle,
      }),
    }
  )
);
