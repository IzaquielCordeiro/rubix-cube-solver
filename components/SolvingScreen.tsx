import React from 'react';
import { Brain } from 'lucide-react';

const SolvingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto text-blue-400" size={32} />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">Computing Solution...</h2>
            <p className="text-gray-400 mt-2">Calculating optimal moves on your device.</p>
        </div>
    );
};

export default SolvingScreen;
