define(["../../../../../../../../DevelopAPI/arcgis_js_v38_api/arcgis_js_api/library/3.8/3.8/js/dojo/dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/Color",
        "dojo/on",
        "dojo/topic",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "dojo/dom-attr",
        "com/hdsx/jsviewer/_BaseWidget",
        "esri/dijit/OverviewMap",
        "dojo/text!./templates/OverviewWidget.html"],
    function (declare, lang, Color, on,topic,
              SimpleFillSymbol, SimpleLineSymbol, domAttr, _BaseWidget,OverviewMap, template) {
        return declare([_BaseWidget], {
            mapService: "",
            serviceType: "",
            overviewMap: null,
            extentSymbol: null,

            tool: null,
            templateString: template,

            postMixInProperties: function () {
                try {
                    this.inherited(arguments);
                    if (this.configData) {
                        this.mapService = this.configData.overview.mapservice;
                        this.serviceType = this.configData.overview.servicetype;
                    }
                }
                catch (err) {
                    console.error(err);
                }
            },

            setMap:function(){
                this.inherited(arguments);
                this.overviewMap  =  new OverviewMap({
                    map:this.map,
                    visible: true,
                    attachTo: "bottom-right"
                });
            },

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                this.inherited(arguments);
                this.overviewMap.startup();
                this.overviewMap.hide()
            },

            shutdown: function () {
                this.inherited(arguments);
            }
        });
    });