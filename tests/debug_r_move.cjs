// Test cube move logic locally
const Color = {
    White: 'white',
    Orange: 'orange',
    Yellow: 'yellow',
    Red: 'red',
    Green: 'green',
    Blue: 'blue'
};

const Face = {
    Front: 'F',
    Right: 'R',
    Back: 'B',
    Left: 'L',
    Up: 'U',
    Down: 'D'
};

// Solved cube
const solvedCube = {
    F: Array(9).fill(Color.White),
    R: Array(9).fill(Color.Orange),
    B: Array(9).fill(Color.Yellow),
    L: Array(9).fill(Color.Red),
    U: Array(9).fill(Color.Green),
    D: Array(9).fill(Color.Blue)
};

// Our manually created R-move scramble
const rScramble = {
    "F": ["white", "white", "blue", "white", "white", "blue", "white", "white", "blue"],
    "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
    "B": ["green", "yellow", "yellow", "green", "yellow", "yellow", "green", "yellow", "yellow"],
    "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
    "U": ["green", "green", "white", "green", "green", "white", "green", "green", "white"],
    "D": ["blue", "blue", "yellow", "blue", "blue", "yellow", "blue", "blue", "yellow"]
};

console.log('Testing R move logic:\n');

// What SHOULD happen with an R move (from solver docs):
// R move rotates right face clockwise
// Affects: U right column (2,5,8) → B left column (6,3,0) → D right column (2,5,8) → F right column (2,5,8) → back to U

console.log('Expected R move behavior:');
console.log('  U[2,5,8] → F[2,5,8]');
console.log('  F[2,5,8] → D[2,5,8]');
console.log('  D[2,5,8] → B[6,3,0]');
console.log('  B[6,3,0] → U[2,5,8]');

console.log('\nSolved cube before R:');
console.log(`  F[2,5,8] = [${solvedCube.F[2]}, ${solvedCube.F[5]}, ${solvedCube.F[8]}]`);
console.log(`  R[all]   = all ${solvedCube.R[0]}`);
console.log(`  U[2,5,8] = [${solvedCube.U[2]}, ${solvedCube.U[5]}, ${solvedCube.U[8]}]`);
console.log(`  D[2,5,8] = [${solvedCube.D[2]}, ${solvedCube.D[5]}, ${solvedCube.D[8]}]`);
console.log(`  B[6,3,0] = [${solvedCube.B[6]}, ${solvedCube.B[3]}, ${solvedCube.B[0]}]`);

console.log('\nOur R-scrambled cube:');
console.log(`  F[2,5,8] = [${rScramble.F[2]}, ${rScramble.F[5]}, ${rScramble.F[8]}] (should be blue from D)`);
console.log(`  U[2,5,8] = [${rScramble.U[2]}, ${rScramble.U[5]}, ${rScramble.U[8]}] (should be white from F)`);
console.log(`  D[2,5,8] = [${rScramble.D[2]}, ${rScramble.D[5]}, ${rScramble.D[8]}] (should be yellow from B)`);
console.log(`  B[6,3,0] = [${rScramble.B[6]}, ${rScramble.B[3]}, ${rScramble.B[0]}] (should be green from U)`);

console.log('\nChecking if our manual R-scramble is correct:');
const checks = [
    { desc: 'F got blue from D', check: rScramble.F[2] === 'blue' && rScramble.F[5] === 'blue' && rScramble.F[8] === 'blue' },
    { desc: 'U got white from F', check: rScramble.U[2] === 'white' && rScramble.U[5] === 'white' && rScramble.U[8] === 'white' },
    { desc: 'D got yellow from B', check: rScramble.D[2] === 'yellow' && rScramble.D[5] === 'yellow' && rScramble.D[8] === 'yellow' },
    { desc: 'B got green from U', check: rScramble.B[6] === 'green' && rScramble.B[3] === 'green' && rScramble.B[0] === 'green' }
];

checks.forEach(({ desc, check }) => {
    console.log(`  ${check ? '✓' : '✗'} ${desc}`);
});

if (checks.every(c => c.check)) {
    console.log('\n✓ Our manual R-scramble looks CORRECT!');
    console.log('  The bug must be in the R\' (reverse) application in cubeManipulator.ts');
} else {
    console.log('\n✗ Our manual R-scramble is WRONG!');
    console.log('  Need to fix the test data first');
}
