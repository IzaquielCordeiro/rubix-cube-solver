import Cube from 'cubejs';

// Test cube.js directly
console.log('Testing cube.js directly...');

// Test 1: Solved cube
console.log('\n=== Test 1: Solved Cube ===');
const solved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
console.log('Input:', solved);
try {
    Cube.initSolver();
    const cube1 = Cube.fromString(solved);
    const solution1 = cube1.solve();
    console.log('Solution:', solution1);
    console.log('Moves count:', solution1 ? solution1.split(' ').filter(m => m).length : 0);
} catch (e) {
    console.error('Error:', e);
}

// Test 2: Simple scramble - just U move
console.log('\n=== Test 2: Single U Move ===');
const oneMove = 'UUUUUUUUULLLFRRFRRFFFFFFFFFDDDDDDDDDRRRLLLLLLBBBBBBBBB';
console.log('Input:', oneMove);
try {
    const cube2 = Cube.fromString(oneMove);
    const solution2 = cube2.solve();
    console.log('Solution:', solution2);
    console.log('Moves count:', solution2 ? solution2.split(' ').filter(m => m).length : 0);
} catch (e) {
    console.error('Error:', e);
}
