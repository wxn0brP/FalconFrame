import { Cookies, FFRequest } from "./types.js";
export declare function parseCookies(cookieHeader: string): Cookies;
export declare function getIP(req: FFRequest): string;
export declare function getContentType(filePath: string, utf8?: boolean): string;
export declare const ensureLeadingDot: (str: string) => string;
