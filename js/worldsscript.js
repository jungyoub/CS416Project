// Load the data
d3.csv("data/Worlds 2022 Main Event - Player Stats - OraclesElixir.csv").then(data => {
    data = data.filter(d => ['DRX', 'EDward Gaming', 'Gen.G', 'T1'].includes(d.Team));  // Filter for EDG, Gen.G, and T1
    
    data.forEach(d => {
        d['GOLD%'] = +d['GOLD%'].replace('%', '');
        d['DMG%'] = +d['DMG%'].replace('%', '');
    });

    // Prepare a dictionary with team descriptions
    const teamDescriptions = {
        'EDward Gaming': 'DRXs quarterfinal match, and China\'s second seed. Standout performances came from their star Mid, Scout. DRX managed to win by neutralizing any ability the EDG\'s midlaner had to impact the map.',
        'Gen.G': 'Gen.G, the first seed from the LCK, was DRXs Semifinal match. Although standout performances came from their ADC, Ruler, the meta had started to shift away from dominant ADC performances, and with Gen.G\'s inability to adapt to the meta, DRX managed to take the Semi-final win.',
        'T1': 'T1, DRXs final match, and the second seed from the LCK. T1 had monster performances from nearly all positions and looked poised to win it all. Unfortunately, a poor pick and ban phase led to T1\'s defeat as DRX managed to obtain strong power picks.',
        'Initial': 'Assessing a player\'s efficiency in using their gold can provide valuable insights into their performance. To achieve this, we compare the amount of gold a player has with the damage they\'re able to inflict using that gold. Although this metric isn\'t flawless (since certain roles or champions can skew the results), it serves as a useful tool for evaluating player performance. For instance, consider the case of DRX\'s midlaner, who predominantly played assassin champions. These champions are designed to focus their damage on specific key targets, rather than dealing widespread damage. Consequently, their damage output may seem lower when viewed through this broad lens. However, this doesn\'t imply inefficiency; it\'s merely reflective of their role\'s strategic focus. This comparison, however, also sheds light on the strength of DRX\'s opponents. By examining both gold and damage metrics, we can understand not only individual player efficiency, but also the competitiveness of the teams they faced."'
    };

    // Prepare the teams dropdown
    const teams = [...new Set(data.map(d => d.Team))].filter(team => team !== 'DRX');
    const select = d3.select("#teams");
    select.selectAll("option")
        .data(teams)
        .enter()
        .append("option")
        .text(d => d);
    
    d3.select("#description").text(teamDescriptions['Initial']);

    function generatePieChart(container, data, valueField, title) {
        const svg = d3.select(container).append("svg").attr("width", 250).attr("height", 250);
        const g = svg.append("g").attr("transform", "translate(125, 125)");  
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const pie = d3.pie().sort(null); 
        const arc = d3.arc().innerRadius(0).outerRadius(100);  
        
        // Generate the chart
        const paths = g.selectAll("path")
            .data(pie(data.map(d => d.value)))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i));
    
        // Add labels
        const labels = g.selectAll("text")
            .data(pie(data.map(d => d.value)))
            .enter()
            .append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", "0.35em")
            .text(function(d,i) { return data[i].position + ": " + d.data.toFixed(1) + "%"; })
            .style("text-anchor", "middle")
            .style("font-size", 10);
    
        // Add title
        svg.append("text")
            .attr("x", 125)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text(title);
    }
        


    function generateChartsForTeam(team, container) {
        const teamData = data.filter(d => d.Team === team);
        const positions = ['Top', 'Jungle', 'Middle', 'ADC', 'Support'];  
    
        // Prepare data for the charts
        const goldData = positions.map(pos => {
            const playerData = teamData.find(d => d.Pos === pos);
            return {
                position: pos,
                value: playerData ? playerData['GOLD%'] : 0
            };
        });

        const dmgData = positions.map(pos => {
            const playerData = teamData.find(d => d.Pos === pos);
            return {
                position: pos,
                value: playerData ? playerData['DMG%'] : 0
            };
        });

        generatePieChart(container, goldData, 'GOLD%', `${team} - Gold Share`);
        generatePieChart(container, dmgData, 'DMG%', `${team} - Damage Share`);
    }

    generateChartsForTeam('DRX', "#charts");
    generateChartsForTeam(teams[0], "#charts");

    // Update charts when a different team is selected
    select.on("change", function() {
        // Clear the old charts
        d3.select("#charts").html("");
        // Generate new charts
        generateChartsForTeam('DRX', "#charts");
        generateChartsForTeam(select.node().value, "#charts");

        // Update the description paragraph
        d3.select("#description").text(teamDescriptions[select.node().value]);
    });
})
