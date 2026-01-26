# FalconFrame

> Lightweight modular TypeScript web framework built for speed and clarity.

**FalconFrame** is a minimalist web framework inspired by the middleware-first style, with routing similar to Express, but written in pure TypeScript. It supports static files, data validation, and cookie management, all without external dependencies apart from a logger.

## ✨ Features

- 🚀 Zero-dependency routing engine
- 🧱 Middleware chaining
- 📁 Static file serving
- 📦 Request validation via inline schemas
- 🍪 Cookie management
- 🔍 Debuggable logger

## 📦 Installation

```bash
yarn add @wxn0brp/falcon-frame
```

## 🚦 Usage Example

```ts
import FalconFrame, { validateBody } from "@wxn0brp/falcon-frame";
const app = new FalconFrame();

app.setOrigin("*");

const USERS = {
    admin: "hunter2",
};

// Global middleware
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

// Middleware: auth check
const requireAuth = (req, res, next) => {
    if (req.cookies.session === "admin") {
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
};

// Static files
app.static("/", "public");

app.post("/login", (req, res) => {
    const { valid, validErrors } = req.valid({
        username: "required|string",
        password: "required|string",
    });

    if (!valid) {
        return res.status(400).json({ status: "error", errors: validErrors });
    }

    const { username, password } = req.body;
    if (USERS[username] === password) {
        res.cookie("session", username, { httpOnly: true });
        return res.redirect("/dashboard");
    }

    res.status(401).json({ status: "fail", message: "Invalid credentials" });
});

app.post(
    "/register", 
    validateBody({
        username: "required|string|min:3|max:20",
        password: "required|string|min:8",
    }),
    (req, res) => {
        const { username, password } = req.body;
        USERS[username] = password;
        return { status: "success", message: "User registered successfully" };
    }
);

// Protected route
app.get("/dashboard", requireAuth, (req, res) => {
    return {
        message: `👑 Welcome to the dashboard, ${req.cookies.session}`,
    });
});

app.post("/logout", (req, res) => {
    res.cookie("session", "", { maxAge: 0 });
    res.json({ message: "👋 Logged out" });
});

// if no route matches
app.set404((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Start the server (env.PORT || 3000)
app.l(3000);
```

## 📜 License

Published under the MIT license