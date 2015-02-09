var Promise = require('es6-promise').Promise;
var moment = require('moment');

module.exports = function (config) {
    var filesUtil = require('./files')(config);
    var thresholdDate = moment().day(-(config.costDays || 15));

    var total = {
        'Pull requests analyzed': 0,
        'Pull requests touching static': 0,
        'First Pull Request touching static': null,
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
        },
        size: {},
        config: config
    };

    function onMerge (dependencies, stat, graph, merge, files) {
        total['Pull requests analyzed'] += 1;

        merge.files = filesUtil.interestingOnly(files);
        if (merge.files.length) {
            total['Pull requests touching static'] += 1;
            // Because they are sorted from the most recent
            total['First Pull Request touching static'] = merge;

            var touchedPackages = {},
                mergeDate = moment(Number(merge.timestamp) * 1000),
                mergeDateString = mergeDate.format('YYYY-MM-DD');
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
                    } else {
                        Object.keys(graph).forEach(function (pack) {
                            if (graph[pack].path === file) {
                                touchedPackages[pack] = true;
                            }
                        });
                    }

                    if (!total.history.files[file]) {
                        total.history.files[file] = {};
                    }
                    if (!total.history.files[file][mergeDateString]) {
                        total.history.files[file][mergeDateString] = 0;
                    }
                    total.history.files[file][mergeDateString] += 1;
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
                if (isRecentEnough(mergeDate)) {
                    total.packages[pack].merges.push(merge);
                }

                if (!total.history.packages[pack]) {
                    total.history.packages[pack] = {};
                }
                if (!total.history.packages[pack][mergeDateString]) {
                    total.history.packages[pack][mergeDateString] = 0;
                }
                total.history.packages[pack][mergeDateString] += 1;
            });
        }
    }

    function getTotal (graph, matrix) {
        total.graph = graph;
        total.matrix = {
            chord: matrix.toChordData(),
            force: matrix.toForceData()
        };
        Object.keys(total.files).forEach(function (file) {
            total.size[file] = total.files[file].gzip;
        });

        return total;
    }

    function isRecentEnough (mergeDate) {
        return !mergeDate.isBefore(thresholdDate, 'day');
    }

    return {
        onMerge: onMerge,
        total: getTotal
    };
};
