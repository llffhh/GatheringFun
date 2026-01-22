import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const JoinSession = ({ sessionId, onJoined }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState({
        dates: [],
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
        if (preferences.dates.length === 0 || preferences.locations.length === 0 || preferences.cuisines.length === 0) {
            alert('Please select at least one option for each category');
            return;
        }

        setLoading(true);
        try {
            if (!auth.currentUser) await signInAnonymously(auth);

            const docRef = doc(db, 'sessions', sessionId);
            await updateDoc(docRef, {
                participants: arrayUnion(auth.currentUser.uid),
                [`votes.${auth.currentUser.uid}`]: preferences
            });

            onJoined(sessionId);
        } catch (err) {
            alert('Failed to join session');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !session) return <div className="text-center py-20 text-blue-600 font-bold">Loading Session...</div>;
    if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
    if (!session) return null;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 transition-all duration-300 text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Join "{session.name}"</h2>
            <p className="text-gray-500 text-center mb-8 italic">Choose your preferences from the host's list</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Preferred Dates */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Which dates work for you?</label>
                    <div className="flex flex-wrap gap-2">
                        {/* For simplicity, we just show the range for now. Real implementation should generate individual dates between start and end. */}
                        <button
                            type="button"
                            onClick={() => handleMultiSelect('dates', `${session.startDate} to ${session.endDate}`)}
                            className={`px-4 py-2 rounded-lg border transition-all ${preferences.dates.includes(`${session.startDate} to ${session.endDate}`)
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            {session.startDate} ~ {session.endDate}
                        </button>
                    </div>
                </div>

                {/* Preferred Locations */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Preferred Locations</label>
                    <div className="flex flex-wrap gap-2">
                        {session.locations.map(loc => (
                            <button
                                type="button"
                                key={loc}
                                onClick={() => handleMultiSelect('locations', loc)}
                                className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${preferences.locations.includes(loc)
                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                    }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferred Cuisines */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Preferred Cuisines</label>
                    <div className="flex flex-wrap gap-2">
                        {session.cuisines.map(cuisine => (
                            <button
                                type="button"
                                key={cuisine}
                                onClick={() => handleMultiSelect('cuisines', cuisine)}
                                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${preferences.cuisines.includes(cuisine)
                                        ? 'bg-purple-500 text-white border-purple-500'
                                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                    }`}
                            >
                                {cuisine}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02]'
                        }`}
                >
                    {loading ? 'Joining...' : 'Submit My Preferences'}
                </button>
            </form>
        </div>
    );
};

export default JoinSession;
