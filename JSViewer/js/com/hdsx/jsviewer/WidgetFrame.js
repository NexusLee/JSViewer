define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/dom-class",
        "dojo/dom-attr",
        "dojo/dnd/Moveable",
        "dojo/dom-geometry",
        "dojo/on",
        "dojo/topic",
        "dojo/Evented",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_Container",
        "dijit/_Contained",
        "dojo/dom-style",
        "dojo/_base/fx",
        "dojo/fx",
        "dojo/dnd/move",
        "dojo/i18n!./js/com/hdsx/jsviewer/nls/WidgetFrameStrings.js",
        "dojo/text!./templates/WidgetFrame.html"],
    function (declare, array,lang, query,domClass,domAttr,Moveable,domGeom,on,topic,Evented,_WidgetBase,
              _TemplatedMixin, _Container, _Contained, domStyle, dojobasefx,fx, move,WidgetFrameStrings, template){
        return declare([_WidgetBase, _TemplatedMixin, _Container, _Contained,Evented], {

            // The widget
            widget: null,
            // configured by attributes
            icon: "",
            title: "",
            state: "maximized", // other options "minimized", "minimizing", "maximizing"

            // Frame DOM nodes
            boxNode: null,
            badgeNode: null,
            contentNode: null,
            titleNode: null,

            i18nStrings : WidgetFrameStrings,
            // Dynamic measurements taken after the frame is laid out in postCreate
            widgetWidth: 100,
            boxMaximized: null, // initialized in constructor

            templateString: template,

            constructor: function() {
                this.boxMaximized = {
                    w: 100,
                    h: [], // one for each panel
                    paddingTop: 100,
                    paddingBottom: 100,
                    paddingLeft: 100,
                    paddingRight: 100,
                    marginLeft: 100
                };
            },
            postMixInProperties: function() {
                //console.log("WidgetFrame::postMixInProperties");
                if (this.icon === "") {
                    this.icon = "assets/images/icons/i_pushpin.png";
                }
                if (this.title === "") {
                    this.title = "No Title Given";
                }
            },

            postCreate: function() {
                //console.log("WidgetFrame postCreate");
                try {
                    // Find Frame DOM nodes
                    this.boxNode = query(".widgetBadgedPane", this.domNode)[0];
                    this.badgeNode = query(".widgetBadge", this.domNode)[0];
                    this.contentNode = query(".widgetHolder", this.domNode)[0];
                    this.titleNode = query("#.widgetTitle", this.domNode)[0];
                }
                catch (err) {console.error(err);}
                //console.log("WidgetFrame postCreate finished");
            },

            startup: function() {
                if(this._started){ return; }
                //console.log("WF::startup");
                // Pass to children
                var children = this.getChildren();
                array.forEach(children, function(child){ child.startup(); });

                // Look for a child dijit of type _Widget
                for (var i = 0; i < children.length; i++){
                    // Check by duck typing for com.hdsx.jsviewer._Widget
                    var c = children[i];
                    if (c.setMap && c.setId && c.setTitle && c.setIcon && c.setState && c.setConfig){
                        this.setWidget(c, true);
                        break;
                    }
                }

                // Set width to that of parent node
                var p = this.getParent();
                var pw = domStyle.set(p.containerNode, "width");
                if (p.contentWidth) {
                    pw = p.contentWidth; //WidgetContainer defines this
                }
                domStyle.set(this.domNode, "width", pw + "px");

                // Measure the box as laid out in the default (maximized) position
                this.widgetWidth = domStyle.get(this.domNode, "width");

                this.boxMaximized.paddingTop = domStyle.get(this.boxNode, "paddingTop");
                this.boxMaximized.paddingBottom = domStyle.get(this.boxNode, "paddingBottom");
                this.boxMaximized.paddingLeft = domStyle.get(this.boxNode, "paddingLeft");
                this.boxMaximized.paddingRight = domStyle.get(this.boxNode, "paddingRight");
                this.boxMaximized.marginLeft = domStyle.get(this.boxNode, "marginLeft");
                this.boxMaximized.w = this.widgetWidth - (this.boxMaximized.marginLeft + this.boxMaximized.paddingLeft + this.boxMaximized.paddingRight);

                // One height for each panel
                for (var i = 0; i < this.widget.panels.length; i++) {
                    this.widget.showPanel(i);
                    var h = domStyle.get(this.boxNode, "height");
                    this.boxMaximized.h.push(h);
                }
                this.widget.showPanel(0);

                if (this.state === "minimized"){
                    // Minimize the widget, in zero elapsed time
                    this.minimize(0);
                }
                else {
                    // Maximize the widget, in zero elapsed time
                    this.maximize(0);
                }

                // Fade in
                dojobasefx.fadeIn({
                    node: this.domNode
                }).play();
            },

            setIcon: function(/* String */ icon) {
                try {
                    this.icon = icon;
                    domStyle.set(this.badgeNode, "backgroundImage",
                            "url(" + require.toUrl("com/hdsx/jsviewer/" +  icon) + ")");
                }
                catch (err) { console.error(err); }
            },

            setWidget: function(/*com.hdsx.jsviewer._Widget*/ widget, /*boolean*/ childAlreadyAdded) {
                // Only can set once
                if (this.widget) {
                    return;
                }

                if (!childAlreadyAdded) {
                    this.addChild(widget);
                }

                //console.log("WF::setWidget");
                this.widget = widget;

                try {
                    // Set the frame title
                    this.title = widget.title;
                    this.titleNode.innerHTML = this.title;

                    // Set the frame icon
                    this.setIcon(widget.icon);

                    // Add the button icons
                    var minBtn = query(".wbMinimize", this.domNode)[0];
                    minBtnTd = minBtn.parentNode;
                    if (widget.panels.length > 1) {
                        array.forEach(widget.panels, lang.hitch(this, function(item, idx, arr){
                            var td = document.createElement("TD");
                            var btn = document.createElement("DIV");
                            domClass.add(btn, "widgetButton");
                            domStyle.set(btn, "backgroundImage",
                                    "url(" + require.toUrl("com/hdsx/jsviewer/"+ item.buttonIcon) + ")");
                            domAttr.set(btn, "title", item.buttonText);
                            if (this.state === "minimized") {
                                domStyle.set(btn, "display", "none");
                            }

                            td.appendChild(btn);
                            minBtnTd.parentNode.insertBefore(td, minBtnTd);
                            on(btn, "click", lang.hitch(this, function(){
                                this.selectPanel(idx);
                            }));
                        }));
                    }
                }
                catch (err) {console.error(err);}
            },

            onBadgeClick: function(evt) {
                console.log("onBadgeClick " + evt.target);
                if (this.state === "maximized") {
                    // Start minimizing
                    this.minimize();
                }
                else if (this.state === "minimized") {
                    // Start maximizing
                    this.maximize();
                }
                // otherwise: we're animating, ignore the click
            },

            onMinClick: function(evt) {
                this.minimize();
            },

            onCloseClick: function(evt) {
                this.onClose(this.id);
            },

            selectPanel: function(index) {
                if (index !== this.widget.panelIndex) {
                    try {
                        // Start transition, change panel, finish transition
                        var firstHalf = dojobasefx.fadeOut({
                            node: this.contentNode,
                            duration: 150,
                            onEnd: lang.hitch(this, function(){
                                this.widget.showPanel(index);
                            })
                        });

                        var secondHalf = dojobasefx.fadeIn({
                            node: this.contentNode,
                            duration: 150
                        });

                        this.onResizeStart(this.id, {dh: this.boxMaximized.h[index] - this.boxMaximized.h[this.widget.panelIndex]});

                        var resize = dojobasefx.animateProperty({
                            node: this.boxNode,
                            duration: 150,
                            properties: {
                                height: this.boxMaximized.h[index]
                            },
                            onEnd: lang.hitch(this, function(){
                                this.onResizeEnd(this);
                            })
                        });

                        fx.chain([firstHalf, resize, secondHalf]).play();
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            },

            minimize: function(duration) {
                //console.log("minimizing!");
                var boxEndProperties = {
                    height: 20,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 20,
                    marginLeft: this.widgetWidth - 200,
                    width: 150,
                    paddingLeft: this.boxMaximized.paddingRight,
                    paddingRight: this.boxMaximized.paddingLeft
                };
                var badgeEndProperties = {
                    left: this.widgetWidth - 40
                };

                // Broadcast the change in height
                var startHeight = domStyle.get(this.boxNode, "height") + domStyle.get(this.boxNode, "paddingTop") + domStyle.get(this.boxNode, "paddingBottom") + domStyle.get(this.boxNode, "marginTop");
                var endHeight = boxEndProperties.height + boxEndProperties.paddingTop + boxEndProperties.paddingBottom + boxEndProperties.marginTop;
                this.onResizeStart(this.id, {dh: (endHeight) - (startHeight)});

                if (duration !== 0 && !duration) {
                    duration = 350;
                }
                if (duration <= 0) {
                    // Short-circuit, no animation
                    for (var key in boxEndProperties) {
                        boxEndProperties[key] = boxEndProperties[key] + "px";
                    }
                    for (var key in badgeEndProperties) {
                        badgeEndProperties[key] = badgeEndProperties[key] + "px";
                    }
                    domStyle.set(this.badgeNode, badgeEndProperties);
                    domStyle.set(this.boxNode, boxEndProperties);
                    domStyle.set(this.contentNode, "overflow", "hidden");
                    query(".widgetButton", this.domNode).style("display", "none");
                    this.state = "minimized";
                }
                else {
                    try {
                        var vShrink = dojobasefx.animateProperty({
                            node: this.boxNode,
                            duration: duration,
                            beforeBegin: lang.hitch(this, function() {
                                domStyle.set(this.contentNode, "overflow", "hidden");
                                query(".widgetButton", this.domNode).style("display", "none");
                            }),
                            properties: {
                                height: boxEndProperties.height,
                                paddingTop: boxEndProperties.paddingTop,
                                paddingBottom: boxEndProperties.paddingBottom,
                                marginTop: boxEndProperties.marginTop
                            },
                            onEnd: lang.hitch(this, function() {
                                this.onResizeEnd(this);
                            })
                        });

                        var hShrink = dojobasefx.animateProperty({
                            node: this.boxNode,
                            duration: duration,
                            beforeBegin: lang.hitch(this, function() {
                                domStyle.set(this.contentNode, "display", "none");
                            }),
                            properties: {
                                width: "10",
                                paddingLeft: "0",
                                paddingRight: "0"
                            },
                            onEnd: lang.hitch(this, function() {
                                var badgeSlide = dojobasefx.animateProperty({
                                    node: this.badgeNode,
                                    duration: duration,
                                    properties: badgeEndProperties
                                });

                                var hGrow = dojobasefx.animateProperty({
                                    node: this.boxNode,
                                    duration: duration,
                                    properties: {
                                        marginLeft: boxEndProperties.marginLeft,
                                        width: boxEndProperties.width,
                                        paddingLeft: boxEndProperties.paddingLeft,
                                        paddingRight: boxEndProperties.paddingRight
                                    },
                                    onEnd: lang.hitch(this, function() {
                                        //console.log("minimized!");
                                        this.state = "minimized";
                                    })
                                });
                                fx.combine([badgeSlide, hGrow]).play();
                            })
                        });

                        fx.chain([vShrink, hShrink]).play();
                        this.state = "minimizing";
                    }
                    catch (err) {console.error(err);}
                }
            },

            maximize: function (duration) {
                var boxEndProperties = {
                    height: this.boxMaximized.h[this.widget.panelIndex],
                    paddingTop: this.boxMaximized.paddingTop,
                    paddingBottom: this.boxMaximized.paddingBottom,
                    marginTop: 0,
                    marginLeft: this.boxMaximized.marginLeft,
                    width: this.boxMaximized.w,
                    paddingLeft: this.boxMaximized.paddingLeft,
                    paddingRight: this.boxMaximized.paddingRight
                };
                var badgeEndProperties = {
                    left: 0
                };
                if (duration !== 0 && !duration) {
                    duration = 350;
                }
                if (duration <= 0) {
                    // 不使用动画效果
                    for (var key in boxEndProperties) {
                        boxEndProperties[key] = boxEndProperties[key] + "px";
                    }
                    for (var key in badgeEndProperties) {
                        badgeEndProperties[key] = badgeEndProperties[key] + "px";
                    }
                    domStyle.set(this.badgeNode, badgeEndProperties);
                    domStyle.set(this.boxNode, boxEndProperties);
                    domStyle.set(this.contentNode, "overflow", "auto");
                    query(".widgetButton", this.domNode).style("display", "block");
                    this.state = "maximized";
                }
                else {
                    try {
                        var hShrink = dojobasefx.animateProperty({
                            node: this.boxNode,
                            properties: {
                                marginLeft: 0,
                                width: 10,
                                paddingLeft: 0,
                                paddingRight: 0
                            },
                            onBegin:lang.hitch(this,function(){
                                var badgeSlide = dojobasefx.animateProperty({
                                    node: this.badgeNode,
                                    duration: duration,
                                    properties: badgeEndProperties
                                });
                                fx.chain([badgeSlide]).play();
                            }),
                            onEnd: lang.hitch(this, function () {
                                var hGrow = dojobasefx.animateProperty({
                                    node: this.boxNode,
                                    properties: {
                                        width: boxEndProperties.width,
                                        paddingLeft: boxEndProperties.paddingLeft,
                                        paddingRight: boxEndProperties.paddingRight,
                                        marginLeft: boxEndProperties.marginLeft
                                    }
                                });

                                var vGrow = dojobasefx.animateProperty({
                                    node: this.boxNode,
                                    beforeBegin: lang.hitch(this, function () {
                                        domStyle.set(this.contentNode, "display", "block");
                                    }),
                                    onEnd: lang.hitch(this, function () {
                                        console.info("垂直最大化动画onEnd");
                                        this.state = "maximized";
                                        domStyle.set(this.contentNode, "overflow", "auto");
                                        query(".widgetButton", this.domNode).style("display", "block");
                                        this.onResizeEnd(this);
                                    }),
                                    properties: {
                                        height: boxEndProperties.height,
                                        paddingTop: boxEndProperties.paddingTop,
                                        paddingBottom: boxEndProperties.paddingBottom,
                                        marginTop: boxEndProperties.marginTop
                                    }
                                });
                                fx.chain([hGrow, vGrow]).play();
                            })
                        });
                        hShrink.play();
                        this.state = "maximizing";
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            },

            getBoundingBox: function() {
                var computedStyledomNode = domStyle.getComputedStyle(this.domNode);
                var computedStyleboxNode = domStyle.getComputedStyle(this.boxNode);

                var domBox = domGeom.getMarginBox(this.domNode,computedStyledomNode);
                var boxBox = domGeom.getMarginBox(this.boxNode,computedStyleboxNode);
                var bb = {
                    w: domBox.w, h: boxBox.h, t: domBox.t, l: domBox.l
                };
                //console.dir(bb);
                return bb;
            },

            onResizeStart: function(/*String*/ frameId, /*Object*/ endBounds) {

            },

            onResizeEnd: function(/*WidgetFrame*/ frame) {

            },

            onClose: function(/*String*/ frameId) {
                topic.publish("onClose",this.id);
                return frameId;
                // stub for event handling in WidgetContainer
            }
        });
    });
