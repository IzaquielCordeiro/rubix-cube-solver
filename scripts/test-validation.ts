
import { validateCubeState } from '../utils/cubeValidator';
import { CubeState, Face, Color } from '../types';
import { INITIAL_CUBE_STATE } from '../constants';

// Helper to create a deep copy of the initial state
const createSolvedState = (): CubeState => {
    return JSON.parse(JSON.stringify(INITIAL_CUBE_STATE));
};

// Helper to set a face to a specific color
const setFaceColor = (state: CubeState, face: Face, color: Color) => {
    state[face] = Array(9).fill(color);
};

// Helper to create a fully solved state (manually setting colors as INITIAL_CUBE_STATE is all Gray)
const getSolvedCube = (): CubeState => {
    const state = createSolvedState();
    setFaceColor(state, Face.Up, Color.White);
    setFaceColor(state, Face.Down, Color.Yellow);
    setFaceColor(state, Face.Front, Color.Green);
    setFaceColor(state, Face.Back, Color.Blue);
    setFaceColor(state, Face.Right, Color.Orange); // Using Orange for Right based on recent fix
    setFaceColor(state, Face.Left, Color.Red);     // Using Red for Left based on recent fix
    return state;
};

const runTests = () => {
    console.log("Running Cube Validation Tests...\n");
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, testName: string) => {
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${testName}`);
            failed++;
        }
    };

    // Test 1: Solved Cube
    const solvedCube = getSolvedCube();
    const result1 = validateCubeState(solvedCube);
    assert(result1.isValid, "Solved cube should be valid");

    // Test 2: Incomplete Scan (Gray stickers)
    const incompleteCube = getSolvedCube();
    incompleteCube[Face.Front][0] = Color.Gray;
    const result2 = validateCubeState(incompleteCube);
    assert(!result2.isValid && result2.message.includes("not been scanned"), "Cube with Gray stickers should be invalid");

    // Test 3: Incorrect Color Counts (8 White, 10 Yellow)
    const badCountCube = getSolvedCube();
    badCountCube[Face.Up][0] = Color.Yellow; // Replace one White with Yellow
    const result3 = validateCubeState(badCountCube);
    assert(!result3.isValid && result3.message.includes("Incorrect number of stickers"), "Cube with incorrect counts should be invalid");

    // Test 4: Impossible Edge (White/Yellow Edge)
    // UF Edge: Up[7], Front[1]
    // Swap Front[1] (Green) with a Yellow sticker from Down to maintain valid counts
    const impossibleEdgeCube = getSolvedCube();
    impossibleEdgeCube[Face.Front][1] = Color.Yellow;
    impossibleEdgeCube[Face.Down][0] = Color.Green; // Balance counts

    const result4 = validateCubeState(impossibleEdgeCube);
    assert(!result4.isValid && result4.message.includes("Impossible edge"), `Cube with opposite colors on edge should be invalid. Got: ${result4.message}`);

    // Test 5: Impossible Corner (White/Yellow/Orange Corner)
    // UFR Corner: Up[8], Front[2], Right[0]
    // Set Front[2] to Yellow (Opposite of White Up[8]) and balance counts
    const impossibleCornerCube = getSolvedCube();
    impossibleCornerCube[Face.Front][2] = Color.Yellow;
    impossibleCornerCube[Face.Down][2] = Color.Green; // Balance counts

    const result5 = validateCubeState(impossibleCornerCube);
    assert(!result5.isValid && result5.message.includes("Impossible corner"), `Cube with opposite colors on corner should be invalid. Got: ${result5.message}`);

    console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed.`);
};

runTests();
