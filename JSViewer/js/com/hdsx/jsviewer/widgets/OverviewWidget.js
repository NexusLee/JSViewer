define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/Color",
        "dojo/on",
        "dojo/topic",
        "dojo/dom-attr",
        "com/hdsx/jsviewer/_BaseWidget",
        "esri/dijit/OverviewMap",
        "dojo/dom-construct",
        "dojo/text!./templates/OverviewWidget.html"],
    function (declare, lang, Color, on,topic, domAttr, _BaseWidget,OverviewMap,domConstruct, template) {
        return declare([_BaseWidget], {
            overviewMap: null,
            extentSymbol: null,
            tool: null,
            templateString: template,
            postMixInProperties: function () {
                try {
                    this.inherited(arguments);
                    if (this.configData) {
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
                    visible: true
//                    attachTo: "bottom-right",
//                    color:" #D84E13",
//                    opacity: .40
                },this.mapNode);
            },

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                this.inherited(arguments);
                this.overviewMap.startup();
            },

            shutdown: function () {
                this.overviewMap.hide();
                this.inherited(arguments);
            }
        });
    });