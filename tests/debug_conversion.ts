import { Color, CubeState, Face } from '../types';

// Test the conversion function directly
const userCubeState: CubeState = {
    F: [
        Color.Red, Color.Red, Color.Red,
        Color.White, Color.White, Color.White,
        Color.White, Color.White, Color.White
    ],
    R: [
        Color.White, Color.White, Color.White,
        Color.Orange, Color.Orange, Color.Orange,
        Color.Orange, Color.Orange, Color.Orange
    ],
    B: [
        Color.Orange, Color.Orange, Color.Orange,
        Color.Yellow, Color.Yellow, Color.Yellow,
        Color.Yellow, Color.Yellow, Color.Yellow
    ],
    L: [
        Color.Yellow, Color.Yellow, Color.Yellow,
        Color.Red, Color.Red, Color.Red,
        Color.Red, Color.Red, Color.Red
    ],
    U: [Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green],
    D: [Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue]
};

console.log('=== Analyzing Cube State ===\n');

// Extract center colors
const centerColors = {
    U: userCubeState.U[4],
    R: userCubeState.R[4],
    F: userCubeState.F[4],
    D: userCubeState.D[4],
    L: userCubeState.L[4],
    B: userCubeState.B[4]
};

console.log('Center colors:', centerColors);

// Create reverse mapping
const colorToFace: Partial<Record<Color, string>> = {};
for (const [face, color] of Object.entries(centerColors)) {
    console.log(`Mapping: ${color} -> ${face.toLowerCase()}`);
    if (colorToFace[color]) {
        console.warn(`WARNING: Color ${color} already mapped to '${colorToFace[color]}', overwriting with '${face.toLowerCase()}'`);
    }
    colorToFace[color] = face.toLowerCase();
}

console.log('\nFinal colorToFace mapping:', colorToFace);

// Build the string
const faceOrder: Face[] = [Face.Front, Face.Right, Face.Up, Face.Down, Face.Left, Face.Back];
let cubeString = '';

console.log('\n=== Building Cube String (FRUDLB order) ===\n');

for (const face of faceOrder) {
    console.log(`\nProcessing face ${face}:`);
    let faceString = '';
    for (let i = 0; i < userCubeState[face].length; i++) {
        const color = userCubeState[face][i];
        const char = colorToFace[color] || 'x';
        faceString += char;
        if (i < 3) {
            console.log(`  Position ${i} (top row): ${color} -> '${char}'`);
        }
    }
    cubeString += faceString;
    console.log(`  Face string: ${faceString} (length: ${faceString.length})`);
}

console.log('\n=== Final Result ===');
console.log('Cube string:', cubeString);
console.log('Length:', cubeString.length, '(expected: 54)');

if (cubeString.length !== 54) {
    console.error('\n❌ ERROR: Cube string is not 54 characters!');
} else {
    console.log('\n✅ Cube string length is correct');
}

// Check what a SOLVED cube should look like
console.log('\n=== What a SOLVED cube should look like ===');
console.log('All F stickers should be same color as F center');
console.log('All R stickers should be same color as R center');
console.log('etc...');
console.log('\nBut this cube has:');
console.log('F face:', userCubeState.F);
console.log('F center:', centerColors.F);
console.log('→ This is NOT a solved cube! Different colors on same face.');
