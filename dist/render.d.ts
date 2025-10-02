import FalconFrame from "./index.js";
interface RenderData {
    [key: string]: string;
}
export declare function renderHTML(templatePath: string, data: RenderData, renderedPaths?: string[], FF?: FalconFrame): string;
export {};
