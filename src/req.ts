import { URL } from "url";
import FalconFrame from ".";
import { parseBody, parseCookies } from "./helpers";
import { FFResponse } from "./res";
import { FFRequest, Middleware } from "./types";
import { validate } from "./valid";

export function handleRequest(req: FFRequest, res: FFResponse, FF: FalconFrame): void {
    Object.setPrototypeOf(res, FFResponse.prototype);
    const originalEnd = res.end;
    res.end = function (...any: any[]) {
        res._ended = true;
        return originalEnd.call(res, ...any);
    }

    const { logger } = FF;
    try {
        const [path, params] = (req.url || "").split("?");
        const normalizedPath = path.replace(/\/{2,}/g, "/");
        const parsedUrl = new URL(normalizedPath + (params ? `?${params}` : ""), "http://localhost");
        req.path = parsedUrl.pathname || "/";
        req.query = Object.fromEntries(parsedUrl.searchParams);
    } catch (e) {
        logger.error(`Error parsing URL (${req.url}): ${e}`);
        res.status(400).end("400: Bad request");
        return; 
    }
    
    req.cookies = parseCookies(req.headers.cookie || "");
    req.params = {};
    req.valid = (schema: any) => validate(schema, req.body);

    logger.info(`Incoming request: ${req.method} ${req.url}`);

    const middlewares = getMiddlewares(FF.middlewares, (req.url + "/").replace(/\/+/g, "/"));

    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
        const contentType = req.headers["content-type"] || "";
        req.body = parseBody(contentType, body);

        logger.debug(`Request body: ${JSON.stringify(req.body)}`);

        const matchedTypeMiddlewares = middlewares.filter(middleware => middleware.method === req.method.toLocaleLowerCase() || middleware.method === "all");
        const matchedMiddlewares = matchMiddleware(req.path, matchedTypeMiddlewares);

        if (matchedMiddlewares.length === 0) {
            return res.status(404).end("404: File had second thoughts.");
        }

        logger.debug("Matched middlewares: " + matchedMiddlewares.map(middleware => middleware.path).join(", "));

        let middlewareIndex = 0;
        const next = async () => {
            if (middlewareIndex >= matchedMiddlewares.length) {
                return res.status(404).end("404: File had second thoughts");
            }
            const middleware = matchedMiddlewares[middlewareIndex++];
            logger.debug(`Executing middleware ${middlewareIndex} of ${matchedMiddlewares.length} matched for path [${middleware.path}]`);
            if (middleware.path.includes(":")) {
                const middlewareParts = middleware.path.split("/");
                const reqPathParts = req.path.split("/");
                req.params = {};
                for (let i = 0; i < middlewareParts.length; i++) {
                    if (middlewareParts[i].startsWith(":")) {
                        const paramName = middlewareParts[i].slice(1);
                        req.params[paramName] = reqPathParts[i];
                    }
                }
            }
            req.middleware = middleware;
            const result = await middleware.middleware(req, res, next);
            if (result && !res._ended) {
                if (typeof result === "string") {
                    return res.end(result);
                } else if (typeof result === "object") {
                    return res.json(result);
                }
            }
        }

        next();
    });
}

function matchMiddleware(url: string, middlewares: Middleware[]): Middleware[] {
    const matchedMiddlewares: Middleware[] = [];

    url = url.replace(/\/$/, "");

    for (const middleware of middlewares) {
        const cleanedMiddleware = middleware.path.replace(/\/$/, "");

        if (middleware.use) {
            if (url.startsWith(cleanedMiddleware)) {
                matchedMiddlewares.push(middleware);
            }
        } else if (cleanedMiddleware === "*") {
            matchedMiddlewares.push(middleware);
        } else if (cleanedMiddleware.endsWith("/*")) {
            const prefix = cleanedMiddleware.slice(0, -2);
            if (url.startsWith(prefix)) {
                matchedMiddlewares.push(middleware);
            }
        } else if (cleanedMiddleware.includes(":")) {
            const middlewareParts = cleanedMiddleware.split("/");
            const urlParts = url.split("/");

            if (middlewareParts.length !== urlParts.length) {
                continue;
            }

            let matches = true;
            for (let i = 0; i < middlewareParts.length; i++) {
                if (middlewareParts[i].startsWith(":")) {
                    continue;
                } else if (middlewareParts[i] !== urlParts[i]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                matchedMiddlewares.push(middleware);
            }
        } else {
            if (url === cleanedMiddleware) {
                matchedMiddlewares.push(middleware);
            }
        }
    }

    return matchedMiddlewares;
}

function getMiddlewares(middlewares: Middleware[], matchUrl: string, basePath = ""): Middleware[] {
    const result: Middleware[] = [];

    for (const middleware of middlewares) {
        const midPath = (middleware.path || "").replace(/\/+$/, "");
        const fullPath = (basePath + "/" + midPath).replace(/\/+/g, "/");

        const matches =
            matchUrl === fullPath ||
            fullPath.includes(":") ||
            fullPath.includes("*") ||
            matchUrl.startsWith(fullPath + "/");

        if (!matches) continue;

        if (middleware.router) {
            const nested = getMiddlewares(middleware.router, matchUrl, fullPath);
            result.push(...nested);
        } else {
            result.push({ ...middleware, path: fullPath });
        }
    }

    return result;
}
