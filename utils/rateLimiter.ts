// utils/rateLimiter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RateLimitInfo {
    remaining: number;
    resetTime: number;
}

class RateLimiter {
    /**
     * Get request log from storage
     */
    private static async getRequestLog(key: string): Promise<number[]> {
        try {
            const log = await AsyncStorage.getItem(`rate_limit_${key}`);
            return log ? JSON.parse(log) : [];
        } catch (error) {
            console.error('Failed to get rate limit log:', error);
            return [];
        }
    }

    /**
     * Save request log to storage
     */
    private static async setRequestLog(key: string, timestamps: number[]): Promise<void> {
        try {
            await AsyncStorage.setItem(`rate_limit_${key}`, JSON.stringify(timestamps));
        } catch (error) {
            console.error('Failed to set rate limit log:', error);
        }
    }

    /**
     * Check if request is allowed under rate limit
     * Returns true if allowed, false if limit exceeded
     */
    static async checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
        const now = Date.now();
        const requests = await this.getRequestLog(key);

        // Remove old requests outside the time window
        const recentRequests = requests.filter(
            timestamp => now - timestamp < config.windowMs
        );

        if (recentRequests.length >= config.maxRequests) {
            console.warn(`Rate limit exceeded for ${key}`);
            return false; // Rate limit exceeded
        }

        // Add current request
        recentRequests.push(now);
        await this.setRequestLog(key, recentRequests);

        return true; // Request allowed
    }

    /**
     * Get number of remaining requests in current window
     */
    static async getRemainingRequests(key: string, config: RateLimitConfig): Promise<number> {
        const now = Date.now();
        const requests = await this.getRequestLog(key);
        const recentRequests = requests.filter(
            timestamp => now - timestamp < config.windowMs
        );

        return Math.max(0, config.maxRequests - recentRequests.length);
    }

    /**
     * Get detailed rate limit information
     */
    static async getRateLimitInfo(key: string, config: RateLimitConfig): Promise<RateLimitInfo> {
        const now = Date.now();
        const requests = await this.getRequestLog(key);
        const recentRequests = requests.filter(
            timestamp => now - timestamp < config.windowMs
        );

        const remaining = Math.max(0, config.maxRequests - recentRequests.length);
        const oldestRequest = recentRequests.length > 0 ? Math.min(...recentRequests) : now;
        const resetTime = oldestRequest + config.windowMs;

        return { remaining, resetTime };
    }

    /**
     * Get time until rate limit resets (in milliseconds)
     */
    static async getTimeUntilReset(key: string, config: RateLimitConfig): Promise<number> {
        const info = await this.getRateLimitInfo(key, config);
        const now = Date.now();
        return Math.max(0, info.resetTime - now);
    }

    /**
     * Reset rate limit for a specific key
     */
    static async resetLimit(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(`rate_limit_${key}`);
            console.log(`Rate limit reset for ${key}`);
        } catch (error) {
            console.error('Failed to reset rate limit:', error);
        }
    }

    /**
     * Clear all rate limits
     */
    static async clearAllLimits(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const rateLimitKeys = keys.filter(key => key.startsWith('rate_limit_'));
            await AsyncStorage.multiRemove(rateLimitKeys);
            console.log('All rate limits cleared');
        } catch (error) {
            console.error('Failed to clear all rate limits:', error);
        }
    }
}

export default RateLimiter;

// Common rate limit configurations
export const RateLimitPresets = {
    AI_ASSISTANT: {
        maxRequests: 10,
        windowMs: 60000, // 10 requests per minute
    },
    API_CALLS: {
        maxRequests: 20,
        windowMs: 60000, // 20 requests per minute
    },
    LOGIN_ATTEMPTS: {
        maxRequests: 5,
        windowMs: 300000, // 5 attempts per 5 minutes
    },
    RESUME_GENERATION: {
        maxRequests: 3,
        windowMs: 60000, // 3 generations per minute
    },
};