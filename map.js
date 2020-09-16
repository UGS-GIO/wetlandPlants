require([
    // ArcGIS
    "esri/Map",
    "esri/views/MapView",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/layers/GraphicsLayer",
    "esri/layers/ImageryLayer",
    "esri/layers/support/RasterFunction",
    "esri/Basemap",
    "esri/widgets/BasemapGallery",
    "esri/widgets/BasemapGallery/support/LocalBasemapsSource",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    //Layers
    "esri/layers/FeatureLayer",
    "esri/layers/MapImageLayer",
    //Tasks  
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    // Widgets
    "esri/widgets/Home",
    "esri/widgets/ScaleBar",
    "esri/widgets/Zoom",
    "esri/widgets/Compass",
    "esri/widgets/Search",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/LayerList",
    "esri/widgets/BasemapToggle",
    "esri/core/watchUtils",
    "esri/tasks/support/RelationshipQuery",
    "esri/popup/content/AttachmentsContent",

    // Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",

    // Dojo
    "dojo/query",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dojo/data/ItemFileReadStore",
    "dojox/grid/DataGrid",
    "dgrid/OnDemandGrid",
    "dgrid/extensions/ColumnHider",
    "dgrid/Selection",
    "dstore/legacy/StoreAdapter",
    "dgrid/List",
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/aspect",
    "dojo/request",
    "dojo/mouse",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.9",

    // Calcite Maps ArcGIS Support
    "calcite-maps/calcitemaps-arcgis-support-v0.10",
    "dojo/on",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/domReady!"
], function(Map, MapView, SimpleMarkerSymbol, GraphicsLayer, ImageryLayer, RasterFunction, Basemap, BasemapGallery, LocalBasemapsSource, SketchViewModel, Graphic, FeatureLayer, MapImageLayer, Query, QueryTask, Home, ScaleBar, Zoom, Compass, Search, Legend, Expand, LayerList, BasemapToggle, watchUtils, RelationshipQuery, AttachmentsContent, Collapse, Dropdown, query, Memory, ObjectStore, ItemFileReadStore, DataGrid, OnDemandGrid, ColumnHider, Selection, StoreAdapter, List, declare, parser, aspect, request, mouse, CalciteMaps, CalciteMapArcGISSupport, on, arrayUtils, dom, domClass, domConstruct) {

    //Create the map, view and widgets

    let grid;

    let type1 = "All";
    let type2 = "All";
    let type3 = "All";
    let type4 = "All";

    let sitesCount;

    // create a new datastore for the on demandgrid
    // will be used to display attributes of selected features
    let dataStore = new StoreAdapter({
        objectStore: new Memory({
            idProperty: "objectid"
        })
    });

    // let gridFields = ["project", "watershed", "sitecode", "ecoSystem",
    //     "hgmClass", "wetlandtype", "vegetationcondition", "coverMethod", "surveydate"
    // ];

    let speciesFields = ["objectid", "family", "scientificname", "commonname", "cover",
        "nativity", "noxious", "growthform", "wetlandindicator", "cvalue"
    ];

    let skecthViewModel;
    let polygonGraphicsLayer;
    let highlight;


    const gridDis = document.getElementById("gridDisplay");
    

    // Defines an action to open species related to the selected feature
    var speciesAction = {
        title: "Species Found at Site",
        id: "related-species",
        className: "esri-icon-table"
    };

    // Defines an action to open projects related to the selected feature
    var projectAction = {
        title: "Project Information",
        id: "related-projects",
        className: "esri-icon-table"
    };








    contentSites = function(feature) {
        var content = "";

        if (feature.graphic.attributes.project) {
            content += "<span class='bold' title='Project that collected site data'><b>Project: </b></span>{project}<br/>";
        }
            if (feature.graphic.attributes.sitecode) {
                content += "<span class='bold' title='Unique site identifier'><b>Site Code: </b></span>{sitecode}<br/>";
            }
            if (feature.graphic.attributes.surveydate) {
                console.log(feature.graphic.attributes.surveydate);
                const date = moment(feature.graphic.attributes.surveydate).format('ll');
                content += "<span class='bold' title='Date site was visited'><b>Survey Date: </b></span>{surveydate}<br/>";
            }
            if (feature.graphic.attributes.watershed) {
                content += "<span class='bold' title='Hydrologic unit defined at the HUC8 level'><b>Watershed: </b></span>{watershed}<br/>";
            }
            if (feature.graphic.attributes.ecoregionalgroup) {
                content += "<span class='bold' title='Modified level III ecoregional group'><b>Ecoregional Group: </b></span>{ecoregionalgroup}<br/>";
            }
            if (feature.graphic.attributes.owner) {
                content += "<span class='bold' title='Entity that owns parcel where site is located, as of early 2020'><b>Land Owner: </b></span>{owner}<br/>";
            }
            if (feature.graphic.attributes.wetlandtype) {
                content += "<span class='bold' title='Primary, or dominant, wetland type as assigned by UGS'><b>Primary Wetland Type: </b></span>{wetlandtype}<br/>";
            }
            if (feature.graphic.attributes.wetlandtype2) {
                content += "<span class='bold' title='Secondary wetland type as assigned by UGS for mixed type sites'><b>Secondary Wetland Type: </b></span>{wetlandtype2}<br/>";
            }
            if (feature.graphic.attributes.projectwetlandclass) {
                content += "<span class='bold' title='Wetland hydrogeomorphic class, for projects where it was assigned'><b>Project Wetland Class: </b></span>{projectwetlandclass}<br/>";
            }
            if (feature.graphic.attributes.vegetationcondition) {
                content += "<span class='bold' title='Vegetation condition based on threshold of CW Mean C value specific to the wetland type'><b>Vegetation Condition: </b></span>{vegetationcondition}<br/>";
            }
            if (feature.graphic.attributes.privacystatus) {
                content += "<span class='bold' title='Privacy status, as “confidential” or “public.”'><b>Privacy Status: </b></span>{privacystatus}<br/>";
            }
            if (feature.graphic.attributes.cwmeanc) {
                content += "<span class='bold' title='Cover-weighted Mean'><b>CW Mean C: </b></span>{cwmeanc}<br/>";
            }
            if (feature.graphic.attributes.relnativecover) {
                content += "<span class='bold' title='Percent of total cover composed of native species'><b>Relative Native Cover: </b></span>{relnativecover}%<br/>";
            }
        return content;
    }

    var publicSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: "yellow",
        size: "8px",
        outline: { // autocasts as new SimpleLineSymbol()
            color: "black",
            width: 0.3
        }
    };

    var confidentialSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: "red",
        size: "8px",
        outline: { // autocasts as new SimpleLineSymbol()
            color: "black",
            width: 0.3
        }
    };

    var renderSite = {
        type: "unique-value", 
        // legendOptions: {
        //     title: "Wetland Survey Sites"
        //   },
        //defaultSymbol: publicSymbol, 
        field: "privacystatus",
        uniqueValueInfos: [
          {
            value: "Public", 
            symbol: publicSymbol,
            label: "Public (Location Exact)"
          },
          {
            value: "Confidential", 
            symbol: confidentialSymbol,
            label: "Confidential (Location Approximate)"
          }
        ]
    };

    let plantLayerView;

    var basinRangeSymbol = {
        type: "simple-fill",
        color: [ 255, 170, 0, 0.4 ],
        style: "solid",
        outline: { width: 1, color: [0, 0, 0, 1] }
      };

      var mountainSymbol = {
        type: "simple-fill",
        color: [ 85, 255, 0, 0.4 ],
        style: "solid",
        outline: { width: 1, color: [0, 0, 0, 1] }
      };

      var coloradoPlateauSymbol = {
        type: "simple-fill",
        color: [ 255, 0, 0, 0.4 ],
        style: "solid",
        outline: { width: 1, color: [0, 0, 0, 1] }
      };

      var renderEco = {
        type: "unique-value", // autocasts as new UniqueValueRenderer()
        legendOptions: {
          title: "Ecoregional Group"
        },
        defaultSymbol: { type: "simple-fill" },
        field: "ecoregionalgroup",
        uniqueValueInfos: [
          {
            value: "Basin and Range", 
            symbol: basinRangeSymbol,
            label: "Basin and Range"
          },
          {
            value: "Mountains", 
            symbol: mountainSymbol,
            label: "Mountains"
          },
          {
            value: "Colorado Plateau", 
            symbol: coloradoPlateauSymbol,
            label: "Colorado Plateau"
          }
        ]
    };



    let ecoRegions = new FeatureLayer({
        url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/ArcGIS/rest/services/plantPortalV6_View/FeatureServer/2",
        title: "EcoRegional Groups",
        visible: false,
        outFields: ["*"],
        //renderer: renderEco,
        opacity: 0.7,
        popupTemplate: {
            title: "Ecoregional Groups",
            content: [
                {
                    type: "fields",
                    fieldInfos: [{
                        fieldName: "ecoregionalgroup",
                        visible: true,
                        label: "Ecoregional Group"
                    },
                    {
                        fieldName: "na_l1name",
                        visible: true,
                        label: "Level I Ecoregion"
                    },
                    {
                        fieldName: "na_l2name",
                        visible: true,
                        label: "Level II Ecoregion"
                    },
                    {
                        fieldName: "na_l3name",
                        visible: true,
                        label: "Level III Ecoregion"
                    },
                    ]
                }
            ]
        }

    });

    var plantSites = new FeatureLayer({
        url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/ArcGIS/rest/services/plantPortalV6_View/FeatureServer/0",
        title: "Wetland Survey Sites",
        visible: true,
        outFields: ["*"],
        //outFields: ["watershed", "wetlandtype"],
        popupTemplate: {
            title: "<b>Wetland Survey Site</b>",
            actions: [speciesAction, projectAction],
            content: [

                    {
                    type: "text",
                    text: "<span class='bold' title='Project that collected site data'><b>Project: </b></span>{project}<br/><span class='bold' title='Unique site identifier'><b>Site Code: </b></span>{sitecode}<br/><span class='bold' title='Date site was visited'><b>Survey Date: </b></span>{surveydate}<br/><span class='bold' title='Hydrologic unit defined at the HUC8 level'><b>Watershed: </b></span>{watershed}<br/><span class='bold' title='Modified level III ecoregional group'><b>Ecoregional Group: </b></span>{ecoregionalgroup}<br/><span class='bold' title='Entity that owns parcel where site is located, as of early 2020'><b>Land Owner: </b></span>{owner}<br/><span class='bold' title='Primary, or dominant, wetland type as assigned by UGS'><b>Primary Wetland Type: </b></span>{wetlandtype}<br/><span class='bold' title='Secondary wetland type as assigned by UGS for mixed type sites'><b>Secondary Wetland Type: </b></span>{wetlandtype2}<br/><span class='bold' title='Wetland hydrogeomorphic class, for projects where it was assigned'><b>Project Wetland Class: </b></span>{projectwetlandclass}<br/><span class='bold' title='Vegetation condition based on threshold of CW Mean C value specific to the wetland type'><b>Vegetation Condition: </b></span>{vegetationcondition}<br/><span class='bold' title='Privacy status, as “confidential” or “public.”'><b>Privacy Status: </b></span>{privacystatus}<br/><span class='bold' title='Cover-weighted Mean'><b>CW Mean C: </b></span>{cwmeanc}<br/><span class='bold' title='Percent of total cover composed of native species'><b>Relative Native Cover: </b></span>{relnativecover}%<br/>"
                },
                {
                    type: "attachments"
                }
                ]
            //content: contentSites
        },
        elevationInfo: [{
            mode: "on-the-ground"
        }],
        renderer: renderSite
    });

    var ownershipLayer = new MapImageLayer({
        url: "https://gis.trustlands.utah.gov/server/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/MapServer",
        visible: false,
        title: "Land Ownership",
        opacity: 0.5,
        listMode: "hide-children",
        sublayers: [
            {
                id: 0,
                visible: true
            }
        ],
        popupTemplate: {
                    title: "<b>Land Ownership</b>",
                    content: "{STAE_LGD:contentOwnership}"
                },
    });

    var counties = new FeatureLayer({
        url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/ArcGIS/rest/services/Core_Locations_Supporting_Data/FeatureServer/1",
        title: "Counties",
        visible: true,
        labelsVisible: true,
        legendEnabled: true
    });


    var sitesSpeciesJoin = new FeatureLayer({
        url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/ArcGIS/rest/services/plantPortalV6_View/FeatureServer/5",
        //url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/sitesSpeciesJoinV5/FeatureServer",
        
        // title: "Plant Sites",
        outFields: ["*"],
        // outFields: ["watershed", "wetlandtype"],
        // popupTemplate: {
        //     title: "Plant Sites",
        //     actions: [speciesAction],
        //     content: "{sitecode:contentSites}{surveydate:contentSites}{coverMethod:contentSites}{Organization:contentSites}{ecoSystem:contentSites}{hgmClass:contentSites}{wetlandtype:contentSites}{vegetationcondition:contentSites}{conditionMethod:contentSites}"
        // },
        // elevationInfo: [{
        //     mode: "on-the-ground"
        // }],
        // renderer: renderSite
    });

     //custom basemap layer of false color IR


     var serviceRFT = new RasterFunction({
        functionName: "FalseColorComposite",
        variableName: "Raster"
      });

      var IRlayer = new ImageryLayer({
        url: "https://utility.arcgis.com/usrsvcs/servers/0d7e1a9daec346eb9315cba948467b46/rest/services/NAIP/ImageServer",
        renderingRule: serviceRFT
      });

      var irBase = new Basemap({
        baseLayers: [IRlayer],
        title: "False Color Comp from NAIP",
        id: "irBase",
        thumbnailUrl: "https://geology.utah.gov/apps/jay/irThumb.PNG"
      });

      let baseSource = new LocalBasemapsSource({
          basemaps: [Basemap.fromId("hybrid"), Basemap.fromId("streets"), Basemap.fromId("gray"), irBase]
      });



    // Map
    var map = new Map({
        basemap: "hybrid",
        //layers: [plantSites, ecoRegions],
        //ground: "world-elevation",
    });

    // View
    var mapView = new MapView({
        container: "mapViewDiv",
        map: map,
        center: [-112, 40.7],
        zoom: 11,
        highlightOptions: {
            color: "#2B65EC",
            fillOpacity: 0.4
        },
        // padding: {
        //   top: 50,
        //   bottom: 0
        // },
        ui: {
            components: []
        }
    });

    // Popup and panel sync
    mapView.when(function() {
        CalciteMapArcGISSupport.setPopupPanelSync(mapView);
    });
    // Search - add to navbar
    var searchWidget = new Search({
        container: "searchWidgetDiv",
        view: mapView
    });
    CalciteMapArcGISSupport.setSearchExpandEvents(searchWidget);

    // Map widgets
    var home = new Home({
        view: mapView
    });
    mapView.ui.add(home, "top-left");
    var zoom = new Zoom({
        view: mapView
    });
    mapView.ui.add(zoom, "top-left");
    var compass = new Compass({
        view: mapView
    });
    mapView.ui.add(compass, "top-left");

    var basemapGallery = new BasemapGallery({
        view: mapView,
        container: baseList,
        source: baseSource
      });




    var scaleBar = new ScaleBar({
        view: mapView,
        unit: "dual" // The scale bar displays both metric and non-metric units.
      });

      // Add the widget to the bottom left corner of the view
      mapView.ui.add(scaleBar, {
        position: "bottom-left"
      });  

    // Panel widgets - add legend
    // var legendWidget = new Legend({
    //     //container: "legendDiv",
    //     view: mapView
    // });



    const layerList = new LayerList({
        view: mapView,
        container: "legendDiv",
        listItemCreatedFunction: function(event) {
          const item = event.item;
          if (item.layer.type != "group") {
            // don't show legend twice
            item.panel = {
              content: "legend",
              open: true
            };
          }
        }
      });

                  //legend expand widget
                  var expandLegend = new Expand({
                    view: mapView,
                    content: layerList,
                    //group: "top-left",
                    expandTooltip: "Expand Legend",
                    expanded: false
                  })
    
            //legend expand widget
            var legend = new Expand({
                view: mapView,
                content: layerList,
                //group: "top-left",
                expandTooltip: "Expand Legend",
                expanded: true
              })


      plantSites
        .when(function() {

            mapView.whenLayerView(plantSites).then(function(layerView) {
              plantLayerView = layerView;
            });
          })
          .catch(errorCallback);

      console.log(plantLayerView);




    /****************************************************
     * Selects features from the csv layer that intersect
     * a polygon that user drew using sketch view model
     ****************************************************/
    function selectFeatures(geometry) {
        mapView.graphics.removeAll();
        console.log(geometry);

        // create a query and set its geometry parameter to the
        // polygon that was drawn on the view
        var query = {
            geometry: geometry,
            outFields: ["*"]
            //outFields: ["objectid", "project", "sitecode", "surveydate", "watershed", "ecoregionalgroup", "wetlandtype", "projectwetlandclass", "vegetationcondition", "privacystatus", "meanc", "relnativecover"]
        };

        // query graphics from the csv layer view. Geometry set for the query
        // can be polygon for point features and only intersecting geometries are returned
        plantLayerView.queryFeatures(query)
            .then(function(results) {
                gridFields = ["objectid", "project", "sitecode", "surveydate", "watershed", "ecoregionalgroup", "owner", "wetlandtype", "wetlandtype2", "projectwetlandclass", "vegetationcondition", "privacystatus", "cwmeanc", "relnativecover"];
                theGridFields = [
 
                    {
                        alias: 'Project',
                        name: 'project'
                    },
                    {
                        alias: 'Site Code',
                        name: 'sitecode'
                    },
                    {
                        alias: 'Survey Date',
                        name: 'surveydate'
                    },
                    {
                        alias: 'Watershed',
                        name: 'watershed'
                    },
                    {
                        alias: 'Ecoregional Group',
                        name: 'ecoregionalgroup'
                    },
                    {
                        alias: 'Land Owner',
                        name: 'owner'
                    },
                    {
                        alias: 'Primary Wetland Type',
                        name: 'wetlandtype'
                    },
                    {
                        alias: 'Secondary Wetland Type',
                        name: 'wetlandtype2'
                    },
                    {
                        alias: 'Project Wetland Class',
                        name: 'projectwetlandclass'
                    },
                    {
                        alias: 'Vegetation Condition',
                        name: 'vegetationcondition'
                    },
                    {
                        alias: 'Privacy Status',
                        name: 'privacystatus'
                    },
                    {
                        alias: 'CW Mean C',
                        name: 'cwmeanc'
                    },
                    {
                        alias: 'Relative Native Cover',
                        name: 'relnativecover'
                    },
                ];
                results.fields = theGridFields;
                console.log(results);
                resultsArray = results.features;
                var graphics = results.features;

                if (graphics.length > 0) {
                    // zoom to the extent of the polygon with factor 2
                    mapView.goTo(geometry.extent.expand(2));

                }

                console.log(results);
                console.log(graphics);
                getResults(results);

                document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + graphics.length.toString() + " sites</b>"
                document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
document.getElementById("removeX").setAttribute("style", "float: right;");


                // remove existing highlighted features
                if (highlight) {
                    highlight.remove();
                }

                // highlight query results
                highlight = plantLayerView.highlight(graphics);

            })
            .catch(errorCallback);



    }

    // create a new sketchviewmodel, setup it properties
    // set up the click event for the select by polygon button
    setUpSketchViewModel();
    sketchViewModel.on("create", function(event) {
        if (event.state === "complete") {
            // this polygon will be used to query features that intersect it
            polygonGraphicsLayer.remove(event.graphic);
            console.log(event);
            selectFeatures(event.graphic.geometry);
        }
    });

    // function errorCallback(error) {
    //   console.log("error:", error);
    // }

    /************************************************************************
     * Sets up the sketchViewModel. When user clicks on the select by polygon
     * button sketchViewModel.create() method is called with polygon param.
     ************************************************************************/
    function setUpSketchViewModel() {
        // polygonGraphicsLayer will be used by the sketchviewmodel
        // show the polygon being drawn on the view
        polygonGraphicsLayer = new GraphicsLayer({
            listMode: "hide"
        });
        mapView.map.add(polygonGraphicsLayer);
    

        // add the select by polygon button the view
        mapView.ui.add("select-by-polygon", "top-left");
        const selectButton = document.getElementById("select-by-polygon");

        // click event for the button
        selectButton.addEventListener("click", function() {
            doClear();
            mapView.popup.close();
            // ready to draw a polygon
            sketchViewModel.create("polygon");
        });

        // create a new sketch view model set its layer
        sketchViewModel = new SketchViewModel({
            view: mapView,
            layer: polygonGraphicsLayer,
            pointSymbol: {
                type: "simple-marker",
                color: [255, 255, 255, 0],
                size: "1px",
                outline: {
                    color: "gray",
                    width: 0
                }
            }
        });
    }



    // create grid
    function createGrid(fields) {
        console.log("creating grid");
        console.log(fields);
        console.log(gridFields);

        //format innerHTML for a url value
        function testRenderCell(object, value, node, options){
            console.log(value);
            var div = document.createElement("div");
            div.className = "renderedCell";
            div.innerHTML = '<a href=' + value + ' target=_blank>Click Here</a>';
            return div;
        }


        var columns = fields.filter(function(field, i) {
            if (gridFields.indexOf(field.name) >= -1) {
                return field;
            }
        }).map(function(field) {
            //console.log(field);
            if (field.name == "reportlink") {
                return {
                    field: field.name,
                    label: field.alias,
                    renderCell: testRenderCell
                }
            } else if
             (field.name == "objectid") {
                console.log("HIDE COLUMN " + field.name);
                return {
                    field: field.name,
                    label: field.alias,
                    //sortable: true,
                    hidden: true
                };
            } else {
                console.log("SHOW COLUMN");
                return {
                    field: field.name,
                    label: field.alias,
                    sortable: true
                };
            }


        });

        console.log(columns);

        // create a new onDemandGrid with its selection and columnhider
        // extensions. Set the columns of the grid to display attributes
        // the hurricanes cvslayer
        grid = new(declare([OnDemandGrid, Selection]))({
            columns: columns
        }, "grid");

        // add a row-click listener on the grid. This will be used
        // to highlight the corresponding feature on the view
        grid.on("dgrid-select", selectFeatureFromGrid);
        console.log(grid.columns[0].field);

        //add tooltips to summary of species table
        if (grid.columns[0].field == "family") {

            console.info("SummarySpecies");
            grid.on("th.field-commonname:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Common Name from USDA Plants";
            });
            grid.on("th.field-scientificname:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Scientific Name from USDA Plants";
            });
            grid.on("th.field-sitecount:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Number of selected sites where species found";
            });
            grid.on("th.field-meancover:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Mean cover percentage at sites where species was found";
            });
            grid.on("th.field-nativity:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Nativity in Utah, as “native”, “introduced”, or “both”";
            });
            grid.on("th.field-noxious:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Noxious status in Utah";
            });
            grid.on("th.field-growthform:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Growth form";
            });
            grid.on("th.field-duration:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Duration, as “annual”, “biennial”, “perennial”, or a combination thereof.";
            });
            grid.on("th.field-indicatorwmvc:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Wetland indicator value for Western Mountains, Valleys, or Coasts";
            });
            grid.on("th.field-indicatoraridwestc:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Wetland indicator value for Arid West";
            });
            grid.on("th.field-cvalue:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = " Degree of disturbance tolerance ranging from 1 (highly tolerant) to 10 (associated with pristine habitat), with 0 indicating non-native species";
            });;
            grid.on("th.field-family:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Plant family from USDA Plants";
            });
            grid.on("th.field-cover:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Estimated percent cover";
            });
        }

        //add tooltips to sites table
        if (grid.columns[0].field == "project") {

            console.info("Sites");
            grid.on("th.field-project:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Project that collected site data";
            });
            grid.on("th.field-watershed:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Hydrologic unit defined at the HUC8 level";
            });
            grid.on("th.field-sitecode:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Unique site identifier";
            });
            grid.on("th.field-ecoregionalgroup:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Modified level III ecoregional group";
            });
            grid.on("th.field-surveydate:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Date site was visited";
            });
            grid.on("th.field-projectwetlandclass:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Wetland hydrogeomorphic class, for projects where it was assigned";
            });
            grid.on("th.field-wetlandtype:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Wetland type as assigned by UGS";
            });
            grid.on("th.field-vegetationcondition:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Vegetation condition based on threshold of CW Mean C value specific to the wetland type";
            });
            grid.on("th.field-privacystatus:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Privacy status, as “confidential” or “public.”";
            });
            grid.on("th.field-cwmeanc:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Average C value of all species at site, weighted by cover";
            });
            grid.on("th.field-relnativecover:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Percent of total cover composed of native species";
            });
            grid.on("th.field-owner:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Entity that owns parcel where site is located, as of early 2020.";
            });
            grid.on("th.field-wetlandtype:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Primary, or dominant, wetland type as assigned by UGS";
            });
            grid.on("th.field-wetlandtype2:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Secondary wetland type as assigned by UGS for mixed type sites";
            });
            grid.on("th.field-projectwetlandclass:mouseover", function(evt) {
                console.info("hover");
                evt.target.title = "Wetland hydrogeomorphic class, for projects where it was assigned";
            });
           

        }
    }


    function selectFeatureFromGrid(event) {
        console.log(event);
        mapView.popup.close();
        mapView.graphics.removeAll();
        var row = event.rows[0]
        console.log(row);
        var id = row.data.objectid;
        console.log(id);

        var query = plantSites.createQuery();

        query.where = "objectid = '" + id + "'";
        query.returnGeometry = true;
        query.outFields = ["*"],

            // query the palntLayerView using the query set above
            plantSites.queryFeatures(query).then(function(results) {
                console.log(results);
                var graphics = results.features;
                console.log(graphics);
                var item = graphics[0];
                    var cntr = [];
                    cntr.push(item.geometry.longitude);
                    cntr.push(item.geometry.latitude);
                    console.log(item.geometry);
                    mapView.goTo({
                        center: cntr, // position:
                        zoom: 13
                    });
                    mapView.graphics.removeAll();
                    var selectedGraphic = new Graphic({
                        geometry: item.geometry,
                        symbol: new SimpleMarkerSymbol({
                            //color: [0,255,255],
                            style: "circle",
                            //size: "8px",
                            outline: {
                                color: [255, 255, 0],
                                width: 3
                            }
                        })
                    });
                    mapView.graphics.add(selectedGraphic);
                    mapView.popup.open({
                        features: [item],
                        location: item.geometry
                    });
            })
    }




    var fillSymbol = {
        type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
        color: [242, 196, 238, 0],
        style: "solid",
        outline: { // autocasts as new SimpleLineSymbol()
            color: [0, 128, 255, 0.69],
            width: 1.3
        }
    };


    var renderHuc = {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: fillSymbol,
    };




    var hucLayer = new FeatureLayer({
        url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/plantPortalV6_View/FeatureServer/1",
        title: "Watershed (HUC8) Boundaries",
        visible: true,
        popupTemplate: {
            title: "<b>Watersheds</b>",
            content: [{
                    type: "fields",
                    fieldInfos: [{
                        fieldName: "Name",
                             visible: false,
                             label: "Name" 
                    },
                    {
                        fieldName: "HUC8",
                             visible: false,
                             label: "ID" 
                    }]
            },
                    {
                    type: "text",
                    text: "<b>Name: </b>{Name}<br><b>HUC ID: </b>{HUC8}"
                }
                ]
        },
        renderer: renderHuc
    });

    //mapView.map.add(counties);
    mapView.map.add(ownershipLayer);
    mapView.map.add(hucLayer);
    mapView.map.add(ecoRegions);
    mapView.map.add(plantSites);

    mapView.popup.dockOptions = {
        // Disable the dock button so users cannot undock the popup
        buttonEnabled: false,

    };


    function getResults(response) {
        //doSpeciesClear();
        

        console.log("getResults");
        console.log(response);
        console.log(response.fields);
        let testField = response.fields[0].name;
        console.log(testField);
        let graphics = response.features;
        console.log(graphics);
        console.log(sitesCount);


        gridDis.style.display = 'block';
        domClass.add("mapViewDiv");
        console.log("counting");
            if (testField == "projectcode") {
                document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + graphics.length.toString() + " project</b>"
                            document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
            document.getElementById("removeX").setAttribute("style", "float: right;");
            } 


            // if (sitesCount == 0) {
            //     console.log("We have " + sitesCount + " sites");
            //     document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + graphics.length.toString() + " species</b>"
            // } else {
            //     console.log("sites");
            //     document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + graphics.length.toString() + " sites</b>"
            // }
            // document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
            // document.getElementById("removeX").setAttribute("style", "float: right;");



console.log("go on and create grid");

        createGrid(response.fields);
        console.log(response.fields);
        console.log(graphics);
        console.log(graphics[0].attributes);
        if (graphics[0].attributes) {
            console.log("has attributes");
            // get the attributes to display in the grid
            var data = graphics.map(function(feature, i) {
                return Object.keys(feature.attributes)
                    .filter(function(key) {
                        // get fields that exist in the grid
                        return (gridFields.indexOf(key) !== -1);
                    })
                    // need to create key value pairs from the feature
                    // attributes so that info can be displayed in the grid
                    .reduce((obj, key) => {
                        obj[key] = feature.attributes[key];
                        return obj;
                    }, {});
            });
            console.log(data);

        } else {
            console.log("no attributes");
            var data = graphics;

        }


        //format the surveydate 
        for (var i = 0; i < data.length; i++) {
            if (data[i].surveydate) {
                console.log("Found Survey Date");
                for (var i = 0; i < data.length; i++) {
                    var dateString = moment(data[i].surveydate).format('YYYY-MM-DD');
                    data[i].surveydate = dateString;

                }
            }
            // if (data[i].reportlink) {
            //     console.log("found report link");
            //     for (var i = 0; i < data.length; i++) {
            //         var url = data[i].reportlink;
            //         data[i].reportlink = '<a href=>' + url + '</a>';
            //     }
            // }
        }




        // set the datastore for the grid using the
        // attributes we got for the query results
        dataStore.objectStore.data = data;
        console.log(dataStore.objectStore.data);
        grid.set("collection", dataStore);

        //document.getElementById("downloadCSV").innerHTML =
        document.getElementById("downloadX").setAttribute("class", "glyphicon glyphicon-download-alt");
        //document.getElementById("downloadX").setAttribute("style", "float: right;");
        //"<a href='#' onclick='downloadCSV({ filename: 'stock-data.csv' });'>Download Table</a>"    




    }

    document.getElementById("downloadX").addEventListener("click", function(evt) {
        console.log(evt);

        //download array to csv functions

        function convertArrayToCSV(args) {
            console.log(args);

            var downloadArray = args.data;
            //delete objectid from the download array
            downloadArray.forEach(function(keytv){
                delete keytv.objectid;
            })

console.log(downloadArray);
            var result, ctr, keys, columnDelimiter, lineDelimiter, data;

            data = args.data || null;
            if (data == null || !data.length) {
                return null;
            }

            columnDelimiter = args.columnDelimiter || ',';
            lineDelimiter = args.lineDelimiter || '\n';

            keys = Object.keys(data[0]);

            result = '';
            result += keys.join(columnDelimiter);
            result += lineDelimiter;

            data.forEach(function(item) {
                ctr = 0;
                keys.forEach(function(key) {
                    if (ctr > 0) result += columnDelimiter;

                    result += item[key];
                    ctr++;
                });
                result += lineDelimiter;
            });

            return result;
        }


        var data, filename, link;
        //console.log(args);

        var csv = convertArrayToCSV({
            data: dataStore.objectStore.data
        });
        if (csv == null) return;

        filename = 'ExportTable.csv';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();


    })



    //get elements from the dom      
    var waterShedSelect = document.getElementById("waterShed");
    //var hgmSelect = document.getElementById("hgmClass");
    var typeSelect = document.getElementById("wetlandType");
    var conditionSelect = document.getElementById("wetlandCondition");
    var speciesSelect = document.getElementById("speciesText");



    //Query Widget Panels

    // query the species layer for commonname values
    mapView.when(function() {
            return plantSites.when(function() {
                var typeQuery = new Query();
                typeQuery.where = "1=1";
                typeQuery.outFields = ["objectid"];
                //typeQuery.returnDistinctValues = true;
                //typeQuery.orderByFields = ["wetlandtype"];
                return plantSites.queryFeatures(typeQuery);
            });

        }).then(speciesRelationshipQuery)


        //}).then(addToSelectSpecies)
        .otherwise(queryError);

    function queryError(error) {
        console.error(error);
    }

    //relationshipQuery for species query dropdown
    function speciesRelationshipQuery(values) {
        var idArray = [];
        var oldArray = values["features"];
        oldArray.forEach(function(ftrs) {

            var att = ftrs.attributes.objectid;

            idArray.push(att);
        });
        var querySpecies = new QueryTask({
            url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/plantPortalV6_View/FeatureServer/0"
        });

        var speciesRelateQuery = new RelationshipQuery({
            objectIds: idArray,
            outFields: ["scientificname"],
            //returnGeometry: true,
            relationshipId: 0
        });

        querySpecies.executeRelationshipQuery(speciesRelateQuery).then(function(rslts) {
            var formatArray = [];
            var newArray = Object.values(rslts);

            newArray.forEach(function(ftr) {
                var ott = ftr.features;

                formatArray.push(ott);
            });
            var namesArray = [];
            formatArray.forEach(function(names) {
                names.forEach(function(et) {
                    var poop = et.attributes.scientificname;
                    namesArray.push(poop);
                })
            });


            var arrUnique = namesArray.filter(function(item, index) {
                return namesArray.indexOf(item) >= index;
            });

            arrUnique.sort();
            return (arrUnique);
        }).then(addToSelectSpecies);


    }

    // Add the unique values to the species select element.
    function addToSelectSpecies(values) {

        var filtered = values.filter(function(el) {
            return el != null;
        });


        var input = document.getElementById("speciesText");



        var awesome = new Awesomplete(input, {
            list: filtered,
            minChars: 2,
            autoFirst: true,
            maxItems: 10
        });
        //awesome.list = values;


        // var option = domConstruct.create("option");
        // option.text = "All";
        // typeSelect.add(option);

        // values.forEach(function(value) {
        //     var option = domConstruct.create("option");
        //     option.text = value;
        //     speciesSelect.add(option);
        // });
        // typeSelect.remove(1);
    }

    // query the plantSites layer for wetlandtype values

    query(".calcite-panels .panel .panel-collapse").on("show.bs.collapse", function() {
        console.log("Query Panel Open");

        

        var queryEco = new QueryTask({
            url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/plantPortalV6_View/FeatureServer/0"
        });


        var ecoQuery = new Query();
        ecoQuery.where = "1=1";
        ecoQuery.outFields = ["ecoregionalgroup"];
        ecoQuery.returnDistinctValues = true;

        queryEco.execute(ecoQuery).then(function(ecoRslts) {
            console.log(ecoRslts);
            addToEcoLevel(ecoRslts);
        })


        doClear();



    });

   

    // Add the unique values to the wetlandtype select element.
    function addToSelect(values) {
        console.log("add to wetlandtype dropdown");
        console.log(values);
        //var selectedType = typeSelect.options.selectedIndex;

        // var i;
        // for (i = typeSelect.options.length - 1; i >= 0; i--) {
        //     typeSelect.remove(i);
        // }

        while (typeSelect.options.length > 0)
        typeSelect.remove(0);

        console.log(typeSelect.options);
        console.log(typeSelect.options.length);


        var option = domConstruct.create("option");
        option.text = "All";
        typeSelect.add(option);


        values.features.forEach(function(value) {
            var option = domConstruct.create("option");
            option.text = value.attributes.wetlandtype;
            typeSelect.add(option);
        });

        //typeSelect.options.selectedIndex = selectedType;

    }


    // Add the unique values to the watershed select element.
    function addToSelect2(values) {
        console.log("add to watershed dropdown");
        console.log(values);
        var i;
        for (i = waterShedSelect.options.length - 1; i >= 0; i--) {
            waterShedSelect.remove(i);
        }
        var option = domConstruct.create("option");
        option.text = "All";
        waterShedSelect.add(option);

        values.features.forEach(function(value) {
            var option = domConstruct.create("option");
            option.text = value.attributes.watershed;
            waterShedSelect.add(option);
        });
        //waterShedSelect.remove(1);
    }


    //Add the unique values to the ecoregionalgroup select element.
    function addToEcoLevel(values) {
        console.log("add to eco region dropdown");
        console.log(values);
        sitesCount = 0;

        var i;
        for (i = ecoLevel.options.length - 1; i >= 0; i--) {
            ecoLevel.remove(i);
        }
        var option = domConstruct.create("option");
        option.text = "All";
        ecoLevel.add(option);

        values.features.forEach(function(value) {
            console.log("populating drop down");
            var option = domConstruct.create("option");
            option.text = value.attributes.ecoregionalgroup;
            ecoLevel.add(option);
        });
        //hgmSelect.remove(1);
    }

    // Add the unique values to the vegetationcondition select element.
    function addToSelect4(values) {
        console.log("add to vegetationcondition dropdown");
        console.log(values);
        var i;
        for (i = conditionSelect.options.length - 1; i >= 0; i--) {
            conditionSelect.remove(i);
        }
        var option = domConstruct.create("option");
        option.text = "All";
        conditionSelect.add(option);

        values.features.forEach(function(value) {
            var option = domConstruct.create("option");
            option.text = value.attributes.vegetationcondition;
            conditionSelect.add(option);
        });


    }



    mapView.when(function() {
        on(dom.byId("queryFunction"), "click", doQuery);
        on(dom.byId("querySpeciesFunction"), "click", doSpeciesQuery);
        on(dom.byId("clrButton"), "click", doClear);
        on(dom.byId("clrSpeciesButton"), "click", doSpeciesClear);
        on(dom.byId("speciesSummary"), "click", doSpeciesSummary);
    });



    function doClear() {
        mapView.graphics.removeAll()
        console.log("doClear");
        sitesCount = 0;
        var weQuery = new Query();
        var hucQuery = new Query();
        var hgmQuery = new Query();
        var conditionQuery = new Query();
        var whatClicked = "";
        //mapView.popup.close();
        plantSites.definitionExpression = "";
        if (grid) {
            dataStore.objectStore.data = {};
            grid.set("collection", dataStore);
        }
        gridDis.style.display = 'none';
        document.getElementById("featureCount2").innerHTML = "";
        domClass.remove("mapViewDiv", 'withGrid');
        mapView.graphics.removeAll();

        // var i;
        // for (i = waterShedSelect.options.length - 1; i >= 0; i--) {
        //     waterShedSelect.remove(i);
        // }

        weQuery.outFields = ["wetlandtype"];
        weQuery.returnDistinctValues = true;
        weQuery.orderByFields = ["wetlandtype"];
        weQuery.where = "1=1";
        plantSites.queryFeatures(weQuery).then(function(eet) {
            console.log("Wetland Type Values 1=1", eet);
            addToSelect(eet);
        })

        hucQuery.outFields = ["watershed"];
        hucQuery.returnDistinctValues = true;
        hucQuery.orderByFields = ["watershed"];
        hucQuery.where = "1=1";
        plantSites.queryFeatures(hucQuery).then(function(e) {
            addToSelect2(e);
        })

        conditionQuery.outFields = ["vegetationcondition"];
        conditionQuery.returnDistinctValues = true;
        conditionQuery.orderByFields = ["vegetationcondition"];
        conditionQuery.where = "1=1";
        plantSites.queryFeatures(conditionQuery).then(function(ett) {
            addToSelect4(ett);
        })

        typeSelect.selectedIndex = 0;
        waterShedSelect.selectedIndex = 0;
        ecoLevel.selectedIndex = 0;
        conditionSelect.selectedIndex = 0;

        if (highlight) {
            highlight.remove();
        }

    }

    function doGridClear() {
        console.log("doGridClear");
        //mapView.popup.close();
        //plantSites.definitionExpression = "";
        sitesCount = 0
        
        if (grid) {
            dataStore.objectStore.data = {};
            grid.set("collection", dataStore);
        }
        gridDis.style.display = 'none';
        document.getElementById("featureCount2").innerHTML = "";
        domClass.remove("mapViewDiv", 'withGrid');
        //document.getElementById("featureCount2").innerHTML = "";
        //mapView.graphics.removeAll();

        // if (highlight) {
        //           highlight.remove();
        //         }

    }

    function doSpeciesSummaryClear() {
        console.log("doSpeciesSummaryClear");
        mapView.graphics.removeAll()
        //sitesCount = 0;

        if (grid) {
            dataStore.objectStore.data = {};
            grid.set("collection", dataStore);
        }
        gridDis.style.display = 'none';
        document.getElementById("featureCount2").innerHTML = "";
        domClass.remove("mapViewDiv", 'withGrid');

    }

    function doSpeciesClear() {
        console.log("doSpeciesClear");
        mapView.graphics.removeAll()
        sitesCount = 0;

        if (grid) {
            dataStore.objectStore.data = {};
            grid.set("collection", dataStore);
        }
        gridDis.style.display = 'none';
        domClass.remove("mapViewDiv", 'withGrid');
        //plantSites.definitionExpression = "";
        document.getElementById("speciesText").value = "";
        plantSites.definitionExpression = "";

    }


    function doSpeciesQuery() {
        console.log("doSpeciesQuery");
        doGridClear();
        plantSites.definitionExpression = "";
        var speciescommonname = speciesSelect.value;
        console.log(speciescommonname);

        var speciesQueryTask = new QueryTask({
            url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/plantPortalV6_View/FeatureServer/3",
        });

        //Query the related table for names that match commonname field with the user selected option in the DOM
        var speciesQuery = new Query();
        speciesQuery.outFields = ["*"];
        speciesQuery.where = "scientificname = '" + speciescommonname + "'";

        speciesQueryTask.execute(speciesQuery).then(function(results) {
            console.log(results);
            var oldArray = results.features;
            specidArray = [];
            oldArray.forEach(function(ftrs) {

                //console.log(ftrs);
                var att = ftrs.attributes.objectid;

                specidArray.push(att);
            });

            //setup the relationship query with the plantSites featurelayer using the objectids from the related table query
            var querySites = new RelationshipQuery({
                objectIds: specidArray,
                outFields: ["*"],
                returnGeometry: true,
                relationshipId: 0,
            });

            speciesQueryTask.executeRelationshipQuery(querySites).then(function(rslts) {
                console.log(rslts);

                var getArray = [];
                //fromat rslts to a defexp string
                var newArray = Object.values(rslts);
                newArray.forEach(function(ftr) {
                    var itt = ftr.features;
                    getArray.push(itt);
                });
                dashArray = [];
                getArray.forEach(function(et) {

                    et.forEach(function(ef) {
                        var eck = ef.attributes.objectid;
                        dashArray.push("OR objectid = '" + eck + "' ");
                    })
                });
                console.log(dashArray);

                var specDefExp = dashArray.join('');
                var defExp = specDefExp.substring(3);

                console.log(defExp);

                plantSites.definitionExpression = defExp;

                console.log(plantSites.definitionExpression);

                plantSites.queryExtent().then(function(response) {
                    console.log(response);
                    mapView.goTo(response.extent);

                    speciesQuerysiteCount = response.count;
                    document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + speciesQuerysiteCount + " sites</b>"
                    document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
            document.getElementById("removeX").setAttribute("style", "float: right;");
                    
                  });


                var query = plantSites.createQuery();
                console.log(query);
                gridFields = ["objectid", "project", "sitecode", "surveydate", "watershed", "ecoregionalgroup", "owner", "wetlandtype", "wetlandtype2", "projectwetlandclass", "vegetationcondition", "privacystatus", "cwmeanc", "relnativecover"];
                //gridFields = ["objectid", "surveyeventid", "family", "scientificname", "commonname", "cover", "nativity", "noxious", "growthform", "wetlandindicator", "cvalue"];
                query.where = defExp;
                query.outFields = ["objectid", "project", "sitecode", "surveydate", "watershed", "ecoregionalgroup", "owner", "wetlandtype", "wetlandtype2", "projectwetlandclass", "vegetationcondition", "privacystatus", "cwmeanc", "relnativecover"];
                //query.outFields = ["objectid", "surveyeventid", "family", "scientificname", "commonname", "cover", "nativity", "noxious", "growthform", "wetlandindicator", "cvalue"];

                //plantSites.queryFeatureCount().then(function(count) {
                    //console.log(count);
                    //sitesCount = count;

                    //document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + count + " species</b>"
            //         document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + rslts.features.length + " sites</b>"
            //         document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
            // document.getElementById("removeX").setAttribute("style", "float: right;");
                //});

                plantSites.queryFeatures(query).then(function(e) {
                    console.log(e);


                    resultsArray = e["features"];
                    //console.log(resultsArray);          
                    // put our attributes in an object the datagrid can ingest.
                    var srch = {
                        "items": []
                    };
                    resultsArray.forEach(function(ftrs) {

                        var att = ftrs.attributes;

                        srch.items.push(att);
                    });
                    
                    // testing
                    var fieldArray = [
                        //{alias: 'objectid', name: 'objectid'}, 
                        {
                            alias: 'Project',
                            name: 'project'
                        },
                        {
                            alias: 'Site Code',
                            name: 'sitecode'
                        },
                        {
                            alias: 'Survey Date',
                            name: 'surveydate'
                        },
                        {
                            alias: 'Watershed',
                            name: 'watershed'
                        },
                        {
                            alias: 'Ecoregional Group',
                            name: 'ecoregionalgroup'
                        },
                        {
                            alias: 'Land Owner',
                            name: 'owner'
                        },
                        {
                            alias: 'Primary Wetland Type',
                            name: 'wetlandtype'
                        },
                        {
                            alias: 'Secondary Wetland Type',
                            name: 'wetlandtype2'
                        },
                        {
                            alias: 'Project Wetland Class',
                            name: 'projectwetlandclass'
                        },
                        {
                            alias: 'Vegetation Condition',
                            name: 'vegetationcondition'
                        },
                        {
                            alias: 'Privacy Status',
                            name: 'privacystatus'
                        },
                        {
                            alias: 'CW Mean C',
                            name: 'cwmeanc'
                        },
                        {
                            alias: 'Relative Native Cover',
                            name: 'relnativecover'
                        },
                    ];
        
                    e.fields = fieldArray;
                    //testing

                    console.log(e);
                    getResults(e);

                });


            });


            
        });

    }

    function doQuery() {
        mapView.graphics.removeAll()
        mapView.popup.close();
        console.log("doQuery");
        doGridClear();

        gridFields = ["objectid", "project", "sitecode", "surveydate", "watershed", "ecoregionalgroup", "owner", "wetlandtype", "wetlandtype2", "projectwetlandclass", "vegetationcondition", "privacystatus", "cwmeanc", "relnativecover"];




        var valueOne = typeSelect.options[typeSelect.selectedIndex].value;
        var valueTwo = waterShedSelect.options[waterShedSelect.selectedIndex].value;
        var ecoSelected = ecoLevel.options[ecoLevel.selectedIndex].value;
        var valueFour = conditionSelect.options[conditionSelect.selectedIndex].value;
        var definitionExp = "";
        var ecoDef = "";


        //134
        if (valueOne != "All" && valueTwo == "All" && valueFour != "All") {
            definitionExp = "wetlandtype = '" + valueOne + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //124 
        else if (valueOne != "All" && valueTwo != "All" && valueFour != "All") {
            definitionExp = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //234 
        else if (valueOne == "All" && valueTwo != "All" && valueFour != "All") {
            definitionExp = "watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //123 
        else if (valueOne != "All" && valueTwo != "All" && valueFour == "All") {
            definitionExp = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "'";
        }
        //14
        else if (valueOne != "All" && valueTwo == "All" && valueFour != "All") {
            definitionExp = "wetlandtype = '" + valueOne + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //4
        else if (valueOne == "All" && valueTwo == "All" && valueFour != "All") {
            definitionExp = "vegetationcondition = '" + valueFour + "'";
        }
        //1
        else if (valueOne != "All" && valueTwo == "All" && valueFour == "All") {
            definitionExp = "wetlandtype = '" + valueOne + "'";
        }
        //2
        else if (valueOne == "All" && valueTwo != "All" && valueFour == "All") {
            definitionExp = "watershed = '" + valueTwo + "'";
        }
        //24
        else if (valueOne == "All" && valueTwo != "All" && valueFour != "All") {
            definitionExp = "watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //1234 
        else if (valueOne != "All" && valueTwo != "All" && valueFour != "All") {
            definitionExp = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //12
        else if (valueOne != "All" && valueTwo != "All" && valueFour == "All") {
            definitionExp = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "'";
        }
        //23
        else if (valueOne == "All" && valueTwo != "All" && valueFour == "All") {
            definitionExp = "watershed = '" + valueTwo + "'";
        }
        //13 
        else if (valueOne != "All" && valueTwo == "All" && valueFour == "All") {
            definitionExp = "wetlandtype = '" + valueOne + "'";
        }
        //34
        else if (valueOne == "All" && valueTwo == "All" && valueFour != "All") {
            definitionExp = "vegetationcondition = '" + valueFour + "'";
        } 
        else {
            definitionExp = "";
        }

        console.log(definitionExp);

        if (ecoSelected != "All" && definitionExp != "") {
            plantSites.definitionExpression =  definitionExp + " AND ecoregionalgroup = '" + ecoSelected + "'";
        } else if (ecoSelected == "All" && definitionExp != "") {
            plantSites.definitionExpression =  definitionExp;
        } else if (ecoSelected != "All" && definitionExp == "") {
            plantSites.definitionExpression =  "ecoregionalgroup = '" + ecoSelected + "'";
        }

        console.log(plantSites.definitionExpression);

        plantSites.queryExtent().then(function(response) {
            console.log(response);
            mapView.goTo(response.extent);
          });
          

        //add feature count and add x to upper right corner of table to close it
        plantSites.queryFeatureCount().then(function(count) {
            console.log(count);
            document.getElementById("featureCount").innerHTML =
                "<b>Showing attributes for " +
                count + " sites </b>"
            document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
            document.getElementById("removeX").setAttribute("style", "float: right;");

        });

        var query = plantSites.createQuery();
        query.outFields = ["objectid", "project", "sitecode", "surveydate", "watershed", "ecoregionalgroup", "owner", "wetlandtype", "wetlandtype2", "projectwetlandclass", "vegetationcondition", "privacystatus", "cwmeanc", "relnativecover"];
        console.log("poop");
        plantSites.queryFeatures(query).then(function(e) {
            console.log(e);


            resultsArray = e["features"];
            console.log(resultsArray);
            // put our attributes in an object the datagrid can ingest.
            var srch = {
                "items": []
            };
            resultsArray.forEach(function(ftrs) {

                var att = ftrs.attributes;

                srch.items.push(att);
            });

            var fieldArray = [
                //{alias: 'objectid', name: 'objectid'}, 
                {
                    alias: 'Project',
                    name: 'project'
                },
                {
                    alias: 'Site Code',
                    name: 'sitecode'
                },
                {
                    alias: 'Survey Date',
                    name: 'surveydate'
                },
                {
                    alias: 'Watershed',
                    name: 'watershed'
                },
                {
                    alias: 'Ecoregional Group',
                    name: 'ecoregionalgroup'
                },
                {
                    alias: 'Land Owner',
                    name: 'owner'
                },
                {
                    alias: 'Primary Wetland Type',
                    name: 'wetlandtype'
                },
                {
                    alias: 'Secondary Wetland Type',
                    name: 'wetlandtype2'
                },
                {
                    alias: 'Project Wetland Class',
                    name: 'projectwetlandclass'
                },
                {
                    alias: 'Vegetation Condition',
                    name: 'vegetationcondition'
                },
                {
                    alias: 'Privacy Status',
                    name: 'privacystatus'
                },
                {
                    alias: 'CW Mean C',
                    name: 'cwmeanc'
                },
                {
                    alias: 'Relative Native Cover',
                    name: 'relnativecover'
                },
            ];

            e.fields = fieldArray;
            console.log(e);
            getResults(e);
        });


        if (!plantSites.visible) {
            plantSites.visible = true;
        }
    } //end setDefinitionExpression function

    function defQuery() {
        console.log('def query');
        //doClear();
        var valueOne = typeSelect.options[typeSelect.selectedIndex].value;
        var valueTwo = waterShedSelect.options[waterShedSelect.selectedIndex].value;
        //var valueThree = hgmSelect.options[hgmSelect.selectedIndex].value;
        var valueFour = conditionSelect.options[conditionSelect.selectedIndex].value;


        //134
        if (valueOne != "All" && valueTwo == "All" && valueFour != "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //124 
        else if (valueOne != "All" && valueTwo != "All" && valueFour != "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //234 
        else if (valueOne == "All" && valueTwo != "All" && valueFour != "All") {
            plantSites.definitionExpression = "watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //123 
        else if (valueOne != "All" && valueTwo != "All" && valueFour == "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "'";
        }
        //14
        else if (valueOne != "All" && valueTwo == "All" && valueFour != "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //4
        else if (valueOne == "All" && valueTwo == "All" && valueFour != "All") {
            plantSites.definitionExpression = "vegetationcondition = '" + valueFour + "'";
        }
        //1
        else if (valueOne != "All" && valueTwo == "All" && valueFour == "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "'";
        }
        //2
        else if (valueOne == "All" && valueTwo != "All" && valueFour == "All") {
            plantSites.definitionExpression = "watershed = '" + valueTwo + "'";
        }
        //24
        else if (valueOne == "All" && valueTwo != "All" && valueFour != "All") {
            plantSites.definitionExpression = "watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //1234 
        else if (valueOne != "All" && valueTwo != "All" && valueFour != "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //12
        else if (valueOne != "All" && valueTwo != "All" && valueFour == "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "'";
        }
        //23
        else if (valueOne == "All" && valueTwo != "All" && valueFour == "All") {
            plantSites.definitionExpression = "watershed = '" + valueTwo + "'";
        }
        //13 
        else if (valueOne != "All" && valueTwo == "All" && valueFour == "All") {
            plantSites.definitionExpression = "wetlandtype = '" + valueOne + "";
        }
        //34
        else if (valueOne == "All" && valueTwo == "All" && valueFour != "All") {
            plantSites.definitionExpression = "vegetationcondition = '" + valueFour + "'";
        } 
        else {
            plantSites.definitionExpression = "";
        }

        console.log(plantSites.definitionExpression);

        var defExp = plantSites.definitionExpression;



        plantSites.queryFeatureCount().then(function(count) {
            const query = new Query();
            query.where = defExp + " AND confidential = '0'";
            plantSites.queryFeatureCount(query).then(function(countConf) {
        //**************************PRINTS NUMBER OF SITES FOUND
                // document.getElementById("featureCount2").innerHTML =
                //     "<b>Found " +
                //     count + " sites (" + countConf + " public) </b>"
                document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
                document.getElementById("removeX").setAttribute("style", "float: right;");
            })
        });

        if (!plantSites.visible) {
            plantSites.visible = true;
        }

    }


    function ecoQuery() {
        console.log('eco query');
        doGridClear();

        var valueThree = ecoLevel.options[ecoLevel.selectedIndex].value;
        console.log(valueThree);

        if (valueThree == "All") {
            var defExp = "";
        } else { 



        var defExp = "ecoregionalgroup = '" + valueThree + "'";
        }
        console.log(defExp);

        plantSites.definitionExpression = defExp;


        plantSites.queryFeatureCount().then(function(count) {
            console.log(count);
            const query = new Query();
            query.where = defExp + " AND privacystatus = 'public'";
            plantSites.queryFeatureCount(query).then(function(countConf) {
//**************************PRINTS NUMBER OF SITES FOUND
                // document.getElementById("featureCount2").innerHTML =
                //     "<b>Found " +
                //     count + " sites (" + countConf + " public) </b>"
                document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
                document.getElementById("removeX").setAttribute("style", "float: right;");
            })
        });

        // if (!plantSites.visible) {
        //     plantSites.visible = true;
        // }
    

    }




    function doSpeciesSummary() {
        doGridClear();
        mapView.graphics.removeAll()
        mapView.popup.close();
        console.log("doSpeciesSummary");
        doSpeciesSummaryClear();

        gridFields = ["family", "scientificname", "commonname", "sitecount", "meancover", "nativity", "noxious", "growthform", "duration", "indicatorwmvc", "indicatoraridwest", "cvalue"];

        var queryParams = "";

        var ecoSelected = ecoLevel.options[ecoLevel.selectedIndex].value;

        var valueOne = typeSelect.options[typeSelect.selectedIndex].value;
        var valueTwo = waterShedSelect.options[waterShedSelect.selectedIndex].value;
        //var valueThree = hgmSelect.options[hgmSelect.selectedIndex].value;
        var valueFour = conditionSelect.options[conditionSelect.selectedIndex].value;


        //134
        if (valueOne != "All" && valueTwo == "All" && valueFour != "All") {
            queryParams = "wetlandtype = '" + valueOne + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //124 
        else if (valueOne != "All" && valueTwo != "All" && valueFour != "All") {
            queryParams = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //234 
        else if (valueOne == "All" && valueTwo != "All" && valueFour != "All") {
            queryParams = "watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //123 
        else if (valueOne != "All" && valueTwo != "All" && valueFour == "All") {
            queryParams = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "'";
        }
        //14
        else if (valueOne != "All" && valueTwo == "All" && valueFour != "All") {
            queryParams = "wetlandtype = '" + valueOne + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //4
        else if (valueOne == "All" && valueTwo == "All" && valueFour != "All") {
            queryParams = "vegetationcondition = '" + valueFour + "'";
        }
        //1
        else if (valueOne != "All" && valueTwo == "All" && valueFour == "All") {
            queryParams = "wetlandtype = '" + valueOne + "'";
        }
        //2
        else if (valueOne == "All" && valueTwo != "All" && valueFour == "All") {
            queryParams = "watershed = '" + valueTwo + "'";
        }
        //24
        else if (valueOne == "All" && valueTwo != "All" && valueFour != "All") {
            queryParams = "watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //1234 
        else if (valueOne != "All" && valueTwo != "All" && valueFour != "All") {
            queryParams = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "' AND vegetationcondition = '" + valueFour + "'";
        }
        //12
        else if (valueOne != "All" && valueTwo != "All" && valueFour == "All") {
            queryParams = "wetlandtype = '" + valueOne + "' AND watershed = '" + valueTwo + "'";
        }
        //23
        else if (valueOne == "All" && valueTwo != "All" && valueFour == "All") {
            queryParams = "watershed = '" + valueTwo + "";
        }
        //13 
        else if (valueOne != "All" && valueTwo == "All" && valueFour == "All") {
            queryParams = "wetlandtype = '" + valueOne + "'";
        }
        //34
        else if (valueOne == "All" && valueTwo == "All" && valueFour != "All") {
            queryParams = "vegetationcondition = '" + valueFour + "'";
        } 
        else {
            queryParams = "";
        }
        console.log(queryParams);
        if (ecoSelected != "All" && queryParams != "") {
            plantSites.definitionExpression =  queryParams + " AND ecoregionalgroup = '" + ecoSelected + "'";
        } else if (ecoSelected == "All" && queryParams != "") {
            plantSites.definitionExpression =  queryParams;
        } else if (ecoSelected != "All" && queryParams == "") {
            plantSites.definitionExpression =  "ecoregionalgroup = '" + ecoSelected + "'";
        }


        //add feature count and add x to upper right corner of table to close it
        plantSites.queryFeatureCount().then(function(count) {
            console.log(count);
          sitesCountforSpecSum = count;
            //document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + graphics.length.toString() + " species</b>"
            document.getElementById("featureCount").innerHTML = 
                "<b>Showing attributes for " +
                count + " features at " + sitesCount + " sites</b>"
            document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
            document.getElementById("removeX").setAttribute("style", "float: right;");

        });
        console.log(plantSites.definitionExpression);

        plantSites.queryExtent().then(function(response) {
            console.log(response);
            mapView.goTo(response.extent);
          });

          var newQueryParams = plantSites.definitionExpression;


        var query = sitesSpeciesJoin.createQuery();
        query.where = plantSites.definitionExpression;
        //query.outFields = ["*"];
        query.outFields = ["family", "scientificname", "commonname", "cover", "nativity", "noxious", "growthform", "duration", "indicatorwmvc", "indicatoraridwest", "cvalue"];

        sitesSpeciesJoin.queryFeatures(query).then(function(e) {
            console.log(e);



            resultsArray = e["features"];
            //console.log(resultsArray);          
            // put our attributes in an object the datagrid can ingest.
            var srch = {
                "items": []
            };
            resultsArray.forEach(function(ftrs) {

                var att = ftrs.attributes;

                srch.items.push(att);
            });
            console.log(srch);
            var summaryArray = [];

            srch.items.forEach(function(calc) {
                //console.log(calc);
                summaryArray.push(calc);
            });

            console.log(summaryArray);



            


            //count the number of sites each species is present at



//------------------------------------
count = function (ary, classifier) {
    console.log(ary);
    console.log(classifier);
    classifier = classifier || String;
    console.log(classifier);
    return ary.reduce(function (counter, item) {
        var p = classifier(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {})
};

counts = count(summaryArray, function (item){
    return item.scientificname
});

//-------------------------------------
// var counts = [];
//             for (var i = 0; i < summaryArray.length; i++) {
//                 //var cover = summaryArray[i].cover;
//                 var num = summaryArray[i].scientificname;
//                 var coverSum = "";
//                 console.log(num);
//                 if (counts[num] = counts[num]) {
//                     counts[num] = counts[num] + 1;
//                     //counts[coverSum] = counts[coverSum] + cover;
//                 } else {
//                     counts[num] = 1;
//                 } ;

//             }


            console.log(counts);

            //sum the cover values for each scientificname
            totals = summaryArray.reduce(function(r, o) {
                (r[o.scientificname]) ? r[o.scientificname] += o.cover: r[o.scientificname] = o.cover;
                return r;
            }, []);

            console.log(totals);

            //add the counts to the summaryArray
            for (var i = 0; i < summaryArray.length; i++) {
                const entries = Object.entries(counts)
                for (const [specie, count] of entries) {
                    //console.log(count + specie);
                    //console.log(summaryArray[i].species);
                    if (specie == summaryArray[i].scientificname) {
                        summaryArray[i].sitecount = count;
                    }

                }

            }

            //add the mean cover to the summaryArray
            for (var i = 0; i < summaryArray.length; i++) {
                const entries = Object.entries(totals)
                const totCount = summaryArray[i].sitecount;
                for (const [specie, count] of entries) {
                    //console.log(count + specie);
                    //console.log(summaryArray[i].species);
                    if (specie == summaryArray[i].scientificname) {
                        var meanAvg = count / totCount;
                        summaryArray[i].meancover = meanAvg.toFixed(1);
                    }

                }

            }

            //convert menaCover from string to integer
            for (var i in summaryArray) {
                summaryArray[i].meancover = +summaryArray[i].meancover;
            }

            console.log(summaryArray);

            //remove duplicate entries based on scientificname
            function removeDuplicates(originalArray, prop) {
                var newArray = [];
                var lookupObject = {};

                for (var i in originalArray) {
                    lookupObject[originalArray[i][prop]] = originalArray[i];
                }

                for (i in lookupObject) {
                    newArray.push(lookupObject[i]);
                }
                return newArray;
            }

            var uniqueArray = removeDuplicates(summaryArray, "scientificname");

            var noCoverArray = uniqueArray.map(obj => ({family: obj.family, scientificname: obj.scientificname, commonname: obj.commonname, sitecount: obj.sitecount, meancover: obj.meancover, nativity: obj.nativity, noxious: obj.noxious, growthform: obj.growthform, duration: obj.duration, indicatorwmvc: obj.indicatorwmvc, indicatoraridwest: obj.indicatoraridwest, cvalue: obj.cvalue}))

             
            console.log(noCoverArray)

            var fieldArray = [
                //{alias: 'objectid', name: 'objectid'}, 
                {
                    alias: 'Family',
                    name: 'family'
                },
                {
                    alias: 'Scientific Name',
                    name: 'scientificname'
                },
                {
                    alias: 'Common Name',
                    name: 'commonname'
                },
                {
                    alias: 'Site Count',
                    name: 'sitecount'
                },
                {
                    alias: 'Mean Cover',
                    name: 'meancover'
                },
                {
                    alias: 'Nativity',
                    name: 'nativity'
                },
                {
                    alias: 'Noxious',
                    name: 'noxious'
                },
                {
                    alias: 'Growth Form',
                    name: 'growthform'
                },
                {
                    alias: 'Duration',
                    name: 'duration'
                },
                {
                    alias: 'Mountains Wetland Indicator',
                    name: 'indicatorwmvc'
                },
                {
                    alias: 'Arid West Indicator',
                    name: 'indicatoraridwest'
                },
                {
                    alias: 'C-Value',
                    name: 'cvalue'
                },
            ];


            var forObject = {
                features: '',
                fields: ''
            }

            forObject.features = noCoverArray;
            forObject.fields = fieldArray;



            console.log(forObject)



            console.log(noCoverArray)

            getResults(forObject);

                    //add feature count and add x to upper right corner of table to close it
                    plantSites.queryFeatureCount().then(function(count) {
                        console.log(count);
                      sitesCountforSpecSum = count;
                        //document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + graphics.length.toString() + " species</b>"
                        document.getElementById("featureCount").innerHTML = 
                            "<b>Showing attributes for " + uniqueArray.length.toString() + " species at " + count + " sites</b>"
                        document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
                        document.getElementById("removeX").setAttribute("style", "float: right;");
            
                    });


        });


    } //end doSpeciesSummary function

    function doQueryProjects() {

        doGridClear();
        mapView.graphics.removeAll()
        //mapView.popup.close();
        console.log("doQueryProjects");
        //doClear();
        gridFields = ["projectcode", "organization", "contactinfo", "projectgoal", "methodname", "assessmentareadescription",
            "vegetationmethod", "vegetationcalculation", "reportlink"
        ];

        var queryProjects = new QueryTask({
            url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/plantPortalV6_View/FeatureServer/0"
        });

        relationQueryProjects = new RelationshipQuery({
            objectIds: [objectid],
            outFields: ["projectcode", "organization", "contactinfo", "projectgoal", "methodname", "assessmentareadescription",
            "vegetationmethod", "vegetationcalculation", "reportlink"],
            relationshipId: 1
        });

        queryProjects.executeRelationshipQuery(relationQueryProjects).then(function(rslts) {
            //console.log(rslts);

            var poop = rslts[objectid];

            var gridFieldArray = [
                //{alias: 'objectid', name: 'objectid'}, 
                {
                    alias: 'Project Code',
                    name: 'projectcode'
                },
                {
                    alias: 'Organization',
                    name: 'organization'
                },
                {
                    alias: 'Contact Info',
                    name: 'contactinfo'
                },
                {
                    alias: 'Project Goal',
                    name: 'projectgoal'
                },
                {
                    alias: 'Method Name',
                    name: 'methodname'
                },
                {
                    alias: 'Assessment Area Description',
                    name: 'assessmentareadescription'
                },
                {
                    alias: 'Vegetation Method',
                    name: 'vegetationmethod'
                },
                {
                    alias: 'Vegetation Calculation',
                    name: 'vegetationcalculation'
                },
                {
                    alias: 'Report Link',
                    name: 'reportlink'
                },
            ];

            poop.fields = gridFieldArray;

            // poop.fields.forEach(function(fields, i) {
            //     fields.name = gridFields[i]
            //     fields.alias = gridFieldArray[i]
            // });

            console.log(poop);
            getResults(rslts[objectid]);

        });

       

    }



    function doQuerySpecies() {
        doGridClear();
        mapView.graphics.removeAll()
        //mapView.popup.close();
        console.log("doQuerySpecies");
        gridFields = ["family", "scientificname", "commonname", "cover", "nativity", "noxious", "growthform", "duration", "indicatorwmvc", "indicatoraridwest", "cvalue"];

        var querySpecies = new QueryTask({
            url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/plantPortalV6_View/FeatureServer/0"
        });

        relationQuerySpecies = new RelationshipQuery({
            objectIds: [objectid],
            outFields: ["family", "scientificname", "commonname", "cover", "nativity", "noxious", "growthform", "duration", "indicatorwmvc", "indicatoraridwest", "cvalue"],
            relationshipId: 0
        });


        querySpecies.executeRelationshipQuery(relationQuerySpecies).then(function(rslts) {
            console.log(rslts);

            var gridfieldArray = [
                //{alias: 'objectid', name: 'objectid'}, 
                {
                    alias: 'Family',
                    name: 'family'
                },
                {
                    alias: 'Scientific Name',
                    name: 'scientificname'
                },
                {
                    alias: 'Common Name',
                    name: 'commonname'
                },

                {
                    alias: 'Cover',
                    name: 'cover'
                },
                {
                    alias: 'Nativity',
                    name: 'nativity'
                },
                {
                    alias: 'Noxious',
                    name: 'noxious'
                },
                {
                    alias: 'Growth Form',
                    name: 'growthform'
                },
                {
                    alias: 'Duration',
                    name: 'duration'
                },
                {
                    alias: 'Mountains Wetland Indicator',
                    name: 'indicatorwmvc'
                },
                {
                    alias: 'Arid West Indicator',
                    name: 'indicatoraridwest'
                },
                {
                    alias: 'C-Value',
                    name: 'cvalue'
                },
            ];

            var poop = rslts[objectid];

            poop.fields = gridfieldArray;

            // poop.fields.forEach(function(fields, i) {
            //     fields.name = gridFields[i]
            //     fields.alias = gridFields[i]
            // });

            console.log(rslts[objectid].features.length);
            getResults(rslts[objectid]);
            

        

        document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + rslts[objectid].features.length + " species</b>"
        document.getElementById("removeX").setAttribute("class", "glyphicon glyphicon-remove");
        document.getElementById("removeX").setAttribute("style", "float: right;");

    });

    }


    on(typeSelect, "change", function(evt) {
        //defQuery();
        type1 = evt.target.value;
        console.log("wetland type '" + type1 + "'");
        //var valueOne = waterShedSelect.options[waterShedSelect.selectedIndex].value;

    })


    on(waterShedSelect, "change", function(evt) {

        //defQuery();
        type2 = evt.target.value;
        console.log(type2);



    })

    on(ecoLevel, "change", function(evt) {
        ecoQuery();
        type4 = evt.target.value;
        console.log(type4);

        var sqlQuery = "";
        var weQuery = new Query();
        var hucQuery = new Query();
        var conditionQuery = new Query();


    sqlQuery = "ecoregionalgroup = '" + type4 + "'";

console.log(sqlQuery);

        weQuery.outFields = ["wetlandtype"];
        weQuery.returnDistinctValues = true;
        weQuery.orderByFields = ["wetlandtype"];
        weQuery.where = sqlQuery;
        plantSites.queryFeatures(weQuery).then(function(e) {
            console.log(e);
            addToSelect(e);
        })

        hucQuery.outFields = ["watershed"];
        hucQuery.returnDistinctValues = true;
        hucQuery.orderByFields = ["watershed"];
        hucQuery.where = sqlQuery;
        plantSites.queryFeatures(hucQuery).then(function(et) {
            addToSelect2(et);
        })

        conditionQuery.outFields = ["vegetationcondition"];
        conditionQuery.returnDistinctValues = true;
        conditionQuery.orderByFields = ["vegetationcondition"];
        conditionQuery.where = sqlQuery;
        plantSites.queryFeatures(conditionQuery).then(function(ett) {
            addToSelect4(ett);
        })
    
    })

    on(conditionSelect, "change", function(evt) {
        //defQuery();
        type4 = evt.target.value;
        console.log(type4);

    })

    document.getElementById("removeX").addEventListener("click", function(evt) {
        mapView.popup.close();
        mapView.graphics.removeAll();
        doClear();

    })

    //hide grid on map click. need to make an X icon on the right hand side of it eventually
    mapView.on('click', function(event) {
        //doClear();
    });




    // species dgrid function
    watchUtils.when(mapView.popup, "selectedFeature", function species(evt) {

        objectid = mapView.popup.selectedFeature.attributes.objectid;
        console.log(objectid);

    }); // end watchUtil



    mapView.popup.on("trigger-action", function(event) { // Execute the relatedSpecies() function if the species action is clicked
        if (event.action.id === "related-species") {
            console.log("species action clicked");
            singleSiteSpeciesID = "";
            console.log(event.target.features[0].attributes.objectid);
            singleSiteSpeciesID = event.target.features[0].attributes.objectid;
            doQuerySpecies();
        }
    });

    mapView.popup.on("trigger-action", function(event) { // Execute the relatedProjects() function if the project action is clicked
        if (event.action.id === "related-projects") {
            console.log("project action clicked");
            singleSiteSpeciesID = "";
            console.log(event.target.features[0].attributes.objectid);
            singleSiteSpeciesID = event.target.features[0].attributes.objectid;
            doQueryProjects();
        }
    });

    mapView.popup.watch("hide", function(e) {
        mapView.popup.close();
        mapView.graphics.removeAll();
        console.log("closing popup");
    });

    //open glossary panel when links are clicked from the about panel
    var aClickedWetLink = document.getElementById("wetlandClassLink");

    aClickedWetLink.onclick = function(){

        document.getElementById("panelGlossary").className = "panel collapse in";
        document.getElementById("collapseGlossary").className = "panel-collapse collapse in";
        document.getElementById("panelInfo").className = "panel collapse";
        document.getElementById("collapseInfo").className = "panel-collapse collapse";
        return false;
    }

    var aClickedConLink = document.getElementById("conditionClassLink");

    aClickedConLink.onclick = function(){

        document.getElementById("panelGlossary").className = "panel collapse in";
        document.getElementById("collapseGlossary").className = "panel-collapse collapse in";
        document.getElementById("panelInfo").className = "panel collapse";
        document.getElementById("collapseInfo").className = "panel-collapse collapse";
        return false;
    }

    // Basemap events
    query("#selectBasemapPanel").on("change", function(e) {
        console.log("base mapping");
        if (e.target.value == "Infrared") {

            mapView.map.basemap = irBase;
            // if mapview use basemaps defined in the value-vector=, but if mapview use value=
        } else if (map.mview == "map") {
            mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
        } else { // =="scene"
            mapView.map.basemap = e.target.value;
        }
    });

    function errorCallback(error) {
        console.log("error:", error);
      }

//testing resizing grid

var isResizing = false,
    lastDownX = 0;

$(function () {
    var container = $('#cont');
    var top = $('mapViewDiv');
    var bottom = $('#gridDisplay');
    //var gridHeight = $('dgrid');
    var handle = $('#drag');

    handle.on('mousedown', function (e) {
        isResizing = true;
        lastDownX = e.clientY;
    });

    $(document).on('mousemove', function (e) {
        // we don't want to do anything if we aren't resizing.
        if (!isResizing) 
            return;
        console.log("e.clientY ", e.clientY, container.offset().top)
        var offsetRight = container.height() - (e.clientY - container.offset().top);
        console.log(offsetRight);

        top.css('bottom', offsetRight);
        bottom.css('height', offsetRight);
        //gridHeight.css('height', offsetRight);

        let root = document.documentElement;

        root.addEventListener("mousemove", e => {
            root.style.setProperty('--gridHeight', offsetRight + "px");
        })

    }).on('mouseup', function (e) {
        // stop resizing
        isResizing = false;
    });
});


// check for mobile to expand legend

isResponsiveSize = mapView.widthBreakpoint === "xsmall";
updateView(isResponsiveSize);

// Breakpoints

mapView.watch("widthBreakpoint", function(breakpoint) {
    console.log("watching breakpoint");
    console.log(breakpoint);
  switch (breakpoint) {
    case "xsmall":
      updateView(true);
      break;
    case "small":
    case "medium":
    case "large":
    case "xlarge":
      updateView(false);
      break;
    default:
  }
});

function updateView(isMobile) {
    console.log("Is Mobile");
  setLegendMobile(isMobile);
}


function setLegendMobile(isMobile) {
  var toAdd = isMobile ? expandLegend : legend;
  var toRemove = isMobile ? legend : expandLegend;

  mapView.ui.remove(toRemove);
  mapView.ui.add(toAdd, "top-left");
}





});