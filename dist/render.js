import fs from "fs";
import path from "path";
export function renderHTML(templatePath, data) {
    let template = fs.readFileSync(templatePath, "utf8");
    // Inserting data, e.g. {{name}}
    template = template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || "");
    // Loading partials, e.g. <!-- include header -->
    template = template.replace(/<!--\s*include\s*(.*?)\s*-->/g, (_, partialName) => {
        const partialPath = path.join(path.dirname(templatePath), partialName + ".html");
        if (fs.existsSync(partialPath))
            return renderHTML(partialPath, data);
        else
            return `<!-- Partial "${partialName}" (${partialPath.replace(process.cwd() + "/", "")}) not found -->`;
    });
    return template;
}
