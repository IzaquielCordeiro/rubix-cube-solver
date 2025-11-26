// Test rubiks-cube-solver library
// This library uses lowercase letters: f, r, u, d, l, b
// And uses the Fridrich Method

import solve from 'rubiks-cube-solver';

console.log('='.repeat(60));
console.log('Testing rubiks-cube-solver Library');
console.log('='.repeat(60));
console.log('\nNote: This library uses lowercase letters (f,r,u,d,l,b)');
console.log('Format: Front, Right, Up, Down, Left, Back faces\n');

// Test 1: Solved cube
console.log('=== Test 1: Solved Cube ===');
// For a solved cube, all facelets on each face have that face's color
const solvedCube = 'f'.repeat(9) + 'r'.repeat(9) + 'u'.repeat(9) + 'd'.repeat(9) + 'l'.repeat(9) + 'b'.repeat(9);
console.log('Input:', solvedCube);
try {
    const solution1 = solve(solvedCube);
    console.log('Solution:', solution1);
    const moveCount = solution1 ? solution1.split(' ').filter(m => m).length : 0;
    console.log('Move count:', moveCount);
    if (moveCount === 0 || solution1 === '') {
        console.log('✓ PASS: Correctly recognized as solved\n');
    } else {
        console.log('✗ FAIL: Should return 0 moves for solved cube\n');
    }
} catch (e) {
    console.error('✗ Error:', e.message);
    console.log('');
}

// Test 2: Test the partitioned option
console.log('=== Test 2: Solved Cube with Partitioned Option ===');
try {
    const solution2 = solve(solvedCube, { partitioned: true });
    console.log('Solution (partitioned):', JSON.stringify(solution2, null, 2));
    console.log('');
} catch (e) {
    console.error('✗ Error:', e.message);
    console.log('');
}

// Test 3: Try a simple scrambled state
// This is harder - we'd need to know what a valid state string looks like
// Let's try to construct one manually for a U move
console.log('=== Test 3: Attempting Simple Scramble ===');
console.log('Note: Constructing a valid cube state is complex');
console.log('This test may fail if the state is invalid\n');

// For a U move from solved: the U face rotates, affecting U face and top row of R, F, L, B faces
// This is an approximation - may not be perfect
const attemptedScramble = 'uuuuuuuuu' + 'rrrrrrrdr' + 'fffffffff' + 'ddddddddd' + 'lllllllll' + 'bbbbbbbbb';
console.log('Attempting with:', attemptedScramble);
try {
    const solution3 = solve(attemptedScramble);
    console.log('Solution:', solution3);
    const moveCount = solution3 ? solution3.split(' ').filter(m => m).length : 0;
    console.log('Move count:', moveCount);
} catch (e) {
    console.error('✗ Error:', e.message);
    console.log('This is expected - manually creating valid states is difficult');
}

console.log('\n' + '='.repeat(60));
console.log('Test Complete!');
console.log('='.repeat(60));
