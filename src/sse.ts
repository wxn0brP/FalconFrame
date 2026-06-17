import { randomUUID } from "crypto";
import { FFResponse } from "./res";
import type { FFRequest, RouteHandler } from "./types";

export class SSEManager {
    _clients = new Map<string, { req: FFRequest; res: FFResponse }>();

    getMiddleware(lastHandler?: RouteHandler): RouteHandler {
        return (req, res, next) => {
            res.sseInit();

            const id = randomUUID();
            this._clients.set(id, { req, res });

            req.on("close", () => {
                this._clients.delete(id);
            });
            req.sseId = id;

            lastHandler?.(req, res, next);
        };
    }

    getClients() {
        return this._clients;
    }

    sendAll(data: any) {
        for (const { res } of this._clients.values()) {
            res.sseSend(data);
        }
    }

    sendTo(id: string, data: any) {
        const client = this._clients.get(id);
        if (client) {
            client.res.sseSend(data);
        }
    }

    disconnect(id: string) {
        const client = this._clients.get(id);
        if (client) {
            client.res.end();
            this._clients.delete(id);
        }
    }
}
