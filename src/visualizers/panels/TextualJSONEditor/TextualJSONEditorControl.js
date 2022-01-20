/*globals define, WebGMEGlobal*/
/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Tue Jan 11 2022 13:14:10 GMT-0600 (Central Standard Time).
 */

define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames',
    'blob/BlobClient',
    'q'
], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames,
    BlobClient,
    Q
) {

    'use strict';

    function TextualJSONEditorControl(options) {

        this._logger = options.logger.fork('Control');

        this._client = options.client;

        // Initialize core collections and variables
        this._widget = options.widget;

        this._currentNodeId = null;
        this._currentNodeParentId = undefined;

        this._bc = new BlobClient({logger: this._logger.fork('BlobClient')});

        this._initWidgetEventHandlers();

        this._logger.debug('ctor finished');
    }

    TextualJSONEditorControl.prototype._initWidgetEventHandlers = function () {
        this._widget.onNodeClick = function (id) {
            // Change the current active object
            WebGMEGlobal.State.registerActiveObject(id);
        };
    };

    /* * * * * * * * Visualizer content update callbacks * * * * * * * */
    // One major concept here is with managing the territory. The territory
    // defines the parts of the project that the visualizer is interested in
    // (this allows the browser to then only load those relevant parts).
    TextualJSONEditorControl.prototype.selectedObjectChanged = function (nodeId) {
        var self = this;

        self._logger.debug('activeObject nodeId \'' + nodeId + '\'');

        // Remove current territory patterns
        if (self._currentNodeId) {
            self._client.removeUI(self._territoryId);
        }

        self._currentNodeId = nodeId;
        self._currentNodeParentId = undefined;

        if (typeof self._currentNodeId === 'string') {
            // Put new node's info into territory rules
            self._selfPatterns = {};
            self._selfPatterns[nodeId] = {children: -1};  // Territory "rule"

            // self._widget.setTitle(desc.name.toUpperCase());

            self._currentNodeParentId = self._client.getNode(nodeId).getParentId();

            self._territoryId = self._client.addUI(self, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            self._client.updateTerritory(self._territoryId, self._selfPatterns);
        }
    };

    TextualJSONEditorControl.prototype._getPluginNamespace = function() {
        const node = this._client.getNode(this._currentNodeId);
        if (node) {
            const meta = this._client.getNode(node.getMetaTypeId());
            if (meta) {
                const name = meta.getAttribute('name');
                const fullName = meta.getFullyQualifiedName();
    
                if (name.length === fullName.length) {
                    return '';
                } else {
                    return fullName.substring(0, fullName.length - (name.length+1) );
                }
            }
        }
        return '';
    };

    TextualJSONEditorControl.prototype.buildJSON = function() {
        const deferred = Q.defer();
        console.log('building');

        const context = this._client.getCurrentPluginContext('ModelToJSON', this._currentNodeId, []);
        context.pluginConfig = {};
        context.managerConfig.namespace = this._getPluginNamespace();

        this._client.runBrowserPlugin('ModelToJSON', context, (err, result) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result.messages[0].message);
            }
        });
        return deferred.promise;
    };

    TextualJSONEditorControl.prototype.saveJSON = function(jsonText) {
        const deferred = Q.defer();
        console.log('saving');
        const context = this._client.getCurrentPluginContext('JSONToModel',this._currentNodeId, []);
        context.pluginConfig = {jsonText: jsonText};
        context.managerConfig.namespace = this._getPluginNamespace();

        this._client.runBrowserPlugin('JSONToModel', context, (err, result) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result.messages[0].message);
            }
        });
        return deferred.promise;   
    };

    TextualJSONEditorControl.prototype.exportJSON = function(jsonText) {
        const deferred = Q.defer();
        console.log('exporting');
        const context = this._client.getCurrentPluginContext('ExportJSON',this._currentNodeId, []);
        context.pluginConfig = {jsonText: jsonText, name: this._client.getNode(this._currentNodeId).getAttribute('name')};
        context.managerConfig.namespace = this._getPluginNamespace();

        this._client.runBrowserPlugin('ExportJSON', context, (err, result) => {
            if (err) {
                deferred.reject(err);
            } else {
                window.open(this._bc.getDownloadURL(result.artifacts[0]),'_blank');
            }
        });
        return deferred.promise;   
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    TextualJSONEditorControl.prototype._eventCallback = function (events) {
        var i = events ? events.length : 0,
            event;

        this._logger.debug('_eventCallback \'' + i + '\' items');

        if (events[0].etype === CONSTANTS.TERRITORY_EVENT_COMPLETE) {
            let jsonValueString = this.buildJSON()
            .then(jsonValue => {
                this._widget.setJSON(jsonValue);
            })
            .catch(err => {
                console.err(err);
            })
        }
    };

    TextualJSONEditorControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    TextualJSONEditorControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        this._removeToolbarItems();
    };

    TextualJSONEditorControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    TextualJSONEditorControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    TextualJSONEditorControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();

        if (typeof this._currentNodeId === 'string') {
            WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
        }
    };

    TextualJSONEditorControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    TextualJSONEditorControl.prototype.onJsonValidityChanged = function (isValid) {
        if (isValid) {
            this.$btnSave.enabled(true);
        } else {
            this.$btnSave.enabled(false);
        }
    };

    /* * * * * * * * * * Updating the toolbar * * * * * * * * * */
    TextualJSONEditorControl.prototype._displayToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].show();
            }
        } else {
            this._initializeToolbar();
        }
    };

    TextualJSONEditorControl.prototype._hideToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].hide();
            }
        }
    };

    TextualJSONEditorControl.prototype._removeToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].destroy();
            }
        }
    };

    TextualJSONEditorControl.prototype._initializeToolbar = function () {
        var self = this,
            toolBar = WebGMEGlobal.Toolbar;

        this._toolbarItems = [];

        this._toolbarItems.push(toolBar.addSeparator());

        this.$btnSave = toolBar.addButton({
            title: 'Save',
            icon: 'glyphicon glyphicon-floppy-save',
            clickFn: function (/*data*/) {
               let jsonValue = self._widget.getJSON();
               self.saveJSON(jsonValue);
            }
        });
        this._toolbarItems.push(this.$btnSave);
        this.$btnSave.show();
        this.$btnSave.enabled(false);

        this.$btnExport = toolBar.addButton({
            title: 'Export',
            icon: 'glyphicon glyphicon-export',
            clickFn: function (/*data*/) {
               let jsonValue = self._widget.getJSON();
               self.exportJSON(jsonValue);
            }
        });
        this._toolbarItems.push(this.$btnExport);
        this.$btnExport.show();

        this._toolbarInitialized = true;
    };

    return TextualJSONEditorControl;
});
