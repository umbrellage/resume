import { useState, useRef, useEffect } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

interface MonthPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  showPresent?: boolean;
  placeholder?: string;
}

const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function MonthPicker({ label, value, onChange, showPresent, placeholder }: MonthPickerProps) {
  const editorStyle = useResumeStore((s) => s.editorStyle);
  const isFlat = editorStyle === 'flat';
  const isCard = editorStyle === 'card';

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value && value !== '至今') {
      return parseInt(value.split('-')[0]) || new Date().getFullYear();
    }
    return new Date().getFullYear();
  });
  const ref = useRef<HTMLDivElement>(null);

  const isPresent = value === '至今';
  const displayText = isPresent
    ? '至今'
    : value
      ? value.replace('-', '年') + '月'
      : '';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && value && value !== '至今') {
      const y = parseInt(value.split('-')[0]);
      if (y) setViewYear(y);
    }
  }, [open, value]);

  const handleSelect = (month: number) => {
    onChange(`${viewYear}-${String(month).padStart(2, '0')}`);
    setOpen(false);
  };

  const handlePresent = () => {
    onChange('至今');
    setOpen(false);
  };

  const selectedYear = value && value !== '至今' ? parseInt(value.split('-')[0]) : null;
  const selectedMonth = value && value !== '至今' ? parseInt(value.split('-')[1]) : null;

  const placeholderText = placeholder || (showPresent ? '选择时间或至今' : '选择时间');

  // Trigger button styles per editor style
  const flatButtonClass = `w-full border-0 border-b px-0 py-2 text-sm text-left flex items-center justify-between bg-transparent transition-colors
    ${open ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}
    ${isPresent ? 'text-blue-600' : 'text-gray-800'}
    ${!displayText && !isPresent ? 'text-gray-300' : ''}`;

  const cardButtonClass = `w-full border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between bg-white transition-colors
    ${isPresent ? 'border-blue-400 ring-2 ring-blue-100 text-blue-600' : 'border-gray-200 text-gray-800 hover:border-gray-300'}
    ${open && !isPresent ? 'ring-2 ring-blue-100 border-blue-400' : ''}
    ${!displayText && !isPresent ? 'text-gray-300' : ''}`;

  const buttonClass = isFlat ? flatButtonClass : cardButtonClass;

  return (
    <div className={`relative ${label ? 'flex flex-col gap-1' : ''}`} ref={ref}>
      {label && (
        <label className="text-xs font-medium text-gray-600">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={buttonClass}
      >
        <span>{displayText || placeholderText}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 py-2 w-[220px]">
          {/* Year navigation */}
          <div className="flex items-center justify-between px-3 pb-2">
            <button
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">{viewYear}年</span>
            <button
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-0.5 px-2">
            {monthLabels.map((m, i) => {
              const monthNum = i + 1;
              const isSelected = selectedYear === viewYear && selectedMonth === monthNum;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelect(monthNum)}
                  className={`py-1.5 text-xs rounded-lg transition-colors
                    ${isSelected
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Present button */}
          {showPresent && (
            <div className="border-t border-gray-100 mt-2 pt-2 px-2">
              <button
                type="button"
                onClick={handlePresent}
                className={`w-full py-1.5 text-xs rounded-lg transition-colors
                  ${isPresent
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                  }`}
              >
                至今
              </button>
            </div>
          )}

          {/* Clear button */}
          {value && (
            <div className="px-2 pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="清除"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
