import http from "http";
export class FFRequest extends http.IncomingMessage {
    FF;
    path;
    query;
    params;
    cookies;
    body;
    ip;
    header;
    valid;
    middleware;
    id;
    sseId;
    reRoute;
    isBodyParsed;
    _compression;
}
