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

console.log('═══════════════════════════════════════');
console.log('  Cube State Validator');
console.log('═══════════════════════════════════════\n');

// 1. Identify Centers
const centers = {
    U: userState.U[4],
    D: userState.D[4],
    F: userState.F[4],
    B: userState.B[4],
    R: userState.R[4],
    L: userState.L[4]
};

console.log('1. Centers:');
console.log(centers);

// 2. Define Opposites based on centers
// In a valid cube, U/D, F/B, R/L are opposite pairs.
const oppositeColors = {};
oppositeColors[centers.U] = centers.D;
oppositeColors[centers.D] = centers.U;
oppositeColors[centers.F] = centers.B;
oppositeColors[centers.B] = centers.F;
oppositeColors[centers.R] = centers.L;
oppositeColors[centers.L] = centers.R;

console.log('\n2. Opposite Color Pairs (based on centers):');
Object.entries(oppositeColors).forEach(([k, v]) => {
    // Print unique pairs
    if (k < v) console.log(`   ${k} <-> ${v}`);
});

// 3. Check Corners
// A corner is defined by 3 faces.
// We check if any corner contains a pair of opposite colors.

const corners = [
    { name: 'Front-Right-Up', indices: [userState.F[2], userState.R[0], userState.U[8]] },
    { name: 'Front-Left-Up', indices: [userState.F[0], userState.L[2], userState.U[6]] },
    { name: 'Back-Right-Up', indices: [userState.B[0], userState.R[2], userState.U[2]] },
    { name: 'Back-Left-Up', indices: [userState.B[2], userState.L[0], userState.U[0]] },
    { name: 'Front-Right-Down', indices: [userState.F[8], userState.R[6], userState.D[2]] },
    { name: 'Front-Left-Down', indices: [userState.F[6], userState.L[8], userState.D[0]] },
    { name: 'Back-Right-Down', indices: [userState.B[6], userState.R[8], userState.D[8]] },
    { name: 'Back-Left-Down', indices: [userState.B[8], userState.L[6], userState.D[6]] }
];

console.log('\n3. Inspecting Corners:');
let valid = true;

corners.forEach(corner => {
    const colors = corner.indices;
    console.log(`   ${corner.name}: [${colors.join(', ')}]`);

    // Check for opposites
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const c1 = colors[i];
            const c2 = colors[j];
            if (oppositeColors[c1] === c2) {
                console.log(`      ❌ INVALID: Contains opposite pair ${c1}/${c2}`);
                valid = false;
            }
        }
    }
});

if (valid) {
    console.log('\n✅ Cube state appears valid (no impossible corners found).');
} else {
    console.log('\n❌ Cube state is INVALID.');
}
