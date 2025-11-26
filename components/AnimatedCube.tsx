import React, { useEffect, useState, useRef } from 'react';
import { CubeState, Face, Color } from '../types';
import { COLOR_MAP } from '../constants';

interface AnimatedCubeProps {
    state: CubeState;
    previousState?: CubeState;
    move?: string | null;
    isAnimating?: boolean;
    onAnimationComplete?: () => void;
    className?: string;
}

// Helper to get cubie coordinates
const getCubies = () => {
    const cubies = [];
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                cubies.push({ x, y, z, id: `${x},${y},${z}` });
            }
        }
    }
    return cubies;
};

const AnimatedCube: React.FC<AnimatedCubeProps> = ({
    state,
    previousState,
    move,
    isAnimating,
    onAnimationComplete,
    className = ''
}) => {
    const [rotation, setRotation] = useState({ x: -30, y: -45 });
    const [animatingMove, setAnimatingMove] = useState<string | null>(null);
    const cubies = useRef(getCubies());

    useEffect(() => {
        if (isAnimating && move) {
            setAnimatingMove(move);
            const timer = setTimeout(() => {
                setAnimatingMove(null);
                if (onAnimationComplete) onAnimationComplete();
            }, 500); // Animation duration
            return () => clearTimeout(timer);
        } else {
            setAnimatingMove(null);
        }
    }, [isAnimating, move, onAnimationComplete]);

    // Helper to determine if a cubie is part of the rotating layer
    const isCubieInMove = (x: number, y: number, z: number, moveStr: string | null) => {
        if (!moveStr) return false;
        const baseMove = moveStr.replace("'", "").replace("2", "");
        switch (baseMove) {
            case 'U': return y === 1;
            case 'D': return y === -1;
            case 'L': return x === -1;
            case 'R': return x === 1;
            case 'F': return z === 1;
            case 'B': return z === -1;
            default: return false;
        }
    };

    // Helper to get rotation style for the move
    const getMoveRotation = (moveStr: string | null) => {
        if (!moveStr) return '';
        const isPrime = moveStr.includes("'");
        const isDouble = moveStr.includes("2");
        const degrees = isDouble ? 180 : (isPrime ? -90 : 90);

        const baseMove = moveStr.replace("'", "").replace("2", "");
        switch (baseMove) {
            case 'U': return `rotateY(${degrees * -1}deg)`; // Y-axis points up
            case 'D': return `rotateY(${degrees}deg)`;
            case 'L': return `rotateX(${degrees}deg)`;
            case 'R': return `rotateX(${degrees * -1}deg)`;
            case 'F': return `rotateZ(${degrees * -1}deg)`;
            case 'B': return `rotateZ(${degrees}deg)`;
            default: return '';
        }
    };

    // Helper to map 3D coordinates to CubeState colors
    const getCubieColors = (x: number, y: number, z: number, currentState: CubeState) => {
        const colors: Partial<Record<Face, Color>> = {};

        // Front (z=1)
        if (z === 1) {
            const idx = (1 - y) * 3 + (x + 1);
            colors[Face.Front] = currentState[Face.Front][idx];
        }
        // Back (z=-1)
        if (z === -1) {
            const idx = (1 - y) * 3 + (1 - x); // Mirrored horizontally
            colors[Face.Back] = currentState[Face.Back][idx];
        }
        // Right (x=1)
        if (x === 1) {
            const idx = (1 - y) * 3 + (1 - z);
            colors[Face.Right] = currentState[Face.Right][idx];
        }
        // Left (x=-1)
        if (x === -1) {
            const idx = (1 - y) * 3 + (z + 1);
            colors[Face.Left] = currentState[Face.Left][idx];
        }
        // Up (y=1)
        if (y === 1) {
            const idx = (1 - z) * 3 + (x + 1);
            colors[Face.Up] = currentState[Face.Up][idx];
        }
        // Down (y=-1)
        if (y === -1) {
            const idx = (z + 1) * 3 + (x + 1);
            colors[Face.Down] = currentState[Face.Down][idx];
        }

        return colors;
    };

    // Use previous state during animation, current state otherwise
    const activeState = (isAnimating && previousState) ? previousState : state;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div
                className="scene mt-10 mb-20"
                style={{ width: '200px', height: '200px', perspective: '1000px' }}
            >
                <div
                    className="cube-container relative w-full h-full"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transition: 'transform 0.5s ease-out'
                    }}
                >
                    {cubies.current.map(({ x, y, z, id }) => {
                        const isMoving = isAnimating && isCubieInMove(x, y, z, move || null);
                        const colors = getCubieColors(x, y, z, activeState);

                        return (
                            <div
                                key={id}
                                className="cubie absolute w-[66px] h-[66px]"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: `
                                        translate3d(${x * 66}px, ${y * -66}px, ${z * 66}px)
                                        ${isMoving ? getMoveRotation(move || null) : ''}
                                    `,
                                    transition: isMoving ? 'transform 0.5s ease-in-out' : 'none'
                                }}
                            >
                                {Object.entries(colors).map(([face, color]) => {
                                    let transform = '';
                                    switch (face) {
                                        case Face.Front: transform = 'rotateY(0deg) translateZ(33px)'; break;
                                        case Face.Back: transform = 'rotateY(180deg) translateZ(33px)'; break;
                                        case Face.Right: transform = 'rotateY(90deg) translateZ(33px)'; break;
                                        case Face.Left: transform = 'rotateY(-90deg) translateZ(33px)'; break;
                                        case Face.Up: transform = 'rotateX(90deg) translateZ(33px)'; break;
                                        case Face.Down: transform = 'rotateX(-90deg) translateZ(33px)'; break;
                                    }

                                    return (
                                        <div
                                            key={face}
                                            className="absolute w-full h-full border border-black/20 rounded-[2px] box-border"
                                            style={{
                                                backgroundColor: COLOR_MAP[color as Color],
                                                transform,
                                                backfaceVisibility: 'hidden'
                                            }}
                                        />
                                    );
                                })}
                                {/* Inner black faces for realism */}
                                <div className="absolute w-full h-full bg-black transform translateZ(-32px)" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnimatedCube;
