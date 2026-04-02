# Design System Specification: The Organic Curator

## 1. Overview & Creative North Star
The "Organic Curator" is the creative North Star for this design system. We are moving away from the "generic real estate portal" and toward a high-end editorial experience. The goal is to make finding a home feel like browsing an architectural digest—calm, intentional, and authoritative.

To achieve this, we reject the rigid, boxed-in layouts of traditional web apps. Instead, we embrace **Soft Minimalism**: a philosophy that prioritizes breathing room, intentional asymmetry, and tonal depth. We use the brand's earthy palette to create a sense of "grounded trust," utilizing layered surfaces rather than structural lines to guide the eye.

---

## 2. Colors & Surface Philosophy
The palette is rooted in nature, designed to feel premium and stable. 

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Boundaries must be created through background color shifts. A section should sit on `surface` (#f9faf5), while a featured area or card might sit on `surface-container-low` (#f3f4ef). This creates a seamless, high-end feel.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-weight paper.
- **Base Layer:** `surface` (#f9faf5) – The canvas.
- **Sectioning:** `surface-container-low` (#f3f4ef) – For large background blocks.
- **Interactive Elements:** `surface-container-lowest` (#ffffff) – Used for cards to make them "pop" against the background without shadows.

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating headers or navigation bars. Apply a `surface` color at 80% opacity with a `backdrop-filter: blur(12px)`. For main CTAs, use a subtle linear gradient from `tertiary` (#944600) to `on_tertiary_container` (#fffbff) at a 45-degree angle to provide "soul" and depth.

---

## 3. Typography: The Editorial Voice
We use typography as a layout element, not just for legibility.

- **Display & Headlines (Poppins/Inter):** Use `display-lg` for hero sections with tight letter-spacing (-0.02em). Headlines should feel like title cards in a gallery—authoritative and clean.
- **Body & Labels (Inter/Roboto):** Use `body-md` for general descriptions. Set line-height to 1.6 to ensure the "Modern & Clean" aesthetic is maintained through whitespace.
- **The Contrast Rule:** Pair a `display-md` headline in `on_surface` (#1a1c19) with a `label-md` in `on_secondary_fixed_variant` (#324e14) to create immediate hierarchy and sophistication.

---

## 4. Elevation & Depth
In this system, depth is felt, not seen.

### The Layering Principle
Achieve hierarchy by "stacking" container tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that feels modern and architectural.

### Ambient Shadows
When a "floating" effect is mandatory (e.g., a modal or a floating action button):
- **Blur:** 24px - 40px.
- **Opacity:** 4% - 6%.
- **Color:** Use a tinted shadow based on `primary` (#575e55) rather than pure black to keep the lighting natural.

### The "Ghost Border" Fallback
If a border is required for accessibility, it must be a **Ghost Border**: use `outline-variant` (#c4c8b9) at 20% opacity. 100% opaque borders are strictly prohibited as they break the "Organic" feel.

---

## 5. Components & Primitives

### Buttons
- **Primary:** Background `secondary` (#49672a), Text `on_secondary` (#ffffff). Radius: `10px`. 
- **CTA:** Background `tertiary` (#944600), Text `on_tertiary` (#ffffff). Reserved for "Book Now" or "Contact Agent."
- **Tertiary (Ghost):** No background. Text `primary` (#575e55). Use for secondary actions like "View Map."

### Input Fields
- **Style:** Background `surface_container_highest` (#e2e3de), Radius `8px`.
- **States:** On focus, transition the background to `surface_container_lowest` (#ffffff) with a 2px `secondary` (#49672a) "Ghost Border" (20% opacity).

### Cards & Property Listings
- **Rule:** Forbid divider lines. Use `spacing-6` (1.5rem) to separate content.
- **Visuals:** Use high-quality imagery with `radius-lg` (1rem). Property details (price, location) should use `title-md` for the price and `label-sm` for the location to create an editorial look.

### Search & Filters (Context-Specific)
- **The Filter Bar:** Use a glassmorphic background with `backdrop-blur`. Selection chips should use `secondary_container` (#caeea2) for active states and `surface_variant` (#e2e3de) for inactive states.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use asymmetrical layouts for image galleries (e.g., one large image paired with two smaller stacked images) to feel "Custom."
- **Do** use `spacing-20` (5rem) between major sections to let the design breathe.
- **Do** use Lucide icons with a 1.5px stroke width to match the Inter typography weight.

### Don’t:
- **Don’t** use pure black (#000000) for text. Always use `on_surface` (#1a1c19).
- **Don’t** use standard 1px dividers. If you must separate content, use a subtle shift in background color or a wide gap of whitespace.
- **Don’t** use sharp corners. Every element must adhere to the defined `Roundedness Scale` to maintain the "Organic" persona.