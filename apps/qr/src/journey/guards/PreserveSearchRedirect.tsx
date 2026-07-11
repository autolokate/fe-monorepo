import { Navigate, useLocation } from 'react-router-dom';

type PreserveSearchRedirectProps = {
  /** Absolute (`/journey/auth/mobile`) or relative (`mobile`) redirect target. */
  to: string;
};

/** Redirect while keeping `?q=` / legacy `?qr_code=` and other entry query params. */
export function PreserveSearchRedirect({ to }: PreserveSearchRedirectProps) {
  const location = useLocation();

  return (
    <Navigate
      to={{
        pathname: to,
        search: location.search,
        hash: location.hash,
      }}
      replace
    />
  );
}
