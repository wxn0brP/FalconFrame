import { RouteHandler } from "./types.js";
type PluginId = string;
interface Plugin {
    id: PluginId;
    process: RouteHandler;
    priority?: number;
}
export declare class PluginSystem {
    private plugins;
    private executionOrder;
    /**
     * Registers a new plugin in the system
     * @param plugin - Plugin to register
     * @param options - Options for positioning plugins
     */
    register(plugin: Plugin, options?: {
        before?: PluginId;
        after?: PluginId;
    }): void;
    /**
     * Updates the execution order of plugins
     * @param pluginId - ID of the plugin to position
     * @param options - Options for positioning
     */
    private updateExecutionOrder;
    /**
     * Returns a RouteHandler that executes all registered plugins in the correct order
     */
    getRouteHandler(): RouteHandler;
    /**
     * Recursively executes plugins in the correct order
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function
     * @param index - Current index in the execution order
     */
    private executePlugins;
    /**
     * Returns the list of plugins in the execution order
     */
    getPluginsInOrder(): Plugin[];
}
export {};
