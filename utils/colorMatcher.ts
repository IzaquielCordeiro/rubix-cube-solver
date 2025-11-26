import { Color } from '../types';
import { COLOR_RGB_MAP } from '../constants';

/**
 * Converts an RGB color value to HSV.
 * r, g, b are in [0, 255]
 * Returns [h, s, v] where h is [0, 360], s is [0, 1], v is [0, 1]
 */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }

    return [h, s, v];
}

/**
 * Finds the closest standard Rubik's Cube color to a given RGB value using HSV.
 */
export const findClosestColor = (rgb: [number, number, number]): Color => {
    const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);

    // 1. Check for Grayscale (White, Gray/Black)
    // Low saturation usually means white or gray
    if (s < 0.25) {
        // High value = White
        if (v > 0.55) return Color.White;
        // Low value = Gray (shadows/black plastic)
        return Color.Gray;
    }

    // Very low value is likely black/gray regardless of saturation (dark shadows)
    if (v < 0.20) return Color.Gray;

    // 2. Check Hues for Colors
    // Red is tricky because it wraps around 0/360
    if (h >= 330 || h < 15) return Color.Red;
    if (h >= 15 && h < 45) return Color.Orange;
    if (h >= 45 && h < 85) return Color.Yellow;
    if (h >= 85 && h < 160) return Color.Green;
    if (h >= 160 && h < 280) return Color.Blue;
    if (h >= 280 && h < 330) return Color.Red; // Magenta-ish reds

    // Fallback: Use Euclidean distance in RGB as a safety net if HSV is ambiguous
    // (Should rarely be reached with the above ranges, but good for safety)
    let minDistance = Infinity;
    let closestColor: Color = Color.Gray;

    for (const color of Object.keys(COLOR_RGB_MAP) as Color[]) {
        if (color === Color.Gray) continue;
        const colorRgb = COLOR_RGB_MAP[color];
        const distance = Math.sqrt(
            Math.pow(rgb[0] - colorRgb[0], 2) +
            Math.pow(rgb[1] - colorRgb[1], 2) +
            Math.pow(rgb[2] - colorRgb[2], 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }

    return closestColor;
};