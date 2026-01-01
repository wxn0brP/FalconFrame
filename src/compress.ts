import { createGzip, createDeflate } from "zlib";
import { FFResponse } from "./res";
import { Transform } from "stream";
import { FFRequest } from "./types";

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

    // @ts-ignore
    res.write = (chunk: any, encoding?: BufferEncoding) => {
        if (!res.headersSent) {
            res.writeHead(res.statusCode);
        }
        return compressionStream.write(chunk, encoding);
    };

    // @ts-ignore
    res.end = (chunk?: any, encoding?: BufferEncoding) => {
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
    return (req: FFRequest, res: FFResponse, next: () => void) => {
        compression(req, res);
        next();
    };
}