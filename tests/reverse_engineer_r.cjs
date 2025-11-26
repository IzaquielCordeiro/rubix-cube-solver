// Reverse engineer the R move from our known-good scramble
console.log('=== Analyzing Our Known-Good R-Scramble ===\n');

const solved = {
    F: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    R: ['orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'],
    B: ['yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'],
    L: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'],
    U: ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'],
    D: ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue']
};

const afterR = {
    F: ['white', 'white', 'blue', 'white', 'white', 'blue', 'white', 'white', 'blue'],
    R: ['orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'],
    B: ['green', 'yellow', 'yellow', 'green', 'yellow', 'yellow', 'green', 'yellow', 'yellow'],
    L: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'],
    U: ['green', 'green', 'white', 'green', 'green', 'white', 'green', 'green', 'white'],
    D: ['blue', 'blue', 'yellow', 'blue', 'blue', 'yellow', 'blue', 'blue', 'yellow']
};

console.log('Comparing solved vs R-scrambled:\n');

console.log('Position [2]: F went white→blue, U went green→white, D went blue→yellow, B went yellow→green');
console.log('  F[2] got blue FROM: D (was blue in solved)');
console.log('  U[2] got white FROM: F (was white in solved)');
console.log('  D[2] got yellow FROM: B (was yellow in solved)');
console.log('  B[6] got green FROM: U (was green in solved)');

console.log('\nSo the R move cycle is:');
console.log('  D → F (D\'s color goes to F)');
console.log('  F → U (F\'s color goes to U)');
console.log('  U → B (U\'s color goes to B)');
console.log('  B → D (B\'s color goes to D)');

console.log('\nWhich means for clockwise R:');
console.log('  newF[2] = oldD[2]');
console.log('  newU[2] = oldF[2]');
console.log('  newB[6] = oldU[2]');
console.log('  newD[2] = oldB[6]');

console.log('\nAnd for counter-clockwise R\' (reverse):');
console.log('  newD[2] = oldF[2]');
console.log('  newF[2] = oldU[2]');
console.log('  newU[2] = oldB[6]');
console.log('  newB[6] = oldD[2]');

// Now test this logic
function applyRCorrect(state) {
    const newState = JSON.parse(JSON.stringify(state));

    // Rotate R face clockwise
    const r = state.R;
    newState.R = [r[6], r[3], r[0], r[7], r[4], r[1], r[8], r[5], r[2]];

    // Cycle: D → F → U → B → D
    newState.F[2] = state.D[2];
    newState.F[5] = state.D[5];
    newState.F[8] = state.D[8];

    newState.U[2] = state.F[2];
    newState.U[5] = state.F[5];
    newState.U[8] = state.F[8];

    newState.B[6] = state.U[2];
    newState.B[3] = state.U[5];
    newState.B[0] = state.U[8];

    newState.D[2] = state.B[6];
    newState.D[5] = state.B[3];
    newState.D[8] = state.B[0];

    return newState;
}

function applyRPrimeCorrect(state) {
    const newState = JSON.parse(JSON.stringify(state));

    // Rotate R face counter-clockwise
    const r = state.R;
    newState.R = [r[2], r[5], r[8], r[1], r[4], r[7], r[0], r[3], r[6]];

    // Reverse cycle: F → D, U → F, B → U, D → B
    newState.D[2] = state.F[2];
    newState.D[5] = state.F[5];
    newState.D[8] = state.F[8];

    newState.F[2] = state.U[2];
    newState.F[5] = state.U[5];
    newState.F[8] = state.U[8];

    newState.U[2] = state.B[6];
    newState.U[5] = state.B[3];
    newState.U[8] = state.B[0];

    newState.B[6] = state.D[2];
    newState.B[3] = state.D[5];
    newState.B[0] = state.D[8];

    return newState;
}

console.log('\n=== Testing Corrected Implementation ===\n');

console.log('Step 1: Apply R to solved cube');
const testR = applyRCorrect(solved);
console.log('  F[2,5,8]:', testR.F[2], testR.F[5], testR.F[8], '(expect blue)');
console.log('  U[2,5,8]:', testR.U[2], testR.U[5], testR.U[8], '(expect white)');
console.log('  D[2,5,8]:', testR.D[2], testR.D[5], testR.D[8], '(expect yellow)');
console.log('  B[6,3,0]:', testR.B[6], testR.B[3], testR.B[0], '(expect green)');

const rMatches =
    testR.F[2] === 'blue' && testR.U[2] === 'white' &&
    testR.D[2] === 'yellow' && testR.B[6] === 'green';

console.log(`\nR move matches known scramble: ${rMatches ? '✓ YES!' : '✗ NO'}`);

if (rMatches) {
    console.log('\nStep 2: Apply R\' to undo');
    const testRPrime = applyRPrimeCorrect(testR);

    const faces = ['F', 'R', 'B', 'L', 'U', 'D'];
    let allSolved = true;

    console.log('\nChecking if back to solved:');
    for (const face of faces) {
        const faceColors = testRPrime[face];
        const firstColor = faceColors[0];
        const allSame = faceColors.every(c => c === firstColor);
        console.log(`  ${face}: ${allSame ? '✓' : '✗'} ${allSame ? `(all ${firstColor})` : 'MIXED'}`);
        if (!allSame) {
            allSolved = false;
        }
    }

    if (allSolved) {
        console.log('\n✓✓✓ SUCCESS! R + R\' = solved cube!');
        console.log('    The correct cycle is: D → F → U → B → D');
    } else {
        console.log('\n✗ Still not working');
    }
}
