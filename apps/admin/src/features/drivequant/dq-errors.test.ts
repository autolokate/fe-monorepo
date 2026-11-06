import { ApiError } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import { dqErrorView } from './dq-errors';

describe('dqErrorView', () => {
  it('flags step-up so the view offers "Sign in again"', () => {
    const view = dqErrorView(new ApiError('Step-up required', 403, 'step_up_required'), 'nf');
    expect(view.stepUp).toBe(true);
  });

  it('maps 404 to the caller message and plain 403 to a role message', () => {
    expect(dqErrorView(new ApiError('x', 404, 'not_found'), 'Trip gone.')).toEqual({
      message: 'Trip gone.',
      stepUp: false,
      notFound: true,
    });
    const forbidden = dqErrorView(new ApiError('x', 403, 'forbidden'), 'nf');
    expect(forbidden.stepUp).toBe(false);
    expect(forbidden.message).toContain('OPERATOR');
  });

  it('never echoes the raw server message for unknown failures', () => {
    const view = dqErrorView(new ApiError('lat=48.86 secret', 500, 'internal'), 'nf');
    expect(view.message).not.toContain('48.86');
  });
});
