import { useSearchParams as useRRSearchParams } from 'react-router-dom';

export function useSearchParams(): URLSearchParams {
  const [searchParams] = useRRSearchParams();
  return searchParams;
}

export default useSearchParams;
