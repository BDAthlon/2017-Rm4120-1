function GlyphFunctions(data, _id, metaIds, types, urls, totalIds) {

    var self = this;
    self.data = data;
    self.idMap = _id;
    self.metaIdMap = metaIds;
    self.typeMap = types;
    self.urlMaps = urls;

    self.totalIds = totalIds;

    self.glyphContains = [];
    self.isLoadedGlyph = false;

    for(var i = 0; i < totalIds; i++)
    {
        self.glyphContains.push(false);
    }

    self.init();

}

GlyphFunctions.prototype.init = function() {

    var self = this;

};


GlyphFunctions.prototype.add = function(gType) {
    var self = this;

    // Check to see if this promoter id exist
    if(!(gType in self.idMap))
    {
        return;
    }

    var glyphIndexes = self.idMap[gType];
    var glyphData = self.data;

    self.update(glyphIndexes);
};

GlyphFunctions.prototype.update = function(glyphIndex)
{
    var self = this;

    if(!self.isLoadedGlyph)
    {
        var urlList = [];
        glyphIndex.forEach(function(d)
        {
            urlList.push(self.urlMaps[d]);
        });

        // If the view is not loaded, load it.
        self.createCanvas(urlList);
    }
    else
    {
        // Else, change to updated view
    }
}


GlyphFunctions.prototype.createCanvas = function(idName) {
    var self = this;

    //var imageSection = document.getElementById("#glyph-image");
    console.log(idName)
    var img = d3.select("#glyph-image").selectAll("img").data(idName);
    img.exit().remove();

    img = img.enter().append("img").merge(img);
    img.attr("src", function(d) {return d;})
        .attr("alt", "Glyphs")
        .attr("height", 40)
        .attr("width", 40);

    //var newImage = new Image;
    console.log(this.urlMaps[idName]);
    //newImage.src =this.urlMaps[idName];
    // console.log(newImage.src);
    // imageSection.appendChild(newImage);
};
