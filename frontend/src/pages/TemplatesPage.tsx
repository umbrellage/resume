import { useNavigate } from 'react-router-dom';
import { templates } from '../data/templates';
import { useResumeStore } from '../store/useResumeStore';
import { createDefaultResume } from '../data/defaultResume';
import Header from '../components/layout/Header';
import TemplatePreview from '../components/preview/templates/TemplatePreview';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const setResume = useResumeStore((s) => s.setResume);

  const handleSelect = (templateId: string) => {
    const localResume = { ...createDefaultResume(), templateId };
    setResume(localResume);
    navigate(`/editor/${localResume.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header showBack title="选择模板" />
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">选择模板</h1>
          <p className="text-gray-500">选择适合你的简历模板，开启创作之旅</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
            >
              <div className="w-full h-48 rounded-lg mb-4 overflow-hidden border border-gray-100 bg-white shadow-sm">
                <TemplatePreview templateId={t.id} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{t.nameZh}</h3>
              <p className="text-xs text-gray-400">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
