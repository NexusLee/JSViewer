define(["dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_Container",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/query",
    "dojo/dom-style",
    "dojo/_base/array",
    "dojo/fx",
    "dojo/_base/fx",
    "dojo/NodeList-fx",
    "com/hdsx/jsviewer/WidgetFrame",
    "com/hdsx/jsviewer/_Widget",
    "dojo/text!./templates/WidgetContainer.html"
], function (declare, _WidgetBase,_TemplatedMixin,_Container,lang,
             on,topic,domGeom, domClass, query,domStyle, array, fx,dojobasefx,
             nodeListFx, WidgetFrame, _Widget, template) {
    return declare([_WidgetBase, _TemplatedMixin, _Container], {
        templateString: template,
        showHideButton: null,
        contentWidth: 0,
        _containerPadding: 0,
        postMixInProperties: function () {
            //console.log("WidgetContainer::postMixInProperties");
        },
        postCreate: function () {
            // Get references to nodes
            console.log("WidgetContainer postCreate");
            this.showHideButton = query(".wbHide", this.domNode)[0];
            this._scrollDiv = query(".widgetContainerControls", this.domNode)[0];
            this._containerPadding = domStyle.get(this.domNode, "paddingTop");
            // showWidget event: create if necessary, maximize
            topic.subscribe("showWidget", lang.hitch(this,this.onShowWidget));

            //当地图大小改变时，调整widget位置
            topic.subscribe("mapResizedEvent", lang.hitch(this,this.onMapResize));
        },
        startup: function () {
            if (this._started) {
                return;
            }
            var children = this.getChildren();
            // Pass to children
            array.forEach(children, function (child) {
                child.startup();
            });
            console.info("在WidgetContainerstartup中subscribe   onClose");
            for (var i = 0; i < children.length; i++) {
                topic.subscribe("onResizeStart", lang.hitch(this,this.frameResizing));
                topic.subscribe("onClose", lang.hitch(this,this.closeWidget));
                topic.subscribe("onResizeEnd", lang.hitch(this,this.ensureFrameIsVisible));
            }
            // 将布局从width 400, right 0更改到width 0, right 400
            try {
                var w = parseInt(domStyle.get(this.domNode, "width"));
                var r = parseInt(domStyle.get(this.domNode, "right"));

                // Store width so that frames can get it
                this.contentWidth = w;

                domStyle.set(this.domNode, "width", "0px");
                domStyle.set(this.domNode, "right", (r + w) + "px");
                domStyle.set(this._scrollDiv, "left", (w + 6) + "px");
            }
            catch (err) {
                console.error(err);
            }
            this.inherited(arguments);
        },
        onMapResize: function (/*Object*/ mapBox) {
            // Just simple, scroll the top widget into view
            var children = this.getChildren();
            if (children[0]) {
                this.ensureFrameIsVisible(children[0]);
            }
        },

        onShowWidget: function (widget) {
            if (widget) {
                // 查找widget
                var bFound = false;
                var frames = this.getChildren();
                for (var i = 0; i < frames.length; i++) {
                    var frame = frames[i];
                    if (frame.widget === widget) {
                        if (frame.state === "minimized") {
                            // onResizeEnd will call ensureFrameIsVisible
                            frame.maximize();
                        }
                        else {
                            this.ensureFrameIsVisible(frame);
                        }
                        bFound = true;
                        break;
                    }
                }

                if (!bFound) {
                    // 没有找到widget,创建一个并添加
                    var frame = new WidgetFrame();
                    frame.setWidget(widget);
                    this.addChild(frame);
                    topic.subscribe("onResizeStart", lang.hitch(this, this.frameResizing));
                    topic.subscribe("onClose", lang.hitch(this,this.closeWidget));
                    topic.subscribe("onResizeEnd", lang.hitch(this,this.ensureFrameIsVisible));

                    if (frames.length > 0) {
                        // Position it relative to the last frame
                        this.positionFrameAfterFrame(frame, frames[frames.length - 1]);
                    }
                    this.ensureFrameIsVisible(frame);
                }

                if (domClass.contains(this.showHideButton, "wbShow")) {
                    this.onClickShow();
                }
            }
        },

        onClickShow: function (evt) {
            if (domClass.contains(this.showHideButton, "wbHide")) {
                domClass.add(this.showHideButton, "wbShow");
                domClass.remove(this.showHideButton, "wbHide");
                this.minimize();
            }
            else {
                domClass.add(this.showHideButton, "wbHide");
                domClass.remove(this.showHideButton, "wbShow");
                this.maximize();
            }
        },

        onClickUp: function (evt) {
            try {
                var children = this.getChildren();
                var computedStyle = domStyle.getComputedStyle(this.domNode);
                var containerBox = domGeom.getContentBox(this.domNode, computedStyle);

                // Are there any frames off the top of the screen?
                // Get the last frame which is at least partly off the screen
                if (children.length === 0) {
                    return;
                }
                var target = null;
                for (var i = children.length - 1; i >= 0; i--) {
                    var frameBox = children[i].getBoundingBox();
                    if (frameBox.t < 0) {
                        target = children[i];
                        break;
                    }
                }

                if (target) {
                    this.ensureFrameIsVisible(target);
                }
            }
            catch (err) {
                console.error(err);
            }
        },

        onClickDown: function (evt) {
            try {
                var children = this.getChildren();
                var computedStyle = domStyle.getComputedStyle(this.domNode);
                var containerBox = domGeom.getContentBox(this.domNode, computedStyle);
                //var containerBox = dojo.contentBox(this.domNode);

                // Are there any frames off the bottom of the screen?
                // Get the first frame which is at least partly off the screen
                if (children.length === 0) {
                    return;
                }
                var target = null;
                for (var i = 0; i < children.length; i++) {
                    var frameBox = children[i].getBoundingBox();
                    if (frameBox.t + frameBox.h > containerBox.h) {
                        target = children[i];
                        break;
                    }
                }

                if (target) {
                    this.ensureFrameIsVisible(target);
                }
            }
            catch (err) {
                console.error(err);
            }
        },

        ensureFrameIsVisible: function (/*WidgetFrame*/ target) {
            var computedStyle = domStyle.getComputedStyle(this.domNode);
            var containerBox = domGeom.getContentBox(this.domNode, computedStyle);
            //var containerBox = dojo.contentBox(this.domNode);
            var frameBox = target.getBoundingBox();

            // Off the top?
            if (frameBox.t < this._containerPadding) {
                var downShiftDistance = this._containerPadding - frameBox.t; //pixels

                // Move all of the frames downShiftDistance
                var nodes = query(".widgetFrame", this.domNode);
                this.moveFrames(nodes, downShiftDistance);
            }
            // Off the bottom?
            else if (frameBox.t + frameBox.h > containerBox.h - this._containerPadding) {
                var upShiftDistance = frameBox.t - (containerBox.h - frameBox.h - this._containerPadding); //pixels

                // Move all of the frames upShiftDistance
                var nodes = query(".widgetFrame", this.domNode);
                this.moveFrames(nodes, upShiftDistance * -1);
            }
        },

        positionFrameAfterFrame: function (/*WidgetFrame*/ frameToPlace, /*WidgetFrame*/ afterFrame) {
            console.info("多个widget的时候，修改widget的位置");
            var bBox = afterFrame.getBoundingBox();
            var y = bBox.t + bBox.h + 20;
            domStyle.set(frameToPlace.domNode, "top", y + "px");
        },

        moveFrames: function (/*NodeList*/ frameDomNodes, /*Number*/ distance) {
            if (frameDomNodes && frameDomNodes.length > 0 && distance !== 0) {
                var animations = [];
                frameDomNodes.forEach(function (n) {
                    var t = domStyle.get(n, "top");
                    var a = dojobasefx.animateProperty({
                        node: n,
                        properties: {
                            top: t + distance
                        }
                    });
                    animations.push(a);
                });

                fx.combine(animations).play();
            }
        },

        minimize: function () {
            console.info("WidgetContainer::minimize方法");
            var slideDistance = parseInt(domStyle.get(this.domNode, "right"));
            var allFrames = query(".widgetFrame", this.domNode);

            allFrames.fadeOut().play();
            allFrames.animateProperty({
                properties: {
                    left: slideDistance
                }
            }).play();
        },

        maximize: function () {
            console.info("WidgetContainer::minimize方法");
            var allFrames = query(".widgetFrame", this.domNode);

            allFrames.fadeIn().play();
            allFrames.animateProperty({
                properties: {
                    left: 0
                }
            }).play();
        },

        frameResizing: function (/*String*/ frameId, /*Object*/ deltas) {
            // One of the frames is resizing. Make room, or snug up
            console.info("frameResizing");
            try {
                var children = this.getChildren();

                var target = null;
                var nodesAfter = query.NodeList();
                var shiftDistance = 0;

                for (var i = 0; i < children.length; i++) {
                    var frame = children[i];

                    var frameBox = frame.getBoundingBox();
                    if (frame.id === frameId) {
                        target = frame;
                        targetTop = frameBox.t;
                        // Growth will cause a shift down, shrink a shift up
                        shiftDistance = deltas.dh;
                    }
                    else {
                        if (target) {
                            // target already found, this is after
                            nodesAfter.push(frame.domNode);
                        }
                    }
                }

                if (target) {
                    // Nodes after the target slide up or down
                    this.moveFrames(nodesAfter, shiftDistance);
                }
            }
            catch (err) {
                console.error(err);
            }
        },

        closeWidget: function (/*String*/ frameId) {
            console.info("通过topic.publish调用widget的关闭事件");
            try {
                var computedStyle = domStyle.getComputedStyle(this.domNode);
                var containerBox = domGeom.getContentBox(this.domNode, computedStyle);
                var children = this.getChildren();

                var target = null;
                var targetTop = 0;
                var firstFrameOffTop = null;
                var ffOffTopTop = 0;
                var nodesBefore = query.NodeList();
                var nodesAfter = query.NodeList();
                var upShiftDistance = 0;
                var downShiftDistance = 0;

                for (var i = 0; i < children.length; i++) {
                    var frame = children[i];

                    var frameBox = frame.getBoundingBox();
                    if (frame.id === frameId) {
                        target = frame;
                        targetTop = frameBox.t;

                        // Odd case where a widget is closed when partly off the top
                        if (targetTop < this._containerPadding) {
                            targetTop = this._containerPadding;
                        }
                    }
                    else {
                        if (frameBox.t < this._containerPadding) {
                            firstFrameOffTop = frame;
                            ffOffTopTop = frameBox.t;
                        }

                        if (target) {
                            // target already found, this is after
                            nodesAfter.push(frame.domNode);

                            if (upShiftDistance === 0) {
                                upShiftDistance = domStyle.get(frame.domNode, "top") - targetTop;
                            }
                        }
                        else {
                            // target not found yet, this is before
                            nodesBefore.push(frame.domNode);
                        }
                    }
                }

                if (target) {
                    // Calculate shifts. Nodes after the target slide up,
                    // but if there is one or more frames off the top of the
                    // container, the nodes before slide down and they meet in the middle
                    if (firstFrameOffTop) {
                        // calculate downShiftDistance
                        downShiftDistance = this._containerPadding - ffOffTopTop; //pixels

                        // adjust upShiftDistance
                        upShiftDistance -= downShiftDistance;
                    }

                    // Fade out and remove target
                   dojobasefx.fadeOut({
                        node: target.domNode,
                        onEnd: lang.hitch(this, function () {
                            this.removeChild(target); // remove, don't destroy Widget
                            if (target.widget && target.widget.shutdown) {
                                target.widget.shutdown();
                            }
                        })
                    }).play();

                    // Slide all nodes before down
                    // (If nothing is off the top, downShiftDistance is zero, no shift)
                    this.moveFrames(nodesBefore, downShiftDistance);

                    // Slide all nodes after up
                    this.moveFrames(nodesAfter, upShiftDistance * -1);
                }
            }
            catch (err) {
                console.error(err);
            }
        }
    });
});