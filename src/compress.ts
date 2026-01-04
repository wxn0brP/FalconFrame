import { createGzip, createDeflate } from "zlib";
import { FFResponse } from "./res";
import { Transform } from "stream";
import { FFRequest, RouteHandler } from "./types";

export function compression(req: FFRequest, res: FFResponse) {
    const encoding = req.headers["accept-encoding"];

    if (!encoding || typeof encoding !== "string" || res.headersSent) {
        return;
    }

    let compressionStream: Transform;
    let encodingType: string;

    if (/\bgzip\b/.test(encoding)) {
        encodingType = "gzip";
        compressionStream = createGzip();
    } else if (/\bdeflate\b/.test(encoding)) {
        encodingType = "deflate";
        compressionStream = createDeflate();
    } else {
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

    compressionStream.on("error", (err) => {
        if (!res.headersSent) {
            res.statusCode = 500;
            originalEnd.call(res);
        } else {
            res.destroy(err);
        }
    });

    res.on("close", () => {
        compressionStream.destroy();
    });

    // @ts-ignore
    res.write = (...args: any[]) => {
        const [chunk, encoding, cb] = args;
        const callback = typeof encoding === "function" ? encoding : cb;
        const enc = typeof encoding === "function" ? undefined : encoding;

        if (!res.headersSent) {
            res.writeHead(res.statusCode);
        }
        return compressionStream.write(chunk, enc, callback);
    };

    // @ts-ignore
    res.end = (...args: any[]) => {
        if (res.writableEnded) return res;

        const [chunk, encoding, cb] = args;
        let finalChunk = chunk;
        let finalCb = cb;
        let finalEncoding = encoding;

        if (typeof chunk === "function") {
            finalCb = chunk;
            finalChunk = undefined;
        } else if (typeof encoding === "function") {
            finalCb = encoding;
            finalEncoding = undefined;
        }

        if (finalCb) res.once("finish", finalCb);

        if (finalChunk) {
            res.write(finalChunk, finalEncoding);
        }
        compressionStream.end();
        return res;
    };
}

export const compressionMiddleware: RouteHandler = (req: FFRequest, res: FFResponse, next: () => void) => {
    compression(req, res);
    next();
}