import { RouteHandler, ValidationResult, ValidationSchema } from "./types.js";
export interface ValidateBody {
    schema: ValidationSchema;
    data: any;
    regexRules: Record<string, RegExp | string>;
    isBodyParsed: boolean;
}
export declare function validate(opts: ValidateBody): ValidationResult;
export declare function validateBody(schema: ValidationSchema, regexRules?: Record<string, RegExp | string>): RouteHandler;
