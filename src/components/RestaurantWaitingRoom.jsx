import React from 'react';
import HostShareToolbar from './HostShareToolbar';

const RestaurantWaitingRoom = ({ session, timeLeft, currentUser, handleEndVotingEarly, loading }) => {
    const participants = session.participants || [];
    const preferences = session.participantPreferences || {};
    const votes = session.restaurantVotes || {};
    const isHost = session.hostId === currentUser?.uid;

    return (
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center text-gray-900 dark:text-white mt-12">
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Time Remaining</p>
                <p className="text-4xl font-mono font-black text-blue-700 dark:text-blue-300">{timeLeft || '--:--'}</p>
            </div>

            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
            </div>

            <h2 className="text-3xl font-bold mb-2">Votes Being Cast!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Waiting for everyone to finish swiping. Next: The Amidakuji Game!</p>

            <div className="space-y-4 mb-8">
                {participants.map(uid => {
                    const hasVoted = !!votes[uid];
                    const userPrefs = preferences[uid] || {};
                    const nickname = userPrefs.nickname || (uid === currentUser?.uid ? 'You' : `Player ${uid.slice(0, 4)}`);
                    const isMe = uid === currentUser?.uid;

                    return (
                        <div
                            key={uid}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500 ${hasVoted
                                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 opacity-100'
                                : 'bg-gray-50 dark:bg-gray-900/30 border-transparent opacity-40 grayscale'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${hasVoted ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {nickname.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className={`font-bold ${isMe ? 'text-blue-600' : ''}`}>{nickname}</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                        {hasVoted ? '✅ Ready' : '⏳ Swiping...'}
                                    </p>
                                </div>
                            </div>
                            {hasVoted ? (
                                <span className="text-blue-500">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                </span>
                            ) : (
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <HostShareToolbar session={session} currentUser={currentUser} messageType="voting" />

            {isHost && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-4">You can end the voting phase early if everyone is ready!</p>
                    <button
                        onClick={handleEndVotingEarly}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
                    >
                        {loading ? 'Processing...' : 'End Voting Phase Early ⚔️'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RestaurantWaitingRoom;
