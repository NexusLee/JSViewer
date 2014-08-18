define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/json",
        "dojo/query",
        "dojo/on",
        "dojo/aspect",
        "dojo/dom-style",
        "dojo/dom-attr",
        "dijit/registry",
        "dojo/request/xhr",
        "com/hdsx/jsviewer/_Widget",
        "dojo/text!./templates/_BaseWidget.html",
        "dojo/domReady!"],
    function (declare, lang, array,JSON, query, on, aspect, domStyle, domAttr, registry, xhr,_Widget, template) {
        return declare([_Widget], {
            constructor: function (/*Object*/ params) {
                this.connects = [];
                this.widgets = {};
            },
            _module: "com/hdsx/jsviewer",
            templateString: template,
            panels: null,
            panelIndex: -1,
            configUrl: "",
            configData: null,
            configDataType: "",

            postMixInProperties: function () {
                if (this.icon === "") {
                    this.icon = "assets/images/icons/i_pushpin.png";
                }
                if (this.config !== "") {
                    // Triggers XHR call for the config file
                    this.setConfig(this.config);
                }
            },

            postCreate: function () {
                // Wire up the map
                try {
//                    var tt = registry.byId(this.mapId);
//                    this.setMap(tt);
                }
                catch (err) {
                    console.error(err);
                }

                // If there are multiple panels, show the first only
                this.panels = query(".widgetPanel", this.domNode);
                this.panels.forEach(function (item, idx, arr) {
                    item.buttonIcon = domAttr.get(item, "buttonIcon");
                    item.buttonText = domAttr.get(item, "buttonText");
                });
                this.showPanel(0);
                //console.log("_BaseWidget postCreate finished");
            },

            onShowPanel: function (index) {
                // Listened to by WidgetFrame. Allows widget to request that the
                // Frame resize and show the indicated panel
            },

            showPanel: function (/*Number*/ index) {
                this.panelIndex = index;
                array.forEach(this.panels, function (item, idx, arr) {
                    if (idx === index) {
                        domStyle.set(item, "display", "block");
                    }
                    else {
                        domStyle.set(item, "display", "none");
                    }
                });
            },

            startup: function () {
                if (this._started) {
                    return;
                }
                //console.log("_BaseWidget startup " + this.title);
                // Pass to children
                var children = this.getChildren();
                array.forEach(children, function (child) {
                    child.startup();
                });

                // Interact with the WidgetFrame
                var frame = this.getParent();
                if (frame && frame.declaredClass === "com.hdsx.jsviewer.WidgetFrame") {
                    this.connects.push(aspect.after(this, "onShowPanel", frame.selectPanel));
                }

                // If the class mixes in _MapGraphicsMaintainer, init it
                if (this.connectMapClick) {
                    this.connectMapClick();
                }

                this.inherited(arguments);
            },

            shutdown: function () {
                // subclasses override to cleanup on closing
            },

            uninitialize: function () {
                console.log("_BaseWidget uninitialize");
                array.forEach(this.connects, function (handle) {
                    handle.remove();
                });
                this.connects = [];
            },

            setConfig: function (/* String */ config) {
                this.inherited(arguments);
                this.configUrl = require.toUrl("com/hdsx/jsviewer/" + config);
                //console.info("_BaseWidget::" + this.configUrl);
                if (this.config) {
                    if (this.config.match("\.json$")) {
                        this.configDataType = "json";
                    }
                    else if (this.config.match("\.xml$")) {
                        this.configDataType = "xml";
                    }
                    else {
                        this.configDataType = "text";
                    }

                    xhr(this.configUrl, {
                        handleAs: this.configDataType,
                        sync: true
                    }).then(function (response) {
                        this.configData = response;
                        return response; // Always return response
                    }, function (err) {
                        console.error("failed to retrieve config for Widget", err);
                        return err; // Always return response
                    });
                }
            },

            getAllNamedChildDijits: function () {
                // Gather all child widgets
                var w = query("[widgetId]", this.containerNode || this.domNode);
                var children = w.map(registry.byNode);

                this.widgets = {};
                children.forEach(lang.hitch(this, function (item, idx) {
                    //console.debug(idx + ": " + item.declaredClass + " name: " + item.name);
                    if (item.name) {
                        this.widgets[item.name] = item;
                    }
                }));
            }
        });
    });