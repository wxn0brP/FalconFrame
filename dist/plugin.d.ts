import { RouteHandler } from "./types.js";
export type PluginId = string;
export interface Plugin {
    id: PluginId;
    process: RouteHandler;
    before?: PluginId | PluginId[];
    after?: PluginId | PluginId[];
}
export interface PluginOptions {
    before?: PluginId | PluginId[];
    after?: PluginId | PluginId[];
    optional?: boolean;
}
/**
 * @deprecated
 * The `PluginSystem` class is deprecated and should not be used in new projects.
 *
 * ⚠️ Notes:
 * - It may be refactored in the future, but any refactor will introduce breaking changes.
 * - If your system currently relies on it and it works, you may continue using it.
 * - If it does not work in your setup, it is recommended to skip it or wait for an update.
 */
export declare class PluginSystem {
    private plugins;
    private executionOrder;
    /**
     * Registers a new plugin in the system
     * @param plugin - Plugin to register
     * @param options - Options for positioning plugins
     */
    register(plugin: Plugin, options?: PluginOptions): void;
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
