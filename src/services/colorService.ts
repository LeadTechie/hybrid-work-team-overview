import type { ColorByOption } from '../stores/filterStore';

export type ColorCategory = ColorByOption;
type ColorAssignments = { [category: string]: { [value: string]: string } };

/**
 * Accessible 12-color base palette (WCAG AA compliant, colorblind-friendly).
 * These colors have sufficient contrast and are distinguishable for common
 * forms of color vision deficiency.
 */
const BASE_PALETTE = [
  '#2563EB', // blue-600
  '#DC2626', // red-600
  '#16A34A', // green-600
  '#F59E0B', // amber-500
  '#9333EA', // purple-600
  '#0891B2', // cyan-600
  '#EA580C', // orange-600
  '#EC4899', // pink-500
  '#65A30D', // lime-600
  '#475569', // slate-600
  '#7C3AED', // violet-600
  '#059669', // emerald-600
];

const STORAGE_KEY = 'hwto-color-assignments';

/**
 * Convert hex color to HSL values.
 */
function hexToHsl(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL values to hex color.
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * ColorService manages dynamic color assignments for categories (team, department, office).
 *
 * Features:
 * - Assigns colors from an accessible base palette
 * - Generates shade variants when palette is exhausted
 * - Persists assignments in localStorage across sessions
 * - Same category value always gets the same color within a session
 */
class ColorService {
  private assignments: ColorAssignments = {};

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get the color assigned to a category value.
   * If the value hasn't been assigned a color yet, assigns one from the palette.
   */
  getColor(category: ColorCategory, value: string): string {
    if (!value) {
      return '#6B7280'; // gray-500 fallback for empty values
    }

    // Initialize category if needed
    if (!this.assignments[category]) {
      this.assignments[category] = {};
    }

    // Return existing assignment
    if (this.assignments[category][value]) {
      return this.assignments[category][value];
    }

    // Assign new color
    const color = this.assignNextColor(category);
    this.assignments[category][value] = color;
    this.saveToStorage();

    return color;
  }

  /**
   * Get all color assignments for a category.
   */
  getAllColors(category: ColorCategory): Map<string, string> {
    const categoryAssignments = this.assignments[category] || {};
    return new Map(Object.entries(categoryAssignments));
  }

  /**
   * Assign the next available color from the palette.
   * When base palette is exhausted, generates shade variants.
   */
  private assignNextColor(category: ColorCategory): string {
    const usedColors = new Set(Object.values(this.assignments[category] || {}));

    // Try to find an unused base palette color
    for (const color of BASE_PALETTE) {
      if (!usedColors.has(color)) {
        return color;
      }
    }

    // All base colors used - generate shade variants
    const usedCount = usedColors.size;
    const baseIndex = usedCount % BASE_PALETTE.length;
    const shadeIndex = Math.floor(usedCount / BASE_PALETTE.length);

    return this.generateShade(BASE_PALETTE[baseIndex], shadeIndex);
  }

  /**
   * Generate a shade variant of a base color.
   * Alternates between lighter and darker adjustments.
   */
  private generateShade(baseColor: string, shadeIndex: number): string {
    const [h, s, l] = hexToHsl(baseColor);

    // Alternate between lighter (+15%) and darker (-15%)
    // shadeIndex 1 -> +15%, shadeIndex 2 -> -15%, shadeIndex 3 -> +30%, etc.
    const direction = shadeIndex % 2 === 1 ? 1 : -1;
    const magnitude = Math.ceil(shadeIndex / 2) * 15;

    let newL = l + (direction * magnitude);
    // Clamp lightness between 20 and 80 for visibility
    newL = Math.max(20, Math.min(80, newL));

    return hslToHex(h, s, newL);
  }

  /**
   * Load color assignments from localStorage.
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.assignments = JSON.parse(stored);
      }
    } catch {
      // If parsing fails, start fresh
      this.assignments = {};
    }
  }

  /**
   * Save color assignments to localStorage.
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assignments));
    } catch {
      // localStorage might be full or disabled - continue without persistence
    }
  }
}

/**
 * Singleton instance of ColorService.
 * Use this for all color assignment operations.
 */
export const colorService = new ColorService();
