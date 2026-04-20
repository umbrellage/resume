import { useCallback } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { serializeResumeToHtml } from '../utils/htmlSerializer';
import { generatePdf } from '../utils/pdfClient';

export function usePdfExport() {
  const resume = useResumeStore((s) => s.resume);
  const onePageScale = useResumeStore((s) => s.onePageScale);
  const setIsExporting = useResumeStore((s) => s.setIsExporting);

  const exportPdf = useCallback(async () => {
    if (!resume) return;

    setIsExporting(true);
    try {
      const html = serializeResumeToHtml(resume, onePageScale);
      const blob = await generatePdf(html);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.personalInfo.name || '简历'}_${resume.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF 导出失败，请确保后端服务已启动');
    } finally {
      setIsExporting(false);
    }
  }, [resume, onePageScale, setIsExporting]);

  return { exportPdf };
}
