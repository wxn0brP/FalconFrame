import { LoggerOptions } from "@wxn0brp/lucerna-log";
import FalconFrame from ".";
import { FFResponse } from "./res";
import http from "http";

export type RouteHandler = (
	req: FFRequest,
	res: FFResponse,
	next?: () => void,
) => void | any;

export type ErrorHandler = (
	err: Error,
	req: FFRequest,
	res: FFResponse,
) => void | any;

export type Method = "get" | "post" | "put" | "delete" | "patch" | "all";

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

export class FFRequest extends http.IncomingMessage {
	FF: FalconFrame<any>;
	path: string;
	query: Query;
	params: Params;
	cookies: Cookies;
	body: Body;
	ip: string;
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
	disableParser?: {
		json?: boolean;
		urlencoded?: boolean;
		json5?: boolean;
		yaml?: boolean;
		toml?: boolean;
		xml?: boolean;
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
