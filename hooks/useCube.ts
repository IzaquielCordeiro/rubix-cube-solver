import { useState } from 'react';
import { CubeState, Face, Color, SolutionResponse } from '../types';
import { INITIAL_CUBE_STATE, OPPOSITE_COLORS, STANDARD_CORNER } from '../constants';
import { solveCubeWithAlgorithm } from '../services/algorithmicSolver';

const COLOR_CYCLE = [Color.White, Color.Yellow, Color.Green, Color.Blue, Color.Red, Color.Orange];

export const useCube = () => {
  const [cubeState, setCubeState] = useState<CubeState>(INITIAL_CUBE_STATE);
  const [phase, setPhase] = useState<'WELCOME' | 'ORIENTATION_SETUP' | 'SCAN' | 'SOLVING' | 'RESULT'>('WELCOME');
  const [solution, setSolution] = useState<SolutionResponse | null>(null);
  const [orientation, setOrientation] = useState<{ top: Color | null; front: Color | null }>({ top: Color.White, front: Color.Green });
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // ---------- Face handling ----------
  const handleFaceCaptured = (face: Face, colors: Color[]) => {
    setCubeState(prev => ({ ...prev, [face]: colors }));
  };

  const handleStickerClick = (face: Face, index: number, newColor?: Color) => {
    if (index === 4) return; // center stays fixed
    setCubeState(prev => {
      const currentFaceState = prev[face];
      const currentColor = currentFaceState[index];

      let nextColor: Color;
      if (newColor) {
        nextColor = newColor;
      } else {
        const currentIdx = COLOR_CYCLE.indexOf(currentColor);
        const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % COLOR_CYCLE.length;
        nextColor = COLOR_CYCLE[nextIdx];
      }

      const newFaceState = [...currentFaceState];
      newFaceState[index] = nextColor;
      return { ...prev, [face]: newFaceState };
    });
  };

  // ---------- Scan progress ----------
  const getScannedCount = () => Object.values(Face).filter(f => !cubeState[f].includes(Color.Gray)).length;

  const generateSolution = (force: boolean = false) => {
    setPhase('SOLVING');
    localStorage.setItem('lastCubeState', JSON.stringify(cubeState));
    console.log('Cube state saved to localStorage.');
    setTimeout(async () => {
      const result = solveCubeWithAlgorithm(cubeState, force);
      setSolution(result);
      setPhase('RESULT');
    }, 50);
  };

  const handleSolveClick = () => {
    if (getScannedCount() === 6) {
      generateSolution();
    }
  };

  // ---------- Reset helpers ----------
  const resetScanProgress = () => {
    setCubeState(prev => {
      const newState = { ...INITIAL_CUBE_STATE };
      const top = Color.White;
      const front = Color.Green;
      const down = OPPOSITE_COLORS[top];
      const back = OPPOSITE_COLORS[front];
      let right = STANDARD_CORNER[front]?.[top];
      let left: Color;
      if (right) {
        left = OPPOSITE_COLORS[right];
      } else {
        const remaining = Object.values(Color).filter(c => c !== Color.Gray && ![top, front, down, back].includes(c));
        right = remaining[0];
        left = remaining[1];
      }
      const setCenter = (face: Face, col: Color) => {
        const arr = Array(9).fill(Color.Gray);
        arr[4] = col;
        newState[face] = arr;
      };
      setCenter(Face.Up, top);
      setCenter(Face.Front, front);
      setCenter(Face.Down, down);
      setCenter(Face.Back, back);
      setCenter(Face.Right, right);
      setCenter(Face.Left, left);
      return newState;
    });
    setScanStepIndex(0);
  };

  const resetApp = () => {
    resetScanProgress();
    setSolution(null);
    setPhase('SCAN');
  };



  // ---------- Orientation handling ----------
  const handleOrientationSelect = (type: 'top' | 'front', color: Color) => {
    console.warn('handleOrientationSelect is deprecated. Orientation is fixed.');
  };

  const handleScanSuccess = () => {
    if (scanStepIndex < 5) setScanStepIndex(scanStepIndex + 1);
  };

  // ---------- Validation helpers ----------
  const getColorCounts = () => {
    const counts: Record<Color, number> = {
      [Color.White]: 0,
      [Color.Yellow]: 0,
      [Color.Green]: 0,
      [Color.Blue]: 0,
      [Color.Red]: 0,
      [Color.Orange]: 0,
      [Color.Gray]: 0,
    };
    Object.values(Face).forEach(f => {
      cubeState[f].forEach(c => counts[c]++);
    });
    return counts;
  };

  const isReadyToSolve = () => {
    const counts = getColorCounts();
    return Object.values(Color).filter(c => c !== Color.Gray).every(c => counts[c] === 9);
  };

  return {
    cubeState,
    setCubeState,
    phase,
    setPhase,
    solution,
    orientation,
    scanStepIndex,
    setScanStepIndex,
    handleFaceCaptured,
    handleStickerClick,
    getScannedCount,
    isScanningComplete: getScannedCount() === 6,
    handleSolveClick,
    generateSolution,
    resetApp,
    resetScanProgress,
    handleOrientationSelect,
    handleScanSuccess,
    getColorCounts,
    isReadyToSolve,
  };
};
