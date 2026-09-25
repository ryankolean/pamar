"use client";

import { useEffect } from "react";
import { type AnalyticsEvent, trackEvent } from "@/lib/analytics";

/** Fires an analytics event once when rendered (e.g. on a confirmation page or success state). */
export function TrackEvent({
  name,
  params,
}: {
  name: AnalyticsEvent;
  params?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackEvent(name, params);
    // Fire once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
