import { createBrotliCompress, createDeflate, createGzip } from "zlib";
function isCompressible(contentType) {
    if (!contentType)
        return true;
    const type = contentType.split(";")[0].trim().toLowerCase();
    if (/^image\/(?!svg\+xml)/.test(type))
        return false;
    if (/^(video|audio)\//.test(type))
        return false;
    if (type === "text/event-stream")
        return false;
    if (/^application\/(zip|gzip|x-gzip|x-bzip|x-bzip2|x-xz|x-rar|x-7z|x-tar|x-compress|wasm)$/.test(type))
        return false;
    return true;
}
export function compression(req, res) {
    if (req._compression)
        return;
    req._compression = true;
    const encoding = req.headers["accept-encoding"];
    if (!encoding || typeof encoding !== "string" || res.headersSent) {
        return;
    }
    let createCompressor;
    let encodingType;
    if (/\bbr\b/.test(encoding)) {
        encodingType = "br";
        createCompressor = createBrotliCompress;
    }
    else if (/\bgzip\b/.test(encoding)) {
        encodingType = "gzip";
        createCompressor = createGzip;
    }
    else if (/\bdeflate\b/.test(encoding)) {
        encodingType = "deflate";
        createCompressor = createDeflate;
    }
    else {
        return;
    }
    const originalWrite = res.write;
    const originalEnd = res.end;
    let compressionStream = null;
    let initialized = false;
    function init() {
        if (initialized)
            return compressionStream !== null;
        initialized = true;
        const contentType = res.getHeader("content-type");
        if (!isCompressible(contentType))
            return false;
        compressionStream = createCompressor();
        res.setHeader("Content-Encoding", encodingType);
        res.removeHeader("Content-Length");
        compressionStream.on("data", chunk => {
            originalWrite.call(res, chunk);
        });
        compressionStream.on("end", () => {
            originalEnd.call(res);
        });
        compressionStream.on("error", err => {
            if (!res.headersSent) {
                res.statusCode = 500;
                originalEnd.call(res);
            }
            else {
                res.destroy(err);
            }
        });
        res.on("close", () => {
            compressionStream.destroy();
        });
        return true;
    }
    // @ts-ignore
    res.write = (...args) => {
        const [chunk, encoding, cb] = args;
        const callback = typeof encoding === "function" ? encoding : cb;
        const enc = typeof encoding === "function" ? undefined : encoding;
        if (!res.headersSent) {
            if (!init()) {
                res.write = originalWrite;
                res.end = originalEnd;
                res.writeHead(res.statusCode);
                return originalWrite.call(res, chunk, enc, callback);
            }
            res.writeHead(res.statusCode);
        }
        return compressionStream.write(chunk, enc, callback);
    };
    // @ts-ignore
    res.end = (...args) => {
        if (res.writableEnded)
            return res;
        const [chunk, encoding, cb] = args;
        let finalChunk = chunk;
        let finalCb = cb;
        let finalEncoding = encoding;
        if (typeof chunk === "function") {
            finalCb = chunk;
            finalChunk = undefined;
        }
        else if (typeof encoding === "function") {
            finalCb = encoding;
            finalEncoding = undefined;
        }
        if (!res.headersSent) {
            if (!init()) {
                res.write = originalWrite;
                res.end = originalEnd;
                if (finalCb)
                    res.once("finish", finalCb);
                if (finalChunk)
                    originalWrite.call(res, finalChunk, finalEncoding);
                originalEnd.call(res);
                return res;
            }
        }
        if (finalCb)
            res.once("finish", finalCb);
        if (finalChunk) {
            res.write(finalChunk, finalEncoding);
        }
        compressionStream.end();
        return res;
    };
}
export const compressionMiddleware = (req, res, next) => {
    compression(req, res);
    next();
};
