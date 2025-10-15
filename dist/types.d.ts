import FalconFrame from "./index.js";
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
export type ParseBodyFunction = (body: string, req: FFRequest, FF: FalconFrame) => Promise<Record<string, any>>;
export interface StandardBodyParserOptions {
    limit?: string | number;
}
export declare class FFRequest extends http.IncomingMessage {
    path: string;
    query: Query;
    params: Params;
    cookies: Cookies;
    body: Body;
    valid: (schema: ValidationSchema) => ValidationResult;
    middleware: Middleware;
    sseId?: string;
}
export interface Middleware {
    path: string;
    method: Method;
    middleware: RouteHandler;
    use?: true;
    router?: Middleware[];
    customParser?: true;
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
export interface StaticServeOptions {
    utf8?: boolean;
    render?: boolean;
    etag?: boolean;
    errorIfDirNotFound?: boolean;
    notRenderHtml?: boolean;
}
export type EngineCallback = (path: string, options: any, callback: (e: any, rendered?: string) => void) => void;
export interface RenderOptions {
    notUseViews?: boolean;
    contentType?: string;
    baseDir?: string;
    engine?: string;
    notAppendExt?: boolean;
}
