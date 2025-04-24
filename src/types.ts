import { FFResponse } from "./res";
import http from "http";

export type RequestHandler = (req: FFRequest, res: FFResponse) => void | any;
export type Middleware = (req: FFRequest, res: FFResponse, next: () => void) => void;

export interface Params {
    [key: string]: string;
}

export interface Cookies {
    [key: string]: string;
}

export interface Query {
    [key: string]: string | string[];
}

export interface Body {
    [key: string]: any;
}

export class FFRequest extends http.IncomingMessage {
    path!: string;
    query!: Query;
    params!: Params;
    cookies!: Cookies;
    body!: Body;
}

export interface Route {
    path: string;
    handler: RequestHandler;
}

export interface Routes {
    [method: string]: Route[];
}

export interface CookieOptions {
    maxAge?: number;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
}
