// @ts-ignore
import cubeSolver from 'cube-solver';

// Test cube-solver library
console.log('Testing cube-solver library...');
console.log('Initializing Kociemba solver...');

// Initialize the solver first
try {
    cubeSolver.initialize('kociemba');
    console.log('✓ Solver initialized successfully\n');
} catch (e) {
    console.error('✗ Failed to initialize solver:', e);
    process.exit(1);
}

// Test 1: Solved cube
console.log('=== Test 1: Solved Cube ===');
const solved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
console.log('Input:', solved);
try {
    const solution1 = cubeSolver.solve(solved, 'kociemba');
    console.log('Solution:', solution1);
    const moveCount1 = solution1 ? solution1.split(' ').filter(m => m).length : 0;
    console.log('Moves count:', moveCount1);
    if (moveCount1 === 0 || solution1 === '') {
        console.log('✓ PASS: Correctly identified as solved cube');
    } else {
        console.log('✗ FAIL: Should return 0 moves for solved cube, got', moveCount1, 'moves');
    }
} catch (e) {
    console.error('✗ FAIL Error:', e);
}

// Test 2: Simple scramble - just U move
console.log('\n=== Test 2: Single U Move ===');
const oneMove = 'UUUUUUUUULLLFRRFRRFFFFFFFFFDDDDDDDDDRRRLLLLLLBBBBBBBBB';
console.log('Input:', oneMove);
try {
    const solution2 = cubeSolver.solve(oneMove, 'kociemba');
    console.log('Solution:', solution2);
    const moveCount2 = solution2 ? solution2.split(' ').filter(m => m).length : 0;
    console.log('Moves count:', moveCount2);
    console.log('Expected: Should return U\' or U3 (inverse of U) - approximately 1 move');
    if (moveCount2 <= 2) {
        console.log('✓ PASS: Solution is optimal or near-optimal');
    } else {
        console.log('⚠ WARNING: Solution has', moveCount2, 'moves, expected ~1 move');
    }
} catch (e) {
    console.error('✗ FAIL Error:', e);
}

// Test 3: Two move scramble - R U
console.log('\n=== Test 3: Two Move Scramble (R U) ===');
const twoMove = 'UUUUUUUUUBRRFRRFRRFFFFFFFFFFDDDDDDDDDRRLLLLLLLBBBBBBBBB';
console.log('Input:', twoMove);
try {
    const solution3 = cubeSolver.solve(twoMove, 'kociemba');
    console.log('Solution:', solution3);
    const moveCount3 = solution3 ? solution3.split(' ').filter(m => m).length : 0;
    console.log('Moves count:', moveCount3);
    console.log('Expected: Should return 2 moves or less (U\' R\' or equivalent)');
    if (moveCount3 <= 3) {
        console.log('✓ PASS: Solution is optimal or near-optimal');
    } else {
        console.log('⚠ WARNING: Solution has', moveCount3, 'moves, expected ~2 moves');
    }
} catch (e) {
    console.error('✗ FAIL Error:', e);
}
