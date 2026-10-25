# Compression

Compression is an opt-in middleware. It compresses responses with Brotli, gzip or deflate depending on `Accept-Encoding`.

## Behavior

### Content negotiation

- Encodings are picked by `q` value, so `br;q=0` disables Brotli.
- `Vary: Accept-Encoding` is set on every response.
- `Cache-Control: no-transform` skips compression.
- `204` and `304` are skipped.

### Content types

| Skipped | Compressed |
|---------|------------|
| Images (except SVG) | Text |
| Video and audio | JSON and XML |
| Fonts | HTML and CSS |
| `text/event-stream` | YAML and TOML |
| `application/octet-stream` and `application/pdf` | Other textual types |
| Already compressed archives and `wasm` | |

### Size

Responses smaller than `threshold` are sent uncompressed when the length is known, either from a single `end()` call or from a `Content-Length` header.

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `threshold` | `1024` | Minimum size in bytes before compressing |
| `brotliQuality` | `4` | Brotli quality, 0-11 |
| `gzipLevel` | `6` | gzip/deflate level, 0-9 |

## Examples

### Middleware

```typescript
import { compressionMiddleware } from "@wxn0brp/falcon-frame";

app.use(compressionMiddleware);
```

### Custom options

```typescript
import { compression } from "@wxn0brp/falcon-frame";

app.use((req, res, next) => {
    compression(req, res, {
        threshold: 2048,
        brotliQuality: 5,
        gzipLevel: 6,
    });
    next();
});
```

### Only for specific routes

```typescript
app.get("/big", (req, res) => {
    compression(req, res);
    res.ct("application/json").end(payload);
});
```
