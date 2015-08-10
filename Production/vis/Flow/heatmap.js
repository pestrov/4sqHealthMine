function initHeatmap(heatmapWidth, heatmapHeigth) {
  //UI configuration

  var margin = {top:20,right:5,bottom:5,left:25},
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

  return [heatmapSvg, heatmap];
}

function addHeatmap(data,heatmapSvg, heatmap) {
  var itemSize = heatmap.attr('height')/24,
    cellSize = itemSize-1,
    margin = {top:20,right:5,bottom:5,left:25};

  //formats
  var hourFormat = d3.time.format('%H'),
    dayFormat = d3.time.format('%j'),
    timeFormat = d3.time.format('%Y-%m-%dT%X'),
    monthDayFormat = d3.time.format('%m.%d');

  //data vars for rendering
  var dateExtent = null,
    dayOffset = 0,
    colorCalibration = ['#f6faaa','#FEE08B','#FDAE61','#F46D43','#D53E4F','#9E0142']

  //axises and scales
  var weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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


   rect = null;
   maxCount = 0;
    data = data.data;
    data.forEach(function(valueObj){
      valueObj['date'] = timeFormat.parse(valueObj['timestamp']);
      var day = valueObj['day'] = monthDayFormat(valueObj['date']);

      var count = valueObj['value']['PM2.5'];
      maxCount = d3.max([count, maxCount]);
    });
    dateExtent = d3.extent(data,function(d){
      return d.date;
    });

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

    //render heatmap rects
    dayOffset = dayFormat(dateExtent[0]);
    rect = heatmap.selectAll('rect')
      .data(data)
    .enter().append('rect')
      .attr('width',cellSize)
      .attr('height',cellSize)
      .attr('x',function(d){
        return itemSize*(dayFormat(d.date)-dayOffset);
      })
      .attr('y',function(d){
        return hourFormat(d.date)*itemSize;
      })
      .attr('fill','#ffffff');

    rect.filter(function(d){ return d.value['PM2.5']>0;})
      .append('title')
      .text(function(d){
        return monthDayFormat(d.date)+' '+d.value['PM2.5'];
      });

    renderColor();
    function renderColor(){
      rect
        .filter(function(d){
          return (d.value['PM2.5']>=0);
        })
        .transition()
        .delay(function(d){
          return (dayFormat(d.date)-dayOffset)*15;
        })
        .duration(500)
        .attrTween('fill',function(d,i,a){
          //choose color dynamicly
          var colorIndex = d3.scale.quantize()
            .range([0,1,2,3,4,5])
            .domain(([0, maxCount]));

          return d3.interpolate(a,colorCalibration[colorIndex(d.value['PM2.5'])]);
        });
    }

}
