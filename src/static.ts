import fs from "fs";
import path from "path";
import { ensureLeadingDot, streamFile } from "./helpers";
import { getContentType } from "./encoding";
import { FFResponse } from "./res";
import {
	FFRequest,
	RouteHandler,
	StaticFileOptions,
	StaticServeOptions,
} from "./types";

const WELL_KNOWN = ".well-known";

function normalizeMount(apiPath: string) {
	const trimmed = apiPath.replace(/\/+$/, "");
	return trimmed === "" ? "/" : trimmed;
}

function relativeToMount(mount: string, requestPath: string) {
	if (mount === "/") return requestPath;
	if (requestPath === mount) return "/";
	if (!requestPath.startsWith(`${mount}/`)) return null;
	return requestPath.slice(mount.length);
}

function isAllowedRelative(relative: string, dotfiles: boolean) {
	const segments = relative.split("/").filter(Boolean);

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];

		if (segment === "." || segment === "..") return false;
		if (segment.includes("\\") || segment.includes("\0")) return false;
		if (process.platform === "win32" && segment.includes(":")) return false;

		if (dotfiles) continue;
		if (!segment.startsWith(".")) continue;
		if (i === 0 && segment === WELL_KNOWN) continue;

		return false;
	}

	return true;
}

export function handleSingleFile(
	filePath: string,
	opts: StaticFileOptions,
): RouteHandler {
	opts = {
		utf8: true,
		etag: true,
		errorIfFileNotFound: true,
		...opts,
	};

	if (opts.errorIfFileNotFound && !fs.existsSync(filePath))
		throw new Error(`File ${filePath} does not exist`);

	return (req, res, next) => {
		if (req.method !== "GET" && req.method !== "HEAD") return next();

		let stats: fs.Stats;
		try {
			stats = fs.statSync(filePath);
		} catch (e) {
			res.statusCode = 404;
			res.FF._404(req, res);
			return;
		}

		if (opts.etag) {
			const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;
			if (req.headers["if-none-match"] === etag) {
				res.status(304).end();
				return;
			}
			res.setHeader("ETag", etag);
		}

		res.ct(getContentType(filePath, opts.utf8));
		res.setHeader("Content-Length", stats.size);

		if (req.method === "HEAD") {
			res.end();
			return;
		}

		streamFile(res, filePath);
	};
}

export function handleStaticFiles(
	dirPath: string,
	opts: StaticServeOptions,
): RouteHandler {
	opts = {
		utf8: true,
		render: true,
		renderData: {},
		etag: true,
		errorIfDirNotFound: true,
		dotfiles: false,
		...opts,
	};

	if (opts.errorIfDirNotFound && !fs.existsSync(dirPath)) {
		throw new Error(`Directory ${dirPath} does not exist`);
	}

	const serveFile = (
		req: FFRequest,
		res: FFResponse,
		filePath: string,
		stats: fs.Stats,
	) => {
		if (opts.render) {
			const defaultRenderer = res.FF.getVar("view engine") as string;

			const renderStatement =
				(defaultRenderer &&
					filePath.endsWith(ensureLeadingDot(defaultRenderer))) ||
				(!opts.notRenderHtml && filePath.endsWith(".html"));

			if (renderStatement) {
				const relativePath = path
					.relative(path.resolve(dirPath), filePath)
					.replaceAll(path.sep, "/")
					.replace(/\.html$/, "");
				res.render(filePath, opts.renderData?.[relativePath] || {}, {
					notUseViews: true,
				});
				return true;
			}
		}

		if (opts.etag) {
			const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;
			if (req.headers["if-none-match"] === etag) {
				res.status(304).end();
				return true;
			}
			res.setHeader("ETag", etag);
		}

		res.ct(getContentType(filePath, opts.utf8));
		res.setHeader("Content-Length", stats.size);
		if (req.method === "HEAD") {
			res.end();
			return true;
		}
		streamFile(res, filePath);
		return true;
	};

	return (req, res, next) => {
		if (req.method !== "GET" && req.method !== "HEAD") return next();

		const mount = normalizeMount(req.middleware.path);
		const relative = relativeToMount(mount, req.path);
		if (relative === null) return next();
		if (!isAllowedRelative(relative, !!opts.dotfiles)) return next();

		const root = path.resolve(dirPath);
		const filePath = path.resolve(root, `.${relative === "/" ? "" : relative}`);
		const rel = path.relative(root, filePath);
		if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel))
			return next();

		try {
			const stats = fs.statSync(filePath);
			if (stats.isFile()) {
				return serveFile(req, res, filePath, stats);
			}

			if (stats.isDirectory()) {
				const indexPath = path.join(filePath, "index.html");
				try {
					const indexStats = fs.statSync(indexPath);
					if (indexStats.isFile()) {
						if (!req.path.endsWith("/")) {
							res.redirect(req.path + "/");
							return true;
						}
						return serveFile(req, res, indexPath, indexStats);
					}
				} catch (e) {
					/* index.html not found, do nothing */
				}
			}
		} catch (e) {
			/* file/dir not found, proceed to check for .html */
		}

		try {
			const htmlPath = filePath + ".html";
			const htmlStats = fs.statSync(htmlPath);
			if (htmlStats.isFile()) return serveFile(req, res, htmlPath, htmlStats);
		} catch (e) {
			/* .html file not found, fall through to next() */
		}

		next();
	};
}
