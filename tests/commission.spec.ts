import { describe, it, expect } from "vitest";
import {
  computeCommission,
  BOOST_COMMISSION_TARGET_BPS,
  BASE_COMMISSION_DEFAULT_BPS,
  type CommissionInput,
} from "@/src/lib/payments/commission";

// Helper: build an input with sensible defaults; tests override what matters.
function makeInput(overrides: Partial<CommissionInput> = {}): CommissionInput {
  return {
    basePriceCents: 10_000, // 100.00 PLN
    partner: {
      commissionRateBps: BASE_COMMISSION_DEFAULT_BPS, // 2000 = 20%
      subscriptionCommissionBps: null,
      hasActiveSubscription: false,
    },
    customer: {
      attribution: null,
    },
    boost: {
      activeOnSession: false,
    },
    ...overrides,
    // Merge nested overrides correctly:
    partner: { ...{
      commissionRateBps: BASE_COMMISSION_DEFAULT_BPS,
      subscriptionCommissionBps: null,
      hasActiveSubscription: false,
    }, ...(overrides.partner ?? {}) },
    customer: { ...{ attribution: null }, ...(overrides.customer ?? {}) },
    boost: { ...{ activeOnSession: false }, ...(overrides.boost ?? {}) },
  };
}

describe("computeCommission — Phase 3 Done criteria", () => {
  it("Scenario 1: returning customer at non-Boost partner → base rate", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 10_000,
        partner: {
          commissionRateBps: 1500, // 15% target
          subscriptionCommissionBps: null,
          hasActiveSubscription: false,
        },
        customer: { attribution: { wasBoostAttributed: false } },
        boost: { activeOnSession: false },
      }),
    );
    expect(result.commissionBps).toBe(1500);
    expect(result.commissionCents).toBe(1500);
    expect(result.isBoostFirstBooking).toBe(false);
    expect(result.boostCommissionBps).toBeNull();
    expect(result.reason).toBe("returning-customer-base");
  });

  it("Scenario 2: new customer at partner with no active Boost → base rate, not boost-first", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 20_000,
        partner: {
          commissionRateBps: 2000,
          subscriptionCommissionBps: null,
          hasActiveSubscription: false,
        },
        customer: { attribution: null },
        boost: { activeOnSession: false },
      }),
    );
    expect(result.commissionBps).toBe(2000);
    expect(result.commissionCents).toBe(4000);
    expect(result.isBoostFirstBooking).toBe(false);
    expect(result.boostCommissionBps).toBeNull();
    expect(result.reason).toBe("new-customer-base");
  });

  it("Scenario 3: new customer books Boost-active session → 3500 bps; isBoostFirstBooking=true", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 10_000,
        partner: {
          commissionRateBps: 1500, // base ignored when Boost applies
          subscriptionCommissionBps: null,
          hasActiveSubscription: false,
        },
        customer: { attribution: null },
        boost: { activeOnSession: true },
      }),
    );
    expect(result.commissionBps).toBe(BOOST_COMMISSION_TARGET_BPS);
    expect(result.commissionBps).toBe(3500);
    expect(result.commissionCents).toBe(3500);
    expect(result.isBoostFirstBooking).toBe(true);
    expect(result.boostCommissionBps).toBe(3500);
    expect(result.reason).toBe("new-customer-boost");
  });

  it("Scenario 4: same customer's 2nd booking with Boost active → base rate, no double-charge", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 10_000,
        partner: {
          commissionRateBps: 1500,
          subscriptionCommissionBps: null,
          hasActiveSubscription: false,
        },
        // Attribution exists → returning customer. wasBoostAttributed=true
        // indicates the first booking was Boost-attributed, but that does
        // NOT re-apply Boost pricing to subsequent bookings.
        customer: { attribution: { wasBoostAttributed: true } },
        boost: { activeOnSession: true },
      }),
    );
    expect(result.commissionBps).toBe(1500);
    expect(result.commissionCents).toBe(1500);
    expect(result.isBoostFirstBooking).toBe(false);
    expect(result.boostCommissionBps).toBeNull();
    expect(result.reason).toBe("returning-customer-base");
  });
});

describe("computeCommission — subscription partners", () => {
  it("subscription rate applies to returning customer (not default base)", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 10_000,
        partner: {
          commissionRateBps: 2000,
          subscriptionCommissionBps: 1000, // 10%
          hasActiveSubscription: true,
        },
        customer: { attribution: { wasBoostAttributed: false } },
        boost: { activeOnSession: false },
      }),
    );
    expect(result.commissionBps).toBe(1000);
    expect(result.commissionCents).toBe(1000);
    expect(result.reason).toBe("returning-customer-subscription");
  });

  it("subscription active but subscriptionCommissionBps is null → falls back to base", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 10_000,
        partner: {
          commissionRateBps: 1800,
          subscriptionCommissionBps: null,
          hasActiveSubscription: true,
        },
        customer: { attribution: { wasBoostAttributed: false } },
        boost: { activeOnSession: false },
      }),
    );
    expect(result.commissionBps).toBe(1800);
    expect(result.commissionCents).toBe(1800);
    expect(result.reason).toBe("returning-customer-base");
  });

  it("subscription partner, new customer, no Boost → subscription rate still applies", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 10_000,
        partner: {
          commissionRateBps: 2000,
          subscriptionCommissionBps: 1200,
          hasActiveSubscription: true,
        },
        customer: { attribution: null },
        boost: { activeOnSession: false },
      }),
    );
    expect(result.commissionBps).toBe(1200);
    expect(result.commissionCents).toBe(1200);
    expect(result.isBoostFirstBooking).toBe(false);
    expect(result.reason).toBe("new-customer-base-subscription");
  });

  it("subscription partner, new customer, Boost active → Boost rate wins over subscription", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 10_000,
        partner: {
          commissionRateBps: 2000,
          subscriptionCommissionBps: 1000,
          hasActiveSubscription: true,
        },
        customer: { attribution: null },
        boost: { activeOnSession: true },
      }),
    );
    expect(result.commissionBps).toBe(3500);
    expect(result.commissionCents).toBe(3500);
    expect(result.isBoostFirstBooking).toBe(true);
    expect(result.boostCommissionBps).toBe(3500);
    expect(result.reason).toBe("new-customer-boost");
  });
});

describe("computeCommission — edge cases", () => {
  it("zero price → zero commission", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 0,
        partner: {
          commissionRateBps: 1500,
          subscriptionCommissionBps: null,
          hasActiveSubscription: false,
        },
        customer: { attribution: null },
        boost: { activeOnSession: false },
      }),
    );
    expect(result.commissionCents).toBe(0);
    expect(result.commissionBps).toBe(1500);
  });

  it("zero price, Boost active → zero commission, but flags still set", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 0,
        customer: { attribution: null },
        boost: { activeOnSession: true },
      }),
    );
    expect(result.commissionCents).toBe(0);
    expect(result.isBoostFirstBooking).toBe(true);
    expect(result.boostCommissionBps).toBe(3500);
  });

  it("rounding: 3333 cents @ 1500 bps = floor(499.95) = 499", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 3333,
        partner: {
          commissionRateBps: 1500,
          subscriptionCommissionBps: null,
          hasActiveSubscription: false,
        },
        customer: { attribution: { wasBoostAttributed: false } },
        boost: { activeOnSession: false },
      }),
    );
    // 3333 * 1500 / 10000 = 499.95 → floor = 499
    expect(result.commissionCents).toBe(499);
  });

  it("rounding: 101 cents @ 3500 bps = floor(35.35) = 35 (rounds down in partner's favor)", () => {
    const result = computeCommission(
      makeInput({
        basePriceCents: 101,
        customer: { attribution: null },
        boost: { activeOnSession: true },
      }),
    );
    // 101 * 3500 / 10000 = 35.35 → floor = 35
    expect(result.commissionCents).toBe(35);
  });
});
