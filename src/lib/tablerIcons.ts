import type { IconifyIcon } from "@iconify/types";

// Per-icon imports — bundler tree-shakes only the icons referenced here.
// Add new icons by importing them from @iconify-icons/tabler/<name> and
// registering them in the TABLER map below.
import yoga from "@iconify-icons/tabler/yoga";
import ballTennis from "@iconify-icons/tabler/ball-tennis";
import ballFootball from "@iconify-icons/tabler/ball-football";
import ballBasketball from "@iconify-icons/tabler/ball-basketball";
import ballVolleyball from "@iconify-icons/tabler/ball-volleyball";
import swimming from "@iconify-icons/tabler/swimming";
import mountain from "@iconify-icons/tabler/mountain";
import boxingPunch from "@iconify-icons/tabler/target";
import run from "@iconify-icons/tabler/run";
import palette from "@iconify-icons/tabler/palette";
import music from "@iconify-icons/tabler/music";
import camera from "@iconify-icons/tabler/camera";
import toolsKitchen2 from "@iconify-icons/tabler/tools-kitchen-2";
import guitarPick from "@iconify-icons/tabler/guitar-pick";
import buildingSkyscraper from "@iconify-icons/tabler/building-skyscraper";
import trees from "@iconify-icons/tabler/trees";
import coffee from "@iconify-icons/tabler/coffee";
import usersGroup from "@iconify-icons/tabler/users-group";
import buildingCastle from "@iconify-icons/tabler/building-castle";
import bolt from "@iconify-icons/tabler/bolt";
import calendar from "@iconify-icons/tabler/calendar";
import calendarEvent from "@iconify-icons/tabler/calendar-event";
import calendarWeek from "@iconify-icons/tabler/calendar-due";
import calendarStats from "@iconify-icons/tabler/calendar-stats";
import calendarMonth from "@iconify-icons/tabler/calendar-pin";
import mapPin from "@iconify-icons/tabler/map-pin";
import bike from "@iconify-icons/tabler/bike";
import skiJumping from "@iconify-icons/tabler/snowflake";
import barbell from "@iconify-icons/tabler/barbell";
import lock from "@iconify-icons/tabler/lock";
import bold from "@iconify-icons/tabler/bold";
import italic from "@iconify-icons/tabler/italic";
import underline from "@iconify-icons/tabler/underline";
import heading from "@iconify-icons/tabler/heading";
import list from "@iconify-icons/tabler/list";
import link from "@iconify-icons/tabler/link";
import photoPlus from "@iconify-icons/tabler/photo-plus";
import cloudUpload from "@iconify-icons/tabler/cloud-upload";
import eye from "@iconify-icons/tabler/eye";
import deviceFloppy from "@iconify-icons/tabler/device-floppy";
import edit from "@iconify-icons/tabler/edit";
import send from "@iconify-icons/tabler/send";
import article from "@iconify-icons/tabler/article";
import buildingStore from "@iconify-icons/tabler/building-store";
import menu2 from "@iconify-icons/tabler/menu-2";
import x from "@iconify-icons/tabler/x";
import logout from "@iconify-icons/tabler/logout";
import arrowLeft from "@iconify-icons/tabler/arrow-left";
import plus from "@iconify-icons/tabler/plus";

export const TABLER: Record<string, IconifyIcon> = {
  yoga,
  "ball-tennis": ballTennis,
  "ball-football": ballFootball,
  "ball-basketball": ballBasketball,
  "ball-volleyball": ballVolleyball,
  swimming,
  mountain,
  "boxing-punch": boxingPunch,
  run,
  palette,
  music,
  camera,
  "tools-kitchen-2": toolsKitchen2,
  "guitar-pick": guitarPick,
  "building-skyscraper": buildingSkyscraper,
  trees,
  coffee,
  "users-group": usersGroup,
  "building-castle": buildingCastle,
  bolt,
  calendar,
  "calendar-event": calendarEvent,
  "calendar-week": calendarWeek,
  "calendar-stats": calendarStats,
  "calendar-month": calendarMonth,
  "map-pin": mapPin,
  bike,
  "ski-jumping": skiJumping,
  barbell,
  lock,
  bold,
  italic,
  underline,
  heading,
  list,
  link,
  "photo-plus": photoPlus,
  "cloud-upload": cloudUpload,
  eye,
  "device-floppy": deviceFloppy,
  edit,
  send,
  article,
  "building-store": buildingStore,
  "menu-2": menu2,
  x,
  logout,
  "arrow-left": arrowLeft,
  plus,
};

/**
 * Render an Iconify icon body as a standalone SVG string. Used for surfaces
 * that need raw HTML (e.g. Mapbox marker innerHTML) where React can't reach.
 */
export function tablerSvgString(name: string, color = "currentColor", size = 14): string {
  const icon = TABLER[name];
  if (!icon) return "";
  const w = icon.width ?? 24;
  const h = icon.height ?? 24;
  const body = icon.body.replace(/currentColor/g, color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}
