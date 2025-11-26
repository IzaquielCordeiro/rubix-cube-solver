import React, { useState, useEffect, useRef } from 'react';
import { CubeState, Face, Color } from '../types';
import { COLOR_MAP } from '../constants';
import { RotateCcw, Edit3, Undo2, Redo2 } from 'lucide-react';

interface Cube3DProps {
  state: CubeState;
  className?: string;
  onStickerClick?: (face: Face, index: number, newColor?: Color) => void;
  focusedFace?: Face | null;
  highlightMove?: string | null;
  autoRotate?: boolean;
  highlightColors?: Color[];
}

const Cube3D: React.FC<Cube3DProps> = ({ state, className = '', onStickerClick, focusedFace, highlightMove, autoRotate = false, highlightColors = [] }) => {
  const [rotation, setRotation] = useState({ x: -30, y: -45 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef<number>();

  // Auto-rotate effect for "gracious spin"
  useEffect(() => {
    let animationFrameId: number;

    if (autoRotate && !isDragging) {
      const animate = () => {
        setRotation(prev => ({
          ...prev,
          y: prev.y + 0.5
        }));
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [autoRotate, isDragging]);

  // Auto-rotate when focusedFace changes (only if not auto-rotating globally)
  useEffect(() => {
    if (focusedFace && !autoRotate) {
      const targetRotations: Record<Face, { x: number, y: number }> = {
        // Up: Start view (Isometric-ish)
        [Face.Up]: { x: -60, y: -30 },
        // Front: Show Front & Up (Previous)
        [Face.Front]: { x: -40, y: 0 },
        // Right: Show Right & Front (Previous)
        [Face.Right]: { x: -25, y: -50 },
        // Back: Show Back & Right (Previous)
        [Face.Back]: { x: -25, y: -130 },
        // Left: Show Left & Back (Previous)
        [Face.Left]: { x: -25, y: 130 },
        // Down: Show Down & Left (Previous)
        [Face.Down]: { x: 50, y: 90 },
      };
      setRotation(targetRotations[focusedFace]);
    }
  }, [focusedFace, autoRotate]);

  // Handlers for manual rotation of the view
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    setRotation(prev => ({
      x: prev.x - deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  // Helper to determine if an arrow should be shown on this face
  const getArrowForFace = (face: Face) => {
    if (!highlightMove) return null;

    const move = highlightMove.replace("'", "").replace("2", "");
    const isPrime = highlightMove.includes("'");
    const isDouble = highlightMove.includes("2");

    // Map moves to faces
    const moveFaceMap: Record<string, Face> = {
      'U': Face.Up,
      'D': Face.Down,
      'F': Face.Front,
      'B': Face.Back,
      'L': Face.Left,
      'R': Face.Right
    };

    if (moveFaceMap[move] !== face) return null;

    // Determine arrow type (CW or CCW)
    // Standard moves are CW, Prime moves are CCW
    // We'll use Undo2 for CCW and Redo2 for CW as approximations for curved arrows
    const isCCW = isPrime;

    return (
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        style={{ transform: 'translateZ(100px)' }}
      >
        <div className={`relative bg-black/60 rounded-full p-3 backdrop-blur-md border-2 border-white shadow-2xl ${isDouble ? 'animate-pulse' : ''}`}>
          {isCCW ? (
            <Undo2 size={48} className="text-white drop-shadow-lg" strokeWidth={3} />
          ) : (
            <Redo2 size={48} className="text-white drop-shadow-lg" strokeWidth={3} />
          )}

          {isDouble && (
            <div className="absolute -bottom-4 -right-4 bg-red-600 text-white text-sm font-black px-2 py-1 rounded-lg border-2 border-white shadow-xl transform scale-110">
              2x
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper to render a single face grid
  const renderFace = (face: Face, faceData: Color[], faceClass: string) => {

    let finalFaceData = [...faceData];

    // VISUAL CORRECTION: The CSS transforms for back and bottom faces position
    // them correctly.
    // The previous manual mirroring for Face.Back is no longer needed as the scanner
    // now captures data in the correct order (0->2).

    // Down face - no rotation needed, scanner already stores it correctly
    // (Scanner applies 90° CCW to compensate for Orange-on-top orientation during scan)

    return (
      <div className={`cube-face ${faceClass}`}>
        {getArrowForFace(face)}
        {finalFaceData.map((color, idx) => {
          const isHighlighted = highlightColors.includes(color) && idx !== 4;
          return (
            <div
              key={idx}
              className={`sticker border border-black/10 relative ${onStickerClick && idx !== 4
                ? 'cursor-pointer hover:opacity-80 transition-opacity'
                : ''
                } ${isHighlighted ? 'ring-4 ring-red-500 animate-pulse z-10' : ''}`}
              style={{ backgroundColor: COLOR_MAP[color] }}
              onClick={() => {
                if (onStickerClick && idx !== 4) {
                  // We must use the original index.
                  let originalIndex = idx;
                  // No adjustments needed for any face - data is stored correctly
                  onStickerClick(face, originalIndex, undefined);
                }
              }}
            >
              {isHighlighted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white drop-shadow-md font-bold text-lg">!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`scene mt-10 mb-20 touch-none select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ width: '200px', height: '200px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div
          className="cube-container"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging || autoRotate ? 'none' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {renderFace(Face.Front, state[Face.Front], 'face-front')}
          {renderFace(Face.Back, state[Face.Back], 'face-back')}
          {renderFace(Face.Right, state[Face.Right], 'face-right')}
          {renderFace(Face.Left, state[Face.Left], 'face-left')}
          {renderFace(Face.Up, state[Face.Up], 'face-top')}
          {renderFace(Face.Down, state[Face.Down], 'face-bottom')}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4 text-gray-400 text-sm">
        <span className="flex items-center gap-1"><RotateCcw size={14} /> Drag to Rotate View</span>
        {onStickerClick && (
          <span className="flex items-center gap-1"><Edit3 size={14} /> Click Stickers to Edit</span>
        )}
      </div>
    </div>
  );
};

export default Cube3D;