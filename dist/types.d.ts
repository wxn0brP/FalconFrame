import { FFResponse } from "./res.js";
import http from "http";
export type RouteHandler = (req: FFRequest, res: FFResponse, next?: () => void) => void | any;
export type Method = "get" | "post" | "put" | "delete" | "all";
export interface Params {
    [key: string]: string;
}
export interface Cookies {
    [key: string]: string;
}
export interface Query {
    [key: string]: string;
}
export interface Body {
    [key: string]: any;
}
export declare class FFRequest extends http.IncomingMessage {
    path: string;
    query: Query;
    params: Params;
    cookies: Cookies;
    body: Body;
    valid: (schema: ValidationSchema) => ValidationResult;
    middleware: Middleware;
}
export interface Middleware {
    path: string;
    method: Method;
    middleware: RouteHandler;
    use?: true;
    router?: Middleware[];
}
export interface CookieOptions {
    maxAge?: number;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
}
export interface ValidationSchema {
    [key: string]: string;
}
export interface ValidationResult {
    valid: boolean;
    validErrors: {
        [key: string]: string[];
    };
}
export type BeforeHandleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => any;
