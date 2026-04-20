import { useRef, useCallback, useState, useEffect, useLayoutEffect } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { serializeResumeToHtml } from '../../utils/htmlSerializer';
import { generatePdf } from '../../utils/pdfClient';
import ResumeRenderer from './ResumeRenderer';
import StatsPanel from './hidden-panels/StatsPanel';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_PADDING = 40;

interface PreviewPanelProps {
  onSendEmail?: () => void;
  onScrollContainerReady?: (container: HTMLDivElement | null) => void;
}

export default function PreviewPanel({ onSendEmail, onScrollContainerReady }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 暴露滚动容器给父组件
  useEffect(() => {
    if (onScrollContainerReady) {
      onScrollContainerReady(containerRef.current);
    }
  }, [onScrollContainerReady]);
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [pageOffsets, setPageOffsets] = useState<number[]>([0]);
  const [pageClipTops, setPageClipTops] = useState<number[]>([0]);
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

  // 计算需要多少页 - 基于完整 A4 页面高度
  const pageCount = onePageScale
    ? 1
    : pageOffsets.length;

  // 更新缩放比例
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerPadding = 16; // 固定外层容器 padding
    const availableWidth = containerWidth - containerPadding * 2;
    const newScale = Math.min(availableWidth / A4_WIDTH, 1);
    setScale(newScale);
  }, [setScale]);

  // 计算智能分页偏移量：在 item 之间分页，避免截断文字
  useLayoutEffect(() => {
    if (!contentRef.current || onePageScale !== null) return;

    const container = contentRef.current;

    const getTopRelative = (el: HTMLElement): number => {
      let top = 0;
      let current: HTMLElement | null = el;
      while (current && current !== container) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };

    // 收集 item 级别元素：section > wrapper > (title + items)
    const items: { top: number; bottom: number }[] = [];
    container.querySelectorAll('[data-preview-section]').forEach((section) => {
      const wrapper = section.children[0] as HTMLElement | undefined;
      if (wrapper && wrapper.children.length > 0) {
        // 深入到 SectionTitle + 各 item
        for (let i = 0; i < wrapper.children.length; i++) {
          const child = wrapper.children[i] as HTMLElement;
          const top = getTopRelative(child);
          items.push({ top, bottom: top + child.offsetHeight });
        }
      } else {
        // 没有 wrapper（如 personal section），用 section 本身
        const el = section as HTMLElement;
        const top = getTopRelative(el);
        items.push({ top, bottom: top + el.offsetHeight });
      }
    });

    if (items.length === 0) {
      setPageOffsets([0]);
      setPageClipTops([0]);
      setContentHeight(container.scrollHeight);
      return;
    }

    const offsets: number[] = [0];
    const clipTops: number[] = [0];
    let currentPageEnd = A4_HEIGHT - PAGE_PADDING;

    for (let i = 0; i < items.length; i++) {
      if (items[i].bottom > currentPageEnd) {
        const newOffset = items[i].top - PAGE_PADDING;
        if (newOffset > offsets[offsets.length - 1]) {
          offsets.push(newOffset);
          clipTops.push(items[i].top);
        }
        currentPageEnd = newOffset + A4_HEIGHT - PAGE_PADDING;
      }
    }

    setPageOffsets(offsets);
    setPageClipTops(clipTops);
    setContentHeight(container.scrollHeight);
  }, [onePageScale, resume]);

  // 获取内容高度（ResizeObserver 兜底）
  useEffect(() => {
    if (!contentRef.current || onePageScale !== null) return;
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(contentRef.current);
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

  // 点击外部自动收起工具栏
  useEffect(() => {
    if (!showToolbar) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowToolbar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolbar]);

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
      <div ref={toolbarRef} className="fixed top-20 right-6 z-50">
        {/* 折叠状态：只显示一个按钮 */}
        {!showToolbar ? (
          <button
            onClick={() => setShowToolbar(true)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-white transition-all"
            title="工具栏"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        ) : (
          /* 展开状态：显示所有工具 */
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 border border-gray-100">
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
              {hiddenPreview ? '显示简历' : '隐藏简历'}
            </button>
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 px-1 py-1">
              <span className="text-xs text-gray-500 px-1">页间距</span>
              {[10, 20, 30, 40, 50].map((value) => (
                <button
                  key={value}
                  onClick={() => setPreviewMargin(value)}
                  className={`px-2 py-1 text-xs rounded ${previewMargin === value ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden p-4" style={{ background: '#e5e7eb' }}>
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
                    boxSizing: 'border-box',
                    marginBottom: index < pageCount - 1 ? `${previewMargin}px` : '0',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -pageOffsets[index],
                      left: 0,
                      right: 0,
                      height: index < pageCount - 1 ? pageClipTops[index + 1] : undefined,
                      overflow: 'hidden',
                    }}
                  >
                    <ResumeRenderer onePageScale={null} />
                  </div>
                  {index > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: PAGE_PADDING,
                        background: 'white',
                        zIndex: 1,
                      }}
                    />
                  )}
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
