var Promise = require('es6-promise').Promise;

module.exports = function (config) {
    var git = require('./git')(config);
    var filesUtil = require('./files')(config);
    var series = require('./series');

    return function (dependencies, merges) {

        var total = {
            'Pull requests analyzed': 0,
            'Pull requests touching static': 0,
            merges: [],
            files: {},
            packages: {},
            graph: null
        };

        return new Promise(function (resolve, reject) {
            total['Pull requests merged'] = merges.length;

            series.iterate(merges, config.limit, function (merge, cb) {
                if (!merge.sha1) {
                    return cb();
                }

                git.historyOfMerge(merge.sha1)
                .then(function (files) {
                    total['Pull requests analyzed'] += 1;
                    merge.files = files;
                    merge.isStatic = filesUtil.isInteresting(files);
                    if (merge.isStatic) {
                        total['Pull requests touching static'] += 1;

                        var touchedPackages = {};
                        merge.files.forEach(function (file) {
                            if (filesUtil.isStaticFile(file)) {
                                if (!total.files[file]) {
                                    total.files[file] = {
                                        times: 0,
                                        merges: [],
                                        packages: dependencies[file] || []
                                    };
                                }
                                total.files[file].times += 1;
                                total.files[file].merges.push(merge);

                                if (dependencies[file]) {
                                    dependencies[file].forEach(function (pack) {
                                        touchedPackages[pack] = true;
                                    });
                                }
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
                        });
                    }
                    total.merges.push(merge);
                    cb();
                })
                .catch(function (error) {
                    reject(error);
                });
            }, function () {
                resolve(total);
            });
        });
    };
};
