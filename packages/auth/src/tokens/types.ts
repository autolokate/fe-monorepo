/** Token pair persisted after OTP verify or refresh. */
export type StoredTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
};

export type TokenStorage = {
  read: () => StoredTokenPair | null;
  write: (tokens: StoredTokenPair) => void;
  remove: () => void;
};

export type TokenRefreshHandler = (refreshToken: string) => Promise<StoredTokenPair>;
