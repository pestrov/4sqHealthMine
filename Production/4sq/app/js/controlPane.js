function addControls(controlDiv) {

  d3.json("http://urbandataflow.com/4sq/app/data/categoryNamesArray.json", function (error, categoryNames) {

    controlDiv.select("#categorySelector")
    .selectAll('option')
    .data(categoryNames)
    .enter()
    .append('option')
    .attr('value', function (d) {return d[0];})
    .text(function (d) {return d[1];});


  });

  d3.json("http://urbandataflow.com/4sq/app/data/clusterIds.json", function (error, clusterIds) {

    controlDiv.select("#clusterSelector")
    .selectAll('option')
    .data(clusterIds)
    .enter()
    .append('option')
    .attr('value', function (d) {return d;})
    .text(function (d) {return d;});
  });
}
