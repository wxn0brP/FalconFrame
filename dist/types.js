import http from "http";
export class FFRequest extends http.IncomingMessage {
    FF;
    path;
    query;
    params;
    cookies;
    body;
    valid;
    middleware;
    sseId;
}
