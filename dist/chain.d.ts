import type { FFResponse } from "./res.js";
import type { FFRequest, Middleware } from "./types.js";
export interface ChainHooks {
    start?: (middleware: Middleware) => void;
    result?: (result: any) => void;
    error?: (err: any, middleware: Middleware) => void;
    exhausted?: () => void;
}
export declare function createChain(req: FFRequest, res: FFResponse, middlewares: Middleware[], hooks: ChainHooks): () => Promise<void>;
