'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Shield,
  User,
} from 'lucide-react';
import { useSubmitContactUs } from '@/hooks/contact';
import {
  MAX_CONTACT_MESSAGE,
  MAX_CONTACT_NAME,
  buildContactUsPayload,
  validateContactForm,
} from '@/lib/contact/validation';
import styles from './index.module.css';

export function ContactForm() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContact = useSubmitContactUs({
    onSuccess: () => {
      setSuccess(true);
      reset();
    },
    onError: (apiErr) => setError(apiErr.message),
  });

  function reset() {
    setName('');
    setNumber('');
    setEmail('');
    setMessage('');
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

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

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Send us a message</h2>
      <p className={styles.subtitle}>
        Fill out the form and our team will get back to you shortly.
      </p>

      {success ? (
        <div className={styles.success}>
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-zinc-900" aria-hidden />
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
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <User className={styles.fieldIcon} aria-hidden />
            <input
              id="contact-name"
              type="text"
              placeholder="Your Name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, MAX_CONTACT_NAME))}
              className={styles.fieldInput}
              required
              maxLength={MAX_CONTACT_NAME}
            />
          </div>

          <div className={styles.field}>
            <Mail className={styles.fieldIcon} aria-hidden />
            <input
              id="contact-email"
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.field}>
            <Phone className={styles.fieldIcon} aria-hidden />
            <input
              id="contact-number"
              type="tel"
              inputMode="tel"
              placeholder="Phone Number"
              autoComplete="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.field}>
            <MessageSquare className={`${styles.fieldIcon} ${styles.textareaIcon}`} aria-hidden />
            <textarea
              id="contact-message"
              rows={4}
              placeholder="How can we help you today?"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_CONTACT_MESSAGE))}
              className={`${styles.fieldInput} ${styles.textarea}`}
              required
              maxLength={MAX_CONTACT_MESSAGE}
            />
          </div>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>Sending message…</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                <span>Send Message</span>
              </>
            )}
          </button>

          <p className={styles.privacy}>
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              By sending this message, you agree to our{' '}
              <Link href="/privacy-policy" className={styles.privacyLink}>
                Privacy Policy
              </Link>
              .
            </span>
          </p>
        </form>
      )}
    </article>
  );
}
