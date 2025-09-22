import { RouteHandler } from "./types";

export type PluginId = string;

export interface Plugin {
    id: PluginId;
    process: RouteHandler;
    priority?: number;
}

export interface PluginOptions {
    before?: PluginId | PluginId[];
    after?: PluginId | PluginId[];
    optional?: boolean;
}

export class PluginSystem {
    private plugins: Plugin[] = [];
    private executionOrder: PluginId[] = [];

    /**
     * Registers a new plugin in the system
     * @param plugin - Plugin to register
     * @param options - Options for positioning plugins
     */
    register(
        plugin: Plugin,
        options?: PluginOptions
    ): void {
        if (this.plugins.some(p => p.id === plugin.id)) {
            throw new Error(`Plugin with id '${plugin.id}' already registered`);
        }

        this.plugins.push(plugin);
        this.updateExecutionOrder(plugin.id, options);
    }

    /**
     * Updates the execution order of plugins
     * @param pluginId - ID of the plugin to position
     * @param options - Options for positioning
     */
    private updateExecutionOrder(
        pluginId: PluginId,
        options?: PluginOptions
    ): void {
        if (this.executionOrder.includes(pluginId)) return;

        const resolveTarget = (target: PluginId | PluginId[] | undefined): PluginId | null => {
            if (!target) return null;
            const list = Array.isArray(target) ? target : [target];
            return list.find(id => this.executionOrder.includes(id)) || null;
        };

        const beforeTarget = resolveTarget(options?.before);
        const afterTarget = resolveTarget(options?.after);

        if (beforeTarget) {
            const index = this.executionOrder.indexOf(beforeTarget);
            this.executionOrder.splice(index, 0, pluginId);
        } else if (afterTarget) {
            const index = this.executionOrder.indexOf(afterTarget);
            this.executionOrder.splice(index + 1, 0, pluginId);
        } else if (options?.before || options?.after) {
            if (options.optional) {
                this.executionOrder.push(pluginId); // fallback: add to the end
            } else {
                throw new Error(
                    `Plugin dependency not found for '${pluginId}': ` +
                    `before=${JSON.stringify(options?.before)}, ` +
                    `after=${JSON.stringify(options?.after)}`
                );
            }
        } else {
            this.executionOrder.push(pluginId);
        }
    }

    /**
     * Returns a RouteHandler that executes all registered plugins in the correct order
     */
    getRouteHandler(): RouteHandler {
        return (req: any, res: any, next: () => void) => {
            this.executePlugins(req, res, next, 0);
        };
    }

    /**
     * Recursively executes plugins in the correct order
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function
     * @param index - Current index in the execution order
     */
    private executePlugins(
        req: any,
        res: any,
        next: () => void,
        index: number
    ): void {
        if (index >= this.executionOrder.length) {
            next();
            return;
        }

        const pluginId = this.executionOrder[index];
        const plugin = this.plugins.find(p => p.id === pluginId);

        if (!plugin) {
            throw new Error(`Plugin '${pluginId}' not found`);
        }

        plugin.process(req, res, () => {
            this.executePlugins(req, res, next, index + 1);
        });
    }

    /**
     * Returns the list of plugins in the execution order
     */
    getPluginsInOrder(): Plugin[] {
        return this.executionOrder
            .map(id => this.plugins.find(p => p.id === id))
            .filter((p): p is Plugin => p !== undefined);
    }
}
