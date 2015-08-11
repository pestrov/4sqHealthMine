(function(){
  var chordBox = d3.select("#chord-block").node().getBoundingClientRect();
  var mapBox = d3.select("#map-block").node().getBoundingClientRect();
  var heatmapBox = d3.select("#heatmap-block").node().getBoundingClientRect();
  var controlDiv = d3.select("#controls-block");

  chordSvg = initChord(chordBox.width, chordBox.height)
  addMap(mapBox.width, mapBox.height);
  heatmap = initHeatmap(heatmapBox.width, heatmapBox.height);

  var initialQuery = getQueryParams(document.location.search);
  recentOnly = initialQuery.recentOnly;
  var defaultClusterId = 1;
  addControls(controlDiv)

  d3.json(queryForParams(defaultClusterId, "4bf58dd8d48988d163941735") , function(error, transitionData) {
      console.log(error);
      addChord(transitionData, chordSvg)
  });

  d3.json("http://128.199.62.25/static/Habidatum/checkinsHeat/checkinsHeat".concat(defaultClusterId).concat(".json"), function (error, timeSeriesData) {
    addHeatmap(timeSeriesData, heatmap);
  });

})();

function updateData() {
  var categorySelector = document.getElementById("categorySelector");
  var clusterSelector = document.getElementById("clusterSelector");

  var selectedCategory = categorySelector.options[categorySelector.selectedIndex].value;
  var selectedClusterId = clusterSelector.options[clusterSelector.selectedIndex].value;
  d3.json(queryForParams(selectedClusterId, selectedCategory) , function(error, transitionData) {
      if (error) {
        console.log(error);
      }
      addChord(transitionData, chordSvg)
  });

  d3.json("http://128.199.62.25/static/Habidatum/checkinsHeat/checkinsHeat".concat(selectedClusterId).concat(".json"), function (error, timeSeriesData) {
    updateMap(timeSeriesData, heatmap);
  });

}
function queryForParams(clusterId, categoryId) {
  var serverPath = "http://128.199.62.25/getTransitionData"
  var newQuery = serverPath.concat("?clusterId=").concat(clusterId)
                  .concat("&category=").concat(categoryId)
                  .concat("&debug=").concat(0);
  return newQuery;
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
