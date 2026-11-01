import { describe, expect, it } from 'vitest';

import { assertBuildEnv } from './env.config';

describe('assertBuildEnv (WEB-09)', () => {
  it('fails a production build when the API base URL is unset or blank', () => {
    expect(() => {
      assertBuildEnv({ NODE_ENV: 'production' });
    }).toThrow(/NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL is not set/);
    expect(() => {
      assertBuildEnv({ NODE_ENV: 'production', NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL: '  ' });
    }).toThrow(/not set/);
  });

  it('rejects malformed / non-http URLs', () => {
    expect(() => {
      assertBuildEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL: 'api.example',
      });
    }).toThrow(/not a valid URL/);
    expect(() => {
      assertBuildEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL: 'ftp://api.example.com',
      });
    }).toThrow(/http\(s\)/);
  });

  it('accepts an https base URL', () => {
    expect(() => {
      assertBuildEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL: 'https://api.example.com',
      });
    }).not.toThrow();
  });
});
