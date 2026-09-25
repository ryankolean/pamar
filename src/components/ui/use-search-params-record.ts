"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { type SearchParams, toSearchParams } from "@/lib/search-params";

/**
 * The current URL's query as the same record shape the filter parsers take. Listing pages read
 * their filters on the client so the pages stay static (GitHub Pages preview) while filtered
 * URLs keep working. Use inside a Suspense boundary.
 */
export function useSearchParamsRecord(): SearchParams {
  const params = useSearchParams();
  return useMemo(() => toSearchParams(params), [params]);
}
