import { useCallback, useEffect, useState } from 'react';
import { apiError } from '../api/axios.js';

/**
 * useFetch — generic data-fetching hook with loading/error state.
 * Pass a memoized async function that returns the data.
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, setData, loading, error, refetch: run };
}
