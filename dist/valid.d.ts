import { RouteHandler, ValidationResult, ValidationSchema } from "./types.js";
export declare function validate(schema: ValidationSchema, data: any): ValidationResult;
export declare function validateBody(schema: ValidationSchema): RouteHandler;
