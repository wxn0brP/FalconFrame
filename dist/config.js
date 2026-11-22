import { parseLimit } from "./body-utils.js";
export function isDebugEnabled(enabled) {
    if (enabled !== undefined)
        return enabled;
    return !(process.env.NODE_ENV === "production" &&
        !process.env.FF_DEBUG_PRODUCTION_ENABLED);
}
export function resolveConfig(opts = {}) {
    const debugOption = opts.debug;
    const debug = typeof debugOption === "object" && debugOption !== null ? debugOption : {};
    const enabled = debugOption === false ? false : debugOption === true ? true : debug.enabled;
    return {
        proxy: opts.proxy ?? "auto",
        bodyLimit: parseLimit(opts.bodyLimit ?? "10m"),
        bodyTimeout: opts.bodyTimeout ?? 60_000,
        defaultBodyParser: opts.defaultBodyParser ?? "json",
        untrustedBodyParsers: opts.untrustedBodyParsers ?? false,
        xRequestId: opts.xRequestId,
        disableParser: opts.disableParser,
        debug: {
            enabled,
            pass: debug.pass ?? process.env.FF_DEBUG_PASS,
            path: debug.path ?? debug.url ?? "/debug",
            rateLimit: debug.rateLimit ?? true,
            hosts: debug.hosts ?? [],
        },
    };
}
