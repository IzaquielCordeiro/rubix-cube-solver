// Standalone validation check for the user's cube state
const userState = {
    "F": [
        "yellow", "green", "green",
        "yellow", "green", "green",
        "orange", "green", "green"
    ],
    "R": [
        "white", "yellow", "red",
        "red", "red", "red",
        "red", "red", "blue"
    ],
    "B": [
        "white", "white", "red",
        "white", "blue", "blue",
        "orange", "blue", "blue"
    ],
    "L": [
        "blue", "orange", "orange",
        "orange", "orange", "orange",
        "yellow", "white", "white"
    ],
    "U": [
        "white", "orange", "green",
        "green", "white", "blue",
        "green", "white", "orange"
    ],
    "D": [
        "yellow", "red", "red",
        "yellow", "yellow", "blue",
        "yellow", "yellow", "blue"
    ]
};

console.log('═══════════════════════════════════════');
console.log('  Cube State Analysis');
console.log('═══════════════════════════════════════\n');

// 1. Check center colors
console.log('1. Center Colors:');
const centers = {
    F: userState.F[4],
    R: userState.R[4],
    B: userState.B[4],
    L: userState.L[4],
    U: userState.U[4],
    D: userState.D[4]
};

console.log('  Front (F):', centers.F);
console.log('  Right (R):', centers.R, '<-- RED (non-standard, should be Orange per min2phase)');
console.log('  Back (B):', centers.B);
console.log('  Left (L):', centers.L, '<-- ORANGE (non-standard, should be Red per min2phase)');
console.log('  Up (U):', centers.U);
console.log('  Down (D):', centers.D);

// 2. Check if Red/Orange swap is needed
const needsRedOrangeSwap = (centers.R === 'red' && centers.L === 'orange');
console.log('\n2. Red/Orange Swap Detection:');
console.log('  Needs swap?', needsRedOrangeSwap ? 'YES ✓' : 'NO');

// 3. Count stickers
const counts = {};
['white', 'yellow', 'green', 'blue', 'red', 'orange'].forEach(c => counts[c] = 0);

for (const face of Object.values(userState)) {
    for (const color of face) {
        if (counts[color] !== undefined) counts[color]++;
    }
}

console.log('\n3. Sticker Counts:');
Object.entries(counts).forEach(([color, count]) => {
    console.log(`  ${color.padEnd(7)}: ${count} ${count === 9 ? '✓' : '✗'}`);
});

const allValid = Object.values(counts).every(c => c === 9);
console.log('\n4. Verdict:');
console.log('  All counts = 9?', allValid ? 'YES ✓' : 'NO ✗');
console.log('  Should pass validator?', (allValid && needsRedOrangeSwap) ? 'YES (with Red/Orange swap) ✓' : 'MAYBE');
