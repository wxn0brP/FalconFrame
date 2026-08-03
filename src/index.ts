import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import * as bodyParser from "./body";
import { parseLimit } from "./body-utils";
import { createCORS } from "./cors";
import { renderHTML } from "./render";
import { handleRequest } from "./req";
import { FFResponse } from "./res";
import { Router } from "./router";
import type {
	BeforeHandleRequest,
	BodyParserEntry,
	CombinedVars,
	EngineCallback,
	ErrorHandler,
	FFOpts,
	FFRequest,
	ParseBodyFunction,
	RouteHandler,
	StandardBodyParserOptions,
	ValidationErrorFormatter,
} from "./types";

export class FalconFrame<Vars extends Record<string, any> = {}> extends Router {
	logger: Logger;
	bodyParsers: Record<string, BodyParserEntry> = {};
	vars: CombinedVars<Vars> = {} as any;
	opts: FFOpts = {};
	engines: Record<string, EngineCallback> = {};

	_400_formatter: ValidationErrorFormatter = err => {
		return {
			err: true,
			msg: "Bad request",
			errors: err,
		};
	};
	_404: RouteHandler = (req, res) => {
		res.end("404: File had second thoughts");
	};
	_413: RouteHandler = (req, res) => {
		res.end("413: Cat is too fat");
	};
	_500: ErrorHandler = (err, req, res) => {
		res.end("500: The code had an existential crisis");
	};

	constructor(opts: Partial<FFOpts> = {}) {
		super();
		const loggerOpts = opts?.loggerOpts || {};
		this.logger = new Logger({
			loggerName: "falcon-frame",
			...loggerOpts,
		});
		this.opts = {
			bodyLimit: "10m",
			...opts,
		};

		const dp = this.opts.disableParser || {};
		const isBun = !!(globalThis as any).Bun;
		const bunOnly = new Set([
			"json5",
			"yaml",
			"toml",
		]);

		const parsers: Record<
			string,
			{
				fn: ParseBodyFunction;
				ct: string;
			}
		> = {
			json: {
				fn: bodyParser.json,
				ct: "application/json",
			},
			urlencoded: {
				fn: bodyParser.urlencoded,
				ct: "application/x-www-form-urlencoded",
			},
			json5: {
				fn: bodyParser.json5,
				ct: "application/json5",
			},
			yaml: {
				fn: bodyParser.yaml,
				ct: "application/yaml",
			},
			toml: {
				fn: bodyParser.toml,
				ct: "application/toml",
			},
			xml: {
				fn: bodyParser.xml,
				ct: "application/xml",
			},
			text: {
				fn: bodyParser.text,
				ct: "text/plain",
			},
		};

		for (const [key, { fn, ct }] of Object.entries(parsers)) {
			if (dp[key as keyof typeof dp]) continue;
			if (bunOnly.has(key) && !isBun) continue;
			this.addBodyParser(ct, fn);
		}

		this.engine(".html", (path, data, callback, FF) => {
			try {
				const content = renderHTML({
					templatePath: path,
					data,
					FF,
				});
				callback(null, content);
			} catch (e) {
				callback(e);
			}
		});
	}

	addBodyParser(
		contentType: string,
		parser: ParseBodyFunction,
		opts: StandardBodyParserOptions = {},
	) {
		this.bodyParsers[contentType] = {
			parse: parser,
			limit: parseLimit(opts.limit || this.opts.bodyLimit || "10m"),
		};
		return this;
	}

	listen(
		port: number | string,
		callback?: (() => void) | boolean,
		beforeHandleRequest?: BeforeHandleRequest,
	) {
		const server = http.createServer(this.getApp(beforeHandleRequest));

		let parsedPort = 0;
		let host = "";

		if (typeof port === "string") {
			if (port.includes(":")) {
				const [h, po] = port.split(":");
				host = h;
				parsedPort = +po;
			} else parsedPort = +port;
		} else if (typeof port === "number") {
			parsedPort = port;
		}

		if (typeof callback === "boolean") {
			if (callback)
				callback = () => {
					console.log(
						`[FF] Server running on http://${host || "localhost"}:${parsedPort}`,
					);
				};
			else callback = () => {};
		}
		const cb = callback || (() => {});

		server.listen(parsedPort, host || "0.0.0.0", cb);
		return server;
	}

	getApp(beforeHandleRequest?: BeforeHandleRequest) {
		return async (req: any, res: any) => {
			if (beforeHandleRequest) {
				const result = await beforeHandleRequest(req, res);
				if (result || (res as FFResponse)._ended) return;
			}
			handleRequest(req as FFRequest, res as FFResponse, this as any);
		};
	}

	engine(ext: string, callback: EngineCallback) {
		if (ext[0] !== ".") ext = "." + ext;
		this.engines[ext] = callback;
		return this;
	}

	setVar<K extends keyof CombinedVars<Vars>>(
		key: K,
		value: CombinedVars<Vars>[K],
	) {
		this.vars[key] = value;
		return this;
	}

	set<K extends keyof CombinedVars<Vars>>(
		key: K,
		value: CombinedVars<Vars>[K],
	) {
		return this.setVar(key, value);
	}

	getVar<K extends keyof CombinedVars<Vars>>(key: K): CombinedVars<Vars>[K] {
		return this.vars[key];
	}

	/**
	 * Sets the allowed origins for CORS.
	 * This method is a shortcut that simplifies CORS configuration
	 * without needing to manually create and register a plugin.
	 * @param [origin] - An array of allowed origins. (default: ["*"])
	 * @example
	 * app.setOrigin(["http://example.com", "https://example.com"]);
	 */
	setOrigin(origin: string[] | string = "*") {
		this.use(
			createCORS(
				Array.isArray(origin)
					? origin
					: [
							origin,
						],
			),
		);
	}

	/**
	 * Listens to the specified port, or the environment variable PORT if available.
	 * @param port - The port number to listen to.
	 * @returns The server object returned by the listen method.
	 */
	l(port: number) {
		return this.listen(+process.env.PORT || port, true);
	}

	set400Formatter(formatter: ValidationErrorFormatter) {
		this._400_formatter = formatter;
	}

	set404(handler: RouteHandler) {
		this._404 = handler;
	}

	set413(handler: RouteHandler) {
		this._413 = handler;
	}

	set500(handler: ErrorHandler) {
		this._500 = handler;
	}
}

export default FalconFrame;

export * as Helpers from "./helpers";
export type { FFOpts as Opts } from "./types";
export { validateBody } from "./valid";
export { FFRequest, FFResponse, renderHTML, RouteHandler, Router };
