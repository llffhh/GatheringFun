import React from 'react';

const HomeView = ({ setMode, joinId, setJoinId }) => {
    return (
        <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 py-2">
                GatheringFun
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">
                Decide where and when to meet, the fun way!
            </p>

            <div className="grid md:grid-cols-2 gap-8">
                <div
                    className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                    onClick={() => setMode('create')}
                >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 dark:text-white">Create Gathering</h3>
                    <p className="text-gray-500 dark:text-gray-400">Host a new meeting and invite friends.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-2 border-transparent hover:border-purple-500">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 dark:text-white">Join Gathering</h3>
                    <input
                        type="text"
                        placeholder="Enter Session ID"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 mb-4 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                    />
                    <button
                        onClick={() => joinId && setMode('join')}
                        className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all"
                    >
                        Join Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
