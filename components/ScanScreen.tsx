import React, { useState } from 'react';
import { Brain, RotateCcw, CheckCircle } from 'lucide-react';
import { CubeState, Face, Color } from '../types';
import { FACE_LABELS, COLOR_MAP, COLOR_CYCLE } from '../constants';
import PixelScanner, { generateScanSequence } from './PixelScanner';
import Cube3D from './Cube3D';

interface ScanScreenProps {
    cubeState: CubeState;
    onFaceCaptured: (face: Face, colors: Color[]) => void;
    orientation: { top: Color | null; front: Color | null };
    scanStepIndex: number;
    onScanSuccess: () => void;
    onSolve: () => void;
    isScanningComplete: boolean;
    onReset: () => void;
    onStickerClick: (face: Face, index: number) => void;
    getScannedCount: () => number;
    colorCounts: Record<Color, number>;
    isReadyToSolve: boolean;
    onOpenDebug?: () => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({
    cubeState,
    onFaceCaptured,
    orientation,
    scanStepIndex,
    onScanSuccess,
    onSolve,
    isScanningComplete,
    onReset,
    onStickerClick,
    getScannedCount,
    colorCounts,
    isReadyToSolve,
}) => {

    const excessColors = React.useMemo(() => {
        return Object.entries(colorCounts)
            .filter(([c, count]: [string, number]) => c !== Color.Gray && count > 9)
            .map(([c]) => c as Color);
    }, [colorCounts]);

    const currentFace = React.useMemo(() => {
        if (orientation.top && orientation.front) {
            const sequence = generateScanSequence(orientation.top, orientation.front);
            return sequence[scanStepIndex]?.face || null;
        }
        return null;
    }, [orientation, scanStepIndex]);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row gap-6 p-4 md:p-8">
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">


                <PixelScanner
                    cubeState={cubeState}
                    onFaceCaptured={onFaceCaptured}
                    orientation={orientation as { top: Color; front: Color; }}
                    scanStepIndex={scanStepIndex}
                    onScanSuccess={onScanSuccess}
                />

                {/* Progress & Solve Button */}
                <div className="mt-6 w-full bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-sm">
                            <span className="block text-white font-bold text-lg">{getScannedCount()} / 6</span>
                            Faces Scanned
                        </div>

                        <button
                            onClick={onSolve}
                            disabled={!isReadyToSolve}
                            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${isReadyToSolve
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-105 cursor-pointer'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Brain size={18} />
                            Solve Cube
                        </button>
                    </div>

                    {/* Color Counts Grid */}
                    <div className="grid grid-cols-6 gap-2 pt-4 border-t border-gray-800">
                        {Object.values(Color).filter(c => c !== Color.Gray).map(color => {
                            const count = colorCounts[color];
                            const isComplete = count === 9;
                            const isOver = count > 9;

                            return (
                                <div key={color} className={`flex flex-col items-center p-2 rounded-lg border ${isComplete ? 'border-green-500/30 bg-green-500/10' : isOver ? 'border-red-500/30 bg-red-500/10' : 'border-gray-800 bg-gray-900'}`}>
                                    <div className="w-4 h-4 rounded-full mb-1 shadow-sm" style={{ backgroundColor: COLOR_MAP[color] }} />
                                    <span className={`text-xs font-bold ${isComplete ? 'text-green-400' : isOver ? 'text-red-400' : 'text-gray-500'}`}>
                                        {count}/9
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Live 3D Preview */}
            <div className="flex-1 bg-gray-900 rounded-2xl p-8 flex flex-col items-center justify-center border border-gray-800 shadow-inner min-h-[400px]">
                <div className="flex justify-between w-full mb-4">
                    <h3 className="text-gray-400 font-bold tracking-wider text-sm uppercase">3D Model</h3>
                    <button onClick={onReset} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>

                <Cube3D
                    state={cubeState}
                    onStickerClick={onStickerClick}
                    focusedFace={currentFace}
                    highlightColors={excessColors}
                />

                <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-gray-500 w-full max-w-xs">
                    {Object.values(Face).map(face => {
                        const isDone = cubeState[face][4] !== Color.Gray;
                        const centerColor = cubeState[face][4];
                        return (
                            <div key={face} className="flex items-center justify-between px-2 py-1 rounded bg-gray-800/50">
                                <span className="flex items-center gap-2">
                                    {centerColor !== Color.Gray ? (
                                        <>
                                            <span className="font-bold capitalize" style={{ color: COLOR_MAP[centerColor] }}>
                                                {centerColor}
                                            </span>
                                            <span className="text-[10px] opacity-50">({FACE_LABELS[face]})</span>
                                        </>
                                    ) : (
                                        FACE_LABELS[face]
                                    )}
                                </span>
                                {isDone ? <CheckCircle size={14} className="text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
                            </div>
                        )
                    })}
                </div>
            </div>


        </div>
    );
};

export default ScanScreen;
