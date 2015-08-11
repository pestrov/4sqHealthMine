function addControls(controlDiv) {

  d3.json("http://128.199.62.25/static/Habidatum/Flow/categoryNamesArray.json", function (error, categoryNames) {

    controlDiv.append("select")
    .attr('id', 'categorySelector')
    .selectAll('option')
    .data(categoryNames)
    .enter()
    .append('option')
    .attr('value', function (d) {return d[0];})
    .text(function (d) {return d[1];});


  });

  d3.json("http://128.199.62.25/static/Habidatum/Flow/clusterIds.json", function (error, clusterIds) {

    controlDiv.append("select")
    .attr('id', 'clusterSelector')
    .selectAll('option')
    .data(clusterIds)
    .enter()
    .append('option')
    .attr('value', function (d) {return d;})
    .text(function (d) {return d;});
  });
}
