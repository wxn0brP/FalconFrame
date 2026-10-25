# Client IP and Proxies

FalconFrame resolves the client address on every request. The `proxy` option decides whether proxy headers are trusted.

## Behavior

### Why loopback is not trusted

A reverse proxy or tunnel on the same host connects to the application from `127.0.0.1`. Treating loopback as "local admin" would expose anything guarded by IP, because every remote request through the proxy would look local.

### Modes

| Value | Behavior |
|-------|----------|
| `"auto"` (default) | Trust `CF-Connecting-IP`, `True-Client-IP` or the first `X-Forwarded-For` entry only when the TCP peer is loopback |
| `true` | Trust proxy headers from any peer |
| `false` | Never trust proxy headers |
| `string[]` | Trust proxy headers only when the TCP peer matches one of the listed addresses |

Header order: `CF-Connecting-IP`, `True-Client-IP`, `X-Forwarded-For`.

### Request fields

| Field | Meaning |
|-------|---------|
| `req.socketIp` | Raw TCP peer address |
| `req.ip` | Resolved client address, based on the `proxy` option |
| `req.isProxied` | `true` when proxy headers were used to resolve `req.ip` |

## Examples

### Cloudflare Tunnel

`cloudflared` runs on the same host and connects from `127.0.0.1`.

```typescript
const app = new FalconFrame(); // proxy: "auto"
```

No configuration is required. `CF-Connecting-IP` is used and `req.ip` is the real client.

### Remote proxy

Cloudflare proxy without a tunnel, or nginx on another machine:

```typescript
const app = new FalconFrame({ proxy: true });
```

Use `true` only when the origin is not reachable directly from the internet. Otherwise list the addresses:

```typescript
const app = new FalconFrame({
    proxy: ["10.0.0.5", "192.168.1.10"],
});
```

### Direct exposure

Ignore all proxy headers:

```typescript
const app = new FalconFrame({ proxy: false });
```

### Docker bridge

The TCP peer is the bridge gateway, not loopback, so `"auto"` keeps the gateway address. Use `proxy: true` or list the gateway when the container is not reachable directly.

```typescript
const app = new FalconFrame({ proxy: true });
```

### Reading the address

```typescript
app.use((req, res, next) => {
    console.log(req.ip, req.socketIp, req.isProxied);
    next();
});
```
