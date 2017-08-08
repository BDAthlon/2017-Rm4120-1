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
            .defer(d3.json, '../resources/data/drugs.json')
            .defer(d3.json, '../resources/data/sideeffects.json')
            .defer(d3.json, '../resources/data/statistics.json')
            .defer(d3.json, '../resources/data/treatments.json')
            .await(function(error, data1, data2, data3, data4){
                var idMap = {};
                var dataMap = {};
                var effectsMap = {};
                var statsMap = {};
                var treatMap = {};

                var maxId = data1[data1.length - 1]._Drug__id+1;

                data1.forEach(function(d) {dataMap[d._Drug__id] = d; idMap[d._Drug__name] = d._Drug__id});
                data2.forEach(function(d) {effectsMap[d._DrugSideEffects__id] = d});
                data3.forEach(function(d) {statsMap[d._DrugStatistics__id] = d});
                data4.forEach(function(d) {treatMap[d._DrugTreatment__id] = d});

                //Creating instances for each visualization

                var interactionChart = new InteractionChart(dataMap, effectsMap, statsMap, treatMap, idMap, maxId);


                var options = {
                    url: "../resources/data/drugs.json",
                    getValue: "_Drug__name",
                    list: {
                        match: {
                            enabled: true
                        },
                        onClickEvent: function() {
                            interactionChart.add($("#drug-search-box").val());
                        },
                        maxNumberOfElements: 6
                    },
                    placeholder:"Search for a drug",
                    theme: "plate-dark"
                };


                $("#drug-search-box").easyAutocomplete(options);

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