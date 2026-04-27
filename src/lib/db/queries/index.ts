/**
 * Barrel export for the DB query layer. Import from `@/src/lib/db/queries`
 * instead of reaching into the individual files — that way the seam swap in
 * a later phase stays a one-line change per page.
 */

export {
  getActivitiesByCategoryAndCity,
  getActivitiesByCategoryAndNeighborhood,
  getActivityById,
  getActivityBySlug,
  getClosestActivities,
  getFilteredActivities,
  getSearchResults,
  type ActivityFilters,
} from "./activities";
export { getVenueById, getVenueBySlug } from "./venues";
export {
  getReviews,
  getReviewsByActivity,
  getReviewsByVenue,
  getReviewsForPartner,
  type PartnerReview,
} from "./reviews";
export { getUpcomingSessionsByActivity, getSessionById } from "./sessions";
export {
  getCurriculumByActivity,
  getCurriculumRawByActivity,
  getInstructorsByActivity,
  getInstructorsRawByActivity,
  type CurriculumItem,
  type CurriculumItemRaw,
  type InstructorEntry,
  type InstructorEntryRaw,
} from "./activityContent";
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
  getPartnerMembers,
  getPartnerProfile,
  getPartnerVenueRawById,
  getVenuesByPartner,
  type PartnerActivity,
  type PartnerActivityRaw,
  type PartnerMember,
  type PartnerProfile,
  type PartnerVenue,
  type PartnerVenueRaw,
} from "./partner";
