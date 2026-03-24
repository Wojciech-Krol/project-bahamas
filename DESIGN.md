# Design System Document

## 1. Overview & Creative North Star

### The Creative North Star: "The Curated Prism"
This design system moves beyond the generic marketplace aesthetic to become a "Curated Prism." Like light passing through a glass element, the user experience shifts its "wavelength" based on the audience—Kids, Teens, or Adults—while remaining grounded in a single, premium architectural framework. 

The system rejects the "flat web" in favor of **Layered Editorialism**. We utilize intentional asymmetry, overlapping card components, and a sophisticated typography scale to create a sense of organized energy. By breaking the rigid 12-column grid with floating elements and soft, organic depth, we evoke a feeling of "friendly reliability" that feels custom-built rather than templated.

---

## 2. Colors

Our palette is anchored by the deep, intellectual 'Misty Blue' and the high-energy 'Crimson' (Tertiary), balanced by a sophisticated spectrum of neutrals.

### Tonal Archetypes
*   **Kids:** Dominant use of `secondary_container` and `tertiary_fixed`. Warm, high-key surfaces.
*   **Teens:** High-contrast application of `primary` against `surface_container_highest`. Vibrant, energetic pops of `tertiary`.
*   **Adults:** Restricted palette focusing on `primary_fixed_dim`, `secondary`, and `surface_low`. Muted, sophisticated tonal shifts.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders for sectioning are prohibited. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for sections sitting on a `surface` background to create natural separation.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Level 0:** `surface` (Base canvas)
*   **Level 1:** `surface_container_low` (Secondary content areas)
*   **Level 2:** `surface_container_lowest` (White cards/Interaction focal points)

### The "Glass & Gradient" Rule
To elevate beyond "out-of-the-box" UI, use **Glassmorphism** for floating headers or navigation overlays. 
*   **Value:** `surface` at 70% opacity with a `backdrop-blur` of 12px.
*   **Signature Textures:** Apply subtle linear gradients (e.g., `primary` #553ce2 to `primary_container` #6f59fc) to Hero CTAs. This creates a "glow" that flat hex codes cannot replicate.

---

## 3. Typography

The typographic system utilizes **Plus Jakarta Sans** for high-impact display moments and **Inter** for functional clarity.

*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, geometric flair. In "Adult" contexts, use lighter weights with increased letter spacing. In "Kids" contexts, use Bold weights to feel approachable and "bouncy."
*   **Body & Labels (Inter):** Set at 98% weight for a bespoke feel. Inter provides the "Reliable" pillar of the brand, ensuring legibility across dense class schedules.
*   **Hierarchy as Identity:** 
    *   *Kids:* `headline-lg` + `body-lg` (Prominent and clear).
    *   *Teens:* `display-sm` + `label-md` (Aggressive scale shifts).
    *   *Adults:* `headline-sm` + `body-md` (Refined and balanced).

---

## 4. Elevation & Depth

We reject traditional box-shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking containers. A card using `surface_container_lowest` (Pure White) sitting on a `surface_container_low` (Light Blue-Grey) creates a crisp, natural lift.
*   **Ambient Shadows:** For floating elements (e.g., a "Book Now" sticky bar), use extra-diffused shadows.
    *   *Spec:* `0px 12px 32px rgba(24, 28, 33, 0.06)`. The shadow color is a tint of `on_surface`, not pure black.
*   **The "Ghost Border" Fallback:** If a container requires more definition (e.g., in the "Teens" high-contrast mode), use a "Ghost Border": `outline_variant` at 15% opacity. Never use 100% opaque borders.
*   **Softened Geometry:** 
    *   **General:** `md` (0.75rem / 12px).
    *   **Kids:** `xl` (1.5rem / 24px) to emphasize playfulness.
    *   **Floating Elements:** `full` (9999px) for pill-shaped chips and search bars.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `full` roundedness, White text.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Tertiary (Crimson):** Reserved for "Urgent" or "Limited Spot" classes. Use `tertiary_container`.

### Cards (The Core Unit)
*   **Structure:** Cards must not have borders. Use `surface_container_lowest`.
*   **Spacing:** Use `8` (2rem) padding for internal content to allow the layout to "breathe." 
*   **Editorial Overlap:** For "Featured Classes," allow the class image to slightly bleed outside the card container or overlap the heading text to break the "boxed" feel.

### Input Fields
*   **Style:** `surface_container_high` background with a `md` corner radius. 
*   **States:** On focus, transition the background to `surface_container_lowest` and apply a "Ghost Border" of `primary` at 40% opacity.

### Selection Chips
*   **Behavior:** For filtering (Sports, Dance, etc.), use pill-shaped chips. 
*   **Interaction:** Unselected chips should blend into the background (`surface_container_low`). Selected chips "pop" using the `primary_fixed` color.

### Relevant App Components: **The Schedule Ghost**
Instead of a heavy grid for class times, use a vertical list where the time is set in `label-sm` (Inter) and the class name in `title-md`. Use `surface_container_low` background "blobs" to group morning, afternoon, and evening sessions without using lines.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use vertical white space (Spacing `12` or `16`) to separate major content blocks instead of horizontal rules.
*   **Do** mix "Kids" and "Adults" styles on the same page if the content is a "Family Yoga" class, favoring the "Kids" roundedness but "Adult" muted colors.
*   **Do** use backdrop blurs for "Sticky" navigation to keep the energetic colors of the site visible as the user scrolls.

### Don't:
*   **Don't** use pure black (#000000) for text. Use `on_surface` (#181c21) to maintain the "Misty" premium feel.
*   **Don't** use 1px solid dividers. If separation is needed, use a 4px gap with a background color shift.
*   **Don't** use the same corner radius for everything. Ensure the "Kids" section feels tangibly "rounder" (24px) than the "Adult" section (8px).
*   **Don't** center-align long-form text. Keep it left-aligned to maintain the editorial, "reliable" structure of a marketplace.