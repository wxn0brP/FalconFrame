import fs from "fs";
import path from "path";
import querystring from "querystring";
export function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(";").forEach(cookie => {
        const [name, ...valueParts] = cookie.split("=");
        const value = decodeURIComponent(valueParts.join("=").trim());
        cookies[name.trim()] = value;
    });
    return cookies;
}
export function parseBody(contentType, body) {
    if (contentType.includes("application/json")) {
        try {
            return JSON.parse(body);
        }
        catch {
            return {};
        }
    }
    else if (contentType.includes("application/x-www-form-urlencoded")) {
        return querystring.parse(body);
    }
    return {};
}
export function getContentType(filePath) {
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
        default:
            return "application/octet-stream";
    }
}
export function handleStaticFiles(apiPath, dirPath) {
    return (req, res, next) => {
        if (!req.path.startsWith(apiPath))
            return next();
        const filePath = path.join(dirPath, req.path.slice(apiPath.length));
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader("Content-Type", getContentType(filePath));
            fs.createReadStream(filePath).pipe(res);
            return true;
        }
        if (req.path.endsWith("/")) {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                const indexPath = path.join(filePath, "index.html");
                if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
                    res.setHeader("Content-Type", getContentType(indexPath));
                    fs.createReadStream(indexPath).pipe(res);
                    return true;
                }
            }
        }
        next();
    };
}
