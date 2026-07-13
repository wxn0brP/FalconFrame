import { FFResponse } from "./res.js";
import { FFRequest, RouteHandler } from "./types.js";
export declare function compression(req: FFRequest, res: FFResponse): void;
export declare const compressionMiddleware: RouteHandler;
