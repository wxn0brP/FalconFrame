import { RouteHandler, StandardBodyParserOptions } from "./types.js";
export declare function json(opts?: StandardBodyParserOptions): RouteHandler;
export declare function urlencoded(opts?: StandardBodyParserOptions): RouteHandler;
