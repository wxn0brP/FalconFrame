import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import { handleStaticFiles } from "./helpers.js";
import { handleRequest } from "./req.js";
import { FFResponse } from "./res.js";
import { FFRequest } from "./types.js";
import { renderHTML } from "./render.js";
import { PluginSystem } from "./plugins.js";
export class FalconFrame {
    middlewares = [];
    logger;
    constructor(loggerOpts) {
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...loggerOpts
        });
    }
    addRoute(method, path, ...handlers) {
        const handler = handlers.pop();
        handlers.forEach(middleware => this.use(path, middleware));
        this.middlewares.push({ path, middleware: handler, method });
    }
    use(path = "/", middleware, method = "all") {
        if (typeof path === "function") {
            middleware = path;
            path = "/";
        }
        this.middlewares.push({ path, middleware, method, use: true });
    }
    get(path, ...handlers) {
        this.addRoute("get", path, ...handlers);
    }
    post(path, ...handlers) {
        this.addRoute("post", path, ...handlers);
    }
    put(path, ...handlers) {
        this.addRoute("put", path, ...handlers);
    }
    delete(path, ...handlers) {
        this.addRoute("delete", path, ...handlers);
    }
    all(path, ...handlers) {
        this.addRoute("all", path, ...handlers);
    }
    static(apiPath, dirPath) {
        this.middlewares.push({
            path: (apiPath + "/*").replace("//", "/"),
            method: "get",
            middleware: handleStaticFiles(apiPath, dirPath)
        });
        this.middlewares.push({
            path: apiPath,
            method: "get",
            middleware: handleStaticFiles(apiPath, dirPath)
        });
    }
    listen(port, callback) {
        const server = http.createServer((req, res) => {
            handleRequest(req, res, this);
        });
        server.listen(port, callback);
        return server;
    }
    getApp() {
        return (req, res) => {
            handleRequest(req, res, this);
        };
    }
}
export default FalconFrame;
export { FFResponse, FFRequest, renderHTML, PluginSystem, };
