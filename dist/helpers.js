export { getContentType } from "./encoding.js";
export function parseCookies(cookieHeader) {
    const cookies = Object.create(null);
    cookieHeader.split(";").forEach(cookie => {
        const [name, ...valueParts] = cookie.split("=");
        const value = decodeURIComponent(valueParts.join("=").trim());
        cookies[name.trim()] = value;
    });
    return cookies;
}
export function getIP(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return (typeof forwarded === "string" ? forwarded : forwarded[0])
            .split(",")[0]
            .trim();
    }
    return req.socket.remoteAddress || "";
}
export const ensureLeadingDot = (str) => str.startsWith(".") ? str : "." + str;
