/*
 * Root file that handles instances of all the charts and loads the visualization
 */
(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {


        d3.queue()
            .defer(d3.json, '../resources/data/promoters.json')
            .await(function(error, data1){
                var idMap = {};
                var dataMap = {};
                var metaIdMap = {};
                var typeMap = {};
                var urlMap = {};

                var maxId = data1[data1.length - 1].glyph__idName+1;

                data1.forEach(function(d) {dataMap[d.glyph__idName] = d;
                                            if(!(d.glyph__type in idMap))
                                            {
                                                idMap[d.glyph__type] = [];
                                            }
                                            idMap[d.glyph__type].push(d.glyph__idName);
                                            metaIdMap[d.glyph__idName] = d.glyph__metaId;
                                            typeMap[d.glyph__idName] = d.glyph__type;
                                            urlMap[d.glyph__idName] = d.glyph__url});

                //Creating instances for each visualization
                //(data, _id, metaIds, types, urls, totalIds) {
                var glyphFunctions = new GlyphFunctions(data1, idMap, metaIdMap, typeMap, urlMap, maxId);
                var options = {
                    url: "../resources/data/promoters.json",
                    getValue: "glyph__type",
                    list: {
                        match: {
                            enabled: true
                        },
                        onClickEvent: function()
                        {
                            glyphFunctions.add($("#glyph-search-box").val());
                        },
                        maxNumberOfElements: 100
                    },
                    placeholder:"Search for a glyph",
                    theme: "plate-dark"
                };


                $("#glyph-search-box").easyAutocomplete(options);
            });

    }


    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }


    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        var self = this
        if(self.instance == null){
            self.instance = new Main();

            //called only once when the class is initialized
            init();
        }
        return instance;
    }

    Main.getInstance();
})();