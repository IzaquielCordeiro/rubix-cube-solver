import { solveCubeWithAlgorithm } from './services/algorithmicSolver';
import { Color } from './types';

const scannedCubeState = {
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

console.log('Testing scanned cube state...\n');

// Test 1: Color counts
console.log('=== Test 1: Color Counts ===');
const colorCounts: Record<string, number> = {};
Object.values(scannedCubeState).forEach(face => {
    face.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
});
console.log('Color counts:', colorCounts);
const allNine = Object.values(colorCounts).every(count => count === 9);
console.log('All colors have 9 stickers:', allNine ? '✓ PASS' : '✗ FAIL');

// Test 2: Normal solve
console.log('\n=== Test 2: Normal Solve (validation enabled) ===');
const result = solveCubeWithAlgorithm(scannedCubeState, false);
console.log('Solvable:', result.isSolvable);
console.log('Message:', result.message);
console.log('Steps count:', result.steps.length);
if (result.validationInfo) {
    console.log('Validation info:', result.validationInfo);
}
if (result.isSolvable) {
    console.log('First 5 moves:', result.steps.slice(0, 5).map(s => s.move).join(' '));
}

// Test 3: Force solve
console.log('\n=== Test 3: Force Solve ===');
const forceResult = solveCubeWithAlgorithm(scannedCubeState, true);
console.log('Solvable:', forceResult.isSolvable);
console.log('Message:', forceResult.message);
console.log('Steps count:', forceResult.steps.length);
if (forceResult.isSolvable) {
    console.log('First 5 moves:', forceResult.steps.slice(0, 5).map(s => s.move).join(' '));
}

console.log('\n=== Summary ===');
console.log('Color counts valid:', allNine ? '✓' : '✗');
console.log('Normal solve:', result.isSolvable ? '✓ SUCCESS' : '✗ FAILED');
console.log('Force solve:', forceResult.isSolvable ? '✓ SUCCESS' : '✗ FAILED');
