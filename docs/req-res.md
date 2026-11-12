# Request and Response

Related concerns: [middleware.md](middleware.md), [valid.md](valid.md), [render.md](render.md), [sse.md](sse.md), [proxy.md](proxy.md).

## FFRequest

`FFRequest` extends `http.IncomingMessage`.

| Member | Description |
|--------|-------------|
| `req.path` | Decoded pathname with collapsed duplicate slashes |
| `req.query` | Parsed search params as a plain object |
| `req.params` | Route params of the currently executing middleware |
| `req.cookies` | Parsed `Cookie` header |
| `req.body` | Parsed body, `{}` when absent or not parsed. See [config.md](config.md) |
| `req.isBodyParsed` | `true` when a registered parser consumed the body |
| `req.ip` | Resolved client address, respects the `proxy` option |
| `req.socketIp` | Raw TCP peer address |
| `req.isProxied` | `true` when proxy headers were used to resolve `ip` |
| `req.protocol` | `"http"` or `"https"`, respects `x-forwarded-proto` from a trusted proxy |
| `req.secure` | `true` when the request came over HTTPS |
| `req.middleware` | The middleware entry currently being executed |
| `req.id` | Request id from `x-request-id`, see [config.md](config.md) |
| `req.FF` | The `FalconFrame` instance |
| `req.header(name)` | Case-insensitive header lookup |
| `req.valid(schema, regexRules?)` | Validates `req.body`, returns `{ valid, validErrors }`. See [valid.md](valid.md) |
| `req.reRoute(fn)` | Restarts matching with a mutated request |

## FFResponse

`FFResponse` extends `http.ServerResponse`. All methods return `this` for chaining unless they end the response.

| Member | Description |
|--------|-------------|
| `res.send(data)` | `end()` with the given string |
| `res.status(code)` | Sets the status code |
| `res.ct(type)` | Sets `Content-Type`, defaults to `text/plain` |
| `res.header(name, value)` | Sets a single header |
| `res.json(data)` | Sets `Content-Type: application/json` and ends with the serialized data |
| `res.cookie(name, value, opts?)` | Appends a `Set-Cookie` header |
| `res.clearCookie(name, opts?)` | Sends an expired cookie |
| `res.redirect(url, status?, end?)` | `303` by default, sets `Location`, ends by default |
| `res.sendFile(path, contentType?)` | Streams a file, passes `"utf8"` to add a charset |
| `res.render(view, data?, opts?)` | Renders through a template engine. See [render.md](render.md) |
| `res.sseInit()` | Initializes an event stream. See [sse.md](sse.md) |
| `res.sseSend(data)` | Sends an SSE data event |
| `res.sseEventSend(event, data)` | Sends an SSE named event |

### Cookies

```typescript
res.cookie("session", token, {
    maxAge: 3600,
    httpOnly: true,
    sameSite: "Lax",
});
res.clearCookie("session");
```

| Option | Description |
|--------|-------------|
| `maxAge` | `Max-Age` in seconds, `0` expires the cookie |
| `path` | `Path` attribute |
| `httpOnly` | Adds `HttpOnly` |
| `secure` | Adds `Secure` |
| `sameSite` | `"Strict"`, `"Lax"` or `"None"` |

## Ending the response

Any call to `res.end()` marks the response as ended. Later `next()` calls become no-ops, error handlers stop writing, and returned values are dropped, so double responses cannot happen.
