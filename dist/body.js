import querystring from "querystring";
import { getStandardBodyParser } from "./body-utils.js";
export function json(opts = {}) {
    return getStandardBodyParser("application/json", (body) => JSON.parse(body), opts);
}
export function urlencoded(opts = {}) {
    return getStandardBodyParser("application/x-www-form-urlencoded", (body) => querystring.parse(body), opts);
}
