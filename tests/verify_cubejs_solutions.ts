import Cube from 'cubejs';

Cube.initSolver();

console.log('Testing if cube.js solutions actually work...\n');

// Test: Apply U move, solve, verify
console.log('=== Test: U Move ===');
const cube = new Cube();
console.log('Initial - Is solved?:', cube.isSolved());

cube.move('U');
console.log('After U - Is solved?:', cube.isSolved());

const solution = cube.solve();
console.log('Solution:', solution);

// Apply the solution
cube.move(solution);
console.log('After applying solution - Is solved?:', cube.isSolved());

// Test with user's cube state directly if possible
console.log('\n=== Test: From User String ===');
const userString = 'UUUUUUDDDLRRLRRLRRFFFFFFFFFDDDDDDUUULLRLLRLLRBBBBBBBBB';
try {
    const userCube = Cube.fromString(userString);
    console.log('User cube created. Is solved?:', userCube.isSolved());
    const userSolution = userCube.solve();
    console.log('Solution:', userSolution);
    if (userSolution) {
        console.log('Solution length:', userSolution.split(' ').length, 'moves');
    }
} catch (e) {
    console.error('Error:', e.message);
}
