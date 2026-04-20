import type { FC } from 'react';
import type { ResumeData } from '../../../types/resume';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import InternTemplate from './InternTemplate';
import FreshGradTemplate from './FreshGradTemplate';

export interface TemplateProps {
  data: ResumeData;
  onePageScale?: number | null;
}

export const templateMap: Record<string, FC<TemplateProps>> = {
  'classic': ClassicTemplate,
  'minimal': MinimalTemplate,
  'intern': InternTemplate,
  'fresh-grad': FreshGradTemplate,
};
