import { FFResponse } from "./res";
import type { FFRequest } from "./types";

export function parseLimit(limit: string | number): number {
	if (!limit) return 0;
	if (typeof limit === "number") return limit;
	if (typeof limit !== "string") return 0;

	const match = limit
		.toLowerCase()
		.replace(/b$/, "")
		.match(/^(\d+)([kmg])?$/);
	if (!match) throw new Error(`Invalid body limit: ${limit}`);

	const num = parseInt(match[1], 10);
	const unit = match[2]?.toLowerCase();

	switch (unit) {
		case "k":
			return num * 1024;
		case "m":
			return num * 1024 * 1024;
		case "g":
			return num * 1024 * 1024 * 1024;
		default:
			return num;
	}
}

export function getContentType(req: FFRequest): string | undefined {
	return req.headers["content-type"]?.split(";")[0].toLowerCase();
}

export function getRawBody(
	req: FFRequest,
	res: FFResponse,
	limit: number,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		let total = 0;

		req.on("data", chunk => {
			const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			total += buf.length;
			if (limit && total > limit) {
				res.status(413);
				res.FF._413(req, res);
				req.destroy();
				return reject(new Error("Payload Too Large"));
			}
			chunks.push(buf);
		});

		req.on("end", () => {
			resolve(Buffer.concat(chunks).toString());
		});

		req.on("error", err => {
			reject(err);
		});
	});
}
