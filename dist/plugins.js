export class PluginSystem {
    plugins = [];
    executionOrder = [];
    /**
     * Registers a new plugin in the system
     * @param plugin - Plugin to register
     * @param options - Options for positioning plugins
     */
    register(plugin, options) {
        if (this.plugins.some(p => p.id === plugin.id)) {
            throw new Error(`Plugin with id '${plugin.id}' already registered`);
        }
        // Add plugin to the list
        this.plugins.push(plugin);
        // Update the execution order
        this.updateExecutionOrder(plugin.id, options);
    }
    /**
     * Updates the execution order of plugins
     * @param pluginId - ID of the plugin to position
     * @param options - Options for positioning
     */
    updateExecutionOrder(pluginId, options) {
        if (this.executionOrder.includes(pluginId))
            return;
        const resolveTarget = (target) => {
            if (!target)
                return null;
            const list = Array.isArray(target) ? target : [target];
            return list.find(id => this.executionOrder.includes(id)) || null;
        };
        const beforeTarget = resolveTarget(options?.before);
        const afterTarget = resolveTarget(options?.after);
        if (beforeTarget) {
            const index = this.executionOrder.indexOf(beforeTarget);
            this.executionOrder.splice(index, 0, pluginId);
        }
        else if (afterTarget) {
            const index = this.executionOrder.indexOf(afterTarget);
            this.executionOrder.splice(index + 1, 0, pluginId);
        }
        else if (options?.before || options?.after) {
            if (options.optional) {
                this.executionOrder.push(pluginId); // fallback: add to the end
            }
            else {
                throw new Error(`Plugin dependency not found for '${pluginId}': ` +
                    `before=${JSON.stringify(options?.before)}, ` +
                    `after=${JSON.stringify(options?.after)}`);
            }
        }
        else {
            this.executionOrder.push(pluginId);
        }
    }
    /**
     * Returns a RouteHandler that executes all registered plugins in the correct order
     */
    getRouteHandler() {
        return (req, res, next) => {
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
    executePlugins(req, res, next, index) {
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
    getPluginsInOrder() {
        return this.executionOrder
            .map(id => this.plugins.find(p => p.id === id))
            .filter((p) => p !== undefined);
    }
}
