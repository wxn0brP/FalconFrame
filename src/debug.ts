import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { join } from "path";
import { isDebugEnabled } from "./config";
import { isLoopback, normalizeIp } from "./helpers";
import { Router } from "./router";
import type { FFResponse } from "./res";
import type { DebugOptions, FFRequest } from "./types";

export type { DebugOptions };

const COOKIE_NAME = "ff_debug";
const SESSION_TTL = 8 * 60 * 60 * 1000;
const RATE_WINDOW = 15 * 60 * 1000;
const RATE_MAX_FAILURES = 5;

const sessions = new Map<string, number>();
const failures = new Map<string, number[]>();

let sweepTimer: ReturnType<typeof setInterval> | null = null;
const SWEEP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function startSweep() {
	if (sweepTimer !== null) return;
	sweepTimer = setInterval(() => {
		const now = Date.now();

		for (const [sid, expires] of sessions) {
			if (expires < now) sessions.delete(sid);
		}

		for (const [ip, times] of failures) {
			const recent = times.filter(time => now - time < RATE_WINDOW);
			if (recent.length) failures.set(ip, recent);
			else failures.delete(ip);
		}

		if (sessions.size === 0 && failures.size === 0) {
			if (sweepTimer !== null) {
				clearInterval(sweepTimer);
				sweepTimer = null;
			}
		}
	}, SWEEP_INTERVAL);
	sweepTimer.unref();
}

interface EffectiveDebug {
	enabled: boolean;
	pass: string;
	path: string;
	rateLimit: boolean;
	hosts: string[];
}

export function generateDebugToken() {
	return randomBytes(24).toString("base64url");
}

function hash(value: string) {
	return createHash("sha256").update(value).digest();
}

function sameSecret(given: string, expected: string) {
	if (!given) return false;
	return timingSafeEqual(hash(given), hash(expected));
}

function isSecure(req: FFRequest) {
	if ((req.socket as any)?.encrypted) return true;
	return req.headers["x-forwarded-proto"] === "https";
}

function providedToken(req: FFRequest) {
	const header = req.headers.authorization;
	if (typeof header === "string" && header.startsWith("Bearer ")) {
		return header.slice(7);
	}
	const query = req.query?.pass;
	return typeof query === "string" ? query : "";
}

function tokenSource(req: FFRequest): "header" | "query" | null {
	const header = req.headers.authorization;
	if (typeof header === "string" && header.startsWith("Bearer ")) {
		return header.length > 7 ? "header" : null;
	}
	const query = req.query?.pass;
	return typeof query === "string" && query ? "query" : null;
}

function createSession() {
	const sid = randomBytes(24).toString("base64url");
	sessions.set(sid, Date.now() + SESSION_TTL);
	startSweep();
	return sid;
}

function hasSession(req: FFRequest) {
	const sid = req.cookies?.[COOKIE_NAME];
	if (!sid) return false;

	const expires = sessions.get(sid);
	if (expires === undefined) return false;
	if (expires < Date.now()) {
		sessions.delete(sid);
		return false;
	}
	return true;
}

function throttled(ip: string) {
	const now = Date.now();
	const recent = (failures.get(ip) || []).filter(
		time => now - time < RATE_WINDOW,
	);
	if (recent.length) failures.set(ip, recent);
	else failures.delete(ip);
	return recent.length >= RATE_MAX_FAILURES;
}

function recordFailure(ip: string) {
	const now = Date.now();
	const recent = (failures.get(ip) || []).filter(
		time => now - time < RATE_WINDOW,
	);
	recent.push(now);
	failures.set(ip, recent);
	startSweep();
}

function hostAllowed(hosts: string[], ip: string) {
	const target = normalizeIp(ip);
	return hosts.some(host => {
		if (host === "localhost") return isLoopback(target);
		return normalizeIp(host) === target;
	});
}

function notFound(req: FFRequest, res: FFResponse) {
	res.status(404);
	req.FF._404(req, res);
}

type AuthResult = "disabled" | "denied" | "session" | "token";

function attempt(req: FFRequest, config: EffectiveDebug): AuthResult {
	if (!config.enabled) return "disabled";

	const ip = normalizeIp(req.ip || req.socket.remoteAddress || "");
	if (config.hosts.length && !hostAllowed(config.hosts, ip)) return "denied";
	if (hasSession(req)) return "session";

	if (config.rateLimit && throttled(ip)) return "denied";
	if (sameSecret(providedToken(req), config.pass)) return "token";

	if (config.rateLimit) recordFailure(ip);
	return "denied";
}

function grantSession(req: FFRequest, res: FFResponse, config: EffectiveDebug) {
	if (hasSession(req)) return;

	res.cookie(COOKIE_NAME, createSession(), {
		httpOnly: true,
		sameSite: "Strict",
		secure: isSecure(req),
		path: config.path,
		maxAge: SESSION_TTL / 1000,
	});
}

export function createDebug(
	opts: DebugOptions = {},
	preset: DebugOptions = {},
): Router {
	const config: DebugOptions = {
		...preset,
		...opts,
	};
	const path = config.path ?? config.url ?? "/debug";
	const staticPass = config.pass ?? process.env.FF_DEBUG_PASS;
	const generatedPass = generateDebugToken();

	if (!staticPass && isDebugEnabled(config.enabled)) {
		console.log(`[FF] Debug endpoint: ${path}?pass=${generatedPass}`);
	}

	const effective = (req: FFRequest): EffectiveDebug => {
		const app: DebugOptions = req.FF?.config?.debug ?? {};
		return {
			enabled: isDebugEnabled(config.enabled ?? app.enabled),
			pass: staticPass ?? generatedPass,
			path,
			rateLimit: config.rateLimit ?? app.rateLimit ?? true,
			hosts: config.hosts ?? app.hosts ?? [],
		};
	};

	const router = new Router();

	router.get(path, (req, res, next) => {
		const settings = effective(req);
		const result = attempt(req, settings);

		if (result === "disabled") return next();
		if (result === "denied") return notFound(req, res);
		if (result === "token") {
			grantSession(req, res, settings);
			if (tokenSource(req) === "query") return res.redirect(path);
			return res.sendFile(join(import.meta.dirname, "debug.html"));
		}

		res.sendFile(join(import.meta.dirname, "debug.html"));
	});

	const sse = router.sse(
		`${path}/sse`,
		(req, res, next) => {
			const settings = effective(req);
			const result = attempt(req, settings);

			if (result === "disabled") return next();
			if (result === "denied") return notFound(req, res);
			if (result === "token") grantSession(req, res, settings);

			next();
		},
		() => {},
	);

	router.use("/", (req, res, next) => {
		if (!effective(req).enabled) return next();

		const start = Date.now();
		const hook = res.end.bind(res);

		(res as any).end = (...args: any[]) => {
			const contentType = String(res.getHeader("content-type") || "");
			const binary =
				/^(image|video|audio|font)\//i.test(contentType) ||
				/octet-stream/i.test(contentType);
			const debugRequest =
				req.path === path || req.path?.startsWith(`${path}/`);

			if (!binary && !debugRequest) {
				const entry = {
					method: req.method,
					url: (req.url || "").replace(/([?&]pass=)[^&]*/i, "$1***"),
					headers: req.headers,
					query: req.query || {},
					cookies: req.cookies || {},
					body: req.body || {},
					status: res.statusCode,
					duration: Date.now() - start,
					time: new Date().toISOString(),
				};
				try {
					sse.sendAll(entry);
				} catch {
					/* a disconnected debug client must not break the app */
				}
			}

			return hook(...args);
		};

		next();
	});

	return router;
}
