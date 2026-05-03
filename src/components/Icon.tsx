import type { CSSProperties } from "react";

/**
 * Material Symbols Outlined wrapper.
 *
 * The font is loaded with the FILL axis enabled (see app/[locale]/layout.tsx).
 * Pass `filled` to render the solid variant of the same glyph instead of
 * shipping a separate `*_border` icon name. Examples:
 *   <Icon name="favorite" />              → outlined heart
 *   <Icon name="favorite" filled />       → filled heart
 *
 * Adding a new icon name? Append it to the `icon_names=` query string in
 * `app/[locale]/layout.tsx` so Google Fonts ships the glyph; otherwise the
 * literal text renders.
 */
export function Icon({
  name,
  className = "",
  filled = false,
  style,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
}) {
  const mergedStyle: CSSProperties | undefined = filled
    ? { fontVariationSettings: "'FILL' 1", ...(style ?? {}) }
    : style;

  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={mergedStyle}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
