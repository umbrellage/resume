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
  const ticking = useRef(false);
  const editorStyle = useResumeStore((s) => s.editorStyle);

  const syncScroll = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    const editorSections = Array.from(editor.querySelectorAll<HTMLElement>('[data-editor-section]'));
    if (editorSections.length === 0) return;

    const scrollTop = editor.scrollTop;
    const viewportMid = scrollTop + editor.clientHeight * 0.3;

    let activeEl: HTMLElement | null = null;
    let progress = 0;

    for (let i = editorSections.length - 1; i >= 0; i--) {
      const el = editorSections[i];
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (top <= viewportMid) {
        activeEl = el;
        progress = Math.min(1, Math.max(0, (viewportMid - top) / Math.max(height, 1)));
        break;
      }
    }

    if (!activeEl) {
      activeEl = editorSections[0];
      progress = 0;
    }

    const sectionId = activeEl.dataset.editorSection;
    if (!sectionId) return;

    const previewTarget = preview.querySelector<HTMLElement>(`[data-preview-section="${sectionId}"]`);
    if (!previewTarget) return;

    const scaledContainer = previewTarget.closest('[data-resume-content]') as HTMLElement | null;
    const zoom = scaledContainer ? parseFloat(getComputedStyle(scaledContainer.firstElementChild as HTMLElement).zoom || '1') : 1;

    const previewTop = previewTarget.offsetTop * zoom;
    const previewHeight = previewTarget.offsetHeight * zoom;
    const targetScroll = previewTop + previewHeight * progress - preview.clientHeight * 0.3;

    preview.scrollTo({ top: Math.max(0, targetScroll), behavior: 'auto' });
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
      <Header saveStatus={saveStatus} onSave={onSave} onShowLogin={onShowLogin} onSendEmail={onSendEmail} showBack={showBack} editableTitle={editableTitle} title={title} onTitleChange={onTitleChange} />
      <div className="flex flex-1 overflow-hidden">
        <div ref={editorRef} className={`w-1/2 border-r ${editorStyle === 'flat' ? 'border-gray-100' : 'border-gray-200'} ${editorStyle === 'flat' ? 'bg-white' : 'bg-gray-50'} overflow-y-auto`}>
          <EditorPanel editorStyle={editorStyle} />
        </div>
        <div ref={previewRef} className="w-1/2 overflow-y-auto bg-gray-100">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
