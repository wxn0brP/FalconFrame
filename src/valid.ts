import { ValidationResult, ValidationSchema } from "./types";

export function validate(
	schema: ValidationSchema,
	data: any,
): ValidationResult {
	const errors: any = {};
	let isValid = true;

	for (const key in schema) {
		const rules = schema[key].split("|");
		const value = data[key];
		const fieldErrors: string[] = [];

		for (const rule of rules) {
			const [ruleName, param] = rule.split(":");
			switch (ruleName) {
				case "required":
					if (!value && value !== 0) {
						fieldErrors.push(`${key} is required`);
					}
					break;
				case "string":
					if (typeof value !== "string") {
						fieldErrors.push(`${key} must be a string`);
					}
					break;
				case "number":
					if (typeof value !== "number") {
						fieldErrors.push(`${key} must be a number`);
					}
					break;
				case "min":
					if (
						typeof value === "string" &&
						value.length < parseInt(param)
					) {
						fieldErrors.push(
							`${key} must be at least ${param} characters long`,
						);
					}
					if (typeof value === "number" && value < parseInt(param)) {
						fieldErrors.push(`${key} must be at least ${param}`);
					}
					break;
				case "max":
					if (
						typeof value === "string" &&
						value.length > parseInt(param)
					) {
						fieldErrors.push(
							`${key} must not exceed ${param} characters`,
						);
					}
					if (typeof value === "number" && value > parseInt(param)) {
						fieldErrors.push(`${key} must not exceed ${param}`);
					}
					break;
				case "email":
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(value)) {
						fieldErrors.push(`${key} must be a valid email`);
					}
					break;
			}
		}

		if (fieldErrors.length > 0) {
			isValid = false;
			errors[key] = fieldErrors;
		}
	}

	return { valid: isValid, validErrors: errors };
}
