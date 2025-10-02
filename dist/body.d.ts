import FalconFrame from "./index.js";
import { RouteHandler, StandardBodyParserOptions } from "./types.js";
export declare function json(FF: FalconFrame, opts?: StandardBodyParserOptions): RouteHandler;
export declare function urlencoded(FF: FalconFrame, opts?: StandardBodyParserOptions): RouteHandler;
