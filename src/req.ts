import { randomUUID } from "crypto";
import { URL } from "url";
import FalconFrame from ".";
import { getContentType, getRawBody } from "./body-utils";
import { parseCookies, resolveRequestInfo } from "./helpers";
import { extractParams, getMiddlewares, matchMiddleware } from "./middleware";
import { FFResponse } from "./res";
import { FFRequest } from "./types";
import { validate } from "./valid";

export function handleRequest(
	req: FFRequest,
	res: FFResponse,
	FF: FalconFrame<any>,
	reRoute = false,
): void {
	if (!reRoute) {
		Object.setPrototypeOf(res, FFResponse.prototype);
		req.FF = FF;
		res.FF = FF;

		const originalEnd = res.end;
		res.end = (...any: any[]) => {
			res._ended = true;
			return originalEnd.call(res, ...any);
		};
	}

	const { logger } = FF;
	try {
		const [path, params] = (req.url || "").split("?");
		const normalizedPath = decodeURIComponent(path).replace(/\/{2,}/g, "/");
		const parsedUrl = new URL(
			normalizedPath + (params ? `?${params}` : ""),
			"http://localhost",
		);
		req.path = parsedUrl.pathname || "/";
		req.query = Object.fromEntries(parsedUrl.searchParams);
		req.cookies = parseCookies(req.headers.cookie || "");
	} catch (e) {
		logger.error(`Error parsing request (${req.url}): ${e}`);
		res.status(400).end("400: Bad request");
		return;
	}

	const requestInfo = resolveRequestInfo(req, FF.config.proxy);
	req.socketIp = requestInfo.socketIp;
	req.ip = requestInfo.ip;
	req.isProxied = requestInfo.isProxied;
	req.params = {};
	req.valid = (schema: any, regexRules?: any) =>
		validate({
			schema,
			data: req.body,
			regexRules,
			isBodyParsed: req.isBodyParsed,
		});

	req.reRoute = fn => {
		fn(req);
		handleRequest(req, res, FF, true);
	};
	req.header = (name: string) => (req.headers[name.toLowerCase()] as any) || "";

	req.isBodyParsed = false;

	if (FF.config.xRequestId !== "disable") {
		if (req.headers["x-request-id"]) {
			req.id = req.headers["x-request-id"] as string;
			res.setHeader("x-request-id", req.id);
		} else if (FF.config.xRequestId === "auto") {
			req.id = randomUUID();
			res.setHeader("x-request-id", req.id);
		}
	}

	const logUrl = (req.url || "").replace(/([?&]pass=)[^&]*/i, "$1***");
	logger.info(
		`Incoming request: ${req.method} ${logUrl}` +
			(req.id ? ` [${req.id}]` : ""),
	);

	const middlewaresPath = req.path + "/";
	const middlewares = getMiddlewares(
		FF.middlewares,
		middlewaresPath.replace(/\/+/g, "/"),
	);

	const matchedTypeMiddlewares = middlewares.filter(
		middleware =>
			middleware.method === req.method.toLowerCase() ||
			middleware.method === "all",
	);
	const matchedMiddlewares = matchMiddleware(req.path, matchedTypeMiddlewares);
	logger.debug(
		"Matched middlewares: " +
			matchedMiddlewares.map(middleware => middleware.path).join(", "),
	);

	if (matchedMiddlewares.length === 0) {
		res.status(404);
		FF._404(req, res);
		return;
	}

	let middlewareIndex = 0;
	async function next() {
		if (middlewareIndex >= matchedMiddlewares.length) {
			res.status(404);
			FF._404(req, res);
			return;
		}

		const middleware = matchedMiddlewares[middlewareIndex++];
		logger.debug(
			`Executing middleware ${middlewareIndex} of ${matchedMiddlewares.length} matched for path [${middleware.path}]`,
		);

		req.params = extractParams(middleware.path, req.path);
		req.middleware = middleware;
		try {
			const result = await middleware.middleware(req, res, next);
			if (result && !res._ended) {
				if (typeof result === "string") {
					return res.end(result);
				} else if (typeof result === "object") {
					if (result instanceof FFResponse) return res.end();
					return res.json(result);
				}
			}
		} catch (err: any) {
			logger.error(
				`Unhandled error in middleware for path [${middleware.path}]:`,
				err.stack || err,
			);
			if (!res.headersSent && !res.writableEnded) {
				res.status(500);
				FF._500(err, req, res);
			}
		}
	}

	const hasCustomParserEndpoint = matchedMiddlewares.some(
		middleware => middleware.customParser,
	);
	if (hasCustomParserEndpoint) {
		logger.debug("Executing custom parser endpoint");
		req.body = {};
		next();
		return;
	}

	if (
		req.method === "GET" ||
		req.method === "HEAD" ||
		req.method === "OPTIONS"
	) {
		logger.debug("Method does not require body. Executing middlewares");
		req.body = {};
		next();
		return;
	}

	if (reRoute) {
		logger.debug("Re-route. Executing middlewares");
		next();
		return;
	}

	req.body = {};
	const ct = getContentType(req);
	let entry = ct ? FF.bodyParsers[ct] : undefined;

	if (!ct && FF.config.defaultBodyParser === "json") {
		entry = FF.bodyParsers["application/json"];
	}

	if (!entry) {
		if (ct) {
			logger.debug(
				`No body parser found for content-type ${ct}. Executing middlewares`,
			);
		} else {
			logger.debug("No content-type. Executing middlewares");
		}
		next();
		return;
	}

	logger.debug(
		`Executing body parser for content-type: ${ct ?? "default (json)"}`,
	);
	getRawBody(req, res, entry.limit, FF.config.bodyTimeout)
		.then(async rawBody => {
			try {
				req.body = (await entry.parse(rawBody, req, res)) ?? {};
				req.isBodyParsed = true;
			} catch (err: any) {
				if (!res._ended) req.body = {};
			}
			next();
		})
		.catch((err: any) => {
			if (res._ended) return;
			if (err?.statusCode === 408) {
				res.status(408);
				res.FF._408(req, res);
				if (!res.writableEnded) res.end();
				return;
			}
			req.body = {};
			next();
		});
}
