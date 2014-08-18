define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "com/hdsx/jsviewer/util",
    "dojo/request/xhr"
],function(declare,topic,lang,_WidgetBase,_TemplatedMixin,xhr){
    return declare([_WidgetBase,_TemplatedMixin],	{
        constructor: function(/*Object*/ params) {
            this.knownLocations = {};
        },
        templateString: "<div style='display: none;'></div>",
        configLoadedEventSubscribe:null,
        configData: null,
        proxyUrlProc: null,

        postMixInProperties: function() {
//            console.log("DataManager postMixInProperties");
        },

        postCreate: function() {
//            console.log("DataManager postCreate");
            this.configLoadedEventSubscribe = topic.subscribe("config/configLoadedEvent", lang.hitch(this,this.onConfig));
            topic.subscribe("dataRequestEvent", lang.hitch(this.onDataRequest));
            topic.subscribe("widgetLocationsChangedEvent", lang.hitch(this.onWidgetLocationsChanged));
            topic.subscribe("locationsRequestEvent", lang.hitch(this.onLocationsRequest));
        },

        startup: function() {
//            console.log("DataManager startup");
        },

        setProxyType: function(/*String*/ value) {
            if (value && typeof value == "string") {
                value = value.toLowerCase();
                switch (value) {
                    case ("apache"):
                        console.log("DataManager proxy type apache");
                        this.proxyUrlProc = function(url) {
                            // Replace the host and port
                            var req = util.parseUrl(url);
                            var page = util.parseUrl(document.URL);
                            var result = req.protocol + "://" + page.host;
                            if (page.port) {
                                result += page.port;
                            }
                            if (req.path) {
                                result += req.path;
                            }
                            return result;
                        };
                        esriConfig.defaults.io.proxyUrl = null;
                        break;
                    case ("jsp"):
                        console.log("DataManager proxy type jsp");
                        this.proxyUrlProc = function(url) {
                            // Prefix url with proxy url
                            return "proxy.jsp?" + url;
                        };
                        esriConfig.defaults.io.proxyUrl = "proxy.jsp";
                        break;
                    case ("asp"):
                        console.log("DataManager proxy type asp");
                        this.proxyUrlProc = function(url) {
                            // Prefix url with proxy url
                            return "proxy.ashx?uri=" + url;
                        };
                        esriConfig.defaults.io.proxyUrl = "proxy.ashx";
                        break;
                    case ("php"):
                        console.log("DataManager proxy type php");
                        this.proxyUrlProc = function(url) {
                            // Prefix url with proxy url
                            return "proxy.php?uri=" + url;
                        };
                        esriConfig.defaults.io.proxyUrl = "proxy.php";
                        break;
                    default:
                        console.error("DataManager::setProxyType unknown type: " + value);
                        esriConfig.defaults.io.proxyUrl = null;
                        break;
                }
            }
        },

        onConfig: function(configData) {
            this.configData = configData;
            // Unsubscribe from the event
            this.configLoadedEventSubscribe.remove();
            this.setProxyType(configData.proxyType);
        },

        onDataRequest: function(/*Object*/ request) {
            if (request) {
                //console.dir(request);
                request.url = this.proxyUrlProc(request.url);
                //console.debug("munged url: " + request.url);
                dojo.xhrGet(request);
            }
        },

        onWidgetLocationsChanged: function(/*Object*/ msg) {
            try {
                if (msg && msg.source && msg.locations) {
                    this.knownLocations[msg.source] = msg.locations;
                    topic.publish("knownLocationsChangedEvent", this.knownLocations);
                }
            }
            catch (err) {
                console.error("DataManager::onWidgetLocationsChanged", err);
            }
        },

        onLocationsRequest: function(/*Object*/ request) {
            if (request) {
                request.callback(this.knownLocations);
            }
        }
    });
});
