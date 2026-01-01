# `renderHTML` Function

The `renderHTML` function is a template rendering engine that processes HTML templates with data binding, partial inclusion, and optional layout wrapping.

## Behavior

### Data Interpolation

Data from the `data` object is inserted using `{{variable}}` syntax. The engine:
- Looks for all occurrences of `{{key}}` in the template
- Strips whitespace around keys when matching
- Replaces variables with corresponding values from the data object
- Inserts an empty string for keys that don't exist in the data object

### Partial Inclusion

Partials are loaded using HTML comment syntax `<!-- include partialname -->`. The engine:
- Constructs the partial path relative to the current template's directory
- Appends `.html` extension to the partial name
- Passes the same data object to the included partial
- Tracks rendered paths to prevent circular dependencies
- Returns a comment when circular dependencies are detected

### Raw File Inclusion

Raw files (like CSS or JavaScript) are loaded using C-style comment syntax `/* include filename */`. The engine:
- Reads the content of the file specified by `filename`. The path should be relative to the project's root directory.
- Inserts the content directly into the template.
- Does not process the included file content for data interpolation, partial inclusion, or layout handling.
- Returns a comment when the file is not found.

### Layout Handling

Layouts are applied when a `FalconFrame` instance is provided with a `layout` variable. The engine:
- Checks if the template has HTML structure (`<html>` or `<body>` tags)
- Skips layout if the template has HTML structure and no `<!-- force-layout -->` comment
- Skips layout if the template lacks HTML structure and has `<!-- force-no-layout -->` comment
- Applies layout by rendering the layout template with the original content as the `body` variable
- Passes the same data object to the layout with the `body` property added

### Error Handling

- Returns a C-style comment `/* File not found: path */` when a file requested by `/* include */` cannot be read.
- Returns an HTML comment `<!-- Template not found: path -->` when a template/partial file cannot be read.
- Prevents circular dependencies by tracking rendered template paths

## Examples

### Data Interpolation Example

**File: `template.html`**
```html
<h1>Hello, {{ name }}!</h1>
<p>Welcome to our site.</p>
```

**Data:**
```javascript
const data = { name: "Alex" };
```

**Result:**
```html
<h1>Hello, Alex!</h1>
<p>Welcome to our site.</p>
```

---

### Partial Inclusion Example

**File: `views/profile.html`**
```html
<div class="profile">
  <!-- include partials/header -->
  <p>User profile content.</p>
</div>
```

**File: `views/partials/header.html`**
```html
<header>
  <h1>Welcome, {{ username }}</h1>
</header>
```

**Data:**
```javascript
const data = { username: "JaneDoe" };
```

**Result:**
```html
<div class="profile">
  <header>
    <h1>Welcome, JaneDoe</h1>
  </header>
  <p>User profile content.</p>
</div>
```

---

### Layout Handling Example

```javascript
app.setVar("layout", "layouts/main.html");
```

**File: `layouts/main.html` (Layout)**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ title }}</title>
</head>
<body>
  <main>
    {{ body }}
  </main>
</body>
</html>
```

**File: `pages/about.html` (Template)**
```html
<h2>About Us</h2>
<p>This is the about page content.</p>
```

**Data:**
```javascript
const data = { title: "My Awesome Site" };
```

**Result:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Awesome Site</title>
</head>
<body>
  <main>
    <h2>About Us</h2>
    <p>This is the about page content.</p>
  </main>
</body>
</html>
```

---

### Raw File Inclusion Example

**File: `views/page.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <style>
    /* include views/assets/style.css */
  </style>
</head>
<body>
  <h1>Welcome!</h1>
  <script>
    /* include views/assets/script.js */
  </script>
</body>
</html>
```

**File: `views/assets/style.css`**
```css
body {
  font-family: sans-serif;
  color: #333;
}
```

**File: `views/assets/script.js`**
```javascript
console.log("Page loaded successfully!");
```

**Result:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <style>
    body {
      font-family: sans-serif;
      color: #333;
    }
  </style>
</head>
<body>
  <h1>Welcome!</h1>
  <script>
    console.log("Page loaded successfully!");
  </script>
</body>
</html>
```