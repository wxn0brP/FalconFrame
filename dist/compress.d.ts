import { FFResponse } from "./res.js";
import { FFRequest } from "./types.js";
export declare function compression(req: FFRequest, res: FFResponse): void;
export declare function compressionMiddleware(): (req: FFRequest, res: FFResponse, next: () => void) => void;
