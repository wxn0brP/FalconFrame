import FalconFrame from ".";

const app = new FalconFrame();

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

app.static("/", "public");

app.get("/hello", (req, res) => {
    const name = req.query.name || "World";
    res.json({
        message: `Hello, ${name}?`,
        query: req.query,
        cookies: req.cookies,
    });
});

app.get("/hello/*", (req, res) => {
    res.json({
        message: `Hello, ${req.params.name}!`,
        query: req.query,
        cookies: req.cookies,
    });
});

app.post("/submit", async (req, res) => {
    const { validErrors, valid } = req.valid({
        login: "required|string",
        password: "required|string|min:8",
    });

    if (!valid) {
        res.status(400);
        return {
            status: "error",
            errors: validErrors,
        }
    }

    res.redirect("/hello?name=" + req.body.login);
    return {
        status: "success",
        data: `Hello ${req.body.login}`,
    }
});

app.get("*", (req, res) => {
    res.status(404);
    res.json({
        message: "Not found",
        query: req.query,
        cookies: req.cookies,
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});