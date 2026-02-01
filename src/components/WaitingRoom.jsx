import React from 'react';
import HostShareToolbar from './HostShareToolbar';

const WaitingRoom = ({ session, timeLeft, restaurants, currentUser }) => {
    const participants = session.participants || [];
    const preferences = session.participantPreferences || {};
    const results = session.amidakujiResults || {};

    return (
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center text-gray-900 dark:text-white mt-12">
            {/* Timer Header */}
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-100 dark:border-red-800 shadow-inner">
                <p className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-[0.2em] mb-2">Final Countdown</p>
                <p className="text-6xl font-mono font-black text-red-600 dark:text-red-400 animate-pulse drop-shadow-sm">
                    {timeLeft || '00:00'}
                </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[2px] w-8 bg-gray-200 dark:bg-gray-700"></div>
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Waiting Room</h2>
                <div className="h-[2px] w-8 bg-gray-200 dark:bg-gray-700"></div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                Fate is being decided. Once the timer ends, the group winner will be revealed!
            </p>

            {/* Participant List */}
            <div className="space-y-4">
                {participants.map(uid => {
                    const isFinished = !!results[uid];
                    const userPrefs = preferences[uid] || {};
                    const nickname = userPrefs.nickname || (uid === currentUser?.uid ? 'You' : `Player ${uid.slice(0, 4)}`);
                    const wonRestaurantId = results[uid];
                    const wonRestaurant = session.amidakuji?.ranking?.find(r => r.id === wonRestaurantId);
                    const isMe = uid === currentUser?.uid;

                    return (
                        <div
                            key={uid}
                            className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-500 border-2 ${isFinished
                                ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800 opacity-100'
                                : 'bg-gray-50 dark:bg-gray-900/30 border-transparent opacity-40 grayscale-[0.5]'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${isFinished ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {nickname.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className={`font-black ${isMe ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                        {nickname} {isMe && '(Me)'}
                                    </p>
                                    <p className={`text-xs font-bold uppercase ${isFinished ? 'text-green-600' : 'text-gray-500'}`}>
                                        {isFinished ? '✅ Finished' : '🎮 Playing...'}
                                    </p>
                                </div>
                            </div>

                            {isFinished ? (
                                <div className="flex flex-col items-end max-w-[150px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Won Slot</p>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                                            {wonRestaurant?.photoUrl ? (
                                                <img src={wonRestaurant.photoUrl} alt="Won" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] flex items-center justify-center h-full">🍽️</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-black truncate">{wonRestaurant?.name || '???'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <HostShareToolbar session={session} currentUser={currentUser} messageType="waiting" />

            <div className="mt-12 flex flex-col items-center">
                <div className="w-12 h-1 shadow-inner bg-gray-100 dark:bg-gray-700 rounded-full mb-4"></div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">GatheringFun Engine v1.0</p>
            </div>
        </div>
    );
};

export default WaitingRoom;
