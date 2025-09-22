import { Plugin } from "../plugin";

type RateLimitRecord = {
    count: number;
    lastRequest: number;
};

export function createRateLimiterPlugin(
    maxRequests: number,
    windowMs: number
): Plugin {
    const rateLimitMap = new Map<string, RateLimitRecord>();

    return {
        id: "rateLimiter",
        process: (req, res, next) => {
            const ip = req.socket.remoteAddress ?? "unknown";
            const now = Date.now();

            const record = rateLimitMap.get(ip);

            if (!record || now - record.lastRequest > windowMs) {
                rateLimitMap.set(ip, { count: 1, lastRequest: now });
                return next();
            }

            if (record.count >= maxRequests) {
                res.statusCode = 429;
                return res.end("Too Many Requests");
            }

            record.count++;
            record.lastRequest = now;
            rateLimitMap.set(ip, record);

            next();
        },
    };
}
