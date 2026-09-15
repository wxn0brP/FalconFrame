import { Router } from "./router.js";
import { RouteHandler } from "./types.js";
export interface DebugOptions {
    url?: string;
    hosts?: string[];
    /** @deprecated */
    logs?: boolean;
}
export declare function createDebug(opts?: DebugOptions): Router | RouteHandler;
