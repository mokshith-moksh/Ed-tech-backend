import Redis from "ioredis"


export const RedisClient = new Redis(process.env.REDISCLIENT_URL as string);