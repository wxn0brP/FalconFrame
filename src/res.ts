import http from "http";
import { CookieOptions } from "./types";
import { getContentType } from "./helpers";
import { createReadStream } from "fs";
import { renderHTML } from "./render";
import FalconFrame from ".";

export class FFResponse extends http.ServerResponse {
    _ended = false;
    FF: FalconFrame;

    /**
     * bind end for compatibility
    */
    send(data: string) {
        this.end(data);
    }

    /**
     * Sets a header. This is a shortcut for setHeader.
     * @param name The name of the header
     * @param value The value of the header
     * @returns The response object
     */
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

    /**
     * Set the content type to application/json and write the given data as json
     * @param data The data to be written as json
     */
    json(data: any) {
        this.setHeader("Content-Type", "application/json");
        this.end(JSON.stringify(data));
    }

    /**
     * Set a cookie in the response
     * @param name The name of the cookie
     * @param value The value of the cookie
     * @param options The options for the cookie
     */
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

    /**
     * Set the status code for the response
     * @param code The status code to set
     * @returns The response object
     */
    status(code: number) {
        this.statusCode = code;
        return this;
    }

    /**
     * Set status code to 302 and set location header to the provided url.
     * If end is true, ends the response.
     * @param url The url to redirect to
     * @param end Whether to end the response after setting the headers
     * @returns The response object
     */
    redirect(url: string, end = true) {
        this.statusCode = 302;
        this.setHeader("Location", url);
        if (end) this.end();
        return this;
    }

    /**
     * Sends a file as the response.
     * Sets the "Content-Type" header based on the provided contentType or the file's extension.
     * Uses streaming to send the file content.
     * @param filePath The path to the file to be sent.
     * @param contentType Optional. The MIME type for the Content-Type header.
     * If "utf8", the charset will be set to UTF-8.
     * @returns The response object.
     */
    sendFile(filePath: string, contentType?: string) {
        if (contentType === "utf8") contentType = getContentType(filePath);
        this.ct(contentType || getContentType(filePath));
        createReadStream(filePath).pipe(this);
        this._ended = true;
        return this;
    }

    /**
     * Renders an HTML template with the provided data and sends it as the response.
     * Sets the "Content-Type" header to "text/html".
     * @param templatePath The path to the HTML template file.
     * @param data An object containing data to be injected into the template.
     * @returns The response object.
     */
    render(templatePath: string, data: any = {}) {
        this.setHeader("Content-Type", "text/html");
        if (this.FF.vars["views"] && !templatePath.endsWith(".html")) {
            templatePath = this.FF.vars["views"] + templatePath + ".html";
        }
        this.end(renderHTML(templatePath, data));
        return this;
    }

    /**
     * Initialize SSE headers to start a server-sent event stream.
     * Sets:
     * 
     * Content-Type: "text/event-stream"
     * 
     * Cache-Control: "no-cache"
     * 
     * Connection: "keep-alive"
     * @returns The response object
     */
    sseInit() {
        this.setHeader("Content-Type", "text/event-stream");
        this.setHeader("Cache-Control", "no-cache");
        this.setHeader("Connection", "keep-alive");
        return this;
    }

    /**
     * Sends a Server-Sent Event to the client.
     * @param data The data to be sent. If an object, it will be JSON.stringified.
     * @returns The response object
     */
    sseSend(data: string | object) {
        if (typeof data === "object") data = JSON.stringify(data);
        this.write(`data: ${data}\n\n`);
        return this;
    }
}