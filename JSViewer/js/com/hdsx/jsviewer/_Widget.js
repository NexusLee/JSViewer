define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_Container",
    "dijit/_Contained"], function (declare, _WidgetBase, _TemplatedMixin, _Container, _Contained) {
    return declare([_WidgetBase, _TemplatedMixin, _Container, _Contained],
        {
            constructor: function (/*Object*/params) {
            },
            mapId: "",
            map: null,
            title: "",
            icon: "",
            alarm: "",
            config: "",
            state: "maximized",

            setId: function (/*Number*/id) {
                this.id = id;
            },
            setTitle: function (/*String*/title) {
                this.title = title;
            },
            setIcon: function (/*String*/icon) {
                this.icon = icon;
            },
            setConfig: function (/*String*/ config) {
                this.config = config;
            },
            setState: function (/*String*/state) {
                this.state = state;
            },
            setMap: function (/*esri.Map*/map) {
                this.map = map;
            }
        });
});