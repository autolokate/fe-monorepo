import { useId, type TextareaHTMLAttributes } from 'react';

export type DiscoveryTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  helperText?: string;
  errorText?: string;
};

/** The design system has no textarea primitive yet — this reuses `al-field` chrome so it matches AlInput. */
export function DiscoveryTextArea({
  label,
  helperText,
  errorText,
  className,
  ...props
}: DiscoveryTextAreaProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const isError = Boolean(errorText);

  return (
    <div className={`al-field${isError ? ' al-field--error' : ''}`}>
      <label className="al-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="al-field__control">
        <textarea
          id={id}
          className={`al-field__input discovery-textarea${className ? ` ${className}` : ''}`}
          aria-invalid={isError || undefined}
          aria-describedby={isError ? errorId : helperText ? hintId : undefined}
          {...props}
        />
      </div>
      {helperText && !isError ? (
        <span className="al-field__hint" id={hintId}>
          {helperText}
        </span>
      ) : null}
      {isError ? (
        <span className="al-field__error" id={errorId} role="alert">
          {errorText}
        </span>
      ) : null}
    </div>
  );
}
