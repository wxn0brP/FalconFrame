# Routing

Related concerns: [middleware.md](middleware.md), [req-res.md](req-res.md), [valid.md](valid.md), [static.md](static.md).

Routes are middleware registered for a specific method and path.

## Methods

| Method | Signature |
|--------|-----------|
| `app.get` | `get(path, ...handlers)` |
| `app.post` | `post(path, ...handlers)` |
| `app.put` | `put(path, ...handlers)` |
| `app.delete` | `delete(path, ...handlers)` |
| `app.patch` | `patch(path, ...handlers)` |
| `app.all` | `all(path, ...handlers)` |

All handlers except the last one are registered as path middleware, so they run before the final handler and can short-circuit the response:

```typescript
app.get("/admin", requireAuth, (req, res) => {
    res.json({ secret: true });
});
```

## Route params

Segments starting with `:` capture one path segment into `req.params`:

```typescript
app.get("/users/:id", (req, res) => {
    res.json({ id: req.params.id });
});
```

Param routes match paths with the same segment count, so `/users/:id/posts` matches `/users/7/posts` but not `/users/7`.

## Query strings

`req.query` holds parsed search params:

```typescript
// GET /search?q=falcon&page=2
app.get("/search", (req, res) => {
    res.json({ q: req.query.q, page: req.query.page });
});
```

## Return value shortcut

The final handler may return data directly instead of writing to `res`. A string is sent as text, an object as JSON. See [middleware.md](middleware.md).

```typescript
app.get("/status", () => ({ ok: true }));
```

## Raw body handling

`app.customParser()` registers a route whose body is not parsed by the built-in parsers. `req.body` is `{}` and `req.isBodyParsed` stays `false`, which makes `req.valid()` report an error instead of validating empty data:

```typescript
app.customParser("/upload", (req, res) => {
    // read and handle the raw stream yourself
    res.end("ok");
});
```

## Single files

`app.file()` serves one file under a route:

```typescript
app.file("/package.json", "./package.json");
```

## Mounted routers

```typescript
const api = app.router("/api");
api.get("/ping", (req, res) => res.json({ pong: true }));
```

Nested routers compose: a router mounted in another router inlines the full prefix.
