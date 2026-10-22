import FalconFrame from "./index.js";
import { CombinedVars } from "./types.js";
export interface RenderHTMLOptions {
    templatePath: string;
    data?: Record<string, any>;
    FF?: FalconFrame<any>;
    noLayout?: boolean;
    FFVar?: CombinedVars<any>;
    /** don't use, used internally */
    _renderedPaths?: string[];
}
export declare function renderHTML(options: RenderHTMLOptions): string;
export declare function interpolate(template: string, data: Record<string, any>): string;
export declare function expandLoops(template: string, data: Record<string, any>): string;
