function initHeatmap(heatmapWidth, heatmapHeigth) {
  //UI configuration

  var margin = {top:20,right:5,bottom:5,left:25},
  itemSize = heatmapHeigth/24,
  width = heatmapWidth,
  height = heatmapHeigth;

  var heatmapSvg = d3.select('#heatmap-block').append('svg');
  heatmap = heatmapSvg
    .attr('width',width)
    .attr('height',height)
  .append('g')
    .attr('width',width-margin.left-margin.right)
    .attr('height',height-margin.top-margin.bottom)
    .attr('transform','translate('+margin.left+','+margin.top+')');

    //axises and scales
    weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    var axisWidth = itemSize * 7 ,
      axisHeight = itemSize * 24,

      xAxisScale = d3.scale.linear()
        .range([0, axisWidth])
        .domain([0, 6]),
      xAxis = d3.svg.axis()
        .orient('top')
        .ticks(7)
        .scale(xAxisScale)
        .tickFormat(function (d) {return weekdays[d];}),
      yAxisScale = d3.scale.linear()
        .range([0,axisHeight])
        .domain([0,24]),
      yAxis = d3.svg.axis()
        .orient('left')
        .ticks(8)
        .tickFormat(d3.format('02d'))
        .scale(yAxisScale);
      //render axises
      heatmapSvg.append('g')
        .attr('transform','translate('+margin.left+','+margin.top+')')
        .attr('class','x axis')
        .call(xAxis)
      .append('text')
        .text('weekday')
        .attr('transform','translate('+(axisWidth+20)+',-10)');

      heatmapSvg.append('g')
        .attr('transform','translate('+margin.left+','+margin.top+')')
        .attr('class','y axis')
        .call(yAxis)
      .append('text')
        .text('time')
        .attr('transform','translate(-10,'+axisHeight+') rotate(-90)');

  return  heatmap;
}

function addHeatmap(data, heatmap) {
  var itemSize = heatmap.attr('height')/24,
    cellSize = itemSize-1

    var maxCount = getMaxCount(data);
    //render heatmap rects
    var rect = heatmap.selectAll('rect')
      .data(data)
    .enter().append('rect')
      .attr('width',cellSize)
      .attr('height',cellSize)
      .attr('x',function(d){
        return itemSize*d.key[1];
      })
      .attr('y',function(d){
        return d.key[0]*itemSize;
      })
      .attr('fill','#ffffff');

    setTitles(rect);
    renderColor(rect, maxCount);
}

function renderColor(rect, maxCount){
  var colorCalibration = ['#f6faaa','#FEE08B','#FDAE61','#F46D43','#D53E4F','#9E0142'];
  var colorIndex = d3.scale.quantize()
    .range([0,1,2,3,4,5])
    .domain(([0, maxCount]));

  rect
    .filter(function(d){
      return (d.value>=0);
    })
    .transition()
    .delay(function(d){
      return d.key[1]*15;
    })
    .duration(500)
    .attrTween('fill',function(d,i,a){
      return d3.interpolate(a,colorCalibration[colorIndex(d.value)]);
    });
}

function setTitles(rect) {
  rect.filter(function(d){ return d.value > 0;})
    .append('title')
    .text(function(d) {
      return weekdays[d.key[1]] + ' ' + d.key[0] + '.00:' + ' ' + d.value;
    });
}

function getMaxCount(data) {
  var maxCount = 0;
   data.forEach(function(d){
     maxCount = d3.max([d.value, maxCount]);
   });
  return maxCount
}

function updateMap(data, heatmap) {
  var rect = heatmap.selectAll('rect').data(data)
  setTitles(rect);
  renderColor(rect, getMaxCount(data));
}
