function TreatmentsChart(treatments_data) {
    var self = this;
    self.treatments_data = treatments_data;
    self.treatmentsActive = false;
    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
TreatmentsChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 100};
    var treatChart = d3.select("#information-chart");

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = treatChart.node().getBoundingClientRect();
    self.svgWidth = 2*self.svgBounds.width/3 - self.margin.left - self.margin.right;
    self.svgHeight = 600 - self.margin.top - self.margin.bottom  ;



};


TreatmentsChart.prototype.createCanvas = function()
{
    var self = this;

    d3.select("#treatments-label").text("Drug Usage");

    //creates svg element within the div
    self.svg = d3.select("#treatments-chart").append("svg")
        .attr("width", 2*self.svgBounds.width/3)
        .attr("height",600)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")


    self.treatmentsActive = true;
};

TreatmentsChart.prototype.clearCanvas = function()
{
    var self = this;

    d3.select("#treatments-label").text("");

    //creates svg element within the div
    d3.select("#information-chart").selectAll("*").remove();
    self.treatmentsActive = false;
};


TreatmentsChart.prototype.clear = function()
{
    var self = this;
    if(self.treatmentsActive)
    {
        self.svg.selectAll("*").remove();
    }

}

TreatmentsChart.prototype.getDataTree = function(data)
{
    var treatChildren = [];
    var preventChildren = [];

    data._DrugTreatment__treat.forEach(function(name) { treatChildren.push({"name": name});});
    data._DrugTreatment__prevent.forEach(function(name) { preventChildren.push({"name": name});});

   var treatNode = {"name" : "Treatments",
                "children" : treatChildren};
    var preventNode = {"name" : "Preventions",
                "children" : preventChildren};

    return {"name" : "Selected Drug", "children": [treatNode, preventNode]};
}
// https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd
TreatmentsChart.prototype.drawTree = function( drugId ){

    var self = this;

    self.clear();

    if(!self.treatmentsActive)
    {
        self.createCanvas();
    }

    var data = self.treatments_data[drugId];
    var treeData = self.getDataTree(data);

    var treemap = d3.tree().size([self.svgHeight, self.svgWidth]);
    var root = d3.hierarchy(treeData, function(d) { return d.children; });

    var i = 0, duration = 750;
    root.x0 = self.svgHeight / 2;
    root.y0 = 0;
    root.children.forEach(collapse);

    update( root);


    function collapse(d) {
        if(d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }

   function update(source) {

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 180});

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = self.svg.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                return d._children ? "#0000e6" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { return d.data.name; });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("fill", function(d) {
                return d._children ? "#0000e6" : "#fff";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        var link = self.svg.selectAll('path.link')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                var o = {x: source.x, y: source.y}
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
         function diagonal(s, d) {

            path = "M" + s.y + "," +s.x +
                "C" +(s.y + d.y) / 2+"," +s.x+ " " +
                (s.y + d.y) / 2+"," +d.x + " "+
                d.y +"," + d.x;

            return path
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
}
