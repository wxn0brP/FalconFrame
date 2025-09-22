import { handleStaticFiles } from "./helpers";
import { Method, Middleware, RouteHandler } from "./types";

export class Router {
	public middlewares: Middleware[] = [];

	addRoute(method: Method, path: string, ...handlers: RouteHandler[]) {
		const handler = handlers.pop();
		handlers.forEach((middleware) => this.use(path, middleware));
		return this.middlewares.push({ path, middleware: handler, method });
	}

	use(
		path: string | RouteHandler | Router = "/",
		middlewareFn?: RouteHandler | Router,
		method: Method = "all",
	) {
		if (typeof path === "function" || path instanceof Router) {
			middlewareFn = path;
			path = "/";
		}

		const middleware: Middleware = {
			path,
			method,
			middleware: null,
			use: true,
		};

		if (middlewareFn instanceof Router) {
			middleware.router = middlewareFn.middlewares;
		} else {
			middleware.middleware = middlewareFn;
		}

		this.middlewares.push(middleware);
		return this;
	}

	get(path: string, ...handlers: RouteHandler[]) {
		this.addRoute("get", path, ...handlers);
		return this;
	}

	post(path: string, ...handlers: RouteHandler[]) {
		this.addRoute("post", path, ...handlers);
		return this;
	}

	put(path: string, ...handlers: RouteHandler[]) {
		this.addRoute("put", path, ...handlers);
		return this;
	}

	delete(path: string, ...handlers: RouteHandler[]) {
		this.addRoute("delete", path, ...handlers);
		return this;
	}

	all(path: string, ...handlers: RouteHandler[]) {
		this.addRoute("all", path, ...handlers);
		return this;
	}

	static(apiPath: string, dirPath?: string, utf8 = true) {
		if (!dirPath) {
			dirPath = apiPath;
			apiPath = "/";
		}
		this.use(apiPath, handleStaticFiles(dirPath, utf8));
		return this;
	}

	sse(path: string, ...handlers: RouteHandler[]) {
		const index = this.addRoute("get", path, ...handlers);
		this.middlewares[index - 1].sse = true;
		return this;
	}
}
