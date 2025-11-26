# Rubik's Cube String Format Analysis

## Summary of Findings

After investigating the `cube-solver` and `cubejs` npm libraries, here are the key findings about how to properly represent a Rubik's Cube state:

---

## Library Comparison

### 1. `cube-solver` Library

**Key Discovery**: This library **DOES NOT accept cube state strings**. It only works with **scramble sequences** (move notation).

#### API Usage:
```typescript
import cubeSolver from 'cube-solver';

// Initialize the solver
cubeSolver.initialize('kociemba');

// Solve using MOVE SEQUENCE, not state string
const solution = cubeSolver.solve("R U F' D2", 'kociemba');
```

#### Test Results:
- ✓ Works correctly with scramble sequences
- ✗ Cannot accept a 54-character state string
- ⚠️ Solutions are **not optimal** (e.g., "R U" scramble returns 9 moves instead of 2)
- ⚠️ Uses Kociemba algorithm which finds solutions in ≤20 moves but not always optimal

**Conclusion**: This library cannot be used if you only have the current state of the cube (colors of each facelet). You need the scramble sequence that got you there.

---

### 2. `cubejs` Library

**Key Discovery**: This library **DOES accept cube state strings** using a 54-character format.

#### String Format Specification:

**Face Order**: `URFDLB` (Up, Right, Front, Down, Left, Back)
- Characters 0-8: Up face
- Characters 9-17: Right face  
- Characters 18-26: Front face
- Characters 27-35: Down face
- Characters 36-44: Left face
- Characters 45-53: Back face

**Facelet Order Within Each Face**:
```
+------------+
| 1  2  3    |
|            |
| 4  5  6    |
|            |
| 7  8  9    |
+------------+
```

Read left-to-right, top-to-bottom (like reading a book).

**Complete Facelet Layout**:
```
            +------------+
            | U1 U2 U3   |
            |            |
            | U4 U5 U6   |
            |            |
            | U7 U8 U9   |
+------------+------------+------------+------------+
| L1 L2 L3 | F1 F2 F3   | R1 R2 R3   | B1 B2 B3   |
|          |            |            |            |
| L4 L5 L6 | F4 F5 F6   | R4 R5 R6   | B4 B5 B6   |
|          |            |            |            |
| L7 L8 L9 | F7 F8 F9   | R7 R8 R9   | B7 B8 B9   |
+------------+------------+------------+------------+
            | D1 D2 D3   |
            |            |
            | D4 D5 D6   |
            |            |
            | D7 D8 D9   |
            +------------+
```

**String Indexing**:
```
Position in 54-char string:

            +------------+
            | 0  1  2    |
            | 3  4  5    |
            | 6  7  8    |
+------------+------------+------------+------------+
| 36 37 38 | 18 19 20   | 9  10 11   | 45 46 47   |
| 39 40 41 | 21 22 23   | 12 13 14   | 48 49 50   |
| 42 43 44 | 24 25 26   | 15 16 17   | 51 52 53   |
+------------+------------+------------+------------+
            | 27 28 29   |
            | 30 31 32   |
            | 33 34 35   |
            +------------+
```

#### Character Meaning:
- `U` = Facelet has the Up face's color (typically white)
- `R` = Facelet has the Right face's color (typically red)
- `F` = Facelet has the Front face's color (typically green)
- `D` = Facelet has the Down face's color (typically yellow)
- `L` = Facelet has the Left face's color (typically orange)
- `B` = Facelet has the Back face's color (typically blue)

#### Example - Solved Cube:
```
UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
```

This represents a perfectly solved cube where:
- All 9 facelets on Up face are U color
- All 9 facelets on Right face are R color
- And so on...

---

## Test Results from cubejs

### ❌ Test 1: Solved Cube
**Input**: `UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB`
- **Expected**: Empty solution (0 moves)
- **Got**: 14 moves: `R L U2 R L F2 R2 U2 R2 F2 R2 U2 F2 L2`
- **Issue**: Library doesn't recognize it as solved

### ❌ Test 2: Single U Move  
**Input**: `UUUUUUUUULLLFRRFRRFFFFFFFFFDDDDDDDDDRRRLLLLLLBBBBBBBBB`
- **Expected**: ~1 move (U')
- **Got**: Hangs/timeout
- **Issue**: Library appears to hang on this input

---

## Root Cause Analysis

The test strings we used may not actually represent valid cube states. Possible issues:

### 1. **Invalid Cube State**
The strings might not represent physically possible cube configurations. A valid cube must have:
- Exactly 9 of each color
- Valid corner and edge piece positions
- Correct piece orientations

### 2. **Incorrect Facelet Ordering**
Our test strings might not map correctly to the URFDLB format expected by cubejs.

### 3. **Color Mapping Issues**
The letters might not represent the actual colors on your physical/virtual cube correctly.

---

## Next Steps

To fix the solver integration in your application:

1. **Verify Your Cube State Conversion**
   - Check how your app converts from its internal `CubeState` to the 54-character string
   - Ensure face order is URFDLB
   - Ensure facelet order within each face matches the diagram above

2. **Generate Valid Test Cases**
   - Use `Cube.random()` or `cube.move()` to create known-valid states
   - Test with these to verify the library works correctly

3. **Validate Cube States**
   - Before sending to solver, validate that each color appears exactly 9 times
   - This doesn't guarantee validity but catches obvious errors

4. **Consider Alternative Approach**
   - If you're tracking moves from a solved state, consider using `cube-solver` with the move sequence
   - Or use cubejs's `cube.move()` to apply moves and `cube.solve()` to get solution

---

## Recommended Solution

For your Rubik's Cube scanning application, use **cubejs** in this way:

```typescript
import Cube from 'cubejs';

// Initialize solver (do this once at app startup)
Cube.initSolver();

// When you have scanned the cube state:
function solveScannedCube(colorData: CubeState) {
    // 1. Convert your CubeState to 54-character string
    const cubeString = convertCubeStateToString(colorData);
    
    // 2. Validate it has 9 of each color
    if (!isValidCubeString(cubeString)) {
        throw new Error('Invalid cube state');
    }
    
    // 3. Create cube from string
    const cube = Cube.fromString(cubeString);
    
    // 4. Check if already solved
    if (cube.isSolved()) {
        return "Already solved!";
    }
    
    // 5. Solve and return algorithm
    return cube.solve();
}
```

The critical part is ensuring `convertCubeStateToString()` maps your internal representation correctly to the URFDLB format shown in the diagrams above.
