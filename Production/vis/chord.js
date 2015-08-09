(function(){
  var chordToMapRatio = 2.0/5.0;
  var width = window.innerWidth
                      || document.documentElement.clientWidth
                      || document.body.clientWidth;

  var height = window.innerHeight
                      || document.documentElement.clientHeight
                      || document.body.clientHeight;

  var chordBox = d3.select("#chord-block").node().getBoundingClientRect();
  var mapBox = d3.select("#map-block").node().getBoundingClientRect();

  chordWidth = chordBox.width;
  chordHeigth = chordBox.height;

  north = 55.96
  south = 55.49
  east = 37.97
  west = 37.32
  regionRect = [west, east, south, north];

  var  outerRadius = Math.min(chordWidth, chordHeigth) / 2 - 10,
      innerRadius = outerRadius - 24;

  var formatPercent = d3.format(".1%");

  var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var layout = d3.layout.chord()
      .padding(.04)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

  var path = d3.svg.chord()
      .radius(innerRadius);
  chordSvg = d3.select("#chord-block").append("svg")
      .attr("width", chordWidth)
      .attr("height", chordHeigth)
    .append("g")
      .attr("id", "circle")
      .attr("transform", "translate(" + chordWidth * 0.5 + "," + chordHeigth * 0.5 + ")");

  chordSvg.append("circle")
      .attr("r", outerRadius);

  addMap(mapBox.width, mapBox.height);

  var initialQuery = getQueryParams(document.location.search);
  recentOnly = initialQuery.recentOnly;
  var serverPath = "http://128.199.62.25/getTransitionData"
  var newQuery = serverPath.concat("?clusterId=").concat(initialQuery.clusterId)
                  .concat("&category=").concat(initialQuery.category)
                  .concat("&debug=").concat(initialQuery.debug);


    d3.json(newQuery , function(error, transitionData) {
      addChord(transitionData)
    });

  function getCategoriesDict(categories) {
    categoriesColors = {};
    var catIndex = 0
    while (catIndex < categories.length) {
      var category = categories[catIndex];
      categoriesColors[category['name']] = category['color'];
      catIndex++;
    }
    return categoriesColors;
  }

  function addChord(transitionData) {
    // Compute the chord layout.
    matrix = transitionData['matrix'];
    categories = transitionData['categories'];
    categoriesColors = getCategoriesDict(categories);
    checkins = transitionData['checkins'];
    layout.matrix(matrix);

    // Add a group per neighborhood.
    var group = chordSvg.selectAll(".group")
        .data(layout.groups)
        .enter().append("g")
        .attr("class", "group")
        .on("mouseover", mouseover);

    // Add a mouseover title.
    group.append("title").text(function(d, i) {
      return categories[i].name + ": " + formatPercent(d.value) + " of origins";
    });

    // Add the group arc.
    var groupPath = group.append("path")
        .attr("id", function(d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function(d, i) { return categories[i].color; })
        .style("stroke", "none");

    // Add a text label.
    var groupText = group.append("text")
        .attr("x", 6)
        .attr("dy", 15);

    groupText.append("textPath")
        .attr("xlink:href", function(d, i) { return "#group" + i; })
        .text(function(d, i) { return categories[i].name; });

    // // Remove the labels that don't fit. :(
    groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
        .remove();

    // Add the chords.
    var chord = chordSvg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) { return categories[d.source.index].color; })
        .attr("d", path)
        .on("mouseover", mouseoverChord);

    // Add an elaborate mouseover title for each chord.
    chord.append("title").text(function(d) {
      return categories[d.source.index].name
          + " → " + categories[d.target.index].name
          + ": " + formatPercent(d.source.value)
          + "\n" + categories[d.target.index].name
          + " → " + categories[d.source.index].name
          + ": " + formatPercent(d.target.value);
    });

    function mouseover(d, i) {
      addLines(checkins[categories[i].name], "", i);
      chord.classed("fade", function(p) {
        return p.source.index != i
            && p.target.index != i;
      });
    }

    function mouseoverChord(d, i) {
      addLines(checkins[categories[d.source.index].name], categories[d.target.index].name, d.source.index);
    }
  }

  function addMap(mapWidth, mapHeigth) {
    projection = d3.geo.mercator()
    .rotate([-10.7,4.2,-6.3])
    .center([38.7, 55.85])
    .scale(42000)
    .translate([mapWidth, mapHeigth / 2]);

    var path = d3.geo.path()
    .projection(projection);

    d3.json("mo1.geojson", function(error, moscow) {
            if (error) return console.error(error);
            mapSvg = d3.select("#map-block").append("svg")
            .attr("width", mapWidth)
            .attr("height", mapHeigth);
            regionsGroup = mapSvg.append("g");

            regionsGroup
            .selectAll("path")
            .data(moscow.features)
            .enter().append("path")
            .attr("class", "region")
            .attr("d", path);

            linesGroup = mapSvg.append("g");
            });
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

    var idFunction = function(point, index) { return point[0]['id'][0].concat(point[0]['id'][1]).concat(index); }
    var lines = linesGroup.selectAll("line").data(moscowData, idFunction);

      lines
      .enter()
      .append("line")
      .style("stroke", "black")
      .style("opacity", 0.0)
      .style("vector-effect","non-scaling-stroke")
      .attr("stroke-width", 1.5)
      .attr("x1", function(d) {return projection(dataLatLon(d, 0))[0]})
      .attr("y1", function(d) {return projection(dataLatLon(d, 0))[1]})
      .attr("x2", function(d) {return projection(dataLatLon(d, 1))[0]})
      .attr("y2", function(d) {return projection(dataLatLon(d, 1))[1]})
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
      return "translate(" + projection(dataLatLon(d, 0)) + ")"; })
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
      return "translate(" + projection(dataLatLon(d, 1)) + ")"; })
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
  function getQueryParams(qs) {
      qs = qs.split('+').join(' ');

      var params = {},
          tokens,
          re = /[?&]?([^=]+)=([^&]*)/g;

      while (tokens = re.exec(qs)) {
          params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
      }

      return params;
  }

  addZoom = function() {

    zoom = d3.behavior.zoom()
        .on("zoom",function() {
          regionsGroup.attr("transform","translate("+
                d3.event.translate.join(",")+")scale("+d3.event.scale+")");
          regionsGroup.selectAll("path")
              .attr("d", path.projection(projection));

            });

    mapSvg.call(zoom)
  }

})();
