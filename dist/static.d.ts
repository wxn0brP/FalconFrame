import { RouteHandler, StaticFileOptions, StaticServeOptions } from "./types.js";
export declare function handleSingleFile(filePath: string, opts: StaticFileOptions): RouteHandler;
export declare function handleStaticFiles(dirPath: string, opts: StaticServeOptions): RouteHandler;
