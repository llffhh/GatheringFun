import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Amidakuji = ({ sessionId, restaurants, currentUser, sessionData, onFinish }) => {
    const [localRungs, setLocalRungs] = useState([]);
    const [myLane, setMyLane] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [finalPath, setFinalPath] = useState([]);
    const [gameResult, setGameResult] = useState(null);
    const [showRanking, setShowRanking] = useState(false);

    const numLanes = 5;
    const laneGap = 60;
    const boardHeight = 320;

    // Load initial rungs from Firestore (one-time)
    useEffect(() => {
        if (sessionData.amidakuji?.initialRungs) {
            setLocalRungs([...sessionData.amidakuji.initialRungs]);
        }
    }, [sessionData.amidakuji?.initialRungs]);

    // Add rung locally only (no Firestore sync)
    const addRung = (laneIndex, y) => {
        if (animating || laneIndex >= numLanes - 1) return;
        const newRung = { lane: laneIndex, y: Math.round(y / 20) * 20 };

        // Prevent duplicate rungs at same spot
        if (localRungs.some(r => r.lane === newRung.lane && r.y === newRung.y)) return;

        setLocalRungs(prev => [...prev, newRung]);
    };

    const calculatePath = (startLane) => {
        let currentLane = startLane;
        const path = [{ x: currentLane * laneGap + 60, y: 40 }];

        // Sort rungs by Y to process them top-down
        const sortedRungs = [...localRungs].sort((a, b) => a.y - b.y);

        sortedRungs.forEach(rung => {
            // If rung connects current lane to right
            if (rung.lane === currentLane) {
                path.push({ x: currentLane * laneGap + 60, y: rung.y + 40 });
                currentLane++;
                path.push({ x: currentLane * laneGap + 60, y: rung.y + 40 });
            }
            // If rung connects current lane to left
            else if (rung.lane === currentLane - 1) {
                path.push({ x: currentLane * laneGap + 60, y: rung.y + 40 });
                currentLane--;
                path.push({ x: currentLane * laneGap + 60, y: rung.y + 40 });
            }
        });

        path.push({ x: currentLane * laneGap + 60, y: boardHeight + 40 });
        return { path, endLane: currentLane };
    };

    const startBattle = () => {
        const { path, endLane } = calculatePath(myLane);
        setFinalPath(path);
        setAnimating(true);

        // Map endLane to restaurant
        const resultsIds = sessionData.amidakuji?.results || [];
        const winningId = resultsIds[endLane];
        const winner = restaurants.find(r => r.id === winningId) || restaurants[0];
        setGameResult(winner);

        // Animation duration based on path segments
        setTimeout(() => {
            setAnimating(false);
            setShowRanking(true);
            onFinish(winner);
        }, path.length * 500);
    };

    const mappedRestaurants = (sessionData.amidakuji?.results || []).map(id =>
        restaurants.find(r => r.id === id) || { name: '???' }
    );

    const ranking = sessionData.amidakuji?.ranking || [];

    return (
        <div className="flex flex-col items-center">
            <div className="mb-8 flex gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-bold text-gray-500 self-center px-2">Your Starting Lane:</p>
                {[...Array(numLanes)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setMyLane(i)}
                        disabled={animating}
                        className={`w-10 h-10 rounded-xl border-2 font-black transition-all ${myLane === i
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:border-blue-400'
                            } ${animating ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <div
                className="relative bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl border-4 border-gray-100 dark:border-gray-700 overflow-visible"
                style={{ width: (numLanes - 1) * laneGap + 120, height: boardHeight + 100 }}
                onClick={(e) => {
                    if (animating) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left - 40;
                    const y = e.clientY - rect.top - 40;
                    if (y > 10 && y < boardHeight - 10) {
                        const laneIndex = Math.floor(x / laneGap);
                        if (laneIndex >= 0 && laneIndex < numLanes - 1) {
                            addRung(laneIndex, y);
                        }
                    }
                }}
            >
                {/* Vertical Lanes */}
                {[...Array(numLanes)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-gray-200 dark:bg-gray-700 w-1.5 rounded-full"
                        style={{ left: i * laneGap + 60, top: 40, height: boardHeight }}
                    />
                ))}

                {/* Rungs */}
                {localRungs.map((rung, i) => (
                    <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute h-1.5 bg-blue-500 rounded-full origin-left shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        style={{
                            left: rung.lane * laneGap + 60,
                            top: rung.y + 40,
                            width: laneGap
                        }}
                    />
                ))}

                {/* Results at bottom */}
                <div className="absolute bottom-[20px] left-[20px] right-[20px] flex justify-between pointer-events-none">
                    {mappedRestaurants.map((r, i) => (
                        <div key={i} className="flex flex-col items-center w-[60px]">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-1 flex items-center justify-center">
                                <span className="text-yellow-600 text-xs">🎁</span>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 truncate w-full text-center">
                                {r.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Animating Point */}
                <AnimatePresence>
                    {animating && (
                        <motion.div
                            className="absolute w-6 h-6 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,1)] z-20 flex items-center justify-center border-2 border-white"
                            initial={{ x: finalPath[0]?.x + 20, y: finalPath[0]?.y }}
                            animate={{
                                x: finalPath.map(p => p.x + 20),
                                y: finalPath.map(p => p.y)
                            }}
                            transition={{ duration: finalPath.length * 0.5, ease: "linear" }}
                        >
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-12 flex gap-4">
                <button
                    disabled={animating}
                    onClick={() => setLocalRungs([])}
                    className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl shadow-lg hover:bg-gray-300 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Reset
                </button>
                <button
                    disabled={animating}
                    onClick={startBattle}
                    className="px-10 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {animating ? (
                        <>
                            <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            Tracing Path...
                        </>
                    ) : 'Start Battle! 🚀'}
                </button>
            </div>

            {/* Restaurant Ranking Display */}
            {showRanking && ranking.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border-2 border-blue-200 dark:border-blue-800"
                >
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                        🏆 Restaurant Rankings
                    </h3>
                    <div className="space-y-2">
                        {ranking.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`flex justify-between items-center py-3 px-4 rounded-xl transition-all ${gameResult?.id === item.id
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400'
                                    : 'bg-gray-50 dark:bg-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-2xl font-black ${idx === 0 ? 'text-yellow-500' :
                                        idx === 1 ? 'text-gray-400' :
                                            idx === 2 ? 'text-orange-600' : 'text-gray-500'
                                        }`}>
                                        #{idx + 1}
                                    </span>
                                    <div>
                                        <span className="font-bold text-gray-900 dark:text-white">{item.name}</span>
                                        {gameResult?.id === item.id && (
                                            <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                                                YOUR PICK
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    {item.votes} {item.votes === 1 ? 'vote' : 'votes'}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Amidakuji;
