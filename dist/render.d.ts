import FalconFrame from "./index.js";
export interface RenderOptions {
    noLayout?: boolean;
}
export declare function renderHTML(templatePath: string, data?: Record<string, any>, renderedPaths?: string[], FF?: FalconFrame<any>, opts?: RenderOptions): string;
