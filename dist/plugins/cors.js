function setHeader(res, opts) {
    if (opts.accessControlAllowMethods)
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    if (opts.accessControlAllowHeaders)
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
export function createCORSPlugin(allowedOrigins, opts = {}) {
    opts = {
        accessControlAllowMethods: true,
        accessControlAllowHeaders: true,
        ...opts,
    };
    return {
        id: "cors",
        process: (req, res, next) => {
            if (opts.headers) {
                for (const [key, value] of Object.entries(opts.headers)) {
                    res.setHeader(key, value);
                }
            }
            if (allowedOrigins.includes("*")) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                setHeader(res, opts);
                if (req.method === "OPTIONS") {
                    res.statusCode = 204;
                    return res.end();
                }
                return next();
            }
            const origin = req.headers.origin;
            if (origin && allowedOrigins.includes(origin)) {
                res.setHeader("Access-Control-Allow-Origin", origin);
                setHeader(res, opts);
                if (req.method === "OPTIONS") {
                    res.statusCode = 204;
                    return res.end();
                }
            }
            next();
        },
    };
}
