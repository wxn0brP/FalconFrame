import fs from "fs";
import path from "path";
import { FFResponse } from "./res";
import { Cookies, FFRequest, RouteHandler } from "./types";

export function parseCookies(cookieHeader: string): Cookies {
    const cookies: Cookies = {};
    cookieHeader.split(";").forEach(cookie => {
        const [name, ...valueParts] = cookie.split("=");
        const value = decodeURIComponent(valueParts.join("=").trim());
        cookies[name.trim()] = value;
    });
    return cookies;
}

function _getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case ".html":
            return "text/html";
        case ".css":
            return "text/css";
        case ".js":
            return "application/javascript";
        case ".json":
            return "application/json";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".gif":
            return "image/gif";
        case ".svg":
            return "image/svg+xml";
        case ".ico":
            return "image/x-icon";
        case ".txt":
            return "text/plain";
        case ".pdf":
            return "application/pdf";
        default:
            return "application/octet-stream";
    }
}

export function getContentType(filePath: string, utf8 = false): string {
    let contentType = _getContentType(filePath);
    if (utf8) contentType += "; charset=utf-8";
    return contentType;
}

export function handleStaticFiles(dirPath: string, utf8 = true): RouteHandler {
    return (req: FFRequest, res: FFResponse, next: () => void) => {
        if (req.method.toLowerCase() !== "get") return next();
        const apiPath = req.middleware.path;
        const filePath = path.join(dirPath, req.path.replace(apiPath, ""));

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.ct(getContentType(filePath, utf8));
            fs.createReadStream(filePath).pipe(res);
            return true;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            const indexPath = path.join(filePath, "index.html");
            if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
                if (!req.path.endsWith("/")) {
                    res.redirect(req.path + "/");
                    return true;
                }
                res.ct(getContentType(indexPath, utf8));
                fs.createReadStream(indexPath).pipe(res);
                return true;
            }
        }

        const htmlPath = filePath + ".html";
        if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
            res.ct(getContentType(htmlPath, utf8));
            fs.createReadStream(htmlPath).pipe(res);
            return true;
        }

        next();
    }
}