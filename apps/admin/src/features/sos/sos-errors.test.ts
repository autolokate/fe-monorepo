import { ApiError } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import { sosErrorView } from '@/features/sos/sos-errors';

describe('sosErrorView', () => {
  it('flags an expired step-up for re-login', () => {
    const view = sosErrorView(
      new ApiError('Step-up (2FA) required for the admin plane.', 403, 'forbidden'),
    );
    expect(view.stepUp).toBe(true);
    expect(view.message).toMatch(/Sign in again/);
  });

  it('explains a 409 with the current state and marks the view stale', () => {
    const view = sosErrorView(
      new ApiError('no', 409, 'sos_action_not_allowed', {
        action: 'CALL_USER',
        state: 'CALLING_USER_2',
      }),
    );
    expect(view.stale).toBe(true);
    expect(view.message).toContain('Calling user (2/2)');
    // The client keeps the whole envelope `error` as details.
    const nested = sosErrorView(
      new ApiError('no', 409, 'sos_action_not_allowed', {
        code: 'sos_action_not_allowed',
        details: { state: 'RESOLVED' },
      }),
    );
    expect(nested.message).toContain('Resolved');
  });

  it('plain 403 is a role problem, not step-up', () => {
    const view = sosErrorView(new ApiError('Forbidden resource', 403, 'forbidden'));
    expect(view.stepUp).toBe(false);
    expect(view.message).toMatch(/OPERATOR/);
  });

  it('404 is stale', () => {
    expect(sosErrorView(new ApiError('No such SOS incident.', 404, 'not_found')).stale).toBe(true);
  });
});
