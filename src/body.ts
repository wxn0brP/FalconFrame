import querystring from "querystring";
import FalconFrame from ".";
import { getStandardBodyParser } from "./body-utils";
import { RouteHandler, StandardBodyParserOptions } from "./types";

export function json(opts: StandardBodyParserOptions = {}): RouteHandler {
    return getStandardBodyParser("application/json", (body) => JSON.parse(body), opts);
}

export function urlencoded(opts: StandardBodyParserOptions = {}): RouteHandler {
    return getStandardBodyParser("application/x-www-form-urlencoded", (body) => querystring.parse(body) as any, opts);
}