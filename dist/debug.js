import { join } from "path";
import { Router } from "./router.js";
export function createDebug(opts = {}) {
    const { url = "/debug", hosts = ["localhost", "127.0.0.1", "::1"], } = opts;
    if (process.env.NODE_ENV === "production" &&
        !process.env.FF_DEBUG_PRODUCTION_ENABLED)
        return (req, res, next) => { next(); };
    const pass = process.env.FF_DEBUG_PASS;
    function isHostAllowed(req) {
        return hosts.some((h) => h === req.socket.remoteAddress);
    }
    function checkAuth(req) {
        if (!pass)
            return true;
        return req.query?.pass === pass;
    }
    function isAllowed(req) {
        return isHostAllowed(req) && checkAuth(req);
    }
    const router = new Router();
    router.get(url, (req, res, next) => {
        if (!isAllowed(req))
            return next();
        res.sendFile(join(import.meta.dirname, "debug.html"));
    });
    const sse = router.sse(url + "/sse", (req, res, next) => {
        if (!isAllowed(req))
            return req.FF._413(req, res);
        next();
    }, () => { });
    router.use("/", (req, res, next) => {
        const start = Date.now();
        const hook = res.end.bind(res);
        res.end = function (...args) {
            const entry = {
                method: req.method,
                url: req.url,
                headers: req.headers,
                query: req.query || {},
                cookies: req.cookies || {},
                body: req.body || {},
                status: res.statusCode,
                duration: Date.now() - start,
                time: new Date().toISOString(),
            };
            sse.sendAll(entry);
            return hook(...args);
        };
        next();
    });
    return router;
}
