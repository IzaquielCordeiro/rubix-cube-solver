export enum Color {
  White = 'white',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Red = 'red',
  Orange = 'orange',
  Gray = 'gray' // Placeholder
}

export enum Face {
  Front = 'F',
  Right = 'R',
  Back = 'B',
  Left = 'L',
  Up = 'U',
  Down = 'D'
}

export interface CubeState {
  [Face.Front]: Color[];
  [Face.Right]: Color[];
  [Face.Back]: Color[];
  [Face.Left]: Color[];
  [Face.Up]: Color[];
  [Face.Down]: Color[];
}

export interface ScanStep {
  face: Face;
  label: string;
  centerColor: Color;
  instruction: string;
  upColor: Color;
  rotationInstruction?: string;
}

export interface SolutionStep {
  move: string;
  explanation: string;
}

export interface SolutionResponse {
  steps: SolutionStep[];
  isSolvable: boolean;
  message?: string;
  validationInfo?: {
    colorCounts: Record<Color, number>;
  };
}