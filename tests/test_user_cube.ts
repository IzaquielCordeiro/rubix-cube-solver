import { solveCubeWithAlgorithm } from '../services/algorithmicSolver';
import { Color, CubeState, Face } from '../types';
import { applyMove } from '../utils/cubeManipulator';

console.log('='.repeat(70));
console.log('TESTING USER-PROVIDED CUBE STATE');
console.log('='.repeat(70));

// The cube state from the user - says it can be solved in 2 moves
const userCubeState: CubeState = {
    F: [
        Color.Red,
        Color.Red,
        Color.Red,
        Color.White,
        Color.White,
        Color.White,
        Color.White,
        Color.White,
        Color.White
    ],
    R: [
        Color.White,
        Color.White,
        Color.White,
        Color.Orange,
        Color.Orange,
        Color.Orange,
        Color.Orange,
        Color.Orange,
        Color.Orange
    ],
    B: [
        Color.Orange,
        Color.Orange,
        Color.Orange,
        Color.Yellow,
        Color.Yellow,
        Color.Yellow,
        Color.Yellow,
        Color.Yellow,
        Color.Yellow
    ],
    L: [
        Color.Yellow,
        Color.Yellow,
        Color.Yellow,
        Color.Red,
        Color.Red,
        Color.Red,
        Color.Red,
        Color.Red,
        Color.Red
    ],
    U: [
        Color.Green,
        Color.Green,
        Color.Green,
        Color.Green,
        Color.Green,
        Color.Green,
        Color.Green,
        Color.Green,
        Color.Green
    ],
    D: [
        Color.Blue,
        Color.Blue,
        Color.Blue,
        Color.Blue,
        Color.Blue,
        Color.Blue,
        Color.Blue,
        Color.Blue,
        Color.Blue
    ]
};

console.log('\n=== User Cube State ===');
console.log('Face centers:', {
    F: userCubeState.F[4],
    R: userCubeState.R[4],
    B: userCubeState.B[4],
    L: userCubeState.L[4],
    U: userCubeState.U[4],
    D: userCubeState.D[4]
});

// Try solving with the library
console.log('\n=== Testing with rubiks-cube-solver ===');
const result = solveCubeWithAlgorithm(userCubeState, false);
console.log('Solver result:');
console.log('  - Solvable:', result.isSolvable);
console.log('  - Message:', result.message);
console.log('  - Move count:', result.steps.length);
console.log('  - Solution:', result.steps.map(s => s.move).join(' '));

// Now test if we can solve it manually
console.log('\n=== Manual Test: Trying Simple Rotations ===');

// Test rotation 1: F
console.log('\nTest 1: Apply F move');
let testState1 = applyMove(userCubeState, 'F');
const isSolved1 = Object.entries(testState1).every(([face, colors]) => {
    const firstColor = colors[0];
    return colors.every(c => c === firstColor);
});
console.log('After F: Is solved?', isSolved1);

// Test rotation 2: F2
console.log('\nTest 2: Apply F2 move');
let testState2 = applyMove(userCubeState, 'F2');
const isSolved2 = Object.entries(testState2).every(([face, colors]) => {
    const firstColor = colors[0];
    return colors.every(c => c === firstColor);
});
console.log('After F2: Is solved?', isSolved2);

// Test the solution from the library
if (result.isSolvable && result.steps.length > 0) {
    console.log('\n=== Applying Library Solution ===');
    let finalState = userCubeState;
    for (const step of result.steps) {
        finalState = applyMove(finalState, step.move);
    }

    const isFinalSolved = Object.entries(finalState).every(([face, colors]) => {
        const firstColor = colors[0];
        return colors.every(c => c === firstColor);
    });

    console.log('After applying all', result.steps.length, 'moves:');
    console.log('Is solved?', isFinalSolved);

    if (!isFinalSolved) {
        console.log('\nFinal state:');
        console.log(JSON.stringify(finalState, null, 2));
    }
}

console.log('\n' + '='.repeat(70));
console.log('CONCLUSION');
console.log('='.repeat(70));
console.log('User says: 2 moves should solve it');
console.log('Library says:', result.steps.length, 'moves');
console.log('Library solution works:', result.isSolvable);
