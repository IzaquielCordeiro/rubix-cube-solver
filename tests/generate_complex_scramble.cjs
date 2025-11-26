// Generate a complex scrambled cube by applying 15 random moves
// Self-contained version with FIXED R and L move logic

const Face = { Front: 'F', Right: 'R', Back: 'B', Left: 'L', Up: 'U', Down: 'D' };
const Color = { White: 'white', Orange: 'orange', Yellow: 'yellow', Red: 'red', Green: 'green', Blue: 'blue' };

// --- Cube Logic (Copied from utils/cubeManipulator.ts and adapted) ---

const cloneState = (state) => {
    const ensureArray = (face) => {
        if (Array.isArray(face)) return [...face];
        if (typeof face === 'object' && face !== null) {
            return Object.values(face);
        }
        return [];
    };

    return {
        [Face.Up]: ensureArray(state[Face.Up]),
        [Face.Down]: ensureArray(state[Face.Down]),
        [Face.Left]: ensureArray(state[Face.Left]),
        [Face.Right]: ensureArray(state[Face.Right]),
        [Face.Front]: ensureArray(state[Face.Front]),
        [Face.Back]: ensureArray(state[Face.Back]),
    };
};

const rotateFaceClockwise = (faceColors) => {
    if (!faceColors) return Array(9).fill('gray');
    const colors = Array.isArray(faceColors) ? faceColors : Object.values(faceColors);
    if (colors.length !== 9) return colors;

    const newFace = [...colors];
    newFace[2] = colors[0]; newFace[8] = colors[2]; newFace[6] = colors[8]; newFace[0] = colors[6];
    newFace[5] = colors[1]; newFace[7] = colors[5]; newFace[3] = colors[7]; newFace[1] = colors[3];
    return newFace;
};

const rotateFaceCounterClockwise = (faceColors) => {
    if (!faceColors) return Array(9).fill('gray');
    const colors = Array.isArray(faceColors) ? faceColors : Object.values(faceColors);
    if (colors.length !== 9) return colors;

    const newFace = [...colors];
    newFace[0] = colors[2]; newFace[2] = colors[8]; newFace[8] = colors[6]; newFace[6] = colors[0];
    newFace[1] = colors[5]; newFace[5] = colors[7]; newFace[7] = colors[3]; newFace[3] = colors[1];
    return newFace;
};

const rotateFace180 = (faceColors) => {
    return rotateFaceClockwise(rotateFaceClockwise(faceColors));
};

const applyMove = (currentState, move) => {
    const state = cloneState(currentState);
    let baseMove;
    let modifier = '';

    if (move.includes('prime')) {
        baseMove = move.replace('prime', '').replace('2', '');
        modifier = "'";
    } else if (move.includes('2')) {
        baseMove = move.replace(/['2]/g, '');
        modifier = "2";
    } else if (move.includes("'")) {
        baseMove = move.replace(/['2]/g, '');
        modifier = "'";
    } else {
        baseMove = move;
    }

    const faceMap = { 'U': Face.Up, 'D': Face.Down, 'L': Face.Left, 'R': Face.Right, 'F': Face.Front, 'B': Face.Back };
    const targetFace = faceMap[baseMove];

    if (!targetFace) return state;

    if (modifier === "'") {
        state[targetFace] = rotateFaceCounterClockwise(state[targetFace]);
    } else if (modifier === "2") {
        state[targetFace] = rotateFace180(state[targetFace]);
    } else {
        state[targetFace] = rotateFaceClockwise(state[targetFace]);
    }

    const cycles = {
        'U': [
            [[Face.Front, 0], [Face.Left, 0], [Face.Back, 0], [Face.Right, 0]],
            [[Face.Front, 1], [Face.Left, 1], [Face.Back, 1], [Face.Right, 1]],
            [[Face.Front, 2], [Face.Left, 2], [Face.Back, 2], [Face.Right, 2]],
        ],
        'D': [
            [[Face.Front, 6], [Face.Right, 6], [Face.Back, 6], [Face.Left, 6]],
            [[Face.Front, 7], [Face.Right, 7], [Face.Back, 7], [Face.Left, 7]],
            [[Face.Front, 8], [Face.Right, 8], [Face.Back, 8], [Face.Left, 8]],
        ],
        'L': [
            // Correct cycle: U → F → D → B → U
            [[Face.Up, 0], [Face.Front, 0], [Face.Down, 0], [Face.Back, 8]],
            [[Face.Up, 3], [Face.Front, 3], [Face.Down, 3], [Face.Back, 5]],
            [[Face.Up, 6], [Face.Front, 6], [Face.Down, 6], [Face.Back, 2]],
        ],
        'R': [
            // Correct cycle: D → F → U → B → D
            [[Face.Down, 2], [Face.Front, 2], [Face.Up, 2], [Face.Back, 6]],
            [[Face.Down, 5], [Face.Front, 5], [Face.Up, 5], [Face.Back, 3]],
            [[Face.Down, 8], [Face.Front, 8], [Face.Up, 8], [Face.Back, 0]],
        ],
        'F': [
            [[Face.Up, 6], [Face.Right, 0], [Face.Down, 2], [Face.Left, 8]],
            [[Face.Up, 7], [Face.Right, 3], [Face.Down, 1], [Face.Left, 5]],
            [[Face.Up, 8], [Face.Right, 6], [Face.Down, 0], [Face.Left, 2]],
        ],
        'B': [
            [[Face.Up, 2], [Face.Left, 0], [Face.Down, 6], [Face.Right, 8]],
            [[Face.Up, 1], [Face.Left, 3], [Face.Down, 7], [Face.Right, 5]],
            [[Face.Up, 0], [Face.Left, 6], [Face.Down, 8], [Face.Right, 2]],
        ]
    };

    const moveCycles = cycles[baseMove];

    if (moveCycles) {
        moveCycles.forEach(cycle => {
            const colors = cycle.map(([f, i]) => state[f][i]);
            let newColors;
            if (modifier === "'") {
                newColors = [colors[1], colors[2], colors[3], colors[0]];
            } else if (modifier === "2") {
                newColors = [colors[2], colors[3], colors[0], colors[1]];
            } else {
                newColors = [colors[3], colors[0], colors[1], colors[2]];
            }

            cycle.forEach(([f, i], idx) => {
                state[f][i] = newColors[idx];
            });
        });
    }

    return state;
};

// --- End Cube Logic ---

const solvedCube = {
    [Face.Front]: Array(9).fill(Color.White),
    [Face.Right]: Array(9).fill(Color.Orange),
    [Face.Back]: Array(9).fill(Color.Yellow),
    [Face.Left]: Array(9).fill(Color.Red),
    [Face.Up]: Array(9).fill(Color.Green),
    [Face.Down]: Array(9).fill(Color.Blue)
};

// Complex 15-move scramble
const scrambleMoves = ["R", "U", "F'", "D", "L'", "B", "R'", "U'", "F", "D'", "L", "B'", "R", "U", "F'"];

console.log('=== Generating Complex 15-Move Scramble ===\n');
console.log('Scramble sequence:', scrambleMoves.join(' '));
console.log('\nApplying moves...\n');

let cubeState = solvedCube;
for (let i = 0; i < scrambleMoves.length; i++) {
    try {
        cubeState = applyMove(cubeState, scrambleMoves[i]);
        console.log(`  ${i + 1}. ${scrambleMoves[i]} ✓`);
    } catch (e) {
        console.error(`  ${i + 1}. ${scrambleMoves[i]} ✗ ERROR:`, e.message);
        process.exit(1);
    }
}

console.log('\n=== Scrambled Cube State ===\n');
console.log(JSON.stringify(cubeState, null, 2));

// Verify color counts
console.log('\n=== Color Count Validation ===\n');
const colorCounts = {};
Object.values(cubeState).forEach(face => {
    face.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
});

let allValid = true;
Object.entries(colorCounts).forEach(([color, count]) => {
    const valid = count === 9;
    console.log(`  ${color}: ${count}/9 ${valid ? '✓' : '✗'}`);
    if (!valid) allValid = false;
});

if (allValid) {
    console.log('\n✓ Complex scrambled cube is VALID!');
    console.log('  Ready for E2E testing.');
} else {
    console.log('\n✗ Invalid cube state generated!');
    process.exit(1);
}
