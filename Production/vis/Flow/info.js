function updateInfo(infoDiv, clusterId) {
  console.log(clusterId);
  if (topVenues) {
    infoDiv.selectAll('.venue').remove();

    var venues = infoDiv
        .selectAll('.venue')
        .data(topVenues[clusterId-1]['names']);

    var enterDiv = venues.enter()
        .append("div")
        .attr("class", "venue")

    enterDiv.append("div")
        .text(function(d) { return d });
    infoDiv.append('p').text('');
    }

    if (topCategories) {
      infoDiv.selectAll('.category').remove();

      var venues = infoDiv
          .selectAll('.category')
          .data(topCategories[clusterId-1]);

      var enterDiv = venues.enter()
          .append("div")
          .attr("class", "category")

      enterDiv.append("div")
          .text(function(d) { return d });
      }
}
