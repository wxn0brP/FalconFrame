interface RenderData {
    [key: string]: string;
}
export declare function renderHTML(templatePath: string, data: RenderData, renderedPaths?: string[]): string;
export {};
