import path from "path";
import { Cookies } from "./types";

export function parseCookies(cookieHeader: string): Cookies {
    const cookies: Cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...valueParts] = cookie.split("=");
        const value = decodeURIComponent(valueParts.join("=").trim());
        cookies[name.trim()] = value;
    });
    return cookies;
}

const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
    ".pdf": "application/pdf",
};

function _getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || "application/octet-stream";
}

export function getContentType(filePath: string, utf8 = false): string {
    let contentType = _getContentType(filePath);
    if (utf8) contentType += "; charset=utf-8";
    return contentType;
}

export const ensureLeadingDot = (str: string) => (str.startsWith(".") ? str : "." + str);
