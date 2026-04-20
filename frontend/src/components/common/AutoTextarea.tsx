import { useRef, useEffect, forwardRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

interface AutoTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minRows?: number;
}

const flatClass = 'w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors leading-relaxed resize-none overflow-hidden';
const cardClass = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none overflow-hidden leading-relaxed transition-all duration-200 hover:border-gray-300';

const AutoTextarea = forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ value, onChange, placeholder, minRows = 2 }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const editorStyle = useResumeStore((s) => s.editorStyle);

    useEffect(() => {
      const el = innerRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      }
    }, [value]);

    return (
      <textarea
        ref={(el) => {
          (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
          if (typeof forwardedRef === 'function') forwardedRef(el);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
        }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={minRows}
        className={editorStyle === 'flat' ? flatClass : cardClass}
      />
    );
  }
);

AutoTextarea.displayName = 'AutoTextarea';

export default AutoTextarea;
