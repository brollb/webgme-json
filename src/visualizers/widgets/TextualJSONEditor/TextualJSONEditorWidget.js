/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Tue Jan 11 2022 13:14:10 GMT-0600 (Central Standard Time).
 */

define(['css!./styles/TextualJSONEditorWidget.css', 'vs/loader','vs/editor/editor.main'], function () {
    'use strict';

    var WIDGET_CLASS = 'textual-j-s-o-n-editor';

    function TextualJSONEditorWidget(logger, container) {
        this._logger = logger.fork('Widget');

        this._el = container;

        this.nodes = {};
        this._initialize();

        this._logger.debug('ctor finished');
    }

    TextualJSONEditorWidget.prototype._initialize = function () {
        console.log(monaco);
        var width = this._el.width(),
            height = this._el.height(),
            self = this;

        // set widget class
        this._el.addClass(WIDGET_CLASS);

        // Create a dummy header
        this._el.append('<h3>TextualJSONEditor Events:</h3>');

        // Registering to events can be done with jQuery (as normal)
        this._el.on('dblclick', function (event) {
            event.stopPropagation();
            event.preventDefault();
            self.onBackgroundDblClick();
        });
    };

    TextualJSONEditorWidget.prototype.onWidgetContainerResize = function (width, height) {
        this._logger.debug('Widget is resizing...');
    };

    // Adding/Removing/Updating items
    TextualJSONEditorWidget.prototype.addNode = function (desc) {
        if (desc) {
            // Add node to a table of nodes
            var node = document.createElement('div'),
                label = 'children';

            if (desc.childrenIds.length === 1) {
                label = 'child';
            }

            this.nodes[desc.id] = desc;
            node.innerHTML = 'Adding node "' + desc.name + '" (click to view). It has ' +
                desc.childrenIds.length + ' ' + label + '.';

            this._el.append(node);
            node.onclick = this.onNodeClick.bind(this, desc.id);
        }
    };

    TextualJSONEditorWidget.prototype.removeNode = function (gmeId) {
        var desc = this.nodes[gmeId];
        this._el.append('<div>Removing node "' + desc.name + '"</div>');
        delete this.nodes[gmeId];
    };

    TextualJSONEditorWidget.prototype.updateNode = function (desc) {
        if (desc) {
            this._logger.debug('Updating node:', desc);
            this._el.append('<div>Updating node "' + desc.name + '"</div>');
        }
    };

    /* * * * * * * * Visualizer event handlers * * * * * * * */

    TextualJSONEditorWidget.prototype.onNodeClick = function (/*id*/) {
        // This currently changes the active node to the given id and
        // this is overridden in the controller.
    };

    TextualJSONEditorWidget.prototype.onBackgroundDblClick = function () {
        this._el.append('<div>Background was double-clicked!!</div>');
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    TextualJSONEditorWidget.prototype.destroy = function () {
    };

    TextualJSONEditorWidget.prototype.onActivate = function () {
        this._logger.debug('TextualJSONEditorWidget has been activated');
    };

    TextualJSONEditorWidget.prototype.onDeactivate = function () {
        this._logger.debug('TextualJSONEditorWidget has been deactivated');
    };

    return TextualJSONEditorWidget;
});
