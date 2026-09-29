import { useEffect, useRef } from "react";


interface Options {
  delay?: number
  ignoreFirstSave?: boolean
}

/**
 * Runs a debounced callback function when state changes.
 * @param {T} values - Object with form state.
 * @param {(values: T) => void | Promise<void>} saveFn - Callback function.
 * @param options - Optional configuration:
 *   - delay (default: 300ms)
 *   - ignoreFirstSave (default: false)
 */
export default function useAutoSave<T>(values: T, saveFn: (values: T) => void | Promise<void>, options?: Options) {
  const lastSaved = useRef<T>(values);
  const firstSave = useRef(true);
  const loading = useRef(true);
  const delay = options?.delay ?? 300;
  const ignoreFirstSave = options?.ignoreFirstSave ?? false;

  useEffect(() => {
    if (loading.current) {
      loading.current = false;
      return;
    }

    if (ignoreFirstSave && firstSave.current) {
      firstSave.current = false;
      return;
    }

    if (values === lastSaved.current) return;

    const timeout = setTimeout(async () => {
      await saveFn(values);
      lastSaved.current = values;
    }, delay);

    return () => clearTimeout(timeout);
  }, [values, delay, ignoreFirstSave]);
}
