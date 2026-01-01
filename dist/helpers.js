import fs from "fs";
import path from "path";
export function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...valueParts] = cookie.split("=");
        const value = decodeURIComponent(valueParts.join("=").trim());
        cookies[name.trim()] = value;
    });
    return cookies;
}
const mimeTypes = {
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
function _getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || "application/octet-stream";
}
export function getContentType(filePath, utf8 = false) {
    let contentType = _getContentType(filePath);
    if (utf8)
        contentType += "; charset=utf-8";
    return contentType;
}
export function handleStaticFiles(dirPath, opts) {
    opts = {
        utf8: true,
        render: true,
        etag: true,
        errorIfDirNotFound: true,
        ...opts,
    };
    if (opts.errorIfDirNotFound && !fs.existsSync(dirPath)) {
        throw new Error(`Directory ${dirPath} does not exist`);
    }
    const serveFile = (req, res, filePath, stats) => {
        if (opts.render) {
            const defaultRenderer = res.FF.getVar("view engine");
            const renderStatement = (defaultRenderer && filePath.endsWith(ensureLeadingDot(defaultRenderer))) ||
                (!opts.notRenderHtml && filePath.endsWith(".html"));
            if (renderStatement) {
                res.render(filePath, {}, { notUseViews: true });
                return true;
            }
        }
        if (opts.etag) {
            const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;
            if (req.headers["if-none-match"] === etag) {
                res.status(304).end();
                return true;
            }
            res.setHeader("ETag", etag);
        }
        res.ct(getContentType(filePath, opts.utf8));
        fs.createReadStream(filePath).pipe(res);
        return true;
    };
    return (req, res, next) => {
        if (req.method.toLowerCase() !== "get")
            return next();
        const apiPath = req.middleware.path;
        const filePath = path.join(dirPath, req.path.replace(apiPath, ""));
        try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                return serveFile(req, res, filePath, stats);
            }
            if (stats.isDirectory()) {
                const indexPath = path.join(filePath, "index.html");
                try {
                    const indexStats = fs.statSync(indexPath);
                    if (indexStats.isFile()) {
                        if (!req.path.endsWith("/")) {
                            res.redirect(req.path + "/");
                            return true;
                        }
                        return serveFile(req, res, indexPath, indexStats);
                    }
                }
                catch (e) {
                    /* index.html not found, do nothing */
                }
            }
        }
        catch (e) {
            /* file/dir not found, proceed to check for .html */
        }
        try {
            const htmlPath = filePath + ".html";
            const htmlStats = fs.statSync(htmlPath);
            if (htmlStats.isFile())
                return serveFile(req, res, htmlPath, htmlStats);
        }
        catch (e) {
            /* .html file not found, fall through to next() */
        }
        next();
    };
}
export const ensureLeadingDot = (str) => (str.startsWith(".") ? str : "." + str);
