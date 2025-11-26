
import min2phase from 'min2phase';

console.log('Type of min2phase:', typeof min2phase);
console.log('Exports:', Object.keys(min2phase));

if (min2phase.solve) {
    console.log('Found solve function.');
}

if (min2phase.init) {
    console.log('Found init function.');
    min2phase.init();
} else if (min2phase.initialize) {
    console.log('Found initialize function.');
    min2phase.initialize();
}

// Common Kociemba string: URFDLB order
// Solved: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
const solvedString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';

try {
    console.log('Attempting to solve solved cube string...');
    const solution = min2phase.solve(solvedString);
    console.log('Solution:', solution);
} catch (e) {
    console.log('Error solving string:', e.message);
}
