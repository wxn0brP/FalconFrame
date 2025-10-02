import type { FFRequest, RouteHandler } from "./types.js";
import { FFResponse } from "./res.js";
export declare class SSEManager {
    private clients;
    getMiddleware(lastHandler?: RouteHandler): RouteHandler;
    getClients(): Map<string, {
        req: FFRequest;
        res: FFResponse;
    }>;
    sendAll(data: any): void;
    sendTo(id: string, data: any): void;
    disconnect(id: string): void;
}
