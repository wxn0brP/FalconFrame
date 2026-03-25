import { FFResponse } from "./index.js";
import type { FFRequest, ParseBodyFunction, RouteHandler, StandardBodyParserOptions } from "./types.js";
export declare function parseLimit(limit: string | number): number;
export declare function getContentType(req: FFRequest): string | undefined;
export declare function getRawBody(req: FFRequest, res: FFResponse, limit: number): Promise<string>;
export declare function getStandardBodyParser(type: string, parser: ParseBodyFunction, opts: StandardBodyParserOptions): RouteHandler;
