import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TinderSwiper = ({ restaurants, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [votes, setVotes] = useState({ like: [], pass: [] });

    const currentRestaurant = restaurants[currentIndex];

    const handleSwipe = (direction) => {
        const restaurant = restaurants[currentIndex];
        setVotes(prev => ({
            ...prev,
            [direction]: [...prev[direction], restaurant.id]
        }));

        if (currentIndex < restaurants.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onFinish({ like: [...votes.like, direction === 'like' ? restaurant.id : null].filter(Boolean) });
        }
    };

    if (!currentRestaurant) return <div className="text-center py-20 font-bold">No restaurants to display</div>;

    return (
        <div className="relative w-full max-w-sm mx-auto h-[500px] flex flex-col items-center justify-center">
            <div className="absolute top-[-40px] flex justify-between w-full px-4 text-xs font-black uppercase tracking-widest text-gray-400">
                <span className="text-red-500">← Swipe Left to Pass</span>
                <span className="text-green-500">Swipe Right to Like →</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentRestaurant.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => {
                        if (info.offset.x > 100) handleSwipe('like');
                        else if (info.offset.x < -100) handleSwipe('pass');
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ x: 200, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col cursor-grab active:cursor-grabbing border border-gray-100 dark:border-gray-700"
                >
                    {/* Image Placeholder */}
                    <div className="w-full h-2/3 bg-gray-200 dark:bg-gray-700 relative">
                        <img
                            src={currentRestaurant.photoUrl || `https://via.placeholder.com/400x600?text=${encodeURIComponent(currentRestaurant.name)}`}
                            alt={currentRestaurant.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 right-4">
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                                {currentRestaurant.priceLevel || '$$'} • {currentRestaurant.rating} ★
                            </span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 flex flex-col h-1/3 justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate">{currentRestaurant.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">{currentRestaurant.address}</p>
                        </div>

                        <div className="flex gap-4">
                            <a
                                href={currentRestaurant.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentRestaurant.name}, ${currentRestaurant.address}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-700 text-center rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                                Google Maps
                            </a>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex gap-8">
                <button
                    onClick={() => handleSwipe('pass')}
                    className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg text-red-500 hover:scale-110 active:scale-95 transition-all border border-red-100 dark:border-red-900/30"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <button
                    onClick={() => handleSwipe('like')}
                    className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg text-green-500 hover:scale-110 active:scale-95 transition-all border border-green-100 dark:border-green-900/30"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
            </div>

            <p className="mt-8 text-sm text-gray-500">{currentIndex + 1} / {restaurants.length}</p>
        </div >
    );
};

export default TinderSwiper;
