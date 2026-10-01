import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(
    () => ({
      push: (url: string) => navigate(url),
      replace: (url: string) => navigate(url, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      pathname: location.pathname,
    }),
    [navigate, location.pathname]
  );
}

export default useRouter;
