
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApi<T>(fetchData: () => Promise<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Keep the latest fetcher without re-running the effect on every render.
  const fetchRef = useRef(fetchData);
  useEffect(() => {
    fetchRef.current = fetchData;
  });

  useEffect(() => {
    let active = true;

    fetchRef.current()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message || 'Something went wrong');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Existing data stays on screen while the refresh is in flight.
  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  return { data, loading, error, reload };
}
