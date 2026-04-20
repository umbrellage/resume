import { useRef, useEffect, useCallback } from 'react';
import Header from './Header';
import EditorPanel from './EditorPanel';
import PreviewPanel from '../preview/PreviewPanel';
import { useResumeStore } from '../../store/useResumeStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SplitEditorProps {
  saveStatus?: SaveStatus;
  onSave?: () => void;
  onShowLogin?: () => void;
  onSendEmail?: () => void;
  showBack?: boolean;
  editableTitle?: boolean;
  title?: string;
  onTitleChange?: (title: string) => void;
}

export default function SplitEditor({ saveStatus = 'idle', onSave, onShowLogin, onSendEmail, showBack, editableTitle, title, onTitleChange }: SplitEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const ticking = useRef(false);
  const editorStyle = useResumeStore((s) => s.editorStyle);
  const hiddenEditor = useResumeStore((s) => s.hiddenEditor);
  const setHiddenEditor = useResumeStore((s) => s.setHiddenEditor);

  const syncScroll = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;

    const editorSections = Array.from(editor.querySelectorAll<HTMLElement>('[data-editor-section]'));
    if (editorSections.length === 0) return;

    const scrollTop = editor.scrollTop;
    const viewportMid = scrollTop + editor.clientHeight * 0.3;

    let activeEl: HTMLElement | null = null;

    for (let i = editorSections.length - 1; i >= 0; i--) {
      const el = editorSections[i];
      const top = el.offsetTop;
      if (top <= viewportMid) {
        activeEl = el;
        break;
      }
    }

    if (!activeEl) {
      activeEl = editorSections[0];
    }

    const sectionId = activeEl.dataset.editorSection;
    if (!sectionId) return;

    const previewTarget = preview.querySelector<HTMLElement>(`[data-preview-section="${sectionId}"]`);
    if (!previewTarget) return;

    // 平滑滚动到目标位置
    previewTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        syncScroll();
        ticking.current = false;
      });
    };

    editor.addEventListener('scroll', handleScroll, { passive: true });
    return () => editor.removeEventListener('scroll', handleScroll);
  }, [syncScroll]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        saveStatus={saveStatus}
        onSave={onSave}
        onShowLogin={onShowLogin}
        onSendEmail={onSendEmail}
        showBack={showBack}
        editableTitle={editableTitle}
        title={title}
        onTitleChange={onTitleChange}
        onToggleEditor={() => setHiddenEditor(!hiddenEditor)}
        editorHidden={hiddenEditor}
        showEditorControls={true}
      />
      <div className="flex flex-1 overflow-hidden">
        <div
          ref={editorRef}
          className={`border-r transition-all duration-300 ${editorStyle === 'flat' ? 'border-gray-100' : 'border-gray-200'} ${editorStyle === 'flat' ? 'bg-white' : 'bg-gray-50'} overflow-y-auto ${hiddenEditor ? 'w-0 p-0 border-0' : 'w-1/2 p-0'}`}
        >
          {!hiddenEditor && <EditorPanel editorStyle={editorStyle} />}
        </div>
        <div ref={previewRef} className={`overflow-y-auto bg-gray-100 transition-all duration-300 ${hiddenEditor ? 'w-full' : 'w-1/2'}`}>
          <PreviewPanel onSendEmail={onSendEmail} onScrollContainerReady={(container) => { previewScrollRef.current = container; }} />
        </div>
      </div>
    </div>
  );
}
