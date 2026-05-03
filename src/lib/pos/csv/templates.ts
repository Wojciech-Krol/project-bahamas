/**
 * Header-only CSV templates served via the partner integrations
 * upload UI. The headers must stay in sync with `schema.ts`.
 */

import type { ResourceType } from "./schema";

const TEMPLATES: Record<ResourceType, string> = {
  sessions: [
    "external_id,activity_external_id,instructor_external_id,starts_at,ends_at,capacity,spots_left,price_pln,currency,status",
    "SES-001,CLS-yoga-flow,INS-anna,2026-05-15 18:00,2026-05-15 19:00,12,8,50.00,PLN,scheduled",
  ].join("\n") + "\n",

  activities: [
    "external_id,name,description,category,duration_minutes,capacity,level,language",
    'CLS-yoga-flow,Yoga Flow,"Dynamiczna joga dla średniozaawansowanych",wellness,60,12,intermediate,pl',
  ].join("\n") + "\n",

  instructors: [
    "external_id,name,bio,photo_url",
    'INS-anna,Anna Kowalska,"Certyfikowana instruktorka jogi Vinyasa",https://example.com/anna.jpg',
  ].join("\n") + "\n",

  pricing: [
    "external_id,name,rule_type,price_pln,pass_count,validity_days,applies_to_activity_external_ids",
    'PRC-10pack,Karnet 10 wejść,pass_count,400.00,10,90,"CLS-yoga-flow,CLS-yoga-yin"',
  ].join("\n") + "\n",
};

export function csvTemplate(resource: ResourceType): string {
  return TEMPLATES[resource];
}
