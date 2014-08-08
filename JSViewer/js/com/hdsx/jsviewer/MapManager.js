define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dojo/topic",
        "dojo/on",
        "dojo/dom",
        "dojo/dom-style",
        "esri/map",
        "esri/geometry/Extent",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/toolbars/navigation",
        "esri/toolbars/draw",
        "dojo/i18n!./js/com/hdsx/jsviewer/nls/MapManagerStrings.js",
        "com/hdsx/jsviewer/Highlight",
        "com/hdsx/jsviewer/InfoPopup",
        "dojo/domReady!"],
    function (declare, lang, array,
              _WidgetBase, _TemplatedMixin, topic, on,
              dom, domStyle, Map, Extent,
              ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer,
              Navigation, Draw,
              MapManagerStrings, Highlight, InfoPopup) {
        return declare([_WidgetBase, _TemplatedMixin], {
            constructor: function (/*Object*/params) {
                this.pinnedInfoPopups = [];
                this.toolNames = {};
            },

            templateString: "<div style='display: none;'></div>",
            configLoadedEventSubscribe: null,
            i18nStrings: MapManagerStrings,
            toolNames: null,

            configData: null,
            mapId: "",
            map: null,

            navToolbar: null,
            drawToolbar: null,

            _drawEventHandle: null,

            infoPopup: null,
            highlight: null,

            postMixInProperties: function () {
                //console.log("MapManager postMixInProperties");
                // If no "mapId" attr has been set, assume the id of the
                // div to create the esri.Map with is "map"
                if (this.mapId === "") {
                    this.mapId = "map";
                }
                this.toolNames[Navigation.PAN] = this.i18nStrings.navPanTool;
                this.toolNames[Navigation.ZOOM_IN] = this.i18nStrings.navZoomInTool;
                this.toolNames[Navigation.ZOOM_OUT] = this.i18nStrings.navZoomOutTool;
            },

            postCreate: function () {
                //console.log("MapManager postCreate");
                this.configLoadedEventSubscribe = topic.subscribe("config/configLoadedEvent",lang.hitch(this,this.onConfig));
                topic.subscribe("menuItemClickedEvent", lang.hitch(this, this.onMenuClick));
                topic.subscribe("widgetHighlightEvent", lang.hitch(this, this.onWidgetHighlight));
                topic.subscribe("widgetNavRequestEvent", lang.hitch(this, this.onNavRequest));
                topic.subscribe("widgetDrawRequestEvent", lang.hitch(this, this.onDrawRequest));
                topic.subscribe("mapResizeRequestEvent", lang.hitch(this, this.onResizeRequest));
            },

            startup: function () {
                //console.log("MapManager startup");
                if (this.highlight === null) {
                    var theDiv = document.createElement("div");
                    var mapDiv = dom.byId(this.map.id);
                    mapDiv.appendChild(theDiv);
                    this.highlight = new Highlight({map: this.map}, theDiv);
                }
            },

            onConfig: function (configData) {
                //console.log("MapManager::onConfig");
                this.configData = configData;
                // Unsubscribe from the event
                this.configLoadedEventSubscribe.remove();
                var params = {
                    slider: false,
//                    sliderStyle:"large",
//                    sliderLabels:[3,,4,5,6,7,8,9,0],
                    isPanArrows: false,
                    logo: false
                };

                // Initial extent defined?
                if (configData.map.initialExtent) {
                    var ext = configData.map.initialExtent;
//                    params.extent = new Extent(ext[0], ext[1], ext[2], ext[3], null);
                }

                this.map = new Map(this.mapId, params);

                var mapLoadHandle = on(this.map, "load", lang.hitch(this, function (map) {
                    // Ensure that the extent is what we asked for
                    setTimeout(lang.hitch(this, function () {
                        if (this.map.extent !== params.extent) {
//                            this.map.setExtent(params.extent);
                        }
                    }), 1000);

//                    // Move the zoom slider down
//                    if (!this.map._slider) {
//                        console.error("Possible JS API change, private member _slider not available");
//                    }
//                    else {
////                        domStyle.set(this.map._slider.domNode, {
////                            top: "100px",
////                            left: "25px"
////                        });
//                    }

                    // Init toolbars
                    this.navToolbar = new Navigation(this.map);
                    this.drawToolbar = new Draw(this.map);

                    // Connect layer change events
                    on(this.map, "layer-add", function (layer) {
                        topic.publish("layerAddedEvent", layer);
                    });
                    on(this.map, "layer-reorder", function (layer, index) {
                        topic.publish("layerReorderedEvent", layer, index);
                    });

                    // Listen to shift-esc combination to deactivate the toolbars
                    on(this.map, "key-down", lang.hitch(this, function (evt) {
                        if (evt.keyCode === 27 && evt.shiftKey === true) {
                            this.onNavRequest(null);
                        }
                    }));
                    topic.publish("mapLoadedEvent", this.map);
                    mapLoadHandle.remove();
                }));

                // Base Map Layers (when first base map is loaded, live maps follow
                for (var i = 0; i < this.configData.map.baseMaps.length; i++) {
                    this.loadMapService(this.configData.map.baseMaps[i], true);
                }
            },

            loadMapService: function (mapServiceInfo, /*boolean*/ isBaseMap) {
                try {
                    var layer = null;
                    if (mapServiceInfo.type === "tiled") {
                        layer = new ArcGISTiledMapServiceLayer(mapServiceInfo.url, {
                            id: mapServiceInfo.label,
                            opacity: parseFloat(mapServiceInfo.alpha),
                            visible: mapServiceInfo.visible
                        });
                    }
                    else if (mapServiceInfo.type === "dynamic") {
                        layer = new ArcGISDynamicMapServiceLayer(mapServiceInfo.url, {
                            id: mapServiceInfo.label,
                            opacity: parseFloat(mapServiceInfo.alpha),
                            visible: mapServiceInfo.visible
                        });
                    }
                    if (layer) {
                        // Assign a "BASE" or "LIVE" tag to each layer
                        // This allows the LiveMapsWidget to manage the LIVE maps
                        layer.layerCategory = (isBaseMap) ? "BASE" : "LIVE";
                        this.map.addLayer(layer);
                        if (layer.loaded) {
                            // IE caching behavior, loaded is true right away.
                            this.map.addLayer(layer);
                            var f = lang.hitch(this,this._layerLoadHandler,layer);
                            f();
                        }
                        else {
                            on(layer, "load", lang.hitch(this, this._layerLoadHandler, layer));
                        }
                    }
                }
                catch (err) {
                    console.error("Loading map service at url: " + mapServiceInfo.url);
                }
            },

            _layerLoadHandler: function (layer) {
                this.map.addLayer(layer);
                if (layer.layerCategory === "BASE" && this.map.layerIds.length === 1) {
                    // this is the first Base map to load, start adding Live maps
                    for (var i = 0; i < this.configData.map.liveMaps.length; i++) {
                        this.loadMapService(this.configData.map.liveMaps[i], false);
                    }
                }
            },

            onMenuClick: function (data) {
                if (data && data.value && data.menuCode) {
                    if (data.menuCode === "basemaps.mapservice") {
                        // User has chosen a basemap
                        // Make it visible
                        // Make other basemaps hidden
                        array.forEach(this.map.layerIds, lang.hitch(this, function (id) {
                            var layer = this.map.getLayer(id);
                            // Only change vis of base maps
                            if (layer.layerCategory && layer.layerCategory === "BASE") {
                                if (id === data.value) {
                                    layer.show();
                                }
                                else {
                                    layer.hide();
                                }
                            }
                        }));
                    }

                    if (data.menuCode === "navtools.navtool") {
                        switch (data.value) {
                            case "pan":
                                this.onNavRequest(Navigation.PAN, this.toolNames[Navigation.PAN]);
                                break;
                            case "zoomin":
                                this.onNavRequest(Navigation.ZOOM_IN, this.toolNames[Navigation.ZOOM_IN]);
                                break;
                            case "zoomout":
                                this.onNavRequest(Navigation.ZOOM_OUT, this.toolNames[Navigation.ZOOM_OUT]);
                                break;
                            case "zoomfull":
                                this.zoomToFullExtent();
                                break;
                        }
                    }
                }
            },

            onWidgetHighlight: function (/*esri.Graphic*/ g, /*esri.geometry.Point*/ location, /*boolean*/ forceNav, /*Number*/ zoomScale) {
                // g is the graphic in the map that the widget wants highlighted and infoboxed
                if (g && location) {
                    try {
                        // Pan & zoom map if the location isn't in the center of the map
                        if (forceNav) {
                            var zoomToExt = null;
                            if (zoomScale) {
                                if (typeof zoomScale == "string") {
                                    zoomScale = parseInt(zoomScale);
                                }
                                if (zoomScale > 1) {
                                    var currentScale = util.scale.calculateScale(this.map);
                                    // expand/shrink the scale to match zoomScale
                                    if (zoomScale / currentScale > 2 || zoomScale / currentScale < 0.5) {
                                        zoomToExt = this.map.extent.expand(zoomScale / currentScale);
                                        zoomToExt = zoomToExt.centerAt(location);
                                    }
                                }
                            }
                            if (!zoomToExt) {
                                var ext = this.map.extent.expand(0.5);
                                if (!ext.contains(location)) {
                                    zoomToExt = this.map.extent;
                                    zoomToExt = zoomToExt.centerAt(location);
                                }
                            }

                            if (zoomToExt) {
                                this.map.setExtent(zoomToExt);
                            }
                        }
                        else {
                            if (!this.map.extent.contains(location)) {
                                return;
                            }
                        }

                        // Highlight Result
                        this.highlight.setCoords(location);
                        this.highlight.setMode("flashing");

                        // Show InfoPopup
                        if (this.infoPopup === null) {
                            var theDiv = document.createElement("div");
                            var mapDiv = dom.byId(this.map.id);
                            mapDiv.appendChild(theDiv);
                            var popup = new InfoPopup({map: this.map}, theDiv);
                            this.infoPopup = popup

                            // Connect Close and Pin events
                            // Use of closures to ensure handles are disconnected
                            // and to maintain a link to the correct infoPopup
                            var closeHandle = on(popup, "onClose", lang.hitch(this, function () {
                                closeHandle.remove();
                                if (this.infoPopup === popup) {
                                    this.infoPopup = null;
                                    if (this.highlight) {
                                        this.highlight.setMode("off");
                                    }
                                }
                                else {
                                    for (var i = 0; i < this.pinnedInfoPopups.length; i++) {
                                        if (this.pinnedInfoPopups[i] === popup) {
                                            this.pinnedInfoPopups.splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                                popup.destroyRecursive();
                            }));

                            var pinHandle = on(popup, "onPin", lang.hitch(this, function () {
                                pinHandle.remove();
                                if (this.infoPopup === popup) {
                                    this.infoPopup = null;
                                    this.pinnedInfoPopups.push(popup);
                                    if (this.highlight) {
                                        this.highlight.setMode("off");
                                    }
                                }
                            }));
                        }

                        this.infoPopup.setInfo(g.attributes);
                        this.infoPopup.setCoords(location);
                        if (this.infoPopup.visible === false) {
                            this.infoPopup.show();
                        }
                    }
                    catch (err) {
                        console.error("Error highlighting widget result", err);
                    }
                }
                else {
                    if (this.highlight) {
                        this.highlight.setMode("off");
                    }
                    if (this.infoPopup) {
                        this.infoPopup.hide();
                    }
                }
            },

            onNavRequest: function (/*esri.toolbars.Navigation.navType*/ navType, /*String*/ label) {
                // Deactivate drawing toolbar for starters
                try {
                    if (this._drawEventHandle) {
                        this._drawEventHandle.remove();
                        this._drawEventHandle = null;
                    }
                    this.drawToolbar.deactivate();

                    // Activate the navigation toolbar
                    if (navType) {
                        this.navToolbar.activate(navType);
                        topic.publish("mapToolChangedEvent", label);
                    }
                    else {
                        this.navToolbar.deactivate();
                        topic.publish("mapToolChangedEvent", []);
                    }
                }
                catch (err) {
                    console.error("MapManager::onNavRequest", err);
                }
            },

            onDrawRequest: function (/*Object*/ params) {
                // params should contain the geometryType (see esri.toolbars.Draw constants)
                // and a callback function for onDrawEnd,
                // and the label to display in the status area

                try {
                    // Deactivate navigation toolbars for starters
                    this.navToolbar.deactivate();
                    this.drawToolbar.deactivate();

                    // Disconnect any previous drawing listener
                    if (this._drawEventHandle) {
                        this._drawEventHandle.remove();
                        this._drawEventHandle = null;
                    }

                    // Activate the draw toolbar
                    if (params) {
                        this._drawEventHandle = on(this.drawToolbar, "onDrawEnd", params.onDrawEnd);
                        this.drawToolbar.activate(params.geometryType);
                        topic.publish("mapToolChangedEvent", params.label);
                    }
                    else {
                        this.drawToolbar.deactivate();
                        topic.publish("mapToolChangedEvent", []);
                    }
                }
                catch (err) {
                    console.error("MapManager::onDrawRequest", err);
                }
            },

            zoomToFullExtent: function () {
                if (this.configData.map.fullExtent) {
                    var coords = this.configData.map.fullExtent;
                    var extent = new Extent(coords[0], coords[1], coords[2], coords[3], null);
                    this.map.setExtent(extent);
                }
                else {
                    this.navToolbar.zoomToFullExtent();
                }
            },

            onResizeRequest: function (/*Object*/ box) {
                var mapDiv = dom.byId(this.map.id);
                domStyle.set(mapDiv, {
                    position: "absolute",
                    left: box.l + "px",
                    top: box.t + "px",
                    width: box.w + "px",
                    height: box.h + "px"
                });
                this.map.resize();
                topic.publish("mapResizedEvent", box);
            }
        })
    });