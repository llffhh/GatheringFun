import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Amidakuji = ({ sessionId, restaurants, currentUser, sessionData, onFinish }) => {
    const [rungs, setRungs] = useState([]);
    const [myLane, setMyLane] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [pathPoints, setPathPoints] = useState([]);
    const [winner, setWinner] = useState(null);

    // SVG Coordinate System
    const WIDTH = 600;
    const HEIGHT = 800; // Increased height to ensure labels fit
    const MARGIN_TOP = 100;
    const MARGIN_BOTTOM = 150; // More space for bottom labels
    const LANE_COUNT = 5;
    // Calculate lane x-coordinates distributed evenly across width
    const LANE_WIDTH = WIDTH / LANE_COUNT;
    const LANE_X = Array.from({ length: LANE_COUNT }, (_, i) => LANE_WIDTH * i + LANE_WIDTH / 2);

    // Y-bounds for rungs
    const RUNG_MIN_Y = MARGIN_TOP + 20;
    const RUNG_MAX_Y = HEIGHT - MARGIN_BOTTOM - 20;

    // Ordered restaurants (fixed for this session/render)
    // We default to the received list. If fewer than 5, we might repeat or have empty slots?
    // Assuming restaurants passed are exactly 5 or fewer.
    // We map them to the 5 lanes.
    const targets = Array.from({ length: LANE_COUNT }, (_, i) => {
        // If we have random results from session, use them, otherwise use passed restaurants
        const resId = sessionData.amidakuji?.results?.[i];
        if (resId) return restaurants.find(r => r.id === resId) || { name: '???' };
        return restaurants[i % restaurants.length] || { name: '???' };
    });

    // Generate random rungs locally
    const generateRungs = () => {
        const newRungs = [];
        const numRungs = 12 + Math.floor(Math.random() * 8); // 12-20 rungs

        for (let i = 0; i < numRungs; i++) {
            // Pick a random lane (0 to LANE_COUNT-2) because a rung connects i and i+1
            const lane = Math.floor(Math.random() * (LANE_COUNT - 1));
            // Pick a random Y
            const y = RUNG_MIN_Y + Math.random() * (RUNG_MAX_Y - RUNG_MIN_Y);

            // Avoid overlapping rungs (simple proximity check)
            const tooClose = newRungs.some(r => Math.abs(r.y - y) < 15);
            if (!tooClose) {
                newRungs.push({ lane, y });
            }
        }
        // Important: Sort by Y for path calculation logic
        setRungs(newRungs.sort((a, b) => a.y - b.y));
    };

    // Initialize on mount
    useEffect(() => {
        generateRungs();
    }, []);

    // Add Rung on Click
    const handleSvgClick = (e) => {
        if (animating || winner) return;

        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

        // Check if click is within playable area
        if (svgP.y < RUNG_MIN_Y || svgP.y > RUNG_MAX_Y) return;

        // Find closest lane gap
        // Gaps are between LANE_X[i] and LANE_X[i+1]
        // The midpoint between lane i and i+1 is LANE_X[i] + LANE_WIDTH/2
        // We can just calculate which "gap index" the click falls into
        const gapIndex = Math.floor(svgP.x / LANE_WIDTH);

        if (gapIndex >= 0 && gapIndex < LANE_COUNT - 1) {
            const newRung = { lane: gapIndex, y: svgP.y };
            setRungs(prev => [...prev, newRung].sort((a, b) => a.y - b.y));
        }
    };

    const calculatePath = (startIndex) => {
        const points = [];
        let currentLane = startIndex;
        let currentY = MARGIN_TOP;

        points.push({ x: LANE_X[currentLane], y: MARGIN_TOP });

        // Iterate through all rungs
        // Since rungs are sorted by Y, we can just walk down
        for (const rung of rungs) {
            if (rung.y < currentY) continue; // Should not happen if sorted and starting from top

            // If this rung connects to our current lane
            if (rung.lane === currentLane) {
                // Move down to rung Y locally
                points.push({ x: LANE_X[currentLane], y: rung.y });
                // Move RIGHT to next lane
                currentLane = currentLane + 1;
                points.push({ x: LANE_X[currentLane], y: rung.y });
                currentY = rung.y;
            } else if (rung.lane === currentLane - 1) {
                // Move down to rung Y locally
                points.push({ x: LANE_X[currentLane], y: rung.y });
                // Move LEFT to prev lane
                currentLane = currentLane - 1;
                points.push({ x: LANE_X[currentLane], y: rung.y });
                currentY = rung.y;
            }
        }

        // Final drop to bottom
        points.push({ x: LANE_X[currentLane], y: HEIGHT - MARGIN_BOTTOM });

        return { points, finalIndex: currentLane };
    };

    const startBattle = () => {
        if (myLane === null) {
            alert("Please select a starting lane (tap a number at the top)!");
            return;
        }

        const { points, finalIndex } = calculatePath(myLane);
        setPathPoints(points);
        setAnimating(true);
        setWinner(null);

        // Calculate total length for duration
        const totalDuration = points.length * 0.3; // 0.3s per segment

        setTimeout(() => {
            setAnimating(false);
            const wonRestaurant = targets[finalIndex];
            setWinner(wonRestaurant);
            onFinish(wonRestaurant);
        }, totalDuration * 1000);
    };

    // Convert path points to SVG polyline string
    const polylinePoints = pathPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="flex flex-col items-center w-full h-full max-w-4xl mx-auto">
            {/* Controls */}
            <div className="flex gap-4 mb-4 z-10">
                <button
                    onClick={() => {
                        setRungs([]);
                        generateRungs();
                        setPathPoints([]);
                        setWinner(null);
                        setMyLane(null);
                    }}
                    disabled={animating}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow hover:bg-gray-300 transition-all"
                >
                    Reset Board
                </button>
                <button
                    onClick={startBattle}
                    disabled={animating || myLane === null}
                    className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all"
                >
                    Start Game
                </button>
            </div>

            <div className="relative w-full aspect-[3/4] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-100 dark:border-gray-700">
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="w-full h-full cursor-pointer"
                    onClick={handleSvgClick}
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Lane Lines */}
                    {LANE_X.map((x, i) => (
                        <line
                            key={`lane-${i}`}
                            x1={x} y1={MARGIN_TOP}
                            x2={x} y2={HEIGHT - MARGIN_BOTTOM}
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-gray-300 dark:text-gray-600"
                            strokeLinecap="round"
                        />
                    ))}

                    {/* Rungs */}
                    {rungs.map((rung, i) => {
                        const x1 = LANE_X[rung.lane];
                        const x2 = LANE_X[rung.lane + 1];
                        return (
                            <line
                                key={`rung-${i}`}
                                x1={x1} y1={rung.y}
                                x2={x2} y2={rung.y}
                                stroke="#3B82F6"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Top Buttons (Start Zones) */}
                    {LANE_X.map((x, i) => (
                        <g key={`btn-${i}`} onClick={(e) => { e.stopPropagation(); setMyLane(i); }} className="cursor-pointer hover:opacity-80">
                            <circle
                                cx={x} cy={MARGIN_TOP - 40} r="25"
                                fill={myLane === i ? '#2563EB' : '#E5E7EB'}
                                className="transition-colors duration-200"
                            />
                            <text
                                x={x} y={MARGIN_TOP - 32}
                                textAnchor="middle"
                                fill={myLane === i ? 'white' : '#6B7280'}
                                fontSize="20"
                                fontWeight="bold"
                                pointerEvents="none"
                            >
                                {i + 1}
                            </text>
                        </g>
                    ))}

                    {/* Bottom Labels (Restaurants) */}
                    {targets.map((target, i) => (
                        <g key={`target-${i}`}>
                            {/* Connector line small */}
                            <line
                                x1={LANE_X[i]} y1={HEIGHT - MARGIN_BOTTOM}
                                x2={LANE_X[i]} y2={HEIGHT - MARGIN_BOTTOM + 20}
                                stroke="currentColor" strokeWidth="2" className="text-gray-300"
                            />
                            <foreignObject x={LANE_X[i] - (LANE_WIDTH / 2) + 2} y={HEIGHT - MARGIN_BOTTOM + 20} width={LANE_WIDTH - 4} height="120">
                                <div className="flex flex-col items-center justify-start h-full p-1 text-center">
                                    <div className={`w-12 h-12 rounded-xl mb-1 flex items-center justify-center overflow-hidden shadow-sm border-2 ${winner?.id === target.id ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-gray-200'}`}>
                                        {target.photoUrl ? (
                                            <img src={target.photoUrl} alt={target.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">🍽️</div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold leading-tight line-clamp-2 ${winner?.id === target.id ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {target.name}
                                    </span>
                                </div>
                            </foreignObject>
                        </g>
                    ))}

                    {/* Animation Path */}
                    {animating && (
                        <>
                            {/* Trace Line */}
                            <motion.polyline
                                points={polylinePoints}
                                fill="none"
                                stroke="#FBBF24"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: pathPoints.length * 0.3, ease: "linear" }}
                                filter="url(#glow)"
                            />
                            {/* Moving Head - We can implement this with purely Framer Motion using a custom component or just rely on the trace line for now as it looks cleaner like a laser. 
                                Or if the user really wants a "point", we'd need to tween a circle along the path. 
                                The trace line is usually clearer for Amidakuji. Let's stick to the trace line + a circle at the tip if feasible, but pathLength is easiest.
                            */}
                        </>
                    )}
                </svg>
            </div>

            {winner && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 text-center z-50 pointer-events-none"
                >
                    <p className="text-gray-500 uppercase tracking-widest font-bold mb-2">The Chosen One</p>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{winner.name}</h2>
                    <p className="text-xl">🎉</p>
                </motion.div>
            )}
        </div>
    );
};

export default Amidakuji;
