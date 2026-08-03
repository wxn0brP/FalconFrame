import querystring from "querystring";
import { ParseBodyFunction } from "./types";

export const json: ParseBodyFunction = body => JSON.parse(body);
export const urlencoded: ParseBodyFunction = body => querystring.parse(body);
export const yaml: ParseBodyFunction = body => Bun.YAML.parse(body);
export const toml: ParseBodyFunction = body => Bun.TOML.parse(body);
export const json5: ParseBodyFunction = body => Bun.JSON5.parse(body);
export const xml: ParseBodyFunction = body =>
	new DOMParser().parseFromString(body, "text/xml");
export const text: ParseBodyFunction = body => ({
	data: body,
});
