import { solveCubeWithAlgorithm } from './services/algorithmicSolver';
import { Color } from './types';

const scannedCubeState = {
  F: [Color.Green, Color.Green, Color.Orange, Color.White, Color.White, Color.Orange, Color.Red, Color.Red, Color.Orange],
  R: [Color.White, Color.White, Color.Yellow, Color.Yellow, Color.Orange, Color.Yellow, Color.Yellow, Color.Blue, Color.Green],
  B: [Color.White, Color.Green, Color.Red, Color.Orange, Color.Yellow, Color.Blue, Color.Blue, Color.Red, Color.Yellow],
  L: [Color.Orange, Color.Red, Color.White, Color.Blue, Color.Red, Color.Red, Color.Red, Color.White, Color.Yellow],
  U: [Color.Green, Color.Yellow, Color.Green, Color.Blue, Color.Green, Color.Orange, Color.Red, Color.Orange, Color.Blue],
  D: [Color.Orange, Color.Yellow, Color.White, Color.White, Color.Blue, Color.Green, Color.Blue, Color.Green, Color.Blue]
};

console.log('Running solver with try/catch...');
try {
  const result = solveCubeWithAlgorithm(scannedCubeState, false);
  console.log('Result:', result);
} catch (e) {
  console.error('Solver threw an exception:', e);
}

console.log('Force solve...');
try {
  const forceResult = solveCubeWithAlgorithm(scannedCubeState, true);
  console.log('Force result:', forceResult);
} catch (e) {
  console.error('Force solve threw an exception:', e);
}
