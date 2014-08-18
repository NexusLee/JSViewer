/**
 * Created by Administrator on 2014/8/13 0013.
 */
define({
    userinterface: {
        banner: "visible",
        title: "江西GIS共享平台",
        subtitle: "Powered by 江西省交通厅",
        logo: "assets/images/logo.png",
        stylesheet: ""
    },
    menus: [
        {
            id: "menuMap",
            visible: true,
            icon: "assets/images/icons/i_globe.png",
            label: "地图"
        },
        {
            id: "menuNav",
            visible: true,
            icon: "assets/images/icons/i_nav.png",
            label: "导航"
        },
//        {
//            id: "menuWidgets",
//            visible: true,
//            icon: "assets/images/icons/i_widget.png",
//            label: "工具"
//        },
        {
            id: "menuGongLu",
            visible: true,
            icon: "assets/images/icons/i_globe.png",
            label: "公路"
        },
        {
            id: "menuLuZheng",
            visible: true,
            icon: "assets/images/icons/i_nav.png",
            label: "路政"
        },
        {
            id: "menuYunShu",
            visible: true,
            icon: "assets/images/icons/i_widget.png",
            label: "运输"
        },
        {
            id: "menuHangWu",
            visible: true,
            icon: "assets/images/icons/i_help.png",
            label: "航务"
        },
        {
            id: "menuHelp",
            visible: true,
            icon: "assets/images/icons/i_help.png",
            label: "帮助"
        },
    ],

    map: {
        basemaps: [
            {
                menu: "menuMap",
                mapservice: {
                    label: "地图",
                    type: "dynamic",
                    visible: true,
                    icon: "assets/images/icons/i_highway.png",
                    mapUrl: "http://localhost:6080/arcgis/rest/services/OilGISTestService/MapServer",
                    alpha:"1"
                }
            }
        ],
        livemaps:[]
    },

    navtools: [
        {
            label: "放大",
            icon: "assets/images/icons/i_zoomin.png",
            menu: "menuNav",
            value: "zoomin"
        },
        {
            label: "缩小",
            icon: "assets/images/icons/i_zoomout.png",
            menu: "menuNav",
            value: "zoomout"
        },
        {
            label: "全图",
            icon: "assets/images/icons/i_zoomfull.png",
            menu: "menuNav",
            value: "zoomfull"
        },
        {
            label: "漫游",
            icon: "assets/images/icons/i_pan.png",
            menu: "menuNav",
            value: "pan"
        }
    ],

    widgets: [
        {
            label: "关于",
            icon: "assets/images/icons/i_about.png",
            menu: "menuHelp",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "鹰眼图",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuMap",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },

//公路

        {
            label: "路线查询",
            icon: "assets/images/icons/i_about.png",
            menu: "menuGongLu",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "建筑物查询",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuGongLu",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },
        {
            label: "要素查询",
            icon: "assets/images/icons/i_about.png",
            menu: "menuGongLu",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "专题图分布",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuGongLu",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },

//运输
        {
            label: "运管单位",
            icon: "assets/images/icons/i_about.png",
            menu: "menuYunShu",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "检测站",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuYunShu",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },
        {
            label: "客运站",
            icon: "assets/images/icons/i_about.png",
            menu: "menuYunShu",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "货运站",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuYunShu",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },


//路政
        {
            label: "路政机构",
            icon: "assets/images/icons/i_about.png",
            menu: "menuLuZheng",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "治超站",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuLuZheng",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },
        {
            label: "路政查询",
            icon: "assets/images/icons/i_about.png",
            menu: "menuLuZheng",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "路政车辆定位",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuLuZheng",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },


//航务
        {
            label: "路政机构",
            icon: "assets/images/icons/i_about.png",
            menu: "menuLuZheng",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "治超站",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuHangWu",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        },
        {
            label: "路政查询",
            icon: "assets/images/icons/i_about.png",
            menu: "menuHangWu",
            config: "widgets/config/AboutWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/AboutWidget"
        },
        {
            label: "路政车辆定位",
            icon: "assets/images/icons/i_overview.png",
            menu: "menuHangWu",
            config: "widgets/config/OverviewWidget.json",
            widgetType: "com/hdsx/jsviewer/widgets/OverviewWidget"
        }
    ],

    links: [
        {
            label: "帮助",
            icon: "assets/images/icons/i_help.png",
            menu: "menuHelp",
            url: "help.html"
        },
        {
            label: "主页",
            icon: "assets/images/icons/i_home.png",
            menu: "menuHelp",
            url: "http://www.esri.com"
        },
        {
            label: "资源",
            icon: "assets/images/icons/i_folder2.png",
            menu: "menuHelp",
            url: "http://resources.esri.com"
        }
    ],

    proxytype: "asp"// <!-- jsp|asp|php -->
});