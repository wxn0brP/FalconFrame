export declare const mimeTypes: Record<string, string>;
/**
 * Registers a MIME type for a file extension
 */
export declare function registerMimeType(extension: string, contentType: string): void;
export declare function isTextualContentType(contentType: string): boolean;
export declare function getContentType(filePath: string, utf8?: boolean): string;
