import React from 'react';
import { useCube } from './hooks/useCube';
import { INITIAL_CUBE_STATE } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import OrientationSetup from './components/OrientationSetup';
import ScanScreen from './components/ScanScreen';
import SolvingScreen from './components/SolvingScreen';
import ResultScreen from './components/ResultScreen';


const App: React.FC = () => {
  const {
    cubeState,
    setCubeState,
    phase,
    setPhase,
    solution,
    orientation,
    scanStepIndex,
    handleFaceCaptured,
    handleStickerClick,
    getScannedCount,
    isScanningComplete,
    handleSolveClick,
    generateSolution,
    resetApp,
    resetScanProgress,
    handleOrientationSelect,
    handleScanSuccess,
    getColorCounts,
    isReadyToSolve
  } = useCube();



  if (phase === 'WELCOME') {
    return (
      <WelcomeScreen
        onStart={() => {
          console.log('Start button clicked');
          setPhase('SCAN');
          resetScanProgress();
        }}
      />
    );
  }

  // Phase ORIENTATION_SETUP is deprecated


  if (phase === 'SCAN') {
    return (
      <ScanScreen
        cubeState={cubeState}
        onFaceCaptured={handleFaceCaptured}
        orientation={orientation}
        scanStepIndex={scanStepIndex}
        onScanSuccess={handleScanSuccess}
        onSolve={handleSolveClick}
        isScanningComplete={isScanningComplete}
        onReset={resetScanProgress}
        onStickerClick={handleStickerClick}
        getScannedCount={getScannedCount}
        colorCounts={getColorCounts()}
        isReadyToSolve={isReadyToSolve()}
      />
    );
  }

  if (phase === 'SOLVING') {
    return <SolvingScreen />;
  }

  if (phase === 'RESULT' && solution) {
    return (
      <ResultScreen
        solution={solution}
        cubeState={cubeState}
        onReset={resetApp}
        onSolveAnyway={() => generateSolution(true)}
        onStickerClick={handleStickerClick}
      />
    );
  }

  return null;
};

export default App;