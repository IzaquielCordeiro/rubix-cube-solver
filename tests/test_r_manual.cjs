// Simple test importing the compiled cubeManipulator
// This will test if R followed by R' returns to solved

const solvedCube = {
    F: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    R: ['orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'],
    B: ['yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'],
    L: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'],
    U: ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'],
    D: ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue']
};

// Manually implement applyMove for R and R' to test
function applyR(state) {
    const newState = JSON.parse(JSON.stringify(state)); // deep clone

    // Rotate R face counter-clockwise  
    const r = state.R;
    newState.R = [r[2], r[5], r[8], r[1], r[4], r[7], r[0], r[3], r[6]];

    // Move edge pieces: U←F←D←B←U (reverse of R)
    // U[2,5,8] ← B[6,3,0]
    newState.U[2] = state.B[6];
    newState.U[5] = state.B[3];
    newState.U[8] = state.B[0];

    // F[2,5,8] ← U[2,5,8]
    newState.F[2] = state.U[2];
    newState.F[5] = state.U[5];
    newState.F[8] = state.U[8];

    // D[2,5,8] ← F[2,5,8]
    newState.D[2] = state.F[2];
    newState.D[5] = state.F[5];
    newState.D[8] = state.F[8];

    // B[6,3,0] ← D[2,5,8]
    newState.B[6] = state.D[2];
    newState.B[3] = state.D[5];
    newState.B[0] = state.D[8];

    return newState;
}

console.log('Testing R and R\' with manual implementation...\n');

console.log('Step 1: Apply R');
const afterR = applyR(solvedCube);
console.log('  F[2,5,8]:', afterR.F[2], afterR.F[5], afterR.F[8], '(expect white)');
console.log('  U[2,5,8]:', afterR.U[2], afterR.U[5], afterR.U[8], '(expect green)');
console.log('  D[2,5,8]:', afterR.D[2], afterR.D[5], afterR.D[8], '(expect blue)');
console.log('  B[6,3,0]:', afterR.B[6], afterR.B[3], afterR.B[0], '(expect yellow)');

console.log('\nStep 2: Apply R\'');
const afterRPrime = applyRPrime(afterR);

const faces = ['F', 'R', 'B', 'L', 'U', 'D'];
let allSolved = true;

console.log('\nChecking if back to solved:');
for (const face of faces) {
    const faceColors = afterRPrime[face];
    const firstColor = faceColors[0];
    const allSame = faceColors.every(c => c === firstColor);
    console.log(`  ${face}: ${allSame ? '✓' : '✗'} ${allSame ? `(all ${firstColor})` : 'MIXED'}`);
    if (!allSame) {
        console.log(`      ${faceColors.join(', ')}`);
        allSolved = false;
    }
}

if (allSolved) {
    console.log('\n✓ Manual R+R\' implementation works correctly!');
    console.log('  This proves the concept is sound.');
} else {
    console.log('\n✗ Even manual implementation doesn\'t work!');
    console.log('  Need to rethink the move logic.');
}
