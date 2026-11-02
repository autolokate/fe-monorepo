import { describe, expect, it } from 'vitest';

import { parseAdminShellPrefs } from '@/layouts/admin-shell-prefs';

describe('admin shell prefs', () => {
  it('defaults when nothing or garbage is stored', () => {
    const fallback = { sidebarCollapsed: false, closedGroups: [] };
    expect(parseAdminShellPrefs(null)).toEqual(fallback);
    expect(parseAdminShellPrefs('{not json')).toEqual(fallback);
    expect(parseAdminShellPrefs('42')).toEqual(fallback);
  });

  it('keeps only well-typed fields', () => {
    expect(
      parseAdminShellPrefs(
        JSON.stringify({ sidebarCollapsed: true, closedGroups: ['taxi', 7, 'content'] }),
      ),
    ).toEqual({ sidebarCollapsed: true, closedGroups: ['taxi', 'content'] });
    expect(parseAdminShellPrefs(JSON.stringify({ sidebarCollapsed: 'yes' }))).toEqual({
      sidebarCollapsed: false,
      closedGroups: [],
    });
  });
});
