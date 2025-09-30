import { randomUUID } from "crypto";
import type { FFRequest, RouteHandler } from "./types";
import { FFResponse } from "./res";

export class SSEManager {
    private clients = new Map<string, { req: FFRequest; res: FFResponse }>();

    public getMiddleware(lastHandler?: RouteHandler): RouteHandler {
        return (req, res, next) => {
            res.sseInit();

            const id = randomUUID();
            this.clients.set(id, { req, res });

            req.on("close", () => {
                this.clients.delete(id);
            });
            req.sseId = id;

            lastHandler?.(req, res, next);
        };
    }

    public getClients() {
        return this.clients;
    }

    public sendAll(data: any) {
        for (const { res } of this.clients.values()) {
            res.sseSend(data);
        }
    }

    public sendTo(id: string, data: any) {
        const client = this.clients.get(id);
        if (client) {
            client.res.sseSend(data);
        }
    }

    public disconnect(id: string) {
        const client = this.clients.get(id);
        if (client) {
            client.res.end();
            this.clients.delete(id);
        }
    }
}
