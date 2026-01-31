import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const JoinSession = ({ sessionId, onJoined }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState({
        nickname: '',
        dates: [],
        timePeriods: [],
        locations: [],
        cuisines: []
    });

    useEffect(() => {
        if (sessionId) {
            fetchSession();
        }
    }, [sessionId]);

    const fetchSession = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'sessions', sessionId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSession({ id: docSnap.id, ...docSnap.data() });
            } else {
                setError('Session not found');
            }
        } catch (err) {
            setError('Error fetching session');
        } finally {
            setLoading(false);
        }
    };

    const handleMultiSelect = (field, value) => {
        setPreferences(prev => {
            const current = prev[field];
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [field]: next };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!preferences.nickname || preferences.dates.length === 0 || preferences.timePeriods.length === 0 || preferences.locations.length === 0) {
            alert('Please fill in all fields including your nickname');
            return;
        }

        setLoading(true);
        try {
            if (!auth.currentUser) await signInAnonymously(auth);

            const docRef = doc(db, 'sessions', sessionId);
            await setDoc(docRef, {
                participants: arrayUnion(auth.currentUser.uid),
                participantPreferences: {
                    [auth.currentUser.uid]: {
                        ...preferences,
                        submittedAt: serverTimestamp()
                    }
                }
            }, { merge: true });

            onJoined(sessionId, {
                ...preferences,
                submittedAt: serverTimestamp()
            });
        } catch (err) {
            console.error(err);
            alert('Failed to join session');
        } finally {
            setLoading(false);
        }
    };

    // Format date to show day of week
    const formatDateWithDay = (dateStr) => {
        const date = new Date(dateStr);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    };

    // Generate date range from start to end
    const getDateRange = () => {
        if (!session) return [];
        const dates = [];
        const start = new Date(session.startDate);
        const end = new Date(session.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }
        return dates;
    };

    if (loading && !session) return <div className="text-center py-20 text-blue-600 font-bold">Loading Session...</div>;
    if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
    if (!session) return null;

    const dateRange = getDateRange();

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 transition-all duration-300 text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Join "{session.name}"</h2>
            <p className="text-gray-500 text-center mb-8 italic">Choose your preferences from the host's list</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Nickname Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Your Nickname
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={preferences.nickname}
                        onChange={(e) => setPreferences(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                {/* Date Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Available Dates
                        {preferences.dates.length > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                {preferences.dates.length} selected
                            </span>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {dateRange.map(date => (
                            <button
                                type="button"
                                key={date}
                                onClick={() => handleMultiSelect('dates', date)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${preferences.dates.includes(date)
                                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {preferences.dates.includes(date) && '✓ '}
                                {formatDateWithDay(date)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Period Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Time Periods
                        {preferences.timePeriods.length > 0 && (
                            <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                                {preferences.timePeriods.length} selected
                            </span>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['Morning', 'Afternoon', 'Evening', 'Night'].map(period => (
                            <button
                                type="button"
                                key={period}
                                onClick={() => handleMultiSelect('timePeriods', period)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${preferences.timePeriods.includes(period)
                                    ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {preferences.timePeriods.includes(period) && '✓ '}
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Locations
                        {preferences.locations.length > 0 && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                                {preferences.locations.length} selected
                            </span>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {session.locations.map(location => (
                            <button
                                type="button"
                                key={location}
                                onClick={() => handleMultiSelect('locations', location)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${preferences.locations.includes(location)
                                    ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {preferences.locations.includes(location) && '✓ '}
                                {location}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cuisine Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Cuisines
                        {preferences.cuisines.length > 0 && (
                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                {preferences.cuisines.length} selected
                            </span>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {session.cuisines.map(cuisine => (
                            <button
                                type="button"
                                key={cuisine}
                                onClick={() => handleMultiSelect('cuisines', cuisine)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${preferences.cuisines.includes(cuisine)
                                    ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-300 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {preferences.cuisines.includes(cuisine) && '✓ '}
                                {cuisine}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                        }`}
                >
                    {loading ? 'Joining...' : 'Submit Preferences & Join →'}
                </button>
            </form>
        </div>
    );
};

export default JoinSession;
