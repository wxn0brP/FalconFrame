# FalconFrame Variables

The framework recognizes the following variables:

| Variable | Purpose | Usage |
|----------|---------|-------|
| `layout` | Specifies the layout template to wrap around content | Used by the template engine when rendering views; when present, the template will be rendered inside the layout template with the content passed as the `body` variable |
| `view engine` | Specifies the default template engine extension | Used by the response `render` method to determine which template engine to use when no extension is specified |
| `views` | Specifies the directory for view templates | Used by the response `render` method to locate view files; defaults to current directory if not set |
| `render data` | Provides default data for all rendered templates | Used by the render function to merge with template-specific data; values in render-specific data override values in render data |
| `disable compression` | Disables response compression | Used by the response `send` method to disable compression |