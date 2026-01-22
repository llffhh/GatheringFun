import React, { useState } from 'react';
import { REGIONS } from '../utils/regions';

const CUISINES = ['Taiwanese', 'Chinese', 'Western', 'Japanese', 'Korean', 'Thai', 'Indian', 'Italian', 'Malay', 'Nyonya'];
const PRICE_RANGES = [
    { label: '$ (Low Budget)', value: 1 },
    { label: '$$ (Budget Friendly)', value: 2 },
    { label: '$$$ (Mid Range)', value: 3 },
    { label: '$$$$ (Splurge)', value: 4 }
];

const HostForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        country: 'Taiwan',
        locations: [],
        cuisines: [],
        minPrice: 1,
        maxPrice: 4,
        waitMinutes: 10
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'country') {
            setFormData(prev => ({ ...prev, [name]: value, locations: [] }));
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate || !formData.endDate || formData.locations.length === 0) {
            alert('Please fill in required fields, including at least one location');
            return;
        }
        onSubmit(formData);
    };

    const countryRegions = REGIONS[formData.country];

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 transition-all duration-300 text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Start a New Gathering</h2>

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
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-600">
                            {[1, 2, 3, 4].map(p => {
                                const isSelected = p >= formData.minPrice && p <= formData.maxPrice;
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                            // Simple logic: if click below min, move min. If click above max, move max.
                                            // If click between, move nearest edge.
                                            if (p < formData.minPrice) {
                                                setFormData(prev => ({ ...prev, minPrice: p }));
                                            } else if (p > formData.maxPrice) {
                                                setFormData(prev => ({ ...prev, maxPrice: p }));
                                            } else {
                                                // If clicking inside, adjust the closer boundary
                                                const distMin = Math.abs(p - formData.minPrice);
                                                const distMax = Math.abs(p - formData.maxPrice);
                                                if (distMin < distMax) {
                                                    setFormData(prev => ({ ...prev, minPrice: p }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, maxPrice: p }));
                                                }
                                            }
                                        }}
                                        className={`flex-1 py-1.5 rounded-lg text-lg font-bold transition-all ${isSelected
                                            ? 'bg-blue-500 text-white shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {'$'.repeat(p)}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 px-1">
                            Current: {'$'.repeat(formData.minPrice)} - {'$'.repeat(formData.maxPrice)}
                        </p>
                    </div>
                </div>

                {/* Location Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Locations (Select multiple Districts/Areas)</label>
                    <div className="max-h-60 overflow-y-auto space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {Object.entries(countryRegions).map(([city, districts]) => (
                            <div key={city}>
                                <h4 className="text-sm font-bold text-gray-500 mb-2">{city}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {districts.map(district => (
                                        <button
                                            type="button"
                                            key={district}
                                            onClick={() => handleMultiSelect('locations', `${city} - ${district}`)}
                                            className={`px-3 py-1 bg-white dark:bg-gray-700 rounded-md border transition-all text-xs font-medium ${formData.locations.includes(`${city} - ${district}`)
                                                ? 'border-blue-500 ring-2 ring-blue-500/20 text-blue-600'
                                                : 'border-gray-200 dark:border-gray-600 text-gray-600'
                                                }`}
                                        >
                                            {district}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cuisine Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preferred Cuisines</label>
                    <div className="flex flex-wrap gap-2">
                        {CUISINES.map(cuisine => (
                            <button
                                type="button"
                                key={cuisine}
                                onClick={() => handleMultiSelect('cuisines', cuisine)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.cuisines.includes(cuisine)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {cuisine}
                            </button>
                        ))}
                    </div>
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
