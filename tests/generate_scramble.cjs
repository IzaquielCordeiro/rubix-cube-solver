// Manually create a valid scrambled cube with a single R move
// R move rotates right face clockwise, affecting F, U, B, D edges

const solvedCube = {
    "F": ["white", "white", "white", "white", "white", "white", "white", "white", "white"],
    "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
    "B": ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
    "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
    "U": ["green", "green", "green", "green", "green", "green", "green", "green", "green"],
    "D": ["blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue"]
};

// After R move:
// - R face rotates clock wise (positions 0,1,2,5,8,7,6,3 -> 6,3,0,1,2,5,8,7)
// - F right column (2,5,8) goes to U right column (2,5,8)
// - U right column (2,5,8) goes to B left column (6,3,0)  
// - B left column (6,3,0) goes to D right column (2,5,8)
// - D right column (2,5,8) goes to F right column (2,5,8)

const scrambledCube = {
    "F": ["white", "white", "blue", "white", "white", "blue", "white", "white", "blue"],
    "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],  // Rotated but all same color
    "B": ["green", "yellow", "yellow", "green", "yellow", "yellow", "green", "yellow", "yellow"],
    "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],  // Unchanged
    "U": ["green", "green", "white", "green", "green", "white", "green", "green", "white"],
    "D": ["blue", "blue", "yellow", "blue", "blue", "yellow", "blue", "blue", "yellow"]
};

console.log('Scrambled cube (R move):');
console.log(JSON.stringify(scrambledCube, null, 2));

// Verify color counts
const colorCounts = {};
Object.values(scrambledCube).forEach(face => {
    face.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
});

console.log('\nColor counts:');
Object.entries(colorCounts).forEach(([color, count]) => {
    console.log(`  ${color}: ${count}/9 ${count === 9 ? '✓' : '✗'}`);
});

const allValid = Object.values(colorCounts).every(count => count === 9);
console.log('\nValid:', allValid ? '✓ YES' : '✗ NO');
