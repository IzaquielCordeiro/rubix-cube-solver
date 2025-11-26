import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Check, RotateCcw, Scan, Loader2, AlertCircle, Zap, MoveRight, MoveLeft, MoveUp, MoveDown } from 'lucide-react';
import { Color, Face, CubeState } from '../types';
import { COLOR_MAP, CENTER_COLOR_TO_FACE, FACE_LABELS, ADJACENCY } from '../constants';
import { analyzeFaceColors } from '../services/geminiService';

interface ScannerProps {
  cubeState: CubeState;
  onFaceCaptured: (face: Face, colors: Color[]) => void;
}

const Scanner: React.FC<ScannerProps> = ({ cubeState, onFaceCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedFace, setLastScannedFace] = useState<Face | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Camera Setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Cannot access camera. Please allow permissions.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-Scan Loop
  useEffect(() => {
    const intervalId = setInterval(async () => {
      // Conditions to skip a scan frame
      if (isProcessing || cooldown > 0 || !videoRef.current || !canvasRef.current) return;

      await attemptScan();
    }, 1500); // Check every 1.5 seconds

    return () => clearInterval(intervalId);
  }, [isProcessing, cooldown]);

  // Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const attemptScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsProcessing(true);

    try {
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (!context) return;

      // Square crop from center
      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;

      canvas.width = 512;
      canvas.height = 512;

      // Draw normal (unmirrored) for analysis so text/logic works if needed, 
      // though colors don't care about mirroring.
      context.drawImage(video, startX, startY, size, size, 0, 0, 512, 512);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      const base64 = dataUrl.split(',')[1];

      // Analyze
      const rawColors = await analyzeFaceColors(base64);

      if (rawColors) {
        // DATA FLIP RESTORED:
        // Pure Mode (No Flip) caused "Error 2" (Mirrored Cube).
        // This PROVES the webcam is mirrored. We MUST flip the data.
        // Swap columns: 0<->2, 3<->5, 6<->8
        const colors = [
          rawColors[2], rawColors[1], rawColors[0],
          rawColors[5], rawColors[4], rawColors[3],
          rawColors[8], rawColors[7], rawColors[6]
        ];

        // Identify Face by Center Color (Index 4)
        const centerColor = colors[4];
        const identifiedFace = CENTER_COLOR_TO_FACE[centerColor];

        // Check if this face is already scanned to avoid re-scanning same face immediately
        const currentFaceColors = cubeState[identifiedFace];
        const isNew = currentFaceColors[4] === Color.Gray || cooldown === 0;

        if (identifiedFace) {
          onFaceCaptured(identifiedFace, colors);
          setLastScannedFace(identifiedFace);
          setCooldown(3); // Wait 3 seconds before scanning again
          setError(null);
        }
      }

    } catch (e) {
      console.error("Scan loop error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check scan status
  const isFaceScanned = (face: Face) => cubeState[face][4] !== Color.Gray;

  // Direction Logic
  const getSuggestion = () => {
    if (!lastScannedFace) return null;

    // Find missing faces
    const missingFaces = Object.values(Face).filter(f => !isFaceScanned(f));
    if (missingFaces.length === 0) return null;

    // Check neighbors
    const neighbors = ADJACENCY[lastScannedFace];
    if (!neighbors) return null;

    // Find a direct neighbor that is missing
    for (const [dir, face] of Object.entries(neighbors)) {
      if (!isFaceScanned(face as Face)) {
        return { direction: dir, face: face as Face };
      }
    }

    return { direction: 'any', face: missingFaces[0] };
  };

  const suggestion = getSuggestion();

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">

      {/* Header / Dashboard */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isProcessing ? <Loader2 className="animate-spin text-blue-500" size={20} /> : <Camera className="text-gray-400" size={20} />}
          <span className="font-bold text-white text-sm">
            {cooldown > 0 ? `Next scan in ${cooldown}s...` : isProcessing ? 'Analyzing...' : 'Auto-Scanner Active'}
          </span>
        </div>
        <div className="flex gap-1">
          {Object.values(Face).map(face => (
            <div
              key={face}
              className={`w-3 h-3 rounded-full border ${isFaceScanned(face) ? 'bg-green-500 border-green-400' : 'bg-gray-700 border-gray-600'}`}
              title={FACE_LABELS[face]}
            />
          ))}
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative flex-grow bg-black overflow-hidden aspect-square md:aspect-auto min-h-[350px] group">
        {/* INVERTED CAMERA: scale-x-[-1] */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover opacity-100"
        />

        {/* Guide Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Focus Bracket */}
          <div className={`w-64 h-64 border-2 grid grid-cols-3 grid-rows-3 rounded-lg transition-colors duration-300 ${cooldown > 0 ? 'border-green-500/80 shadow-[0_0_30px_rgba(34,197,94,0.3)]' :
            isProcessing ? 'border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.3)]' :
              'border-white/30'
            }`}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`border ${cooldown > 0 ? 'border-green-500/20' : 'border-white/10'}`} />
            ))}
          </div>

          {/* Directional Arrows */}
          {!isProcessing && cooldown === 0 && suggestion && suggestion.direction !== 'any' && (
            <>
              {suggestion.direction === 'right' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-pulse flex flex-col items-center text-white space-y-2">
                  <MoveRight size={48} className="drop-shadow-lg" />
                  <span className="text-xs font-bold bg-black/50 px-2 py-1 rounded">Rotate for {FACE_LABELS[suggestion.face]}</span>
                </div>
              )}
              {suggestion.direction === 'left' && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 animate-pulse flex flex-col items-center text-white space-y-2">
                  <MoveLeft size={48} className="drop-shadow-lg" />
                  <span className="text-xs font-bold bg-black/50 px-2 py-1 rounded">Rotate for {FACE_LABELS[suggestion.face]}</span>
                </div>
              )}
              {suggestion.direction === 'up' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-pulse flex flex-col items-center text-white space-y-2">
                  <MoveUp size={48} className="drop-shadow-lg" />
                  <span className="text-xs font-bold bg-black/50 px-2 py-1 rounded">Rotate for {FACE_LABELS[suggestion.face]}</span>
                </div>
              )}
              {suggestion.direction === 'down' && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-pulse flex flex-col items-center text-white space-y-2">
                  <MoveDown size={48} className="drop-shadow-lg" />
                  <span className="text-xs font-bold bg-black/50 px-2 py-1 rounded">Rotate for {FACE_LABELS[suggestion.face]}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Message Overlay */}
        <div className="absolute bottom-6 left-0 right-0 text-center px-4 pointer-events-none">
          {cooldown > 0 && lastScannedFace ? (
            <div className="animate-bounce inline-flex items-center gap-2 px-4 py-2 bg-green-600/90 text-white rounded-full backdrop-blur-md shadow-lg">
              <Check size={18} /> Scanned {FACE_LABELS[lastScannedFace]}!
            </div>
          ) : (
            <span className="inline-block px-4 py-2 bg-black/60 text-white rounded-full text-sm backdrop-blur-md border border-white/10">
              {suggestion ? `Next: ${FACE_LABELS[suggestion.face]}` : 'Align face in center grid'}
            </span>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Instructions / Footer */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 text-center">
        <p className="text-gray-400 text-xs">
          {suggestion?.direction === 'any'
            ? "Scan any remaining face."
            : "Follow the arrows to find the next face."}
        </p>

        {error && (
          <div className="mt-2 text-red-400 text-xs flex items-center justify-center gap-1">
            <AlertCircle size={12} /> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;