import type { ServerOptions } from "https";
export interface ResolvedHTTPSConfig {
    port: number;
    options: ServerOptions;
}
export declare function resolveHTTPSConfig(): ResolvedHTTPSConfig | undefined;
