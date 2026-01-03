import { createGzip, createDeflate } from "zlib";
export function compression(req, res) {
    const encoding = req.headers["accept-encoding"];
    if (!encoding || typeof encoding !== "string" || res.headersSent) {
        return;
    }
    let compressionStream;
    let encodingType;
    if (/\bgzip\b/.test(encoding)) {
        encodingType = "gzip";
        compressionStream = createGzip();
    }
    else if (/\bdeflate\b/.test(encoding)) {
        encodingType = "deflate";
        compressionStream = createDeflate();
    }
    else {
        return;
    }
    res.setHeader("Content-Encoding", encodingType);
    res.removeHeader("Content-Length");
    const originalWrite = res.write;
    const originalEnd = res.end;
    compressionStream.on("data", (chunk) => {
        originalWrite.call(res, chunk);
    });
    compressionStream.on("end", () => {
        originalEnd.call(res);
    });
    // @ts-ignore
    res.write = (chunk, encoding) => {
        if (!res.headersSent) {
            res.writeHead(res.statusCode);
        }
        return compressionStream.write(chunk, encoding);
    };
    // @ts-ignore
    res.end = (chunk, encoding) => {
        if (res.writableEnded) {
            return res;
        }
        if (chunk) {
            // @ts-ignore
            res.write(chunk, encoding);
        }
        compressionStream.end();
        return res;
    };
}
export function compressionMiddleware() {
    return (req, res, next) => {
        compression(req, res);
        next();
    };
}
