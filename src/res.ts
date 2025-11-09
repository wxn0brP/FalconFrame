import { createReadStream } from "fs";
import http from "http";
import path from "path";
import FalconFrame from ".";
import { ensureLeadingDot, getContentType } from "./helpers";
import { CookieOptions, RenderOptions } from "./types";

export class FFResponse extends http.ServerResponse {
	_ended = false;
	FF: FalconFrame;

	/**
	 * bind end for compatibility
	 */
	send(data: string) {
		this.end(data);
	}

	/**
	 * Sets a header. This is a shortcut for setHeader.
	 * @param name The name of the header
	 * @param value The value of the header
	 * @returns The response object
	 */
	header(name: string, value: string) {
		this.setHeader(name, value);
		return this;
	}

	/**
	 * Set content type
	 */
	ct(contentType: string = "text/plain") {
		this.setHeader("Content-Type", contentType);
		return this;
	}

	/**
	 * Set the content type to application/json and write the given data as json
	 * @param data The data to be written as json
	 */
	json(data: any) {
		this.setHeader("Content-Type", "application/json");
		this.end(JSON.stringify(data));
	}

	/**
	 * Set a cookie in the response
	 * @param name The name of the cookie
	 * @param value The value of the cookie
	 * @param options The options for the cookie
	 */
	cookie(name: string, value: string, options: CookieOptions = {}) {
		let cookie = `${name}=${encodeURIComponent(value)}`;

		if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
		if (options.path) cookie += `; Path=${options.path}`;
		if (options.httpOnly) cookie += `; HttpOnly`;
		if (options.secure) cookie += `; Secure`;
		if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

		this.setHeader("Set-Cookie", cookie);
		return this;
	}

	/**
	 * Set the status code for the response
	 * @param code The status code to set
	 * @returns The response object
	 */
	status(code: number) {
		this.statusCode = code;
		return this;
	}

	/**
	 * Set status code to 302 and set location header to the provided url.
	 * If end is true, ends the response.
	 * @param url The url to redirect to
	 * @param end Whether to end the response after setting the headers
	 * @returns The response object
	 */
	redirect(url: string, end = true) {
		this.statusCode = 302;
		this.setHeader("Location", url);
		if (end) this.end();
		return this;
	}

	/**
	 * Sends a file as the response.
	 * Sets the "Content-Type" header based on the provided contentType or the file's extension.
	 * Uses streaming to send the file content.
	 * @param filePath The path to the file to be sent.
	 * @param contentType Optional. The MIME type for the Content-Type header.
	 * If "utf8", the charset will be set to UTF-8.
	 * @returns The response object.
	 */
	sendFile(filePath: string, contentType?: string) {
		if (contentType === "utf8") contentType = getContentType(filePath);
		this.ct(contentType || getContentType(filePath));
		createReadStream(filePath).pipe(this);
		this._ended = true;
		return this;
	}

	/**
	 * Renders a view with the given data and sends it as the response.
	 * It uses the registered template engine.
	 * @param view The name of the view file to render.
	 * @param data An object containing data to be injected into the template.
	 * @returns The response object.
	 */
	render(view: string, data: any = {}, opts: RenderOptions = {}) {
		const ff = this.FF;

		const viewsDir =
			opts.baseDir ??
			(opts.notUseViews ? "." : (ff.getVar("views") as string || "."));

		let engineName = path.extname(view);
		let filePath = view;

		if (opts.engine) {
			engineName = ensureLeadingDot(opts.engine);
		} else if (!engineName) {
			const defaultEngine = ff.getVar("view engine") as string;

			engineName = defaultEngine ? ensureLeadingDot(defaultEngine) : ".html";
			if (!opts.notAppendExt) filePath += engineName;
		}

		const engine = ff.engines[engineName];

		if (!engine) {
			const errMessage = `No engine registered for extension ${engineName}`;
			ff.logger.error(errMessage);
			this.status(500).end("Server Error: " + errMessage);
			return this;
		}

		const fullPath = path.resolve(viewsDir, filePath);

		try {
			engine(fullPath, data, (err, str) => {
				if (err) {
					ff.logger.error(`Error rendering view: ${err}`);
					this.status(500).end("Server Error: Failed to render view.");
				} else {
					this.ct(opts.contentType || "text/html");
					this.end(str);
				}
			}, opts.notShareFF ? undefined : this.FF);
		} catch (err) {
			ff.logger.error(`Unhandled error in template engine: ${err}`);
			this.status(500).end("Server Error: Unhandled exception in template engine.");
		}

		return this;
	}

	/**
	 * Initialize SSE headers to start a server-sent event stream.
	 * Sets:
	 *
	 * Content-Type: "text/event-stream"
	 *
	 * Cache-Control: "no-cache"
	 *
	 * Connection: "keep-alive"
	 * @returns The response object
	 */
	sseInit() {
		this.setHeader("Content-Type", "text/event-stream");
		this.setHeader("Cache-Control", "no-cache");
		this.setHeader("Connection", "keep-alive");
		return this;
	}

	/**
	 * Sends a Server-Sent Event to the client.
	 * @param data The data to be sent. If an object, it will be JSON.stringified.
	 * @returns The response object
	 */
	sseSend(data: string | object) {
		if (typeof data === "object") data = JSON.stringify(data);
		this.write(`data: ${data}\n\n`);
		return this;
	}
}
