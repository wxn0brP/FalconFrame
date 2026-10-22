import { Cookies, FFRequest } from "./types.js";
export { getContentType } from "./encoding.js";
export declare function parseCookies(cookieHeader: string): Cookies;
export declare function getIP(req: FFRequest): string;
export declare const ensureLeadingDot: (str: string) => string;
