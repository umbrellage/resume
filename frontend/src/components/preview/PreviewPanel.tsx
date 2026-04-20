import { useRef, useEffect, useState, useCallback } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { serializeResumeToHtml } from '../../utils/htmlSerializer';
import { generatePdf } from '../../utils/pdfClient';
import ResumeRenderer from './ResumeRenderer';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

type HiddenPanelType = 'stats' | 'templates' | 'actions' | 'outline';

export default function PreviewPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [isExporting, setIsExporting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hiddenPanel, setHiddenPanel] = useState<HiddenPanelType>('stats');
  const resume = useResumeStore((s) => s.resume);
  const onePageScale = useResumeStore((s) => s.onePageScale);
  const setOnePageScale = useResumeStore((s) => s.setOnePageScale);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const availableWidth = containerWidth - 40;
    const newScale = Math.min(availableWidth / A4_WIDTH, 1);
    setScale(newScale);
  }, []);

  // Smart fit to one page - calculate based on A4 page height
  const fitToOnePage = useCallback(() => {
    if (!contentRef.current) return;

    // Measure actual content height
    const contentHeight = contentRef.current.scrollHeight;

    if (contentHeight <= A4_HEIGHT) {
      // Content fits, no scaling needed
      setOnePageScale(null);
      return;
    }

    // Calculate scale to fit content in A4 page height
    const targetScale = A4_HEIGHT / contentHeight;
    setOnePageScale(targetScale);
  }, [setOnePageScale]);

  const handleDownload = useCallback(async () => {
    if (!resume) return;
    setIsExporting(true);
    try {
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
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF 导出失败');
    } finally {
      setIsExporting(false);
    }
  }, [resume, onePageScale]);

  useEffect(() => {
    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [updateScale]);

  // Use onePageScale from store if set, otherwise use calculated scale
  const displayScale = onePageScale ?? scale;

  return (
    <div className="relative h-full">
      {/* Control bar - fixed position so it's not affected by scroll */}
      <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 border border-gray-100">
        <button
          onClick={handleDownload}
          disabled={isExporting || !resume}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          title="下载 PDF"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {isExporting ? '导出中...' : '下载'}
        </button>
        <button
          onClick={fitToOnePage}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${onePageScale !== null ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          title="自动调整到一页"
        >
          智能一页
        </button>
        {onePageScale !== null && (
          <button
            onClick={() => setOnePageScale(null)}
            className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            title="取消智能一页"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={() => setHidden(!hidden)}
          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          title={hidden ? '显示预览' : '隐藏预览'}
        >
          {hidden ? '显示' : '隐藏'}
        </button>
        {hidden && (
          <select
            value={hiddenPanel}
            onChange={(e) => setHiddenPanel(e.target.value as HiddenPanelType)}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded bg-white text-gray-600"
          >
            <option value="stats">统计</option>
            <option value="templates">模板</option>
            <option value="actions">操作</option>
            <option value="outline">大纲</option>
          </select>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{
          background: '#e5e7eb',
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: `${A4_WIDTH}px`,
            height: `${A4_HEIGHT}px`,
            transform: `scale(${displayScale})`,
            transformOrigin: 'top center',
            flexShrink: 0,
          }}
        >
          <div
            ref={contentRef}
            style={{
              width: `${A4_WIDTH}px`,
              minHeight: `${A4_HEIGHT}px`,
              background: '#ffffff',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
            }}
            data-resume-content
          >
            <ResumeRenderer />
          </div>
        </div>
        <div style={{ height: `${A4_HEIGHT * displayScale}px`, width: '100%' }} />
      </div>
    </div>
  );
}
