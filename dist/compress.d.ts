import { FFResponse } from "./res.js";
import { CompressionOptions, FFRequest, RouteHandler } from "./types.js";
export declare function compression(req: FFRequest, res: FFResponse, opts?: CompressionOptions): void;
export declare const compressionMiddleware: RouteHandler;
