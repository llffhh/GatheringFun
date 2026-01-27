export const fetchRestaurantsMock = (preferences) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const all = [
                // Taiwan - Taipei
                { id: '1', name: 'Tasty Taiwan', rating: 4.5, priceLevel: 200, address: 'Xinyi District, Taipei', cuisine: 'Taiwanese', location: 'Taipei - Xinyi District (台北市 - 信義區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tasty+Taiwan+Xinyi+Taipei', photoUrl: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Tasty+Taiwan' },
                { id: '3', name: 'Gourmet House', rating: 4.8, priceLevel: 350, address: 'Da-an District, Taipei', cuisine: 'Western', location: 'Taipei - Da-an District (台北市 - 大安區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gourmet+House+Daan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/95E1D3/FFFFFF?text=Gourmet+House' },
                { id: '5', name: 'Zen Garden', rating: 4.6, priceLevel: 250, address: 'Zhongshan District, Taipei', cuisine: 'Japanese', location: 'Taipei - Zhongshan District (台北市 - 中山區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zen+Garden+Zhongshan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/AA96DA/FFFFFF?text=Zen+Garden' },
                { id: '6', name: 'Luxury Dine', rating: 4.9, priceLevel: 800, address: 'Xinyi District, Taipei', cuisine: 'Western', location: 'Taipei - Xinyi District (台北市 - 信義區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Luxury+Dine+Xinyi+Taipei', photoUrl: 'https://via.placeholder.com/400x300/FCBAD3/FFFFFF?text=Luxury+Dine' },
                { id: '8', name: 'Noodle Paradise', rating: 4.7, priceLevel: 160, address: 'Songshan District, Taipei', cuisine: 'Chinese', location: 'Taipei - Songshan District (台北市 - 松山區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Noodle+Paradise+Songshan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/A8D8EA/FFFFFF?text=Noodle+Paradise' },
                { id: '9', name: 'Sushi Master', rating: 4.5, priceLevel: 400, address: 'Xinyi District, Taipei', cuisine: 'Japanese', location: 'Taipei - Xinyi District (台北市 - 信義區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sushi+Master+Xinyi+Taipei', photoUrl: 'https://via.placeholder.com/400x300/FFAAA5/FFFFFF?text=Sushi+Master' },
                { id: '11', name: 'Korean BBQ House', rating: 4.6, priceLevel: 300, address: 'Da-an District, Taipei', cuisine: 'Korean', location: 'Taipei - Da-an District (台北市 - 大安區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Korean+BBQ+Daan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/C7CEEA/FFFFFF?text=Korean+BBQ' },
                { id: '12', name: 'Italian Corner', rating: 4.3, priceLevel: 350, address: 'Zhongshan District, Taipei', cuisine: 'Italian', location: 'Taipei - Zhongshan District (台北市 - 中山區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Italian+Corner+Zhongshan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/B5EAD7/FFFFFF?text=Italian+Corner' },

                // Taiwan - New Taipei
                { id: '20', name: 'Banqiao Burgers', rating: 4.2, priceLevel: 250, address: 'Banqiao District', cuisine: 'Western', location: 'New Taipei - Banqiao District (新北市 - 板橋區)', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=Banqiao' },

                // Malaysia - KL
                { id: '2', name: 'Malay Feast', rating: 4.2, priceLevel: 150, address: 'Bukit Bintang, KL', cuisine: 'Malay', location: 'Kuala Lumpur - Bukit Bintang', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Malay+Feast+Bukit+Bintang', photoUrl: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Malay+Feast' },
                { id: '10', name: 'Thai Delight', rating: 3.9, priceLevel: 140, address: 'Bukit Bintang, KL', cuisine: 'Thai', location: 'Kuala Lumpur - Bukit Bintang', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Thai+Delight+KL', photoUrl: 'https://via.placeholder.com/400x300/FF8B94/FFFFFF?text=Thai+Delight' },
                { id: '13', name: 'KLCC Sky Bar', rating: 4.8, priceLevel: 900, address: 'KLCC, KL', cuisine: 'Western', location: 'Kuala Lumpur - KLCC', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=SkyBar' },
                { id: '14', name: 'Bangsar Brunch', rating: 4.5, priceLevel: 300, address: 'Bangsar, KL', cuisine: 'Western', location: 'Kuala Lumpur - Bangsar', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=Bangsar' },

                // Malaysia - Selangor
                { id: '4', name: 'Satay Garden', rating: 4.0, priceLevel: 120, address: 'Subang Jaya, Selangor', cuisine: 'Malay', location: 'Selangor - Subang Jaya', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Satay+Garden+Subang+Jaya', photoUrl: 'https://via.placeholder.com/400x300/F38181/FFFFFF?text=Satay+Garden' },
                { id: '7', name: 'Spice Route', rating: 4.4, priceLevel: 180, address: 'Petaling Jaya, Selangor', cuisine: 'Indian', location: 'Selangor - Petaling Jaya', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Spice+Route+Petaling+Jaya', photoUrl: 'https://via.placeholder.com/400x300/FFFFD2/333333?text=Spice+Route' },
                { id: '15', name: 'Klang Bak Kut Teh', rating: 4.7, priceLevel: 150, address: 'Klang, Selangor', cuisine: 'Chinese', location: 'Selangor - Klang', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=Klang' },
            ];

            console.log('Filtering restaurants with:', JSON.stringify(preferences, null, 2));

            // Default safe filtering
            const filtered = all.filter(r => {
                // 1. Rating
                if (r.rating < 4.0) return false;

                // 2. Price
                const min = preferences.minPrice || 0;
                const max = preferences.maxPrice || 10000;
                if (r.priceLevel < min || r.priceLevel > max) return false;

                // 3. Location
                if (preferences.locations && preferences.locations.length > 0) {
                    const matchesLocation = preferences.locations.some(userLoc => {
                        // userLoc: "台北市 (Taipei) - 信義區" or "Kuala Lumpur - Bukit Bintang"
                        // r.location: "Taipei - Xinyi District (台北市 - 信義區)"

                        // Robust Token Matching:
                        // Extract "meaningful" parts from userLoc (e.g. "信義區", "Bukit Bintang")
                        // We assume the strict format form HostForm: "City - District"
                        const parts = userLoc.split(' - ');
                        const district = parts[parts.length - 1]; // "信義區" or "Bukit Bintang"

                        if (!district) return false;

                        // Check if the restaurant location string contains this district
                        return r.location.toLowerCase().includes(district.toLowerCase());
                    });
                    if (!matchesLocation) return false;
                }

                // 4. Cuisine
                if (preferences.cuisines && preferences.cuisines.length > 0) {
                    // Exact match or partial match? Let's stay strict for cuisine but case-insensitive
                    const matchesCuisine = preferences.cuisines.some(c =>
                        r.cuisine.toLowerCase() === c.toLowerCase()
                    );
                    if (!matchesCuisine) return false;
                }

                return true;
            });

            console.log(`Matched ${filtered.length} restaurants`);
            resolve(filtered);
        }, 800);
    });
};
