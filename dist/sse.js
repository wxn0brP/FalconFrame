import { randomUUID } from "crypto";
export class SSEManager {
    _clients = new Map();
    getMiddleware(lastHandler) {
        return (req, res, next) => {
            res.sseInit();
            const id = randomUUID();
            this._clients.set(id, {
                req,
                res,
            });
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
    sendAll(data) {
        for (const { res } of this._clients.values())
            res.sseSend(data);
    }
    sendTo(id, data) {
        const client = this._clients.get(id);
        if (!client)
            return;
        client.res.sseSend(data);
    }
    sendEventAll(event, data) {
        for (const { res } of this._clients.values())
            res.sseEventSend(event, data);
    }
    sendEventTo(id, event, data) {
        const client = this._clients.get(id);
        if (!client)
            return;
        client.res.sseEventSend(event, data);
    }
    disconnect(id) {
        const client = this._clients.get(id);
        if (!client)
            return;
        client.res.end();
        this._clients.delete(id);
    }
}
