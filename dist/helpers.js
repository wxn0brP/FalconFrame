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
function _getContentType(filePath) {
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
export function getContentType(filePath, utf8 = false) {
    let contentType = _getContentType(filePath);
    if (utf8)
        contentType += "; charset=utf-8";
    return contentType;
}
export function handleStaticFiles(dirPath, utf8 = true) {
    return (req, res, next) => {
        if (req.method.toLowerCase() !== "get")
            return next();
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
    };
}
