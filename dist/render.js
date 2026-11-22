import fs from "fs";
import path from "path";
export function renderHTML(options) {
    try {
        let data = options.data || {};
        const { templatePath, _renderedPaths: renderedPaths = [], FF, noLayout, FFVar, } = options;
        const realPath = path.resolve(templatePath);
        if (renderedPaths.includes(realPath))
            return `<!-- Circular dependency detected: tried to render ${templatePath} again -->`;
        if (!fs.existsSync(templatePath))
            return `<!-- Template not found: ${templatePath} -->`;
        let template = fs.readFileSync(templatePath, "utf8");
        // Loading internal data, e.g. <!-- data { "title": "My title" } -->
        const templateDataMatch = template.match(/<!--\s*data\s*(\{.*?\})\s*-->/s);
        let templateData = {};
        if (templateDataMatch) {
            try {
                templateData = JSON.parse(templateDataMatch[1]);
                template = template.replace(templateDataMatch[0], "");
            }
            catch (err) {
                template = template.replace(templateDataMatch[0], "<!-- Invalid template data -->");
            }
        }
        const FFData = FFVar?.["render data"] ?? (FF && FF.getVar("render data"));
        data = {
            ...(FFData || {}),
            ...templateData,
            ...data,
        };
        // Preliminary loop rendering
        template = expandLoops(template, data);
        // Inserting data, e.g. {{name}}
        template = interpolate(template, data);
        // Loading partials, e.g. <!-- include header -->
        template = template.replace(/<!--\s*include\s+([^\s{]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g, (_, partialName, json) => {
            let includeData = {};
            if (json) {
                try {
                    includeData = JSON.parse(json);
                }
                catch (error) {
                    return "<!-- Invalid include data -->";
                }
            }
            const partialPath = path.join(path.dirname(templatePath), partialName + ".html");
            return renderHTML({
                templatePath: partialPath,
                _renderedPaths: [
                    ...renderedPaths,
                    realPath,
                ],
                noLayout: true,
                data: {
                    ...data,
                    ...includeData,
                },
                FF,
                FFVar,
            });
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
        const FFLayout = FFVar?.layout ?? (FF && FF.getVar("layout"));
        if (!noLayout && FFLayout) {
            const hasHtmlStructure = /<\s*html|<\s*body/i.test(template);
            const forceLayout = /<!--\s*force-layout\s*-->/.test(template);
            const forceNoLayout = /<!--\s*force-no-layout\s*-->/.test(template);
            template = template.replace(/<!--\s*layout\s*-->|<!--\s*force-layout\s*-->|<!--\s*force-no-layout\s*-->/g, "");
            if (hasHtmlStructure && !forceLayout)
                return template;
            if (!hasHtmlStructure && forceNoLayout)
                return template;
            return renderHTML({
                templatePath: FFLayout,
                data: {
                    ...data,
                    body: template,
                },
                _renderedPaths: [
                    ...renderedPaths,
                    realPath,
                ],
                noLayout: true,
                FF,
                FFVar,
            });
        }
        return template;
    }
    catch (error) {
        return `<-- Template ${options.templatePath} has errors -->`;
    }
}
function resolvePath(data, key) {
    let value = data;
    for (const part of key.split(".")) {
        if (value == null)
            return undefined;
        value = value[part];
    }
    return value;
}
export function interpolate(template, data) {
    return template.replace(/{{(.*?)}}/g, (_, key) => resolvePath(data, key.trim()) ?? "");
}
export function expandLoops(template, data) {
    return template
        .replace(/<!--\s*each\s+(\w+)\s+as\s+(\w+)\s*-->([\s\S]*?)<!--\s*\/each\s*-->/g, (_, key, itemVar, body) => (resolvePath(data, key) ?? [])
        .map((value, index) => interpolate(body, {
        ...data,
        [itemVar]: value,
        i: index,
    }))
        .join(""))
        .replace(/<!--\s*range\s+(\w+)\s*-->([\s\S]*?)<!--\s*\/range\s*-->/g, (_, key, body) => {
        const range = Array.from({
            length: +key,
        }, (_, i) => i);
        return range
            .map((i) => interpolate(body, {
            ...data,
            i,
        }))
            .join("");
    });
}
