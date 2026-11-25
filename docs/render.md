# `renderHTML` Function

The `renderHTML` function is a template rendering engine that processes HTML templates with data binding, loops, conditionals, partial inclusion, and optional layout wrapping.

## Quick Reference

| Syntax | Description |
|--------|-------------|
| `{{ key }}` | Inserts a value, supports dotted paths like `{{ user.name }}` |
| `<!-- if key -->...<!-- /if -->` | Renders the block when the value is truthy |
| `<!-- unless key -->...<!-- /unless -->` | Renders the block when the value is falsy |
| `<!-- each list as item -->...<!-- /each -->` | Repeats the block for every array element |
| `<!-- range 3 -->...<!-- /range -->` | Repeats the block for `i` from `0` to `2` |
| `<!-- include name -->` | Renders a partial |
| `/* include file.css */` | Inserts a raw file |
| `<!-- data { "key": "value" } -->` | Sets template-local data |
| `<!-- force-layout -->` | Forces layout application even with HTML structure |
| `<!-- force-no-layout -->` | Skips the layout even without HTML structure |

## Data

Values from the `data` object are inserted with `{{ key }}`. Whitespace around the key is ignored and dotted paths resolve nested properties.

```html
<h1>Hello, {{ name }}!</h1>
<p>Signed in as {{ user.name }}.</p>
```

```javascript
const data = { name: "Alex", user: { name: "alex" } };
```

```html
<h1>Hello, Alex!</h1>
<p>Signed in as alex.</p>
```

### Template-local data

A template can define its own data with `<!-- data { ... } -->`. This is useful for values consumed by a parent layout, such as the page title. The comment is removed from the output.

Precedence, highest first:

1. Data passed to the `renderHTML` call.
2. Data from the `<!-- data {} -->` comment.
3. Global `render data` set on the FalconFrame instance.

Invalid JSON is replaced with `<!-- Invalid template data -->`.

## Conditionals

`if` renders its block when the value is truthy, `unless` renders it when the value is falsy. There are no comparison operators or expressions.

```html
<!-- if user -->
  <p>Welcome, {{ user.name }}.</p>
<!-- /if -->
<!-- unless user -->
  <p>Please sign in.</p>
<!-- /unless -->
```

```javascript
const data = { user: { name: "Alex" } };
```

```html
  <p>Welcome, Alex.</p>
```

Truthiness follows JavaScript, with one addition: an array is checked by length, so `[]` is falsy and `[1]` is truthy.

```html
<!-- if items --><p>{{ items.length }} items.</p><!-- /if -->
<!-- unless items --><p>No items.</p><!-- /unless -->
```

```javascript
const data = { items: [] };
```

```html
<p>No items.</p>
```

Conditionals work inside `each` and `range`, and loops work inside conditionals. Blocks of the same directive do not nest.

## Loops

`<!-- each list as item -->` resolves `list`, iterates over the array and exposes each element as `item`. The zero-based index is available as `i`. The value should be an array.

```html
<ul>
<!-- each items as item -->
  <li>{{ i }}. {{ item.label }}</li>
<!-- /each -->
</ul>
```

```javascript
const data = { items: [ { label: "One" }, { label: "Two" } ] };
```

```html
<ul>
  <li>0. One</li>
  <li>1. Two</li>
</ul>
```

`<!-- range n -->` repeats the block for `i` from `0` to `n - 1`. The count is a literal number.

```html
<p><!-- range 3 -->{{ i }} <!-- /range --></p>
```

```html
<p>0 1 2 </p>
```

## Partials

`<!-- include name -->` loads `name.html` relative to the directory of the current template and renders it with the same data. Extra data can be passed as JSON in the comment; it overrides the outer data for that partial.

```html
<div class="profile">
  <!-- include partials/header -->
  <p>User profile content.</p>
</div>
```

```html
<!-- views/partials/header.html -->
<header>
  <h1>Welcome, {{ username }}</h1>
</header>
```

With `{ username: "JaneDoe" }` in the outer data the partial renders `Welcome, JaneDoe`. With `<!-- include partials/header { "username": "Guest" } -->` and no outer value it renders `Welcome, Guest`.

Rendered paths are tracked, so a partial that includes itself is replaced with `<!-- Circular dependency detected: ... -->` instead of recursing.

## Raw Files

`/* include filename */` inserts a file verbatim. The path is relative to the project root. The content is not processed for interpolation, partials or layouts.

```html
<style>
  /* include views/assets/style.css */
</style>
```

```css
/* views/assets/style.css */
body {
  font-family: sans-serif;
  color: #333;
}
```

Missing files become `/* File not found: filename */`.

## Layouts

A layout is applied when the `layout` variable points to a template, either globally or through the render data:

```javascript
app.setVar("layout", "layouts/main.html");
```

The layout is rendered with the page content available as `body` and all other data unchanged.

```html
<!-- layouts/main.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ title }}</title>
</head>
<body>
  <main>{{ body }}</main>
</body>
</html>
```

```html
<!-- pages/about.html -->
<!-- data { "title": "About Us" } -->
<h2>About Us</h2>
<p>This is the about page.</p>
```

The layout receives `title` from the page comment and the rendered page as `body`.

Rules:

- A template containing `<html>` or `<body>` is assumed to be complete and skips the layout unless it has `<!-- force-layout -->`.
- A template without HTML structure still gets the layout unless it has `<!-- force-no-layout -->`.
- Both marker comments are removed from the output.

## Errors

| Case | Output |
|------|--------|
| Missing partial | `<!-- Template not found: path -->` |
| Circular partial | `<!-- Circular dependency detected: ... -->` |
| Missing raw file | `/* File not found: path */` |
| Invalid `<!-- data -->` JSON | `<!-- Invalid template data -->` |
| Any other rendering error | `<-- Template path has errors -->` |
