import fs from "fs";
import path from "path";
export function renderHTML(templatePath, data, renderedPaths = [], FF) {
    try {
        const realPath = path.resolve(templatePath);
        if (renderedPaths.includes(realPath))
            return `<!-- Circular dependency detected: tried to render ${templatePath} again -->`;
        if (FF && FF.vars["render data"]) {
            data = {
                ...FF.vars["render data"],
                ...data,
            };
        }
        let template = fs.readFileSync(templatePath, "utf8");
        // Inserting data, e.g. {{name}}
        template = template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || "");
        // Loading partials, e.g. <!-- include header -->
        template = template.replace(/<!--\s*include\s*(.*?)\s*-->/g, (_, partialName) => {
            const partialPath = path.join(path.dirname(templatePath), partialName + ".html");
            return renderHTML(partialPath, data, [
                ...renderedPaths,
                realPath,
            ], FF);
        });
        // Loading files, e.g. /* include style.css */
        template = template.replace(/\/\*\s*include\s*(.*?)\s*\*\//g, (_, fileName) => {
            fileName = fileName.trim();
            try {
                return fs.readFileSync(fileName, "utf8");
            }
            catch (error) {
                return `/* File not found: ${fileName} */`;
            }
        });
        // Layout
        if (FF && FF.vars["layout"]) {
            const hasHtmlStructure = /<\s*html|<\s*body/i.test(template);
            const forceLayout = /<!--\s*force-layout\s*-->/.test(template);
            const forceNoLayout = /<!--\s*force-no-layout\s*-->/.test(template);
            if (hasHtmlStructure && !forceLayout)
                return template;
            if (!hasHtmlStructure && forceNoLayout)
                return template;
            return renderHTML(FF.vars["layout"], { ...data, body: template }, [...renderedPaths, realPath], FF);
        }
        return template;
    }
    catch (error) {
        return `<!-- Template not found: ${templatePath} -->`;
    }
}
