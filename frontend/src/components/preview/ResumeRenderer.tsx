import { useResumeStore } from '../../store/useResumeStore';
import { templateMap } from './templates';

export default function ResumeRenderer() {
  const resume = useResumeStore((s) => s.resume);
  const onePageScale = useResumeStore((s) => s.onePageScale);

  if (!resume) return null;

  const TemplateComponent = templateMap[resume.templateId] || templateMap['classic'];

  return <TemplateComponent data={resume} onePageScale={onePageScale} />;
}
