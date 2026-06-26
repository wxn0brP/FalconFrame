function setHeader(res, opts) {
    if (opts.accessControlAllowMethods)
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    if (opts.accessControlAllowHeaders)
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
function parseOrigin(origin) {
    try {
        const url = new URL(origin);
        return {
            host: url.hostname,
            port: url.port ||
                (url.protocol === "https:" ? "443" : "80")
        };
    }
    catch {
        return null;
    }
}
function matches(origin, pattern) {
    if (pattern === "*")
        return true;
    if (pattern instanceof RegExp)
        return pattern.test(origin);
    if (pattern.toLowerCase() === origin.toLowerCase())
        return true;
    const o = parseOrigin(origin);
    if (!o)
        return false;
    // *.example.com[:port]
    if (pattern.startsWith("*.")) {
        const [pHost, pPort] = pattern.split(":");
        const base = pHost.slice(2).toLowerCase();
        if (o.host !== base && o.host.endsWith("." + base)) {
            return !pPort || pPort === "*" || pPort === o.port;
        }
        return false;
    }
    // localhost:port
    if (pattern.includes(":")) {
        const [pHost, pPort] = pattern.split(":");
        const base = pHost.toLowerCase();
        return o.host === base && (pPort === "*" || o.port === pPort);
    }
    return false;
}
function handleEnd(req, res, next, origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        return res.end();
    }
    next();
}
export function createCORS(allowedOrigins, opts = {}) {
    opts = {
        accessControlAllowMethods: true,
        accessControlAllowHeaders: true,
        ...opts,
    };
    return (req, res, next) => {
        if (opts.headers) {
            for (const [key, value] of Object.entries(opts.headers)) {
                res.setHeader(key, value);
            }
        }
        setHeader(res, opts);
        const origin = req.headers.origin;
        if (allowedOrigins.includes("*"))
            return handleEnd(req, res, next, origin || "*");
        if (origin && allowedOrigins.some((pattern) => matches(origin, pattern)))
            return handleEnd(req, res, next, origin);
        next();
    };
}
