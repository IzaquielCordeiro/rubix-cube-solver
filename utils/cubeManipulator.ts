import { CubeState, Face, Color } from '../types';

// Helper to deep copy the state
const cloneState = (state: CubeState): CubeState => {
    // Ensure each face is a proper array (handles localStorage deserialization issues)
    const ensureArray = (face: any): Color[] => {
        if (Array.isArray(face)) return [...face];
        if (typeof face === 'object' && face !== null) {
            // Convert object with numeric keys to array
            return Object.values(face) as Color[];
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

// Rotate a face array 90 degrees clockwise
const rotateFaceClockwise = (faceColors: Color[]): Color[] => {
    // Defensive: ensure faceColors is an array
    if (!faceColors) {
        console.error('rotateFaceClockwise received null/undefined faceColors');
        return Array(9).fill(Color.Gray) as Color[]; // Return gray face if invalid
    }

    const colors = Array.isArray(faceColors) ? faceColors : (Object.values(faceColors) as Color[]);

    if (colors.length !== 9) {
        console.error('Invalid face array length:', colors.length, colors);
        return colors; // Return unchanged if invalid
    }

    const newFace = [...colors];
    // Corners
    newFace[2] = colors[0];
    newFace[8] = colors[2];
    newFace[6] = colors[8];
    newFace[0] = colors[6];
    // Edges
    newFace[5] = colors[1];
    newFace[7] = colors[5];
    newFace[3] = colors[7];
    newFace[1] = colors[3];
    // Center stays same
    return newFace;
};

// Rotate a face array 90 degrees counter-clockwise
const rotateFaceCounterClockwise = (faceColors: Color[]): Color[] => {
    // Defensive: ensure faceColors is an array
    if (!faceColors) {
        console.error('rotateFaceCounterClockwise received null/undefined faceColors');
        return Array(9).fill(Color.Gray) as Color[]; // Return gray face if invalid
    }

    const colors = Array.isArray(faceColors) ? faceColors : (Object.values(faceColors) as Color[]);

    if (colors.length !== 9) {
        console.error('Invalid face array length:', colors.length, colors);
        return colors; // Return unchanged if invalid
    }

    const newFace = [...colors];
    // Corners
    newFace[0] = colors[2];
    newFace[2] = colors[8];
    newFace[8] = colors[6];
    newFace[6] = colors[0];
    // Edges
    newFace[1] = colors[5];
    newFace[5] = colors[7];
    newFace[7] = colors[3];
    newFace[3] = colors[1];
    return newFace;
};

const rotateFace180 = (faceColors: Color[]): Color[] => {
    return rotateFaceClockwise(rotateFaceClockwise(faceColors));
};

export const applyMove = (currentState: CubeState, move: string): CubeState => {
    const state = cloneState(currentState);

    // Handle both standard notation (F, R', U2) and rubiks-cube-solver notation (Fprime, R2)
    let baseMove: string;
    let modifier: string = '';

    if (move.includes('prime')) {
        // rubiks-cube-solver format: "Fprime" -> F'
        baseMove = move.replace('prime', '').replace('2', '');
        modifier = "'";
    } else if (move.includes('2')) {
        // Both formats support "2" suffix
        baseMove = move.replace(/['2]/g, '');
        modifier = "2";
    } else if (move.includes("'")) {
        // Standard format: "F'" -> F'
        baseMove = move.replace(/['2]/g, '');
        modifier = "'";
    } else {
        // Simple move: "F" -> F
        baseMove = move;
    }

    // Apply face rotation
    const faceMap: Record<string, Face> = {
        'U': Face.Up, 'D': Face.Down, 'L': Face.Left,
        'R': Face.Right, 'F': Face.Front, 'B': Face.Back
    };
    const targetFace = faceMap[baseMove];

    // Validate that we have a valid face
    if (!targetFace) {
        console.error(`Invalid move: "${move}" - baseMove "${baseMove}" not found in faceMap`);
        return state; // Return unchanged state
    }

    if (modifier === "'") {
        state[targetFace] = rotateFaceCounterClockwise(state[targetFace]);
    } else if (modifier === "2") {
        state[targetFace] = rotateFace180(state[targetFace]);
    } else {
        state[targetFace] = rotateFaceClockwise(state[targetFace]);
    }

    // Apply adjacent face movements
    // We'll define the cycle of stickers for each base move
    // Each element is [Face, index]
    const cycles: Record<string, [Face, number][][]> = {
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
            // Array order represents the cycle, each position gives to the next
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
            // Extract current colors
            const colors = cycle.map(([f, i]) => state[f][i]);

            // Shift colors based on modifier
            let newColors: Color[];
            if (modifier === "'") {
                // Counter-clockwise: shift right (last becomes first)
                // A -> B -> C -> D becomes D -> A -> B -> C
                // Actually, the cycle definition implies A moves to B moves to C...
                // So clockwise is shift right?
                // Let's trace U: F -> L -> B -> R. 
                // U (clockwise) moves F stickers to L? No, U moves F to L is correct?
                // Visualizing U turn: Top face turns clockwise.
                // F top row moves to L top row. L top row moves to B top row.
                // So F -> L -> B -> R is the flow of stickers.
                // So new L gets old F.
                // newColors[1] = colors[0]
                // This is a shift right in the array [F, L, B, R]
                // new L (idx 1) = old F (idx 0)

                // Wait, if cycle is [A, B, C, D] and A moves to B, B to C...
                // Then new B = old A.
                // new C = old B.
                // new D = old C.
                // new A = old D.
                // This corresponds to shifting the values to the "right" in the array indices?
                // Array: [valA, valB, valC, valD]
                // New:   [valD, valA, valB, valC]

                // So for Clockwise (normal):
                // new [A, B, C, D] = [old D, old A, old B, old C]

                // For Counter-Clockwise ('):
                // Reverse direction: A <- B <- C <- D
                // new A = old B
                // new B = old C
                // new C = old D
                // new D = old A
                // New: [valB, valC, valD, valA]

                newColors = [colors[1], colors[2], colors[3], colors[0]];
            } else if (modifier === "2") {
                // Double turn
                newColors = [colors[2], colors[3], colors[0], colors[1]];
            } else {
                // Clockwise
                newColors = [colors[3], colors[0], colors[1], colors[2]];
            }

            // Apply new colors
            cycle.forEach(([f, i], idx) => {
                state[f][i] = newColors[idx];
            });
        });
    }

    return state;
};
