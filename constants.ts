import { Color, Face, ScanStep, CubeState } from './types';
// Updated configuration: Red=Left, Orange=Right (Custom Geometry). Timestamp: Date.now() + 1

export const INITIAL_CUBE_STATE: CubeState = {
  [Face.Front]: Array(9).fill(Color.Gray),
  [Face.Right]: Array(9).fill(Color.Gray),
  [Face.Back]: Array(9).fill(Color.Gray),
  [Face.Left]: Array(9).fill(Color.Gray),
  [Face.Up]: Array(9).fill(Color.Gray),
  [Face.Down]: Array(9).fill(Color.Gray),
};

export const COLOR_CYCLE = [Color.White, Color.Yellow, Color.Green, Color.Blue, Color.Red, Color.Orange];

export const COLOR_MAP: Record<Color, string> = {
  [Color.White]: '#ffffff',
  [Color.Yellow]: '#fbbf24', // Tailwind amber-400
  [Color.Green]: '#22c55e', // Tailwind green-500
  [Color.Blue]: '#3b82f6', // Tailwind blue-500
  [Color.Red]: '#ef4444', // Tailwind red-500
  [Color.Orange]: '#f97316', // Tailwind orange-500
  [Color.Gray]: '#374151', // Tailwind gray-700
};

// RGB values for direct pixel color matching
export const COLOR_RGB_MAP: Record<Color, [number, number, number]> = {
  [Color.White]: [255, 255, 255],
  [Color.Yellow]: [251, 191, 36],
  [Color.Green]: [34, 197, 94],
  [Color.Blue]: [59, 130, 246],
  [Color.Red]: [239, 68, 68],
  [Color.Orange]: [249, 115, 22],
  [Color.Gray]: [55, 65, 81],
};

// Human readable labels (min2phase standard: U=White, D=Yellow, F=Green, B=Blue, R=Orange, L=Red)
export const FACE_LABELS: Record<Face, string> = {
  [Face.Front]: 'Front (Green)',
  [Face.Right]: 'Right (Orange)',
  [Face.Back]: 'Back (Blue)',
  [Face.Left]: 'Left (Red)',
  [Face.Up]: 'Top (White)',
  [Face.Down]: 'Bottom (Yellow)',
};

// Determine Face by Center Sticker Color
export const CENTER_COLOR_TO_FACE: Record<Color, Face> = {
  [Color.Green]: Face.Front,
  [Color.Red]: Face.Left,
  [Color.Blue]: Face.Back,
  [Color.Orange]: Face.Right,
  [Color.White]: Face.Up,
  [Color.Yellow]: Face.Down,
  [Color.Gray]: Face.Front, // Fallback
};

export const OPPOSITE_COLORS: Record<Color, Color> = {
  [Color.White]: Color.Yellow,
  [Color.Yellow]: Color.White,
  [Color.Green]: Color.Blue,
  [Color.Blue]: Color.Green,
  [Color.Red]: Color.Orange,
  [Color.Orange]: Color.Red,
  [Color.Gray]: Color.Gray,
};

// Defines the "right-hand rule" for a standard cube.
// Given a Front color and an Up color, it determines the Right color.
// Based on min2phase standard: White (U) on top, Green (F) in front.
// Fix: Changed type to Partial to allow for incomplete records, which matches the object's structure.
export const STANDARD_CORNER: Partial<Record<Color, Partial<Record<Color, Color>>>> = {
  [Color.Green]: { [Color.White]: Color.Red, [Color.Yellow]: Color.Orange, [Color.Orange]: Color.Yellow, [Color.Red]: Color.White },
  [Color.Blue]: { [Color.White]: Color.Orange, [Color.Yellow]: Color.Red, [Color.Orange]: Color.White, [Color.Red]: Color.Yellow },
  [Color.Red]: { [Color.White]: Color.Blue, [Color.Yellow]: Color.Green, [Color.Green]: Color.White, [Color.Blue]: Color.Yellow },
  [Color.Orange]: { [Color.White]: Color.Green, [Color.Yellow]: Color.Blue, [Color.Green]: Color.Yellow, [Color.Blue]: Color.White },
  [Color.White]: { [Color.Green]: Color.Orange, [Color.Blue]: Color.Red, [Color.Orange]: Color.Green, [Color.Red]: Color.Blue },
  [Color.Yellow]: { [Color.Green]: Color.Red, [Color.Blue]: Color.Orange, [Color.Orange]: Color.Blue, [Color.Red]: Color.Green },
};


// Adjacency Map: [CurrentFace][Direction] = TargetFace
// Defines which face you see if you rotate the cube in a direction
export const ADJACENCY: Record<Face, Partial<Record<'up' | 'right' | 'down' | 'left', Face>>> = {
  [Face.Front]: { up: Face.Up, right: Face.Right, down: Face.Down, left: Face.Left },
  [Face.Right]: { up: Face.Up, right: Face.Back, down: Face.Down, left: Face.Front },
  [Face.Back]: { up: Face.Up, right: Face.Left, down: Face.Down, left: Face.Right },
  [Face.Left]: { up: Face.Up, right: Face.Front, down: Face.Down, left: Face.Back },
  [Face.Up]: { up: Face.Back, right: Face.Right, down: Face.Front, left: Face.Left },
  [Face.Down]: { up: Face.Front, right: Face.Right, down: Face.Back, left: Face.Left },
};