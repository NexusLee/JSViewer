define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/Color",
    "dojo/parser",
    "dojo/on",
    "dojo/topic",
    "dojo/query",
    "dojo/dom-style",
    "dojo/dom-attr",
    "com/hdsx/jsviewer/_BaseWidget",
    "com/hdsx/jsviewer/_MapGraphicsMaintainer",
    "dojo/string",
    "dojo/i18n!./js/com/hdsx/jsviewer/nls/SearchWidgetStrings.js",
    "dijit/form/Button",
    "dijit/form/TextBox",
    "dijit/form/FilteringSelect",
    "com/hdsx/jsviewer/ResultList",
    "com/hdsx/jsviewer/util",
    "esri/toolbars/Draw",
    "esri/tasks/QueryTask",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "dojo/text!./templates/SearchWidget.html"
],function(declare,array,lang,Color,parser,on,
           topic,query,domStyle,domAttr,_BaseWidget,
           _MapGraphicsMaintainer,string,SearchWidgetStrings,
           Button,TextBox,FilteringSelect,ResultList,util,Draw,QueryTask,PictureMarkerSymbol,SimpleLineSymbol,template){
    return declare([_BaseWidget,_MapGraphicsMaintainer],    {
        constructor: function(/*Object*/ params) {
            this.layers = [];
        },
        templateString: template,
        _initialized: false,
        iconUrl: "",
        smallIconUrl: "",
        symbol: null,
        zoomScale: 100000,
        loaderNode: null,
        messageNode: null,
        i18nStrings: SearchWidgetStrings,

        postMixInProperties: function() {
            try {
                this.inherited(arguments);

                if (this.configData) {
                    this.zoomScale = this.configData.search.zoomScale;
                    // Layers are read from config in startup
                }
            }
            catch (err) { console.error(err); }
        },

        postCreate: function() {
            try {
                this.inherited(arguments);

                parser.parse(this.domNode);

                // Init the icons on the toolbuttons
                var buttons =query(".toolbutton", this.domNode);
                buttons.forEach(function(item,idx,arr){
                    var icon = require.toUrl("com/hdsx/jsviewer/" + domAttr.get(item, "buttonIcon"));
                    domStyle.set(item, "backgroundImage", "url(" + icon + ")");
                });

                // Init the loader animation
                this.loaderNode =query(".loader", this.domNode)[0];
                this.loaderNode.src = require.toUrl("com/hdsx/jsviewer/" + "assets/images/loader.gif");
            }
            catch (err) { console.error(err); }
        },

        startup: function() {
            this.inherited(arguments);
            if (this._initialized) { return; }

            try {
                this.getAllNamedChildDijits();

                // Attach events
                this.connects.push(on(this.widgets.btnSearchText, "Click", lang.hitch(this, this.onTextSearch)));
                this.connects.push(on(this.widgets.btnClearText, "Click",  lang.hitch(this,this.onTextClear)));
                this.connects.push(on(this.widgets.cboGraphicSearch, "Change",  lang.hitch(this,this.onGraphicSearchLayerChange)));
                this.connects.push(on(this.widgets.cboTextSearch, "Change",  lang.hitch(this,this.onTextSearchLayerChange)));

                // Search Layers dropdowns
                var graphicSearchLayerData = {
                    identifier: "name",
                    label: "name",
                    items: []
                };
                var textSearchLayerData = {
                    identifier: "name",
                    label: "name",
                    items: []
                };

                var gInitValue = null;
                var tInitValue = null;

                array.forEach(this.configData.search.layers, lang.hitch(this, function(layer) {
                    if (layer.graphicalSearch) {
                        graphicSearchLayerData.items.push(dojo.clone(layer));
                        gInitValue = layer.name;
                    }
                    if (layer.expression) {
                        textSearchLayerData.items.push(dojo.clone(layer));
                        tInitValue = layer.name;
                    }
                    // Store the config for the layer
                    this.layers[layer.name] = layer;
                }));

                var graphicSearchDataStore = new dojo.data.ItemFileReadStore({
                    data: graphicSearchLayerData
                });
                var textSearchDataStore = new dojo.data.ItemFileReadStore({
                    data: textSearchLayerData
                });

                // Apply datastores to widgets
                this.widgets.cboGraphicSearch.store = graphicSearchDataStore;
                this.widgets.cboGraphicSearch.searchAttr = "name";
                this.widgets.cboGraphicSearch.setValue(gInitValue);

                this.widgets.cboTextSearch.store = textSearchDataStore;
                this.widgets.cboTextSearch.searchAttr = "name";
                this.widgets.cboTextSearch.setValue(tInitValue);

                // Init the map graphic symbol
                this.iconUrl = require.toUrl("com/hdsx/jsviewer/" + this.icon).path;
                this.smallIconUrl = util.getSmallIcon(this.iconUrl);
                // Create map symbols
                this.symbols = {
                    point: new PictureMarkerSymbol(this.iconUrl, 40, 40),
                    line: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,255,255]), 3),
                    polygon: new esri.symbol.SimpleFillSymbol(
                        esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,255,255]), 2),
                        new Color([0,255,255,0.5]))
                };

                // Grab the message node for future use
                this.messageNode =query(".resultsMsg", this.domNode)[0];
                this.setMessage(this.i18nStrings.msgReady);

                // Listen to result selection messages
                this.connects.push(topic.subscribe(this.widgets.results, "onResultClick",lang.hitch(this,this.onResultClick)));
                this.connects.push(topic.subscribe(this.widgets.results, "onResultHover", lang.hitch(this, this.onResultHover)));
                this.clearResults();

                this._initialized = true;
            }
            catch (err) {
                console.error("SearchWidget::startup", err);
            }
        },

        shutdown: function() {
            this.clearResults();
            topic.publish("widgetHighlightEvent", null);
            this.inherited(arguments);
        },

        setMessage: function(/*String*/ message, /*boolean*/ showLoading) {
            this.messageNode.innerHTML = message;

            if (showLoading) {
                domStyle.set(this.loaderNode, "visibility", "visible");
            }
            else {
                domStyle.set(this.loaderNode, "visibility", "hidden");
            }
        },

        clearResults: function() {
            this.widgets.results.clear();
            this.clearGraphics();
        },

        onToolButtonClick: function(evt) {
            if (evt && evt.target) {
                var params = {
                    onDrawEnd: lang.hitch(this, function(geometry) { this.searchGeometry(geometry); }),
                    label: evt.target.title
                };

                switch (evt.target.title) {
                    case (this.i18nStrings.msgSearchPoint):
                        params.geometryType = esri.toolbars.Draw.POINT;
                        break;
                    case (this.i18nStrings.msgSearchLine):
                        params.geometryType = esri.toolbars.Draw.POLYLINE;
                        break;
                    case (this.i18nStrings.msgSearchRect):
                        params.geometryType = esri.toolbars.Draw.EXTENT;
                        break;
                    case (this.i18nStrings.msgSearchPolygon):
                        params.geometryType = esri.toolbars.Draw.POLYGON;
                        break;
                    case (this.i18nStrings.msgSearchClear):
                        this.clearResults();
                        return;
                    default:
                        console.error("Unknown toolbutton pressed: " + evt.target.title);
                        return;
                }
                topic.publish("widgetDrawRequestEvent", [params]);
            }
        },

        onGraphicSearchLayerChange: function(newValue) {
            var msg = this.i18nStrings.promptGraphicSearch;
            msg = string.substitute(msg, [newValue]);
            this.graphicSearchPrompt.innerHTML = msg;
        },

        onTextSearchLayerChange: function(newValue) {
            var msg = this.i18nStrings.promptTextSearch;

            var store = this.widgets.cboGraphicSearch.store;
            store.fetchItemByIdentity({
                identity: newValue,
                onItem: lang.hitch(this, function(item,request) {
                    var textSearchField = store.getValue(item, "textSearchField");
                    var textSearchSampleValue = store.getValue(item, "textSearchSampleValue");
                    msg = string.substitute(msg, [newValue, textSearchField, textSearchSampleValue]);
                    this.textSearchPrompt.innerHTML = msg;
                })
            });
        },

        onTextSearch: function(evt) {
            var layer = this.layers[this.widgets.cboTextSearch.getValue()];
            if (layer) {
                var url = layer.url;
                var task = new QueryTask(url);

                var q = new Query();
                q.returnGeometry = true;
                q.outFields = layer.fields;
                q.outSpatialReference = this.map.spatialReference;
                var expr = layer.expression;
                expr = expr.replace("[value]", this.widgets.textSearch.getValue());
                q.where = expr;

                try {
                    task.execute(q, lang.hitch(this, "searchCallback", layer.name));
                    this.setMessage(this.i18nStrings.msgSearch, true);
                    this.clearResults();
                    this.onShowPanel(2);
                }
                catch (err) {
                    console.error("onTextSearch", err);
                }
            }
        },

        onTextClear: function(evt) {
            this.widgets.textSearch.setValue("");
        },

        searchGeometry: function(geometry) {
            var layer = this.layers[this.widgets.cboGraphicSearch.getValue()];
            if (layer) {
                var url = layer.url;
                var task = new QueryTask(url);

                var q = new Query();
                q.returnGeometry = true;
                q.outFields = layer.fields;
                q.outSpatialReference = this.map.spatialReference;
                q.geometry = geometry;

                try {
                    task.execute(q, lang.hitch(this, "searchCallback", layer.name));
                    this.setMessage(this.i18nStrings.msgSearch, true);
                    this.clearResults();
                    this.onShowPanel(2);
                }
                catch (err) {
                    console.error("searchGeometry", err);
                }
            }
        },

        searchCallback: function(layerId, featureSet) {
            try {
                // Create graphics, list items
                var resultCountBeforeAddingThese = this.widgets.results.count;
                var isUrl = util.isUrl;

                array.forEach(featureSet.features, lang.hitch(this, function(f){
                    var layer = this.layers[layerId];

                    // Content
                    var link = null;
                    var content = "<table>";
                    for (var fIdx in layer.fields) {
                        var field = layer.fields[fIdx];
                        if (field === layer.linkField) {
                            link = f.attributes[field];
                        }
                        else if (field !== layer.titleField) {
                            content += "<tr><td>" + field + ":</td><td>" + f.attributes[field] + "</td></tr>";
                        }
                    }
                    content += "</table>";

                    var attrs = {
                        "title": f.attributes[layer.titleField],
                        "content": content,
                        "link": link
                    };

                    var sym = null;
                    var loc = null;
                    switch (f.geometry.type) {
                        case "point":
                            sym = this.symbols.point;
                            loc = f.geometry;
                            break;
                        case "multipoint":
                            sym = this.symbols.point;
                            loc = f.geometry.getExtent().getCenter();
                            break;
                        case "polyline":
                            sym = this.symbols.line;
                            var nPts = f.geometry.paths[0].length;
                            var idx = Math.round(nPts / 2);
                            loc = f.geometry.getPoint(0, idx);
                            break;
                        default:
                            sym = this.symbols.polygon;
                            // For multiring geometries, choose one
                            if (f.geometry.rings && f.geometry.rings.length > 1) {
                                var p = new esri.geometry.Polygon(f.geometry.spatialReference);
                                p.addRing(f.geometry.rings[0]);
                                var ext = p.getExtent();
                                loc = ext.getCenter();
                            }
                            else {
                                var ext = f.geometry.getExtent();
                                loc = ext.getCenter();
                            }
                            break;
                    }

                    var g = new esri.Graphic(f.geometry, sym, attrs);
                    var zoomScale = this.zoomScale;
                    if (layer.zoomScale) {
                        zoomScale = layer.zoomScale;
                    }

                    this.widgets.results.add({
                        title: attrs.title,
                        content: attrs.content,
                        iconUrl: this.smallIconUrl,
                        graphic: g,
                        location: loc,
                        link: attrs.link,
                        zoomScale: zoomScale
                    });
                    this.addGraphic(g);
                }));

                var msg = this.i18nStrings.msgFound;
                msg = string.substitute(msg, [this.widgets.results.count]);
                this.setMessage(msg);

                if (resultCountBeforeAddingThese === 0) {
                    this.widgets.results.selectFirstItem();
                }
            }
            catch (err) {
                console.error("SearchWidget::searchCallback", err);
            }
        },

        onResultClick: function(evt) {
            // evt.resultItem is the result item dijit
            // evt.resultItem.graphic is the result in the map.
            // evt.resultItem.location is the place to zoom to
            if (evt.resultItem) {
                topic.publish("widgetHighlightEvent", evt.resultItem.graphic, evt.resultItem.location, true, evt.resultItem.zoomScale);
            }
            else {
                topic.publish("widgetHighlightEvent", null);
            }
        },

        onResultHover: function(evt) {
            // evt.resultItem is the result item dijit
            // evt.resultItem.graphic is the result in the map.
            // evt.resultItem.location is the place to zoom to
            if (evt.resultItem) {
                topic.publish("widgetHighlightEvent", evt.resultItem.graphic, evt.resultItem.location, false);
            }
            else {
                topic.publish("widgetHighlightEvent", null);
            }
        }
    });
});

dojo.require("dojo.i18n");
dojo.requireLocalization("com.esri.solutions.jsviewer.widgets", "SearchWidgetStrings");
dojo.declare(
    "com.esri.solutions.jsviewer.widgets.SearchWidget",
    [com.esri.solutions.jsviewer._BaseWidget, com.esri.solutions.jsviewer._MapGraphicsMaintainer],

);