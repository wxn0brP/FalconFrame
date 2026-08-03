const optionalKeys = new Set([
    "nullable",
    "optional",
    "opt",
]);
export function validate(opts) {
    if (!opts.isBodyParsed) {
        return {
            valid: false,
            validErrors: {
                _body: [
                    "Request body could not be parsed. Check Content-Type header and body format.",
                ],
            },
        };
    }
    const { schema, data, regexRules } = opts;
    const errors = {};
    let isValid = true;
    for (const key in schema) {
        const rules = schema[key].split("|");
        const value = data[key];
        const fieldErrors = [];
        const isOptional = rules.some(r => optionalKeys.has(r));
        if (isOptional && (value === null || value === undefined)) {
            continue;
        }
        for (const rule of rules) {
            const [ruleName, param] = rule.split(":");
            switch (ruleName) {
                case "required":
                case "r":
                    if (!value && value !== 0) {
                        fieldErrors.push(`${key} is required`);
                    }
                    break;
                case "string":
                case "str":
                case "s":
                    if (typeof value !== "string") {
                        fieldErrors.push(`${key} must be a string`);
                    }
                    break;
                case "number":
                case "num":
                case "n":
                    if (typeof value !== "number") {
                        fieldErrors.push(`${key} must be a number`);
                    }
                    break;
                case "integer":
                case "int":
                case "i":
                    if (!Number.isInteger(value)) {
                        fieldErrors.push(`${key} must be an integer`);
                    }
                    break;
                case "boolean":
                case "bool":
                case "b":
                    if (typeof value !== "boolean") {
                        fieldErrors.push(`${key} must be a boolean`);
                    }
                    break;
                case "array":
                case "arr":
                case "a":
                    if (!Array.isArray(value)) {
                        fieldErrors.push(`${key} must be an array`);
                    }
                    break;
                case "object":
                case "obj":
                case "o":
                    if (typeof value !== "object" ||
                        Array.isArray(value) ||
                        value === null) {
                        fieldErrors.push(`${key} must be an object`);
                    }
                    break;
                case "min":
                    if (typeof value === "string" && value.length < parseInt(param)) {
                        fieldErrors.push(`${key} must be at least ${param} characters long`);
                    }
                    if (typeof value === "number" && value < parseInt(param)) {
                        fieldErrors.push(`${key} must be at least ${param}`);
                    }
                    if (Array.isArray(value) && value.length < parseInt(param)) {
                        fieldErrors.push(`${key} must have at least ${param} items`);
                    }
                    break;
                case "max":
                    if (typeof value === "string" && value.length > parseInt(param)) {
                        fieldErrors.push(`${key} must not exceed ${param} characters`);
                    }
                    if (typeof value === "number" && value > parseInt(param)) {
                        fieldErrors.push(`${key} must not exceed ${param}`);
                    }
                    if (Array.isArray(value) && value.length > parseInt(param)) {
                        fieldErrors.push(`${key} must not exceed ${param} items`);
                    }
                    break;
                case "between": {
                    const [min, max] = param.split(",");
                    if (typeof value === "number" &&
                        (value < parseInt(min) || value > parseInt(max))) {
                        fieldErrors.push(`${key} must be between ${min} and ${max}`);
                    }
                    if (typeof value === "string" &&
                        (value.length < parseInt(min) || value.length > parseInt(max))) {
                        fieldErrors.push(`${key} must be between ${min} and ${max} characters`);
                    }
                    break;
                }
                case "in": {
                    const values = param.split(",");
                    if (!values.includes(String(value))) {
                        fieldErrors.push(`${key} must be one of: ${values.join(", ")}`);
                    }
                    break;
                }
                case "not_in": {
                    const values = param.split(",");
                    if (values.includes(String(value))) {
                        fieldErrors.push(`${key} must not be one of: ${values.join(", ")}`);
                    }
                    break;
                }
                case "email": {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        fieldErrors.push(`${key} must be a valid email`);
                    }
                    break;
                }
                case "same": {
                    const otherValue = data[param];
                    if (value !== otherValue) {
                        fieldErrors.push(`${key} must be the same as ${param}`);
                    }
                    break;
                }
                case "diff":
                case "different": {
                    const otherValue = data[param];
                    if (value === otherValue) {
                        fieldErrors.push(`${key} must be different from ${param}`);
                    }
                    break;
                }
            }
        }
        if (regexRules && regexRules[key] !== undefined) {
            const regex = regexRules[key] instanceof RegExp
                ? regexRules[key]
                : new RegExp(regexRules[key]);
            if (!regex.test(value)) {
                fieldErrors.push(`${key} format is invalid`);
            }
        }
        if (fieldErrors.length > 0) {
            isValid = false;
            errors[key] = fieldErrors;
        }
    }
    return {
        valid: isValid,
        validErrors: errors,
    };
}
export function validateBody(schema, regexRules) {
    return (req, res, next) => {
        const validationResult = req.valid(schema, regexRules);
        if (!validationResult.valid) {
            const errorResponse = res.FF._400_formatter(validationResult.validErrors);
            res.status(400).json(errorResponse);
            return;
        }
        next();
    };
}
