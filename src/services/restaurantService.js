/**
 * Fetches real-time restaurant data using the New Google Places API (v3.56+).
 * Requires "Places API (New)" and "Maps JavaScript API" to be enabled in Cloud Console.
 */
export const fetchRestaurantsLive = async (preferences) => {
    try {
        if (!window.google || !window.google.maps) {
            console.warn("Google Maps SDK not loaded, falling back to mock data");
            return await fetchRestaurantsMock(preferences);
        }

        // Import the places library dynamically (v3.56+)
        // This is the correct way to get the modern Place class
        const { Place } = await google.maps.importLibrary("places");

        const locations = preferences.locations && preferences.locations.length > 0
            ? preferences.locations.slice(0, 3)
            : ['Taiwan'];

        const cuisineQuery = preferences.cuisines?.length > 0
            ? preferences.cuisines.join(' ')
            : 'restaurant';

        const allResults = [];

        console.log(`Starting Live Search for: ${cuisineQuery} in ${locations.join(', ')}`);

        // Execute searches for each selected location
        for (const location of locations) {
            const request = {
                textQuery: `${cuisineQuery} in ${location}`,
                // Fields are camelCase and match property names on the Place instance
                fields: ['id', 'displayName', 'formattedAddress', 'rating', 'priceLevel', 'photos', 'googleMapsURI'],
                maxResultCount: 20,
            };

            try {
                const { places } = await Place.searchByText(request);

                if (places && places.length > 0) {
                    const mapped = places.map(place => {
                        // DEFENSIVE MAPPING for New API (JS SDK)
                        // displayName can sometimes be an object { text, languageCode } in raw responses, 
                        // though the SDK property is usually a string.
                        const name = typeof place.displayName === 'object'
                            ? place.displayName.text
                            : (place.displayName || 'Unnamed Restaurant');

                        // priceLevel is an enum: PRICE_LEVEL_INEXPENSIVE, etc.
                        // We map it to our internal numeric price range (100-1000)
                        const priceLevels = {
                            'PRICE_LEVEL_FREE': 0,
                            'PRICE_LEVEL_INEXPENSIVE': 200,
                            'PRICE_LEVEL_MODERATE': 400,
                            'PRICE_LEVEL_EXPENSIVE': 700,
                            'PRICE_LEVEL_VERY_EXPENSIVE': 1000
                        };
                        const priceScore = priceLevels[place.priceLevel] || 400;

                        return {
                            id: place.id,
                            name: name,
                            rating: place.rating || 0,
                            priceLevel: priceScore,
                            address: place.formattedAddress || 'Address not available',
                            cuisine: preferences.cuisines?.[0] || 'Restaurant',
                            location: location,
                            mapsUrl: place.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=google_place_id:${place.id}`,
                            // getURI() is the correct method for v1 Photo objects
                            photoUrl: place.photos?.[0]?.getURI({ maxWidth: 600, maxHeight: 400 }) || `https://via.placeholder.com/400x300?text=${encodeURIComponent(name)}`,
                            images: place.photos && place.photos.length > 0
                                ? place.photos.slice(0, 3).map(p => p.getURI({ maxWidth: 800, maxHeight: 600 }))
                                : [`https://via.placeholder.com/400x300?text=${encodeURIComponent(name)}`]
                        };
                    });
                    allResults.push(...mapped);
                }
            } catch (err) {
                // If we get PERMISSION_DENIED here, it's likely the API Key or Service settings
                console.error(`Search failed for ${location}. Error Details:`, err);

                // If it's a permission error, we should probably stop early and use mock
                if (err.name === 'MapsRequestError' && err.message.includes('PERMISSION_DENIED')) {
                    throw err; // Caught by the outer catch to trigger mock fallback
                }
            }
        }

        // Deduplicate results by ID
        const unique = Array.from(new Map(allResults.map(r => [r.id, r])).values());

        if (unique.length === 0) {
            console.warn('Live Search returned no results. Falling back to mock.');
            return await fetchRestaurantsMock(preferences);
        }

        // Final Filter based on Preferences (Rating and Price)
        const minVal = preferences.minPrice || 0;
        const maxVal = preferences.maxPrice || 5000;

        const filtered = unique.filter(r =>
            r.rating >= 4.0 &&
            r.priceLevel >= minVal &&
            r.priceLevel <= maxVal
        );

        console.log(`Process Complete. Found ${unique.length} unique, ${filtered.length} matching preferences.`);

        // Return results (up to 20)
        return filtered.length > 0 ? filtered.slice(0, 20) : unique.slice(0, 20);

    } catch (error) {
        console.error("Critical error in fetchRestaurantsLive:", error);
        return await fetchRestaurantsMock(preferences);
    }
};

/**
 * Fallback Mock Data Service
 */
export const fetchRestaurantsMock = (preferences) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const all = [
                {
                    id: 'm1', name: 'Tasty Taiwan (Mock)', rating: 4.5, priceLevel: 200, address: 'Xinyi District, Taipei', cuisine: 'Taiwanese', location: 'Taipei City (台北市) - Xinyi (信義區)',
                    mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Tasty+Taiwan',
                    images: ['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Tasty+Taiwan']
                },
                {
                    id: 'm2', name: 'Malay Feast (Mock)', rating: 4.2, priceLevel: 150, address: 'Bukit Bintang, KL', cuisine: 'Malay', location: 'Kuala Lumpur - Bukit Bintang',
                    mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Malay+Feast',
                    images: ['https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Malay+Feast']
                },
                {
                    id: 'm3', name: 'Ipoh Bean Chicken (Mock)', rating: 4.9, priceLevel: 100, address: 'Ipoh, Perak', cuisine: 'Chinese', location: 'Perak - Ipoh',
                    mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/F38181/FFFFFF?text=Ipoh+Chicken',
                    images: ['https://via.placeholder.com/400x300/F38181/FFFFFF?text=Ipoh+Chicken']
                }
            ];

            const filtered = all.filter(r => {
                const min = preferences.minPrice || 0;
                const max = preferences.maxPrice || 10000;
                return r.rating >= 4.0 && r.priceLevel >= min && r.priceLevel <= max;
            });

            resolve(filtered);
        }, 500);
    });
};
