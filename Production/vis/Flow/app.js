(function(){
  var chordBox = d3.select("#chord-block").node().getBoundingClientRect();
  var mapBox = d3.select("#map-block").node().getBoundingClientRect();

  chordSvg = initChord(chordBox.width, chordBox.height)
  mapSvg = addMap(mapBox.width, mapBox.height);

  var initialQuery = getQueryParams(document.location.search);
  recentOnly = initialQuery.recentOnly;
  var serverPath = "http://128.199.62.25/getTransitionData"
  var newQuery = serverPath.concat("?clusterId=").concat(initialQuery.clusterId)
                  .concat("&category=").concat(initialQuery.category)
                  .concat("&debug=").concat(initialQuery.debug);

  d3.json(newQuery , function(error, transitionData) {
      addChord(transitionData, chordSvg)
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
