import { useRef, useCallback, useEffect, useState, forwardRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minRows?: number;
}

const flatBase = 'rich-text-editor w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors leading-relaxed overflow-hidden';
const cardBase = 'rich-text-editor w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 leading-relaxed overflow-hidden transition-all duration-200 hover:border-gray-300';

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(function RichTextEditor({ value, onChange, placeholder, minRows = 3 }, externalRef) {
  const internalRef = useRef<HTMLDivElement>(null);
  const editorStyle = useResumeStore((s) => s.editorStyle);
  const composing = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const savedSelection = useRef<Range | null>(null);

  // Handle refs - both internal and external
  const setRef = useCallback((node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (typeof externalRef === 'function') {
      externalRef(node);
    } else if (externalRef) {
      (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [externalRef]);

  // Sync external value changes ONLY when not focused
  useEffect(() => {
    const el = internalRef.current;
    if (!el || isFocused) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value, isFocused]);

  // Save selection on every selection change within this editor
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const el = internalRef.current;
      // Only save if selection is inside this editor
      if (el && el.contains(range.commonAncestorContainer)) {
        savedSelection.current = range.cloneRange();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleInput = useCallback(() => {
    if (composing.current) return;
    const el = internalRef.current;
    if (el) {
      onChange(el.innerHTML);
    }
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const el = internalRef.current;
    if (el) {
      onChange(el.innerHTML);
    }
  }, [onChange]);

  // Auto-grow height
  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Initialize content on mount
  useEffect(() => {
    const el = internalRef.current;
    if (el && !el.innerHTML) {
      el.innerHTML = value;
    }
  }, []);

  return (
    <div
      ref={setRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={() => { composing.current = false; handleInput(); }}
      className={editorStyle === 'flat' ? flatBase : cardBase}
      style={{ minHeight: `${minRows * 24 + 20}px` }}
    />
  );
});

export default RichTextEditor;
