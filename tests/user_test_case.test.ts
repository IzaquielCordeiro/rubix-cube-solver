import { solveCubeWithAlgorithm } from '../services/algorithmicSolver';
import { Color, CubeState } from '../types';

const userCubeState: CubeState = {
    F: [
        Color.White, Color.White, Color.White,
        Color.White, Color.White, Color.White,
        Color.White, Color.White, Color.White
    ],
    R: [
        Color.Red, Color.Orange, Color.Orange,
        Color.Red, Color.Orange, Color.Orange,
        Color.Red, Color.Orange, Color.Orange
    ],
    B: [
        Color.Yellow, Color.Yellow, Color.Yellow,
        Color.Yellow, Color.Yellow, Color.Yellow,
        Color.Yellow, Color.Yellow, Color.Yellow
    ],
    L: [
        Color.Red, Color.Red, Color.Orange,
        Color.Red, Color.Red, Color.Orange,
        Color.Red, Color.Red, Color.Orange
    ],
    U: [
        Color.Green, Color.Green, Color.Green,
        Color.Green, Color.Green, Color.Green,
        Color.Blue, Color.Blue, Color.Blue
    ],
    D: [
        Color.Blue, Color.Blue, Color.Blue,
        Color.Blue, Color.Blue, Color.Blue,
        Color.Green, Color.Green, Color.Green
    ]
};

console.log('Testing user provided cube state...');

// Test 1: Normal Solve
console.log('\n=== Test 1: Normal Solve ===');
const result = solveCubeWithAlgorithm(userCubeState, false);
console.log('Solvable:', result.isSolvable);
console.log('Message:', result.message);
console.log('Steps count:', result.steps.length);
if (result.isSolvable) {
    console.log('Solution:', result.steps.map(s => s.move).join(' '));
} else {
    if (result.validationInfo) {
        console.log('Validation info:', JSON.stringify(result.validationInfo, null, 2));
    }
}

// Test 2: Force Solve (if normal fails)
if (!result.isSolvable) {
    console.log('\n=== Test 2: Force Solve ===');
    const forceResult = solveCubeWithAlgorithm(userCubeState, true);
    console.log('Solvable:', forceResult.isSolvable);
    console.log('Message:', forceResult.message);
    console.log('Steps count:', forceResult.steps.length);
    if (forceResult.isSolvable) {
        console.log('Solution:', forceResult.steps.map(s => s.move).join(' '));
    }
}
