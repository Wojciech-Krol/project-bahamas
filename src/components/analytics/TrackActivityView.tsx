"use client";

/**
 * Thin client wrapper that calls `useTrackView` once per activity
 * page mount. Server components render this to opt a route into
 * view tracking without themselves becoming client components.
 *
 * Guard: view_events.activity_id is a uuid foreign key, so firing
 * a beacon with a non-uuid mock id (phase 1 `a1`, `a2`, …) would
 * just trigger a 400 at the server. Short-circuit here instead.
 */

import { useTrackView } from "./useTrackView";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  activityId: string;
  sessionId?: string;
};

export default function TrackActivityView({ activityId, sessionId }: Props) {
  const shouldTrack = UUID_RE.test(activityId);
  // hook must be called unconditionally — pass empty id when we
  // don't want to track, useTrackView's internal `if (!activityId)`
  // guard turns it into a no-op.
  useTrackView({
    activityId: shouldTrack ? activityId : "",
    sessionId: shouldTrack && sessionId ? sessionId : undefined,
  });
  return null;
}
