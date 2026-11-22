import { createReadStream } from "fs";
import { isIP } from "net";
import { safe404, safe500 } from "./safe.js";
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
export function normalizeIp(ip) {
    const trimmed = ip.trim();
    return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
}
export function parseListenTarget(target) {
    if (typeof target === "object") {
        return {
            host: target.host,
            port: target.port,
        };
    }
    if (typeof target === "number")
        return {
            port: target,
        };
    const value = target.trim();
    const bracketed = /^\[([^\]]+)\](?::(\d+))?$/.exec(value);
    if (bracketed) {
        return {
            host: bracketed[1],
            port: bracketed[2] ? +bracketed[2] : 0,
        };
    }
    if (isIP(value))
        return {
            host: value,
            port: 0,
        };
    const colon = value.lastIndexOf(":");
    if (colon !== -1) {
        const portPart = value.slice(colon + 1);
        if (/^\d+$/.test(portPart)) {
            return {
                host: value.slice(0, colon),
                port: +portPart,
            };
        }
        return {
            host: value,
            port: 0,
        };
    }
    const port = +value;
    return Number.isNaN(port)
        ? {
            host: value,
            port: 0,
        }
        : {
            port,
        };
}
export function formatListenHost(host) {
    return host.includes(":") && !host.startsWith("[") ? `[${host}]` : host;
}
export function isLoopback(ip) {
    const value = normalizeIp(ip);
    return value === "::1" || value.startsWith("127.");
}
function forwardedIp(req) {
    const cf = req.headers["cf-connecting-ip"];
    if (typeof cf === "string" && cf)
        return cf;
    const trueClient = req.headers["true-client-ip"];
    if (typeof trueClient === "string" && trueClient)
        return trueClient;
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string")
        return forwarded.split(",")[0];
    if (Array.isArray(forwarded))
        return forwarded[0]?.split(",")[0];
    return undefined;
}
function trustsProxy(proxy, socketIp) {
    if (proxy === true)
        return true;
    if (proxy === false)
        return false;
    if (Array.isArray(proxy)) {
        return proxy.some(entry => normalizeIp(entry) === socketIp);
    }
    return isLoopback(socketIp);
}
function forwardedProto(req) {
    const header = req.headers["x-forwarded-proto"];
    const value = Array.isArray(header) ? header[0] : header;
    if (!value)
        return undefined;
    const proto = value.split(",")[0]?.trim().toLowerCase();
    return proto === "http" || proto === "https" ? proto : undefined;
}
export function resolveRequestInfo(req, proxy = "auto") {
    const socketIp = normalizeIp(req.socket.remoteAddress || "");
    const forwarded = forwardedIp(req);
    const trusted = trustsProxy(proxy, socketIp);
    const isProxied = trusted && !!forwarded;
    const protocol = (trusted ? forwardedProto(req) : undefined) ??
        (req.socket?.encrypted ? "https" : "http");
    return {
        socketIp,
        ip: isProxied ? normalizeIp(forwarded) : socketIp,
        isProxied,
        protocol,
    };
}
export function getIP(req, proxy = "auto") {
    return resolveRequestInfo(req, proxy).ip;
}
export function streamFile(res, filePath) {
    const stream = createReadStream(filePath);
    stream.on("error", (err) => {
        if (res.writableEnded)
            return;
        if (res.headersSent) {
            res.destroy(err);
            return;
        }
        res.removeHeader("content-length");
        res.removeHeader("content-encoding");
        if (err.code === "ENOENT") {
            safe404(res.req, res);
            return;
        }
        safe500(err, res.req, res);
        if (!res.writableEnded)
            res.end();
    });
    stream.pipe(res);
}
export const ensureLeadingDot = (str) => str.startsWith(".") ? str : "." + str;
