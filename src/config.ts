import { parseLimit } from "./body-utils";
import type { DebugOptions, FFOpts, ProxyMode } from "./types";

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

export function isDebugEnabled(enabled: boolean | undefined) {
	if (enabled !== undefined) return enabled;
	return !(
		process.env.NODE_ENV === "production" &&
		!process.env.FF_DEBUG_PRODUCTION_ENABLED
	);
}

export function resolveConfig(opts: FFOpts = {}): ResolvedConfig {
	const debugOption = opts.debug;
	const debug: DebugOptions =
		typeof debugOption === "object" && debugOption !== null ? debugOption : {};

	const enabled =
		debugOption === false ? false : debugOption === true ? true : debug.enabled;

	return {
		proxy: opts.proxy ?? "auto",
		bodyLimit: parseLimit(opts.bodyLimit ?? "10m"),
		bodyTimeout: opts.bodyTimeout ?? 60_000,
		defaultBodyParser: opts.defaultBodyParser ?? "json",
		untrustedBodyParsers: opts.untrustedBodyParsers ?? false,
		xRequestId: opts.xRequestId,
		disableParser: opts.disableParser,
		debug: {
			enabled,
			pass: debug.pass ?? process.env.FF_DEBUG_PASS,
			path: debug.path ?? debug.url ?? "/debug",
			rateLimit: debug.rateLimit ?? true,
			hosts: debug.hosts ?? [],
		},
	};
}
