import { Color } from '../types';

/**
 * Rotates a 3x3 grid of colors 90 degrees clockwise.
 * 
 * Input indices:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 * 
 * Output indices:
 * 6 3 0
 * 7 4 1
 * 8 5 2
 */
export const rotateGridClockwise = (grid: Color[]): Color[] => {
    if (grid.length !== 9) {
        throw new Error("Grid must have exactly 9 elements");
    }

    const newGrid = [...grid];

    // Row 0
    newGrid[0] = grid[6];
    newGrid[1] = grid[3];
    newGrid[2] = grid[0];

    // Row 1
    newGrid[3] = grid[7];
    newGrid[4] = grid[4];
    newGrid[5] = grid[1];

    // Row 2
    newGrid[6] = grid[8];
    newGrid[7] = grid[5];
    newGrid[8] = grid[2];

    return newGrid;
};

/**
 * Rotates a 3x3 grid of colors 90 degrees counter-clockwise.
 * 
 * Input indices:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 * 
 * Output indices:
 * 2 5 8
 * 1 4 7
 * 0 3 6
 */
export const rotateGridCounterClockwise = (grid: Color[]): Color[] => {
    if (grid.length !== 9) {
        throw new Error("Grid must have exactly 9 elements");
    }

    const newGrid = [...grid];

    // Row 0
    newGrid[0] = grid[2];
    newGrid[1] = grid[5];
    newGrid[2] = grid[8];

    // Row 1
    newGrid[3] = grid[1];
    newGrid[4] = grid[4];
    newGrid[5] = grid[7];

    // Row 2
    newGrid[6] = grid[0];
    newGrid[7] = grid[3];
    newGrid[8] = grid[6];

    return newGrid;
};

/**
 * Flips a 3x3 grid horizontally (mirrors left to right).
 * 
 * Input indices:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 * 
 * Output indices:
 * 2 1 0
 * 5 4 3
 * 8 7 6
 */
export const flipGridHorizontal = (grid: Color[]): Color[] => {
    if (grid.length !== 9) {
        throw new Error("Grid must have exactly 9 elements");
    }

    return [
        grid[2], grid[1], grid[0],
        grid[5], grid[4], grid[3],
        grid[8], grid[7], grid[6]
    ];
};

/**
 * Rotates a 3x3 grid 180 degrees.
 * 
 * Input indices:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 * 
 * Output indices:
 * 8 7 6
 * 5 4 3
 * 2 1 0
 */
export const rotateGrid180 = (grid: Color[]): Color[] => {
    if (grid.length !== 9) {
        throw new Error("Grid must have exactly 9 elements");
    }

    return [
        grid[8], grid[7], grid[6],
        grid[5], grid[4], grid[3],
        grid[2], grid[1], grid[0]
    ];
};
