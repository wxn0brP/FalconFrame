import FalconFrame, { FFResponse } from ".";
import type { FFRequest, ParseBodyFunction, RouteHandler, StandardBodyParserOptions } from "./types";

export function parseLimit(limit: string | number): number {
    if (!limit) return 0;
    if (typeof limit === "number") return limit;
    if (typeof limit !== "string") return 0;
    limit = limit.toLowerCase().replace("b", "");

    const match = limit.match(/^(\d+)([kmg])?$/i);
    if (!match) return 0;

    const num = parseInt(match[1], 10);
    const unit = match[2]?.toLowerCase();

    switch (unit) {
        case "k":
            return num * 1024;
        case "m":
            return num * 1024 * 1024;
        case "g":
            return num * 1024 * 1024 * 1024;
        default:
            return num;
    }
}

export function getContentType(req: FFRequest): string | undefined {
    return req.headers["content-type"]?.split(";")[0].toLowerCase();
}

export function getRawBody(req: FFRequest, limit: number): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
            if (limit && body.length > limit) {
                const error = new Error("Payload Too Large");
                // @ts-ignore
                error.statusCode = 413;
                req.destroy();
                return reject(error);
            }
        });

        req.on("end", () => {
            resolve(body);
        });

        req.on("error", (err) => {
            reject(err);
        });
    });
}

export function getStandardBodyParser(type: string, parser: ParseBodyFunction, FF: FalconFrame, opts: StandardBodyParserOptions): RouteHandler {
    const limit = parseLimit(opts.limit || "100k");

    return async (req: FFRequest, res: FFResponse, next: () => void) => {
        if ((typeof req.body == "object" && Object.keys(req.body).length) || getContentType(req) !== type) {
            return next();
        }

        try {
            const body = await getRawBody(req, limit);
            req.body = await parser(body, req, FF);
        } catch (err: any) {
            req.body = {};
        } finally {
            next();
        }
    }
}