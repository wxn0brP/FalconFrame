import http from "http";
export class FFRequest extends http.IncomingMessage {
    FF;
    path;
    query;
    params;
    cookies;
    body;
    /** Raw TCP peer address. */
    socketIp;
    /** Resolved client address (respects the `proxy` option). */
    ip;
    /** True when proxy headers were used to resolve `ip`. */
    isProxied;
    header;
    valid;
    middleware;
    id;
    sseId;
    reRoute;
    isBodyParsed;
    _compression;
}
