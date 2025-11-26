import React, { useState } from 'react';
import { Bug, X, Upload } from 'lucide-react';
import { CubeState } from '../types';

interface DebugDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadState: (state: CubeState) => void;
}

const DebugDialog: React.FC<DebugDialogProps> = ({ isOpen, onClose, onLoadState }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleLoad = () => {
        try {
            const parsed = JSON.parse(jsonInput);

            // Validate that it has the correct structure
            const requiredFaces = ['F', 'R', 'B', 'L', 'U', 'D'];
            const missingFaces = requiredFaces.filter(face => !parsed[face]);

            if (missingFaces.length > 0) {
                setError(`Missing faces: ${missingFaces.join(', ')}`);
                return;
            }

            // Validate each face has 9 colors
            for (const face of requiredFaces) {
                if (!Array.isArray(parsed[face]) || parsed[face].length !== 9) {
                    setError(`Face ${face} must have exactly 9 colors`);
                    return;
                }
            }

            onLoadState(parsed as CubeState);
            setJsonInput('');
            setError(null);
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
    };

    const handlePasteExample = () => {
        const example = {
            "F": ["white", "white", "white", "white", "white", "white", "white", "white", "white"],
            "R": ["orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange", "orange"],
            "B": ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
            "L": ["red", "red", "red", "red", "red", "red", "red", "red", "red"],
            "U": ["green", "green", "green", "green", "green", "green", "green", "green", "green"],
            "D": ["blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue"]
        };
        setJsonInput(JSON.stringify(example, null, 2));
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Bug className="text-yellow-500" size={24} />
                        <h2 className="text-xl font-bold text-white">Debug Mode - Load Cube State</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                    Paste a cube state JSON object below. The format should match the structure from localStorage.
                </p>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-300">Cube State JSON:</label>
                        <button
                            onClick={handlePasteExample}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded transition-colors"
                        >
                            Paste Solved Cube Example
                        </button>
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => {
                            setJsonInput(e.target.value);
                            setError(null);
                        }}
                        className="w-full h-64 bg-gray-950 border border-gray-700 rounded-lg p-3 text-gray-300 font-mono text-sm focus:outline-none focus:border-blue-500"
                        placeholder='{\n  "F": ["white", "white", ...],\n  "R": ["orange", ...],\n  ...\n}'
                    />
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={handleLoad}
                        disabled={!jsonInput.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <Upload size={20} />
                        Load Cube State
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                        Cancel
                    </button>
                </div>

                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400">
                    <p className="font-semibold mb-1">Tip:</p>
                    <p>You can get the last scanned cube state from localStorage:</p>
                    <code className="block mt-2 bg-gray-950 p-2 rounded">
                        JSON.parse(localStorage.getItem("lastCubeState"))
                    </code>
                </div>
            </div>
        </div>
    );
};

export default DebugDialog;
