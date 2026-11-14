import { useEffect, useState } from 'react';

type Resource<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: T };

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [resource, setResource] = useState<Resource<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResource({ status: 'success', data });
      },
      () => {
        if (!controller.signal.aborted) setResource({ status: 'error' });
      },
    );
    return () => controller.abort();
  }, [load, attempt]);

  function retry() {
    setResource({ status: 'loading' });
    setAttempt((previous) => previous + 1);
  }

  return { resource, retry };
}
