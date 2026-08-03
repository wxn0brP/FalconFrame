import querystring from "querystring";
import { getStandardBodyParser } from "./body-utils";
import {
	ParseBodyFunction,
	RouteHandler,
	StandardBodyParserOptions,
} from "./types";

const create =
	(type: string, parse: ParseBodyFunction) =>
	(opts: StandardBodyParserOptions = {}): RouteHandler =>
		getStandardBodyParser(type, parse, opts);

export const json = create("application/json", body => JSON.parse(body));
export const urlencoded = create("application/x-www-form-urlencoded", body =>
	querystring.parse(body),
);
export const yaml = create("application/yaml", body => Bun.YAML.parse(body));
export const toml = create("application/toml", body => Bun.TOML.parse(body));
export const json5 = create("application/json5", body => JSON.parse(body));
export const xml = create("application/xml", body =>
	new DOMParser().parseFromString(body, "text/xml"),
);
export const text = create("text/plain", body => ({
	data: body,
}));
