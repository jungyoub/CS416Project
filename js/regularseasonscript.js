var defaultData = {
  'Team': 'No Data',
  'FT%': 0,
  'HLD%': 0,
  'DRG%': 0,
  'FBN%': 0,
  'FB%': 0
};

var teamAnnotations = {
  'Dplus KIA': 'Korea\'s third seed. In terms of objective control, the team favored taking the Rift Herald in the early game.',
  'T1': 'T1 showed a slight regression during the summer season around an unfavorable meta, however as Korea\'s second seed, their aggression is apparent in their extremely high First Turret stat, as well as their strong Rift Herald control.',
  'Gen.G': 'Korea\'s first seed. A favorable meta and better team synergy led to a much stronger showing in the Summer as T1 regressed. Their high first turret stat, and their ability to aggressively get kills early led the team to a regional title.',
  'DRX': 'The last seed, and as seen in both Spring and Summer, a very middling performance compared to the other three.'
};

var svg1 = d3.select("#radar-chart-1 .chart").append("svg")
  .attr("width", 600)  
  .attr("height", 600 - 50)  
  .append("g")
  .attr("transform", "translate(" + 600 / 2 + "," + (600 - 50) / 2 + ")"); 

var svg2 = d3.select("#radar-chart-2 .chart").append("svg")
  .attr("width", 600)  
  .attr("height", 600 - 50)  
  .append("g")
  .attr("transform", "translate(" + 600 / 2 + "," + (600 - 50) / 2 + ")"); 



Promise.all([
  d3.csv("data/LCK 2022 Spring - Team Stats - OraclesElixir.csv"),
  d3.csv("data/LCK 2022 Summer - Team Stats - OraclesElixir.csv")
]).then(function(values) {
  var springData = processData(values[0], 'Spring');
  var summerData = processData(values[1], 'Summer');

  var allData = {
    'Spring': springData,
    'Summer': summerData
  };

  var select = d3.select("#team-select");
  var teams = ['Dplus KIA', 'T1', 'Gen.G'];
  select.selectAll("option")
    .data(teams)
    .enter()
    .append("option")
    .text(d => d);

  var initialTeam = teams[0];
  updateCharts(initialTeam, allData);

  select.on("change", function() {
    var team = this.value;
    updateCharts(team, allData);
  });

  d3.selectAll("#spring-checkbox, #summer-checkbox").on("change", function() {
    var team = select.node().value;
    updateCharts(team, allData);
  });
});

function processData(data, season) {
  var columns = ['Team', 'FT%', 'HLD%', 'DRG%', 'FBN%', 'FB%'];

  data.forEach(function(d) {
    columns.forEach(function(col) {
      if (col !== 'Team') {
        d[col] = parseFloat(d[col]) / 100;
      }
    });
    d['season'] = season;  
  });

  data = data.map(function(d) {
    var obj = {};
    columns.forEach(function(col) {
      obj[col] = d[col];
    });
    obj['season'] = d['season'];  
    return obj;
  });
  console.log(data);
  return data;
}

function calculateAnnotationPosition(datum, index) {
  var angleSlice = Math.PI * 2 / Object.keys(datum).length;
  var radius = 100; 
  var x = radius * Math.cos(angleSlice * index - Math.PI / 2);
  var y = radius * Math.sin(angleSlice * index - Math.PI);
  return {x, y};
}

function createAnnotation(svg, text, position, reverse=false) {
  var xOffset = reverse ? -120 : 120;
  var yOffset = 0;  

  
  let foreignObject = svg.append('foreignObject')
      .attr('x', position.x + xOffset) 
      .attr('y', position.y + yOffset) 
      .attr('width', 150)
      .attr('height', 100);
  
  
  let textDiv = foreignObject.append('xhtml:div')
      .attr('style', 'font-size:10px');
  
  textDiv.html(text);
  
  let line = svg.append("line")
      .attr("x1", position.x)
      .attr("y1", position.y)
      .attr("x2", position.x + xOffset) 
      .attr("y2", position.y + yOffset) 
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
  return {foreignObject, line};
}

function generateSpiderChart(svg, data, annotationText) {
  svg.selectAll("*").remove();

  if (data.length === 0) {
    data = [defaultData];
  }

  var filteredKeys = Object.keys(data[0]).filter(key => key !== 'Team' && key !== 'season');
  var angleSlice = Math.PI * 2 / filteredKeys.length;

  var width = 400,  
      height = 400,  
      radius = Math.min(width, height) / 2 - 60,
      levels = 5;

  var radarLine = d3.lineRadial()
      .radius(function(d) { return radius * d.value; })
      .angle(function(d,i) { return i*angleSlice; })
      .curve(d3.curveLinearClosed);

  var g = svg.selectAll(".axis")
      .data(filteredKeys)
      .enter().append("g");

  for (var i = 0; i < levels; i++) {
    var levelFactor = radius * ((i+1) / levels);

    g.selectAll(".lines")
      .data(Object.keys(data[0] || {}).filter(d => d !== 'season' && d !== 'Team'))  // filter out 'season' and 'Team' fields
      .enter()
      .append("line")
      .attr("x1", function(d, j){ return levelFactor * Math.cos(angleSlice*j - Math.PI/2); })
      .attr("y1", function(d, j){ return levelFactor * Math.sin(angleSlice*j - Math.PI/2); })
      .attr("x2", function(d, j){ return levelFactor * Math.cos(angleSlice*(j+1) - Math.PI/2); })
      .attr("y2", function(d, j){ return levelFactor * Math.sin(angleSlice*(j+1) - Math.PI/2); })
      .attr("class", "line")
      .style("stroke", "grey")
      .style("stroke-opacity", "0.75")
      .style("stroke-width", "0.3px");

    g.append("text")
      .attr("x", 5)
      .attr("y", -levelFactor + 5)
      .attr("font-size", "10px")
      .attr("fill", "grey")
      .text((i+1)*20 + "%");
  }

  g.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function(d, i){ return radius * Math.cos(angleSlice*i - Math.PI/2); })
    .attr("y2", function(d, i){ return radius * Math.sin(angleSlice*i - Math.PI/2); })
    .style("stroke", "grey")
    .style("stroke-width", "1px");

  if (data.length > 0) {
    data.forEach(function(datum, i) {
      var values = Object.values(datum).filter((_, idx) => idx !== 0 && idx !== 6);  // exclude 'Team' and 'season' values
      g.append("path")
        .attr("class", "line")
        .attr("d", radarLine(values.map(function(e, i) { return {value: e, order: i}; })))
        .style("stroke", function(d) { 
          if (datum.season === 'Spring') {
            return '#006400';  // dark green
          } else if (datum.season === 'Summer') {
            return '#FF8C00';  // dark orange
          }
        }) 
        .style("stroke-width", "2px")
        .style("fill", function(d) {
          if (datum.season === 'Spring') {
            return '#006400';  
          } else if (datum.season === 'Summer') {
            return '#FF8C00';  
          }
        }) 
        .style("fill-opacity", 0.1);
    });

    g.append("text")
        .attr("class", "legend")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i){ return (radius+40) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y", function(d, i){ return (radius+40) * Math.sin(angleSlice*i - Math.PI/2); })
        .text(function(d) { return d; });

    svg.selectAll(".polygon")
        .data(data)
        .enter().append("path")
        .attr("class", "polygon")
        .attr("d", function(d) { return radarLine(Object.values(d).filter((_, idx) => idx !== 0 && idx !== 6).map(function(e, i) { return {value: e, order: i}; })); })
        .style("fill", function(d) { return d.season === 'Spring' ? '#006400' : '#FF8C00'; }) // Use color depending on the season
        .style("fill-opacity", 0.1)
        .append("title") // Tooltip
        .text(function(d) { return d.Team; });

    // Create the annotation if an annotation text is provided
    if (annotationText) {
      var position = calculateAnnotationPosition(data[0], 0);
      createAnnotation(svg, annotationText, position, false);
    }
  }
}

function updateCharts(team, allData) {
  var checkedSeasons = [];
  if (d3.select("#spring-checkbox").property("checked")) {
    checkedSeasons.push('Spring');
  }
  if (d3.select("#summer-checkbox").property("checked")) {
    checkedSeasons.push('Summer');
  }

  var drxData = [];
  checkedSeasons.forEach(function(season) {
    var seasonData = allData[season].filter(d => d.Team === 'DRX');
    drxData.push(...seasonData);
  });

  var teamData = [];
  checkedSeasons.forEach(function(season) {
    var seasonData = allData[season].filter(d => d.Team === team);
    teamData.push(...seasonData);
  });

  // Get the annotation text for the selected team
  var annotationText = teamAnnotations[team];

  generateSpiderChart(svg1, drxData, teamAnnotations['DRX']);  // Always use the DRX annotation for the first chart
  generateSpiderChart(svg2, teamData, annotationText);  // Use the selected team's annotation for the second chart

  var radarChart2Title = document.getElementById("radar-chart-2-title");
  radarChart2Title.textContent = team;
}





