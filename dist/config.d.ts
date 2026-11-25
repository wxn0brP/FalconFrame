import type { FFOpts, ProxyMode } from "./types.js";
export interface ResolvedDebugConfig {
    enabled?: boolean;
    pass?: string;
    path: string;
    rateLimit: boolean;
    hosts: string[];
}
export interface ResolvedConfig {
    proxy: ProxyMode;
    bodyLimit: number;
    bodyTimeout: number;
    defaultBodyParser: "json" | false;
    untrustedBodyParsers: boolean;
    xRequestId?: "auto" | "disable" | "manual";
    disableParser: FFOpts["disableParser"];
    debug: ResolvedDebugConfig;
}
export declare function isDebugEnabled(enabled: boolean | undefined): boolean;
export declare function resolveConfig(opts?: FFOpts): ResolvedConfig;
