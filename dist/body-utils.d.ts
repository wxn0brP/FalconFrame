import { FFResponse } from "./res.js";
import type { FFRequest } from "./types.js";
export declare function parseLimit(limit: string | number): number;
export declare function getContentType(req: FFRequest): string | undefined;
export declare function getRawBody(req: FFRequest, res: FFResponse, limit: number): Promise<string>;
