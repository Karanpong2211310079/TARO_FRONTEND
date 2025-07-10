// Cache management utilities
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheUtils = {
    // Check if cache is valid
    isCacheValid: (timestamp) => {
        return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
    },

    // Get cached data
    getCachedData: (key) => {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            if (!cacheUtils.isCacheValid(timestamp)) {
                localStorage.removeItem(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error(`Error reading cache for ${key}:`, error);
            localStorage.removeItem(key);
            return null;
        }
    },

    // Set cached data
    setCachedData: (key, data) => {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error(`Error setting cache for ${key}:`, error);
        }
    },

    // Clear specific cache
    clearCache: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error clearing cache for ${key}:`, error);
        }
    },

    // Clear all app cache
    clearAllCache: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('Cache') || key.includes('tarot')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing all cache:', error);
        }
    },

    // Preload data in background
    preloadData: async (key, fetchFunction) => {
        try {
            const cached = cacheUtils.getCachedData(key);
            if (cached) return cached;

            const data = await fetchFunction();
            cacheUtils.setCachedData(key, data);
            return data;
        } catch (error) {
            console.error(`Error preloading data for ${key}:`, error);
            return null;
        }
    }
};

export default cacheUtils; 