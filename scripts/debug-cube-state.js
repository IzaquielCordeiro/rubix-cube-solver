// Debug script to analyze cube state from localStorage
// Run in browser console: copy and paste this entire script

const cubeState = JSON.parse(localStorage.getItem("lastCubeState"));

console.log("=== CUBE STATE ANALYSIS ===");
console.log("\nRaw Cube State:", cubeState);

// Face mapping
const faceNames = {
    F: "Front (White)",
    R: "Right (Orange)",
    B: "Back (Yellow)",
    L: "Left (Red)",
    U: "Up (Green)",
    D: "Down (Blue)"
};

// Print each face with grid visualization
Object.entries(cubeState).forEach(([face, colors]) => {
    console.log(`\n${faceNames[face]}:`);
    console.log(`${colors[0]} ${colors[1]} ${colors[2]}`);
    console.log(`${colors[3]} ${colors[4]} ${colors[5]}`);
    console.log(`${colors[6]} ${colors[7]} ${colors[8]}`);
});

// Check color counts
const colorCounts = {};
Object.values(cubeState).flat().forEach(color => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
});

console.log("\n=== COLOR COUNTS ===");
console.log(colorCounts);

// Check for opposite colors on edges
const OPPOSITE_COLORS = {
    white: "yellow",
    yellow: "white",
    green: "blue",
    blue: "green",
    red: "orange",
    orange: "red"
};

const EDGE_PIECES = [
    // Format: [face, index, adjacentFace, adjacentIndex]
    ["U", 1, "B", 1],
    ["U", 3, "L", 1],
    ["U", 5, "R", 1],
    ["U", 7, "F", 1],
    ["F", 3, "L", 5],
    ["F", 5, "R", 3],
    ["F", 7, "D", 1],
    ["R", 5, "B", 3],
    ["R", 7, "D", 5],
    ["B", 5, "L", 3],
    ["B", 7, "D", 7],
    ["L", 7, "D", 3]
];

console.log("\n=== EDGE VALIDATION ===");
let edgeErrors = [];
EDGE_PIECES.forEach(([face1, idx1, face2, idx2]) => {
    const color1 = cubeState[face1][idx1];
    const color2 = cubeState[face2][idx2];

    if (OPPOSITE_COLORS[color1] === color2) {
        const error = `INVALID EDGE: ${faceNames[face1]}[${idx1}]=${color1} <-> ${faceNames[face2]}[${idx2}]=${color2}`;
        console.log(error);
        edgeErrors.push(error);
    }
});

if (edgeErrors.length === 0) {
    console.log("All edges are valid!");
} else {
    console.log(`\nFound ${edgeErrors.length} invalid edge(s)`);
}

console.log("\n=== RECOMMENDED FIXES ===");
console.log("If you see invalid edges, the horizontal flips may be wrong.");
console.log("Try removing flips from specific faces or applying different transformations.");
