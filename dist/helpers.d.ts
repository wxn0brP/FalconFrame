import { Cookies, RouteHandler, StaticServeOptions } from "./types.js";
export declare function parseCookies(cookieHeader: string): Cookies;
export declare function getContentType(filePath: string, utf8?: boolean): string;
export declare function handleStaticFiles(dirPath: string, opts: StaticServeOptions): RouteHandler;
