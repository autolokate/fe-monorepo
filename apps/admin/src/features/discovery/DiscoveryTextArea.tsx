import type { TextareaHTMLAttributes } from 'react';

export type DiscoveryTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  helperText?: string;
  errorText?: string;
  className?: string;
};

/** Native wow textarea control matching `admin-field` sheets. */
export function DiscoveryTextArea({
  label,
  helperText,
  errorText,
  className,
  ...props
}: DiscoveryTextAreaProps) {
  return (
    <label className={`admin-field${className ? ` ${className}` : ''}`}>
      {label}
      <textarea
        className="discovery-textarea"
        aria-invalid={errorText ? true : undefined}
        {...props}
      />
      {errorText ? (
        <span className="admin-form-error" role="alert">
          {errorText}
        </span>
      ) : helperText ? (
        <span className="admin-field__hint">{helperText}</span>
      ) : null}
    </label>
  );
}
