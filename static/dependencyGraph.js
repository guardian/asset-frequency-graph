(function () {
    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    function chordDiagram () {
        var data = RAW_DATA.matrix.chord,
        chart = d3.chart.dependencyWheel()
            .margin(300)
            .width(viewportWidth)
            .padding(0.02);
        d3.select('#chord')
            .datum(data)
            .call(chart);
    }

    function forceDiagram () {
        var data = RAW_DATA.matrix.force,
            width = viewportWidth,
            height = 600;

        var color = d3.scale.category20();

        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(30)
            .size([width, height]);

        var svg = d3.select("#force").append("svg")
            .attr("width", width)
            .attr("height", height);

        force
            .nodes(data.nodes)
            .links(data.links)
            .start();

        var link = svg.selectAll(".link")
            .data(data.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(data.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });
    }

    chordDiagram();
    forceDiagram();
})();
