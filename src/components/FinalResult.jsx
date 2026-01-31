import React from 'react';

const FinalResult = ({ session, setMode }) => {
    const { finalChoice, finalRanking, startDate, name } = session;

    const handleGoogleMaps = () => {
        const mapsUrl = finalChoice.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${finalChoice.name} ${finalChoice.address}`)}`;
        window.open(mapsUrl, '_blank');
    };

    const handleGoogleCalendar = () => {
        const title = encodeURIComponent(`Gathering: ${name}`);
        const defaultMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${finalChoice.name} ${finalChoice.address}`)}`;
        const mapsUrl = finalChoice.mapsUrl || defaultMapsUrl;
        const details = encodeURIComponent(`Restaurant: ${finalChoice.name}\nAddress: ${finalChoice.address}\nMap: ${mapsUrl}`);

        const eventDate = session.finalDate || startDate;
        const dateStr = eventDate.replace(/-/g, '');
        // For simplicity, we use the selected date for the event. 
        // We set it to last for a few hours if no specific end time is parsed, but the winningTime is usually a range.
        const start = `${dateStr}T120000Z`; // Default to noon UTC if we can't parse exactly
        const end = `${dateStr}T140000Z`;

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(finalChoice.address)}&dates=${start}/${end}`;
        window.open(url, '_blank');
    };

    return (
        <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl text-center border-4 border-yellow-400">
            <div className="mb-8">
                <span className="px-6 py-2 bg-yellow-400 text-yellow-900 text-sm font-black rounded-full uppercase tracking-tighter">Your Solemate!</span>
            </div>

            <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4">{finalChoice.name}</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">{finalChoice.address}</p>

            {/* 3 Images Grid */}
            <div className="grid grid-cols-3 gap-2 mb-8">
                {finalChoice.images && finalChoice.images.length > 0 ? (
                    finalChoice.images.slice(0, 3).map((imgUrl, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-md">
                            <img src={imgUrl} alt="Food" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                        </div>
                    ))
                ) : (
                    [1, 2, 3].map(i => (
                        <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    ))
                )}
            </div>

            {/* Winning Schedule Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-[2rem] mb-10 border border-blue-100/50 dark:border-blue-800/30 shadow-xl relative overflow-hidden group text-left">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <span className="text-6xl">🗓️</span>
                </div>
                <h3 className="text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
                    Winning Schedule
                </h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center text-xl">📅</div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Selected Date</p>
                                <p className="font-black text-gray-900 dark:text-white">{session.finalDate || startDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center text-xl">🕒</div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Selected Time</p>
                                <p className="font-black text-gray-900 dark:text-white">{session.finalTime || 'TBD'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RANKING LIST */}
            <div className="mb-10 text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">📊</span>
                    Popularity Ranking
                </h3>
                <div className="space-y-2">
                    {finalRanking && finalRanking.map((rank, idx) => (
                        <div key={rank.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
                                    {idx + 1}
                                </span>
                                <span className="font-medium dark:text-white">{rank.name || 'Unknown'}</span>
                            </div>
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                                {rank.votes} {rank.votes === 1 ? 'vote' : 'votes'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleGoogleMaps}
                    className="w-full py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                    View on Google Maps
                </button>

                <button
                    onClick={handleGoogleCalendar}
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" /></svg>
                    Add to Google Calendar
                </button>

                <button
                    onClick={() => setMode('home')}
                    className="py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold uppercase tracking-widest"
                >
                    ← Start New Gathering
                </button>
            </div>
        </div>
    );
};

export default FinalResult;
