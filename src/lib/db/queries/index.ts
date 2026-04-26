/**
 * Barrel export for the DB query layer. Import from `@/src/lib/db/queries`
 * instead of reaching into the individual files — that way the seam swap in
 * a later phase stays a one-line change per page.
 */

export {
  getActivityById,
  getClosestActivities,
  getFilteredActivities,
  getSearchResults,
  type ActivityFilters,
} from "./activities";
export { getVenueById } from "./venues";
export {
  getReviews,
  getReviewsByActivity,
  getReviewsByVenue,
  getReviewsForPartner,
  type PartnerReview,
} from "./reviews";
export { getUpcomingSessionsByActivity, getSessionById } from "./sessions";
export {
  getBookingById,
  getBookingsByPartner,
  type BookingDetail,
  type PartnerBookingRow_UI,
} from "./bookings";
export {
  getActivitiesByPartner,
  getPartnerActivityById,
  getPartnerActivityRawById,
  getPartnerVenueRawById,
  getVenuesByPartner,
  type PartnerActivity,
  type PartnerActivityRaw,
  type PartnerVenue,
  type PartnerVenueRaw,
} from "./partner";
