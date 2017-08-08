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
            .defer(d3.json, '../resources/data/glyphs.json')
            .await(function(error, data1){
                var idMap = {};
                var nameMap = {};

                var maxId = data1[data1.length - 1]._glyph__id+1;

                data1.forEach(function(d) {nameMap[d._glyph__id] = d; idMap[d._glyph__name] = d._glyph__id});
                //Creating instances for each visualization

                var interactionChart = new InteractionChart(dataMap, idMap, maxId);


                var options = {
                    url: "../resources/data/glyphs.json",
                    getValue: "_glyph__name",
                    list: {
                        match: {
                            enabled: true
                        },
                        onClickEvent: function() {
                            interactionChart.add($("#glyph-search-box").val());
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