import http from "http";
import { CookieOptions } from "./types.js";
export declare class FFResponse extends http.ServerResponse {
    _ended: boolean;
    json(data: any): void;
    cookie(name: string, value: string, options?: CookieOptions): this;
    status(code: number): this;
    redirect(url: string): this;
    sendFile(filePath: string): this;
    render(templatePath: string, data: any): this;
}
