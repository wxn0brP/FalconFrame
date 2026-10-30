import { createReadStream } from "fs";
import type { FFResponse } from "./res";
import { Cookies, FFRequest, ProxyMode } from "./types";
export { getContentType } from "./encoding";

export function parseCookies(cookieHeader: string): Cookies {
	const cookies = Object.create(null) as Cookies;
	cookieHeader.split(";").forEach(cookie => {
		const [name, ...valueParts] = cookie.split("=");
		const value = decodeURIComponent(valueParts.join("=").trim());
		cookies[name.trim()] = value;
	});
	return cookies;
}

export function normalizeIp(ip: string) {
	const trimmed = ip.trim();
	return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
}

export function isLoopback(ip: string) {
	const value = normalizeIp(ip);
	return value === "::1" || value.startsWith("127.");
}

function forwardedIp(req: FFRequest) {
	const cf = req.headers["cf-connecting-ip"];
	if (typeof cf === "string" && cf) return cf;

	const trueClient = req.headers["true-client-ip"];
	if (typeof trueClient === "string" && trueClient) return trueClient;

	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string") return forwarded.split(",")[0];
	if (Array.isArray(forwarded)) return forwarded[0]?.split(",")[0];

	return undefined;
}

function trustsProxy(proxy: ProxyMode, socketIp: string) {
	if (proxy === true) return true;
	if (proxy === false) return false;
	if (Array.isArray(proxy)) {
		return proxy.some(entry => normalizeIp(entry) === socketIp);
	}
	return isLoopback(socketIp);
}

function forwardedProto(req: FFRequest): "http" | "https" | undefined {
	const header = req.headers["x-forwarded-proto"];
	const value = Array.isArray(header) ? header[0] : header;
	if (!value) return undefined;

	const proto = value.split(",")[0]?.trim().toLowerCase();
	return proto === "http" || proto === "https" ? proto : undefined;
}

export function resolveRequestInfo(req: FFRequest, proxy: ProxyMode = "auto") {
	const socketIp = normalizeIp(req.socket.remoteAddress || "");
	const forwarded = forwardedIp(req);
	const trusted = trustsProxy(proxy, socketIp);
	const isProxied = trusted && !!forwarded;
	const protocol =
		(trusted ? forwardedProto(req) : undefined) ??
		((req.socket as any)?.encrypted ? "https" : "http");

	return {
		socketIp,
		ip: isProxied ? normalizeIp(forwarded as string) : socketIp,
		isProxied,
		protocol,
	};
}

export function getIP(req: FFRequest, proxy: ProxyMode = "auto") {
	return resolveRequestInfo(req, proxy).ip;
}

export function streamFile(res: FFResponse, filePath: string) {
	const stream = createReadStream(filePath);

	stream.on("error", (err: NodeJS.ErrnoException) => {
		if (res.writableEnded) return;

		if (res.headersSent) {
			res.destroy(err);
			return;
		}

		res.removeHeader("content-length");
		res.removeHeader("content-encoding");

		if (err.code === "ENOENT") {
			res.status(404);
			res.FF._404(res.req as FFRequest, res);
			return;
		}

		res.status(500);
		res.FF._500(err, res.req as FFRequest, res);
		if (!res.writableEnded) res.end();
	});

	stream.pipe(res);
}

export const ensureLeadingDot = (str: string) =>
	str.startsWith(".") ? str : "." + str;
