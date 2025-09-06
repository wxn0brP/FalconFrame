import FalconFrame from ".";
import { FFRequest, ParseBody, ParseBodyFunction } from "./types";
import querystring from "querystring";

const parseBodyFunctions: Record<string, ParseBodyFunction> = {
    "application/json": async (body: string) => ({ body: JSON.parse(body) }),
    "application/x-www-form-urlencoded": async (body: string) => ({ body: querystring.parse(body) }),
};

export async function parseBody(req: FFRequest, body: string, FF: FalconFrame): Promise<ParseBody> {
    const funcs = Object.assign({}, parseBodyFunctions, FF.customParsers || {});

    try {
        const type = req.headers["content-type"] || "";
        const func = funcs[type];
        if (!func) return {};

        const data = await func(body, req, FF);

        if (!data || typeof data !== "object") return {};

        return data;
    } catch (e) {
        await FF.logger.warn(`Error parsing body: ${e}`);
        return {};
    }
}
