import { readFileSync } from "fs";
function readFile(path) {
    try {
        return readFileSync(path);
    }
    catch (err) {
        throw new Error(`[FF] Cannot read TLS file "${path}": ${err?.message ?? err}`);
    }
}
function parsePort(value) {
    if (value === undefined)
        return 443;
    return +value;
}
export function resolveHTTPSConfig() {
    const key = process.env.HTTPS_KEY;
    const cert = process.env.HTTPS_CERT;
    if (!key && !cert)
        return undefined;
    if (!key || !cert) {
        throw new Error("[FF] HTTPS_KEY and HTTPS_CERT must be set together");
    }
    const options = {
        key: readFile(key),
        cert: readFile(cert),
    };
    if (process.env.HTTPS_CA)
        options.ca = readFile(process.env.HTTPS_CA);
    if (process.env.HTTPS_PASSPHRASE)
        options.passphrase = process.env.HTTPS_PASSPHRASE;
    return {
        port: parsePort(process.env.HTTPS_PORT),
        options,
    };
}
