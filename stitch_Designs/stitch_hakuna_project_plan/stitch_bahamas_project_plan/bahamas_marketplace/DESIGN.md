# Hakuna Design System — "Electric Depths"

A dark-mode, neon-accented design system for a Bahamas activity marketplace. The aesthetic is cinematic depth — think dark water at night with bioluminescent light cutting through. Not a gaming site, not a SaaS dashboard. A marketplace that feels alive.

---

## 1. Brand Personality

**Core tension:** Premium + Playful. The dark canvas gives weight and authority. The neon-cyan and violet accents inject energy without screaming. The result should feel like a high-end nightlife venue that also welcomes families — exclusive but not exclusionary.

**Three words:** Electric. Curated. Warm.

---

## 2. Color System

### Primary Palette

| Role | Token | Hex | When to use |
|------|-------|-----|-------------|
| **Cyan** (Primary) | `--c-primary` | `#00F2FF` | Hero CTAs, active states, primary links, focus rings, "this is clickable" |
| **Violet** (Brand) | `--c-violet` | `#7B61FF` | Brand marks, secondary buttons, navigation accent, card highlights |
| **Violet Deep** | `--c-violet-deep` | `#553CE2` | Gradient endpoints, pressed states, navbar active |
| **Magenta** (Accent) | `--c-accent` | `#FF00E6` | Sparingly — urgency tags ("Limited!"), notification dots, sale pricing. Max 2 uses per screen. |
| **Lime** (Signal) | `--c-signal` | `#CCFF00` | Success confirmations, "booked" badges, positive metrics. Never as a button color. |

### Surfaces — The Depth Stack

Dark mode needs layers, not flatness. Build depth through background shifts, not shadows.

| Level | Token | Hex | Usage |
|-------|-------|-----|-------|
| **Abyss** (L0) | `--c-bg` | `#0A0514` | Page background, the deepest layer |
| **Deep** (L1) | `--c-surface-1` | `#110B24` | Section backgrounds, sidebar, nav areas |
| **Mid** (L2) | `--c-surface-2` | `#1A1233` | Cards, elevated containers, modals |
| **Raised** (L3) | `--c-surface-3` | `#241A45` | Hover states on cards, active table rows, dropdown menus |
| **Glass** | `--c-glass` | `#1A1233` at 60% + `backdrop-blur: 16px` | Floating nav, sticky headers, overlays |

### Text — Never Pure White

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | `--c-text` | `#F0ECF9` | Headlines, primary body. Warm off-white with violet tint. |
| **Secondary** | `--c-text-muted` | `#A099B8` | Descriptions, secondary info, metadata |
| **Faint** | `--c-text-faint` | `#5F5580` | Timestamps, disabled labels, placeholders |
| **On-Accent** | `--c-text-on-accent` | `#0A0514` | Text on cyan/lime backgrounds (dark on light) |

### Semantic Colors

| Role | Hex | When |
|------|-----|------|
| Success | `#22C55E` | Booking confirmed, available slots |
| Warning | `#F59E0B` | Almost full, payment pending |
| Error | `#EF4444` | Booking failed, form errors |
| Info | `#7B61FF` (violet) | Tips, help text, onboarding |

### Gradients — Use With Restraint

- **Hero CTA:** `linear-gradient(135deg, #553CE2, #00F2FF)` — violet to cyan. The signature.
- **Feature highlight:** `linear-gradient(180deg, #1A1233 0%, #0A0514 100%)` — subtle depth fade on sections.
- **Glow effect:** `radial-gradient(ellipse at center, #00F2FF15 0%, transparent 70%)` — ambient background glow behind hero content. Radius max 600px.
- **NEVER** use gradient as a card background. Cards are flat `surface-2`.

---

## 3. Typography

Two fonts. No exceptions.

| Role | Font | Weight | Size Range | Line Height | Tracking |
|------|------|--------|------------|-------------|----------|
| **Display** | Plus Jakarta Sans | 800 | 48–72px | 1.05–1.1 | -0.03em |
| **H1** | Plus Jakarta Sans | 700 | 36–48px | 1.15 | -0.02em |
| **H2** | Plus Jakarta Sans | 700 | 28–36px | 1.2 | -0.015em |
| **H3** | Plus Jakarta Sans | 600 | 20–24px | 1.25 | -0.01em |
| **Body** | Inter | 400 | 16px | 1.6 | 0 |
| **Body Small** | Inter | 400 | 14px | 1.5 | 0 |
| **Label** | Inter | 600 | 12px | 1.3 | 0.06em (uppercase) |
| **Caption** | Inter | 400 | 12px | 1.4 | 0.01em |

**Rules:**
- Body text max-width: `65ch`. No wall-of-text.
- Headlines are left-aligned by default. Center only in isolated hero sections.
- Labels are ALWAYS uppercase with letter-spacing.

### Audience-Adaptive Typography

- **Kids sections:** H2 at Bold 800, body at 18px. Bigger, bouncier.
- **Teens sections:** Display font, tight tracking (-0.03em), italic for energy.
- **Adults sections:** H2 at SemiBold 600, body at 16px. Quieter, more refined.

---

## 4. Shape — Mixed, Not Uniform

Pill-shaped everything is slop. Mix radii intentionally.

| Element | Radius | Why |
|---------|--------|-----|
| Primary buttons | `9999px` (pill) | Max affordance for "click me" |
| Secondary buttons | `12px` | Clearly secondary, less playful |
| Cards (standard) | `20px` | Soft, approachable |
| Cards (featured/hero) | `32px` | Premium, editorial |
| Input fields | `12px` | Functional objects, not decorative |
| Chips / Tags | `9999px` (pill) | Small, scannable |
| Avatars | `50%` (circle) | People are round |
| Image containers | `16px` | Consistent media framing |
| Modals / Drawers | `24px` top corners | Anchored to bottom/edge |
| Data tables | `8px` | Data = sharp = serious |

---

## 5. Spacing

Base unit: **4px**. Every spacing value is a multiple.

| Token | Value | Typical Usage |
|-------|-------|---------------|
| `--sp-1` | 4px | Icon-text gaps |
| `--sp-2` | 8px | Chip padding, tight lists |
| `--sp-3` | 12px | Input padding, compact card guts |
| `--sp-4` | 16px | Standard component padding |
| `--sp-6` | 24px | Card inner padding (minimum 24px) |
| `--sp-8` | 32px | Section internal gaps |
| `--sp-10` | 40px | Between card groups |
| `--sp-12` | 48px | Standard section padding |
| `--sp-16` | 64px | Major section breaks |
| `--sp-20` | 80px | Hero sections, page top/bottom |
| `--sp-24` | 96px | Dramatic breathing room |

**Variance rule:** Not every section gets the same padding. Hero = `--sp-20`. Dense listing grids = `--sp-12`. Footer = `--sp-16`.

---

## 6. Elevation & Depth

In dark mode, shadows are nearly invisible. Use **glow and surface color shifts** instead.

| Level | Method | Spec |
|-------|--------|------|
| **Flat** | No elevation | Base surface color only |
| **Raised** | Surface color shift | Card uses `surface-2` on `surface-1` background |
| **Hover lift** | Brighter surface + subtle glow | `surface-3` + `0 0 0 1px #7B61FF20` border glow |
| **Floating** | Glass + shadow | `backdrop-blur: 16px` + `0 8px 32px rgba(0,0,0,0.4)` |
| **Modal** | Overlay | `bg-black/60` backdrop + glass card + `0 24px 64px rgba(0,0,0,0.5)` |

**Glow accents:** For highlighted cards (featured class, top-rated), add a `box-shadow: 0 0 40px #00F2FF10` — extremely subtle cyan ambient glow. Not a neon border.

---

## 7. Interaction States

Every interactive element needs all four states defined.

| Element | Default | Hover | Focus | Active |
|---------|---------|-------|-------|--------|
| **Primary CTA** | Gradient fill (violet→cyan), white text | Brightness 1.1, scale 1.02 | 3px ring `--c-primary` at 50% | Scale 0.97, brightness 0.9 |
| **Secondary Button** | `surface-2` bg, `text` color, 1px `#7B61FF30` border | bg → `surface-3`, border → `#7B61FF60` | 3px ring `--c-violet` at 40% | Scale 0.97 |
| **Ghost Button** | Transparent bg, `text-muted` color | Text → `primary`, subtle underline | Ring `primary` | Text → white |
| **Card** | `surface-2` bg | bg → `surface-3`, translate-Y -2px, glow border | Ring `primary` at 20% | — |
| **Link** | `--c-primary` color | Brightness 1.2, underline-offset 4px | Outline 2px `primary` | — |
| **Input** | `surface-2` bg, `text-faint` placeholder | — | Border `primary` at 60%, bg → `surface-1` | — |
| **Chip (unselected)** | `surface-2` bg, `text-muted` | bg → `surface-3` | Ring `violet` | — |
| **Chip (selected)** | `violet` bg, `text-on-accent` | Brightness 1.1 | Ring `violet` | — |

**Transition timing:** `150ms ease-out` for color/opacity. `250ms ease` for transforms and shadows.

---

## 8. Component Rules

### Buttons
- **One primary CTA per viewport.** If there are two gradient buttons visible at the same time, one of them is wrong.
- Primary = gradient pill. Secondary = bordered rectangle. Ghost = text-only. Don't invent a fourth.

### Cards
- **No borders on dark mode cards.** Surface color shift handles separation.
- Inner padding: minimum `24px`.
- Featured cards get the `32px` radius and an optional ambient glow.
- Class images bleed to card edges (no inner padding on the image).

### Navigation
- Sticky top. Glass effect (`surface-1` at 60% + blur 16px).
- Active link has a `--c-primary` bottom indicator (2px line, not a background block).
- Mobile: bottom nav bar, not a hamburger menu.

### Input Fields
- Background: `surface-2`. Rounded `12px`.
- On focus: border transitions to `primary` at 60% opacity. Background darkens to `surface-1`.
- Error state: border `error` + helper text below in `error` color.
- No floating labels. Standard label-above-input pattern.

---

## 9. Do's and Don'ts

### Do:
- **Do** let neon colors breathe — surround them with dark space, not other colors.
- **Do** use `text-faint` (#5F5580) for secondary metadata — it creates depth without visual noise.
- **Do** vary section padding. A hero needs 80px+ breathing room. A dense class grid can be tighter at 48px.
- **Do** use the gradient CTA exactly once above the fold. It's the hero moment, not wallpaper.
- **Do** make the cyan primary feel like a reward — use it for the action the user came for.

### Don't:
- **Don't** put cyan text on violet background or vice versa. Neon-on-neon = unreadable.
- **Don't** use magenta (#FF00E6) as a button color. It's a signal, not an action.
- **Don't** use pure white (#FFFFFF) for anything. `#F0ECF9` max.
- **Don't** use pure black (#000000) shadows. Tint shadows with the background color.
- **Don't** make every card glow. Ambient glow is for featured/highlighted items only (max 1–2 per view).
- **Don't** center long text blocks. Left-align body copy always.
- **Don't** use the same border-radius everywhere. The variance IS the design.

---

## 10. Responsive Strategy

| Breakpoint | Width | Layout Shifts |
|------------|-------|---------------|
| `mobile` | < 640px | Single column, bottom nav, stacked cards, hero text scales to 36px |
| `tablet` | 640–1024px | 2-column grids, side nav optional, hero 48px |
| `desktop` | > 1024px | 3-column grids, full nav, hero 56–72px |
| `wide` | > 1280px | Max container width `1280px`, centered with extra breathing room |

**Touch targets:** 44×44px minimum on mobile. No exception.
**Scroll behavior:** `scroll-behavior: smooth` globally. Sections snap on mobile for browsing.