import FalconFrame, { PluginSystem } from ".";

const app = new FalconFrame({
    logLevel: "INFO",
});

const pluginSystem = new PluginSystem();

pluginSystem.register({
    id: "logger",
    process: (req, res, next) => {
        console.log(`Request to ${req.url} with body ${JSON.stringify(req.body)}`);
        next();
    }
});

pluginSystem.register({
    id: "logger2",
    process: (req, res, next) => {
        req.body.test = "test";
        next();
    }
}, { before: "logger" });

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

app.use(pluginSystem.getRouteHandler());

app.static("/", "public");

app.get("/hello", (req, res) => {
    const name = req.query.name || "World";
    res.json({
        message: `Hello, ${name}?`,
        query: req.query,
    });
});

app.get("/hello/*", (req, res) => {
    res.json({
        message: `Hello, ${req.params.name}!`,
        query: req.query,
    });
});

app.get("/greet/:name", (req, res, next) => {
    console.log(req.params);
    next();
}, (req, res) => {
    res.json({
        message: `Hello, ${req.params.name}!`,
    });
})

app.post("/submit", (req, res, next) => {
    const { validErrors, valid } = req.valid({
        login: "required|string",
        password: "required|string|min:8",
    });

    if (!valid) {
        res.status(400).json({
            status: "error",
            errors: validErrors,
        });
    } else next()
}, async (req, res) => {
    console.log("run")
    res.redirect("/hello?name=" + req.body.login);
    return {
        status: "success",
        data: `Hello ${req.body.login}`,
    }
});

app.use((req, res) => {
    res.status(404);
    res.json({
        message: "Not found",
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});