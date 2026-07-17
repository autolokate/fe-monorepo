'use client';

import Link from 'next/link';
import { type SubmitEvent, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { useSubmitContactUs } from '@/hooks/contact';
import {
  MAX_CONTACT_MESSAGE,
  MAX_CONTACT_NAME,
  buildContactUsPayload,
  validateContactForm,
} from '@/lib/contact/validation';
import { FORM_COPY } from './constants';
import styles from './index.module.css';

export function ContactForm() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContact = useSubmitContactUs({
    onSuccess: () => {
      setSuccess(true);
      reset();
    },
    onError: (apiErr) => {
      setError(apiErr.message);
    },
  });

  function reset() {
    setName('');
    setNumber('');
    setEmail('');
    setMessage('');
    setConsent(false);
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('Please accept the privacy policy to continue.');
      return;
    }

    const fields = { name, number, email, message };
    const validationError = validateContactForm(fields);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = buildContactUsPayload(fields);
    if (!payload) return;

    void submitContact.mutate(payload);
  }

  const submitting = submitContact.isLoading;

  if (success) {
    return (
      <div className={styles.form}>
        <div className={styles.heading}>
          <h2 className={styles.formTitle}>{FORM_COPY.heading}</h2>
        </div>
        <div className={styles.success}>
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className={styles.successTitle}>
              Thanks for reaching out! We&apos;ll get back to you shortly.
            </p>
            <button
              type="button"
              className={styles.successAction}
              onClick={() => {
                setSuccess(false);
                submitContact.reset();
              }}
            >
              Send another message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.heading}>
        <h2 className={styles.formTitle}>{FORM_COPY.heading}</h2>
        <p className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" />
          {FORM_COPY.status}
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>
          {FORM_COPY.fields.name.label}
        </label>
        <input
          id="contact-name"
          type="text"
          placeholder={FORM_COPY.fields.name.placeholder}
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value.slice(0, MAX_CONTACT_NAME));
          }}
          className={styles.input}
          required
          maxLength={MAX_CONTACT_NAME}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contact-email" className={styles.label}>
            {FORM_COPY.fields.email.label}
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder={FORM_COPY.fields.email.placeholder}
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-number" className={styles.label}>
            {FORM_COPY.fields.phone.label}
          </label>
          <div className={styles.phoneInput}>
            <span className={styles.phonePrefix}>{FORM_COPY.fields.phone.prefix}</span>
            <span className={styles.phoneDivider} aria-hidden="true" />
            <input
              id="contact-number"
              type="tel"
              inputMode="tel"
              placeholder={FORM_COPY.fields.phone.placeholder}
              autoComplete="tel"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
              }}
              className={styles.phoneField}
              required
            />
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message" className={styles.label}>
          {FORM_COPY.fields.message.label}
        </label>
        <textarea
          id="contact-message"
          rows={4}
          placeholder={FORM_COPY.fields.message.placeholder}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value.slice(0, MAX_CONTACT_MESSAGE));
          }}
          className={styles.textarea}
          required
          maxLength={MAX_CONTACT_MESSAGE}
        />
      </div>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
          }}
          className={styles.checkboxInput}
        />
        <span className={styles.checkbox} aria-hidden="true">
          <Check className={styles.checkboxIcon} strokeWidth={3} />
        </span>
        <span className={styles.consentText}>
          I agree to the{' '}
          <Link href={FORM_COPY.privacyHref} className={styles.consentLink}>
            Privacy policy
          </Link>
        </span>
      </label>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.ctaRow}>
        <AlButton
          type="submit"
          size="lg"
          variant="primary"
          radius="lg"
          className={styles.submit}
          disabled={submitting}
          icon={
            submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ArrowRight className="h-4 w-4" aria-hidden />
            )
          }
          iconPosition="end"
        >
          {submitting ? 'Sending…' : FORM_COPY.submit}
        </AlButton>
      </div>
    </form>
  );
}
