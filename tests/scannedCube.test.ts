import { solveCubeWithAlgorithm } from '../services/algorithmicSolver';
import { CubeState, Color } from '../types';

describe('Algorithmic Solver - Real Scanned Cube', () => {
  const scannedCubeState: CubeState = {
    F: [
      Color.Green,
      Color.Green,
      Color.Orange,
      Color.White,
      Color.White,
      Color.Orange,
      Color.Red,
      Color.Red,
      Color.Orange
    ],
    R: [
      Color.White,
      Color.White,
      Color.Yellow,
      Color.Yellow,
      Color.Orange,
      Color.Yellow,
      Color.Yellow,
      Color.Blue,
      Color.Green
    ],
    B: [
      Color.White,
      Color.Green,
      Color.Red,
      Color.Orange,
      Color.Yellow,
      Color.Blue,
      Color.Blue,
      Color.Red,
      Color.Yellow
    ],
    L: [
      Color.Orange,
      Color.Red,
      Color.White,
      Color.Blue,
      Color.Red,
      Color.Red,
      Color.Red,
      Color.White,
      Color.Yellow
    ],
    U: [
      Color.Green,
      Color.Yellow,
      Color.Green,
      Color.Blue,
      Color.Green,
      Color.Orange,
      Color.Red,
      Color.Orange,
      Color.Blue
    ],
    D: [
      Color.Orange,
      Color.Yellow,
      Color.White,
      Color.White,
      Color.Blue,
      Color.Green,
      Color.Blue,
      Color.Green,
      Color.Blue
    ]
  };

  it('should have correct color counts (9 of each)', () => {
    const colorCounts: Record<string, number> = {};
    
    Object.values(scannedCubeState).forEach(face => {
      face.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });
    });

    console.log('Color counts:', colorCounts);

    expect(colorCounts[Color.White]).toBe(9);
    expect(colorCounts[Color.Yellow]).toBe(9);
    expect(colorCounts[Color.Green]).toBe(9);
    expect(colorCounts[Color.Blue]).toBe(9);
    expect(colorCounts[Color.Red]).toBe(9);
    expect(colorCounts[Color.Orange]).toBe(9);
  });

  it('should validate and solve the scanned cube', () => {
    const result = solveCubeWithAlgorithm(scannedCubeState, false);
    
    console.log('Validation result:', {
      isSolvable: result.isSolvable,
      message: result.message,
      stepCount: result.steps.length,
      validationInfo: result.validationInfo
    });

    if (!result.isSolvable) {
      console.error('Cube is not solvable:', result.message);
      console.error('Validation info:', result.validationInfo);
    }

    expect(result.isSolvable).toBe(true);
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('should attempt to force solve even if validation fails', () => {
    const result = solveCubeWithAlgorithm(scannedCubeState, true);
    
    console.log('Force solve result:', {
      isSolvable: result.isSolvable,
      message: result.message,
      stepCount: result.steps.length
    });

    // With force=true, we expect either:
    // 1. A solution (isSolvable=true with steps)
    // 2. OR a solver error (isSolvable=false with error message)
    // But it should not throw an exception
    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
  });
});
