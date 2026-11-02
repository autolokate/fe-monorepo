import { describe, expect, it } from 'vitest';

import { pushRecentRoute } from '@/layouts/admin-recent-routes';

describe('recent admin routes', () => {
  it('moves a revisited route to the front without duplicates', () => {
    expect(pushRecentRoute(['/orders', '/users', '/taxi/bookings'], '/users')).toEqual([
      '/users',
      '/orders',
      '/taxi/bookings',
    ]);
  });

  it('caps the list', () => {
    expect(pushRecentRoute(['/a', '/b', '/c'], '/d', 3)).toEqual(['/d', '/a', '/b']);
  });
});
