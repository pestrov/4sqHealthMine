(function(){
  north = 55.96
  south = 55.49
  east = 37.97
  west = 37.32
  regionRect = [west, east, south, north];

})();

function addMap(mapWidth, mapHeigth) {

 var map = new google.maps.Map(d3.select("#map-block").node(), {
    zoom: 10,
    center: new google.maps.LatLng(55.7517, 37.6178),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  addOverlay(mapWidth, mapHeigth, map);
}

function addOverlay(mapWidth, mapHeigth, map) {

  overlay = new google.maps.OverlayView();

   overlay.onAdd = function() {
      mapSvg = d3.select(this.getPanes().overlayLayer)
      .append("div")
      .append("svg")
      .attr("width", mapWidth)
      .attr("height", mapHeigth);

      linesGroup = mapSvg.append("g");
      projection = this.getProjection();
    };

  overlay.draw = redraw;
  overlay.setMap(map);
}

function redraw() {
    // var marker = layer.selectAll("svg")
    //     .data(moscowData, idFunction)
    //     .each(transform) // update existing markers
    //   .enter().append("svg:svg")
    //     .each(transform)
    //     .attr("class", "marker");
    console.log(transformLatLng()[37.6, 58.5]));

}

function transformLatLng(d) {
  d = new google.maps.LatLng(d[1], d[0]);
  d = projection.fromLatLngToDivPixel(d);
  return [d.x, d.y];
}

addLines = function (linesData, targetCategoryName, index) {
//Moscow only
  moscowData = linesData.filter(function (d) {
     return pathInRect(d, regionRect)
   });

//Category pairs only checkins
   if (targetCategoryName.length) {
     moscowData = moscowData.filter(function (d) {
        return d[0]['cat'][1] == targetCategoryName;
      });
   }

   if (recentOnly) {
     moscowData = moscowData.filter(function (d) {
        return d[1] <= 360;
      });
   }

  var idFunction = function(point, index) {
    return point[0]['id'][0].concat(point[0]['id'][1]).concat(index); }
  var lines = linesGroup.selectAll("line").data(moscowData, idFunction);

    lines
    .enter()
    .append("line")
    .style("stroke", "black")
    .style("opacity", 0.0)
    .style("vector-effect","non-scaling-stroke")
    .attr("stroke-width", 1.5)
    .attr("x1", function(d) {return transformLatLng(dataLatLon(d, 0))[0]})
    .attr("y1", function(d) {return transformLatLng(dataLatLon(d, 0))[1]})
    .attr("x2", function(d) {return transformLatLng(dataLatLon(d, 1))[0]})
    .attr("y2", function(d) {return transformLatLng(dataLatLon(d, 1))[1]})
    .transition()
    .duration(400)
    .style("opacity", function(d) { return (360.0-d[1])/360.0;});

    lines.append("title").text(function(d, i) { return d[1].toString().concat(' min');});

    fadeElements(lines);

  var sourceVenueIdFunction = function(point) { return point[0]['id'][0]; }
  var destVenueIdFunction = function(point) { return point[0]['id'][1]; }
  var sourceVenues = linesGroup.selectAll(".sourceVenue").data(moscowData, sourceVenueIdFunction);

  sourceVenuesColor = categories[index].color;

  fadeElements(sourceVenues);
  //Add venues
  sourceVenues
  .enter()
  .append("circle")
  .attr("transform", function(d) {
    return "translate(" + transformLatLng(dataLatLon(d, 0)) + ")"; })
  .attr("r", 5)
  .attr("class","sourceVenue")
  .style("opacity", 0.0)
  .style("fill", sourceVenuesColor)
  .transition()
  .duration(400)
  .style("opacity", 1.0)

  sourceVenues.append("title").text(function(d, i) { return d[0]["name"][0];});

  var destVenues = linesGroup.selectAll(".destVenue").data(moscowData, destVenueIdFunction);

  fadeElements(destVenues);
  //Add venues
  destVenues
  .enter()
  .append("circle")
  .attr("transform", function(d) {
    return "translate(" + transformLatLng(dataLatLon(d, 1)) + ")"; })
  .attr("r", 5)
  .attr("class","destVenue")
  .style("opacity", 0.0)
  .style("fill", function(d) { return categoriesColors[d[0].cat[1]];})
  .transition()
  .duration(400)
  .style("opacity", 0.8)

  destVenues.append("title").text(function(d, i) { return d[0]["name"][1];});

}

function fadeElements(elements) {
  elements
  .exit()
  // .transition()
  // .duration(200)
  // .style("opacity", 0)
  .remove();
}

//Helper functions
function dataLatLon(d, index) {
  return [d[0]['loc'][index][1], d[0]['loc'][index][0]];
}

function dataPathLength(d) {
  var firstPair = dataLatLon(d, 0);
  var secondPair = dataLatLon(d, 1);
  return Math.sqrt(Math.pow(firstPair[0]-secondPair[0], 2) + Math.pow(firstPair[1]-secondPair[1], 2))
}

function pathInRect(d, rect) {
  var firstPair = dataLatLon(d, 0);
  var secondPair = dataLatLon(d, 1);
  if ((rect[0] <= firstPair[0]) && (firstPair[0] <= rect[1]) &&
       (rect[2] <= firstPair[1]) && (firstPair[1] <= rect[3])) {
         if ((rect[0] <= secondPair[0]) && (secondPair[0] <= rect[1]) &&
              (rect[2] <= secondPair[1]) && (secondPair[1] <= rect[3])) {
                return true;
         }
  }
  return false;
}
