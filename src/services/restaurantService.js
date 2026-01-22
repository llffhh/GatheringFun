export const fetchRestaurantsMock = (preferences) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const all = [
                { id: '1', name: 'Tasty Taiwan', rating: 4.5, priceLevel: 2, address: 'Xinyi District, Taipei', mapsUrl: '#' },
                { id: '2', name: 'Malay Feast', rating: 4.2, priceLevel: 1, address: 'Bukit Bintang, KL', mapsUrl: '#' },
                { id: '3', name: 'Gourmet House', rating: 4.8, priceLevel: 3, address: 'Da-an District, Taipei', mapsUrl: '#' },
                { id: '4', name: 'Satay Garden', rating: 4.0, priceLevel: 1, address: 'Subang Jaya, Selangor', mapsUrl: '#' },
                { id: '5', name: 'Zen Garden', rating: 4.6, priceLevel: 2, address: '中山區, 台北市', mapsUrl: '#' },
                { id: '6', name: 'Luxury Dine', rating: 4.9, priceLevel: 4, address: '101 Tower, Taipei', mapsUrl: '#' },
            ];

            // Filter by price range
            const filtered = all.filter(r =>
                r.priceLevel >= (preferences.minPrice || 1) &&
                r.priceLevel <= (preferences.maxPrice || 4)
            );

            resolve(filtered);
        }, 1000);
    });
};
