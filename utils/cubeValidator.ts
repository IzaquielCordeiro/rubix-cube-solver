import { CubeState, Color, Face } from '../types';
import { OPPOSITE_COLORS } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  colorCounts: Record<Color, number>;
}

// Maps the physical location of each sticker on an unfolded cube to its 3D piece.
// [face, index]
const PIECE_MAP = {
  // Corners (3 stickers each)
  corners: [
    { name: 'UFR', stickers: [[Face.Up, 8], [Face.Front, 2], [Face.Right, 0]] },
    { name: 'UFL', stickers: [[Face.Up, 6], [Face.Front, 0], [Face.Left, 2]] },
    { name: 'UBL', stickers: [[Face.Up, 0], [Face.Back, 2], [Face.Left, 0]] },
    { name: 'UBR', stickers: [[Face.Up, 2], [Face.Back, 0], [Face.Right, 2]] },
    { name: 'DFR', stickers: [[Face.Down, 2], [Face.Front, 8], [Face.Right, 6]] },
    { name: 'DFL', stickers: [[Face.Down, 0], [Face.Front, 6], [Face.Left, 8]] },
    { name: 'DBL', stickers: [[Face.Down, 6], [Face.Back, 8], [Face.Left, 6]] },
    { name: 'DBR', stickers: [[Face.Down, 8], [Face.Back, 6], [Face.Right, 8]] },
  ],
  // Edges (2 stickers each)
  edges: [
    { name: 'UF', stickers: [[Face.Up, 7], [Face.Front, 1]] },
    { name: 'UL', stickers: [[Face.Up, 3], [Face.Left, 1]] },
    { name: 'UB', stickers: [[Face.Up, 1], [Face.Back, 1]] },
    { name: 'UR', stickers: [[Face.Up, 5], [Face.Right, 1]] },
    { name: 'DF', stickers: [[Face.Down, 1], [Face.Front, 7]] },
    { name: 'DL', stickers: [[Face.Down, 3], [Face.Left, 7]] },
    { name: 'DB', stickers: [[Face.Down, 7], [Face.Back, 7]] },
    { name: 'DR', stickers: [[Face.Down, 5], [Face.Right, 7]] },
    { name: 'FR', stickers: [[Face.Front, 5], [Face.Right, 3]] },
    { name: 'FL', stickers: [[Face.Front, 3], [Face.Left, 5]] },
    { name: 'BR', stickers: [[Face.Back, 3], [Face.Right, 5]] },
    { name: 'BL', stickers: [[Face.Back, 5], [Face.Left, 3]] },
  ]
};

export const countStickers = (state: CubeState): Record<Color, number> => {
  const colorCounts: Record<Color, number> = {
    [Color.White]: 0, [Color.Yellow]: 0, [Color.Green]: 0,
    [Color.Blue]: 0, [Color.Red]: 0, [Color.Orange]: 0, [Color.Gray]: 0,
  };

  for (const face of Object.values(Face)) {
    for (const color of state[face]) {
      colorCounts[color]++;
    }
  }
  return colorCounts;
};

export const validateCubeState = (state: CubeState): ValidationResult => {
  // AUTO-DETECT: Check if this cube has Red/Orange swapped (non-standard orientation)
  // min2phase standard: Right=Orange, Left=Red
  // Some physical cubes: Right=Red, Left=Orange
  const rightCenter = state[Face.Right][4];
  const leftCenter = state[Face.Left][4];
  const needsRedOrangeSwap = (rightCenter === Color.Red && leftCenter === Color.Orange);

  // Helper function to get effective color (with swap if needed)
  const getEffectiveColor = (color: Color): Color => {
    if (!needsRedOrangeSwap) return color;
    if (color === Color.Red) return Color.Orange;
    if (color === Color.Orange) return Color.Red;
    return color;
  };

  // 1. Count all stickers
  const colorCounts = countStickers(state);

  // Check for unscanned faces
  if (colorCounts[Color.Gray] > 0) {
    console.error('VALIDATION_FAILED: Unscanned stickers', colorCounts[Color.Gray]);
    return {
      isValid: false,
      message: `${colorCounts[Color.Gray]} sticker(s) have not been scanned.`,
      colorCounts,
    };
  }

  // Check if each color has exactly 9 stickers
  for (const color of Object.values(Color)) {
    if (color !== Color.Gray && colorCounts[color] !== 9) {
      console.error('VALIDATION_FAILED: Incorrect sticker count', { color, count: colorCounts[color] });
      return {
        isValid: false,
        message: 'Incorrect number of stickers for one or more colors.',
        colorCounts,
      };
    }
  }

  // 2. Check for impossible pieces (edges and corners)
  // Apply color swap if needed before checking

  // Check Edges
  for (const edge of PIECE_MAP.edges) {
    const rawColor1 = state[edge.stickers[0][0]][edge.stickers[0][1]];
    const rawColor2 = state[edge.stickers[1][0]][edge.stickers[1][1]];
    const color1 = getEffectiveColor(rawColor1);
    const color2 = getEffectiveColor(rawColor2);
    // console.log(`Checking Edge ${edge.name}: ${color1} vs ${color2} (Opposite of ${color1} is ${OPPOSITE_COLORS[color1]})`);
    if (OPPOSITE_COLORS[color1] === color2) {
      console.error('VALIDATION_FAILED: Impossible edge', { edge: edge.name, colors: [rawColor1, rawColor2] });
      return {
        isValid: false,
        message: `Impossible edge piece found with opposite colors: ${rawColor1} and ${rawColor2}.`,
        colorCounts,
      };
    }
  }

  // Check Corners
  for (const corner of PIECE_MAP.corners) {
    const rawColor1 = state[corner.stickers[0][0]][corner.stickers[0][1]];
    const rawColor2 = state[corner.stickers[1][0]][corner.stickers[1][1]];
    const rawColor3 = state[corner.stickers[2][0]][corner.stickers[2][1]];
    const color1 = getEffectiveColor(rawColor1);
    const color2 = getEffectiveColor(rawColor2);
    const color3 = getEffectiveColor(rawColor3);
    if (OPPOSITE_COLORS[color1] === color2 || OPPOSITE_COLORS[color1] === color3 || OPPOSITE_COLORS[color2] === color3) {
      console.error('VALIDATION_FAILED: Impossible corner', { corner: corner.name, colors: [rawColor1, rawColor2, rawColor3] });
      return {
        isValid: false,
        message: `Impossible corner piece found with opposite colors. (${rawColor1}, ${rawColor2}, ${rawColor3})`,
        colorCounts,
      };
    }
  }

  console.log('VALIDATION_PASSED:', needsRedOrangeSwap ? 'Non-standard Red/Orange orientation detected' : 'Standard orientation');
  return {
    isValid: true,
    message: needsRedOrangeSwap
      ? 'Cube state is valid (non-standard Red/Orange orientation detected and handled).'
      : 'Cube state is valid.',
    colorCounts,
  };
};