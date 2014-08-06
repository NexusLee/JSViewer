define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "com/hdsx/jsviewer/widgets/AboutWidget",
    "com/hdsx/jsviewer/widgets/OverviewWidget",
    "dojo/domReady!"],
    function (declare, array, lang, on, topic, _WidgetBase, _TemplatedMixin,AboutWidget,OverviewWidget) {
    return declare([_WidgetBase, _TemplatedMixin], {
        constructor: function () {
            this.widgetDefinitions = {};
            this.widgets = {};
        },

        templateString: "<div style='display: none;'></div>",
        map: null,
        configData: null,
        configLoadedEventSubscribe: null,
        postMixInProperties: function () {
            console.log("WidgetManager postMixInProperties");
        },

        postCreate: function () {
            console.log("WidgetManager postCreate");
            this.configLoadedEventSubscribe = topic.subscribe("config/configLoadedEvent", lang.hitch(this, this.onConfig));
            topic.subscribe("mapLoadedEvent", lang.hitch(this, this.onMapLoad));
            topic.subscribe("menuItemClickedEvent", lang.hitch(this, this.onMenuClick));
        },

        startup: function () {
            console.log("WidgetManager startup");
        },

        onConfig: function (configData) {
            console.log("WidgetManager::onConfig");
            this.configData = configData;
            // Unsubscribe from the event
            this.configLoadedEventSubscribe.remove();
            // Make note of the defined widgets
            // and dojo.require them
            array.forEach(configData.widgets, lang.hitch(this, function (defn) {
                this.widgetDefinitions[defn.label] = defn;
                this.requireWidget(defn.label);
            }));
        },

        onMapLoad: function (map) {
            //console.log("WidgetManager::onMapLoad");
            this.map = map;

            // For testing purposes
            //setTimeout(dojo.hitch(this, function(){
            //	var w = this.getWidget("KML Widget");
            //	dojo.publish("showWidget", [w]);
            //	for (var label in this.widgetDefinitions) {
            //		//console.log("getWidget(" + label + ")");
            //		var w = this.getWidget(label);
            //		dojo.publish("showWidget", [w]);
            //	}
            //}), 1000);
        },

        onMenuClick: function (data) {
            if (data && data.value && data.menuCode && data.menuCode === "widgets.widget") {
                console.log("onMenuClick for widget '" + data.value + "'");
                try {
                    if (this.widgetDefinitions[data.value]) {
                        var w = this.getWidget(data.value);
                        topic.publish("showWidget", w);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            }
        },

        getWidget: function (label) {
            try{
                if (!this.widgets[label]) {
                    this.loadWidget(label);
                }
                return this.widgets[label];
            }catch(err){
                console.error(err);
            }
        },

        requireWidget: function (label) {
//            var defn = this.widgetDefinitions[label];
//            var reqStr = "re" + "quire(['" + defn.widgetType + "'])"; // breaking up dojo. and require necessary to fool the dojo parser!
//            console.warn("reqStr::" + reqStr);
        },

        loadWidget: function (label) {
            var defn = this.widgetDefinitions[label];
            var paramStr = "";
            if (defn.config) {
                paramStr = "{ config: '" + defn.config + "'}";
            }

            var loadStr = defn.widgetType;
            var index = loadStr.lastIndexOf("/");
            var length = loadStr.length;
            loadStr = loadStr.substring(index + 1, length);
            loadStr = "var w = new " + loadStr + "(" + paramStr + ")"
           eval(loadStr);

            w.setTitle(defn.label);
            w.setIcon(defn.icon);
            w.setConfig(defn.config);
            w.setMap(this.map);

            this.widgets[label] = w;
        }
    });
});