define([
    "../../../../../../../../DevelopAPI/arcgis_js_v38_api/arcgis_js_api/library/3.8/3.8/js/dojo/dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/parser",
    "dojo/on",
    "com/hdsx/jsviewer/_BaseWidget",
    "com/hdsx/jsviewer/_MapGraphicsMaintainer",
    "com/hdsx/jsviewer/util",
    "dojo/string",
    "dojo/cookie",
    "dojo/json",
    "dijit/form/Button",
    "dijit/form/TextBox",
    "com/hdsx/jsviewer/ResultList",
    "esri/geometry/Extent",
    "dojo/i18n!./js/com/hdsx/jsviewer/nls/BookmarkWidgetStrings.js",
    "dojo/text!./templates/BookmarkWidget.html"
],function(declare,array,lang,parser,on,_BaseWidget,_MapGraphicsMaintainer,util,
           string,cookie,json,Button,TextBox,ResultList,Extent,BookmarkWidgetStrings,template){
    return declare([_BaseWidget,_MapGraphicsMaintainer], {
        constructor: function(/*Object*/ params) {
            this.bookmarks = [];
        },

        templateString:template,
        smallIconUrl: "",
        _initialized: false,

        i18nStrings: BookmarkWidgetStrings,

        postMixInProperties: function() {
            try {
                this.inherited(arguments);

                if (this.configData) {
                    this.bookmarks = this.configData.bookmark.bookmarks;
                }
            }
            catch (err) { console.error(err); }
        },

        postCreate: function() {
            try {
                this.inherited(arguments);

                parser.parse(this.domNode);
            }
            catch (err) { console.error(err); }
        },

        startup: function() {
            this.inherited(arguments);
            if (this._initialized) { return; }

            try {
                this.getAllNamedChildDijits();
                // Attach button click events
                this.connects.push(on(this.widgets.btnAdd, "click", lang.hitch(this, this.onBookmarkAddClick)));

                // Listen to result selection messages
                this.connects.push(on(this.widgets.results, "onResultClick", lang.hitch(this, this.onBookmarkClick)));
                this.connects.push(on(this.widgets.results, "onResultAction", lang.hitch(this, this.onBookmarkDelete)));

                // Init the list graphic symbols
                this.iconUrl = require.toUrl("com/hdsx/jsviewer" + this.icon).path;
                this.smallIconUrl = util.getSmallIcon(this.iconUrl);
                this.actionIconUrl = require.toUrl("com/hdsx/jsviewer/" + "assets/images/widget/w_close_red.png").path;

                // Determine if this user has saved bookmarks
                if (this.getSavedBookmarkCount() > 0) {
                    this.readSavedBookmarks();
                }
                // Give the bookmarks a real extent object
                var sr = this.map.spatialReference;
                array.forEach(this.bookmarks, function(b){
                    // coords from config is array of four numbers
                    // [xmin, ymin, xmax, ymax]
                    var ext = new Extent(b.coords[0], b.coords[1], b.coords[2], b.coords[3], sr);
                    b.extent = ext;
                });

                this.displayBookmarks();

                this._initialized = true;
            }
            catch (err) {
                console.error(err);
            }
        },

        shutdown: function() {
            this.inherited(arguments);
        },

        displayBookmarks: function() {
            var bookmarks = this.bookmarks;
            var list = this.widgets.results;
            var url = this.smallIconUrl;
            var actionUrl = this.actionIconUrl;

            list.clear();

            array.forEach(bookmarks, function(b) {
                list.add({
                    title: b.name,
                    content: b.coords[0] + ", " + b.coords[1] + ", " + b.coords[2] + ", " + b.coords[3],
                    iconUrl: url,
                    location: b.extent,
                    actionIconUrl: actionUrl
                });
            });
        },

        saveBookmarks: function() {
            cookie("com/hdsx/jsviewer/BookmarkWidget:count", this.bookmarks.length, {expires: 1000});

            for (var i = 0; i < this.bookmarks.length; i++) {
                var b = this.bookmarks[i];
                var bJson = JSON.stringify(b);
                cookie("com/hdsx/jsviewer/BookmarkWidget:count:" + i, bJson, {expires: 1000});
            }
        },

        getSavedBookmarkCount: function() {
            var count = cookie("com/hdsx/jsviewer/BookmarkWidget:count");
            if (count) {
                return parseInt(count, 10);
            }
            return 0;
        },

        readSavedBookmarks: function() {
            var count = this.getSavedBookmarkCount();
            this.bookmarks = [];
            for (var i = 0; i < count; i++) {
                var bJson = cookie("com/hdsx/jsviewer/BookmarkWidget:" + i);
                var b = JSON.parse(bJson);
                this.bookmarks.push(b);
            }
        },

        onBookmarkAddClick: function(evt) {
            // Create bookmark
            var ext = this.map.extent;
            var sd = util.significantDigits;
            var b = {
                name: this.widgets.bookmarkName.getValue(),
                coords: [sd(ext.xmin, 5), sd(ext.ymin, 5), sd(ext.xmax, 5), sd(ext.ymax, 5)],
                extent: ext
            };
            this.bookmarks.push(b);

            // Add it to the results
            var list = this.widgets.results;
            list.add({
                title: b.name,
                content: b.coords[0] + ", " + b.coords[1] + ", " + b.coords[2] + ", " + b.coords[3],
                iconUrl: this.smallIconUrl,
                location: b.extent,
                actionIconUrl: this.actionIconUrl
            });

            // Save bookmarks
            this.saveBookmarks();

            // Switch to the bookmarks panel
            this.onShowPanel(0);
        },

        onBookmarkDelete: function(evt) {
            // Find the bookmark to delete (by name)
            for (var i = 0; i < this.bookmarks.length; i++) {
                if (this.bookmarks[i].name === evt.resultItem.title) {
                    this.bookmarks.splice(i, 1);
                    break;
                }
            }

            this.saveBookmarks();
            this.displayBookmarks();
        },

        onBookmarkClick: function(evt) {
            // evt.resultItem is the result item dijit
            // evt.resultItem.graphic is the result in the map.
            // evt.resultItem.location is the place to zoom to
            if (evt.resultItem) {
                // zoom to location
                try {
                    this.map.setExtent(evt.resultItem.location);
                }
                catch (err) {
                    console.error("BookmarkWidget::onBookmarkClick", err);
                }
            }
        }
    });
});