import http from "http";
import { getContentType } from "./helpers.js";
import { createReadStream } from "fs";
import { renderHTML } from "./render.js";
export class FFResponse extends http.ServerResponse {
    _ended = false;
    json(data) {
        this.setHeader("Content-Type", "application/json");
        this.end(JSON.stringify(data));
    }
    cookie(name, value, options = {}) {
        let cookie = `${name}=${encodeURIComponent(value)}`;
        if (options.maxAge)
            cookie += `; Max-Age=${options.maxAge}`;
        if (options.path)
            cookie += `; Path=${options.path}`;
        if (options.httpOnly)
            cookie += `; HttpOnly`;
        if (options.secure)
            cookie += `; Secure`;
        if (options.sameSite)
            cookie += `; SameSite=${options.sameSite}`;
        this.setHeader("Set-Cookie", cookie);
        return this;
    }
    status(code) {
        this.statusCode = code;
        return this;
    }
    redirect(url) {
        this.statusCode = 302;
        this.setHeader("Location", url);
        return this;
    }
    sendFile(filePath) {
        this.setHeader("Content-Type", getContentType(filePath));
        createReadStream(filePath).pipe(this);
        return this;
    }
    render(templatePath, data) {
        this.setHeader("Content-Type", "text/html");
        this.end(renderHTML(templatePath, data));
        return this;
    }
}
