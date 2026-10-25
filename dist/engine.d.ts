import { FalconFrame } from "./index.js";
export interface OfflineRequest {
    method?: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
    cookies?: Record<string, string>;
}
export interface OfflineResponse {
    status: number;
    headers: Record<string, string>;
    body: any;
}
export declare class OfflineEngine {
    private ff;
    constructor(ff: FalconFrame<any>);
    handle(request: OfflineRequest): Promise<OfflineResponse>;
    private buildResponse;
}
