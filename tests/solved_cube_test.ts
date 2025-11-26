import { solveCubeWithAlgorithm } from '../services/algorithmicSolver';
import { Color, CubeState } from '../types';

// Test with a solved cube first
const solvedCube: CubeState = {
    F: Array(9).fill(Color.White),
    R: Array(9).fill(Color.Orange),
    B: Array(9).fill(Color.Yellow),
    L: Array(9).fill(Color.Red),
    U: Array(9).fill(Color.Green),
    D: Array(9).fill(Color.Blue)
};

console.log('Testing solved cube...\n');
const result = solveCubeWithAlgorithm(solvedCube, false);
console.log('Solvable:', result.isSolvable);
console.log('Message:', result.message);
console.log('Steps count:', result.steps.length);
if (result.isSolvable) {
    console.log('Solution:', result.steps.map(s => s.move).join(' '));
}
