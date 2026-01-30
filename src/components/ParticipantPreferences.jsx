import React, { useState } from 'react';

const ParticipantPreferences = ({ sessionData, onSubmit, loading }) => {
    const [preferences, setPreferences] = useState({
        dates: [],
        timePeriods: [],
        locations: [],
        cuisines: []
    });

    const handleMultiSelect = (field, value) => {
        setPreferences(prev => {
            const current = prev[field];
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [field]: next };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (preferences.dates.length === 0 || preferences.locations.length === 0) {
            alert('Please select at least one date, time period, and location');
            return;
        }
        onSubmit(preferences);
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
        const dates = [];
        const start = new Date(sessionData.startDate);
        const end = new Date(sessionData.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }

        return dates;
    };

    const dateRange = getDateRange();

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 transition-all duration-300 text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Select Your Preferences</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Choose from the options set by the host</p>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="space-y-4 max-h-80 overflow-y-auto p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
                        {Object.entries(
                            sessionData.locations.reduce((acc, loc) => {
                                const [state, city] = loc.split(' - ');
                                if (!acc[state]) acc[state] = [];
                                acc[state].push({ full: loc, city });
                                return acc;
                            }, {})
                        ).sort(([a], [b]) => a.localeCompare(b)).map(([state, items]) => (
                            <div key={state} className="space-y-2">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{state}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {items.map(item => (
                                        <button
                                            type="button"
                                            key={item.full}
                                            onClick={() => handleMultiSelect('locations', item.full)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${preferences.locations.includes(item.full)
                                                ? 'bg-green-600 text-white border-green-600 shadow-md scale-105'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-green-300'
                                                }`}
                                        >
                                            {preferences.locations.includes(item.full) && '✓ '}
                                            {item.city}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                        {sessionData.cuisines.map(cuisine => (
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
                    <p className="text-xs text-gray-500 mt-2 italic">Cuisine selection is optional</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                        }`}
                >
                    {loading ? 'Saving...' : 'Submit Preferences & Start Swiping →'}
                </button>
            </form>
        </div>
    );
};

export default ParticipantPreferences;
