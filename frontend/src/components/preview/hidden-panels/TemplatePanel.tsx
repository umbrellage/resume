import { useResumeStore } from '../../../store/useResumeStore';
import { templates } from '../../../data/templates';

export default function TemplatePanel() {
  const resume = useResumeStore((s) => s.resume);
  const setTemplate = useResumeStore((s) => s.setTemplate);

  if (!resume) return null;

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-gray-700 mb-4">选择模板</div>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`p-2 rounded-lg border-2 transition-all ${
              resume.templateId === t.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs font-medium">{t.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}