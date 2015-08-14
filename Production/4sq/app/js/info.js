function updateInfo(infoDiv, clusterId) {
  switchToTopVenues(infoDiv, clusterId);
}

function setupInfoTabs() {
  document.getElementById("venuesTab").addEventListener('click', function (e) {
    switchToTopVenues(infoDiv, currentClusterId);
 });
 document.getElementById("categoriesTab").addEventListener('click', function (e) {
   switchToTopCategories(infoDiv, currentClusterId);
});
}

function switchToTopVenues(infoDiv, clusterId) {

  infoDiv.selectAll('.category')
  .remove();

  if (topVenues) {
    infoDiv.selectAll('.venue').remove();

    var venues = infoDiv
        .selectAll('.venue')
        .data(topVenues[clusterId-1]['names']);

    var enterDiv = venues.enter()
        .append("div")
        .attr("class", "venue")
        .style('margin-left', "5px");

    enterDiv.append("div")
        .text(function(d) { return d });
    }
}

function switchToTopCategories(infoDiv, clusterId) {

  infoDiv.selectAll('.venue')
  .remove();

  if (topCategories) {
    infoDiv.selectAll('.category').remove();

    var venues = infoDiv
        .selectAll('.category')
        .data(topCategories[clusterId-1]);

    var enterDiv = venues.enter()
        .append("div")
        .attr("class", "category")
        .style('margin-left', "5px");

    enterDiv.append("div")
        .text(function(d) { return d });
    }
}
