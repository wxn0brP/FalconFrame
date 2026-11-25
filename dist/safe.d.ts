import type FalconFrame from "./index.js";
import type { FFResponse } from "./res.js";
import type { FFRequest, Middleware } from "./types.js";
export declare function isEnded(res: FFResponse): boolean;
export declare function isApiRequest(req: FFRequest, ff: FalconFrame<any>, middleware?: Middleware): boolean;
export declare function safe500(err: Error, req: FFRequest, res: FFResponse, middleware?: Middleware): void;
export declare function safe404(req: FFRequest, res: FFResponse): void;
export declare function safe413(req: FFRequest, res: FFResponse): void;
export declare function safe408(req: FFRequest, res: FFResponse): void;
