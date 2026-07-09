import type { ReactNode } from 'react';
import { AlIcon } from '@autolokate/icons';
import {
  AlButton,
  AlHeading,
  AlIconButton,
  AlScreenBg,
  AlStepProgress,
  AlText,
} from '@autolokate/ui';

import { PURCHASE_FLOW_STEP_COUNT } from '../../features/qr-purchase/types.js';
import { PREPAID_FLOW_STEP_COUNT } from '../../features/qr-prepaid/types.js';
import { EMERGENCY_FLOW_STEP_COUNT } from '../../features/emergency/types.js';
import { SHARED_FLOW_STEP_COUNT } from '../../types/flow.js';

import '../step-shell-chrome/step-shell-chrome.css';
import './flow-step-shell.css';

export type FlowStepPhase = 'shared' | 'purchase' | 'prepaid' | 'emergency';

export type FlowStepCaptureProgress = {
  step: number;
  total: number;
};

export type FlowStepShellProps = {
  phase: FlowStepPhase;
  step: number;
  title: string;
  description?: ReactNode;
  footerLabel?: string;
  footerLoading?: boolean;
  footerDisabled?: boolean;
  footerHelperText?: string;
  footerHelperTone?: 'muted' | 'warning';
  hideFooter?: boolean;
  hideProgress?: boolean;
  captureProgress?: FlowStepCaptureProgress | null;
  /** Figma OTP capture — 24px body rhythm (789:2109). */
  bodyGap?: 'default' | 'otp';
  headerAccessory?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  footerSecondaryLabel?: string;
  onFooterSecondary?: () => void;
  /** Figma E0/R0 — secondary link above primary CTA (373:37). */
  footerSecondaryFirst?: boolean;
  children: ReactNode;
};

const phaseConfig = {
  shared: {
    stepTotal: SHARED_FLOW_STEP_COUNT,
    progressLabel: 'Progress',
    shellClassName: 'ob-shell',
  },
  purchase: {
    stepTotal: PURCHASE_FLOW_STEP_COUNT,
    progressLabel: 'Purchase',
    shellClassName: 'ob-shell ob-shell--purchase',
  },
  prepaid: {
    stepTotal: PREPAID_FLOW_STEP_COUNT,
    progressLabel: 'Pre-paid',
    shellClassName: 'ob-shell ob-shell--prepaid',
  },
  emergency: {
    stepTotal: EMERGENCY_FLOW_STEP_COUNT,
    progressLabel: 'Emergency',
    shellClassName: 'ob-shell ob-shell--emergency',
  },
} as const;

export function FlowStepShell({
  phase,
  step,
  title,
  description,
  footerLabel = 'Continue',
  footerLoading = false,
  footerDisabled = false,
  footerHelperText,
  footerHelperTone = 'muted',
  hideFooter = false,
  hideProgress = false,
  captureProgress,
  bodyGap = 'default',
  headerAccessory,
  showBack = true,
  onBack,
  onContinue,
  footerSecondaryLabel,
  onFooterSecondary,
  footerSecondaryFirst = false,
  children,
}: FlowStepShellProps) {
  const { stepTotal, progressLabel, shellClassName } = phaseConfig[phase];
  const resolvedProgress = (() => {
    if (hideProgress) {
      return null;
    }
    if (captureProgress) {
      return {
        step: captureProgress.step,
        total: captureProgress.total,
        showMeta: false,
        showCount: false,
      };
    }
    return {
      step,
      total: stepTotal,
      showMeta: true,
      showCount: false,
      label: progressLabel,
    };
  })();

  const resolvedBodyGap = bodyGap === 'otp' || captureProgress ? 'otp' : 'default';
  const shellModifiers = [
    captureProgress ? 'ob-shell--capture' : '',
    resolvedBodyGap === 'otp' ? 'ob-shell--body-otp' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <AlScreenBg variant="protected" className={`ob-step-chrome-screen ${shellClassName}`}>
      <div className={`ob-step-chrome__frame ob-shell__frame${shellModifiers ? ` ${shellModifiers}` : ''}`}>
        <header
          className={`ob-step-chrome__header ob-shell__header${resolvedProgress ? '' : ' ob-step-chrome__header--compact'}`}
        >
          <AlIconButton
            icon={<AlIcon name="arrow-left" size={24} aria-hidden />}
            label="Go back"
            onClick={onBack}
            disabled={!showBack || !onBack}
            className="ob-step-chrome__back ob-shell__back ob-shell-back"
          />
          {headerAccessory ? (
            <div className="ob-shell__header-accessory">{headerAccessory}</div>
          ) : null}
          {resolvedProgress ? (
            <AlStepProgress
              step={resolvedProgress.step}
              total={resolvedProgress.total}
              showMeta={resolvedProgress.showMeta}
              label={'label' in resolvedProgress ? resolvedProgress.label : undefined}
              showCount={resolvedProgress.showCount}
              className="ob-step-chrome__progress ob-shell__progress"
            />
          ) : null}
        </header>

        <div className={`ob-step-chrome__body ob-shell__body${resolvedBodyGap === 'otp' ? ' ob-shell__body--otp' : ''}`}>
          <div className="ob-step-chrome__heading ob-shell__heading">
            <AlHeading variant="h2">{title}</AlHeading>
            {description ? (
              typeof description === 'string' ? (
                <AlText tone="muted" className="ob-shell__description">
                  {description}
                </AlText>
              ) : (
                <div className="ob-shell__description">{description}</div>
              )
            ) : null}
          </div>
          {children}
        </div>

        {hideFooter ? null : (
          <footer
            className={`ob-step-chrome__footer ob-shell__footer${footerSecondaryFirst ? ' ob-shell__footer--secondary-first' : ''}`}
          >
            {footerHelperText ? (
              <p
                className={`ob-shell__footer-helper ob-shell__footer-helper--${footerHelperTone}`}
                role={footerHelperTone === 'warning' ? 'alert' : undefined}
              >
                {footerHelperText}
              </p>
            ) : null}
            {footerSecondaryFirst && footerSecondaryLabel && onFooterSecondary ? (
              <button
                type="button"
                className="ob-shell__footer-secondary-link"
                onClick={onFooterSecondary}
              >
                {footerSecondaryLabel}
              </button>
            ) : null}
            <AlButton
              variant="primary"
              className="ob-step-chrome__cta ob-shell__cta"
              loading={footerLoading}
              disabled={footerDisabled || footerLoading}
              onClick={onContinue}
            >
              {footerLabel}
            </AlButton>
            {!footerSecondaryFirst && footerSecondaryLabel && onFooterSecondary ? (
              <button
                type="button"
                className="ob-shell__footer-secondary-link"
                onClick={onFooterSecondary}
              >
                {footerSecondaryLabel}
              </button>
            ) : null}
          </footer>
        )}
      </div>
    </AlScreenBg>
  );
}
