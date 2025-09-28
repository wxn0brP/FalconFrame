import http from "http";
export class FFRequest extends http.IncomingMessage {
    path;
    query;
    params;
    cookies;
    body;
    valid;
    middleware;
}
