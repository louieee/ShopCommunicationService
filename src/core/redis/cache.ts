import redis from "./client";


class CacheService {
    async set(key: string, value: string): Promise<void> {
        await redis.set(key, value);
    }

    async get(key: string): Promise<string | null> {
        return await redis.get(key);
    }

    async del(key: string): Promise<void> {
        await redis.del(key);
    }
}

export default new CacheService();
