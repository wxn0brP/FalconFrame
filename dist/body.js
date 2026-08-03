import querystring from "querystring";
export const json = body => JSON.parse(body);
export const urlencoded = body => querystring.parse(body);
export const yaml = body => Bun.YAML.parse(body);
export const toml = body => Bun.TOML.parse(body);
export const json5 = body => Bun.JSON5.parse(body);
export const xml = body => new DOMParser().parseFromString(body, "text/xml");
export const text = body => ({
    data: body,
});
