import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Amidakuji = ({ sessionId, restaurants, currentUser, sessionData, onFinish }) => {
    const [rungs, setRungs] = useState(sessionData.amidakuji?.rungs || []);
    const [startLane, setStartLane] = useState(sessionData.amidakuji?.userStartLanes?.[currentUser.uid] || 0);
    const [animating, setAnimating] = useState(false);
    const [activePath, setActivePath] = useState(null);
    const containerRef = useRef(null);

    const numLanes = 5;
    const laneGap = 60; // pixels

    useEffect(() => {
        if (sessionData.amidakuji?.rungs) {
            setRungs(sessionData.amidakuji.rungs);
        }
    }, [sessionData.amidakuji?.rungs]);

    const addRung = (x, y) => {
        if (animating) return;
        // Logic to snap and add rung to Firestore
        // For this prototype, we'll simulate local state first
        const newRung = { x, y: Math.round(y / 20) * 20 };
        setRungs([...rungs, newRung]);
    };

    const simulatePath = () => {
        setAnimating(true);
        // Path calculation logic...
        setTimeout(() => {
            setAnimating(false);
            onFinish(restaurants[2]); // Mock result
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="mb-8 flex gap-4">
                <p className="text-sm font-bold text-gray-500">Pick Your Lane:</p>
                {[...Array(numLanes)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setStartLane(i)}
                        className={`w-8 h-8 rounded-full border-2 font-bold transition-all ${startLane === i ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <div
                ref={containerRef}
                className="relative bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 h-[400px]"
                style={{ width: (numLanes - 1) * laneGap + 80 }}
                onClick={(e) => {
                    const rect = containerRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left - 40;
                    const y = e.clientY - rect.top - 40;
                    if (x > 0 && x < (numLanes - 1) * laneGap) {
                        const laneIndex = Math.floor((x + laneGap / 2) / laneGap);
                        addRung(laneIndex * laneGap, y);
                    }
                }}
            >
                {/* Vertical Lanes */}
                {[...Array(numLanes)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-gray-300 dark:bg-gray-600 w-1 rounded-full top-10 bottom-10"
                        style={{ left: i * laneGap + 40 }}
                    />
                ))}

                {/* Rungs */}
                {rungs.map((rung, i) => (
                    <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute h-1 bg-blue-500 rounded-full origin-left"
                        style={{
                            left: rung.x + 40,
                            top: rung.y + 40,
                            width: laneGap
                        }}
                    />
                ))}

                {/* Results at bottom */}
                <div className="absolute bottom-[-10px] w-full left-0 flex justify-between px-4">
                    {restaurants.slice(0, 5).map((r, i) => (
                        <span key={i} className="text-[8px] font-bold text-gray-400 truncate max-w-[50px]">{r.name}</span>
                    ))}
                </div>

                {/* Animating Point */}
                {animating && (
                    <motion.div
                        className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] z-10"
                        animate={{
                            y: [0, 100, 100, 200, 200, 300],
                            x: [startLane * laneGap + 40, startLane * laneGap + 40, (startLane + 1) * laneGap + 40, (startLane + 1) * laneGap + 40, startLane * laneGap + 40, startLane * laneGap + 40]
                        }}
                        transition={{ duration: 3, ease: "linear" }}
                        style={{ top: 40 }}
                    />
                )}
            </div>

            <div className="mt-12 flex gap-4">
                {sessionData.hostId === currentUser.uid && (
                    <button
                        onClick={() => setRungs([])}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-200 transition-all text-sm"
                    >
                        Reset Ladder
                    </button>
                )}
                <button
                    disabled={animating}
                    onClick={simulatePath}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all uppercase tracking-widest"
                >
                    {animating ? 'Tracing Path...' : 'Start Battle!'}
                </button>
            </div>
        </div>
    );
};

export default Amidakuji;
