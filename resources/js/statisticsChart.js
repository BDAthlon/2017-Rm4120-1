function glyph_chart(statistics_data) {
    var self = this;
    self.statistics_data = statistics_data;
    self.statsActive = false;
    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
StatisticsChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 30, right: 10, bottom: 30, left: 10};
    var interChart = d3.select("#information-chart");

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = interChart.node().getBoundingClientRect();
    self.svgWidth = (self.svgBounds.width/3 - self.margin.left - self.margin.right);
    self.svgHeight = 200;


};



StatisticsChart.prototype.createCanvas = function()
{
    var self = this;

    d3.select("#statistics-label").text("Drug Statistics");

    //creates svg element within the div
    self.ageSvg = d3.select("#age-chart").append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
        .append("g")

    self.ageSvg.append("text")
        .attr("x", 0)
        .attr("dy", self.margin.top)
        .attr("class", "chartLabel");

    self.sexSvg = d3.select("#sex-chart").append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
        .append("g")

    self.sexSvg.append("text")
        .attr("x", 0)
        .attr("dy", self.margin.top)
        .attr("class", "chartLabel");

    self.weightSvg = d3.select("#weight-chart").append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
        .append("g")

    self.weightSvg.append("text")
        .attr("x", 0)
        .attr("dy", self.margin.top)
        .attr("class", "chartLabel");

    self.statsActive = true;
};

StatisticsChart.prototype.clearCanvas = function()
{
    var self = this;
    d3.select("#statistics-label").text("");
    //creates svg element within the div
    d3.select("#age-chart").selectAll("*").remove();
    d3.select("#sex-chart").selectAll("*").remove();
    d3.select("#weight-chart").selectAll("*").remove();

    self.statsActive = false;
};

StatisticsChart.prototype.histogram = function(svg, statsData, label)
{
    var self = this;
    var max_count = d3.max(statsData, function(d){return d.count;});
    var height = self.svgHeight-self.margin.bottom;

    var xScale = d3.scaleBand()
        .domain(statsData.map(function(d,i) { return d.label; }))
        .rangeRound([self.margin.left, self.svgWidth-self.margin.right])
        .padding(0.1)

    var yScale = d3.scaleLinear()
        .domain([0, max_count])
        .range([0, height-self.margin.top-5]);

    var xAxis = d3.axisBottom();
    xAxis.scale(xScale)


    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (self.svgHeight-self.margin.bottom)+ ")")
        .call(xAxis)
        .selectAll("text")
        .attr("class",  "axis");


    svg.select("text").text(label);

    var bars = svg.selectAll(".bars").data(statsData);
    var barsEnter = bars.enter().append("g").attr("class", "bars");
    barsEnter.append("rect");
    barsEnter.append("text");
    bars = barsEnter.merge(bars);

    bars.selectAll("rect")
        .attr("x", function (d, i) {return xScale(d.label);})
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("y",  height)
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("y",  function(d,i){return self.svgHeight-yScale(d.count)-self.margin.bottom;})
        .attr("height", function(d,i){return yScale(d.count);})

    bars.selectAll("text")
        .text(function(d) {return d.count == 0 ? "" : yScale(d.count) < 14.5 ? "" : d.count;})
        .attr("x", function(d) {return xScale(d.label)+xScale.bandwidth()/2;})
        .attr("y", height)
        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("dy", "0.75em")
        .attr("y", function(d,i){return self.svgHeight-yScale(d.count)-self.margin.bottom + 5;})
        .attr("text-anchor", "middle");
}

StatisticsChart.prototype.donut = function(svg, statsData, label)
{
    var self = this;

    var width = self.svgWidth,
        height = self.svgHeight,
        radius = Math.min(width, height) / 2;

    var pie = d3.pie()
        .sort(null)
        .value(function(d){return d.count;});

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius/2);


    svg.select("text").text(label);

    var g = svg
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var donuts =  g.selectAll(".donuts")
        .data(pie(statsData));

    var donutsEnter = donuts.enter().append("g").attr("class", "donuts");
    donutsEnter.append("path");
    donutsEnter.append("text");
    donuts = donutsEnter.merge(donuts);

    donuts.selectAll("path")
        .attr("class", function(d, i) { if(d.data.label == "male") return "maleDonut"; return "femaleDonut"; })
        .attr('d', arc)
        .transition()
        .duration(1000)
        .delay(function(d, i) { return i * 500; })
        .attrTween('d', function(d) {
            var i = d3.interpolate(d.startAngle, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    donuts.selectAll("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", "0.5em")
        .text(function(d) { if(d.data.label == "male") return '\u2642'; return '\u2640';});

}

StatisticsChart.prototype.clear = function(  ){
    var self = this;

    self.ageSvg.selectAll("g").remove();
    self.ageSvg.select("text").text("");
    self.weightSvg.selectAll("g").remove();
    self.weightSvg.select("text").text("");
    self.sexSvg.selectAll("g").remove();
    self.sexSvg.select("text").text("");
};



StatisticsChart.prototype.update = function( index ){
    var self = this;

    if(!self.statsActive)
    {
        self.createCanvas();
    }

    var data = self.statistics_data[index];

    self.clear();
    self.histogram(self.ageSvg, data._DrugStatistics__age, "Age");
    self.histogram(self.weightSvg, data._DrugStatistics__weight, "Weight");
    self.donut(self.sexSvg, data._DrugStatistics__sex, "Sex");

};
