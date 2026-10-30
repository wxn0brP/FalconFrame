import { Router } from "./router.js";
import type { DebugOptions } from "./types.js";
export type { DebugOptions };
export declare function generateDebugToken(): string;
export declare function createDebug(opts?: DebugOptions, preset?: DebugOptions): Router;
