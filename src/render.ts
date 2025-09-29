import fs from "fs";
import path from "path";
import FalconFrame from ".";

interface RenderData {
    [key: string]: string;
}

export function renderHTML(
    templatePath: string,
    data: RenderData,
    renderedPaths: string[] = [],
    FF?: FalconFrame
): string {
    try {
        const realPath = path.resolve(templatePath);
        if (renderedPaths.includes(realPath)) {
            return `<!-- Circular dependency detected: tried to render ${templatePath} again -->`;
        }

        let template = fs.readFileSync(templatePath, "utf8");

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
                ]);
            },
        );

        // Layout
        if (FF && FF.vars["layout"]) {
            const hasHtmlStructure = /<\s*html|<\s*body/i.test(template);
            const forceLayout = /<!--\s*force-layout\s*-->/.test(template);
            const forceNoLayout = /<!--\s*force-no-layout\s*-->/.test(template);

            if (hasHtmlStructure && !forceLayout) return template;
            if (!hasHtmlStructure && forceNoLayout) return template;

            return renderHTML(
                FF.vars["layout"],
                { ...data, body: template },
                [...renderedPaths, realPath],
            );
        }

        return template;
    } catch (error) {
        return `<!-- Template not found: ${templatePath} -->`;
    }
}
