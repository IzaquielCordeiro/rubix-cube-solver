import React, { useMemo, useState, useEffect } from 'react';
import { Box, CheckCircle, RotateCcw, Play, Pause, ChevronLeft, ChevronRight, AlertTriangle, XCircle, Flag, Gauge } from 'lucide-react';
import { CubeState, SolutionResponse, Face, Color } from '../types';
import { COLOR_MAP, COLOR_CYCLE } from '../constants';
import { countStickers } from '../utils/cubeValidator';
import { applyMove } from '../utils/cubeManipulator';
import Cube3D from './Cube3D';

interface ResultScreenProps {
    solution: SolutionResponse;
    cubeState: CubeState;
    onReset: () => void;
    onSolveAnyway: () => void;
    onStickerClick: (face: Face, index: number, newColor?: Color) => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
    solution,
    cubeState,
    onReset,
    onSolveAnyway,
    onStickerClick
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1); // Default 1x speed

    const areCountsCorrect = useMemo(() => {
        const counts = countStickers(cubeState);
        return Object.entries(counts)
            .filter(([color]) => color !== Color.Gray)
            .every(([, count]) => count === 9);
    }, [cubeState]);

    const excessColors = useMemo(() => {
        const counts = countStickers(cubeState);
        return Object.entries(counts)
            .filter(([c, count]) => c !== Color.Gray && count > 9)
            .map(([c]) => c as Color);
    }, [cubeState]);

    // Compute the cube state for the current step
    const displayedCubeState = useMemo(() => {
        let state = cubeState;
        for (let i = 0; i <= currentStepIndex; i++) {
            if (solution.steps[i]) {
                state = applyMove(state, solution.steps[i].move);
            }
        }
        return state;
    }, [cubeState, currentStepIndex, solution.steps]);

    // Auto-playback effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStepIndex(prev => {
                    if (prev < solution.steps.length - 1) {
                        return prev + 1;
                    } else {
                        setIsPlaying(false);
                        return prev;
                    }
                });
            }, 1000 / speedMultiplier);
        }
        return () => clearInterval(interval);
    }, [isPlaying, solution.steps.length, speedMultiplier]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setCurrentStepIndex(prev => (prev > -1 ? prev - 1 : prev));
            } else if (e.key === 'ArrowRight') {
                setCurrentStepIndex(prev => (prev < solution.steps.length - 1 ? prev + 1 : prev));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [solution.steps.length]);

    const handleNext = () => {
        if (currentStepIndex < solution.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > -1) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handlePlayPause = () => {
        if (currentStepIndex === solution.steps.length - 1) {
            // Restart if at end
            setCurrentStepIndex(-1);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
            {/* Left Panel: 3D Model */}
            <div className="md:w-1/3 bg-gray-900 p-6 flex flex-col items-center border-r border-gray-800 sticky top-0 h-fit md:h-screen">
                <div className="w-full flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Box className="text-blue-500" /> Final Model
                    </h2>
                </div>

                <Cube3D
                    state={displayedCubeState}
                    className="scale-75 md:scale-100"
                    onStickerClick={solution.isSolvable ? undefined : onStickerClick}
                    highlightMove={currentStepIndex >= 0 ? solution.steps[currentStepIndex].move : null}
                    autoRotate={currentStepIndex === solution.steps.length - 1}
                    highlightColors={!solution.isSolvable ? excessColors : []}
                />

                {/* Playback Controls */}
                {solution.isSolvable && solution.steps.length > 0 && (
                    <div className="w-full mt-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs font-mono">
                                Step {currentStepIndex + 1} / {solution.steps.length}
                            </span>
                            <span className="text-white font-bold text-lg">
                                {currentStepIndex >= 0 ? solution.steps[currentStepIndex].move : "Start"}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <input
                            type="range"
                            min="-1"
                            max={solution.steps.length - 1}
                            value={currentStepIndex}
                            onChange={(e) => {
                                setCurrentStepIndex(parseInt(e.target.value));
                                setIsPlaying(false);
                            }}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mb-4 accent-blue-500"
                        />

                        <div className="flex items-center justify-between gap-4">
                            {/* Control Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentStepIndex === -1}
                                    className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <button
                                    onClick={handlePlayPause}
                                    className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={currentStepIndex === solution.steps.length - 1}
                                    className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Speed Control (Horizontal) */}
                            <div className="flex items-center gap-2 bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-700/50">
                                <Gauge size={14} className="text-gray-400" />
                                <input
                                    type="range"
                                    min="0.25"
                                    max="2"
                                    step="0.25"
                                    value={speedMultiplier}
                                    onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-400"
                                />
                                <span className="text-[10px] text-gray-400 font-mono w-6 text-right">
                                    {speedMultiplier}x
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 w-full space-y-3">
                    <div className={`p-4 rounded-lg border ${solution.isSolvable ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {solution.isSolvable ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                            <span className={`font-bold ${solution.isSolvable ? 'text-green-400' : 'text-red-400'}`}>
                                {solution.isSolvable ? 'Solvable' : 'Unsolvable'}
                            </span>
                        </div>
                        {solution.message && <p className="text-sm text-gray-400">{solution.message}</p>}

                        {!solution.isSolvable && solution.validationInfo && (
                            <div className="mt-4 pt-4 border-t border-red-500/20">
                                <h4 className="text-sm font-semibold text-white mb-2">Sticker Count Analysis:</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    {Object.entries(solution.validationInfo.colorCounts)
                                        .filter(([color]) => color !== 'gray')
                                        .map(([color, count]) => (
                                            <div key={color} className={`flex justify-between items-center p-1 rounded ${count !== 9 ? 'bg-red-500/20' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLOR_MAP[color as Color] }}></div>
                                                    <span className="capitalize">{color}</span>
                                                </div>
                                                <span className={`font-mono font-bold ${count !== 9 ? 'text-red-400' : 'text-green-400'}`}>{count}</span>
                                            </div>
                                        ))
                                    }
                                </div>

                                {!solution.isSolvable && areCountsCorrect && (
                                    <button
                                        onClick={onSolveAnyway}
                                        className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <AlertTriangle size={16} />
                                        Force Solve Anyway
                                    </button>
                                )}

                            </div>
                        )}
                    </div>

                    <button
                        onClick={onReset}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <RotateCcw size={16} /> Scan New Cube
                    </button>
                </div>
            </div>

            {/* Right Panel: Solution Steps */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
                <h1 className="text-3xl font-bold text-white mb-2">Solution</h1>
                <p className="text-gray-400 mb-8">Follow these steps with <b>White on Top</b> and <b>Green on Front</b>.</p>

                <div className="flex flex-wrap items-center gap-3 max-w-4xl pb-20">
                    {solution.steps.length === 0 && solution.isSolvable && (
                        <div className="text-gray-500 italic w-full">Cube is already solved!</div>
                    )}

                    {/* Start Step (0) */}
                    <React.Fragment key="start">
                        <div
                            className={`relative group flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all cursor-pointer ${currentStepIndex === -1
                                ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50 scale-110 z-10'
                                : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
                                }`}
                            onClick={() => {
                                setCurrentStepIndex(-1);
                                setIsPlaying(false);
                            }}
                        >
                            <span className={`text-xs font-mono mb-1 ${currentStepIndex === -1 ? 'text-blue-200' : 'text-gray-500'}`}>
                                0.
                            </span>
                            <span className={`text-sm font-bold ${currentStepIndex === -1 ? 'text-white' : 'text-gray-300'}`}>
                                Start
                            </span>
                        </div>
                        {solution.steps.length > 0 && <ChevronRight className="text-gray-600" size={20} />}
                    </React.Fragment>

                    {/* Solution Steps */}
                    {solution.steps.map((step, idx) => {
                        const isLast = idx === solution.steps.length - 1;
                        const isActive = idx === currentStepIndex;

                        return (
                            <React.Fragment key={idx}>
                                <div
                                    className={`relative group flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all cursor-pointer 
                                        ${isActive
                                            ? isLast
                                                ? 'bg-[linear-gradient(to_right,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#6366f1,#8b5cf6,#ef4444)] animate-gradient-x border-white shadow-xl shadow-purple-500/50 scale-110 z-10'
                                                : 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50 scale-110 z-10'
                                            : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
                                        }`}
                                    onClick={() => {
                                        setCurrentStepIndex(idx);
                                        setIsPlaying(false);
                                    }}
                                >
                                    <span className={`text-xs font-mono mb-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                        {idx + 1}.
                                    </span>
                                    <span className={`text-2xl font-black ${isActive ? 'text-white' : 'text-gray-200'}`}>
                                        {step.move}
                                    </span>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                        {step.explanation}
                                    </div>
                                </div>

                                {isLast ? (
                                    <div className="flex items-center justify-center w-8 h-8 ml-1" title="Finish!">
                                        <Flag className="text-red-500 fill-red-500 animate-bounce" size={24} />
                                    </div>
                                ) : (
                                    <ChevronRight className="text-gray-600" size={20} />
                                )}
                            </React.Fragment>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default ResultScreen;
