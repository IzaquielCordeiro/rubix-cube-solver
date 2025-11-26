// @ts-ignore
import cubeSolver from 'cube-solver';

// Test using the library's scramble function to verify it works
console.log('Testing cube-solver with its own scramble function...\n');

// Initialize the solver
cubeSolver.initialize('kociemba');
console.log('✓ Solver initialized\n');

// Test 1: Generate a scramble and solve it
console.log('=== Test 1: Scramble and Solve ===');
const scramble1 = cubeSolver.scramble('3x3');
console.log('Generated scramble:', scramble1);

try {
    const solution1 = cubeSolver.solve(scramble1, 'kociemba');
    console.log('Solution:', solution1);
    const moveCount = solution1 ? solution1.split(' ').filter(m => m).length : 0;
    console.log('Moves count:', moveCount);
    console.log('✓ Successfully solved a scramble\n');
} catch (e) {
    console.error('✗ Error solving:', e);
}

// Test 2: Try with a known simple scramble
console.log('=== Test 2: Known Simple Scramble (R U) ===');
const scramble2 = "R U";
console.log('Scramble:', scramble2);

try {
    const solution2 = cubeSolver.solve(scramble2, 'kociemba');
    console.log('Solution:', solution2);
    const moveCount = solution2 ? solution2.split(' ').filter(m => m).length : 0;
    console.log('Moves count:', moveCount);
    console.log('Expected: Should be close to 2 moves (U\' R\' or equivalent)\n');
} catch (e) {
    console.error('✗ Error solving:', e);
}

// Test 3: Empty scramble (solved cube)
console.log('=== Test 3: Empty Scramble (Solved Cube) ===');
const scramble3 = "";
console.log('Scramble:', scramble3 || '(empty)');

try {
    const solution3 = cubeSolver.solve(scramble3, 'kociemba');
    console.log('Solution:', solution3);
    const moveCount = solution3 ? solution3.split(' ').filter(m => m).length : 0;
    console.log('Moves count:', moveCount);
    console.log('Expected: 0 moves (already solved)\n');
} catch (e) {
    console.error('✗ Error solving:', e);
}
