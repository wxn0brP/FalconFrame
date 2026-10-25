# Configuration

All framework options are passed to the constructor. Related concerns live in their own pages: [debug.md](debug.md), [proxy.md](proxy.md), [compression.md](compression.md), [render.md](render.md), [valid.md](valid.md).

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `loggerOpts` | - | Options passed to the logger |
| `proxy` | `"auto"` | Client IP resolution behind a proxy. See [proxy.md](proxy.md) |
| `bodyLimit` | `"10m"` | Maximum request body size |
| `bodyTimeout` | `60000` | Body read timeout in milliseconds |
| `defaultBodyParser` | `"json"` | Parser used when a request has no `Content-Type`, `false` disables |
| `untrustedBodyParsers` | `false` | Enable YAML, TOML and JSON5 request bodies |
| `disableParser` | - | Disable individual parsers |
| `debug` | - | Debug panel, `true`/`false` or an options object. See [debug.md](debug.md) |
| `xRequestId` | - | `x-request-id` header handling, `"auto"` generates ids, `"disable"` turns it off |

## Body Parsing

### Selection

| `Content-Type` | Behavior |
|----------------|----------|
| Registered parser | Body is parsed, `req.isBodyParsed` is `true` |
| Unknown | Body is not parsed, `req.body` is `{}` |
| Missing | `defaultBodyParser` is used, `"json"` by default |

### Built-in parsers

| Parser | Content-Type | Default |
|--------|--------------|---------|
| JSON | `application/json` | enabled |
| URL encoded | `application/x-www-form-urlencoded` | enabled |
| Text | `text/plain` | enabled |
| JSON5 | `application/json5` | `untrustedBodyParsers` |
| YAML | `application/yaml` | `untrustedBodyParsers` |
| TOML | `application/toml` | `untrustedBodyParsers` |

YAML, TOML and JSON5 parse untrusted input with rich formats, so they are opt-in:

```typescript
const app = new FalconFrame({ untrustedBodyParsers: true });
```

### Errors

An unparsed body makes `req.valid(...)` return an error instead of silently accepting empty data.

| Case | Status | Handler |
|------|--------|---------|
| Body exceeds `bodyLimit` | `413` | `set413` |
| Body read exceeds `bodyTimeout` | `408` | `set408` |
| File read error | `404` / `500` | `set404` / `set500` |
| Unhandled error in a handler | `500` | `set500` |

Requests with `408` or `413` never continue to the route handler.

```typescript
app.set413((req, res) => res.status(413).json({ error: "Too large" }));
app.set408((req, res) => res.status(408).json({ error: "Timeout" }));
```

## Examples

### Production setup

```typescript
import FalconFrame from "@wxn0brp/falcon-frame";

const app = new FalconFrame({
    proxy: ["10.0.0.5"],
    bodyLimit: "512k",
    bodyTimeout: 15000,
    defaultBodyParser: false,
    debug: { pass: process.env.DEBUG_PASS },
});

app.debug();
```

### Custom parsers and handlers

```typescript
app.addBodyParser("application/vnd.api+json", parser, { limit: "64k" });

app.set404((req, res) => res.status(404).json({ error: "Not found" }));
app.set413((req, res) => res.status(413).json({ error: "Too large" }));
app.set408((req, res) => res.status(408).json({ error: "Timeout" }));
app.set500((err, req, res) => res.status(500).json({ error: "Server error" }));
```
