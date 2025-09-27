import FalconFrame from ".";
import { FFRequest, ParseBody, ParseBodyFunction } from "./types";
import querystring from "querystring";

const parseBodyFunctions: Record<string, ParseBodyFunction> = {
	"application/json": async (body: string) => ({ body: JSON.parse(body) }),
	"application/x-www-form-urlencoded": async (body: string) => ({
		body: querystring.parse(body),
	}),
};

export async function parseBody(
	req: FFRequest,
	body: string,
	FF: FalconFrame,
	type: string
): Promise<ParseBody> {
	const limit = parseLimit(FF.opts.bodyLimit);

	try {
		if (limit && body.length > limit) {
			await FF.logger.warn(`Body size exceeds limit of ${limit} bytes`);
			return {};
		}

		const func = getParser(FF, type);
		if (!func) return {};

		const data = await func(body, req, FF);

		if (!data || typeof data !== "object") return {};

		return data;
	} catch (e) {
		await FF.logger.warn(`Error parsing body: ${e}`);
		return {};
	}
}

export function getParser(FF: FalconFrame, type: string): ParseBodyFunction | undefined {
	return FF.customParsers?.[type] || parseBodyFunctions[type] || undefined;
}

function parseLimit(limit: string | number): number {
	if (!limit) return 0;
	if (typeof limit === "number") return limit;
	if (typeof limit !== "string") return 0;

	const match = limit.match(/^(\d+)([kmg])?$/i);
	if (!match) return 0;

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
