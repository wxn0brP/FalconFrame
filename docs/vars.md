# FalconFrame Variables

The framework recognizes the following variables:

| Variable | Purpose | Usage |
|----------|---------|-------|
| `layout` | Specifies the layout template to wrap around content | Used by the template engine when rendering views; when present, the template will be rendered inside the layout template with the content passed as the `body` variable |
| `view engine` | Specifies the default template engine extension | Used by the response `render` method to determine which template engine to use when no extension is specified |
| `views` | Specifies the directory for view templates | Used by the response `render` method to locate view files; defaults to current directory if not set |
| `render data` | Provides default data for all rendered templates | Used by the render function to merge with template-specific data; values in render-specific data override values in render data |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Default port used by `app.l(port)` when set |
| `NODE_ENV` | When set to `"production"`, disables the debug panel |
| `FF_DEBUG_PRODUCTION_ENABLED` | Overrides the production block; if truthy, the debug panel works even in production |
| `FF_DEBUG_PASS` | Stable debug secret, used instead of a generated token. The token can be passed as `?pass=...`, `Authorization: Bearer ...`, or exchanged for the `ff_debug` cookie |

See [debug.md](debug.md) for the token flow and [config.md](config.md) for all constructor options.

