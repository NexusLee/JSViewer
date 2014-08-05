*****************************************************************************

ArcGIS Sample JavaScript Viewer - Readme.txt

*****************************************************************************


SUPPORTED BROWSERS:

The developers of the JavaScript Viewer have attempted to make it as cross-browser
compatible as possible. However, the limitations of some browsers mean that
they are not fully capable of rendering the user interface of the JS Viewer. 

Due to differences in browser support of both JavaScript and Cascading Style 
Sheets (CSS) the Sample JavaScript Viewer is best viewed with Firefox 3+ and
Safari 3+ web browsers.

Firefox (3+) and Safari (3.1+) are fully supported and are the A-level platforms.
Internet Explorer 7 is supported, but has some cosmetic limitations.
Internet Explorer 6 runs, but is not supported.
Internet Explorer 8 has not been tested. This may change when the browser is released.
Google Chrome has not been tested. This may change when the browser reaches 1.0.



Directions:
-----------

Step 1:

Copy the JSViewer directory onto your web server so that it can be 
accessed as a website or virtual directory.
Example:  Copy the JSViewer directory under C:\Inetpub\wwwroot for 
Microsoft IIS web servers. 

** For IIS only **
Open the IIS Default Web Site in Computer Management:

.: [IMPORTANT] Make sure the JSViewer directory is an application, not 
   a folder. The proxy will not work otherwise.

.: [Optional but recemmended] Add new MIME type into IIS:
   json     application/jason


Step 2:
 
The JSViewer directory contains “config.xml” which is the main 
configuration file. Open the config.xml file in the JSViewer directory 
using a text editor like Notepad. Make necessary changes to the XML tags. 
See the "Description of XML Configuration Files" section below for more 
information.


Step 3:
 
The JSViewer\js\com\esri\solutions\jsviewer\widgets\config directory contains widget 
configuration files (.xml/.json). Make necessary changes to the configuration files 
using a text editor like Notepad. To add multiple instances of the same 
widget, define multiple configuration files for each widget and add a 
reference for the widget to the main config.xml file specifying the 
appropriate configuration file. See the "Description of XML Configuration 
Files" section below for more information.


Step 4:

Test the application in a browser by entering the URL to the index.html page. 
Example: http://<server>/JSViewer/index.html
Substitute "<server>" with name of your server.


Optional:

Configure additional NLS language support. In the
JSViewer\js\com\esri\solutions\jsviewer\nls directory and
JSViewer\js\com\esri\solutions\jsviewer\widgets\nls, there are files
containing the language configurations for en, en-us, and fr. Create a directory
named for the language code you wish (ex. "es" for Spanish). Copy the files from
the default \nls directory into your new subdirectory. Open each file with a text
editor such as Notepad and change the text inside to reflect the language code.
Generally, HTML entities for non-English characters are supported. (ex. "&eacute;")
In other cases, try entering the character code. (ex. ALT-0233 -> é)


Notes:
------

1) Base maps are map services which users can toggle between. Only one base 
map is visible at any given time.


2) Live maps are map services that can be overlaid on top of the base maps.


3) Results from widgets like LiveLayer, Locate and GeoRSS are displayed using 
Graphics Layers and cannot be projected on the fly.  
Please make sure the coordinate system of the data used for widgets matches 
the coordinate system of the primary map service.
The primary map service is the first base map service that gets added to the map.


4) All images provided with the JavaScript Viewer are stored in the 
JSViewer\js\com\esri\solutions\jsviewer\assets directory.  
These can be changed or substituted as required but maintain the same size 
and format for best results.
   


Usage License:
--------------

Copyright © 2008 ESRI

All rights reserved under the copyright laws of the United States.
You may freely redistribute and use this software, with or
without modification, provided you include the original copyright
and use restrictions.  See use restrictions in the file:
<install location>/JSViewer/License.txt






=======================================
DESCRIPTION OF XML CONFIGURATION FILES:
=======================================


config.xml:
-----------

userinterface:  Elements used to define the branding and overall appearance of the website.
   - banner: Parameter to make banner visible or invisible.
   - title: Title displayed on banner.
   - subtitle:  Subtitle displayed on banner.
   - logo: Path to the image displayed on banner.
   - stylesheet: Not used by JavaScript Viewer. See CSS declarations in index.html
   - menus: List of menus on the banner used to organize functional elements of the website.
      - menu: Configuration parameters for each menu.


map: Elements used to define map content and map extents.
   - basemaps: List of map services used as base maps. Only one base map is visible at all times.
      - mapservice: The URL or endpoint to the map service being used and the type of map service tiled/dynamic.
   - livemaps: List of map service that will be overlaid on top of the base map.
     - mapservice: The URL or endpoint to the map service being used and the type of map service tiled/dynamic.
   
  
navtools: List of navigation tools included in the website.
   - navtool: Configuration parameters for each navigation tool.
   
   
widgets: List of widgets included in the website.
   - widget: Configuration parameters for each widget.
  
  
links: List of hyperlinks available from the website.
   - link: Configuration parameters for each link.

proxytype: the method of server-side proxying to use for fetching data from other servers.
	 See the "Proxy Setup" section below for more information.
	- apache: proxying is supported via Apache web server configuration
	- jsp: proxying is supported via proxy.jsp
	- asp: proxying is supported via proxy.ashx
	- php: proxying is supported via proxy.php
   
   
AboutWidget.xml:
----------------

- title: Title displayed in widget.
- subtitle:  Subtitle displayed in widget.
- version: Version of website.
- description: Additional information about website.
- copyright: Copyright information about website.
- logo: path to company logo
	(AboutWidget.json is for developer demonstration purposes)
   
   
   
BookmarkWidget.json:
-----------------

- bookmarks: JSON objects for predefined named geographic extents. These
	will be shared by all users. Coordinates are in the base map
	spatial reference.
	Example: { name: "Contiguous US", coords: [-122.2, 24.89, -70.59, 46.92]}
   
   
   
DrawWidget.json:
-----------------

- geometryService: The ArcGIS GeometryServer which is used for projection and measuring
- color: the default color for drawing in RGB. [0,0,0] is black.
- size: the default size of markers, lines and text.
- font: the font face to use for drawing text.
- measureSize: the text size (in points) of text which labels measured shapes.
- labelRounding: the procedure used to round numbers in measurement labels. Options
	are for either rounding to a particular number of decimal places, or a set number
	of significant digits.
	Example: Rounding to 2 digits -> { mode: "round", digits: 2 }
	Example: Limit to 4 sig digits -> { mode: "sigdigit", digits: 4 }
   
   
GeoRSSWidget.xml: (Earthquakes, BBCWeather, etc.)
-----------------

- source: URL to the resource that represents the GeoRSS feed. 
  Example: http://earthquake.usgs.gov/eqcenter/catalogs/eqs7day-M5.xml
- refreshrate: Rate in seconds when new data will be requested from the GeoRSS source.

   
   
LiveLayerWidget.json:
-----------------

- layer: the url of the ArcGIS Server MapServer to query features from
- query: where clause to specify subset of features. Empty query defaults to
	"OBJECTID > 0"
- fields: the fields to be returned by the query.
- titleField: the returned field which will be used to label the resulting feature
- linkField: if the returned features have a field which contains a URL linking to more
	information, specify its name. A link icon will be put on the result in the UI.
- refreshRate: the periodic re-query interval in seconds
- zoomScale: the approximate scale the map will zoom to when selecting a feature


LocateWidget.xml:
-----------------

- locator: URL to the ArcGIS Server REST resource that represents a locator service.
  Example: http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer
- constrainedFields: list of input fields in the geocode server which are best represented by a dropdown list
- constraintValues: associative array, keyed by entry from constrainedFields, with list of values to drop down
  Example: ["AK","AL","AR","AZ","CA","CO","CT","DE","DC","FL" ... "WI","WV","WY"]
- minGeocodeScore: candidate score (0-100) below which will not show up in the results list
- geometry: URL to the ArcGIS Server REST resource that represents a geometry service
- projections: list of name + wkid pairs to populate the list of available input projections for entered
               coordinate pairs. Always include the special {"", -1} pair, which will represent the map projection.
  Example projection: {name: "UTM Zone 10N", wkid: 26910}



OverviewWidget.json:
---------------------

- mapService: URL to the ArcGIS Server REST resource that represents a map service.
- servicetype: either "tiled" or "dynamic".


SearchWidget.json:
---------------------

- layers: array of layers to enable searching on. Each layer is defined as:
	- name: option to be listed in the dropdown
	- url: the url of the layer to query
	- expression: where clause to use for text search. Leave blank to not include this layer in text search
	- textSearchField: field to search against for text search
	- textSearchSampleValue: sample value to show in widget UI
	- graphicalSearch: true or false, to include or not include layer in graphical search
	- fields: array of fields to return with query
	- titleField: the returned field which will be used to label the searched feature
	- linkField: if the returned features have a field which contains a URL linking to more
	- zoomScale: optional. Overrides zoomScale for this particular layer
- zoomScale: the approximate scale the map will zoom to when selecting a feature
  
  
ServiceAreaWidget.json:
---------------------

- url: the url of the Geoprocessing Service where the drive time model is published
  
  
=======================================
PROXY SETUP:
=======================================
  
Whenever the JavaScript Viewer needs to make a behind-the-scenes request for data from
the Internet, there is the possibility that your browser will stop the request due to
security concerns. In order to avoid this, one of three proxying schemes must be used, depending
on how the JavaScript Viewer is deployed.

php: 

The JavaScript Viewer is being served via the Apache web server and the PHP module is available.
Open the proxy.php file in the JSViewer directory using a text editor such as Notepad. Add any
Internet servers which you wish to access to the list in the first few lines of proxy.php.

jsp:

The JavaScript Viewer is being served via a Java application server such as Tomcat. Open the proxy.jsp
file in the JSViewer directory using a text editor such as Notepad. Add any Internet servers which
you wish to access to the list in the first few lines of proxy.jsp.

asp:

The JavaScript Viewer is being served via the Microsoft IIS web server. The JavaScript Viewer uses proxy.ashx
in the JSViewer directory to proxy. Open proxy.config. Add XML elements for any Internet servers which
you wish to access.


=======================================
WEB SERVER SETUP: (IIS in particular)
=======================================

MIME types required by the JavaScript Viewer:
  .json - text/plain
  .kml - application/vnd.google-earth.kml+xml

