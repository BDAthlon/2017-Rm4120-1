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
            .await(function(error, glyphs){
                var idMap = {};
                var dataMap = {};


                var maxId = glyphs[glyphs.length - 1]._glyph__id+1;

                glyphs.forEach(function(d) {dataMap[d._glyph__id] = d; idMap[d.glyph__name] = d._glyph__id});

                //Creating instances for each visualization

                var options = {
                    url: "../resources/data/glyphs.json",
                    getValue: "_glyph__name",
                    list: {
                        match: {
                            enabled: true
                        },
                        maxNumberOfElements: 100
                    },
                    placeholder:"Search for a glyph",
                    theme: "plate-dark"
                };


                $("#glyph-search-box").easyAutocomplete(options);
                console.log(options);
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