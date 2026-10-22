import { Cookies, FFRequest } from "./types";
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

export function getIP(req: FFRequest) {
	const forwarded = req.headers["x-forwarded-for"];
	if (forwarded) {
		return (typeof forwarded === "string" ? forwarded : forwarded[0])
			.split(",")[0]
			.trim();
	}
	return req.socket.remoteAddress || "";
}

export const ensureLeadingDot = (str: string) =>
	str.startsWith(".") ? str : "." + str;
