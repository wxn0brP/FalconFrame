# Configuration

Related concerns: [debug.md](debug.md), [proxy.md](proxy.md), [compression.md](compression.md), [render.md](render.md), [static.md](static.md), [valid.md](valid.md).

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
| Validation errors formatting | `400` | `set400Formatter` |

All error handlers live on `app.errorHandlers` (`ErrorHandlers` instance):

```typescript
app.errorHandlers.set413((req, res) => res.status(413).json({ error: "Too large" }));
app.errorHandlers.set408((req, res) => res.status(408).json({ error: "Timeout" }));
```

The top-level `app.set413(...)` methods and `app._413` fields are deprecated
but still delegate to `app.errorHandlers`.

### API (JSON) error handlers

API endpoints should return JSON errors, not HTML pages. FalconFrame picks a
dedicated handler set for such requests — no `try/catch` needed in handlers.

| Case | Status | JSON handler |
|------|--------|--------------|
| Body exceeds `bodyLimit` | `413` | `set413Api` |
| Body read exceeds `bodyTimeout` | `408` | `set408Api` |
| File read error | `404` / `500` | `set404Api` / `set500Api` |
| Unhandled error in a handler | `500` | `set500Api` |

The JSON handlers have defaults (`{ err: true, msg: "..." }`) and can be overridden:

```typescript
app.errorHandlers.set500Api((err, req, res) =>
	res.json({ err: true, msg: "Server error" }),
);
```

A request is treated as API when:

1. the route was registered on a sub-router created with `router()` — those are
   API by default. Pass `{ api: false }` for routers serving HTML pages;
2. the client explicitly sends `Accept: application/json`.

An explicit `Accept: text/html` request (a browser navigation) always receives
the regular HTML error response, even on api routers.

```typescript
const app = new FalconFrame();

const api = app.router("/api"); // api by default
api.get("/users", handler); // thrown errors -> JSON 500

const pages = app.router("/pages", { api: false }); // HTML errors
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
