import { FalconFrame } from "./index";
import { getContentType } from "./body-utils";
import { parseCookies } from "./helpers";
import { extractParams, getMiddlewares, matchMiddleware } from "./middleware";
import { validate } from "./valid";

export interface OfflineRequest {
	method?: string;
	url: string;
	headers?: Record<string, string>;
	body?: any;
	cookies?: Record<string, string>;
}

export interface OfflineResponse {
	status: number;
	headers: Record<string, string>;
	body: any;
}

interface Req {
	path: string;
	query: Record<string, string>;
	params: Record<string, string>;
	body: any;
	cookies: Record<string, string>;
	headers: Record<string, string>;
	isBodyParsed: boolean;
	FF: FalconFrame<any>;
	header: (name: string) => string;
	valid: (schema: any, regexRules?: any) => any;
}

interface Res {
	statusCode: number;
	headers: Record<string, string>;
	body: any;
	_ended: boolean;
	FF: FalconFrame<any>;
	json: (data: any) => void;
	send: (data: string) => void;
	end: (data: string) => void;
	status: (code: number) => Res;
	setHeader: (name: string, value: string) => void;
	ct: (type: string) => Res;
	cookie: (name: string, value: string, opts?: any) => void;
}

export class OfflineEngine {
	constructor(private ff: FalconFrame<any>) {}

	async handle(request: OfflineRequest): Promise<OfflineResponse> {
		const urlParts = request.url.split("?");
		const path = decodeURIComponent(urlParts[0]);
		const query = urlParts[1]
			? Object.fromEntries(new URLSearchParams(urlParts[1]))
			: {};

		request.method ??= "GET";

		const cookies = request.cookies
			? {
					...request.cookies,
					...parseCookies(request.cookies.cookie || ""),
				}
			: parseCookies(request.headers?.cookie || "");

		const res: Res = {
			statusCode: 200,
			headers: {},
			body: "",
			_ended: false,
			FF: this.ff,
			json: (data: any) => {
				res.headers["content-type"] = "application/json";
				res.body = data;
				res._ended = true;
			},
			send: (data: string) => {
				res.body = data;
				res._ended = true;
			},
			end: (data: string) => {
				res.body = data;
				res._ended = true;
			},
			status: (code: number) => {
				res.statusCode = code;
				return res;
			},
			setHeader: (name: string, value: string) => {
				res.headers[name.toLowerCase()] = value;
			},
			ct: (type: string) => {
				res.headers["content-type"] = type;
				return res;
			},
			cookie: (name: string, value: string, opts: any = {}) => {
				let c = `${name}=${encodeURIComponent(value)}`;
				if (opts.maxAge !== undefined) c += `; Max-Age=${opts.maxAge}`;
				if (opts.path) c += `; Path=${opts.path}`;
				if (opts.httpOnly) c += `; HttpOnly`;
				if (opts.secure) c += `; Secure`;
				const existing = res.headers["set-cookie"];
				res.headers["set-cookie"] = existing ? `${existing}, ${c}` : c;
			},
		};

		const req: Req = {
			path,
			query,
			params: {},
			body: {},
			cookies,
			headers: request.headers || {},
			isBodyParsed: false,
			FF: this.ff,
			header: (name: string) => request.headers?.[name.toLowerCase()] || "",
			valid: (schema: any, regexRules?: any) =>
				validate({
					schema,
					data: req.body,
					regexRules,
					isBodyParsed: req.isBodyParsed,
				}),
		};

		if (request.body !== undefined && request.body !== null) {
			const ct = getContentType(req as any) || "application/json";
			const entry = this.ff.bodyParsers[ct];
			if (entry) {
				const raw =
					typeof request.body === "string"
						? request.body
						: JSON.stringify(request.body);
				try {
					req.body = (await entry.parse(raw, req as any, res as any)) ?? {};
					req.isBodyParsed = true;
				} catch {
					req.body = {};
				}
			} else {
				req.body = request.body;
				req.isBodyParsed = true;
			}
		}

		const middlewares = getMiddlewares(this.ff.middlewares, path + "/");
		const matched = matchMiddleware(
			path,
			middlewares.filter(
				m => m.method === request.method.toLowerCase() || m.method === "all",
			),
		);

		if (matched.length === 0) {
			res.statusCode = 404;
			this.ff._404(req as any, res as any);
			return this.buildResponse(res);
		}

		let i = 0;
		const next = async () => {
			if (i >= matched.length) {
				res.statusCode = 404;
				this.ff._404(req as any, res as any);
				return;
			}
			const mw = matched[i++];
			req.params = extractParams(mw.path, path);
			try {
				const result = await mw.middleware(req as any, res as any, next);
				if (result && !res._ended) {
					typeof result === "string" ? res.send(result) : res.json(result);
				}
			} catch (err: any) {
				if (!res._ended) {
					res.statusCode = 500;
					this.ff._500(err, req as any, res as any);
				}
			}
		};

		await next();
		return this.buildResponse(res);
	}

	private buildResponse(res: Res): OfflineResponse {
		const ct = res.headers["content-type"] || "";
		return {
			status: res.statusCode,
			headers: res.headers,
			body:
				ct.includes("application/json") && res.body
					? res.body
					: (res.body ?? ""),
		};
	}
}
