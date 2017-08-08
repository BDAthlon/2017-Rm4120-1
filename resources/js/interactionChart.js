

function InteractionChart(data, sideEffects_data, statistics_data,  treatments_data, idMap, n) {
    var self = this;
    self.data = data;
    self.drugSelection = [];
    self.idMap = idMap;
    self.statisticsChart = new StatisticsChart(statistics_data);
    self.treatmentsChart = new TreatmentsChart(treatments_data);
    self.sideEffects = sideEffects_data;
    self.boxesWidth = [];
    self.drugContains = [];
    self.interactionActive = false;

    for(var i = 0; i < n; i++)
    {
        self.drugContains.push(false);
    }

    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
InteractionChart.prototype.init = function(){

    var self = this;

    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var interChart = d3.select("#interaction-chart").classed("fullView", true);
    self.svgBounds = interChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 500;

    //creates svg element within the div
    self.svg = interChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);

    //creates svg element within the div
    self.drugRemoveSvg = d3.select("#drug-remove").classed("fullView", true)
        .append("svg")
        .attr("width",self.svgWidth)
        .attr("height",55);


    var filterBox = d3.select("#interaction-filter");

    self.filter = filterBox.property("checked");
    filterBox.on("change", function()
    {
        self.filter = filterBox.property("checked");
        self.update();
    })

};

InteractionChart.prototype.createCanvas = function()
{
    var self = this;


    d3.select("#drug-selection-label").text("Selection: ");

    self.svg.append("line")
        .attr("x1", self.svgWidth)
        .attr("x2", self.svgWidth)
        .attr("y1", self.margin.top)
        .attr("y2", self.margin.top)
        .attr("class", "bgLine");

    self.svg.append("line")
        .attr("x1", self.svgWidth)
        .attr("x2", self.svgWidth)
        .attr("y1", self.svgHeight/2)
        .attr("y2", self.svgHeight/2)
        .attr("class", "bgLine");

    self.svg.append("line")
        .attr("x1", self.svgWidth)
        .attr("x2", self.svgWidth)
        .attr("y1", self.svgHeight-self.margin.bottom)
        .attr("y2", self.svgHeight-self.margin.bottom)
        .attr("class", "bgLine");

    self.svg.selectAll("line")
        .transition()
        .duration(1000)
        .attr("x1", 0)
        .delay(function(d, i) { return i * 50; });

    self.effectsLinesGroup = self.svg.append("g");
    self.interLinesGroup = self.svg.append("g");
    self.drugCirclesGroup = self.svg.append("g");
    self.interCirclesGroup = self.svg.append("g");
    self.effectsTriangleGroup = self.svg.append("g");
    self.createLegend();
    self.interactionActive = true;

};


InteractionChart.prototype.clearCanvas = function(){
    var self = this;
    self.svg.selectAll("*").remove();
    self.interactionActive = false;
    d3.select("#drug-selection-label").text("");
    self.clearLegend();
};


InteractionChart.prototype.clearLegend = function(){
    d3.select("#interaction-legend").selectAll("*").remove();
}
InteractionChart.prototype.createLegend = function(){

    var legend = d3.select("#interaction-legend").append("svg").attr("width", 525).attr("height", 40);

    var interactions = legend.append("g");
    interactions.append("circle").attr("class", "interCircle").attr("r",10).attr("cx", 125).attr("cy", 20);
    interactions.append("text").text("Drug Interaction: ").attr("x", 0).attr("dx", 0).attr("dy", 25);

    var selection = legend.append("g");
    selection.append("circle").attr("class", "drugCircle").attr("r",10).attr("cx", 320).attr("cy", 20);
    interactions.append("text").text("Drug Selection: ").attr("dx", 200).attr("dy", 25);

    var effects = legend.append("g");
    effects.append("polygon").attr("class", "effectTriangle").attr("points", "485,15 495,25 505,15");
    interactions.append("text").text("Side Effects: ").attr("dx", 400).attr("dy", 25);

};



InteractionChart.prototype.clearSideEffects = function(){
    var self = this;
    var triangleArea= self.effectsTriangleGroup.selectAll("polygon").remove();
    var interLine = self.effectsLinesGroup.selectAll("path").remove();
};

InteractionChart.prototype.pathInteractionGenerator = function(x_from, y_from, x_to,  y_to){
    return "M" + x_from + "," + y_from
        + "C" + (x_from + x_to) / 2 + "," + y_to
        + " " + (x_from + x_to) / 2 + "," +  y_from/2
        + " " + x_to + "," + y_to;
}

InteractionChart.prototype.pathEffectGenerator = function(x_from, y_from, x_to,  y_to)
{
    return "M" + x_from + "," + y_from
        + "C" + (x_from + x_to) / 2 + "," + y_to
        + " " + (x_from + x_to) / 2 + "," + 3*y_from/2
        + " " + x_to + "," + y_to;
}

InteractionChart.prototype.addRemoveButton = function(){

    var self = this;
    var remBoxes = self.drugRemoveSvg.selectAll(".drugRemovalDefault").data(self.drugSelection);
    remBoxes.exit().remove();
    var boxMerge = remBoxes.enter().append("g").attr("class", "drugRemovalDefault");

    var rect = boxMerge.append("rect");
    var text = boxMerge.append("text");

    text.text( function(d) {return d._Drug__name;});

    remBoxes = boxMerge.merge(remBoxes);

    var offset = [7];
    var bbox = text.node().getBBox();
    self.boxesWidth.push(bbox.width+10);

    for (i = 1; i < self.boxesWidth.length; i++) {
        offset.push(offset[i-1] + self.boxesWidth[i-1] + 10);
    }
    remBoxes.each(function(d,i)
    {
        var g = d3.select(this);

        g.select("rect")
            .attr("x", offset[i])
            .attr("y", 20)
            .attr("height",30)
            .attr("width",  self.boxesWidth[i])
            .attr("rx", "10")
            .attr("ry", "10");

        g.select("text")
            .attr("x", offset[i]+5)
            .attr("dy", "40")
            .attr("dx", 0);
    });

    remBoxes
        .on("mouseover", function(d, i)
        {

            d3.select(this).classed("drugRemovalHighlighted", true);
            d3.select(this).select("text").text("\u2716").attr("dx", self.boxesWidth[i]/2-10);

            d3.select("#interaction-chart").select("svg").selectAll(".drugCircle")
                .filter(function(circle) { return circle.id == d._Drug__id ? true : false;})
                .classed("highlightCircle", true);
        })
        .on("mouseout", function(d)
        {
            d3.select(this).classed("drugRemovalHighlighted", false);
            d3.select(this).select("text").text( function(d) {return d._Drug__name;}).attr("dx", 0);
            d3.select("#interaction-chart").select("svg").selectAll(".drugCircle")
                .filter(function(circle) {return circle.id == d._Drug__id ? true : false;})
                .classed("highlightCircle", false);
        })
        .on("click", function(d,i)
        {
            self.remove(d._Drug__name);
            var new_offset = [7];
            for (j = 1; j < self.boxesWidth.length; j++) {
                new_offset.push(new_offset[j-1] + self.boxesWidth[j-1] + 10);
            }

            var updateBoxes = self.drugRemoveSvg.selectAll(".drugRemovalDefault").data(self.drugSelection);
            updateBoxes.select("rect")
                .attr("x", function(d,j) {return new_offset[j];})
                .attr("y", 20)
                .attr("height",30)
                .attr("width",  function(d,j) { return self.boxesWidth[j];})
                .attr("rx", "10")
                .attr("ry", "10");

            updateBoxes.select("text")
                .attr("dx", 0)
                .attr("dy", "40")
                .attr("x", function(d,j) { return new_offset[j]+5})
                .text(function(d) {return  d._Drug__name;});
        });


}


InteractionChart.prototype.removeRemoveButton = function(){

    var self = this;
    var remBoxes = self.drugRemoveSvg.selectAll(".drugRemovalDefault").data(self.drugSelection);
    remBoxes.exit().remove();

    var offset = [0];

    for (i = 1; i < self.boxesWidth.length; i++) {
        offset.push(offset[i-1] + self.boxesWidth[i-1] + 10);
    }
    remBoxes.each(function(d,i)
    {
        var g = d3.select(this);

        g.select("rect")
            .attr("x", offset[i])
            .attr("y", 20)
            .attr("height",30)
            .attr("width",  self.boxesWidth[i])
            .attr("rx", "10")
            .attr("ry", "10");

        g.select("text")
            .attr("x", offset[i])
            .attr("dy", "40")
            .attr("dx", 0);
    });


}

InteractionChart.prototype.add = function(drugName){
    var self = this;

    if(!(drugName in self.idMap))
    {
        return;
    }
    var drugIndex = self.idMap[drugName];

    //Make sure element does not exist before adding to drugSelection
    var drugData = self.data;

    if(!self.drugContains[drugIndex])
    {
        self.drugContains[drugIndex] = true;
        self.drugSelection.push(drugData[drugIndex]);
        self.addRemoveButton();
        self.update();
    }

};


InteractionChart.prototype.remove = function(drugName){
    var self = this;
    if(!(drugName in self.idMap))
    {
        return;
    }
    var drugIndex = self.idMap[drugName];

    //Make sure element does not exist before adding to drugSelection
    var drugData = self.data;

    if(self.drugContains[drugIndex])
    {
        self.drugContains[drugIndex] = false;

        self.drugSelection = self.drugSelection.filter(function(d,i) {

            if(d._Drug__name !== drugName)
            {
                return true;
            }
            self.boxesWidth.splice(i,1);


            return false;
        });
        var selection = self.drugCirclesGroup.selectAll(".selectCircle");

        selection.each(
            function(d)
            {
                if(d._Drug__name == drugName)
                {
                    d3.select(this).classed("selectCircle", false);
                    self.clearSideEffects();
                    self.statisticsChart.clearCanvas();
                    self.treatmentsChart.clearCanvas();
                    d3.select("#drug-selection-value").text("");
                }
            }
        );

        self.removeRemoveButton();
        self.update();
    }

};

InteractionChart.prototype.updateSideEffects = function(id, circleLoc){

    var self = this;

    var effectData = self.sideEffects[id]._DrugSideEffects__sideEffects;

    var triangleScale = d3.scalePoint()
        .domain(effectData.map(function(d){
            return d.label;}))
        .range([self.margin.left, self.svgWidth-self.margin.right]);

    var triangleArea= self.effectsTriangleGroup;

    var interTriangle = triangleArea.selectAll("polygon").data(effectData);
    interTriangle.exit().remove();
    interTriangle = interTriangle.enter().append("polygon").merge(interTriangle);


    interTriangle.attr("class", "effectTriangle")
        .attr("points", function(d,i) {
            var x = triangleScale(d.label);

            var y = self.svgHeight - self.margin.bottom;
            return (x-9) + "," + (y) + " " + (x) + "," + (y+9) + " " + (x+9) + "," + (y);}
            );

    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function() {
            return [0,-60];
        })
        .html(function(d) {
            tooltip_data =
            {
                "name": d.label,
                "count":  d.count
            }
            return self.tooltip_effects_render(tooltip_data);
        });

    if(effectData.length > 0)
    {
        self.tip = tip;
        interTriangle.call(self.tip);
    }

    interTriangle.on("mouseover", function(d) {self.tip.show(d)})
        .on("mouseout", function(d) {self.tip.hide(d)})

    var interLine = self.effectsLinesGroup.selectAll("path").data(effectData);
    interLine.exit().remove();
    interLine = interLine.enter().append("path").merge(interLine);

    interLine
        .attr("class", "defaultInterLine")
        .attr("d", function(d) {
            return self.pathEffectGenerator(circleLoc, self.svgHeight/2, triangleScale(d.label), self.svgHeight - self.margin.bottom)})
        .attr("stroke-dasharray", function(d) {var l = d3.select(this).node().getTotalLength(); return l + "," + l;})
        .attr("stroke-dashoffset",function(d) {var l = d3.select(this).node().getTotalLength(); return l;})
        .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);

};


InteractionChart.prototype.tooltip_interaction_render = function (tooltip_data) {
    var self = this;
    var text = "<h3 class = tooltip-title >" + tooltip_data.name + "</h3>";
    text += "<ul>"
    tooltip_data.rows.forEach(function(row){
        text += "<li class = tooltip-row>" + row + "</li>"
    });
    text += "</ul>";
    return text;
}

InteractionChart.prototype.tooltip_effects_render = function (tooltip_data) {
    var self = this;
    var text = "<h3 class = tooltip-title >" + tooltip_data.name + "</h3>";
    text += "<p class = tooltip-row> Patient(s): " + tooltip_data.count + "</p>"
    return text;
}


InteractionChart.prototype.countOccurrences = function (arr) {

    var occurrences = {};

    arr.forEach(function(d)
    {
       if(!(d in occurrences))
       {
           occurrences[d] = 0;
       }
        occurrences[d] += 1;
    });

    return occurrences;

};


InteractionChart.prototype.drugFilter = function (arr, occurrences) {
    var self = this;

    if(self.filter)
    {
        return arr.filter(function(element){
            return occurrences[element] > 1;
        });
    }
    else {
        return Object.keys(occurrences);
    }
};


InteractionChart.prototype.drugFilter = function (arr) {
    var self = this;

    if(self.filter)
    {
        var filter =  arr.filter(function(element){
            return self.drugContains[element];
        });

        return filter;
    }
    else {
        return arr;
    }
};

/**
 * Creates a chart with circles
 */
InteractionChart.prototype.update = function(){
    var self = this;
    var lines = [];
    var interactions = {};

    if(!self.interactionActive && self.drugSelection.length > 0)
    {
        self.createCanvas();
    }
    else if (self.drugSelection.length == 0)
    {
        if(self.interactionActive )
        {
            self.clearCanvas();
        }
        return;
    }

    var circleScale = d3.scalePoint()
        .domain(self.drugSelection.map(function(d){return d._Drug__id;}))
        .range([self.margin.left, self.svgWidth-self.margin.right]);

    //Get all drug interaction from the selected drug.
    var interactingDrugs = [];
    self.drugSelection.forEach(function(d, i){
        interactingDrugs = interactingDrugs.concat(d._Drug__interactions);
    });

    //var drugOccurrences = self.countOccurrences(interactingDrugs);

    //var uniqueInteractDrugs = self.drugFilter(interactingDrugs, drugOccurrences);

    var uniqueInteractDrugs = self.drugFilter(interactingDrugs);

    var interDrugScale = d3.scalePoint()
        .domain(uniqueInteractDrugs)
        .range([self.margin.left, self.svgWidth-self.margin.right]);

    //Create circles for the drug(s) selected by the user
    self.drugSelection.forEach(function(drugData ) {
            drugData._Drug__interactions.forEach(function(interactingDrug )
                {
                    //if(!self.filter || self.filter && drugOccurrences[interactingDrug] > 1)

                    if(!self.filter || self.filter && self.drugContains[interactingDrug])
                    {
                        if(!(interactingDrug in interactions))
                        {
                            interactions[interactingDrug] = []
                        }
                        interactions[interactingDrug].push(drugData._Drug__name);
                        lines.push({"parent": interactingDrug,  "x1":circleScale(drugData._Drug__id) , "y1":self.svgHeight/2 , "x2":interDrugScale(interactingDrug) , "y2":self.margin.top})
                    }
                }
            );
        }
    );

    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function() {
            return [0,-60];
        })
        .html(function(d) {
            tooltip_data =
            {
                "name": self.data[d]._Drug__name,
                "rows": interactions[d]
            }
            return self.tooltip_interaction_render(tooltip_data);
        });




    var interCircles = self.interCirclesGroup.selectAll("circle").data(uniqueInteractDrugs);
    interCircles.exit().transition().style("fill-opacity", 1e-6).remove();
    interCircles = interCircles.enter().append("circle").attr("cx", self.svgWidth+20).merge(interCircles);

    interCircles.classed("interCircle", true)
        .attr("cy", self.margin.top)
        .attr("r",10)
        .transition()
        .duration(500)
        .delay(function(d,i){return i;})
        .attr("cx", function(d,i) {return interDrugScale(d);});


    if(uniqueInteractDrugs.length > 0)
    {
        self.inter_tip = tip;
        interCircles.call(self.inter_tip);
    }
    interCircles
        .on("mouseover", function(d)
        {
            d3.select(this).classed("highlightCircle", true);
            interLine.filter(function(line) {return line.parent == d;}).attr("class", "highlightInterLine");
            self.inter_tip.show(d);
        })
        .on("mouseout", function(d)
        {
            d3.select(this).classed("highlightCircle", false);
            interLine.attr("class", "defaultInterLine");
            self.inter_tip.hide(d);
        });

    var drugCircles = self.drugCirclesGroup.selectAll("circle").data(self.drugSelection);
    drugCircles.exit().transition().style("fill-opacity", 1e-6).remove();

    drugCircles = drugCircles.enter().append("circle").attr("cx", self.svgWidth+100).merge(drugCircles);

    drugCircles.attr("class", "drugCircle").attr("cy", self.svgHeight/2).attr("r",10)
        .transition()
        .duration(500)
        .delay(function(d,i){return 50*i;})
        .attr("cx", function(d,i) {return circleScale(d._Drug__id);})


    //Merge all lines and circles that currently exist in the svg interaction chart with new data
    var interLine = self.interLinesGroup.selectAll("path").data(lines);
    interLine.exit().remove();
    interLine = interLine.enter().append("path").attr("class", "defaultInterLine").attr("d", function(d) {return self.pathInteractionGenerator(self.svgWidth+50, d.y1,d.x2,d.y2)}).merge(interLine);

    interLine
        .transition()
        .duration(500)
        .delay(function(d,i){return i;})
        .attr("d", function(d) {return self.pathInteractionGenerator(d.x1, d.y1,d.x2,d.y2)});

    drugCircles
        .on("click", function(d)
        {
            drugCircles.classed("selectCircle", false);
            var circle = d3.select(this).classed("selectCircle", true);
            var x = Number(circle.attr("cx"));
            //draw side effects of selected drug as triangles
            self.updateSideEffects(d._Drug__id, x);
            self.statisticsChart.update(d._Drug__id);
            self.treatmentsChart.drawTree(d._Drug__id)
            d3.select("#drug-selection-value").text(d._Drug__name);
        })
        .on("mouseover", function(d)
        {
            d3.select(this).classed("highlightCircle", true);
            interLine.filter(function(line) {return line.parent == d;}).attr("class", "highlightInterLine")
        })
        .on("mouseout", function(d)
        {
            d3.select(this).classed("highlightCircle", false);
            interLine.attr("class", "defaultInterLine");
        });

    var selectedDrug = d3.select("#drug-selection-value").text();
    if(selectedDrug != "")
    {
        self.drugCirclesGroup.selectAll("circle").each(
            function(d)
            {
                if(d._Drug__name == selectedDrug)
                {
                    d3.select(this).classed("selectCircle", true);
                    var new_x = circleScale(d._Drug__id);
                    self.updateSideEffects(d._Drug__id, new_x);
                }

            }
        );
    }


};

