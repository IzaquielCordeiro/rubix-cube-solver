import min2phase from 'min2phase.js';
import { Color, CubeState, Face, SolutionResponse, SolutionStep } from '../types';
import { validateCubeState } from '../utils/cubeValidator';

// Initialize the solver
try {
  min2phase.initFull();
  console.log('min2phase initialized successfully');
} catch (e) {
  console.error('Failed to initialize min2phase:', e);
}

const COLOR_TO_FACE_CHAR: Record<Color, string> = {
  [Color.White]: 'U',
  [Color.Yellow]: 'D',
  [Color.Green]: 'F',
  [Color.Blue]: 'B',
  [Color.Red]: 'R',
  [Color.Orange]: 'L',
  [Color.Gray]: 'U' // Fallback
};

/**
 * Convert our CubeState format to min2phase Kociemba format
 * min2phase expects a string of 54 characters in URFDLB order
 * U1...U9 R1...R9 F1...F9 D1...D9 L1...L9 B1...B9
 */
const convertCubeStateToString = (state: CubeState): string => {
  // Determine which color belongs to which face by looking at center stickers
  const centerColors = {
    U: state.U[4],
    R: state.R[4],
    F: state.F[4],
    D: state.D[4],
    L: state.L[4],
    B: state.B[4]
  };

  // Create reverse mapping: color -> face character (U, R, F, D, L, B)
  const colorToFace: Partial<Record<Color, string>> = {};
  for (const [face, color] of Object.entries(centerColors)) {
    colorToFace[color] = face;
  }

  // Build the string in min2phase order: U R F D L B
  const faceOrder: Face[] = [Face.Up, Face.Right, Face.Front, Face.Down, Face.Left, Face.Back];
  let cubeString = '';

  for (const face of faceOrder) {
    for (const color of state[face]) {
      // COLOR SWAP TRANSLATION:
      // The user's cube geometry (Red Left, Orange Right) is non-standard.
      // We must swap Red/Orange so the standard solver can process it.
      let effectiveColor = color;
      if (color === Color.Red) effectiveColor = Color.Orange;
      else if (color === Color.Orange) effectiveColor = Color.Red;

      cubeString += colorToFace[effectiveColor] || 'U'; // Default to U if unknown
    }
  }

  return cubeString;
};

const parseSolution = (moveString: string): SolutionResponse => {
  if (!moveString || moveString.trim() === '') {
    return {
      isSolvable: true,
      message: "The cube is already solved.",
      steps: []
    };
  }

  // min2phase returns moves like "U R2 F'"
  const moves = moveString.trim().split(/\s+/);

  const steps: SolutionStep[] = moves.map((move) => {
    return {
      move: move,
      explanation: `Rotate ${move}`
    };
  });

  return {
    isSolvable: true,
    message: `Solved in ${steps.length} moves.`,
    steps: steps
  };
};

export const solveCubeWithAlgorithm = (cubeState: CubeState, force: boolean = false): SolutionResponse => {
  // 1. Validate the cube state first
  const validation = validateCubeState(cubeState);
  if (!validation.isValid && !force) {
    return {
      isSolvable: false,
      message: validation.message || "Invalid cube state",
      steps: [],
      validationInfo: { colorCounts: validation.colorCounts }
    };
  }

  try {
    const cubeString = convertCubeStateToString(cubeState);
    console.log('Cube string for min2phase:', cubeString);

    // DEBUG: Save initial cube state to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug_initialCubeState', JSON.stringify(cubeState));
      localStorage.setItem('debug_cubeString', cubeString);
    }

    // Solve using min2phase
    const search = new min2phase.Search();
    // solution(facelets, maxDepth, probeMax, probeMin, verbose)
    // maxDepth=21 (optimal is usually <20), probeMax=100000 (timeout/effort)
    const solution = search.solution(cubeString, 21, 100000, 0, 0);
    console.log('Solution from min2phase:', solution);

    // DEBUG: Save solution string to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug_solutionString', solution || '(empty)');
    }

    // Check for error codes from min2phase
    if (solution.startsWith('Error')) {
      console.error('SOLVER_FAILED:', solution);
      return {
        isSolvable: false,
        message: `Solver error: ${solution}`,
        steps: []
      };
    }

    return parseSolution(solution);

  } catch (error: any) {
    console.error("Solver exception:", error);
    return {
      isSolvable: false,
      message: `Solver exception: ${error.message}`,
      steps: []
    };
  }
};