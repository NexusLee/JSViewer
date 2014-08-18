define([
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "dojo/query",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_Container",
    "dojo/text!./templates/ResultItem.html"
],function(declare,on,topic,query,lang,array,domStyle,domAttr,domClass,_WidgetBase,_TemplatedMixin,template){
    return declare([_WidgetBase,_TemplatedMixin],{
        constructor: function(/*Object*/ params) {
            this.connects = [];
        },

        templateString: "<div class='resultsPane' data-dojo-attach-point='containerNode'></div>",

        count: 0,
        name: "",
        suppressImages: true,

        add: function(/*Object|ResultItem*/ obj) {
            try {
                if (obj) {
                    var item = null;
                    if (obj.declaredClass === "com.hdsx.jsviewer.ResultItem") {
                        item = obj;
                    }
                    else {
                        if (this.suppressImages) {
                            obj.suppressImages = true;
                        }
                        item = new ResultItem(obj);
                    }

                    item.applyAlternateBackground(this.count % 2 !== 0);

                    this.addChild(item);
                    this.count++;
                    this.connects.push(topic.subscribe(item, "onClick", lang.hitch(this, this.onResultClick)));
                    this.connects.push(topic.subscribe(item, "onHover", lang.hitch(this, this.onResultHover)));
                    this.connects.push(topic.subscribe(item, "onAction",  lang.hitch(this, this.onResultAction)));
                }
            }
            catch (err) {
                console.error("Error adding ResultItem", err);
            }
        },

        clear: function() {
            array.forEach(this.connects, function(x){
//                dojo.disconnect(x);
                x.remove();
            });
            this.connects = [];

            var children = this.getChildren();
            array.forEach(children, function(x){
                x.destroyRecursive();
            });

            this.count = 0;
            this.onResultClick({}); // empty event object
        },

        selectFirstItem: function() {
            var children = this.getChildren();
            this.onResultClick({resultItem: children[0]});
        },

        onResultClick: function(evt) {
            // stub for events
            //console.debug("onResultClick");
            //console.dir(evt);
            return evt;
        },

        onResultHover: function(evt) {
            // stub for events
            //console.debug("onResultHover");
            //console.dir(evt);
            return evt;
        },

        onResultAction: function(evt) {
            // stub for events
            //console.debug("onResultAction");
            //console.dir(evt);
            return evt;
        }
    });

    var ResultItem = declare([_WidgetBase,_TemplatedMixin],{
        constructor: function(/*Object*/ params) {

        },

        title: "",
        content: "",
        link: "",
        iconUrl: "",
        actionIconUrl: "",
        graphic: null,
        location: null,
        suppressImages: false,
        zoomScale: null,

        templatePath: template,

        postCreate: function() {
            this.setTitle(this.title);
            this.setContent(this.content);
            this.setIconUrl(this.iconUrl);
            this.setLink(this.link);
            this.setActionIconUrl(this.actionIconUrl);
            this.setZoomScale(this.zoomScale);
        },

        setTitle: function(/*String*/ title) {
            this.title = title;
            this.titleNode.innerHTML = this.title;
            domAttr.set(this.domNode, "title", this.title);
        },

        setContent: function(/*HTML*/ content) {
            if (this.suppressImages) {
                content = content.replace(/<img [^>]*>/ig,"<!--img removed-->");
            }
            this.content = content;
            this.contentNode.innerHTML = content;
            dojo.setSelectable(this.domNode, false);
        },

        setLink: function(/*URL*/ url) {
            this.link = url;
            if (this.link) {
                domStyle.set(this.linkNode, "display", "block");
                domAttr.set(this.linkNode, "title", this.link);
            }
            else {
                domStyle.set(this.linkNode, "display", "none");
            }
        },

        setIconUrl: function(/*URL*/ url) {
            this.iconUrl = url;
            if (!dojo.isIE) {
                domStyle.set(this.domNode, "backgroundImage", "url(" + this.iconUrl + ")");
            }
        },

        setActionIconUrl: function(/*URL*/ url) {
            this.actionIconUrl = url;
            if (this.actionIconUrl) {
                domStyle.set(this.actionNode, "backgroundImage", "url(" + this.actionIconUrl + ")");
                domStyle.set(this.actionNode, "display", "block");
            }
            else {
                domStyle.set(this.actionNode, "display", "none");
            }
        },

        setZoomScale: function(/*Number*/ scale) {
            if (scale) {
                try {
                    var scaleInt = parseInt(scale);
                    this.zoomScale = scaleInt;
                    return;
                }
                catch (err) {
                    console.error("ResultItem::setZoomScale could not parse scale '" + scale + "'");
                }
            }
            this.zoomScale = null;
        },

        applyAlternateBackground: function(/*boolean*/ isAlt) {
            if (isAlt && domClass.contains(this.domNode, "alt") === false) {
                domClass.add(this.domNode, "alt");
            }
            else if (!isAlt && domClass.contains(this.domNode, "alt")) {
                domClass.remove(this.domNode, "alt");
            }
        },

        removeContentImages: function() {
            query("img", this.contentNode).forEach( function(img) {
                img.parentNode.removeChild(img);
            });
        },

        // Trap "hover" events
        _hoverTimeout: null,
        _clearHoverTimeout: function() {
            if (this._hoverTimeout) {
                clearTimeout(this._hoverTimeout);
                this._hoverTimeout = null;
            }
        },

        onMouseMove: function(evt) {
            this._clearHoverTimeout();
            this._hoverTimeout = setTimeout(lang.hitch(this, function(evt) {
                this.onHover({});
            }), 300);
        },

        onMouseOut: function(evt) {
            this._clearHoverTimeout();
        },

        onClick: function(evt) {
            // stub for events
            evt.resultItem = this;
        },

        onHover: function(evt) {
            // stub for events
            evt.resultItem = this;
        },

        onFollowLink: function(evt) {
            window.open(this.link);
            evt.stopPropagation();
            //dojo.stopEvent(evt);
        },

        onAction: function(evt) {
            evt.resultItem = this;
            evt.stopPropagation();
            //dojo.stopEvent(evt);
        }
    });
});