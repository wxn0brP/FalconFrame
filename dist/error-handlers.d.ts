import type { ErrorHandler, FinalHandler, ValidationErrorFormatter } from "./types.js";
export declare class ErrorHandlers {
    _400_formatter: ValidationErrorFormatter;
    _404: FinalHandler;
    _413: FinalHandler;
    _408: FinalHandler;
    _500: ErrorHandler;
    _500Api: ErrorHandler;
    _404Api: FinalHandler;
    _413Api: FinalHandler;
    _408Api: FinalHandler;
    set400Formatter(formatter: ValidationErrorFormatter): void;
    set404(handler: FinalHandler): void;
    set413(handler: FinalHandler): void;
    set408(handler: FinalHandler): void;
    set500(handler: ErrorHandler): void;
    set500Api(handler: ErrorHandler): void;
    set404Api(handler: FinalHandler): void;
    set413Api(handler: FinalHandler): void;
    set408Api(handler: FinalHandler): void;
}
