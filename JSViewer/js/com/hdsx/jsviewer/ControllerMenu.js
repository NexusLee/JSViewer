define(["dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_Container",
    "dijit/_Contained",
    "dojo/query",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/fx",
    "dojo/aspect",
    "dojo/_base/fx",
    "com/hdsx/jsviewer/ControllerMenuItem",
    "dojo/text!./templates/ControllerMenu.html"
], function (declare, array, lang, _WidgetBase, _TemplatedMixin,
             _Container, _Contained, query, domGeom, domStyle,
             fx, aspect, dojobasefx, ControllerMenuItem, template) {
    return declare([_WidgetBase, _TemplatedMixin, _Container, _Contained], {
        constructor: function (/*Object*/ params) {
            lang.mixin(this, params);
        },
        templateString: template,
        positionAsPct: 0,
        icon: "",
        label: "",
        visible: "",

        dropDownNode: null,

        _expandedPadding: 0,

        _timeout: null,
        _menuIsVisible: false,
        _mouseIsOverIcon: false,
        _mouseIsOverDropDown: false,

        postMixInProperties: function () {
            //console.log("ControllerMenu postMixInProperties");
            if (this.icon === "") {
                this.icon = "assets/images/icons/i_icp.png";
            }
            if (this.label === "") {
                this.label = "No Label";
            }
        },

        postCreate: function () {
//            console.log("ControllerMenu postCreate");
            this.setIcon(require.toUrl("com/hdsx/jsviewer/" + this.icon));
            this.setLabel(this.label);
        },

        startup: function () {
//            console.log("ControllerMenu startup");
            this.layout();

            // Pass to children
            var children = this.getChildren();
            array.forEach(children, function (child) {
                child.startup();
            });
        },

        addMenuItem: function (/*Object*/ params) {
            var menuItem = new ControllerMenuItem(params);
            aspect.after(menuItem, "onMenuItemClick", lang.hitch(this,this.onMenuItemClick));
            this.addChild(menuItem);
        },

        setIcon: function (/*URL*/ iconUrl) {
            var element = query(".menuIcon", this.domNode)[0];
            domStyle.set(element, "backgroundImage", "url(" + iconUrl + ")");
        },

        setLabel: function (/*String*/ label) {
            var element = query(".menuLabel", this.domNode)[0];
            element.innerHTML = label;
        },

        layout: function () {
            // set position of icon in percent
            var iconNode = query(".menuIcon", this.domNode)[0];
            domStyle.set(iconNode, "left", this.positionAsPct + "%");
            var computedStyle = domStyle.getComputedStyle(iconNode);
            // get location, width of icon in px
            var iconCoords = domGeom.getMarginBox(iconNode, computedStyle);
            var iconLeft = iconCoords.l;
            var iconWidth = iconCoords.w;
            var iconLMargin = domStyle.get(iconNode, "marginLeft");

            // calculate the centerline for the menu
            var menuCenter = iconLeft + ((iconWidth + iconLMargin) / 2);

            // position the menu dropdown
            this.dropDownNode = query(".menuDropDown", this.domNode)[0];
            var ddWidth = domStyle.get(this.dropDownNode, "width");
            domStyle.set(this.dropDownNode, "left", (menuCenter - (ddWidth / 2)) + "px");

            // size the menu box's width
            var computedStyle = domStyle.getComputedStyle(this.domNode);
            var contentBox = domGeom.getContentBox(this.domNode, computedStyle);
            var boxNode = query(".menuBox", this.domNode)[0];
            var lPad = domStyle.get(boxNode, "paddingLeft");
            var rPad = domStyle.get(boxNode, "paddingRight");
            var boxWidth = contentBox.w - (lPad + rPad + 2);
            domStyle.set(boxNode, "width", boxWidth + "px");

            // Make note of any extra padding at the top
            this._expandedPadding = domStyle.get(this.dropDownNode, "paddingTop");

            // Remove the border-bottom from the last menu item
            var itemList = query(".menuItem", this.domNode);
            var lent = itemList.length;
            if(lent>0){
                domStyle.set(itemList[itemList.length - 1], "borderBottom", 0);
            }


            // Shrink, show menu
            domStyle.set(this.dropDownNode, "height", 0 + "px");
            domStyle.set(this.dropDownNode, "visibility", "visible");
            domStyle.set(this.dropDownNode, "paddingTop", "0px");
        },

        onMenuItemClick: function (info) {
            // stub for event propagation
            this.hideMenu();
        },

        onMouseOverIcon: function (evt) {
            this._mouseIsOverIcon = true;
            this.delayedCheckMenuState(200);
        },

        onMouseOutIcon: function (evt) {
            this._mouseIsOverIcon = false;
            this.delayedCheckMenuState(50);
        },

        onMouseOverDD: function (evt) {
            this._mouseIsOverDropDown = true;
            this.delayedCheckMenuState(200);
        },

        onMouseOutDD: function (evt) {
            this._mouseIsOverDropDown = false;
            this.delayedCheckMenuState(50);
        },

        delayedCheckMenuState: function (/*Number*/ delay) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            this.timeout = setTimeout(lang.hitch(this, function () {
                this.checkMenuState();
            }), delay);
        },

        checkMenuState: function () {
            if (this._menuIsVisible === false) {
                // Menu isn't showing. Should it be?
                if (this._mouseIsOverIcon === true || this._mouseIsOverDropDown === true) {
                    this.showMenu();
                }
            }
            else {
                // Menu is showing. Should we hide it?
                if (this._mouseIsOverIcon === false && this._mouseIsOverDropDown === false) {
                    this.hideMenu();
                }
            }
        },

        showMenu: function () {
            domStyle.set(this.dropDownNode, "paddingTop", this._expandedPadding + "px");
            fx.wipeIn({
                node: this.dropDownNode,
                duration: 250
            }).play();
            this._menuIsVisible = true;
        },

        hideMenu: function () {
            dojobasefx.animateProperty({
                node: this.dropDownNode,
                duration: 150,
                properties: {
                    height: 0
                },
                onEnd: lang.hitch(this, function () {
                    domStyle.set(this.dropDownNode, "paddingTop", "0px");
                })
            }).play();
            this._menuIsVisible = false;
        }
    });
});