# CORS

Related concerns: [middleware.md](middleware.md), [proxy.md](proxy.md).

## Quick setup

`app.setOrigin()` registers a CORS middleware globally:

```typescript
app.setOrigin("*");
app.setOrigin(["https://app.example.com", "http://localhost:5173"]);
```

The middleware is applied with `app.use()`, so it runs for every request in registration order. Call it early.

## Behavior

- With `*` allowed, every request gets `Access-Control-Allow-Origin` echoing the request origin, or `*` when the request has no `Origin` header.
- With a list, the `Origin` header is checked against the patterns. Matching requests echo their own origin, others continue without the header.
- `OPTIONS` requests matching the allowlist are answered with `204` and never reach further middleware.
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS` and `Access-Control-Allow-Headers: Content-Type, Authorization, x-request-id` are set on every request handled by the middleware, regardless of origin.

## Origin patterns

| Pattern | Matches |
|---------|---------|
| `*` | Everything |
| `https://app.example.com` | Exact origin, case-insensitive |
| `*.example.com` | Subdomains of the domain, e.g. `app.example.com`. The bare domain does not match |
| `localhost:3000` | Exact host and port |
| `localhost:*` | Any port on the host |
| `RegExp` | Anything the regular expression tests |

## Manual setup

`createCORS()` builds the middleware directly, for custom headers or scoped mounting:

```typescript
import { createCORS } from "@wxn0brp/falcon-frame";

app.use(
    createCORS(["*.example.com", /^https:\/\/staging-\d+\.example\.com$/], {
        headers: {
            "Access-Control-Max-Age": "86400",
        },
    }),
);
```

| Option | Default | Description |
|--------|---------|-------------|
| `accessControlAllowMethods` | `true` | Sends the methods header |
| `accessControlAllowHeaders` | `true` | Sends the headers header |
| `headers` | - | Extra headers set on every request passing through the middleware |
