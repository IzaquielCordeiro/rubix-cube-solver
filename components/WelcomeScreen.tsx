import React from 'react';
import { Box, Play } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580894910986-246bb24337c1?q=80&w=2560&auto=format&fit=crop')] opacity-20 bg-cover bg-center pointer-events-none" />

      <div className="relative z-10 max-w-lg space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-4">
          <Box size={48} className="text-white" />
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight">
          Rubik's<span className="text-blue-500">Mind</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Scan your cube with the pixel-picker and get the solution instantly.
        </p>

        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
        >
          Start <Play className="ml-2" size={20} />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
