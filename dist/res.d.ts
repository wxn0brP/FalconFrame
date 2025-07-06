import http from "http";
import { CookieOptions } from "./types.js";
export declare class FFResponse extends http.ServerResponse {
    _ended: boolean;
    /**
     * bind end for compatibility
    */
    send(data: string): void;
    /**
     * Set content type
     */
    ct(contentType?: string): void;
    json(data: any): void;
    cookie(name: string, value: string, options?: CookieOptions): this;
    status(code: number): this;
    redirect(url: string): this;
    sendFile(filePath: string, contentType?: string): this;
    render(templatePath: string, data: any): this;
}
