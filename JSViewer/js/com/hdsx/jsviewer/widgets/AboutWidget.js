define([
    "dojo/_base/declare",
    "dojo/query",
    "com/hdsx/jsviewer/_BaseWidget",
    "com/hdsx/jsviewer/util",
    "dojo/text!./templates/AboutWidget.html",
    "dojo/domReady!"
], function (declare, query, _BaseWidget, util,template) {
    return declare([_BaseWidget] ,{
        app_title: "app_title",
        app_subtitle: "app_subtitle",
        description: "description",
        copyright: "copyright",
        version: "version",
        templateString:template,
//        constructor: function () {
//            console.warn("关于被点击!");
//        },
        postMixInProperties: function () {
            try {
                this.inherited(arguments);
                if (this.configData) {
                    if (this.configDataType === "xml") {
                        this.configData = util.xml.parseObject(this.configData.firstChild);
                    }
                    var about = this.configData.about;
                    this.app_title = (typeof  about.title == "string") ? about.title : "";
                    this.app_subtitle = (typeof  about.subtitle == "string") ? about.subtitle : "";
                    this.description = (typeof  about.description == "string") ? about.description : "";
                    this.copyright = (typeof  about.copyright == "string") ? about.copyright : "";
                    this.version = (typeof  about.version == "string") ? about.version : "";
                }
            }
            catch (err) {
                console.error(err);
            }
        },

        postCreate: function () {
            try {
                this.inherited(arguments);
                if (this.configData) {
                    var logo = this.configData.about.logo;
                    var logoUrl = require.toUrl("com/hdsx/jsviewer/" + logo);
                    query(".aboutlogo", this.domNode).style("backgroundImage", "url(" + logoUrl + ")");
                }
            }
            catch (err) {
                console.error(err);
            }
        }
    });
});


//define(["dojo/_base/declare",
//    "dojo/query"], function (declare,query) {
//    return declare(null, {
//        constructor: function () {
//            console.warn("关于被点击!");
//        }
//    });
//});