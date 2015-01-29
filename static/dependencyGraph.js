(function () {
    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    function chordDiagram () {
        var chart = d3.chart.dependencyWheel()
            .margin(300)
            .width(viewportWidth)
            .padding(0.02);
        d3.select('#chord')
            .datum(generateChordData(RAW_DATA.graph))
            .call(chart);
    }

    function forceDiagram () {
        var width = viewportWidth,
            height = 600;

        var color = d3.scale.category20();

        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(30)
            .size([width, height]);

        var svg = d3.select("#force").append("svg")
            .attr("width", width)
            .attr("height", height);

        var data = generateForceData(RAW_DATA.graph);

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

    function matrixOfDependencies (raw) {
        var matrix = new Matrix();

        Object.keys(raw).forEach(function (seed) {
            var parent = matrix.addAndGet(seed);
            matrix.markDependencies(parent, raw[seed].dependencies);
        });

        return matrix;
    }

    function generateChordData (raw) {
        var matrix = matrixOfDependencies(raw);

        console.log(matrix.toChordData());
        return matrix.toChordData();
    }

    function generateForceData (raw) {
        var matrix = matrixOfDependencies(raw);

        console.log(matrix.toForceData());
        return matrix.toForceData();
    }

    function Matrix () {
        this.names = [];
        this.rows = [];
    }
    Matrix.prototype.addAndGet = function (name) {
        var position = this.names.indexOf(name);
        if (position === -1) {
            this.names.push(name);
            position = this.names.length - 1;
            this.rows.push(new DependencyRow(position));
        }
        return this.rows[position];
    };
    Matrix.prototype.markDependencies = function (from, objectTo) {
        objectTo.forEach(function (to) {
            var dependant = this.addAndGet(to.name);
            from.mark(dependant);

            if (to.dependencies.length) {
                this.markDependencies(dependant, to.dependencies);
            }
        }, this);
    };
    Matrix.prototype.toChordData = function () {
        var length = this.names.length;
        return {
            packageNames: this.names.slice(0).map(function (file) {
                var shortName = file.indexOf('static/src/javascripts/');
                if (shortName === 0) {
                    file = file.substring(23);
                }
                return file;
            }),
            matrix: this.rows.map(function (row) {
                return row.toArray(length);
            })
        };
    };
    Matrix.prototype.toForceData = function () {
        var links = [];
        this.rows.forEach(function (row, source) {
            Object.keys(row.dependsOn).forEach(function (target) {
                links.push({
                    source: source,
                    target: Number(target),
                    value: 1
                });
            });
        });

        return {
            nodes: this.names.map(function (file) {
                var shortName = file.indexOf('static/src/javascripts/');
                if (shortName === 0) {
                    file = file.substring(23);
                }
                return {
                    name: file,
                    group: ['app', 'commercial', 'core'].indexOf(file) === -1 ? 0 : 1
                };
            }),
            links: links
        };
    };

    function DependencyRow (position) {
        this.position = position;
        this.dependsOn = {};
    }
    DependencyRow.prototype.mark = function (row) {
        this.dependsOn[row.position] = true;
    };
    DependencyRow.prototype.toArray = function (length) {
        var array = [];
        for (var i = 0; i < length; i += 1) {
            if (this.dependsOn[i]) {
                array.push(1);
            } else {
                array.push(0);
            }
        }
        return array;
    };



    chordDiagram();
    forceDiagram();
})();