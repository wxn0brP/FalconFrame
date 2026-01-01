import { randomUUID } from "crypto";
export class SSEManager {
    clients = new Map();
    getMiddleware(lastHandler) {
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
    getClients() {
        return this.clients;
    }
    sendAll(data) {
        for (const { res } of this.clients.values()) {
            res.sseSend(data);
        }
    }
    sendTo(id, data) {
        const client = this.clients.get(id);
        if (client) {
            client.res.sseSend(data);
        }
    }
    disconnect(id) {
        const client = this.clients.get(id);
        if (client) {
            client.res.end();
            this.clients.delete(id);
        }
    }
}
