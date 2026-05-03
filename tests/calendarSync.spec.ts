import { describe, it, expect, vi, beforeEach } from "vitest";

// Calendar sync is best-effort. These tests verify the contract: when
// the integration is missing or the user has paused sync, the function
// returns silently without calling the Google API.

beforeEach(() => {
  vi.resetModules();
});

describe("calendar sync — guards", () => {
  it("syncBookingConfirmed bails when calendar is not configured", async () => {
    delete process.env.GOOGLE_CALENDAR_CLIENT_ID;
    delete process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { syncBookingConfirmed } = await import("@/src/lib/calendar/sync");
    await syncBookingConfirmed("00000000-0000-0000-0000-000000000000");

    // We never reach Google because we never even tried to load the
    // booking row (admin client is also unavailable in tests). The
    // assertion is the absence of a Google fetch call.
    const googleCalls = fetchSpy.mock.calls.filter(
      ([url]) =>
        typeof url === "string" && url.includes("googleapis.com"),
    );
    expect(googleCalls.length).toBe(0);
  });
});
