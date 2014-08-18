define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/request/xhr",
    "com/hdsx/jsviewer/AppConfig",
    "com/hdsx/jsviewer/util",
    "dojo/domReady!"
], function (declare, lang, array, topic, _WidgetBase, _TemplatedMixin, xhr, AppConfig, util) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: "<div style='display: none;'></div>",
        configData: null,
        // Grab functions from util. Just for conciseness.
        postMixInProperties: function () {
//            console.log("ConfigManager postMixInProperties");
        },

        postCreate: function () {
//            console.log("ConfigManager postCreate");
        },

        startup: function () {
//            console.log("ConfigManager startup");
            this.configLoad();
        },

        configLoad: function () {

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
//                UI elements
            this.configData.ui.title = AppConfig.userinterface.title;
            this.configData.ui.subtitle = AppConfig.userinterface.subtitle;
            this.configData.ui.logo = AppConfig.userinterface.logo;
            this.configData.ui.stylesheet = AppConfig.userinterface.stylesheet;
            if (AppConfig.userinterface.banner !== "visible") {
                this.configData.ui.showBanner = false;
            }

            var menuNodes = AppConfig.menus;
            menuNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                var menu = {
                    label: node.label,
                    id: node.id,
                    visible: node.visible === "true",
                    icon: node.icon
                };
                this.configData.ui.menus.push(menu);
            }));

            // Base Maps
//                console.log("configData.map.baseMaps loading...");
            var baseMapsNode = AppConfig.map.basemaps;
            var menuId = baseMapsNode[0].menu;
            // var baseMapNodes = baseMapsNode.mapservice;
            var menuCode = "basemaps.mapservice";
            baseMapsNode.forEach(lang.hitch(this, function (node, idx, arr) {
                var map = {
                    label: node.mapservice.label,
                    type: node.mapservice.type,
                    visible: node.mapservice.visible,
                    alpha: node.mapservice.alpha,
                    icon: node.mapservice.icon,
                    url: node.mapservice.mapUrl,
                    menu: menuId,
                    menuCode: menuCode
                };
                this.configData.map.baseMaps.push(map);
            }));

//                Live Maps
//                var liveMapsNode = AppConfig.map.livemaps;
//                var menuId =liveMapsNode[0].menu;
//                var liveMapNodes =livemaps.mapservice;
//                var menuCode = "livemaps.mapservice";
//                liveMapNodes.forEach(lang.hitch(this, function (node, idx, arr) {
//                    var map = {
//                        label: node.label,
//                        type: node.type,
//                        visible: node.visible === "true",
//                        alpha:node.alpha,
//                        icon: node.icon,
//                        url: node.mapUrl,
//                        menu: menuId,
//                        menuCode: menuCode
//                    };
//                    this.configData.map.liveMaps.push(map);
//                }));

            // 范围
//                console.log("configData.map extents loading...");
//            var mapNode = util.xml.getNodes("configuration", "map", response)[0];
//
//            var boxToCoords = function (str, idx, arr) {
//                arr[idx] = parseFloat(str);
//            };

//                var box = util.xml.getAttribute(mapNode, "initialExtent");
//                var coords = box.split(" ", 4);
//                array.forEach(coords, boxToCoords);
//                this.configData.map.initialExtent = coords;
//                box = util.xml.getAttribute(mapNode, "fullExtent");
//                coords = box.split(" ", 4);
//                array.forEach(coords, boxToCoords);
//                this.configData.map.fullExtent = coords;

            // 导航工具
            //console.log("configData.navTools loading...");
            var navToolNodes = AppConfig.navtools;
            var menuCode = "navtools.navtool";
            navToolNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                var tool = {
                    label: node.label,
                    menu: node.menu,
                    menuCode: menuCode,
                    icon: node.icon,
                    value: node.value
                };
                this.configData.navTools.push(tool);
            }));

//          小部件
//          console.log("configData.widgets loading...");
            var widgetNodes = AppConfig.widgets;
            var menuCode = "widgets.widget";
            widgetNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                var widget = {
                    label: node.label,
                    menu: node.menu,
                    menuCode: menuCode,
                    icon: node.icon,
                    config: node.config,
                    widgetType: node.widgetType
                };
                this.configData.widgets.push(widget);
            }));

//            链接
//            console.log("configData.links loading...");
            var linkNodes = AppConfig.links;
            var menuCode = "links.link";
            linkNodes.forEach(lang.hitch(this, function (node, idx, arr) {
                var link = {
                    label: node.label,
                    menu: node.menu,
                    menuCode: menuCode,
                    icon: node.icon,
                    url: node.url
                };
                this.configData.links.push(link);
            }));

//            代理类型
//            console.log("configData.proxyType loading...");
            var proxyNode = AppConfig.proxytype;
            this.configData.proxyType = proxyNode;
            // Publish configuration object
            topic.publish("config/configLoadedEvent", this.configData);
        }
    });
});