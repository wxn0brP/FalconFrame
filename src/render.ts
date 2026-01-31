import fs from "fs";
import path from "path";
import FalconFrame from ".";

export function renderHTML(
    templatePath: string,
    data: Record<string, any> = {},
    renderedPaths: string[] = [],
    FF?: FalconFrame
): string {
    try {
        const realPath = path.resolve(templatePath);
        if (renderedPaths.includes(realPath))
            return `<!-- Circular dependency detected: tried to render ${templatePath} again -->`;

        let template = fs.readFileSync(templatePath, "utf8");

        // Loading internal data, e.g. <!-- data { "title": "My title" } -->
        const templateDataMatch = template.match(/<!--\s*data\s*(\{.*?\})\s*-->/s);
        let templateData: Record<string, any> = {};
        if (templateDataMatch) {
            try {
                templateData = JSON.parse(templateDataMatch[1]);
                template = template.replace(templateDataMatch[0], "");
            } catch (err) {
                template = template.replace(templateDataMatch[0], "<!-- Invalid template data -->");
            }
        }

        const FFData = FF && FF.getVar("render data");
            data = {
            ...(FFData || {}),
            ...templateData,
                ...data,
            };

        // Inserting data, e.g. {{name}}
        template = template.replace(
            /{{(.*?)}}/g,
            (_, key) => data[key.trim()] || "",
        );

        // Loading partials, e.g. <!-- include header -->
        template = template.replace(
            /<!--\s*include\s*(.*?)\s*-->/g,
            (_, partialName) => {
                const partialPath = path.join(
                    path.dirname(templatePath),
                    partialName + ".html",
                );
                return renderHTML(partialPath, data, [
                    ...renderedPaths,
                    realPath,
                ], FF);
            },
        );

        // Loading files, e.g. /* include style.css */
        template = template.replace(
            /\/\*\s*include\s*(.*?)\s*\*\//g,
            (_, fileName) => {
                fileName = fileName.trim();
                try {
                    return fs.readFileSync(fileName, "utf8");
                } catch (error) {
                    return `/* File not found: ${fileName} */`;
                }
            }
        );

        // Layout
        const FFLayout = FF && FF.getVar("layout");
        if (FFLayout) {
            const hasHtmlStructure = /<\s*html|<\s*body/i.test(template);
            const forceLayout = /<!--\s*force-layout\s*-->/.test(template);
            const forceNoLayout = /<!--\s*force-no-layout\s*-->/.test(template);

            if (hasHtmlStructure && !forceLayout) return template;
            if (!hasHtmlStructure && forceNoLayout) return template;

            return renderHTML(
                FFLayout,
                { ...data, body: template },
                [...renderedPaths, realPath],
                FF
            );
        }

        return template;
    } catch (error) {
        return `<!-- Template not found: ${templatePath} -->`;
    }
}
