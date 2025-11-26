const { Min2Phase } = require('../utils/min2phase');
const { solveCube } = require('../services/algorithmicSolver');

// Mock the dependencies for the solver
// We need to replicate how the app converts the Color array to the solver string
// But since we can't easily import the TS files directly in this JS script without compilation,
// we will manually implement the conversion logic or use a simplified version if possible.
// Actually, let's try to use the existing 'test_min2phase.js' as a base or just use the raw logic.

// User provided state
const userState = {
    "F": [
        "orange", "white", "green",
        "blue", "white", "green",
        "green", "orange", "white"
    ],
    "R": [
        "orange", "orange", "white",
        "orange", "orange", "white",
        "blue", "orange", "yellow"
    ],
    "B": [
        "blue", "yellow", "yellow",
        "blue", "yellow", "yellow",
        "red", "red", "yellow"
    ],
    "L": [
        "red", "red", "white",
        "red", "red", "yellow",
        "blue", "red", "red"
    ],
    "U": [
        "green", "green", "orange",
        "green", "green", "yellow",
        "green", "green", "yellow"
    ],
    "D": [
        "blue", "blue", "orange",
        "blue", "blue", "white",
        "red", "white", "white"
    ]
};

// Helper to map colors to face characters based on centers
function getFaceMapping(state) {
    // Center stickers are at index 4
    const map = {};
    map[state.U[4]] = 'U';
    map[state.R[4]] = 'R';
    map[state.F[4]] = 'F';
    map[state.D[4]] = 'D';
    map[state.L[4]] = 'L';
    map[state.B[4]] = 'B';
    return map;
}

function stateToString(state) {
    const map = getFaceMapping(state);
    const order = ['U', 'R', 'F', 'D', 'L', 'B'];
    let str = '';

    order.forEach(face => {
        state[face].forEach(color => {
            str += map[color];
        });
    });
    return str;
}

console.log('═══════════════════════════════════════');
console.log('  Debug: Investigating Unsolvable State');
console.log('═══════════════════════════════════════\n');

// 1. Analyze Centers
console.log('1. Analyzing Centers:');
console.log('   U (Up):   ', userState.U[4]);
console.log('   D (Down): ', userState.D[4]);
console.log('   F (Front):', userState.F[4]);
console.log('   B (Back): ', userState.B[4]);
console.log('   R (Right):', userState.R[4]);
console.log('   L (Left): ', userState.L[4]);

// Check for standard opposites
const opposites = {
    [userState.U[4]]: userState.D[4],
    [userState.D[4]]: userState.U[4],
    [userState.F[4]]: userState.B[4],
    [userState.B[4]]: userState.F[4],
    [userState.R[4]]: userState.L[4],
    [userState.L[4]]: userState.R[4]
};
console.log('\n   Opposite Pairs based on centers:', opposites);

// 2. Check for Impossible Corners
// Corner DLF: D[0], L[8], F[6]
const cornerDLF = [userState.D[0], userState.L[8], userState.F[6]];
console.log('\n2. Inspecting Corner DLF (Down-Left-Front):');
console.log('   Colors:', cornerDLF);
console.log('   Contains Up Center Color?', cornerDLF.includes(userState.U[4]));
console.log('   Contains Down Center Color?', cornerDLF.includes(userState.D[4]));

if (cornerDLF.includes(userState.U[4]) && cornerDLF.includes(userState.D[4])) {
    console.log('   ❌ ERROR: Corner has both Up and Down center colors!');
    console.log('      This is physically impossible on a standard cube.');
}

// 3. Attempt Solve (Simulation)
console.log('\n3. Converting to Solver String...');
try {
    const cubeString = stateToString(userState);
    console.log('   Solver String:', cubeString);

    // Note: We can't easily run the actual min2phase wasm here without setup,
    // but the string analysis confirms the input to the solver.

    // Check for U and D on same piece in the string
    // U face is indices 0-8. D face is 27-35.
    // DLF corner in string:
    // D[0] -> index 27
    // L[8] -> index 44
    // F[6] -> index 24

    const uChar = 'U';
    const dChar = 'D';

    const c1 = cubeString[27]; // D[0]
    const c2 = cubeString[44]; // L[8]
    const c3 = cubeString[24]; // F[6]

    console.log(`   Corner DLF in Solver Notation: ${c1}-${c2}-${c3}`);

    if ([c1, c2, c3].includes(uChar) && [c1, c2, c3].includes(dChar)) {
        console.log('   ❌ VERIFIED: Solver sees U and D faces on the same corner.');
    }

} catch (e) {
    console.error('   Error converting state:', e);
}
