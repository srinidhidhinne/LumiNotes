import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export const inputClassName =
  'w-full rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 transition-colors duration-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20';

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-navy-800">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-navy-500">{hint}</p>}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClassName} ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClassName} resize-none ${props.className ?? ''}`} />;
}
