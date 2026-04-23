import type { CSSProperties } from "react";

/**
 * A "fill" is the visual that goes behind a region. It can be a plain color,
 * a two-color geometric pattern, or an image (pasted URL or chosen from the
 * preset gallery). Stored in Supabase as JSON inside the overrides JSONB map.
 *
 * Backward compatibility: a bare hex string is also accepted and treated as
 * a solid color — existing overrides from before the Fill type was added
 * continue to work unchanged.
 */
export type Fill =
  | string
  | { kind: "color"; value: string }
  | {
      kind: "pattern";
      pattern: "dots" | "stripes" | "grid";
      fg: string;
      bg: string;
      scale?: number;
    }
  | {
      kind: "image";
      url: string;
      size?: "cover" | "contain" | "tile";
    };

/** Curated image gallery — tap a tile to set that image as the region's fill. */
export type ImagePreset = { label: string; url: string };

export const IMAGE_PRESETS: ImagePreset[] = [
  { label: "Sunset Sky",  url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=70&auto=format&fit=crop" },
  { label: "Forest",      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=70&auto=format&fit=crop" },
  { label: "Ocean",       url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=70&auto=format&fit=crop" },
  { label: "Mountain",    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=70&auto=format&fit=crop" },
  { label: "Desert",      url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=70&auto=format&fit=crop" },
  { label: "Clouds",      url: "https://images.unsplash.com/photo-1544968737-45d7f35b5ad1?w=1200&q=70&auto=format&fit=crop" },
  { label: "Concrete",    url: "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200&q=70&auto=format&fit=crop" },
  { label: "Linen",       url: "https://images.unsplash.com/photo-1519074069390-98277fc02a5c?w=1200&q=70&auto=format&fit=crop" },
  { label: "Marble",      url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=70&auto=format&fit=crop" },
  { label: "Stars",       url: "https://images.unsplash.com/photo-1532798442725-41036acc7489?w=1200&q=70&auto=format&fit=crop" },
];

/** Turn a Fill into CSS properties ready to spread into style={{}}. */
export function fillStyle(fill: Fill | undefined, fallback: string): CSSProperties {
  if (fill == null) return { background: fallback };

  if (typeof fill === "string") return { background: fill };

  if (fill.kind === "color") return { background: fill.value };

  if (fill.kind === "pattern") {
    const fg = fill.fg;
    const bg = fill.bg;
    const scale = fill.scale ?? 14;
    if (fill.pattern === "dots") {
      return {
        backgroundColor: bg,
        backgroundImage: `radial-gradient(${fg} 1.8px, transparent 2.2px)`,
        backgroundSize: `${scale}px ${scale}px`,
      };
    }
    if (fill.pattern === "stripes") {
      const step = scale;
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${fg} 0 ${step / 2}px, ${bg} ${step / 2}px ${step}px)`,
      };
    }
    // grid
    return {
      backgroundColor: bg,
      backgroundImage: `linear-gradient(${fg} 1px, transparent 1px), linear-gradient(90deg, ${fg} 1px, transparent 1px)`,
      backgroundSize: `${scale + 6}px ${scale + 6}px`,
    };
  }

  if (fill.kind === "image") {
    if (fill.size === "tile") {
      return {
        backgroundImage: `url("${fill.url}")`,
        backgroundRepeat: "repeat",
      };
    }
    return {
      backgroundImage: `url("${fill.url}")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: fill.size ?? "cover",
    };
  }

  return { background: fallback };
}

/** Primary hex color for a fill (used where we need one flat color — e.g. borders). */
export function fillColor(fill: Fill | undefined, fallback: string): string {
  if (fill == null) return fallback;
  if (typeof fill === "string") return fill;
  if (fill.kind === "color") return fill.value;
  if (fill.kind === "pattern") return fill.bg;
  // For images, we don't know the dominant color — use the fallback (role color).
  return fallback;
}

/** True when the fill is an image — callers can suppress borders/shadows. */
export function fillIsImage(fill: Fill | undefined): boolean {
  return !!fill && typeof fill === "object" && fill.kind === "image";
}

/** True when the fill is a pattern. */
export function fillIsPattern(fill: Fill | undefined): boolean {
  return !!fill && typeof fill === "object" && fill.kind === "pattern";
}
