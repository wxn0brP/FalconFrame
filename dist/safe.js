export function isEnded(res) {
    return res.writableEnded || res.destroyed || res.headersSent;
}
export function isApiRequest(req, ff, middleware) {
    const accept = req.headers["accept"];
    if (typeof accept === "string" && accept.includes("text/html")) {
        return false;
    }
    if (middleware?.api)
        return true;
    if (typeof accept === "string" && accept.includes("application/json")) {
        return true;
    }
    return false;
}
export function safe500(err, req, res, middleware) {
    if (isEnded(res))
        return;
    res.status(500);
    const ff = req.FF || res.FF;
    const handler = isApiRequest(req, ff, middleware)
        ? ff.errorHandlers._500Api
        : ff.errorHandlers._500;
    try {
        handler(err, req, res);
    }
    catch (e) {
        ff.logger.error("Error in 500 handler:", e?.stack || e);
        if (!isEnded(res))
            res.end("Internal Server Error");
    }
}
export function safe404(req, res) {
    if (isEnded(res))
        return;
    res.status(404);
    const ff = req.FF || res.FF;
    const handler = isApiRequest(req, ff)
        ? ff.errorHandlers._404Api
        : ff.errorHandlers._404;
    try {
        handler(req, res);
    }
    catch (e) {
        ff.logger.error("Error in 404 handler:", e?.stack || e);
        if (!isEnded(res))
            res.end("Not Found");
    }
}
export function safe413(req, res) {
    res.status(413);
    const ff = req.FF || res.FF;
    const handler = isApiRequest(req, ff)
        ? ff.errorHandlers._413Api
        : ff.errorHandlers._413;
    try {
        handler(req, res);
    }
    catch (e) {
        ff.logger.error("Error in 413 handler:", e?.stack || e);
        if (!isEnded(res))
            res.end("Payload Too Large");
    }
}
export function safe408(req, res) {
    res.status(408);
    const ff = req.FF || res.FF;
    const handler = isApiRequest(req, ff)
        ? ff.errorHandlers._408Api
        : ff.errorHandlers._408;
    try {
        handler(req, res);
    }
    catch (e) {
        ff.logger.error("Error in 408 handler:", e?.stack || e);
        if (!isEnded(res))
            res.end("Request Timeout");
    }
}
