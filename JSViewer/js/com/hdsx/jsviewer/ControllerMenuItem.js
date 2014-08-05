define([
    "dojo/_base/declare",
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/_Container",
    "dijit/_Contained",
    "dojo/dom-style",
    "com/hdsx/jsviewer/util",
    "dojo/text!./templates/ControllerMenuItem.html"
], function (declare, _Widget, _Templated, _Container, _Contained, domStyle, util, template) {
    return declare([_Widget, _Templated, _Contained], {
        constructor: function (/*Object*/ params) {

        },
        templateString: template,
        label: "",
        icon: "",
        value: "",
        menuCode: "",
        title: "", // tooltip text
        url: "",

        postMixInProperties: function () {
            //console.log("ControllerMenuItem postMixInProperties");
            if (this.icon === "") {
                this.icon = "assets/images/icons/i_icp.png";
            }
            if (this.label === "") {
                this.label = "No Label";
            }
            if (!this.value) {
                this.value = this.label;
            }
            if (!this.title) {
                if (this.url) {
                    this.title = this.url;
                }
                else {
                    this.title = this.label;
                }
            }
        },

        postCreate: function () {
            //console.log("ControllerMenuItem postCreate");
            var iconUrl = require.toUrl("com/hdsx/jsviewer/" + this.icon);
            this.setIcon(iconUrl);
            dojo.setSelectable(this.domNode, false);
        },

        startup: function () {
            //console.log("ControllerMenuItem startup");
        },

        onClick: function (evt) {
            console.info("我被点击了");
            this.onMenuItemClick({
                value: this.value,
                label: this.label,
                menuCode: this.menuCode
            });
        },

        onMenuItemClick: function (data) {
            // stub for event propagation
            console.info("data.value::" +data.value);
            return data;
        },

        setIcon: function (/*URL*/ iconUrl) {
            var smallIconUrl = util.getSmallIcon(iconUrl);
            domStyle.set(this.domNode, "backgroundImage", "url(" + smallIconUrl + ")");
        }
    });
});