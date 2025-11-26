import Cube from 'cubejs';

console.log('Testing cube.js fromString with corrected format...\n');

Cube.initSolver();

// Test 1: Identity cube to see expected format
console.log('=== Test 1: Identity Cube asString ===');
const identity = new Cube();
console.log('Identity cube asString():', identity.asString());
console.log('Is solved?:', identity.isSolved());
const sol1 = identity.solve();
console.log('Solution:', sol1 || '(empty - already solved)');

// Test 2: Solved cube string  
console.log('\n=== Test 2: Solved Cube from String ===');
const solved = 'UUUUUUUUULLLLLLLLLFFFFFFFFFRRRRRRRRRBBBBBBBBBDDDDDDDDD';
console.log('String:', solved);
try {
    const cube2 = Cube.fromString(solved);
    console.log('Is solved?:', cube2.isSolved());
    const sol2 = cube2.solve();
    console.log('Solution:', sol2 || '(empty - already solved)');
} catch (e) {
    console.error('Error:', e.message);
}
