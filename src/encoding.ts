import path from "path";

export const mimeTypes: Record<string, string> = {
	".html": "text/html",
	".xhtml": "application/xhtml+xml",
	".css": "text/css",
	".js": "application/javascript",
	".mjs": "application/javascript",
	".cjs": "application/javascript",
	".json": "application/json",
	".json5": "application/json5",
	".yaml": "application/yaml",
	".yml": "application/yaml",
	".toml": "application/toml",
	".xml": "application/xml",
	".csv": "text/csv",
	".md": "text/markdown",
	".vtt": "text/vtt",
	".map": "application/json",
	".webmanifest": "application/manifest+json",
	".png": "image/png",
	".apng": "image/apng",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".webp": "image/webp",
	".avif": "image/avif",
	".bmp": "image/bmp",
	".tiff": "image/tiff",
	".txt": "text/plain",
	".pdf": "application/pdf",
	".wasm": "application/wasm",
	".wav": "audio/wav",
	".mp3": "audio/mpeg",
	".ogg": "audio/ogg",
	".aac": "audio/aac",
	".weba": "audio/webm",
	".flac": "audio/flac",
	".opus": "audio/opus",
	".m4a": "audio/mp4",
	".mp4": "video/mp4",
	".m4v": "video/mp4",
	".webm": "video/webm",
	".ogv": "video/ogg",
	".m3u8": "application/vnd.apple.mpegurl",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".otf": "font/otf",
	".eot": "application/vnd.ms-fontobject",
};

/**
 * Registers a MIME type for a file extension
 */
export function registerMimeType(extension: string, contentType: string) {
	const ext = extension.trim().toLowerCase();
	mimeTypes[ext.startsWith(".") ? ext : "." + ext] = contentType;
}

const textualTypeRe =
	/^(?:text\/|application\/(?:json5?|javascript|xml|yaml|toml)$|[\w.-]+\/[\w.-]+\+(?:json|xml)$)/;

export function isTextualContentType(contentType: string) {
	const type = contentType.split(";")[0].trim().toLowerCase();
	return type === "image/svg+xml" || textualTypeRe.test(type);
}

export function getContentType(filePath: string, utf8 = true) {
	let contentType =
		mimeTypes[path.extname(filePath).toLowerCase()] ??
		"application/octet-stream";
	if (utf8 && !contentType.includes(";") && isTextualContentType(contentType))
		contentType += "; charset=utf-8";
	return contentType;
}
