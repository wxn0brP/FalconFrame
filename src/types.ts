import { LoggerOptions } from "@wxn0brp/lucerna-log";
import FalconFrame from ".";
import { FFResponse } from "./res";
import http from "http";

export type RouteHandler = (
	req: FFRequest,
	res: FFResponse,
	next: () => void,
) => void | any;

export type FinalHandler = (req: FFRequest, res: FFResponse) => void | any;

export type ErrorHandler = (
	err: Error,
	req: FFRequest,
	res: FFResponse,
) => void | any;

export type Method = "get" | "post" | "put" | "delete" | "patch" | "all";

/**
 * How the client IP is resolved behind a proxy.
 * - `"auto"` (default): trust proxy headers only when the TCP peer is loopback,
 *   which covers local tunnels (`cloudflared`, nginx, caddy) without trusting
 *   spoofable headers from remote peers.
 * - `true`: trust proxy headers from any peer.
 * - `false`: never trust proxy headers.
 * - `string[]`: trust proxy headers only from the listed proxy addresses.
 */
export type ProxyMode = "auto" | boolean | string[];

export interface DebugOptions {
	/** URL path of the debug panel. Defaults to `/debug`. */
	path?: string;
	/** @deprecated use `path` */
	url?: string;
	/** Extra allowlist of client IPs. Empty by default, the token is the gate. */
	hosts?: string[];
	/** Enable the endpoint. Defaults to `NODE_ENV !== "production"`. */
	enabled?: boolean;
	/** Stable secret. If omitted, a random token is generated at startup. */
	pass?: string;
	/** Throttle failed token attempts. Defaults to `true`. */
	rateLimit?: boolean;
	/** @deprecated */
	logs?: boolean;
}

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

export type ParseBodyFunction = (
	body: string,
	req: FFRequest,
	res: FFResponse,
) => Record<string, any> | Promise<Record<string, any>>;

export interface BodyParserEntry {
	parse: ParseBodyFunction;
	limit: number;
}

export interface StandardBodyParserOptions {
	limit?: string | number;
}

export interface CompressionOptions {
	/** Responses smaller than this (in bytes) are sent uncompressed. Defaults to 1024. */
	threshold?: number;
	/** Brotli quality, 0-11. Defaults to 4. */
	brotliQuality?: number;
	/** gzip/deflate level, 0-9. Defaults to 6. */
	gzipLevel?: number;
}

export class FFRequest extends http.IncomingMessage {
	FF: FalconFrame<any>;
	path: string;
	query: Query;
	params: Params;
	cookies: Cookies;
	body: Body;
	/** Raw TCP peer address. */
	socketIp: string;
	/** Resolved client address (respects the `proxy` option). */
	ip: string;
	/** True when proxy headers were used to resolve `ip`. */
	isProxied: boolean;
	/** Request protocol, respects `x-forwarded-proto` from a trusted proxy. */
	protocol: "http" | "https";
	/** True when the request came over HTTPS, directly or via a trusted proxy. */
	secure: boolean;
	header: (name: string) => string;
	valid: (
		schema: ValidationSchema,
		regexRules?: Record<string, RegExp | string>,
	) => ValidationResult;
	middleware: Middleware;
	id?: string;
	sseId?: string;
	reRoute: (fn: (req: FFRequest) => void) => void;
	isBodyParsed: boolean;
	_compression?: true;
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

export type ValidationErrorFormatter = (
	errors: ValidationResult["validErrors"],
) => Record<string, any>;

export type BeforeHandleRequest = (
	req: http.IncomingMessage,
	res: http.ServerResponse,
) => any;

export interface StaticServeOptions {
	utf8?: boolean;
	render?: boolean;
	renderData?: Record<string, Record<string, any>>;
	etag?: boolean;
	errorIfDirNotFound?: boolean;
	notRenderHtml?: boolean;
	/** Allow serving dotfiles. `.well-known` is always allowed as the first segment. Defaults to false. */
	dotfiles?: boolean;
}

export interface StaticFileOptions {
	utf8?: boolean;
	etag?: boolean;
	errorIfFileNotFound?: boolean;
}

export type EngineCallback = (
	path: string,
	data: any,
	callback: (e: any, rendered?: string) => void,
	FF?: FalconFrame,
) => void;

export interface RenderOptions {
	notUseViews?: boolean;
	contentType?: string;
	baseDir?: string;
	engine?: string;
	notAppendExt?: boolean;
	notShareFF?: boolean;
}

export interface FFOpts {
	loggerOpts?: LoggerOptions;
	bodyLimit?: string;
	/** Client IP resolution behind a proxy. Defaults to `"auto"`. */
	proxy?: ProxyMode;
	/** Body parser used when the request has no `Content-Type`. Defaults to `"json"`. */
	defaultBodyParser?: "json" | false;
	/** Enable parsing of YAML, TOML and JSON5 request bodies. Defaults to `false`. */
	untrustedBodyParsers?: boolean;
	/** Request body read timeout in milliseconds. Defaults to 60000. */
	bodyTimeout?: number;
	/** Debug panel. `true`/`false` or an options object. */
	debug?: boolean | DebugOptions;
	disableParser?: {
		json?: boolean;
		urlencoded?: boolean;
		json5?: boolean;
		yaml?: boolean;
		toml?: boolean;
		text?: boolean;
	};
	xRequestId?: "auto" | "disable" | "manual";
}

export type FFVars = {
	"render data": Record<string, any>;
	"view engine": string;
	views: string;
	layout: string;
};

export type CombinedVars<ExtraVars> = ExtraVars & FFVars;
