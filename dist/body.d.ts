import FalconFrame from "./index.js";
import { FFRequest, ParseBody } from "./types.js";
export declare function parseBody(req: FFRequest, body: string, FF: FalconFrame): Promise<ParseBody>;
