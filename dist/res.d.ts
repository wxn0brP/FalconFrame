import http from "http";
import FalconFrame from "./index.js";
import { CookieOptions, RenderOptions } from "./types.js";
export declare class FFResponse extends http.ServerResponse {
    _ended: boolean;
    FF: FalconFrame<any>;
    /**
     * bind end for compatibility
     */
    send(data: string): void;
    /**
     * Sets a header. This is a shortcut for setHeader.
     * @param name The name of the header
     * @param value The value of the header
     * @returns The response object
     */
    header(name: string, value: string): this;
    /**
     * Set content type
     */
    ct(contentType?: string): this;
    /**
     * Set the content type to application/json and write the given data as json
     * @param data The data to be written as json
     */
    json(data: any): void;
    /**
     * Set a cookie in the response
     * @param name The name of the cookie
     * @param value The value of the cookie
     * @param options The options for the cookie
     */
    cookie(name: string, value: string, options?: CookieOptions): this;
    /**
     * Set the status code for the response
     * @param code The status code to set
     * @returns The response object
     */
    status(code: number): this;
    /**
     * Set status code to 302 and set location header to the provided url.
     * If end is true, ends the response.
     * @param url The url to redirect to
     * @param end Whether to end the response after setting the headers
     * @returns The response object
     */
    redirect(url: string, end?: boolean): this;
    /**
     * Sends a file as the response.
     * Sets the "Content-Type" header based on the provided contentType or the file's extension.
     * Uses streaming to send the file content.
     * @param filePath The path to the file to be sent.
     * @param contentType Optional. The MIME type for the Content-Type header.
     * If "utf8", the charset will be set to UTF-8.
     * @returns The response object.
     */
    sendFile(filePath: string, contentType?: string): this;
    /**
     * Renders a view with the given data and sends it as the response.
     * It uses the registered template engine.
     * @param view The name of the view file to render.
     * @param data An object containing data to be injected into the template.
     * @returns The response object.
     */
    render(view: string, data?: any, opts?: RenderOptions): this;
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
    sseInit(): this;
    /**
     * Sends a Server-Sent Event to the client.
     * @param data The data to be sent. If an object, it will be JSON.stringified.
     * @returns The response object
     */
    sseSend(data: string | object): this;
}
