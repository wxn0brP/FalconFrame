import { URL } from "url";
import FalconFrame from ".";
import { parseBody, parseCookies } from "./helpers";
import { FFResponse } from "./res";
import { FFRequest } from "./types";
import { validate } from "./valid";

export function handleRequest(req: FFRequest, res: FFResponse, FF: FalconFrame): void {
    Object.setPrototypeOf(res, FFResponse.prototype);
    const originalEnd = res.end;
    res.end = function (...any: any[]) {
        res._ended = true;
        return originalEnd.call(res, ...any);
    }

    const { logger, routes, middlewares } = FF;
    const parsedUrl = new URL(req.url || "", "http://localhost");
    req.path = parsedUrl.pathname || "/";
    req.query = Object.fromEntries(parsedUrl.searchParams);
    req.cookies = parseCookies(req.headers.cookie || "");
    req.valid = (schema: any) => validate(schema, req.body);

    logger.info(`Incoming request: ${req.method} ${req.url}`);

    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
        const contentType = req.headers["content-type"] || "";
        req.body = parseBody(contentType, body);

        logger.debug(`Request body: ${JSON.stringify(req.body)}`);

        let middlewareIndex = 0;
        const next = async () => {
            if (middlewareIndex < middlewares.length) {
                const middleware = middlewares[middlewareIndex++];

                const matchMiddlewarePath = (path: string, reqPath: string) => {
                    const pathParts = path.split("/").filter(Boolean);
                    const reqPathParts = reqPath.split("/").filter(Boolean);

                    if (pathParts.length !== reqPathParts.length)  return false;
                    
                    const params = {};
                    for (let i = 0; i < pathParts.length; i++) {
                        if (pathParts[i].startsWith(":")) {
                            const paramName = pathParts[i].slice(1);
                            params[paramName] = reqPathParts[i];
                        } else if (pathParts[i] === "*") {
                            continue;
                        } else if (pathParts[i] !== reqPathParts[i]) return false;
                    }

                    req.params = params;
                    return true;
                };

                if (matchMiddlewarePath(middleware.path, req.path)) {
                    logger.debug(`Executing middleware ${middlewareIndex - 1}`);
                    await middleware.middleware(req, res, next);
                } else {
                    next();
                }
            } else {
                const methodRoutes = routes[req.method?.toLowerCase() || ""] || [];
                for (const route of methodRoutes) {
                    const isWildcardRoute = route.path.endsWith("/*");
                    const baseRoutePath = isWildcardRoute ? route.path.slice(0, -2) : route.path;

                    let match;
                    if (route.path === "*") {
                        match = [req.path];
                    } else if (isWildcardRoute) {
                        if (req.path.startsWith(baseRoutePath)) {
                            match = [req.path];
                        }
                    } else {
                        match = req.path.match(new RegExp(`^${route.path.replace(/:\w+/g, "(\\w+)")}$`));
                    }

                    if (match) {
                        const params = {};
                        if (route.path.includes(":")) {
                            const paramNames = route.path.match(/:\w+/g)?.map(p => p.slice(1)) || [];
                            paramNames.forEach((name, index) => {
                                params[name] = match[index + 1];
                            });
                        }

                        if (isWildcardRoute) {
                            params["*"] = req.path.slice(baseRoutePath.length);
                        }

                        req.params = params;
                        logger.debug(`Executing route ${route.path}`);

                        const data = await route.handler(req, res);
                        if (!res._ended && data) {
                            res.json(data);
                        }
                        return data;
                    }
                }

                logger.warn(`Route to [${req.path}] not found`);
                res.statusCode = 404;
                res.end("404: File had second thoughts.");
            }
        };
        next();
    });
}
