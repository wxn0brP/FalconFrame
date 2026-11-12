# Middleware

Related concerns: [routing.md](routing.md), [config.md](config.md), [valid.md](valid.md), [static.md](static.md).

Middleware is the core execution model. Every route, static mount and plugin is a middleware entry that is matched against the request path and method, then run in registration order.

## Registration

```typescript
app.use(handler); // matches every path
app.use("/api", handler); // matches every path under /api
app.get("/users/:id", handler); // exact route with params
```

`app.use()` accepts a plain handler, a `Router` instance or a plugin object exposing `getRouteHandler()`. Handlers registered on a route with `app.get(path, a, b, handler)` run in order: `a` and `b` are registered as path middleware, the last one is the route handler.

## Matching

1. All registered entries are flattened: nested routers are inlined with their mount prefix.
2. Entries are filtered by method: `"get"`, `"post"`, `"put"`, `"delete"`, `"patch"` or `"all"`.
3. Entries are filtered by path:

| Pattern | Matches |
|---------|---------|
| `/users` | `/users` only |
| `/api` with `use` | `/api` and every subpath (`/api/users`, `/api/users/1`) |
| `/files/*` with `use` | `/files` and every subpath |
| `/users/:id` | any path with the same segment count, e.g. `/users/7` |

A request that matches nothing goes straight to the `404` handler.

## Execution

Matched entries run as a chain. Each handler receives `(req, res, next)`:

- Call `next()` to pass control to the next matched entry. `next()` returns a `Promise` that resolves when the rest of the chain has finished, so `await next()` runs code after downstream handlers complete.
- Call `next()` only once per handler. A second call throws `next() called multiple times`, which is reported as a normal middleware error.
- When the response has already ended, `next()` is a no-op.
- A handler that does not respond must call `next()`, otherwise the response stays open.
- If the last matched entry calls `next()`, the `404` handler runs.

```typescript
app.use("/api", async (req, res, next) => {
    const started = Date.now();
    await next();
    console.log(`${req.path} took ${Date.now() - started}ms`);
});
```

### State during the chain

`req.params` and `req.middleware` are set from the currently executing entry. Inside `/users/:id`, `req.params.id` is available. After `await next()` returns to a parent middleware, `req.params` still holds the deepest values set by the last executed entry.

### Return values

Instead of writing to `res`, a handler can return a value:

| Return | Behavior |
|--------|----------|
| `string` | Sent as plain text |
| `object` | Sent as JSON |
| `FFResponse` | Response considered sent |
| nothing | Nothing is sent, rely on `res` or `next()` |

Returned values are only sent when the response has not ended yet.

### Errors

An exception in any handler is logged and, when the response has not been sent, forwarded to the `500` handler. See [config.md](config.md) for custom handlers.

## Routers

Routers group middleware and mount under a prefix:

```typescript
const api = app.router("/api");
api.get("/users", handler); // handles /api/users
```

## Re-routing

`req.reRoute()` restarts path resolution with the current request, re-running matching from the top:

```typescript
app.use((req, res) => {
    req.reRoute(nreq => {
        nreq.headers.authorization = "internal";
    });
});
```
