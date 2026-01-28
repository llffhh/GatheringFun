export const fetchRestaurantsMock = (preferences) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const all = [
                // Taiwan - Taipei
                {
                    id: '1', name: 'Tasty Taiwan', rating: 4.5, priceLevel: 200, address: 'Xinyi District, Taipei', cuisine: 'Taiwanese', location: 'Taipei - Xinyi District (台北市 - 信義區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tasty+Taiwan+Xinyi+Taipei', photoUrl: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Tasty+Taiwan',
                    images: ['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Tasty+Taiwan', 'https://via.placeholder.com/400x300/FF8E8E/FFFFFF?text=Beef+Noodle', 'https://via.placeholder.com/400x300/FFB5B5/FFFFFF?text=Dumplings']
                },
                {
                    id: '3', name: 'Gourmet House', rating: 4.8, priceLevel: 350, address: 'Da-an District, Taipei', cuisine: 'Western', location: 'Taipei - Da-an District (台北市 - 大安區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gourmet+House+Daan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/95E1D3/FFFFFF?text=Gourmet+House',
                    images: ['https://via.placeholder.com/400x300/95E1D3/FFFFFF?text=Gourmet+House', 'https://via.placeholder.com/400x300/B8F2E6/FFFFFF?text=Steak', 'https://via.placeholder.com/400x300/DBFFF8/FFFFFF?text=Pasta']
                },
                {
                    id: '5', name: 'Zen Garden', rating: 4.6, priceLevel: 250, address: 'Zhongshan District, Taipei', cuisine: 'Japanese', location: 'Taipei - Zhongshan District (台北市 - 中山區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zen+Garden+Zhongshan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/AA96DA/FFFFFF?text=Zen+Garden',
                    images: ['https://via.placeholder.com/400x300/AA96DA/FFFFFF?text=Zen+Garden', 'https://via.placeholder.com/400x300/C5B3F0/FFFFFF?text=Sushi', 'https://via.placeholder.com/400x300/E0D0FF/FFFFFF?text=Sashimi']
                },
                {
                    id: '6', name: 'Luxury Dine', rating: 4.9, priceLevel: 800, address: 'Xinyi District, Taipei', cuisine: 'Western', location: 'Taipei - Xinyi District (台北市 - 信義區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Luxury+Dine+Xinyi+Taipei', photoUrl: 'https://via.placeholder.com/400x300/FCBAD3/FFFFFF?text=Luxury+Dine',
                    images: ['https://via.placeholder.com/400x300/FCBAD3/FFFFFF?text=Luxury+Dine', 'https://via.placeholder.com/400x300/FFD2E5/FFFFFF?text=Lobster', 'https://via.placeholder.com/400x300/FFE9F4/FFFFFF?text=Wine']
                },
                {
                    id: '8', name: 'Noodle Paradise', rating: 4.7, priceLevel: 160, address: 'Songshan District, Taipei', cuisine: 'Chinese', location: 'Taipei - Songshan District (台北市 - 松山區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Noodle+Paradise+Songshan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/A8D8EA/FFFFFF?text=Noodle+Paradise',
                    images: ['https://via.placeholder.com/400x300/A8D8EA/FFFFFF?text=Noodle+Paradise', 'https://via.placeholder.com/400x300/CBF0FF/FFFFFF?text=Wonton', 'https://via.placeholder.com/400x300/E8F9FF/FFFFFF?text=Soup']
                },
                {
                    id: '9', name: 'Sushi Master', rating: 4.5, priceLevel: 400, address: 'Xinyi District, Taipei', cuisine: 'Japanese', location: 'Taipei - Xinyi District (台北市 - 信義區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sushi+Master+Xinyi+Taipei', photoUrl: 'https://via.placeholder.com/400x300/FFAAA5/FFFFFF?text=Sushi+Master',
                    images: ['https://via.placeholder.com/400x300/FFAAA5/FFFFFF?text=Sushi+Master', 'https://via.placeholder.com/400x300/FFC8C4/FFFFFF?text=Rolls', 'https://via.placeholder.com/400x300/FFE6E4/FFFFFF?text=Tempura']
                },
                {
                    id: '11', name: 'Korean BBQ House', rating: 4.6, priceLevel: 300, address: 'Da-an District, Taipei', cuisine: 'Korean', location: 'Taipei - Da-an District (台北市 - 大安區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Korean+BBQ+Daan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/C7CEEA/FFFFFF?text=Korean+BBQ',
                    images: ['https://via.placeholder.com/400x300/C7CEEA/FFFFFF?text=Korean+BBQ', 'https://via.placeholder.com/400x300/E2E7FF/FFFFFF?text=Beef', 'https://via.placeholder.com/400x300/F0F4FF/FFFFFF?text=Kimchi']
                },
                {
                    id: '12', name: 'Italian Corner', rating: 4.3, priceLevel: 350, address: 'Zhongshan District, Taipei', cuisine: 'Italian', location: 'Taipei - Zhongshan District (台北市 - 中山區)', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Italian+Corner+Zhongshan+Taipei', photoUrl: 'https://via.placeholder.com/400x300/B5EAD7/FFFFFF?text=Italian+Corner',
                    images: ['https://via.placeholder.com/400x300/B5EAD7/FFFFFF?text=Italian+Corner', 'https://via.placeholder.com/400x300/D6F5EB/FFFFFF?text=Pizza', 'https://via.placeholder.com/400x300/EAFFF9/FFFFFF?text=Pasta']
                },

                // Taiwan - New Taipei
                {
                    id: '20', name: 'Banqiao Burgers', rating: 4.2, priceLevel: 250, address: 'Banqiao District', cuisine: 'Western', location: 'New Taipei - Banqiao District (新北市 - 板橋區)', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=Banqiao',
                    images: ['https://via.placeholder.com/400x300/FF9AA2/FFFFFF?text=Burger', 'https://via.placeholder.com/400x300/FFB7B2/FFFFFF?text=Fries', 'https://via.placeholder.com/400x300/FFDAC1/FFFFFF?text=Coke']
                },

                // Malaysia - KL
                {
                    id: '2', name: 'Malay Feast', rating: 4.2, priceLevel: 150, address: 'Bukit Bintang, KL', cuisine: 'Malay', location: 'Kuala Lumpur - Bukit Bintang', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Malay+Feast+Bukit+Bintang', photoUrl: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Malay+Feast',
                    images: ['https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Malay+Feast', 'https://via.placeholder.com/400x300/77DED8/FFFFFF?text=Nasi+Lemak', 'https://via.placeholder.com/400x300/A0EFEA/FFFFFF?text=Satay']
                },
                {
                    id: '10', name: 'Thai Delight', rating: 3.9, priceLevel: 140, address: 'Bukit Bintang, KL', cuisine: 'Thai', location: 'Kuala Lumpur - Bukit Bintang', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Thai+Delight+KL', photoUrl: 'https://via.placeholder.com/400x300/FF8B94/FFFFFF?text=Thai+Delight',
                    images: ['https://via.placeholder.com/400x300/FF8B94/FFFFFF?text=Thai+Delight', 'https://via.placeholder.com/400x300/FFA5AC/FFFFFF?text=Tom+Yum', 'https://via.placeholder.com/400x300/FFC2C7/FFFFFF?text=Pad+Thai']
                },
                {
                    id: '13', name: 'KLCC Sky Bar', rating: 4.8, priceLevel: 900, address: 'KLCC, KL', cuisine: 'Western', location: 'Kuala Lumpur - KLCC', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=SkyBar',
                    images: ['https://via.placeholder.com/400x300/text=SkyBar', 'https://via.placeholder.com/400x300/text=Cocktail', 'https://via.placeholder.com/400x300/text=View']
                },
                {
                    id: '14', name: 'Bangsar Brunch', rating: 4.5, priceLevel: 300, address: 'Bangsar, KL', cuisine: 'Western', location: 'Kuala Lumpur - Bangsar', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=Bangsar',
                    images: ['https://via.placeholder.com/400x300/text=Bangsar', 'https://via.placeholder.com/400x300/text=Eggs', 'https://via.placeholder.com/400x300/text=Coffee']
                },

                // Malaysia - Selangor
                {
                    id: '4', name: 'Satay Garden', rating: 4.0, priceLevel: 120, address: 'Subang Jaya, Selangor', cuisine: 'Malay', location: 'Selangor - Subang Jaya', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Satay+Garden+Subang+Jaya', photoUrl: 'https://via.placeholder.com/400x300/F38181/FFFFFF?text=Satay+Garden',
                    images: ['https://via.placeholder.com/400x300/F38181/FFFFFF?text=Satay+Garden', 'https://via.placeholder.com/400x300/F5A2A2/FFFFFF?text=Chicken', 'https://via.placeholder.com/400x300/F7C3C3/FFFFFF?text=Beef']
                },
                {
                    id: '7', name: 'Spice Route', rating: 4.4, priceLevel: 180, address: 'Petaling Jaya, Selangor', cuisine: 'Indian', location: 'Selangor - Petaling Jaya', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Spice+Route+Petaling+Jaya', photoUrl: 'https://via.placeholder.com/400x300/FFFFD2/333333?text=Spice+Route',
                    images: ['https://via.placeholder.com/400x300/FFFFD2/333333?text=Spice+Route', 'https://via.placeholder.com/400x300/FFFFA0/333333?text=Curry', 'https://via.placeholder.com/400x300/FFFF70/333333?text=Naan']
                },
                {
                    id: '15', name: 'Klang Bak Kut Teh', rating: 4.7, priceLevel: 150, address: 'Klang, Selangor', cuisine: 'Chinese', location: 'Selangor - Klang', mapsUrl: '', photoUrl: 'https://via.placeholder.com/400x300/text=Klang',
                    images: ['https://via.placeholder.com/400x300/text=Klang', 'https://via.placeholder.com/400x300/text=Soup', 'https://via.placeholder.com/400x300/text=Herbal']
                },
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
