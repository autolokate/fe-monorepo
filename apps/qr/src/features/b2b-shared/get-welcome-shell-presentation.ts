import {
  B2B_WELCOME_ERROR_CTA,
  B2B_WELCOME_LOADING_BODY,
  B2B_WELCOME_LOADING_CTA,
  B2B_WELCOME_SUCCESS_CTA,
  B2B_WELCOME_TITLE,
} from './b2b-welcome-copy.js';
import type { WelcomeViewState } from './types-landing.js';

export type WelcomeShellPresentation = {
  title: string;
  description: string;
  footerLabel: string;
  footerDisabled: boolean;
  footerDimmed: boolean;
  showBack: boolean;
  bgVariant: 'protected' | 'attention';
};

export function getWelcomeShellPresentation(
  viewState: WelcomeViewState,
  successBodyCopy: string,
): WelcomeShellPresentation {
  const isLoading = viewState === 'loading';
  const isError = viewState === 'error';

  return {
    title: B2B_WELCOME_TITLE,
    description: isLoading ? B2B_WELCOME_LOADING_BODY : successBodyCopy,
    footerLabel: isLoading
      ? B2B_WELCOME_LOADING_CTA
      : isError
        ? B2B_WELCOME_ERROR_CTA
        : B2B_WELCOME_SUCCESS_CTA,
    footerDisabled: isLoading,
    footerDimmed: isLoading,
    showBack: !isLoading && !isError,
    bgVariant: isError ? 'attention' : 'protected',
  };
}
