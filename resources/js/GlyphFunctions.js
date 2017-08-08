function GlyphFunctions(data, _id, metaIds, types, urls, totalIds) {

    var self = this;
    self.data = data;
    self.idMap = _id;
    self.metaIdMap = metaIds;
    self.typeMap = types;
    self.urlMaps = urls;

    self.totalIds = totalIds;


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


GlyphFunctions.prototype.add = function(idName) {
    var self = this;
    console.log(idName);

    // Check to see if this promoter id exist
    if(!(idName in self.metaIdMap))
    {
        return;
    }

    var glyphIndex = idName;
    var glyphData = self.data;

    if(!self.glyphContains[glyphIndex])
    {
        self.glyphContains[glyphIndex] = true;
        self.update();
    }
};

GlyphFunctions.prototype.update = function()
{
    var self = this;

    // If the view is not loaded, load it. Else, change to updated view
    if(!self.isLoadedGlyph)
    {
        self.createCanvas();
    }
}


GlyphFunctions.prototype.createCanvas = function() {
    var self = this;

    d3.select("#section");

};
