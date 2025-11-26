import Cube from 'cubejs';

console.log('='.repeat(60));
console.log('Testing cubejs with Valid Cube States');
console.log('='.repeat(60));

// Initialize solver
console.log('\nInitializing solver...');
Cube.initSolver();
console.log('✓ Solver initialized\n');

// Test 1: Solved cube using the constructor
console.log('=== Test 1: Constructor - Solved Cube ===');
const solvedCube = new Cube();
console.log('Is solved?', solvedCube.isSolved());
console.log('String representation:', solvedCube.asString());
const solution1 = solvedCube.solve();
console.log('Solution:', solution1 || '(empty - already solved)');
console.log('✓ PASS: Constructor creates valid solved cube\n');

// Test 2: Apply moves and solve
console.log('=== Test 2: Apply Moves and Solve ===');
const cube2 = new Cube();
const moves = "R U";
console.log('Applying moves:', moves);
cube2.move(moves);
console.log('Is solved?', cube2.isSolved());
console.log('String representation:', cube2.asString());
const solution2 = cube2.solve();
console.log('Solution:', solution2);
const moveCount2 = solution2 ? solution2.split(' ').filter(m => m).length : 0;
console.log('Move count:', moveCount2);
console.log('Expected: Should be around 2 moves\n');

// Test 3: Verify the solution actually solves it
console.log('=== Test 3: Verify Solution Works ===');
const cube3 = new Cube();
cube3.move("R U");
console.log('Applied scramble: R U');
const solution3 = cube3.solve();
console.log('Got solution:', solution3);
// Apply the solution
cube3.move(solution3);
console.log('After applying solution, is solved?', cube3.isSolved());
if (cube3.isSolved()) {
    console.log('✓ PASS: Solution correctly solves the cube\n');
} else {
    console.log('✗ FAIL: Solution did not solve the cube\n');
}

// Test 4: Random cube
console.log('=== Test 4: Random Cube ===');
const randomCube = Cube.random();
console.log('Random cube string:', randomCube.asString());
console.log('Is solved?', randomCube.isSolved());
const solution4 = randomCube.solve();
console.log('Solution:', solution4);
const moveCount4 = solution4 ? solution4.split(' ').filter(m => m).length : 0;
console.log('Move count:', moveCount4, '(should be ≤20 for Kociemba)');
randomCube.move(solution4);
console.log('After applying solution, is solved?', randomCube.isSolved());
if (randomCube.isSolved()) {
    console.log('✓ PASS: Random cube solved correctly\n');
} else {
    console.log('✗ FAIL: Random cube solution failed\n');
}

// Test 5: Test fromString with the ACTUAL solved state
console.log('=== Test 5: fromString with Solved State ===');
const solvedString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
console.log('Input string:', solvedString);
try {
    const cube5 = Cube.fromString(solvedString);
    console.log('Created cube from string');
    console.log('Is solved?', cube5.isSolved());
    console.log('Cube string:', cube5.asString());

    if (cube5.isSolved()) {
        console.log('✓ PASS: Solved string correctly recognized\n');
    } else {
        console.log('✗ FAIL: Solved string not recognized as solved');
        console.log('This means the string format might be incorrect\n');
    }
} catch (e) {
    console.error('✗ FAIL: Error creating cube from string:', e);
}

// Test 6: Compare string representations
console.log('=== Test 6: String Format Verification ===');
const testCube = new Cube();
const constructorString = testCube.asString();
console.log('String from constructor:', constructorString);
console.log('Our test string:        ', solvedString);
console.log('Are they equal?', constructorString === solvedString);

if (constructorString !== solvedString) {
    console.log('\n⚠️  WARNING: Strings differ!');
    console.log('This reveals the correct format for a solved cube.\n');

    // Character-by-character comparison
    console.log('Differences:');
    for (let i = 0; i < 54; i++) {
        if (constructorString[i] !== solvedString[i]) {
            const face = Math.floor(i / 9);
            const faceNames = ['U', 'R', 'F', 'D', 'L', 'B'];
            const posInFace = (i % 9) + 1;
            console.log(`  Position ${i} (${faceNames[face]}${posInFace}): expected '${solvedString[i]}', got '${constructorString[i]}'`);
        }
    }
}

console.log('\n' + '='.repeat(60));
console.log('Test Complete!');
console.log('='.repeat(60));
