import querystring from "querystring";
import { getStandardBodyParser } from "./body-utils.js";
export function json(FF, opts = {}) {
    return getStandardBodyParser("application/json", (body) => JSON.parse(body), FF, opts);
}
export function urlencoded(FF, opts = {}) {
    return getStandardBodyParser("application/x-www-form-urlencoded", (body) => querystring.parse(body), FF, opts);
}
