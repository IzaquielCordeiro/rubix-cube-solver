import React from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { Color } from '../types';
import { COLOR_MAP, OPPOSITE_COLORS } from '../constants';

interface OrientationSetupProps {
    orientation: { top: Color | null; front: Color | null };
    onOrientationSelect: (type: 'top' | 'front', color: Color) => void;
    onStartScan: () => void;
}

const COLOR_CYCLE = [Color.White, Color.Yellow, Color.Green, Color.Blue, Color.Red, Color.Orange];

const OrientationSetup: React.FC<OrientationSetupProps> = ({ orientation, onOrientationSelect, onStartScan }) => {
    const isReady = orientation.top !== null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-950 text-center">
            <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl space-y-8">
                <div className="flex flex-col items-center">
                    <Settings size={32} className="text-blue-500 mb-2" />
                    <h2 className="text-2xl font-bold text-white">Set Cube Orientation</h2>
                    <p className="text-gray-400 text-sm">Tell us which face is facing UP.</p>
                </div>

                {/* Top Face Selector */}
                <div>
                    <h3 className="font-semibold text-white mb-3">Select Top Face Color</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {COLOR_CYCLE.map(color => (
                            <button key={color} onClick={() => onOrientationSelect('top', color)} className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${orientation.top === color ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-700 hover:border-gray-500'}`}>
                                <div className="w-full h-8 rounded" style={{ backgroundColor: COLOR_MAP[color] }}></div>
                                <span className="text-xs capitalize mt-2 block">{color}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Front Face Selector */}
                {orientation.top && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="font-semibold text-white mb-3">Select Front Face Color</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {COLOR_CYCLE.filter(c => c !== orientation.top && c !== OPPOSITE_COLORS[orientation.top!]).map(color => (
                                <button key={color} onClick={() => onOrientationSelect('front', color)} className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${orientation.front === color ? 'border-blue-500 scale-110 shadow-lg' : 'border-gray-700 hover:border-gray-500'}`}>
                                    <div className="w-full h-8 rounded" style={{ backgroundColor: COLOR_MAP[color] }}></div>
                                    <span className="text-xs capitalize mt-2 block">{color}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={onStartScan}
                    disabled={!orientation.top || !orientation.front}
                    className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:bg-gray-700 disabled:text-gray-500 cursor-pointer disabled:cursor-not-allowed"
                >
                    Start Guided Scan <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default OrientationSetup;
