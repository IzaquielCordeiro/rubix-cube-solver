import { Color, CubeState, Face } from '../types';
import { applyMove } from '../utils/cubeManipulator';

const userCubeState: CubeState = {
    F: [Color.Red, Color.Red, Color.Red, Color.White, Color.White, Color.White, Color.White, Color.White, Color.White],
    R: [Color.White, Color.White, Color.White, Color.Orange, Color.Orange, Color.Orange, Color.Orange, Color.Orange, Color.Orange],
    B: [Color.Orange, Color.Orange, Color.Orange, Color.Yellow, Color.Yellow, Color.Yellow, Color.Yellow, Color.Yellow, Color.Yellow],
    L: [Color.Yellow, Color.Yellow, Color.Yellow, Color.Red, Color.Red, Color.Red, Color.Red, Color.Red, Color.Red],
    U: [Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green, Color.Green],
    D: [Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue, Color.Blue]
};

console.log('===User Cube Analysis ===\n');

// Helper to check if cube is solved
const isSolved = (state: CubeState): boolean => {
    return Object.values(Face).every(face => {
        const colors = state[face];
        const firstColor = colors[0];
        return colors.every(c => c === firstColor);
    });
};

console.log('Initial state solved?', isSolved(userCubeState));

// Try all single moves
console.log('\n=== Testing Single Moves ===');
const singleMoves = ['F', 'F\'', 'F2', 'R', 'R\'', 'R2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'L', 'L\'', 'L2', 'B', 'B\'', 'B2'];

for (const move of singleMoves) {
    const result = applyMove(userCubeState, move);
    if (isSolved(result)) {
        console.log(`✅ SOLVED with single move: ${move}`);
    }
}

// Try all 2-move combinations
console.log('\n=== Testing 2-Move Combinations ===');
let foundSolution = false;
for (const move1 of singleMoves) {
    const state1 = applyMove(userCubeState, move1);
    for (const move2 of singleMoves) {
        const state2 = applyMove(state1, move2);
        if (isSolved(state2)) {
            console.log(`✅ SOLVED with 2 moves: ${move1} ${move2}`);
            foundSolution = true;

            // Verify
            console.log('\nVerifying solution:');
            console.log('Initial state:', {
                F_top_row: userCubeState.F.slice(0, 3),
                R_top_row: userCubeState.R.slice(0, 3),
            });

            const afterMove1 = applyMove(userCubeState, move1);
            console.log(`After ${move1}:`, {
                F_top_row: afterMove1.F.slice(0, 3),
                R_top_row: afterMove1.R.slice(0, 3),
            });

            console.log(`After ${move2}:`, {
                F_top_row: state2.F.slice(0, 3),
                R_top_row: state2.R.slice(0, 3),
                'All faces uniform?': isSolved(state2)
            });

            break;
        }
    }
    if (foundSolution) break;
}

if (!foundSolution) {
    console.log('❌ No 2-move solution found. Testing 3 moves...');

    // Try 3 moves
    for (const move1 of ['U', 'U\'', 'U2']) {
        const state1 = applyMove(userCubeState, move1);
        for (const move2 of singleMoves.slice(0, 6)) { // Only F and R variants
            const state2 = applyMove(state1, move2);
            for (const move3 of singleMoves.slice(0, 6)) {
                const state3 = applyMove(state2, move3);
                if (isSolved(state3)) {
                    console.log(`✅ SOLVED with 3 moves: ${move1} ${move2} ${move3}`);
                    foundSolution = true;
                    break;
                }
            }
            if (foundSolution) break;
        }
        if (foundSolution) break;
    }
}
