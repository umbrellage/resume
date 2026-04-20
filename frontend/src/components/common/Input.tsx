import { useResumeStore } from '../../store/useResumeStore';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, id, className = '', ...props }: InputProps) {
  const inputId = id || label;
  const editorStyle = useResumeStore((s) => s.editorStyle);

  const labelClass = editorStyle === 'flat'
    ? 'text-xs font-medium text-gray-500 mb-1'
    : 'text-xs font-medium text-gray-600 mb-1';

  const inputClass = editorStyle === 'flat'
    ? 'w-full border-0 border-b border-gray-200 px-0 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 bg-transparent transition-colors'
    : 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200';

  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <input
        id={inputId}
        className={inputClass}
        {...props}
      />
    </div>
  );
}
