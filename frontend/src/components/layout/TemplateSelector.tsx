import { useResumeStore } from '../../store/useResumeStore';
import { templates } from '../../data/templates';

export default function TemplateSelector() {
  const resume = useResumeStore((s) => s.resume);
  const setTemplate = useResumeStore((s) => s.setTemplate);

  if (!resume) return null;

  return (
    <div className="flex items-center gap-1">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => setTemplate(t.id)}
          title={t.name}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            resume.templateId === t.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            {t.id === 'classic' && (
              <>
                <rect x="2" y="2" width="5" height="7" rx="0.5" />
                <rect x="9" y="2" width="5" height="7" rx="0.5" opacity="0.6" />
                <rect x="4" y="11" width="4" height="3" rx="0.5" opacity="0.4" />
              </>
            )}
            {t.id === 'minimal' && (
              <>
                <line x1="3" y1="4" x2="13" y2="4" />
                <line x1="3" y1="7" x2="10" y2="7" opacity="0.6" />
                <line x1="3" y1="10" x2="12" y2="10" opacity="0.4" />
              </>
            )}
            {t.id === 'intern' && (
              <>
                <rect x="2" y="2" width="4" height="12" rx="0.5" />
                <rect x="8" y="2" width="6" height="5" rx="0.5" opacity="0.6" />
                <rect x="8" y="9" width="6" height="5" rx="0.5" opacity="0.4" />
              </>
            )}
            {t.id === 'fresh-grad' && (
              <>
                <rect x="2" y="2" width="12" height="4" rx="0.5" opacity="0.6" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <rect x="2" y="10" width="5" height="4" rx="0.5" opacity="0.4" />
                <rect x="9" y="10" width="5" height="4" rx="0.5" opacity="0.4" />
              </>
            )}
          </svg>
        </button>
      ))}
    </div>
  );
}
