let championsData;
let selectedYear;

let yearTexts = {
    2022: {
        1: "In 2022, Yuumi stood out due to her oppressive healing and laning prowess, racking up a startling 68% ban rate.",
        2: "Caitlyn also stood out due to her oppressive range, allowing her to generate strong leads early. Her late game was also incredible, with only a slight drop in strength around the middle game.",
    }
}

let margin = {top: 20, right: 200, bottom: 100, left: 50}, 
    width = 800 - margin.left - margin.right, 
    height = 475 - margin.top - margin.bottom;
  
  d3.csv("data/champions_stats.csv").then(function(data) {
      championsData = data;
  
      let seasons = [...new Set(championsData.map(d => +d.season))].sort((a, b) => b - a);
  
      d3.select("#yearDropdown")
          .selectAll("option")
          .data(seasons)
          .enter()
          .append("option")
          .text(d => d + 2010);
  
      selectedYear = seasons[0];
      selectedYear = 2022 - 2010;
  
      updateChart();
  
      let dynamicText = yearTexts[2022]; 
      d3.select("#dynamicText").text(dynamicText);
  
      updateChart();
  });
  
  function updateChart() {
    d3.select("#chart svg").remove();

    let filteredData = championsData.filter(d => +d.season === selectedYear);

    // Sort by total pick/ban count and take top 10
    filteredData.sort((a, b) => (b.banned_games + b.played_games) - (a.banned_games + a.played_games));
    filteredData = filteredData.slice(0, 10);

    let svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create scales
    let xScale = d3.scaleBand()
        .domain(filteredData.map(d => d.champion))
        .range([0, width])
        .padding(0.1);
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => Math.max(d.banned_games, d.played_games))])
        .range([height, 0]);

    let xAxis = d3.axisBottom(xScale).tickSize(0);
    let yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .call(yAxis);

        let banBars = svg.selectAll(".ban-bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "ban-bar")
        .attr("x", d => xScale(d.champion))
        .attr("y", d => yScale(d.banned_games))
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", d => height - yScale(d.banned_games))
        .attr("fill", "red")
        .attr("id", (d, i) => "ban-bar-" + i); 
    
    
    banBars.append("title") 
        .text(d => "Champion: " + d.champion + "\n" + "Picked: " + d.played_games + "%" + "\n" + "Banned: " + d.banned_games + "%"); // The tooltip text
    
    let playBars = svg.selectAll(".play-bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "play-bar")
        .attr("x", d => xScale(d.champion) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.played_games))
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", d => height - yScale(d.played_games))
        .attr("fill", "blue")
        .attr("id", (d, i) => "play-bar-" + i);
    
   
    playBars.append("title") 
        .text(d => "Champion: " + d.champion + "\n" + "Picked: " + d.played_games + "%" + "\n" + "Banned: " + d.banned_games + "%"); // The tooltip text

   
    svg.selectAll(".play-bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "play-bar")
        .attr("x", d => xScale(d.champion) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.played_games))
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", d => height - yScale(d.played_games))
        .attr("fill", "blue");

    svg.append("text")             
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height + margin.top + 50) + ")")  
        .style("text-anchor", "middle")
        .text("Champion");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Pick/Ban Percentage");

        let dynamicText = yearTexts[selectedYear + 2010][1];
        let dynamicText2 = yearTexts[selectedYear + 2010][2];

        let createAnnotation = (svg, text, championBarSelector, textPosition, lineEndPosition) => {
            let foreignObject = svg.append('foreignObject')
                .attr('x', textPosition.x)
                .attr('y', textPosition.y)
                .attr('width', 150)
                .attr('height', 100);
        
            let textDiv = foreignObject.append('xhtml:div')
                .attr('style', 'font-size:10px');
        
            textDiv.html(text);
        
            let championBar = svg.select(championBarSelector);
            svg.append("line")
                .attr("x1", lineEndPosition.x)
                .attr("y1", lineEndPosition.y)
                .attr("x2", +championBar.attr("x") + +championBar.attr("width") / 2)
                .attr("y2", championBar.attr("y"))
                .attr("stroke", "black")
                .attr("stroke-width", 1);
    };
    createAnnotation(svg, dynamicText, "#ban-bar-0", { x: width - 45, y: 10 }, { x: width - 50, y: 50 }); 
createAnnotation(svg, dynamicText2, "#ban-bar-1", { x: width - 47, y: 110 }, { x: width - 50, y: 150 }); 
}

