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
    send(data: string): void {
        this.end(data);
    }

    /**
     * Set content type
     */
    ct(contentType: string = "text/plain"): void {
        this.setHeader("Content-Type", contentType);
    }

    json(data: any): void {
        this.setHeader("Content-Type", "application/json");
        this.end(JSON.stringify(data));
    }

    cookie(name: string, value: string, options: CookieOptions = {}): this {
        let cookie = `${name}=${encodeURIComponent(value)}`;

        if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
        if (options.path) cookie += `; Path=${options.path}`;
        if (options.httpOnly) cookie += `; HttpOnly`;
        if (options.secure) cookie += `; Secure`;
        if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

        this.setHeader("Set-Cookie", cookie);
        return this;
    }

    status(code: number): this {
        this.statusCode = code;
        return this;
    }

    redirect(url: string): this {
        this.statusCode = 302;
        this.setHeader("Location", url);
        return this;
    }

    sendFile(filePath: string, contentType?: string): this {
        if (contentType === "utf8") contentType = getContentType(filePath);
        this.ct(contentType || getContentType(filePath));
        createReadStream(filePath).pipe(this);
        return this;
    }

    render(templatePath: string, data: any): this {
        this.setHeader("Content-Type", "text/html");
        this.end(renderHTML(templatePath, data));
        return this;
    }
}