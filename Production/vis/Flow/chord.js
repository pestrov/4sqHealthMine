function initChord(chordWidth, chordHeigth) {

  var  outerRadius = Math.min(chordWidth, chordHeigth) / 2 - 10,
      innerRadius = outerRadius - 24;

      formatPercent = d3.format(".1%");

      arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  chordLayout = d3.layout.chord()
      .padding(.04)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

  chordPath = d3.svg.chord()
      .radius(innerRadius);
  chordSvg = d3.select("#chord-block").append("svg")
      .attr("width", chordWidth)
      .attr("height", chordHeigth)
    .append("g")
      .attr("id", "circle")
      .attr("transform", "translate(" + chordWidth * 0.5 + "," + chordHeigth * 0.5 + ")");

  chordSvg.append("circle")
      .attr("r", outerRadius);

  return chordSvg;
}

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

function addChord(transitionData, chordSvg) {
  // Compute the chord layout.
  matrix = transitionData['matrix'];
  categories = transitionData['categories'];
  categoryNames = transitionData['categoryNames'];
  categoriesColors = getCategoriesDict(categories);
  checkins = transitionData['checkins'];

  chordLayout.matrix(matrix);

  chordSvg.selectAll(".group").remove();
  // Add a group per neighborhood.
  var group = chordSvg.selectAll(".group")
      .data(chordLayout.groups)
      .enter()
      .append("g")
      .attr("class", "group")
      .on("mouseover", mouseover);

  // Add a mouseover title.
  group.append("title").text(function(d, i) {
    return categoryNames[categories[i].name] + ": " + formatPercent(d.value) + " of origins";
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
      .text(function(d, i) { return categoryNames[categories[i].name]; });

  // // Remove the labels that don't fit. :(
  groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
      .remove();

  chordSvg.selectAll(".chord").remove()

  // Add the chords.
  var chord = chordSvg.selectAll(".chord").data(chordLayout.chords)
      .enter()
      .append("path")
      .attr("class", "chord")
      .style("fill", function(d) { return categories[d.source.index].color; })
      .attr("d", chordPath)
      .on("mouseover", mouseoverChord);

  // Add an elaborate mouseover title for each chord.
  chord.append("title").text(function(d) {
    return categoryNames[categories[d.source.index].name]
        + " → " + categoryNames[categories[d.target.index].name]
        + ": " + formatPercent(d.source.value)
        + "\n" + categoryNames[categories[d.target.index].name]
        + " → " + categoryNames[categories[d.source.index].name]
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
