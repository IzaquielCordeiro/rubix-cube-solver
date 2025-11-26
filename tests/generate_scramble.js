// Generate a valid scrambled cube using rubiks-cube-solver library
const { Solver } = require('rubiks-cube-solver');

// Start with solved cube
const solvedState = {
    "F": ["white", "white", "white", "white", "white", "white", "white", "white", "white"],
    "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
    "B": ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
    "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
    "U": ["green", "green", "green", "green", "green", "green", "green", "green", "green"],
    "D": ["blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue"]
};

// Apply scramble moves: R U R' U' (simple 4-move scramble)
const scrambleMoves = ["R", "U", "R'", "U'"];

console.log('Starting with solved cube...');
console.log('Applying scramble:', scrambleMoves.join(' '));

// Create solver and apply moves
const solver = new Solver();
const scrambledCube = solver.solve(solvedState, scrambleMoves);

console.log('\nScrambled cube state:');
console.log(JSON.stringify(scrambledCube, null, 2));

// Verify color counts
const colorCounts = {};
Object.values(scrambledCube).forEach(face => {
    face.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
});

console.log('\nColor counts:');
console.log(colorCounts);

const allValid = Object.values(colorCounts).every(count => count === 9);
console.log('\nAll colors have 9 stickers:', allValid ? '✓ YES' : '✗ NO');
