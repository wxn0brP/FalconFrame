# Server-Sent Events

Related concerns: [routing.md](routing.md), [req-res.md](req-res.md).

SSE keeps an open HTTP stream that the server can push messages through. The client uses the native `EventSource` API.

## Route

`app.sse()` registers a `GET` route that initializes the stream and keeps the connection open. It returns an `SSEManager` bound to that route:

```typescript
const chat = app.sse("/chat", (req, res) => {
    res.sseSend({ hello: req.sseId });
});
```

The handler runs for every new connection. `req.sseId` holds the generated client id.

## Manager

| Method | Description |
|--------|-------------|
| `manager.getClients()` | Map of client id to `{ req, res }` |
| `manager.sendAll(data)` | Data event to every client |
| `manager.sendTo(id, data)` | Data event to one client |
| `manager.sendEventAll(event, data)` | Named event to every client |
| `manager.sendEventTo(id, event, data)` | Named event to one client |
| `manager.disconnect(id)` | Ends one client's stream and removes it |

Objects are JSON serialized automatically. Disconnected clients are removed on request close.

```typescript
chat.sendAll({ time: Date.now() });
chat.sendEventTo(id, "private", { msg: "hi" });
```

## Manual streams

Any handler can open a stream with the response helpers, without `app.sse()`:

```typescript
app.get("/events", (req, res, next) => {
    res.sseInit();
    res.sseSend("connected");
});
```

| Method | Description |
|--------|-------------|
| `res.sseInit()` | Sets `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive` and flushes headers |
| `res.sseSend(data)` | Writes a `data:` event |
| `res.sseEventSend(event, data)` | Writes a named event |

## Client

```javascript
const source = new EventSource("/chat");

source.onmessage = e => console.log(JSON.parse(e.data));
source.addEventListener("private", e => console.log(JSON.parse(e.data)));
```
