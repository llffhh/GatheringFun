import React, { useState } from 'react';
import { REGIONS } from '../utils/regions';

const CUISINES = ['Taiwanese', 'Chinese', 'Western', 'Japanese', 'Korean', 'Thai', 'Indian', 'Italian', 'Malay', 'Nyonya'];
const PRICE_RANGES = [
    { label: '$ (Low Budget)', value: 1 },
    { label: '$$ (Budget Friendly)', value: 2 },
    { label: '$$$ (Mid Range)', value: 3 },
    { label: '$$$$ (Splurge)', value: 4 }
];

const HostForm = ({ onSubmit, loading, session, setSession, setMode, timeLeft }) => {
    const [step, setStep] = useState(session ? 2 : 1);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        country: 'Taiwan',
        locations: [],
        cuisines: [],
        timePeriods: [],
        minPrice: 100,
        maxPrice: 1000,
        waitMinutes: 10
    });

    const [tempTime, setTempTime] = useState({ start: '', end: '' });

    const [selectedState, setSelectedState] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'country') {
            setFormData(prev => ({ ...prev, [name]: value, locations: [] }));
            setSelectedState('');
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => {
            const current = prev[field];
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [field]: next };
        });
    };

    const addTimePeriod = () => {
        if (!tempTime.start || !tempTime.end) {
            alert('Please select both start and end times');
            return;
        }
        const newPeriod = `${tempTime.start} - ${tempTime.end}`;
        if (formData.timePeriods.length >= 5) {
            alert('Maximum 5 time periods allowed');
            return;
        }
        if (formData.timePeriods.includes(newPeriod)) {
            alert('This time period already exists');
            return;
        }
        setFormData(prev => ({
            ...prev,
            timePeriods: [...prev.timePeriods, newPeriod]
        }));
        setTempTime({ start: '', end: '' });
    };

    const removeTimePeriod = (period) => {
        setFormData(prev => ({
            ...prev,
            timePeriods: prev.timePeriods.filter(p => p !== period)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate || !formData.endDate || formData.locations.length === 0) {
            alert('Please fill in required fields and select at least one location');
            return;
        }
        onSubmit(formData);
    };

    const states = Object.keys(REGIONS[formData.country]).sort();

    if (session || step === 2) {
        return (
            <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl text-center text-gray-900 dark:text-white transition-all transform animate-in fade-in zoom-in duration-500">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-black mb-2">Gathering is LIVE!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
                    Share the ID below with your friends to start the fun.
                </p>

                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-inner">
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Phase 1 Time Limit</p>
                    <p className="text-4xl font-mono font-black text-blue-700 dark:text-blue-300">{timeLeft || '--:--'}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 mb-8 group cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => {
                        navigator.clipboard.writeText(session?.id);
                        alert('Session ID copied to clipboard!');
                    }}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Click to copy ID</p>
                    <code className="text-3xl font-mono font-black text-blue-600 dark:text-blue-400 break-all">
                        {session?.id || '......'}
                    </code>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => { setSession(null); setMode('home'); }}
                        className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm mb-2"
                    >
                        ← Back to Menu
                    </button>

                    <button
                        onClick={() => {
                            setMode('join');
                        }}
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-lg"
                    >
                        Enter Your Name & Preferences →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 transition-all duration-300 text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center" id="form-title">Start a New Gathering</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Meeting Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gathering Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Friday Dinner Party"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                {/* Country & Price */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Country</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Taiwan">Taiwan</option>
                            <option value="Malaysia">Malaysia</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min Price</label>
                            <input
                                type="number"
                                name="minPrice"
                                value={formData.minPrice}
                                onChange={handleChange}
                                min="100"
                                max="1000"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Price</label>
                            <input
                                type="number"
                                name="maxPrice"
                                value={formData.maxPrice}
                                onChange={handleChange}
                                min="100"
                                max="1000"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Hierarchical Location Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Locations (Step 1: Choose State/City)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto p-2 border border-gray-100 dark:border-gray-700 rounded-lg">
                        {states.map(state => (
                            <button
                                type="button"
                                key={state}
                                onClick={() => setSelectedState(state)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedState === state
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                {state}
                            </button>
                        ))}
                    </div>

                    {selectedState && (
                        <>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Locations (Step 2: Select Districts/Areas in {selectedState})
                            </label>
                            <div className="flex flex-wrap gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                                {REGIONS[formData.country][selectedState].map(district => (
                                    <button
                                        type="button"
                                        key={district}
                                        onClick={() => handleMultiSelect('locations', `${selectedState} - ${district}`)}
                                        className={`px-3 py-1.5 rounded-md border transition-all text-xs font-medium ${formData.locations.includes(`${selectedState} - ${district}`)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm'
                                            : 'border-gray-200 dark:border-gray-600 text-gray-600 bg-white dark:bg-gray-800'
                                            }`}
                                    >
                                        {formData.locations.includes(`${selectedState} - ${district}`) && '✓ '}
                                        {district}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {formData.locations.length > 0 && (
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Selected Areas:</label>
                            <div className="flex flex-wrap gap-2">
                                {formData.locations.map(loc => (
                                    <span key={loc} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                                        {loc}
                                        <button
                                            type="button"
                                            onClick={() => handleMultiSelect('locations', loc)}
                                            className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
                                        >
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Cuisine Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Cuisines
                        {formData.cuisines.length > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                {formData.cuisines.length} selected
                            </span>
                        )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {CUISINES.map(cuisine => (
                            <button
                                type="button"
                                key={cuisine}
                                onClick={() => handleMultiSelect('cuisines', cuisine)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.cuisines.includes(cuisine)
                                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {formData.cuisines.includes(cuisine) && '✓ '}
                                {cuisine}
                            </button>
                        ))}
                    </div>
                    {formData.cuisines.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2 italic">Click to select multiple cuisines (optional)</p>
                    )}
                </div>

                {/* Wait Duration */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Wait Duration (Minutes)</label>
                    <input
                        type="number"
                        name="waitMinutes"
                        value={formData.waitMinutes}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Wait for participants to join before generating results.</p>
                </div>

                {/* Time Periods Selection */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Specify Gathering Time Slots (Max 5)
                    </label>
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1">
                            <input
                                type="time"
                                value={tempTime.start}
                                onChange={(e) => setTempTime(prev => ({ ...prev, start: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center text-gray-400">to</div>
                        <div className="flex-1">
                            <input
                                type="time"
                                value={tempTime.end}
                                onChange={(e) => setTempTime(prev => ({ ...prev, end: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addTimePeriod}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                        >
                            + Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.timePeriods.map(period => (
                            <span key={period} className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                                <span className="mr-2 italic">🕒</span>
                                {period}
                                <button
                                    type="button"
                                    onClick={() => removeTimePeriod(period)}
                                    className="ml-2 inline-flex text-orange-400 hover:text-orange-600"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}
                >
                    {loading ? 'Creating...' : 'Create Gathering Link'}
                </button>
            </form>
        </div>
    );
};

export default HostForm;
