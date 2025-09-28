export function createSecurityPlugin() {
    return {
        id: "security",
        process: (req, res, next) => {
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "SAMEORIGIN");
            res.setHeader("Referrer-Policy", "no-referrer");
            res.setHeader("X-XSS-Protection", "1; mode=block");
            res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            next();
        },
        after: "cors",
    };
}
