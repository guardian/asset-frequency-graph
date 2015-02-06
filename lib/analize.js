var Promise = require('es6-promise').Promise;

module.exports = function (config) {
    var filesUtil = require('./files')(config);

    function pad (number) {
        return (number < 10 ? '0' : '') + number;
    }

    var total = {
        'Pull requests analyzed': 0,
        'Pull requests touching static': 0,
        'First Pull Request touching static': null,
        merges: [],
        files: {},
        packages: {},
        graph: null,
        matrix: {
            chord: null,
            force: null
        },
        history: {
            files: {},
            packages: {}
        }
    };

    function onMerge (dependencies, stat, merge, files) {
        total['Pull requests analyzed'] += 1;

        merge.files = files;
        merge.isStatic = filesUtil.isInteresting(files);
        if (merge.isStatic) {
            total.merges.push(merge);
            total['Pull requests touching static'] += 1;
            // Because they are sorted from the most recent
            total['First Pull Request touching static'] = merge;

            var touchedPackages = {};
            merge.files.forEach(function (file) {
                if (filesUtil.isStaticFile(file)) {
                    if (!total.files[file]) {
                        total.files[file] = {
                            times: 0,
                            merges: [],
                            packages: (dependencies[file] || {}).seeds || [],
                            content: stat[file].content,
                            size: stat[file].size,
                            gzip: stat[file].gzip
                        };
                    }
                    total.files[file].times += 1;
                    total.files[file].merges.push(merge);

                    if (dependencies[file]) {
                        dependencies[file].seeds.forEach(function (seed) {
                            touchedPackages[seed] = true;
                        });
                    }

                    if (!total.history.files[file]) {
                        total.history.files[file] = {};
                    }
                    var date = new Date(Number(merge.timestamp) * 1000),
                        dateString = [
                            date.getFullYear(),
                            pad(date.getMonth() + 1),
                            pad(date.getDate())
                        ].join('-');
                    if (!total.history.files[file][dateString]) {
                        total.history.files[file][dateString] = 0;
                    }
                    total.history.files[file][dateString] += 1;
                }
            });

            Object.keys(touchedPackages).forEach(function (pack) {
                if (!total.packages[pack]) {
                    total.packages[pack] = {
                        times: 0,
                        merges: []
                    };
                }
                total.packages[pack].times += 1;
                total.packages[pack].merges.push(merge);

                if (!total.history.packages[pack]) {
                    total.history.packages[pack] = {};
                }
                var date = new Date(Number(merge.timestamp) * 1000),
                    dateString = [
                        date.getFullYear(),
                        pad(date.getMonth() + 1),
                        pad(date.getDate())
                    ].join('-');
                if (!total.history.packages[pack][dateString]) {
                    total.history.packages[pack][dateString] = 0;
                }
                total.history.packages[pack][dateString] += 1;
            });
        }
    }

    function getTotal (graph, matrix) {
        total.graph = graph;
        total.matrix = {
            chord: matrix.toChordData(),
            force: matrix.toForceData()
        };

        return total;
    }

    return {
        onMerge: onMerge,
        total: getTotal
    };
};
