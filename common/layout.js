/* 
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('viewer.LayoutManager', {
    defaultRegionSettings: {
        header: {region: 'north', columnOrientation: 'horizontal', useTabs: false, defaultLayout: {height: 150}},
        leftmargin_top: {region:'west', subregion:'center', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {width: 250}},
        leftmargin_bottom: {region:'west', subregion:'south', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {height: 250}},
        left_menu: {region:'center', subregion:'west', columnOrientation: 'horizontal', subRegionOrientation: 'vertical', singleComponentBlock: true, useTabs: false, defaultLayout: {width: 150}},
        top_menu: {region:'none'},
        content: {region:'center', subregion:'center', columnOrientation: 'horizontal', subRegionOrientation: 'vertical', useTabs: false, defaultLayout: {}},
        popupwindow: {},
        rightmargin_top: {region:'east', subregion:'center', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {width: 250}},
        rightmargin_bottom: {region:'east', subregion:'south', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {height: 250}},
        footer: {region:'south', columnOrientation: 'horizontal', useTabs: false, defaultLayout: {height: 150}}
    },
    layout: {},
    layoutItems: {},
    mapId: '',
    componentList: [],
    wrapperId: 'wrapper',
    autoRender: true,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        if(this.autoRender) {
            this.createLayout();
        }
    },

    createLayout: function() {
        var me = this;
        console.log('LAYOUTMANAGER: ', me);
        var regionList = me.createRegionList();
        console.log('REGIONLIST: ', regionList);
        var viewportItems = me.buildLayoutRegions(regionList);
        console.log('VIEWPORTITEMS: ', viewportItems);
        me.renderLayout(viewportItems);
    },

    createRegionList: function() {
        var me = this;
        var layoutItems = {};

        Ext.Object.each(me.layout, function(regionid, regionconfig) {
            // If region has components, add it to the list
            if(regionconfig.components.length > 0) {
                // Fetch default config
                var defaultConfig = me.defaultRegionSettings[regionid];
                // Layoutregions are added throug array because 1 Ext region (e.g. west) can have multiple regions
                if(!Ext.isDefined(layoutItems[defaultConfig.region])) {
                    layoutItems[defaultConfig.region] = [];
                }
                // Push the layout to the array
                layoutItems[me.defaultRegionSettings[regionid].region].push({
                    // Region name
                    name: regionid,
                    // regionConfig holds the regionconfig from the layoutmanager
                    regionConfig: regionconfig,
                    // regionDefaultConfig holds the defaultConfig region
                    regionDefaultConfig: defaultConfig
                });
            }
        });
        return layoutItems;
    },

    buildLayoutRegions: function(regionList) {
        var viewportItems = [];
        var me = this;
        Ext.Object.each(regionList, function(region, value) {
            viewportItems.push(me.getLayoutRegion(region, value));
        });
        return viewportItems;
    },
    
    getLayoutRegion: function(regionid, regionitems) {
        var me = this;
        var layout = {
            width: 0,
            height: 0
        };
        var regionlayout = null;
        var extLayout = '';
        if(regionitems.length > 1) {
            var items = me.getSubLayoutRegion(regionitems);
            var centerItem = me.getSubRegionCenterItem(regionitems);
            if(items.length > 0 && centerItem != null) {
                extLayout = { type: 'vbox', align: 'stretch' };
                if(centerItem.regionDefaultConfig.columnOrientation == 'horizontal') extLayout = { type: 'hbox', align: 'stretch' };
                if(regionid != 'center') {
                    layout.width = centerItem.regionDefaultConfig.defaultLayout.width;
                    regionlayout = centerItem.regionConfig.layout;
                    if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                        layout.width = parseInt(regionlayout.width);
                    } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                        layout.flex = parseInt(regionlayout.width) / 100;
                    }
                } else {
                    layout.flex = 1;
                    layout.height = '100%';
                }
                return Ext.apply({
                    xtype: 'container',
                    region: regionid,
                    layout: extLayout,
                    items: items
                }, layout);
            }
        } else {
            regionlayout = regionitems[0].regionConfig.layout;
            var componentItems = me.createComponents(regionitems[0].regionConfig.components, regionitems[0].regionDefaultConfig, regionlayout);
            componentItems = me.getRegionContent(componentItems, regionlayout);
            if(regionitems[0].regionDefaultConfig.region != "none") {
                layout = regionitems[0].regionDefaultConfig.defaultLayout;
                if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                    layout.width = parseInt(regionlayout.width);
                } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                    layout.flex = parseInt(regionlayout.width) / 100;
                }
                if(regionlayout.height != '' && regionlayout.heightmeasure == 'px') {
                    layout.height = parseInt(regionlayout.height);
                } else if(regionlayout.height != '' && regionlayout.heightmeasure == '%') {
                    layout.flex = parseInt(regionlayout.height) / 100;
                }
                
                extLayout = 'fit';
                if(regionlayout.useTabs == false && componentItems.length > 1 && !Ext.isDefined(regionitems[0].regionDefaultConfig.singleComponentBlock) && !regionitems[0].regionDefaultConfig.singleComponentBlock) {
                    extLayout = { type: 'vbox', align: 'stretch' };
                    if(regionitems[0].regionDefaultConfig.columnOrientation == 'horizontal') {
                        extLayout = { type: 'hbox', align: 'stretch' };
                    }
                }
                return Ext.apply({
                    xtype: 'container',
                    region: regionid,
                    layout: extLayout,
                    items: componentItems
                }, layout);
            }
        }
        return {};
    },
    
    getSubLayoutRegion: function(regionitems) {
        var me = this;
        var items = {};
        Ext.Array.each(regionitems, function(item, index) {
            var sublayout = {};
            var regionlayout = item.regionConfig.layout;
            var componentItems = me.createComponents(item.regionConfig.components, item.regionDefaultConfig, regionlayout);
            componentItems = me.getRegionContent(componentItems, regionlayout);
            if(item.regionDefaultConfig.columnOrientation == 'vertical') {
                if(item.regionDefaultConfig.subregion != 'center') {
                    sublayout = Ext.apply({
                        width: 0
                    }, item.regionDefaultConfig.defaultLayout);
                    if(regionlayout.height != '' && regionlayout.heightmeasure == 'px') {
                        sublayout.height = parseInt(regionlayout.height);
                    } else if(regionlayout.height != '' && regionlayout.heightmeasure == '%') {
                        sublayout.flex = parseInt(regionlayout.height) / 100;
                    }
                } else {
                    sublayout.flex = 1;
                }
                sublayout.width = '100%';
            }
            if(item.regionDefaultConfig.columnOrientation == 'horizontal') {
                if(item.regionDefaultConfig.subregion != 'center') {
                    sublayout = Ext.apply({
                        height: 0
                    }, item.regionDefaultConfig.defaultLayout);
                    if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                        sublayout.width = parseInt(regionlayout.width);
                    } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                        sublayout.flex = parseInt(regionlayout.width) / 100;
                    }
                } else {
                    sublayout.flex = 1;
                }
                sublayout.height = '100%';
            }

            var extLayout = 'fit';
            if(regionlayout.useTabs == false && componentItems.length > 1 && !Ext.isDefined(item.regionDefaultConfig.singleComponentBlock) && !item.regionDefaultConfig.singleComponentBlock) {
                extLayout = { type: 'vbox', align: 'stretch' };
                if(item.regionDefaultConfig.subRegionOrientation == 'horizontal') {
                    extLayout = { type: 'hbox', align: 'stretch' };
                }
            }
            if(item.regionDefaultConfig.subregion != "none") {
                items[item.regionDefaultConfig.subregion] = Ext.apply({
                    xtype: 'container',
                    items: componentItems,
                    layout: extLayout
                }, sublayout);
            }
        });
        return me.reorderSubRegions(items);
    },
    
    reorderSubRegions: function(subregions) {
        var order = ['north','west','center','east','south'];
        var items = [];
        Ext.Array.each(order, function(regionname) {
            if(Ext.isDefined(subregions[regionname])) {
                items.push(subregions[regionname]);
            }
        });
        return items;
    },
    
    getSubRegionCenterItem: function(regionitems) {
        var centerItem = null;
        Ext.Array.each(regionitems, function(item, index) {
            if(item.regionDefaultConfig.subregion == 'center') {
                centerItem =  item;
            }
        });
        return centerItem;
    },

    createComponents: function(components, regionDefaultConfig, regionlayout) {
        var componentItems = [];
        var cmpId = null;
        var me = this;
        var first = true;
        var singleBlock = (Ext.isDefined(regionDefaultConfig.singleComponentBlock) && regionDefaultConfig.singleComponentBlock);
        
        Ext.Array.each(components, function(component) {
            if(!singleBlock || (singleBlock && first)) {
                cmpId = Ext.id();
            }
            var compStyle = {width: '100%',height: '100%'};
            var compFlex = 0;
            if(regionlayout.useTabs == false && !singleBlock) {
                compStyle = {width: '100%'};
                if(Ext.isDefined(regionDefaultConfig.subRegionOrientation)) {
                    if(regionDefaultConfig.subRegionOrientation == 'horizontal') {
                        compStyle = {height: '100%'};
                    }
                } else {
                    if(regionDefaultConfig.columnOrientation == 'horizontal') {
                        compStyle = {height: '100%'};
                    }
                }
                compFlex = 1;
            }
            var cmpView = {
                xtype: 'container',
                // Title is used in tabs
                title: component.name,
                cls: 'component-view',
                tpl: '<tpl for="."><div class="viewer-component-block" id="{id}"></div></tpl>',
                data: {
                    id: cmpId,
                    cmp_name: component.name
                },
                layout: 'fit',
                hideMode: 'offsets',
                style: compStyle,
                flex: compFlex
            };
            if(!singleBlock || (singleBlock && first)) {
                componentItems.push(cmpView);
            }
            me.componentList.push({
                htmlId: cmpId,
                componentName: component.name,
                componentClass: component.componentClass
            });
            if(component.componentClass == "FlamingoMap") {
                me.mapId = cmpId;
            }
            first = false;
        });

        return componentItems;
    },

    getRegionContent: function(componentItems, regionlayout) {
        if(Ext.isDefined(regionlayout.useTabs) && regionlayout.useTabs && componentItems.length > 1) {
            var cmpId = Ext.id();
            var tabcomponent = {
                xtype: 'tabpanel',
                id: cmpId,
                activeTab: 0,
                deferredRender: false,
                defaults: {
                    hideMode: 'offsets'
                },
                items: componentItems
            };
            return tabcomponent;
        }
        return componentItems;
    },

    renderLayout: function(viewportItems) {
        var me = this;
        Ext.create('Ext.container.Container', {
            layout: 'border',
            items: viewportItems,
            renderTo: me.wrapperId,
            height: '100%',
            width: '100%'
        });
    },

    getMapId: function() {
        return this.mapId;
    },

    getComponentList: function() {
        return this.componentList;
    }
});
