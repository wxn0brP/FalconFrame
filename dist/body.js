import querystring from "querystring";
const parseBodyFunctions = {
    "application/json": async (body) => ({ body: JSON.parse(body) }),
    "application/x-www-form-urlencoded": async (body) => ({ body: querystring.parse(body) }),
};
export async function parseBody(req, body, FF) {
    const funcs = Object.assign({}, parseBodyFunctions, FF.customParsers || {});
    try {
        const type = req.headers["content-type"] || "";
        const func = funcs[type];
        if (!func)
            return {};
        const data = await func(body, req, FF);
        if (!data || typeof data !== "object")
            return {};
        return data;
    }
    catch (e) {
        await FF.logger.warn(`Error parsing body: ${e}`);
        return {};
    }
}
