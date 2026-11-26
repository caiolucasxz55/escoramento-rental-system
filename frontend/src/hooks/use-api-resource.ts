"use client";

import { useCallback, useEffect, useState } from "react";

interface Loaded<T> {
  // qual chamada produziu este resultado
  tag: string | null;
  data: T | null;
  error: unknown;
}

// carrega quando `key` muda; loading = o resultado guardado ainda e de outra chave
export function useApiResource<T>(key: string, load: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<Loaded<T>>({ tag: null, data: null, error: null });
  const tag = `${key}#${version}`;

  useEffect(() => {
    let current = true;
    load()
      .then((data) => current && setLoaded({ tag, data, error: null }))
      .catch((error: unknown) => current && setLoaded({ tag, data: null, error }));
    return () => {
      current = false;
    };
    // `load` muda a cada render; `tag` identifica a chamada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback((data: T) => setLoaded({ tag, data, error: null }), [tag]);

  return {
    data: loaded.data,
    error: loaded.tag === tag ? loaded.error : null,
    loading: loaded.tag !== tag,
    reload,
    setData,
  };
}
