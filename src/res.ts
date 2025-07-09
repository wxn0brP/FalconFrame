import http from "http";
import { CookieOptions } from "./types";
import { getContentType } from "./helpers";
import { createReadStream } from "fs";
import { renderHTML } from "./render";

export class FFResponse extends http.ServerResponse {
    _ended = false;

    /**
     * bind end for compatibility
    */
    send(data: string) {
        this.end(data);
    }

    header(name: string, value: string) {
        this.setHeader(name, value);
        return this;
    }

    /**
     * Set content type
     */
    ct(contentType: string = "text/plain") {
        this.setHeader("Content-Type", contentType);
        return this;
    }

    json(data: any) {
        this.setHeader("Content-Type", "application/json");
        this.end(JSON.stringify(data));
    }

    cookie(name: string, value: string, options: CookieOptions = {}) {
        let cookie = `${name}=${encodeURIComponent(value)}`;

        if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
        if (options.path) cookie += `; Path=${options.path}`;
        if (options.httpOnly) cookie += `; HttpOnly`;
        if (options.secure) cookie += `; Secure`;
        if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

        this.setHeader("Set-Cookie", cookie);
        return this;
    }

    status(code: number) {
        this.statusCode = code;
        return this;
    }

    redirect(url: string) {
        this.statusCode = 302;
        this.setHeader("Location", url);
        return this;
    }

    sendFile(filePath: string, contentType?: string) {
        if (contentType === "utf8") contentType = getContentType(filePath);
        this.ct(contentType || getContentType(filePath));
        createReadStream(filePath).pipe(this);
        return this;
    }

    render(templatePath: string, data: any) {
        this.setHeader("Content-Type", "text/html");
        this.end(renderHTML(templatePath, data));
        return this;
    }

    sseInit() {
        this.setHeader("Content-Type", "text/event-stream");
        this.setHeader("Cache-Control", "no-cache");
        this.setHeader("Connection", "keep-alive");
        return this;
    }

    sseSend(data: string | object) {
        if (typeof data === "object") data = JSON.stringify(data);
        this.write(`data: ${data}\n\n`);
        return this;
    }
}