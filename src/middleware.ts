import { Middleware } from "./types";

export function matchMiddleware(url: string, middlewares: Middleware[]): Middleware[] {
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

export function getMiddlewares(middlewares: Middleware[], matchUrl: string, basePath = ""): Middleware[] {
    const result: Middleware[] = [];

    for (const middleware of middlewares) {
        const midPath = (middleware.path || "").replace(/\/+$/, "");
        const fullPath = (basePath + "/" + midPath).replace(/\/+/g, "/");

        const matches =
            matchUrl === fullPath ||
            (middleware.use && matchUrl.startsWith(fullPath)) ||
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
