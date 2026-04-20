import { useResumeStore } from '../../../store/useResumeStore';
import { serializeResumeToHtml } from '../../../utils/htmlSerializer';
import { generatePdf } from '../../../utils/pdfClient';

export default function ActionsPanel() {
  const resume = useResumeStore((s) => s.resume);
  const onePageScale = useResumeStore((s) => s.onePageScale);

  const handleDownload = async () => {
    if (!resume) return;
    const html = serializeResumeToHtml(resume, onePageScale);
    const blob = await generatePdf(html);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.personalInfo.name || '简历'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-gray-700 mb-4">快捷操作</div>
      <div className="space-y-3">
        <button
          onClick={handleDownload}
          disabled={!resume}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          导出 PDF
        </button>
        <button
          onClick={handleCopyLink}
          className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          复制链接
        </button>
      </div>
    </div>
  );
}