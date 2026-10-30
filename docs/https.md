# HTTPS

HTTPS is configured with environment variables and started by `app.l()`.
`app.listen()` stays plain HTTP: it runs one server, while `l()` can run both.

## Environment

| Variable | Description |
|----------|-------------|
| `HTTPS_KEY` | Path to the private key |
| `HTTPS_CERT` | Path to the certificate |
| `HTTPS_PORT` | HTTPS port, defaults to `443` |
| `HTTPS_CA` | Optional path to the CA chain |
| `HTTPS_PASSPHRASE` | Optional private key passphrase |

`HTTPS_KEY` and `HTTPS_CERT` must be set together. Only one of them throws a clear error at startup.
When both are missing, HTTPS is not started and `app.l()` behaves exactly as before.

HTTP still uses `PORT` (or the argument passed to `l()`).

## Usage

```bash
PORT=3000 \
HTTPS_PORT=3443 \
HTTPS_KEY=./certs/key.pem \
HTTPS_CERT=./certs/cert.pem \
bun run start
```

```ts
import FalconFrame from "@wxn0brp/falcon-frame";

const app = new FalconFrame();

app.get("/", (req, res) => res.json({
  protocol: req.protocol,
  secure: req.secure,
}));

app.l(3000);
```

```
[FF] Server running on http://localhost:3000
[FF] Server running on https://localhost:3443
```

Both servers share the same application and middleware. The HTTP server is returned from `l()`,
the HTTPS server is available as `app.httpsServer`.

## Request protocol

`req.protocol` and `req.secure` describe how the request arrived:

| Situation | `req.protocol` | `req.secure` |
|-----------|----------------|--------------|
| Plain HTTP | `"http"` | `false` |
| Direct TLS | `"https"` | `true` |
| Trusted proxy with `x-forwarded-proto: https` | `"https"` | `true` |

Proxy headers are only trusted according to the [`proxy`](proxy.md) option.
