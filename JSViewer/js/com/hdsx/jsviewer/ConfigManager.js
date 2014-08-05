define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/request/xhr",
    "com/hdsx/jsviewer/util",
    "dojo/domReady!"
], function (declare, lang, array, topic, _WidgetBase, _TemplatedMixin, xhr, util) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: "<div style='display: none;'></div>",
        configData: null,

        // Grab functions from util. Just for conciseness.
//        getAttribute: util.xml.getAttribute,
//        getValue: util.xml.getValue,
//        getNodes: util.xml.getNodes,

        postMixInProperties: function () {
            console.log("ConfigManager postMixInProperties");
        },

        postCreate: function () {
            console.log("ConfigManager postCreate");
        },

        startup: function () {
            console.log("ConfigManager startup");
            this.configLoad();
        },

        configLoad: function () {
            var self = this;
            xhr("config.xml", {
                handleAs: "xml",
                sync: true
            }).then(function (response) {
                console.log("ConfigManager::onLoad");
                // Read config.xml object to create config data object
                // Using dojo.query to extract data
                this.configData = {
                    ui: {
                        title: "",
                        subtitle: "",
                        logo: "",
                        stylesheet: "",
                        menus: [],
                        showBanner: true
                    },
                    map: {
                        baseMaps: [],
                        liveMaps: [],
                        fullExtent: null,
                        initialExtent: null
                    },
                    navTools: [],
                    widgets: [],
                    links: [],
                    proxyType: ""
                };
                // User interface elements
                console.log("configData.ui loading...");
                this.configData.ui.title = util.xml.getValue("userinterface > title", response);
                this.configData.ui.subtitle =util.xml.getValue("userinterface > subtitle", response);
                this.configData.ui.logo = util.xml.getValue("userinterface > logo", response);
                this.configData.ui.stylesheet = util.xml.getValue("userinterface > stylesheet", response);
                if (util.xml.getValue("userinterface > banner", response) !== "visible") {
                    this.configData.ui.showBanner = false;
                }

                console.log("configData.ui.menus loading...");
                var menuNodes = util.xml.getNodes("menus", "menu", response);// dojo.query("menus > menu", response);
                menuNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                    var menu = {
                        label: util.xml.getValue(node),
                        id: util.xml.getAttribute(node, "id"),
                        visible: util.xml.getAttribute(node, "visible") === "true",
                        icon: util.xml.getAttribute(node, "icon")
                    };
                    this.configData.ui.menus.push(menu);
                }));

                // Base Maps
                console.log("configData.map.baseMaps loading...");
                var baseMapsNode = util.xml.getNodes("map", "basemaps", response)[0];
                var menuId = util.xml.getAttribute(baseMapsNode, "menu");
                var baseMapNodes = util.xml.getNodes("basemaps", "mapservice", response);// dojo.query("basemaps > mapservice", response);
                var menuCode = "basemaps.mapservice";
                baseMapNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                    var map = {
                        label: util.xml.getAttribute(node, "label"),
                        type: util.xml.getAttribute(node, "type"),
                        visible: util.xml.getAttribute(node, "visible") === "true",
                        alpha: util.xml.getAttribute(node, "alpha"),
                        icon: util.xml.getAttribute(node, "icon"),
                        url: util.xml.getValue(node),
                        menu: menuId,
                        menuCode: menuCode
                    };
                    this.configData.map.baseMaps.push(map);
                }));

                // Live Maps
                console.log("configData.maps.liveMaps loading...");
                var liveMapsNode = util.xml.getNodes("map", "livemaps", response)[0];
                var menuId = util.xml.getAttribute(liveMapsNode, "menu");
                var liveMapNodes = util.xml.getNodes("livemaps", "mapservice", response);// dojo.query("livemaps > mapservice", response);
                var menuCode = "livemaps.mapservice";
                liveMapNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                    var map = {
                        label: util.xml.getAttribute(node, "label"),
                        type: util.xml.getAttribute(node, "type"),
                        visible: util.xml.getAttribute(node, "visible") === "true",
                        alpha: util.xml.getAttribute(node, "alpha"),
                        icon: util.xml.getAttribute(node, "icon"),
                        url: util.xml.getValue(node),
                        menu: menuId,
                        menuCode: menuCode
                    };
                    this.configData.map.liveMaps.push(map);
                }));

                // Extents
                console.log("configData.map extents loading...");
                var mapNode = util.xml.getNodes("configuration", "map", response)[0];

                var boxToCoords = function (str, idx, arr) {
                    arr[idx] = parseFloat(str);
                };

                var box = util.xml.getAttribute(mapNode, "initialExtent");
                var coords = box.split(" ", 4);
                array.forEach(coords, boxToCoords);
                this.configData.map.initialExtent = coords;
                box = util.xml.getAttribute(mapNode, "fullExtent");
                coords = box.split(" ", 4);
                array.forEach(coords, boxToCoords);
                this.configData.map.fullExtent = coords;

                // Nav Tools
                console.log("configData.navTools loading...");
                var navToolNodes = util.xml.getNodes("navtools", "navtool", response);// dojo.query("navtools > navtool", response);
                var menuCode = "navtools.navtool";
                navToolNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                    var tool = {
                        label: util.xml.getAttribute(node, "label"),
                        menu: util.xml.getAttribute(node, "menu"),
                        menuCode: menuCode,
                        icon: util.xml.getAttribute(node, "icon"),
                        value: util.xml.getValue(node)
                    };
                    this.configData.navTools.push(tool);
                }));

                // Widgets
                console.log("configData.widgets loading...");
                var widgetNodes = util.xml.getNodes("widgets", "widget", response);// dojo.query("widgets > widget", response);
                var menuCode = "widgets.widget";
                widgetNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                    var widget = {
                        label: util.xml.getAttribute(node, "label"),
                        menu: util.xml.getAttribute(node, "menu"),
                        menuCode: menuCode,
                        icon: util.xml.getAttribute(node, "icon"),
                        config: util.xml.getAttribute(node, "config"),
                        widgetType: util.xml.getValue(node)
                    };
                    this.configData.widgets.push(widget);
                }));

                // Links
                console.log("configData.links loading...");
                var linkNodes = util.xml.getNodes("links", "link", response);// dojo.query("links > link", response);
                var menuCode = "links.link";
                linkNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                    var link = {
                        label: util.xml.getAttribute(node, "label"),
                        menu: util.xml.getAttribute(node, "menu"),
                        menuCode: menuCode,
                        icon: util.xml.getAttribute(node, "icon"),
                        url: util.xml.getValue(node)
                    };
                    this.configData.links.push(link);
                }));

                // Proxy type
                console.log("configData.proxyType loading...");
                var proxyNode = util.xml.getNodes("configuration", "proxytype", response)[0];
                this.configData.proxyType = util.xml.getValue(proxyNode);
                // Publish configuration object
                console.log("publishing configData...");
                topic.publish("config/configLoadedEvent", this.configData);
                console.dir(this.configData);
                // Always return response object for Deferreds
                return response;
            }, function (err) {
                console.error("Error reading config.xml", response, ioArgs);
                // Always return response object for Deferreds
                return response;
            });
        }

//        onLoad: function(response, ioArgs) {
//            console.log("ConfigManager::onLoad");
//            // Read config.xml object to create config data object
//            // Using dojo.query to extract data
//            this.configData = {
//                ui: {
//                    title: "",
//                    subtitle: "",
//                    logo: "",
//                    stylesheet: "",
//                    menus: [],
//                    showBanner: true
//                },
//                map: {
//                    baseMaps: [],
//                    liveMaps: [],
//                    fullExtent: null,
//                    initialExtent: null
//                },
//                navTools: [],
//                widgets: [],
//                links: [],
//                proxyType: ""
//            };
//
//            // User interface elements
//            console.log("configData.ui loading...");
//            this.configData.ui.title = this.getValue("userinterface > title", response);
//            this.configData.ui.subtitle = this.getValue("userinterface > subtitle", response);
//            this.configData.ui.logo = this.getValue("userinterface > logo", response);
//            this.configData.ui.stylesheet = this.getValue("userinterface > stylesheet", response);
//            if (this.getValue("userinterface > banner", response) !== "visible") {
//                this.configData.ui.showBanner = false;
//            }
//
//            console.log("configData.ui.menus loading...");
//            var menuNodes = this.getNodes("menus", "menu", response);// dojo.query("menus > menu", response);
//            menuNodes.forEach(lang.hitch(this, function(node, idx, arr) {
//                var menu = {
//                    label: this.getValue(node),
//                    id: this.getAttribute(node, "id"),
//                    visible: this.getAttribute(node, "visible") === "true",
//                    icon: this.getAttribute(node, "icon")
//                };
//                this.configData.ui.menus.push(menu);
//            }));
//
//            // Base Maps
//            console.log("configData.map.baseMaps loading...");
//            var baseMapsNode = this.getNodes("map", "basemaps", response)[0];
//            var menuId = this.getAttribute(baseMapsNode, "menu");
//            var baseMapNodes = this.getNodes("basemaps", "mapservice", response);// dojo.query("basemaps > mapservice", response);
//            var menuCode = "basemaps.mapservice";
//            baseMapNodes.forEach(lang.hitch(this, function(node, idx, arr) {
//                var map = {
//                    label: this.getAttribute(node, "label"),
//                    type: this.getAttribute(node, "type"),
//                    visible: this.getAttribute(node, "visible") === "true",
//                    alpha: this.getAttribute(node, "alpha"),
//                    icon: this.getAttribute(node, "icon"),
//                    url: this.getValue(node),
//                    menu: menuId,
//                    menuCode: menuCode
//                };
//                this.configData.map.baseMaps.push(map);
//            }));
//
//            // Live Maps
//            console.log("configData.maps.liveMaps loading...");
//            var liveMapsNode = this.getNodes("map", "livemaps", response)[0];
//            var menuId = this.getAttribute(liveMapsNode, "menu");
//            var liveMapNodes = this.getNodes("livemaps", "mapservice", response);// dojo.query("livemaps > mapservice", response);
//            var menuCode = "livemaps.mapservice";
//            liveMapNodes.forEach(lang.hitch(this, function(node, idx, arr) {
//                var map = {
//                    label: this.getAttribute(node, "label"),
//                    type: this.getAttribute(node, "type"),
//                    visible: this.getAttribute(node, "visible") === "true",
//                    alpha: this.getAttribute(node, "alpha"),
//                    icon: this.getAttribute(node, "icon"),
//                    url: this.getValue(node),
//                    menu: menuId,
//                    menuCode: menuCode
//                };
//                this.configData.map.liveMaps.push(map);
//            }));
//
//            // Extents
//            console.log("configData.map extents loading...");
//            var mapNode = this.getNodes("configuration", "map", response)[0];
//
//            var boxToCoords = function(str, idx, arr) {
//                arr[idx] = parseFloat(str);
//            };
//
//            var box = this.getAttribute(mapNode, "initialExtent");
//            var coords = box.split(" ", 4);
//            array.forEach(coords, boxToCoords);
//            this.configData.map.initialExtent = coords;
//            box = this.getAttribute(mapNode, "fullExtent");
//            coords = box.split(" ", 4);
//            array.forEach(coords, boxToCoords);
//            this.configData.map.fullExtent = coords;
//
//            // Nav Tools
//            console.log("configData.navTools loading...");
//            var navToolNodes = this.getNodes("navtools", "navtool", response);// dojo.query("navtools > navtool", response);
//            var menuCode = "navtools.navtool";
//            navToolNodes.forEach(lang.hitch(this, function(node, idx, arr) {
//                var tool = {
//                    label: this.getAttribute(node, "label"),
//                    menu: this.getAttribute(node, "menu"),
//                    menuCode: menuCode,
//                    icon: this.getAttribute(node, "icon"),
//                    value: this.getValue(node)
//                };
//                this.configData.navTools.push(tool);
//            }));
//
//            // Widgets
//            console.log("configData.widgets loading...");
//            var widgetNodes = this.getNodes("widgets", "widget", response);// dojo.query("widgets > widget", response);
//            var menuCode = "widgets.widget";
//            widgetNodes.forEach(lang.hitch(this, function(node, idx, arr) {
//                var widget = {
//                    label: this.getAttribute(node, "label"),
//                    menu: this.getAttribute(node, "menu"),
//                    menuCode: menuCode,
//                    icon: this.getAttribute(node, "icon"),
//                    config: this.getAttribute(node, "config"),
//                    widgetType: this.getValue(node)
//                };
//                this.configData.widgets.push(widget);
//            }));
//
//            // Links
//            //console.log("configData.links loading...");
//            var linkNodes = this.getNodes("links", "link", response);// dojo.query("links > link", response);
//            var menuCode = "links.link";
//            linkNodes.forEach(lang.hitch(this, function(node, idx, arr) {
//                var link = {
//                    label: this.getAttribute(node, "label"),
//                    menu: this.getAttribute(node, "menu"),
//                    menuCode: menuCode,
//                    icon: this.getAttribute(node, "icon"),
//                    url: this.getValue(node)
//                };
//                this.configData.links.push(link);
//            }));
//
//            // Proxy type
//            //console.log("configData.proxyType loading...");
//            var proxyNode = this.getNodes("configuration", "proxytype", response)[0];
//            this.configData.proxyType = this.getValue(proxyNode);
//
//            // Publish configuration object
//            console.log("publishing configData...");
//            topic.publish("configLoadedEvent", [this.configData]);
//            //console.dir(this.configData);
//
//            // Always return response object for Deferreds
//            return response;
//        },
//
//        onError: function(response, ioArgs) {
//            console.error("Error reading config.xml", response, ioArgs);
//
//            // Always return response object for Deferreds
//            return response;
//        }
    });
});