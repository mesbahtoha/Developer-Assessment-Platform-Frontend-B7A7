"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Syncs filters/pagination/sort with the URL (?page=&status=&search=…)
 * so views are bookmarkable and shareable.
 */
export function useURLFilters<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const out = { ...defaults };
    (Object.keys(defaults) as Array<keyof T>).forEach((k) => {
      const v = searchParams.get(k as string);
      if (v !== null) (out as Record<string, string>)[k as string] = v;
    });
    return out;
  }, [searchParams, defaults]);

  const setFilters = useCallback(
    (patch: Partial<T>, opts?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === "" || v === undefined || v === null) params.delete(k);
        else params.set(k, String(v));
      });
      if (opts?.resetPage !== false && !("page" in patch)) params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { filters, setFilters, setPage };
}
