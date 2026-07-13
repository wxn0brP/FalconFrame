import { FFResponse } from "./res.js";
import type { FFRequest, RouteHandler } from "./types.js";
export declare class SSEManager {
    _clients: Map<string, {
        req: FFRequest;
        res: FFResponse;
    }>;
    getMiddleware(lastHandler?: RouteHandler): RouteHandler;
    getClients(): Map<string, {
        req: FFRequest;
        res: FFResponse;
    }>;
    sendAll(data: any): void;
    sendTo(id: string, data: any): void;
    disconnect(id: string): void;
}
