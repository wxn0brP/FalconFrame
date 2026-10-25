# Debug Panel

The debug panel is a request inspector that streams every request to a small web page over Server-Sent Events. It is mounted with `app.debug()` and is protected by a token by default.

## Behavior

### Authorization

- Without a configured secret, a random token is generated at startup and printed once by `listen()`.
- The token can be passed as `?pass=...`, as `Authorization: Bearer ...`, or exchanged for the `ff_debug` cookie.
- A query token is moved into an `HttpOnly` cookie and removed from the URL with a `303` redirect, so it does not stay in history or in the `Referer` header.
- The cookie uses `SameSite=Strict`, `Secure` on HTTPS, and `Path=/debug`.
- Failed attempts are throttled to 5 per 15 minutes per client IP.
- The client IP is never treated as trusted. Loopback peers are not special, because local proxies and tunnels make remote traffic look like `127.0.0.1`.

### Availability

- Outside production the panel is enabled by default.
- In production it stays off unless `debug.enabled` is set or `FF_DEBUG_PRODUCTION_ENABLED` is truthy.
- Disabled panels are not mounted, so they fall through to other routes.

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `path` | `"/debug"` | URL path of the panel |
| `pass` | generated | Stable secret instead of a random token |
| `enabled` | `NODE_ENV !== "production"` | Force the panel on or off |
| `hosts` | `[]` | Optional extra allowlist of client IPs |
| `rateLimit` | `true` | Throttle failed attempts |

### What is recorded

Method, URL, headers, cookies, query, body, status, duration and time. Binary responses are skipped, so large files are not streamed to the panel.

## Examples

### Basic

```typescript
import FalconFrame from "@wxn0brp/falcon-frame";

const app = new FalconFrame();
app.debug();
app.l(3000);
```

Startup output:

```
[FF] Debug panel: http://localhost:3000/debug?pass=<token>
```

### Stable secret

```typescript
const app = new FalconFrame({
    debug: { pass: process.env.DEBUG_PASS },
});

app.debug();
```

Or from the mount point:

```typescript
app.debug({ pass: "change-me" });
```

### Production

```typescript
const app = new FalconFrame({
    debug: { enabled: true, pass: process.env.DEBUG_PASS },
});
```

Set `FF_DEBUG_PRODUCTION_ENABLED=1` to enable the panel without changing code.

### Custom path and hosts

```typescript
app.debug({
    path: "/_debug",
    hosts: ["10.0.0.5"],
});
```

### Standalone router

```typescript
import { createDebug } from "@wxn0brp/falcon-frame";

app.use(createDebug({ pass: "..." }));
```

`createDebug()` without `pass` generates and prints its own token. `app.debug()` is preferred, because it also prints the full URL on `listen()`. A `debug.pass` set on the constructor is applied by `app.debug()`; pass `pass` directly when mounting `createDebug()` yourself.
