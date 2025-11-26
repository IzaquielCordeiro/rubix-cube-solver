import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Camera, Check, AlertCircle, Pipette, RotateCcw } from 'lucide-react';
import { Color, Face, CubeState, ScanStep } from '../types';
import { COLOR_MAP, FACE_LABELS, OPPOSITE_COLORS, STANDARD_CORNER } from '../constants';
import { findClosestColor } from '../utils/colorMatcher';
import { rotateGridClockwise, rotateGridCounterClockwise, flipGridHorizontal, rotateGrid180 } from '../utils/gridUtils';

interface PixelScannerProps {
  cubeState: CubeState;
  onFaceCaptured: (face: Face, colors: Color[]) => void;
  orientation: { top: Color; front: Color; };
  scanStepIndex: number;
  onScanSuccess: () => void;
  onOpenDebug?: () => void;
}

const GRID_SIZE = 256; // The size of our sampling grid overlay

export const generateScanSequence = (topColor: Color, frontColor: Color): ScanStep[] => {
  const faceMapping: Partial<Record<Face, Color>> = {};

  faceMapping[Face.Up] = topColor;
  faceMapping[Face.Front] = frontColor;
  faceMapping[Face.Down] = OPPOSITE_COLORS[topColor];
  faceMapping[Face.Back] = OPPOSITE_COLORS[frontColor];

  const rightColor = STANDARD_CORNER[frontColor]?.[topColor];
  if (rightColor) {
    faceMapping[Face.Right] = rightColor;
    faceMapping[Face.Left] = OPPOSITE_COLORS[rightColor];
  } else {
    // Fallback if the corner isn't in our map (should not happen with valid input)
    const remainingColors = Object.values(Color).filter(
      c => c !== Color.Gray && !Object.values(faceMapping).includes(c)
    );
    faceMapping[Face.Right] = remainingColors[0];
    faceMapping[Face.Left] = remainingColors[1];
  }

  // Create a geometrically correct sequence based on the initial orientation
  const sequence: ScanStep[] = [];
  const facesInOrder: Face[] = [Face.Up, Face.Front, Face.Right, Face.Back, Face.Left, Face.Down];

  // Instructions for moving to the *next* face from the *current* face (index based)
  // 0 (Up) -> 1 (Front): Tilt Up
  // 1 (Front) -> 2 (Right): Turn Left
  // 2 (Right) -> 3 (Back): Turn Left
  // 3 (Back) -> 4 (Left): Turn Left
  // 4 (Left) -> 5 (Down): Tilt Up
  const ROTATION_INSTRUCTIONS = [
    "Start with Top Face",
    "Tilt Cube UP (to show Front)",
    "Turn Cube LEFT (to show Right)",
    "Turn Cube LEFT (to show Back)",
    "Turn Cube LEFT (to show Left)",
    "Tilt Cube UP (to show Bottom)"
  ];

  facesInOrder.forEach((face, index) => {
    const centerColor = faceMapping[face]!;
    let upColor = faceMapping[Face.Up]!; // Default for side faces

    if (face === Face.Up) {
      upColor = faceMapping[Face.Back]!;
    } else if (face === Face.Down) {
      // When we tilt up from Left to Down, the Left face becomes the Top face
      upColor = faceMapping[Face.Left]!;
    }

    sequence.push({
      face: face,
      label: FACE_LABELS[face],
      centerColor: centerColor,
      instruction: `Show the ${centerColor} face. Make sure ${upColor} is facing UP.`,
      upColor: upColor,
      rotationInstruction: ROTATION_INSTRUCTIONS[index]
    });
  });

  return sequence;
};

const PixelScanner: React.FC<PixelScannerProps> = ({ cubeState, onFaceCaptured, orientation, scanStepIndex, onScanSuccess, onOpenDebug }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const scanSequence = useMemo(() => {
    if (orientation.top) {
      let front = orientation.front;
      if (!front) {
        // If front is not specified, pick a valid default
        // Valid defaults are any color that is NOT top and NOT opposite of top
        const invalidColors = [orientation.top, OPPOSITE_COLORS[orientation.top]];
        const validColors = Object.values(Color).filter(c => c !== Color.Gray && !invalidColors.includes(c));
        front = validColors[0];
      }
      return generateScanSequence(orientation.top, front);
    }
    return [];
  }, [orientation]);

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

  const performBurstCapture = async (shotCount: number): Promise<Color[] | null> => {
    const allShotsColors: Color[][] = [];

    for (let i = 0; i < shotCount; i++) {
      const colors = sampleColorsFromVideo();
      if (colors) {
        allShotsColors.push(colors);
      }
      if (i < shotCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    if (allShotsColors.length === 0) {
      setError("Capture failed. Check lighting and try again.");
      return null;
    }

    const consensusColors: Color[] = [];
    for (let stickerIndex = 0; stickerIndex < 9; stickerIndex++) {
      const stickerVotes: Partial<Record<Color, number>> = {};
      for (const shot of allShotsColors) {
        const color = shot[stickerIndex];
        stickerVotes[color] = (stickerVotes[color] || 0) + 1;
      }

      let dominantColor: Color = Color.Gray;
      let maxVotes = 0;
      for (const [color, votes] of Object.entries(stickerVotes)) {
        if (votes > maxVotes) {
          maxVotes = votes;
          dominantColor = color as Color;
        }
      }
      consensusColors.push(dominantColor);
    }
    return consensusColors;
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || isCapturing || scanSequence.length === 0) {
      return;
    }
    setIsCapturing(true);
    setError(null);

    const consensusColors = await performBurstCapture(5);

    if (!consensusColors) {
      setIsCapturing(false);
      return;
    }

    const currentStep = scanSequence[scanStepIndex];

    let correctedColors = [...consensusColors];

    // Special handling for the Down face:
    // When Orange is on top during scan, the camera sees it rotated 90° CCW
    if (currentStep.face === Face.Down) {
      correctedColors = rotateGridCounterClockwise(correctedColors);
    }

    correctedColors[4] = currentStep.centerColor;

    onFaceCaptured(currentStep.face, correctedColors);
    onScanSuccess();

    setIsCapturing(false);
  };

  const sampleColorsFromVideo = (): Color[] | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    try {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return null;

      const vW = video.videoWidth, vH = video.videoHeight;
      const cW = video.clientWidth, cH = video.clientHeight;
      const videoRatio = vW / vH, containerRatio = cW / cH;
      let sX = 0, sY = 0, sW = vW, sH = vH;

      if (videoRatio > containerRatio) {
        sW = vH * containerRatio;
        sX = (vW - sW) / 2;
      } else {
        sH = vW / containerRatio;
        sY = (vH - sH) / 2;
      }

      const gridRect = { x: (cW - GRID_SIZE) / 2, y: (cH - GRID_SIZE) / 2, w: GRID_SIZE, h: GRID_SIZE };
      const sourceGridX = sX + (gridRect.x / cW) * sW;
      const sourceGridY = sY + (gridRect.y / cH) * sH;
      const sourceGridW = (gridRect.w / cW) * sW;
      const sourceGridH = (gridRect.h / cH) * sH;

      canvas.width = GRID_SIZE;
      canvas.height = GRID_SIZE;

      // Don't mirror the canvas - we'll handle the mirroring in the sampling loop instead
      context.drawImage(video, sourceGridX, sourceGridY, sourceGridW, sourceGridH, 0, 0, GRID_SIZE, GRID_SIZE);

      const detectedColors: Color[] = [];
      const stickerSize = GRID_SIZE / 3;
      const SAMPLE_SIZE = 5;
      const PIXEL_COUNT_PER_SAMPLE = SAMPLE_SIZE * SAMPLE_SIZE;

      for (let row = 0; row < 3; row++) {
        // Iterate columns forwards (0 -> 2) to fix mirroring issue
        // Visual left (screen col 0) should be physical left
        for (let col = 0; col < 3; col++) {
          const stickerLeft = col * stickerSize, stickerTop = row * stickerSize;
          const samplePoints = [
            { x: stickerLeft + stickerSize * 0.5, y: stickerTop + stickerSize * 0.5 },
            { x: stickerLeft + stickerSize * 0.25, y: stickerTop + stickerSize * 0.25 },
            { x: stickerLeft + stickerSize * 0.75, y: stickerTop + stickerSize * 0.25 },
            { x: stickerLeft + stickerSize * 0.25, y: stickerTop + stickerSize * 0.75 },
            { x: stickerLeft + stickerSize * 0.75, y: stickerTop + stickerSize * 0.75 },
          ];

          let totalR = 0, totalG = 0, totalB = 0;
          for (const point of samplePoints) {
            const imgData = context.getImageData(Math.floor(point.x - SAMPLE_SIZE / 2), Math.floor(point.y - SAMPLE_SIZE / 2), SAMPLE_SIZE, SAMPLE_SIZE).data;
            for (let i = 0; i < imgData.length; i += 4) {
              totalR += imgData[i]; totalG += imgData[i + 1]; totalB += imgData[i + 2];
            }
          }

          const totalPixelCount = PIXEL_COUNT_PER_SAMPLE * samplePoints.length;
          const avgR = totalR / totalPixelCount, avgG = totalG / totalPixelCount, avgB = totalB / totalPixelCount;
          detectedColors.push(findClosestColor([avgR, avgG, avgB]));
        }
      }
      return detectedColors;
    } catch (e) {
      console.error("Pixel scan error:", e);
      setError("An error occurred during pixel sampling.");
      return null;
    }
  }

  if (scanSequence.length === 0 || scanStepIndex >= scanSequence.length) {
    return <div>Loading instructions...</div>;
  }

  const currentStep = scanSequence[scanStepIndex] as ScanStep & { upColor: Color, rotationInstruction?: string };
  // Check if the current face has been scanned (check non-center stickers since center is pre-filled)
  const isComplete = cubeState[currentStep.face].some((color, idx) => idx !== 4 && color !== Color.Gray);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">

      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Pipette className="text-gray-400" size={20} />
          <span className="font-bold text-white text-sm">Guided Pixel Scan</span>
        </div>
        <div className="text-sm text-gray-400 font-mono flex items-center gap-2">
          {onOpenDebug && (
            <button
              onClick={onOpenDebug}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
            >
              Debug
            </button>
          )}
          <span>Step <span className="text-white font-bold">{scanStepIndex + 1}</span> / {scanSequence.length}</span>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative flex-grow bg-black overflow-hidden aspect-square md:aspect-auto min-h-[350px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Visual Guide Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">

          {/* Face Instruction at top */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full px-4 z-10">
            <div className="bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-xl flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <span className="text-white text-xl font-bold">Show</span>
                <div
                  className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                  style={{ backgroundColor: COLOR_MAP[currentStep.centerColor] }}
                />
                <span className="text-xl font-black uppercase tracking-wide" style={{ color: COLOR_MAP[currentStep.centerColor], textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {currentStep.centerColor}
                </span>
                <span className="text-white text-xl font-bold">Face</span>
              </div>
              {currentStep.rotationInstruction && (
                <span className="text-yellow-400 text-sm font-bold animate-pulse">
                  {currentStep.rotationInstruction}
                </span>
              )}
            </div>
          </div>

          {/* Orientation Guide at bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full px-4">
            <div
              className="w-24 h-12 rounded-lg border-2 border-white/50 shadow-lg"
              style={{ backgroundColor: COLOR_MAP[currentStep.upColor] }}
            />
            <p className="text-white text-sm font-bold text-center bg-black/50 px-3 py-1 rounded-md">
              Make sure this face is facing UP
            </p>
          </div>

          {/* Grid */}
          <div
            className={`w-64 h-64 border-2 grid grid-cols-3 grid-rows-3 rounded-lg absolute transition-colors duration-300 ${isCapturing ? 'border-blue-500' : 'border-white/50'}`}
            style={{ width: `${GRID_SIZE}px`, height: `${GRID_SIZE}px` }}
          >
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`border ${isCapturing ? 'border-blue-500/50' : 'border-white/20'}`} />
            ))}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls & Instructions */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 text-center">
        <button
          onClick={handleCapture}
          disabled={isCapturing || isComplete}
          className="w-full px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-blue-600 text-white shadow-lg hover:bg-blue-500 active:scale-95 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isCapturing ? (
            <>
              <RotateCcw size={18} className="animate-spin" /> Capturing...
            </>
          ) : (
            <>
              <Camera size={18} /> {isComplete ? 'Complete' : `Capture ${FACE_LABELS[currentStep.face]} Face`}
            </>
          )}
        </button>

        {error && (
          <div className="mt-2 text-red-400 text-xs flex items-center justify-center gap-1">
            <AlertCircle size={12} /> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelScanner;