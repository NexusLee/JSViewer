define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_Container",
    "dojo/string",
    "dojo/query",
    "dojo/topic",
    "dojo/aspect",
    "dojo/dom-style",
    "dojo/dom-class",
    "com/hdsx/jsviewer/ControllerMenu",
    "dojo/i18n!./js/com/hdsx/jsviewer/nls/ControllerStrings.js",
    "dojo/text!./templates/Controller.html"
], function (declare, array, lang, _WidgetBase, _TemplatedMixin,
             _Container, string, query,topic,aspect,domStyle,domClass,ControllerMenu, ControllerStrings, template) {
    return declare([_WidgetBase, _TemplatedMixin, _Container], {
        templateString: template,
        i18nStrings: ControllerStrings,
        map: null,
        configData: null,
        menuItemData: null,
        onConfigLoadedEventSubscribe:null,

        postMixInProperties: function () {
        },

        postCreate: function () {
            this.onConfigLoadedEventSubscribe = topic.subscribe("config/configLoadedEvent",lang.hitch(this,this.onConfig));
            topic.subscribe("mapLoadedEvent", lang.hitch(this,this.onMapLoad));
            topic.subscribe("mapToolChangedEvent", lang.hitch(this,this.onMapToolChange));
            topic.subscribe("statusChangedEvent", lang.hitch(this,this.onStatusChange));
        },

        startup: function () {
            if (this._started) {
                return;
            }
            // Pass to children
            var children = this.getChildren();
            array.forEach(children, function (child) {
                child.startup();
            });
        },

        onConfig: function (configData) {
            this.configData = configData;
            // Unsubscribe from the event
            this.onConfigLoadedEventSubscribe.remove();
            this._organizeMenuItems();
            //console.dir(configData);
            if (configData.ui.showBanner === false) {
                domStyle.set(this.controllerBoxNode, "display", "none");
                domClass.add(this.containerNode, "controllerMenuBoxNoBanner");
            }
            this.setTitle(configData.ui.title);
            this.setSubtitle(configData.ui.subtitle);
            var logoUrl = require.toUrl("com/hdsx/jsviewer/" +  configData.ui.logo);
            this.setLogo(logoUrl);
            this.setStatus("");
            this.createMenus();
        },

        onMapLoad: function (map) {
            this.map = map;
        },

        setTitle: function (/*String*/ title) {
            var element = query(".controllerTitle", this.domNode)[0];
            element.innerHTML = title;
        },

        setSubtitle: function (/*String*/ subtitle) {
            var element = query(".controllerSubtitle", this.domNode)[0];
            element.innerHTML = subtitle;
        },

        setStatus: function (/*String*/ status) {
            var element = query(".controllerStatus", this.domNode)[0];
            element.innerHTML = status;
        },

        setToolText: function (/*String*/ toolText) {
            var msg = "";
            if (toolText) {
                msg = string.substitute(this.i18nStrings.msgCurrentTool, [toolText]);
            }
            this.setStatus(msg);
        },

        setLogo: function (/*URL*/ logoUrl) {
            var element = query(".controllerIcon", this.domNode)[0];
            domStyle.set(element, "backgroundImage", "url(" + logoUrl + ")");
        },

        createMenus: function () {
            if (this.configData) {
                var nMenus = this.configData.ui.menus.length;
                var stepPct = 100 / (nMenus + 1);
                for (var i = 0; i < nMenus; i++) {
                    var menuConfig = this.configData.ui.menus[i];
                    menuConfig.positionAsPct = (i + 1) * stepPct;
                    var menu = new ControllerMenu(menuConfig);
                   // aspect.after(menu, "onMenuItemClick", lang.hitch(this,this.onMenuItemClick),true);

                    aspect.after(menu, "onMenuItemClick",function(data){
                        if (data && data.menuCode && data.menuCode === "links.link") {
                            // Controller handles link events
                            for (var idx in this.configData.links) {
                                if (this.configData.links[idx].label === data.value) {
                                    var linkInfo = this.configData.links[idx];
                                    var wId = linkInfo.label.replace(/\W/g, "");
                                    window.open(linkInfo.url, wId);
                                    break;
                                }
                            }
                        }
                        else {
                            topic.publish("menuItemClickedEvent", data);
                        }
                    },true);


                    // 添加菜单项
                    array.forEach(this.menuItemData[menuConfig.id], lang.hitch(this, function (item) {
                        menu.addMenuItem(item);
                    }));
                    this.addChild(menu);
                }
            }
        },

        _organizeMenuItems: function () {
            this.menuItemData = {};

            // Note the ids of the menus
            for (var i = 0; i < this.configData.ui.menus.length; i++) {
                var menuConfig = this.configData.ui.menus[i];
                this.menuItemData[menuConfig.id] = [];
            }

            // Find items which have a "menu" attribute
            var itemSources = [
                this.configData.map.baseMaps,
                this.configData.map.liveMaps,
                this.configData.map.extents,
                this.configData.navTools,
                this.configData.widgets,
                this.configData.links
            ];

            array.forEach(itemSources, lang.hitch(this, function (source) {
                array.forEach(source, lang.hitch(this, function (item) {
                    if (item.menu && this.menuItemData[item.menu]) {
                        this.menuItemData[item.menu].push(item);
                    }
                }));
            }));
        },

        onMenuItemClick: function (data) {
            console.log("User clicked on menu item", data);
            if (data && data.menuCode && data.menuCode === "links.link") {
                // Controller handles link events
                for (var idx in this.configData.links) {
                    if (this.configData.links[idx].label === data.value) {
                        var linkInfo = this.configData.links[idx];
                        var wId = linkInfo.label.replace(/\W/g, "");
                        window.open(linkInfo.url, wId);
                        break;
                    }
                }
            }
            else {
                topic.publish("menuItemClickedEvent", data);
            }
        },

        onMapToolChange: function (/*String*/ toolName) {
            this.setToolText(toolName);
        },

        onStatusChange: function (/* String */ status) {
            this.setStatus(status);
        }
    });
});