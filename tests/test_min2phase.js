
import min2phase from 'min2phase.js';

console.log('Exports:', Object.keys(min2phase));

// Initialize the solver (might take a moment)
console.log('Initializing...');
// Based on exports, it seems initFull is the initialization function
if (min2phase.initFull) {
    min2phase.initFull();
} else {
    console.log('Warning: initFull not found');
}

// Create a search object
const search = new min2phase.Search();

// Solved string (URFDLB order)
const solvedString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

// Try to solve
console.log('Solving solved cube...');
const result = search.solution(solvedString, 21, 100000, 0, 0);
console.log('Result:', result);

// Try a simple scramble: U move
const uMoveString =
    'UUUUUUUUU' +
    'BBBRRRRRR' +
    'RRRFFFFFF' +
    'DDDDDDDDD' +
    'FFFLLLLLL' +
    'LLLBBBBBB';

console.log('Solving U-move cube...');
const resultU = search.solution(uMoveString, 21, 100000, 0, 0);
console.log('Result U:', resultU);
