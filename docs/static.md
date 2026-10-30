# Static Files

Static files are mounted with `app.static()`. The usual form serves a directory at the site root:

```typescript
app.static("public");
```

A second form mounts the directory under a URL prefix. The mount path is matched by segment, so `/assets` serves `/assets/...` and never `/assets-other/...`.

## Behavior

- Only `GET` and `HEAD` are handled. Other methods fall through to `next()`.
- A request that escapes the served directory falls through to `next()` and ends as a normal 404.
- Path segments equal to `.` or `..`, and segments containing a backslash or a null byte, are rejected.
- Dotfiles are denied by default. `.well-known` is always allowed as the first segment, so ACME HTTP-01 challenges work without extra configuration.
- Symlinks are followed. Do not serve directories that untrusted users can write to.
- With `render: true`, every `.html` file is processed as a template, including files uploaded by users. Use `render: false` for upload directories.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `utf8` | `true` | Adds `charset=utf-8` to textual content types |
| `render` | `true` | Passes `.html` files through the template engine |
| `renderData` | `{}` | Per-file data passed to the template engine |
| `etag` | `true` | Sends a weak `ETag` based on size and mtime |
| `errorIfDirNotFound` | `true` | Throws during startup when the directory is missing |
| `notRenderHtml` | `false` | Disables template rendering for `.html` files |
| `dotfiles` | `false` | Allow serving dotfiles. `.well-known` stays allowed either way |

## Examples

### Basic

```typescript
app.static("public");
```

### Subdirectory mount

```typescript
app.static("/assets", "public/assets");
```

### Dotfiles

```typescript
app.static("public", {
    dotfiles: false,
});
```

With `dotfiles: false`, `/.env` and `/.git/config` fall through to the next middleware. `/.well-known/` is still served.

### ACME challenge with a custom mount

```typescript
app.static("/.well-known", "public/well-known");
```

### Plain files without the template engine

```typescript
app.static("/uploads", "uploads", {
    render: false,
});
```
