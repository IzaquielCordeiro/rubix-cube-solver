// Test if R followed by R' returns to solved state
import { applyMove } from '../utils/cubeManipulator.js';
import { Face, Color } from '../types.js';

const solvedCube = {
    [Face.Front]: Array(9).fill(Color.White),
    [Face.Right]: Array(9).fill(Color.Orange),
    [Face.Back]: Array(9).fill(Color.Yellow),
    [Face.Left]: Array(9).fill(Color.Red),
    [Face.Up]: Array(9).fill(Color.Green),
    [Face.Down]: Array(9).fill(Color.Blue)
};

console.log('Testing R and R\' move application...\n');

// Apply R move
console.log('Step 1: Apply R move to solved cube');
const afterR = applyMove(solvedCube, 'R');

console.log('After R move:');
console.log(`  F[2,5,8]: ${afterR[Face.Front][2]}, ${afterR[Face.Front][5]}, ${afterR[Face.Front][8]}`);
console.log(`  U[2,5,8]: ${afterR[Face.Up][2]}, ${afterR[Face.Up][5]}, ${afterR[Face.Up][8]}`);
console.log(`  D[2,5,8]: ${afterR[Face.Down][2]}, ${afterR[Face.Down][5]}, ${afterR[Face.Down][8]}`);
console.log(`  B[6,3,0]: ${afterR[Face.Back][6]}, ${afterR[Face.Back][3]}, ${afterR[Face.Back][0]}`);

// Expected after R:
// F should get blue from D
// U should get white from F  
// D should get yellow from B
// B should get green from U

const rCorrect =
    afterR[Face.Front][2] === Color.Blue &&
    afterR[Face.Up][2] === Color.White &&
    afterR[Face.Down][2] === Color.Yellow &&
    afterR[Face.Back][6] === Color.Green;

console.log(`\nR move correct: ${rCorrect ? '✓' : '✗'}`);

// Apply R' to undo
console.log('\nStep 2: Apply R\' move to undo');
const afterRPrime = applyMove(afterR, "R'");

console.log('After R\' move:');
console.log(`  F[2,5,8]: ${afterRPrime[Face.Front][2]}, ${afterRPrime[Face.Front][5]}, ${afterRPrime[Face.Front][8]}`);
console.log(`  U[2,5,8]: ${afterRPrime[Face.Up][2]}, ${afterRPrime[Face.Up][5]}, ${afterRPrime[Face.Up][8]}`);
console.log(`  D[2,5,8]: ${afterRPrime[Face.Down][2]}, ${afterRPrime[Face.Down][5]}, ${afterRPrime[Face.Down][8]}`);
console.log(`  B[6,3,0]: ${afterRPrime[Face.Back][6]}, ${afterRPrime[Face.Back][3]}, ${afterRPrime[Face.Back][0]}`);

// Check if solved
const faces = [Face.Front, Face.Right, Face.Back, Face.Left, Face.Up, Face.Down];
let allSolved = true;

console.log('\nChecking if cube is solved:');
for (const face of faces) {
    const faceColors = afterRPrime[face];
    const firstColor = faceColors[0];
    const allSame = faceColors.every(c => c === firstColor);
    console.log(`  ${face}: ${allSame ? '✓' : '✗'} ${allSame ? `(all ${firstColor})` : '(MIXED)'}`);
    if (!allSame) {
        console.log(`      ${faceColors.join(', ')}`);
        allSolved = false;
    }
}

if (allSolved) {
    console.log('\n✓ SUCCESS: R followed by R\' returns to solved state!');
    process.exit(0);
} else {
    console.log('\n✗ FAILURE: R followed by R\' does NOT return to solved state!');
    console.log('   The applyMove function has a bug.');
    process.exit(1);
}
