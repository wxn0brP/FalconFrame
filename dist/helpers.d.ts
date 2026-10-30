import type { FFResponse } from "./res.js";
import { Cookies, FFRequest, ProxyMode } from "./types.js";
export { getContentType } from "./encoding.js";
export declare function parseCookies(cookieHeader: string): Cookies;
export declare function normalizeIp(ip: string): string;
export declare function isLoopback(ip: string): boolean;
export declare function resolveRequestInfo(req: FFRequest, proxy?: ProxyMode): {
    socketIp: string;
    ip: string;
    isProxied: boolean;
    protocol: "http" | "https";
};
export declare function getIP(req: FFRequest, proxy?: ProxyMode): string;
export declare function streamFile(res: FFResponse, filePath: string): void;
export declare const ensureLeadingDot: (str: string) => string;
