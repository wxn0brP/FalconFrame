import { Body, Cookies, RouteHandler } from "./types.js";
export declare function parseCookies(cookieHeader: string): Cookies;
export declare function parseBody(contentType: string, body: string): Body;
export declare function getContentType(filePath: string, utf8?: boolean): string;
export declare function handleStaticFiles(apiPath: string, dirPath: string, utf8?: boolean): RouteHandler;
