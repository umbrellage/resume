import { useRef, useCallback, useState, useEffect } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { serializeResumeToHtml } from '../../utils/htmlSerializer';
import { generatePdf } from '../../utils/pdfClient';
import ResumeRenderer from './ResumeRenderer';
import StatsPanel from './hidden-panels/StatsPanel';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const TEMPLATE_PADDING = 40;
const CONTENT_AREA_HEIGHT = A4_HEIGHT - TEMPLATE_PADDING * 2;

interface PreviewPanelProps {
  onSendEmail?: () => void;
}

export default function PreviewPanel({ onSendEmail }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const resume = useResumeStore((s) => s.resume);
  const onePageScale = useResumeStore((s) => s.onePageScale);
  const setOnePageScale = useResumeStore((s) => s.setOnePageScale);
  const hiddenPreview = useResumeStore((s) => s.hiddenPreview);
  const setHiddenPreview = useResumeStore((s) => s.setHiddenPreview);
  const previewMargin = useResumeStore((s) => s.previewMargin);
  const setPreviewMargin = useResumeStore((s) => s.setPreviewMargin);
  const isExporting = useResumeStore((s) => s.isExporting);
  const setIsExporting = useResumeStore((s) => s.setIsExporting);
  const scale = useResumeStore((s) => s.scale);
  const setScale = useResumeStore((s) => s.setScale);

  // 计算需要多少页 - 基于内容区域高度
  const pageCount = onePageScale
    ? 1
    : Math.ceil(Math.max(1, contentHeight) / CONTENT_AREA_HEIGHT);

  // 更新缩放比例
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const availableWidth = containerWidth - previewMargin * 2;
    const newScale = Math.min(availableWidth / A4_WIDTH, 1);
    setScale(newScale);
  }, [setScale, previewMargin]);

  // 获取内容高度
  useEffect(() => {
    if (!contentRef.current || onePageScale !== null) return;
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    // 使用 ResizeObserver 监听内容变化
    const observer = new ResizeObserver(updateHeight);
    observer.observe(contentRef.current);

    // 初始高度
    updateHeight();

    return () => observer.disconnect();
  }, [onePageScale, resume]);

  // 容器大小变化时更新缩放
  useEffect(() => {
    updateScale();
    const handleResize = () => updateScale();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScale]);

  const fitToOnePage = useCallback(() => {
    if (!contentRef.current) return;
    const contentHeight = contentRef.current.scrollHeight;
    const targetScale = A4_HEIGHT / contentHeight;
    setOnePageScale(targetScale);
  }, [setOnePageScale]);

  const handleDownloadLocal = useCallback(async () => {
    setShowDownloadMenu(false);
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
  }, [resume, onePageScale, setIsExporting]);

  const handleSendToEmail = useCallback(() => {
    setShowDownloadMenu(false);
    onSendEmail?.();
  }, [onSendEmail]);

  return (
    <div className="relative h-full">
      <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 border border-gray-100">
        <div className="relative">
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            disabled={isExporting || !resume}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            下载
            <svg className={`w-3 h-3 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showDownloadMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden" style={{ minWidth: '72px' }}>
                <button
                  onClick={handleDownloadLocal}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 flex items-center gap-2 whitespace-nowrap"
                >
                  下载到本地
                </button>
                <button
                  onClick={handleSendToEmail}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 flex items-center gap-2 whitespace-nowrap"
                >
                  发送到邮箱
                </button>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => onePageScale !== null ? setOnePageScale(null) : fitToOnePage()}
          className={`px-3 py-1.5 text-xs rounded-lg border ${onePageScale !== null ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          {onePageScale !== null ? '取消一页' : '智能一页'}
        </button>
        <button
          onClick={() => setHiddenPreview(!hiddenPreview)}
          className={`px-3 py-1.5 text-xs rounded-lg border ${hiddenPreview ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          {hiddenPreview ? '显示' : '隐藏'}
        </button>
        <select
          value={previewMargin}
          onChange={(e) => setPreviewMargin(Number(e.target.value))}
          className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-600"
        >
          <option value={10}>小边距</option>
          <option value={20}>中边距</option>
          <option value={40}>大边距</option>
        </select>
      </div>

      <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden" style={{ background: '#e5e7eb', padding: `${previewMargin}px` }}>
        <div style={{ maxWidth: `${A4_WIDTH * scale}px` }}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${A4_WIDTH}px`,
              overflow: 'hidden',
            }}
          >
          {hiddenPreview ? (
            <div
              className="bg-white"
              style={{
                width: `${A4_WIDTH}px`,
                height: `${A4_HEIGHT}px`,
                overflow: 'hidden',
              }}
            >
              <StatsPanel />
            </div>
          ) : onePageScale !== null ? (
            // 智能一页模式：单页，内容缩放到一页
            <div
              ref={contentRef}
              className="bg-white"
              style={{
                width: `${A4_WIDTH}px`,
                height: `${A4_HEIGHT}px`,
                overflow: 'hidden',
              }}
            >
              <ResumeRenderer onePageScale={onePageScale} />
            </div>
          ) : (
            // 非智能一页模式：多页支持
            <>
              {/* 隐藏的实际内容，用于测量高度 */}
              <div ref={contentRef} style={{ visibility: 'hidden', position: 'absolute' }}>
                <ResumeRenderer onePageScale={null} />
              </div>
              {/* 多个视窗显示不同部分 */}
              {Array.from({ length: pageCount }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg"
                  style={{
                    width: `${A4_WIDTH}px`,
                    height: `${A4_HEIGHT}px`,
                    overflow: 'hidden',
                    position: 'relative',
                    paddingTop: '40px',
                    paddingBottom: '40px',
                    boxSizing: 'border-box',
                    marginBottom: index < pageCount - 1 ? '16px' : '0',
                  }}
                >
                  {/* 视窗内部的内容区域 */}
                  <div
                    style={{
                      position: 'relative',
                      height: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -index * CONTENT_AREA_HEIGHT,
                        left: 0,
                        right: 0,
                      }}
                    >
                      <ResumeRenderer onePageScale={null} />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
