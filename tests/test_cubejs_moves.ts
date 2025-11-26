import Cube from 'cubejs';

console.log('Testing cube.js with moves...');

// Initialize solver
Cube.initSolver();

// Test 1: Create a solved cube and apply moves
console.log('\n=== Test 1: Solved Cube ===');
const cube1 = Cube.random();
// Apply inverse to get to solved
cube1.identity();  //Reset to solved state
console.log('Is solved?:', cube1.isSolved());
const solution1 = cube1.solve();
console.log('Solution for solved cube:', solution1);

// Test 2: Apply one move
console.log('\n=== Test 2: Single U Move ===');
const cube2 = Cube.random();
cube2.identity();  // Start solved
cube2.move('U');   // Apply U move
console.log('After U move, is solved?:', cube2.isSolved());
const solution2 = cube2.solve();
console.log('Solution:', solution2);

// Test 3: Two moves
console.log('\n=== Test 3: U D Moves ===');
const cube3 = Cube.random();
cube3.identity();
cube3.move('U D');
console.log('After U D, is solved?:', cube3.isSolved());
const solution3 = cube3.solve();
console.log('Solution:', solution3);
