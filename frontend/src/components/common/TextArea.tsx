interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export default function TextArea({ label, id, className = '', ...props }: TextAreaProps) {
  const textareaId = id || label;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={textareaId} className="text-xs font-medium text-gray-600">
        {label}
      </label>
      <textarea
        id={textareaId}
        className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-y"
        {...props}
      />
    </div>
  );
}
