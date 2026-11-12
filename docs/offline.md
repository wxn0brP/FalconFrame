# Offline Requests

Related concerns: [middleware.md](middleware.md), [valid.md](valid.md).

`OfflineEngine` runs the full middleware chain, matching and error handling without opening a port. It is meant for testing routes and building integrations.

## Usage

The engine is exported from the package root. Construct it with an app instance and call `handle()` with a plain request object:

```typescript
import FalconFrame, { OfflineEngine } from "@wxn0brp/falcon-frame";

const app = new FalconFrame();
app.get("/users/:id", (req, res) => res.json({ id: req.params.id }));

const engine = new OfflineEngine(app);
const result = await engine.handle({ url: "/users/7" });

// { status: 200, headers: { "content-type": "application/json" }, body: { id: "7" } }
```

## Request

| Field | Default | Description |
|-------|---------|-------------|
| `url` | required | Path with optional query string, e.g. `/search?q=a` |
| `method` | `"GET"` | HTTP method, lowercase matching applies |
| `headers` | `{}` | Plain header object, lookup is case-insensitive |
| `body` | - | String passed to the matching parser, object serialized as JSON. Content type comes from the headers, `application/json` fallback |
| `cookies` | `{}` | Plain object, a `cookie` entry in it is parsed as a header |

## Response

| Field | Description |
|-------|-------------|
| `status` | Final status code |
| `headers` | Lowercased header map, `set-cookie` joined with commas |
| `body` | Parsed object for JSON responses, string otherwise |

## Behavior

- Matching, params, `req.valid()`, routers and returned values work exactly as with a live server, see [middleware.md](middleware.md).
- A request matching nothing, or a chain exhausted by `next()`, returns the `404` handler's response.
- Handler errors return the `500` handler's response.
- Body parsing reuses the app's registered parsers, so custom parsers added with `app.addBodyParser()` are honored.
- Streaming features such as static files, compression and SSE are not available offline.
