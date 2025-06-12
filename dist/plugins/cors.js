export function createCORSPlugin(allowedOrigins, opts = {}) {
    opts = {
        accessControlAllowMethods: true,
        accessControlAllowHeaders: true,
        ...opts,
    };
    return {
        id: "cors",
        process: (req, res, next) => {
            const origin = req.headers.origin;
            if (origin && allowedOrigins.includes(origin)) {
                res.setHeader("Access-Control-Allow-Origin", origin);
                if (opts.accessControlAllowMethods)
                    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
                if (opts.accessControlAllowHeaders)
                    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            }
            if (req.method === "OPTIONS") {
                res.statusCode = 204;
                return res.end();
            }
            next();
        },
    };
}
