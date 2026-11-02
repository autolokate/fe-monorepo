import { describe, expect, it } from 'vitest';

import { expertToForm } from '@/features/experts/expert-form';

describe('expertToForm', () => {
  it('prefills every field the PUT replaces from the stored AdminExpertDto', () => {
    expect(
      expertToForm({
        id: 'e1',
        name: 'Asha',
        designation: 'Technician',
        bio: 'Bio',
        expertise: ['EV', 'Brakes'],
        channelUrl: 'https://example.test',
        rating: 4.5,
        sessionsCompleted: 12,
        status: 'INACTIVE',
        photoAsset: 'asha',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-02T00:00:00.000Z',
      }),
    ).toEqual({
      id: 'e1',
      name: 'Asha',
      designation: 'Technician',
      bio: 'Bio',
      expertise: 'EV, Brakes',
      channelUrl: 'https://example.test',
      rating: '4.5',
      sessionsCompleted: '12',
      photoAsset: 'asha',
      status: 'INACTIVE',
    });
  });

  it('maps nullable columns to blank inputs (rating null stays empty, not 0)', () => {
    const form = expertToForm({
      id: 'e2',
      name: 'Ravi',
      designation: '',
      bio: '',
      expertise: [],
      channelUrl: null,
      rating: null,
      sessionsCompleted: 0,
      status: 'ACTIVE',
      photoAsset: null,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    });
    expect(form.rating).toBe('');
    expect(form.channelUrl).toBe('');
    expect(form.photoAsset).toBe('');
    expect(form.sessionsCompleted).toBe('0');
    expect(form.expertise).toBe('');
  });
});
