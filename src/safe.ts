import type FalconFrame from "./index";
import type { FFResponse } from "./res";
import type { FFRequest, Middleware } from "./types";

export function isEnded(res: FFResponse) {
	return res.writableEnded || res.destroyed || res.headersSent;
}

export function isApiRequest(
	req: FFRequest,
	ff: FalconFrame<any>,
	middleware?: Middleware,
) {
	const accept = req.headers["accept"];
	if (typeof accept === "string" && accept.includes("text/html")) {
		return false;
	}

	if (middleware?.api) return true;

	if (typeof accept === "string" && accept.includes("application/json")) {
		return true;
	}

	return false;
}

export function safe500(
	err: Error,
	req: FFRequest,
	res: FFResponse,
	middleware?: Middleware,
) {
	if (isEnded(res)) return;
	res.status(500);
	const ff = req.FF || res.FF;
	const handler = isApiRequest(req, ff, middleware)
		? ff.errorHandlers._500Api
		: ff.errorHandlers._500;
	try {
		handler(err, req, res);
	} catch (e: any) {
		ff.logger.error("Error in 500 handler:", e?.stack || e);
		if (!isEnded(res)) res.end("Internal Server Error");
	}
}

export function safe404(req: FFRequest, res: FFResponse) {
	if (isEnded(res)) return;
	res.status(404);
	const ff = req.FF || res.FF;
	const handler = isApiRequest(req, ff)
		? ff.errorHandlers._404Api
		: ff.errorHandlers._404;
	try {
		handler(req, res);
	} catch (e: any) {
		ff.logger.error("Error in 404 handler:", e?.stack || e);
		if (!isEnded(res)) res.end("Not Found");
	}
}

export function safe413(req: FFRequest, res: FFResponse) {
	res.status(413);
	const ff = req.FF || res.FF;
	const handler = isApiRequest(req, ff)
		? ff.errorHandlers._413Api
		: ff.errorHandlers._413;
	try {
		handler(req, res);
	} catch (e: any) {
		ff.logger.error("Error in 413 handler:", e?.stack || e);
		if (!isEnded(res)) res.end("Payload Too Large");
	}
}

export function safe408(req: FFRequest, res: FFResponse) {
	res.status(408);
	const ff = req.FF || res.FF;
	const handler = isApiRequest(req, ff)
		? ff.errorHandlers._408Api
		: ff.errorHandlers._408;
	try {
		handler(req, res);
	} catch (e: any) {
		ff.logger.error("Error in 408 handler:", e?.stack || e);
		if (!isEnded(res)) res.end("Request Timeout");
	}
}
