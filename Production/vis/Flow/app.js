(function(){
  var chordBox = d3.select("#chord-block").node().getBoundingClientRect();
  var mapBox = d3.select("#map-block").node().getBoundingClientRect();
  var heatmapBox = d3.select("#heatmap-block").node().getBoundingClientRect();

  chordSvg = initChord(chordBox.width, chordBox.height)
  addMap(mapBox.width, mapBox.height);
  heatmapComps = initHeatmap(heatmapBox.width, heatmapBox.height);

  var initialQuery = getQueryParams(document.location.search);
  recentOnly = initialQuery.recentOnly;
  var serverPath = "http://128.199.62.25/getTransitionData"
  var newQuery = serverPath.concat("?clusterId=").concat(initialQuery.clusterId)
                  .concat("&category=").concat(initialQuery.category)
                  .concat("&debug=").concat(initialQuery.debug);
  d3.json(newQuery , function(error, transitionData) {
      console.log(error);
      addChord(transitionData, chordSvg)
  });

  d3.json("http://128.199.62.25/static/Habidatum/Flow/testTime.json", function (error, timeSeriesData) {
    addHeatmap(timeSeriesData, heatmapComps[0], heatmapComps[1]);
  });

})();


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
