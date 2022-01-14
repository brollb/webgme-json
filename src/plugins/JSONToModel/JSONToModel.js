/*globals define*/
/*eslint-env node, browser*/

/**
 * Generated by PluginGenerator 2.20.5 from webgme on Thu Jan 13 2022 11:29:56 GMT-0600 (Central Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'webgme-json/jsonFunctions',
    'q'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase,
    JsonFunctions,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of JSONToModel.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin JSONToModel.
     * @constructor
     */
    function JSONToModel() {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    }

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructure etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    JSONToModel.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    JSONToModel.prototype = Object.create(PluginBase.prototype);
    JSONToModel.prototype.constructor = JSONToModel;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(Error|null, plugin.PluginResult)} callback - the result callback
     */
    JSONToModel.prototype.main = function (callback) {
        // Use this to access core, project, result, logger etc from PluginBase.
        const self = this;
        const core = self.core;
        const META = self.META;
        const mainNode = self.activeNode;
        const logger = self.logger;
        const config = self.getCurrentConfig();

        JsonFunctions.buidJSONDictionary(mainNode, core, META, Q, logger)
        .then(dictionary => {
            JsonFunctions.JSONToModel(dictionary, JSON.parse(config.jsonText), '', core.getAttribute(mainNode, 'name'), core.getParent(mainNode), core, META, logger);
            return self.save('Imported JSON');
        })
        .then(() => {
            self.result.setSuccess(true);
            callback(null, self.result);
        })
        .catch(err => {
            self.logger.error(err.stack);
            callback(err, null);
        });
    };

    return JSONToModel;
});