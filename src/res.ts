import http from "http";
import { CookieOptions } from "./types";
import { getContentType } from "./helpers";
import { createReadStream } from "fs";

export class FFResponse extends http.ServerResponse {
    _ended = false;

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

    sendFile(filePath: string): this {
        this.setHeader("Content-Type", getContentType(filePath));
        createReadStream(filePath).pipe(this);
        return this;
    }
}