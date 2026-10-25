import { Transform } from "stream";
import {
	constants as zlibConstants,
	createBrotliCompress,
	createDeflate,
	createGzip,
} from "zlib";
import { FFResponse } from "./res";
import { CompressionOptions, FFRequest, RouteHandler } from "./types";

function isCompressible(contentType: string) {
	if (!contentType) return true;
	const type = contentType.split(";")[0].trim().toLowerCase();
	if (/^image\/(?!svg\+xml)/.test(type)) return false;
	if (/^(video|audio)\//.test(type)) return false;
	if (/^font\//.test(type)) return false;
	if (type === "text/event-stream") return false;
	if (type === "application/octet-stream" || type === "application/pdf")
		return false;
	if (
		/^application\/(zip|gzip|x-gzip|x-bzip|x-bzip2|x-xz|x-rar|x-7z|x-tar|x-compress|wasm)$/.test(
			type,
		)
	)
		return false;
	return true;
}

type Encoding = "br" | "gzip" | "deflate";

const preference: Record<Encoding, number> = {
	br: 0,
	gzip: 1,
	deflate: 2,
};

function pickEncoding(header: unknown): Encoding | null {
	if (typeof header !== "string" || !header) return null;

	const encodings: Map<Encoding, number> = new Map();
	let wildcardQ = -1;

	for (const part of header.split(",")) {
		const [rawName, ...params] = part.trim().split(";");
		const name = rawName.trim().toLowerCase();

		let q = 1;
		for (const param of params) {
			const [key, value] = param.trim().split("=");
			if (key?.toLowerCase() === "q") {
				const parsed = Number.parseFloat(value);
				q = Number.isNaN(parsed) ? 0 : parsed;
			}
		}

		if (name === "*") {
			wildcardQ = q;
		} else if (name === "br" || name === "gzip" || name === "deflate") {
			encodings.set(name, q);
		}
	}

	if (wildcardQ >= 0) {
		if (!encodings.has("br")) encodings.set("br", wildcardQ);
		if (!encodings.has("gzip")) encodings.set("gzip", wildcardQ);
		if (!encodings.has("deflate")) encodings.set("deflate", wildcardQ);
	}

	let best: Encoding | null = null;
	let bestQ = 0;
	let bestRank = Number.POSITIVE_INFINITY;

	for (const [name, q] of encodings) {
		if (q <= 0) continue;
		const rank = preference[name];
		if (q > bestQ || (q === bestQ && rank < bestRank)) {
			best = name;
			bestQ = q;
			bestRank = rank;
		}
	}

	return best;
}

function appendVary(res: FFResponse, value: string) {
	const current = res.getHeader("vary");
	if (!current) {
		res.setHeader("vary", value);
		return;
	}
	const values = String(current)
		.split(",")
		.map(item => item.trim().toLowerCase());
	if (!values.includes(value.toLowerCase())) {
		res.setHeader("vary", `${current}, ${value}`);
	}
}

export function compression(
	req: FFRequest,
	res: FFResponse,
	opts: CompressionOptions = {},
) {
	if (req._compression) return;
	req._compression = true;

	if (res.headersSent) return;

	const threshold = opts.threshold ?? 1024;
	const cacheControl = String(
		res.getHeader("cache-control") || "",
	).toLowerCase();
	if (cacheControl.includes("no-transform")) return;

	const encodingType = pickEncoding(req.headers["accept-encoding"]);
	if (!encodingType) return;

	appendVary(res, "Accept-Encoding");

	const createCompressor = (): Transform => {
		if (encodingType === "br") {
			return createBrotliCompress({
				params: {
					[zlibConstants.BROTLI_PARAM_QUALITY]: opts.brotliQuality ?? 4,
				},
			});
		}
		const level = opts.gzipLevel ?? 6;
		return encodingType === "gzip"
			? createGzip({
					level,
				})
			: createDeflate({
					level,
				});
	};

	const originalWrite = res.write;
	const originalEnd = res.end;
	let compressionStream: Transform | null = null;
	let initialized = false;

	const usable = () => {
		if (res.statusCode === 204 || res.statusCode === 304) return false;
		if (!isCompressible(String(res.getHeader("content-type") || "")))
			return false;
		const length = res.getHeader("content-length");
		if (length !== undefined && Number(length) < threshold) return false;
		return true;
	};

	const init = (): boolean => {
		if (initialized) return compressionStream !== null;
		initialized = true;
		if (!usable()) return false;

		compressionStream = createCompressor();
		res.setHeader("Content-Encoding", encodingType);
		res.removeHeader("Content-Length");

		compressionStream.on("data", chunk => {
			originalWrite.call(res, chunk);
		});
		compressionStream.on("end", () => {
			originalEnd.call(res);
		});
		compressionStream.on("error", err => {
			res.write = originalWrite;
			res.end = originalEnd;

			if (res.headersSent) {
				res.destroy(err);
				return;
			}

			res.status(500);
			res.FF._500(err, req, res);
			if (!res.writableEnded) res.end();
		});
		res.on("close", () => {
			compressionStream?.destroy();
		});

		return true;
	};

	const restore = () => {
		res.write = originalWrite;
		res.end = originalEnd;
	};

	// @ts-ignore
	res.write = (...args: any[]) => {
		const [chunk, encoding, cb] = args;
		const callback = typeof encoding === "function" ? encoding : cb;
		const enc = typeof encoding === "function" ? undefined : encoding;

		if (!res.headersSent) {
			if (!init()) {
				restore();
				res.writeHead(res.statusCode);
				return originalWrite.call(res, chunk, enc, callback);
			}
			res.writeHead(res.statusCode);
		}

		if (!compressionStream) {
			restore();
			return originalWrite.call(res, chunk, enc, callback);
		}

		return compressionStream.write(chunk, enc, callback);
	};

	// @ts-ignore
	res.end = (...args: any[]) => {
		if (res.writableEnded) return res;

		const [chunk, encoding, cb] = args;
		let finalChunk = chunk;
		let finalCb = cb;
		let finalEncoding = encoding;

		if (typeof chunk === "function") {
			finalCb = chunk;
			finalChunk = undefined;
		} else if (typeof encoding === "function") {
			finalCb = encoding;
			finalEncoding = undefined;
		}

		// Single-shot response: honour the threshold before compressing.
		if (!res.headersSent && !initialized && finalChunk !== undefined) {
			const buffer = Buffer.isBuffer(finalChunk)
				? finalChunk
				: Buffer.from(finalChunk, finalEncoding);
			const length = res.getHeader("content-length");
			const tooSmall =
				buffer.length < threshold &&
				(length === undefined || Number(length) < threshold);

			if (tooSmall || !init()) {
				restore();
				if (finalCb) res.once("finish", finalCb);
				return originalEnd.call(res, buffer, finalEncoding);
			}

			if (finalCb) res.once("finish", finalCb);
			res.writeHead(res.statusCode);
			compressionStream!.write(buffer);
			compressionStream!.end();
			return res;
		}

		if (!res.headersSent) {
			if (!init()) {
				restore();
				if (finalCb) res.once("finish", finalCb);
				if (finalChunk !== undefined) {
					originalWrite.call(res, finalChunk, finalEncoding);
				}
				originalEnd.call(res);
				return res;
			}
			res.writeHead(res.statusCode);
		}

		if (finalCb) res.once("finish", finalCb);

		if (!compressionStream) {
			restore();
			return originalEnd.call(res, finalChunk, finalEncoding);
		}

		if (finalChunk !== undefined) {
			res.write(finalChunk, finalEncoding);
		}
		compressionStream.end();
		return res;
	};
}

export const compressionMiddleware: RouteHandler = (
	req: FFRequest,
	res: FFResponse,
	next: () => void,
) => {
	compression(req, res);
	next();
};
